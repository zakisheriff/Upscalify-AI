import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Unknown job." }, { status: 404 });
  }

  const base = job.originalName.replace(/\.[^.]+$/, "");
  const filename =
    job.stage === "done"
      ? `${base}-upscaled${job.outputExt ?? ""}`
      : undefined;

  return NextResponse.json(
    {
      stage: job.stage,
      progress: job.progress,
      detail: job.detail,
      source: job.source,
      target: job.target,
      scale: job.scale,
      engine: job.engine,
      elapsedMs: job.elapsedMs,
      filename,
      error: job.error,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
