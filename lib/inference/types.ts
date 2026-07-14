// Shared inference types. These describe the contract the frontend and the
// backend agree on. Nothing here references the fact that v1 runs locally —
// that is an implementation detail of the backend module, and the seam we
// preserve so a cloud backend can drop in later without frontend changes.

export type Quality = "fast" | "high";
export type MediaKind = "image" | "video";

export type JobStage =
  | "queued"
  | "reading"
  | "analyzing"
  | "reconstructing"
  | "encoding"
  | "done"
  | "error";

export interface Dimensions {
  width: number;
  height: number;
}

export interface UpscaleJobInput {
  jobId: string;
  inputPath: string;
  kind: MediaKind;
  quality: Quality;
  originalName: string;
}

export interface UpscaleOutput {
  outputPath: string;
  source: Dimensions;
  target: Dimensions;
  scale: number;
  /** milliseconds spent reconstructing */
  elapsedMs: number;
  /** which engine produced the result, for transparency in the UI/docs */
  engine: string;
}

export interface Progress {
  stage: JobStage;
  /** 0..1 */
  progress: number;
  /** optional human-readable detail, e.g. "frame 240 / 900" */
  detail?: string;
  source?: Dimensions;
  target?: Dimensions;
}

/**
 * The single interface every upscale runs through. v1 binds this to a local
 * backend (sharp for images, ffmpeg for video, or a Real-ESRGAN / SeedVR2
 * server on localhost when INFERENCE_URL is set). A cloud implementation
 * satisfies the same interface — nothing above this line changes.
 */
export interface InferenceBackend {
  readonly name: string;
  upscale(
    input: UpscaleJobInput,
    onProgress: (p: Progress) => void,
  ): Promise<UpscaleOutput>;
}
