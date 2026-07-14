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

/**
 * Local image backend. Reconstructs detail with a Lanczos resample followed by
 * a light unsharp + denoise pass — a deterministic stand-in for a Real-ESRGAN /
 * SeedVR2 model while inference runs on-device. Swapping in the model server is
 * a change to this file alone; the interface above it does not move.
 */
export const localImageBackend: InferenceBackend = {
  name: "local-image",
  async upscale(
    input: UpscaleJobInput,
    onProgress: (p: Progress) => void,
  ): Promise<UpscaleOutput> {
    const started = Date.now();
    onProgress({ stage: "reading", progress: 0.05 });

    const image = sharp(input.inputPath, { failOn: "none" });
    const meta = await image.metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    if (!srcW || !srcH) throw new Error("Could not read image dimensions.");

    const source = { width: srcW, height: srcH };
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

    const outPath = outputPathFor(input.jobId, ".png");

    let pipeline = image
      .resize(target.width, target.height, {
        kernel: sharp.kernel.lanczos3,
        fit: "fill",
      })
      .median(input.quality === "high" ? 3 : 1)
      .sharpen({
        sigma: input.quality === "high" ? 1.2 : 0.8,
        m1: 0.5,
        m2: 2.5,
      });

    // preserve alpha; flatten only if source had none
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
