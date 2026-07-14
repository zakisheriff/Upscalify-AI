import type {
  JobStage,
  Quality,
  MediaKind,
  Dimensions,
  Progress,
} from "./inference/types";

// In-memory job registry. v1 is a single local user with no queue and no
// persistence beyond the running process — appropriate for on-device use.
// A cloud phase replaces this with a real store; the shape below is the
// contract the API and frontend rely on.

export interface JobRecord {
  id: string;
  kind: MediaKind;
  quality: Quality;
  originalName: string;
  stage: JobStage;
  progress: number; // 0..1
  detail?: string;
  source?: Dimensions;
  target?: Dimensions;
  scale?: number;
  engine?: string;
  elapsedMs?: number;
  error?: string;
  createdAt: number;
  outputExt?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __upscalifyJobs: Map<string, JobRecord> | undefined;
}

const jobs: Map<string, JobRecord> = globalThis.__upscalifyJobs ?? new Map();
globalThis.__upscalifyJobs = jobs;

export function createJob(init: Pick<JobRecord, "id" | "kind" | "quality" | "originalName">): JobRecord {
  const rec: JobRecord = {
    ...init,
    stage: "queued",
    progress: 0,
    createdAt: Date.now(),
  };
  jobs.set(rec.id, rec);
  return rec;
}

export function getJob(id: string): JobRecord | undefined {
  return jobs.get(id);
}

export function applyProgress(id: string, p: Progress): void {
  const rec = jobs.get(id);
  if (!rec) return;
  rec.stage = p.stage;
  rec.progress = p.progress;
  if (p.detail) rec.detail = p.detail;
  if (p.source) rec.source = p.source;
  if (p.target) rec.target = p.target;
}

export function completeJob(
  id: string,
  data: Pick<JobRecord, "source" | "target" | "scale" | "engine" | "elapsedMs" | "outputExt">,
): void {
  const rec = jobs.get(id);
  if (!rec) return;
  Object.assign(rec, data, { stage: "done" as JobStage, progress: 1 });
}

export function failJob(id: string, message: string): void {
  const rec = jobs.get(id);
  if (!rec) return;
  rec.stage = "error";
  rec.error = message;
}
