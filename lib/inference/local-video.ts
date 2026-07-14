import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import type {
  InferenceBackend,
  UpscaleJobInput,
  UpscaleOutput,
  Progress,
  Dimensions,
} from "./types";
import { scaleFor, clampScaleForSource, engineLabelFor } from "./scale";
import { outputPathFor } from "@/lib/storage";
import { findSeedVR2, runSeedVR2 } from "./seedvr2";

interface Probe {
  width: number;
  height: number;
  durationSec: number;
  hasAudio: boolean;
}

function ffprobe(inputPath: string): Promise<Probe> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height:format=duration",
      "-of", "default=noprint_wrappers=1",
      inputPath,
    ];
    const p = spawn("ffprobe", args);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("close", () => {
      const w = Number(/width=(\d+)/.exec(out)?.[1] ?? 0);
      const h = Number(/height=(\d+)/.exec(out)?.[1] ?? 0);
      const dur = Number(/duration=([\d.]+)/.exec(out)?.[1] ?? 0);
      const a = spawn("ffprobe", [
        "-v", "error", "-select_streams", "a",
        "-show_entries", "stream=index", "-of", "csv=p=0", inputPath,
      ]);
      let aout = "";
      a.stdout.on("data", (d) => (aout += d));
      a.on("close", () => {
        if (!w || !h) return reject(new Error("Could not read video dimensions."));
        resolve({ width: w, height: h, durationSec: dur, hasAudio: aout.trim().length > 0 });
      });
      a.on("error", reject);
    });
  });
}

function probeDims(inputPath: string): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const p = spawn("ffprobe", [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height",
      "-of", "csv=s=x:p=0", inputPath,
    ]);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("close", () => {
      const [w, h] = out.trim().split("x").map(Number);
      if (!w || !h) return reject(new Error("Could not read output dimensions."));
      resolve({ width: w, height: h });
    });
  });
}

// Mux a video stream with an audio stream from a second file. Guarantees the
// reconstructed video keeps the original audio track.
function muxAudio(videoPath: string, audioSource: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", [
      "-y",
      "-i", videoPath,
      "-i", audioSource,
      "-map", "0:v:0",
      "-map", "1:a:0?",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      "-movflags", "+faststart",
      outPath,
    ]);
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString().slice(-1000)));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Audio mux failed. ${err.split("\n").slice(-2).join(" ")}`)),
    );
  });
}

/**
 * Local video backend.
 *
 * High-quality path → **SeedVR2** (`seedvr2.ts`) when it's installed and
 * configured: a real one-step diffusion-transformer video restorer with
 * temporal-consistency handling. The upscaled video is remuxed with the
 * original audio track. SeedVR2 needs a CUDA GPU, so it activates only when
 * SEEDVR2_DIR points at a working install.
 *
 * Fast path, and the fallback whenever SeedVR2 isn't available → a deterministic
 * ffmpeg filtergraph (Lanczos + unsharp) that is quick, temporally stable, and
 * keeps audio. It does not reconstruct like the model.
 */
export const localVideoBackend: InferenceBackend = {
  name: "local-video",
  async upscale(
    input: UpscaleJobInput,
    onProgress: (p: Progress) => void,
  ): Promise<UpscaleOutput> {
    const started = Date.now();
    onProgress({ stage: "reading", progress: 0.04 });

    const probe = await ffprobe(input.inputPath);
    const source: Dimensions = { width: probe.width, height: probe.height };
    onProgress({ stage: "analyzing", progress: 0.1, source });

    const outPath = outputPathFor(input.jobId, ".mp4");
    const seed = input.quality === "high" ? findSeedVR2() : null;

    // ---- SeedVR2 (high quality) ----
    if (seed) {
      const silent = outputPathFor(input.jobId, ".seed.mp4");
      const { model, resolution } = await runSeedVR2(
        seed,
        input.inputPath,
        silent,
        input.quality,
        (frac) => {
          onProgress({
            stage: "reconstructing",
            progress: 0.1 + frac * 0.82,
            source,
            detail: `${Math.round(frac * 100)}%`,
          });
        },
      );

      onProgress({ stage: "encoding", progress: 0.94, source });
      if (probe.hasAudio) {
        await muxAudio(silent, input.inputPath, outPath);
        await fs.rm(silent, { force: true });
      } else {
        await fs.rename(silent, outPath);
      }

      const target = await probeDims(outPath);
      onProgress({ stage: "done", progress: 1, source, target });
      return {
        outputPath: outPath,
        source,
        target,
        scale: Math.round((target.width / probe.width) * 100) / 100,
        elapsedMs: Date.now() - started,
        engine: `SeedVR2 · ${model} · ${resolution}p`,
      };
    }

    // ---- ffmpeg (fast, or fallback when SeedVR2 unavailable) ----
    const requested = scaleFor(input.quality);
    const scale = clampScaleForSource(requested, probe.width, probe.height, 8_294_400);
    const tw = Math.round((probe.width * scale) / 2) * 2;
    const th = Math.round((probe.height * scale) / 2) * 2;
    const target: Dimensions = { width: tw, height: th };
    const amount = input.quality === "high" ? 0.9 : 0.5;
    const vf = `scale=${tw}:${th}:flags=lanczos,unsharp=5:5:${amount}:5:5:0.0`;

    const args = [
      "-y",
      "-i", input.inputPath,
      "-vf", vf,
      "-c:v", "libx264",
      "-preset", input.quality === "high" ? "slow" : "veryfast",
      "-crf", input.quality === "high" ? "17" : "20",
      "-pix_fmt", "yuv420p",
      ...(probe.hasAudio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
      "-movflags", "+faststart",
      "-progress", "pipe:1",
      "-nostats",
      outPath,
    ];

    await new Promise<void>((resolve, reject) => {
      const p = spawn("ffmpeg", args);
      let stderr = "";
      p.stderr.on("data", (d) => (stderr += d.toString().slice(-2000)));
      p.stdout.on("data", (chunk: Buffer) => {
        const m = /out_time_ms=(\d+)/.exec(chunk.toString());
        if (m && probe.durationSec > 0) {
          const sec = Number(m[1]) / 1_000_000;
          const frac = Math.min(0.98, Math.max(0, sec / probe.durationSec));
          onProgress({
            stage: "reconstructing",
            progress: 0.1 + frac * 0.84,
            source,
            target,
            detail: `${Math.floor(sec)}s / ${Math.floor(probe.durationSec)}s`,
          });
        }
      });
      p.on("error", reject);
      p.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`Reconstruction failed. ${stderr.split("\n").slice(-3).join(" ")}`)),
      );
    });

    onProgress({ stage: "done", progress: 1, source, target });
    return {
      outputPath: outPath,
      source,
      target,
      scale,
      elapsedMs: Date.now() - started,
      engine: engineLabelFor(input.quality, "local"),
    };
  },
};
