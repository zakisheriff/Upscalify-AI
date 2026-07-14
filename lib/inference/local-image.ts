import sharp from "sharp";
import path from "node:path";
import type {
  InferenceBackend,
  UpscaleJobInput,
  UpscaleOutput,
  Progress,
} from "./types";
import { scaleFor, clampScaleForSource, engineLabelFor } from "./scale";
import { outputPathFor } from "@/lib/storage";
import { findEngine, runRealesrgan } from "./realesrgan";

/**
 * Local image backend.
 *
 * Preferred path: a real Real-ESRGAN model (the same NCNN engine + weights
 * Upscayl uses). It denoises and reconstructs detail — the reason a noisy
 * source comes back clean instead of grainy.
 *
 * Fallback path (only if no engine is installed): a sharp Lanczos resample with
 * denoise + unsharp. Keeps the product working with zero setup, but it cannot
 * reconstruct like the model — it will look softer/grainier on rough sources.
 *
 * Either way the interface above this file is identical; swapping to a hosted
 * model server is still just a backend change.
 */
export const localImageBackend: InferenceBackend = {
  name: "local-image",
  async upscale(
    input: UpscaleJobInput,
    onProgress: (p: Progress) => void,
  ): Promise<UpscaleOutput> {
    const started = Date.now();
    onProgress({ stage: "reading", progress: 0.05 });

    const meta = await sharp(input.inputPath, { failOn: "none" }).metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    if (!srcW || !srcH) throw new Error("Could not read image dimensions.");
    const source = { width: srcW, height: srcH };

    const engine = findEngine();
    const outPath = outputPathFor(input.jobId, ".png");

    if (engine) {
      // --- Real-ESRGAN path ---
      onProgress({ stage: "analyzing", progress: 0.12, source });
      const { scale, model } = await runRealesrgan(
        engine,
        input.inputPath,
        outPath,
        input.quality,
        (frac) => {
          onProgress({
            stage: "reconstructing",
            progress: 0.15 + frac * 0.8,
            source,
            detail: `${Math.round(frac * 100)}%`,
          });
        },
      );
      const outMeta = await sharp(outPath).metadata();
      const target = { width: outMeta.width ?? srcW * scale, height: outMeta.height ?? srcH * scale };
      onProgress({ stage: "done", progress: 1, source, target });
      return {
        outputPath: outPath,
        source,
        target,
        scale,
        elapsedMs: Date.now() - started,
        engine: `Real-ESRGAN · ${model.replace(/-/g, " ")}`,
      };
    }

    // --- sharp fallback (no engine installed) ---
    onProgress({ stage: "analyzing", progress: 0.2, source });
    const requested = scaleFor(input.quality);
    const scale = clampScaleForSource(requested, srcW, srcH);
    const target = { width: srcW * scale, height: srcH * scale };
    onProgress({
      stage: "reconstructing",
      progress: 0.4,
      source,
      target,
      detail: `${srcW}×${srcH} to ${target.width}×${target.height}`,
    });

    let pipeline = sharp(input.inputPath, { failOn: "none" })
      .resize(target.width, target.height, { kernel: sharp.kernel.lanczos3, fit: "fill" })
      .median(input.quality === "high" ? 3 : 1)
      .sharpen({ sigma: input.quality === "high" ? 1.2 : 0.8, m1: 0.5, m2: 2.5 });
    if (!meta.hasAlpha) pipeline = pipeline.flatten({ background: "#000000" });

    onProgress({ stage: "encoding", progress: 0.85, source, target });
    await pipeline.png({ compressionLevel: 6 }).toFile(outPath);
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

export function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase();
}
