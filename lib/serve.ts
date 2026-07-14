import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
};

export async function serveFile(
  filePath: string,
  opts: { downloadAs?: string } = {},
): Promise<NextResponse> {
  let data: Buffer;
  try {
    data = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "That file isn't ready yet." }, { status: 404 });
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = TYPES[ext] ?? "application/octet-stream";
  const headers: Record<string, string> = {
    "content-type": type,
    "content-length": String(data.length),
    "cache-control": "private, max-age=3600",
  };
  if (opts.downloadAs) {
    headers["content-disposition"] = `attachment; filename="${opts.downloadAs}"`;
  }
  return new NextResponse(new Uint8Array(data), { headers });
}
