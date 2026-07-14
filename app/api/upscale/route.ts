import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeInput } from "@/lib/storage";
import { createJob, applyProgress, completeJob, failJob } from "@/lib/jobs";
import { getBackend } from "@/lib/inference/backend";
import {
  kindFromName,
  kindFromType,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/media";
import type { Quality } from "@/lib/inference/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");
  const quality = (form.get("quality") as Quality) === "high" ? "high" : "fast";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was included." }, { status: 400 });
  }

  const kind = kindFromType(file.type) ?? kindFromName(file.name);
  if (!kind) {
    return NextResponse.json(
      { error: "That file type isn't supported. Upload an image or a video." },
      { status: 415 },
    );
  }

  const limit = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    return NextResponse.json(
      { error: `That ${kind} is larger than the ${mb} MB limit for local processing.` },
      { status: 413 },
    );
  }

  const jobId = randomUUID();
  const buf = Buffer.from(await file.arrayBuffer());
  const inputPath = await writeInput(jobId, file.name, buf);

  createJob({ id: jobId, kind, quality, originalName: file.name });

  // Fire and forget — progress is tracked in the job record and polled by the
  // client through /api/jobs/:id. Real status, not a synthetic timer.
  const backend = getBackend(kind);
  void backend
    .upscale(
      { jobId, inputPath, kind, quality, originalName: file.name },
      (p) => applyProgress(jobId, p),
    )
    .then((out) => {
      completeJob(jobId, {
        source: out.source,
        target: out.target,
        scale: out.scale,
        engine: out.engine,
        elapsedMs: out.elapsedMs,
        outputExt: path.extname(out.outputPath),
      });
    })
    .catch((err: unknown) => {
      failJob(jobId, err instanceof Error ? err.message : "Reconstruction failed.");
    });

  return NextResponse.json({ jobId, kind });
}
