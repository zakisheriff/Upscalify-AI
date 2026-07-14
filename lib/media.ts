import type { MediaKind } from "./inference/types";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".bmp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"]);

export const ACCEPTED = [...IMAGE_EXT, ...VIDEO_EXT];
export const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

export function kindFromName(name: string): MediaKind | null {
  const ext = "." + (name.split(".").pop() ?? "").toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

export function kindFromType(type: string): MediaKind | null {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return null;
}
