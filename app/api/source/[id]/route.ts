import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { findInputPath } from "@/lib/storage";
import { serveFile } from "@/lib/serve";

export const runtime = "nodejs";

// Serves the original upload back to the client for the before/after view.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "Unknown job." }, { status: 404 });
  const input = await findInputPath(id);
  if (!input) return NextResponse.json({ error: "Original not found." }, { status: 404 });
  return serveFile(input);
}
