import type { Quality } from "./types";

/**
 * Quality is exposed to the user by outcome ("fast" / "high quality"), never by
 * model name. Here is where that outcome maps to concrete parameters. The two
 * paths correspond to the fast engine (Real-ESRGAN-class) and the higher-quality
 * engine (SeedVR2-class) in a full inference deployment; the local fallback
 * approximates the same scale factors.
 */
export function scaleFor(quality: Quality): number {
  return quality === "high" ? 4 : 2;
}

export function engineLabelFor(quality: Quality, kind: "local" | "remote"): string {
  if (kind === "remote") {
    return quality === "high" ? "high-quality engine" : "fast engine";
  }
  return quality === "high" ? "local high-quality (4×)" : "local fast (2×)";
}

/** Guard against absurd output sizes on the local fallback path. */
export function clampScaleForSource(
  scale: number,
  width: number,
  height: number,
  maxPixels = 40_000_000,
): number {
  let s = scale;
  while (s > 1 && width * s * height * s > maxPixels) {
    s -= 1;
  }
  return Math.max(1, s);
}
