import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { Quality } from "./types";

// ---------------------------------------------------------------------------
// Real-ESRGAN (NCNN / Vulkan) — the actual super-resolution engine. This is the
// same binary and models Upscayl ships, so output quality matches it: the model
// denoises and reconstructs rather than sharpening noise. We reuse an existing
// install when present (no redistribution), and fall back to sharp only if no
// engine is found.
// ---------------------------------------------------------------------------

const BIN_CANDIDATES = [
  process.env.REALESRGAN_BIN,
  "/Applications/Upscayl.app/Contents/Resources/bin/upscayl-bin",
  "/usr/local/bin/realesrgan-ncnn-vulkan",
  "/opt/homebrew/bin/realesrgan-ncnn-vulkan",
].filter(Boolean) as string[];

const MODELS_CANDIDATES = [
  process.env.REALESRGAN_MODELS,
  "/Applications/Upscayl.app/Contents/Resources/models",
].filter(Boolean) as string[];

export interface Engine {
  bin: string;
  models: string;
}

export function findEngine(): Engine | null {
  const bin = BIN_CANDIDATES.find((p) => existsSync(p));
  const models = MODELS_CANDIDATES.find((p) => existsSync(p));
  if (bin && models) return { bin, models };
  return null;
}

// Quality maps to a model + output scale. Both models denoise; the standard
// model reconstructs more at a higher scale, the lite model is quicker.
function modelFor(quality: Quality): { name: string; scale: number } {
  return quality === "high"
    ? { name: "upscayl-standard-4x", scale: 4 }
    : { name: "upscayl-lite-4x", scale: 2 };
}

/**
 * Run Real-ESRGAN on a single image. Reports real progress parsed from the
 * engine's percentage output. Resolves when the output file is written.
 */
export function runRealesrgan(
  engine: Engine,
  input: string,
  output: string,
  quality: Quality,
  onPercent: (fraction: number) => void,
): Promise<{ scale: number; model: string }> {
  const { name, scale } = modelFor(quality);
  const args = [
    "-i", input,
    "-o", output,
    "-n", name,
    "-m", engine.models,
    "-s", String(scale),
    "-f", "png",
  ];

  return new Promise((resolve, reject) => {
    const p = spawn(engine.bin, args);
    let tail = "";
    const onData = (buf: Buffer) => {
      const text = buf.toString();
      tail = (tail + text).slice(-2000);
      // engine prints bare percentages like "12.50" / "100.00"
      for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*$/gm)) {
        const v = Number(m[1]);
        if (v >= 0 && v <= 100) onPercent(v / 100);
      }
    };
    p.stdout.on("data", onData);
    p.stderr.on("data", onData);
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0 && existsSync(output)) resolve({ scale, model: name });
      else reject(new Error(`Real-ESRGAN exited (${code}). ${tail.split("\n").slice(-2).join(" ")}`));
    });
  });
}
