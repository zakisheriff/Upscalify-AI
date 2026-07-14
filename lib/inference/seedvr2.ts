import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Quality } from "./types";

// ---------------------------------------------------------------------------
// SeedVR2 — the high-quality video path (ByteDance's one-step diffusion
// transformer video restorer). We drive the standalone inference CLI from
// numz/ComfyUI-SeedVR2_VideoUpscaler, which takes a video in and writes an
// upscaled video out with real temporal-consistency handling (batched frames,
// 4n+1). This is the same seam pattern as Real-ESRGAN: the app shells out to a
// real local inference process.
//
// SeedVR2 needs a CUDA GPU + a Python environment with the model downloaded. It
// is located via env so the app stays hardware-agnostic:
//   SEEDVR2_DIR      repo root containing inference_cli.py  (required to enable)
//   SEEDVR2_PYTHON   python executable / venv python        (default: python)
//   SEEDVR2_MODEL    DiT model id      (default: seedvr2_ema_3b_fp8_e4m3fn)
//   SEEDVR2_MODEL_DIR  models dir       (optional; passes --model_dir)
//   SEEDVR2_RESOLUTION target short side (default: 1080)
//   SEEDVR2_BATCH_SIZE frames per batch, 4n+1 (default: 5)
//   SEEDVR2_CUDA_DEVICE cuda device(s)  (optional; e.g. "0" or "0,1")
//   SEEDVR2_SEED       seed             (default: 42)
// When SEEDVR2_DIR is unset or the CLI is missing, the caller falls back to the
// ffmpeg scaler. See inference/seedvr2/README.md for setup.
// ---------------------------------------------------------------------------

export interface SeedVR2Config {
  python: string;
  cli: string;
  model: string;
  modelDir?: string;
  resolution: number;
  batchSize: number;
  cudaDevice?: string;
  seed: number;
}

export function findSeedVR2(): SeedVR2Config | null {
  const dir = process.env.SEEDVR2_DIR?.trim();
  if (!dir) return null;
  const cli = path.join(dir, "inference_cli.py");
  if (!existsSync(cli)) return null;
  return {
    python: process.env.SEEDVR2_PYTHON?.trim() || "python",
    cli,
    model: process.env.SEEDVR2_MODEL?.trim() || "seedvr2_ema_3b_fp8_e4m3fn",
    modelDir: process.env.SEEDVR2_MODEL_DIR?.trim() || undefined,
    resolution: Number(process.env.SEEDVR2_RESOLUTION) || 1080,
    batchSize: normalizeBatch(Number(process.env.SEEDVR2_BATCH_SIZE) || 5),
    cudaDevice: process.env.SEEDVR2_CUDA_DEVICE?.trim() || undefined,
    seed: Number(process.env.SEEDVR2_SEED) || 42,
  };
}

// batch_size must follow 4n+1 (1, 5, 9, 13, ...) for temporal consistency.
function normalizeBatch(n: number): number {
  if (n < 1) return 1;
  return Math.round((n - 1) / 4) * 4 + 1;
}

/**
 * Run SeedVR2 on a video. Writes the upscaled (silent) video to `output`.
 * Reports real progress parsed from the CLI's tqdm output. Audio is muxed back
 * by the caller.
 */
export function runSeedVR2(
  cfg: SeedVR2Config,
  input: string,
  output: string,
  _quality: Quality,
  onPercent: (fraction: number) => void,
): Promise<{ model: string; resolution: number }> {
  const args = [
    cfg.cli,
    input,
    "--output", output,
    "--output_format", "mp4",
    "--video_backend", "ffmpeg",
    "--dit_model", cfg.model,
    "--resolution", String(cfg.resolution),
    "--batch_size", String(cfg.batchSize),
    "--seed", String(cfg.seed),
  ];
  if (cfg.modelDir) args.push("--model_dir", cfg.modelDir);
  if (cfg.cudaDevice) args.push("--cuda_device", cfg.cudaDevice);

  return new Promise((resolve, reject) => {
    const p = spawn(cfg.python, args, {
      cwd: path.dirname(cfg.cli),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });
    let tail = "";
    const onData = (buf: Buffer) => {
      const text = buf.toString();
      tail = (tail + text).slice(-4000);
      // tqdm renders lines like "  45%|████     | 9/20 ..."
      let last = -1;
      for (const m of text.matchAll(/(\d{1,3})%\|/g)) last = Number(m[1]);
      if (last >= 0 && last <= 100) onPercent(last / 100);
    };
    p.stdout.on("data", onData);
    p.stderr.on("data", onData);
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0 && existsSync(output)) resolve({ model: cfg.model, resolution: cfg.resolution });
      else reject(new Error(`SeedVR2 exited (${code}). ${tail.split("\n").slice(-3).join(" ").slice(0, 400)}`));
    });
  });
}
