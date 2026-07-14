"use strict";

// Desktop video upscaling — the same deterministic ffmpeg path the web app uses
// as its non-CUDA route: a Lanczos scale + unsharp pass that is quick, temporally
// stable, and preserves the original audio. No AI model, no extra weights; it only
// needs ffmpeg/ffprobe, located from the usual install locations or the PATH.

const fs = require("node:fs");
const { spawn } = require("node:child_process");

const VIDEO_EXTS = ["mp4", "mov", "m4v", "webm", "mkv", "avi"];
const MAX_PIXELS = 8_294_400; // ~4K, matches the web app's clamp

function isVideoPath(p) {
  const ext = (p.split(".").pop() || "").toLowerCase();
  return VIDEO_EXTS.includes(ext);
}

// Find ffmpeg/ffprobe: common install dirs first (GUI apps don't inherit the
// shell PATH), then fall back to the bare name so an inherited PATH still works.
function locate(name) {
  const cands = [`/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`, `/usr/bin/${name}`];
  for (const c of cands) if (fs.existsSync(c)) return c;
  return name;
}
function hasFfmpeg() {
  return ["ffmpeg", "ffprobe"].every((n) => {
    const c = locate(n);
    return c.startsWith("/") ? fs.existsSync(c) : true;
  });
}

function ffprobe(inputPath) {
  const bin = locate("ffprobe");
  return new Promise((resolve, reject) => {
    const p = spawn(bin, [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height:format=duration",
      "-of", "default=noprint_wrappers=1",
      inputPath,
    ]);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("close", () => {
      const w = Number(/width=(\d+)/.exec(out)?.[1] ?? 0);
      const h = Number(/height=(\d+)/.exec(out)?.[1] ?? 0);
      const dur = Number(/duration=([\d.]+)/.exec(out)?.[1] ?? 0);
      const a = spawn(bin, [
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

function clampScale(requested, w, h) {
  const maxS = Math.sqrt(MAX_PIXELS / (w * h));
  return Math.max(1, Math.min(requested, maxS));
}

// Upscale a video and write an .mp4 to outPath. onProgress({ fraction, detail }).
async function run(inputPath, outPath, quality, onProgress) {
  const started = Date.now();
  const probe = await ffprobe(inputPath);

  const requested = quality === "high" ? 4 : 2;
  const scale = clampScale(requested, probe.width, probe.height);
  const tw = Math.round((probe.width * scale) / 2) * 2;
  const th = Math.round((probe.height * scale) / 2) * 2;
  const amount = quality === "high" ? 0.9 : 0.5;
  const vf = `scale=${tw}:${th}:flags=lanczos,unsharp=5:5:${amount}:5:5:0.0`;

  const args = [
    "-y",
    "-i", inputPath,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", quality === "high" ? "slow" : "veryfast",
    "-crf", quality === "high" ? "17" : "20",
    "-pix_fmt", "yuv420p",
    ...(probe.hasAudio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
    "-movflags", "+faststart",
    "-progress", "pipe:1",
    "-nostats",
    outPath,
  ];

  await new Promise((resolve, reject) => {
    const p = spawn(locate("ffmpeg"), args);
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString().slice(-2000)));
    p.stdout.on("data", (chunk) => {
      const m = /out_time_ms=(\d+)/.exec(chunk.toString());
      if (m && probe.durationSec > 0) {
        const sec = Number(m[1]) / 1_000_000;
        const frac = Math.min(0.98, Math.max(0, sec / probe.durationSec));
        onProgress?.({
          fraction: frac,
          detail: `${Math.floor(sec)}s / ${Math.floor(probe.durationSec)}s`,
        });
      }
    });
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Reconstruction failed. ${stderr.split("\n").slice(-3).join(" ")}`)),
    );
  });

  return {
    scale: Math.round(scale * 100) / 100,
    model: quality === "high" ? "ffmpeg · high" : "ffmpeg · fast",
    elapsedMs: Date.now() - started,
    target: { width: tw, height: th },
  };
}

module.exports = { isVideoPath, hasFfmpeg, run, VIDEO_EXTS };
