import { promises as fs } from "node:fs";
import type {
  InferenceBackend,
  UpscaleJobInput,
  UpscaleOutput,
  Progress,
} from "./types";
import { scaleFor, engineLabelFor } from "./scale";
import { outputPathFor } from "@/lib/storage";

/**
 * Remote inference client. Active only when INFERENCE_URL points at a running
 * model server (Real-ESRGAN for the fast path, SeedVR2 for the high-quality
 * path). This is the exact seam a cloud deployment reuses — the caller cannot
 * tell whether the server is on localhost or in a datacenter.
 *
 * The server contract expected here:
 *   POST {INFERENCE_URL}/upscale  (multipart: file, scale, quality)
 *     -> streams NDJSON progress lines {stage,progress,detail}
 *        and a final line {done:true, width, height} followed by the image
 *        at GET {INFERENCE_URL}/result/{id}
 * A minimal server can implement just the final image and this client still
 * reports coarse progress.
 */
export function makeRemoteBackend(baseUrl: string): InferenceBackend {
  return {
    name: "remote-inference",
    async upscale(
      input: UpscaleJobInput,
      onProgress: (p: Progress) => void,
    ): Promise<UpscaleOutput> {
      const started = Date.now();
      const scale = scaleFor(input.quality);
      onProgress({ stage: "reading", progress: 0.05 });

      const buf = await fs.readFile(input.inputPath);
      const form = new FormData();
      form.set("file", new Blob([new Uint8Array(buf)]), input.originalName);
      form.set("scale", String(scale));
      form.set("quality", input.quality);
      form.set("kind", input.kind);

      onProgress({ stage: "reconstructing", progress: 0.35 });
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/upscale`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Inference server returned ${res.status}.`);

      const outExt = input.kind === "video" ? ".mp4" : ".png";
      const outPath = outputPathFor(input.jobId, outExt);
      const out = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(outPath, out);

      const w = Number(res.headers.get("x-output-width") ?? 0);
      const h = Number(res.headers.get("x-output-height") ?? 0);
      const sw = Number(res.headers.get("x-source-width") ?? 0);
      const sh = Number(res.headers.get("x-source-height") ?? 0);
      const source = { width: sw, height: sh };
      const target = { width: w || sw * scale, height: h || sh * scale };

      onProgress({ stage: "done", progress: 1, source, target });

      return {
        outputPath: outPath,
        source,
        target,
        scale,
        elapsedMs: Date.now() - started,
        engine: engineLabelFor(input.quality, "remote"),
      };
    },
  };
}
