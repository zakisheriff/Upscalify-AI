import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { outputPathFor } from "@/lib/storage";
import { serveFile } from "@/lib/serve";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job || job.stage !== "done" || !job.outputExt) {
    return NextResponse.json({ error: "Result isn't ready." }, { status: 404 });
  }
  const wantsDownload = req.nextUrl.searchParams.has("download");
  const base = job.originalName.replace(/\.[^.]+$/, "");
  return serveFile(outputPathFor(id, job.outputExt), {
    downloadAs: wantsDownload ? `${base}-upscaled${job.outputExt}` : undefined,
  });
}
