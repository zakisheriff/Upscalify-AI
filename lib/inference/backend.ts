import type { InferenceBackend, MediaKind } from "./types";
import { localImageBackend } from "./local-image";
import { localVideoBackend } from "./local-video";
import { makeRemoteBackend } from "./remote-image";

/**
 * Backend selection — the one place that knows where inference actually runs.
 *
 * v1: on-device. If INFERENCE_URL is set (a Real-ESRGAN / SeedVR2 server on
 * localhost), calls route to it. Otherwise a deterministic local fallback runs
 * (sharp for images, ffmpeg for video) so the product works with nothing else
 * installed. Cloud deployment of the inference layer is a later phase: it slots
 * in here by pointing INFERENCE_URL at a remote host — no code above this file
 * changes.
 */
export function getBackend(kind: MediaKind): InferenceBackend {
  const url = process.env.INFERENCE_URL?.trim();
  if (url) return makeRemoteBackend(url);
  return kind === "video" ? localVideoBackend : localImageBackend;
}
