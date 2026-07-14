import type { JobStage, Quality, MediaKind, Dimensions } from "./inference/types";

// ---------------------------------------------------------------------------
// The single seam the frontend uses. Call upscale(file, options) and receive a
// Result. Nothing here — and nothing that imports this — knows or cares that v1
// posts to a Next.js API route that runs inference on-device. Moving inference
// to the cloud is an implementation change behind this function; callers do not
// change.
// ---------------------------------------------------------------------------

export interface UpscaleOptions {
  quality: Quality;
  onProgress?: (p: UpscaleProgress) => void;
  signal?: AbortSignal;
}

export interface UpscaleProgress {
  stage: JobStage;
  progress: number; // 0..1
  detail?: string;
  source?: Dimensions;
  target?: Dimensions;
}

export interface UpscaleResult {
  jobId: string;
  kind: MediaKind;
  source: Dimensions;
  target: Dimensions;
  scale: number;
  engine: string;
  elapsedMs: number;
  /** URL to the reconstructed result (display + download) */
  resultUrl: string;
  /** URL to the original, for the before/after comparison */
  sourceUrl: string;
  /** suggested download filename */
  filename: string;
}

export class UpscaleError extends Error {}

export async function upscale(
  file: File,
  options: UpscaleOptions,
): Promise<UpscaleResult> {
  const { quality, onProgress, signal } = options;

  const form = new FormData();
  form.set("file", file);
  form.set("quality", quality);

  const start = await fetch("/api/upscale", {
    method: "POST",
    body: form,
    signal,
  });
  if (!start.ok) {
    const msg = await safeError(start);
    throw new UpscaleError(msg);
  }
  const { jobId, kind } = (await start.json()) as { jobId: string; kind: MediaKind };

  // Poll job status until done or error. Progress reported here is the real
  // job status from the inference call, not a synthetic timer.
  const pollMs = kind === "video" ? 700 : 350;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) throw new UpscaleError("Cancelled.");
    await delay(pollMs, signal);

    const res = await fetch(`/api/jobs/${jobId}`, { signal });
    if (!res.ok) throw new UpscaleError(await safeError(res));
    const job = (await res.json()) as JobStatusResponse;

    onProgress?.({
      stage: job.stage,
      progress: job.progress,
      detail: job.detail,
      source: job.source,
      target: job.target,
    });

    if (job.stage === "error") throw new UpscaleError(job.error ?? "Reconstruction failed.");
    if (job.stage === "done") {
      const base = window.location.origin;
      return {
        jobId,
        kind,
        source: job.source ?? { width: 0, height: 0 },
        target: job.target ?? { width: 0, height: 0 },
        scale: job.scale ?? 1,
        engine: job.engine ?? "",
        elapsedMs: job.elapsedMs ?? 0,
        resultUrl: `${base}/api/result/${jobId}`,
        sourceUrl: `${base}/api/source/${jobId}`,
        filename: job.filename ?? `upscalify-${jobId}`,
      };
    }
  }
}

interface JobStatusResponse {
  stage: JobStage;
  progress: number;
  detail?: string;
  source?: Dimensions;
  target?: Dimensions;
  scale?: number;
  engine?: string;
  elapsedMs?: number;
  filename?: string;
  error?: string;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new UpscaleError("Cancelled."));
      },
      { once: true },
    );
  });
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}
