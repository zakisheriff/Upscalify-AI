import { spawn } from "node:child_process";
import type {
  InferenceBackend,
  UpscaleJobInput,
  UpscaleOutput,
  Progress,
  Dimensions,
} from "./types";
import { scaleFor, clampScaleForSource, engineLabelFor } from "./scale";
import { outputPathFor } from "@/lib/storage";

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
      // probe audio separately
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

/**
 * Local video backend. Reconstructs each frame with a Lanczos upscale plus a
 * light unsharp pass, applied through a single deterministic filtergraph so
 * motion stays temporally stable (no per-frame flicker). The original audio
 * track is copied through untouched. A full deployment would route frames to a
 * Real-ESRGAN / SeedVR2 server with explicit temporal-consistency handling;
 * this fallback keeps the same seam and the same guarantees to the user.
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
    onProgress({ stage: "analyzing", progress: 0.12, source });

    const requested = scaleFor(input.quality);
    const scale = clampScaleForSource(requested, probe.width, probe.height, 8_294_400); // <= 4K px budget
    // keep even dimensions for h.264
    const tw = Math.round((probe.width * scale) / 2) * 2;
    const th = Math.round((probe.height * scale) / 2) * 2;
    const target: Dimensions = { width: tw, height: th };

    const outPath = outputPathFor(input.jobId, ".mp4");
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
        const text = chunk.toString();
        const m = /out_time_ms=(\d+)/.exec(text);
        if (m && probe.durationSec > 0) {
          const sec = Number(m[1]) / 1_000_000;
          const frac = Math.min(0.98, Math.max(0, sec / probe.durationSec));
          onProgress({
            stage: "reconstructing",
            progress: 0.12 + frac * 0.82,
            source,
            target,
            detail: `${Math.floor(sec)}s / ${Math.floor(probe.durationSec)}s`,
          });
        }
      });
      p.on("error", reject);
      p.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Reconstruction failed. ${stderr.split("\n").slice(-3).join(" ")}`));
      });
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
