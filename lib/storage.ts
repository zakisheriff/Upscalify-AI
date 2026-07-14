import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

// Filesystem storage only in v1 — single local user, no cloud object store.
// Lives outside the repo tree under the OS temp dir so results are never
// committed and are cheap to clear.
const ROOT = path.join(os.tmpdir(), "upscalify-data");

export function jobDir(jobId: string): string {
  return path.join(ROOT, jobId);
}

export async function ensureJobDir(jobId: string): Promise<string> {
  const dir = jobDir(jobId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeInput(
  jobId: string,
  filename: string,
  data: Buffer,
): Promise<string> {
  const dir = await ensureJobDir(jobId);
  const ext = path.extname(filename) || ".bin";
  const p = path.join(dir, `input${ext}`);
  await fs.writeFile(p, data);
  return p;
}

export function outputPathFor(jobId: string, ext: string): string {
  return path.join(jobDir(jobId), `output${ext}`);
}

export async function findInputPath(jobId: string): Promise<string | null> {
  const dir = jobDir(jobId);
  try {
    const entries = await fs.readdir(dir);
    const input = entries.find((e) => e.startsWith("input"));
    return input ? path.join(dir, input) : null;
  } catch {
    return null;
  }
}

export async function readFileSafe(p: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(p);
  } catch {
    return null;
  }
}
