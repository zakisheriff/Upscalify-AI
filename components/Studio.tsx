"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { upscale, UpscaleError } from "@/lib/upscale";
import type { UpscaleProgress, UpscaleResult } from "@/lib/upscale";
import type { Quality, JobStage } from "@/lib/inference/types";
import { ACCEPTED, kindFromName } from "@/lib/media";
import { CompareView } from "./CompareView";

type Phase = "idle" | "chosen" | "working" | "done" | "error";

const STAGE_COPY: Record<JobStage, string> = {
  queued: "Preparing",
  reading: "Reading the file",
  analyzing: "Measuring detail",
  reconstructing: "Reconstructing",
  encoding: "Finishing",
  done: "Done",
  error: "Stopped",
};

// Framer Motion owns mount/unmount of studio panels. GSAP is not used here, so
// the two libraries never touch the same element — no transform conflict.
const panel = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

export function Studio() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("fast");
  const [progress, setProgress] = useState<UpscaleProgress | null>(null);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const kind = file ? kindFromName(file.name) : null;

  const chooseFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!kindFromName(f.name) && !f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setError("That file type isn't supported. Choose an image or a video.");
      setPhase("error");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
    setPhase("chosen");
  }, []);

  async function run() {
    if (!file) return;
    setPhase("working");
    setProgress({ stage: "queued", progress: 0 });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await upscale(file, {
        quality,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setResult(res);
      setPhase("done");
    } catch (err) {
      if (controller.signal.aborted) {
        reset();
        return;
      }
      setError(err instanceof UpscaleError ? err.message : "Something went wrong while reconstructing.");
      setPhase("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  function reset() {
    setPhase("idle");
    setFile(null);
    setResult(null);
    setProgress(null);
    setError("");
  }

  const pct = progress ? Math.round(progress.progress * 100) : 0;

  return (
    <div className="studio" id="tool">
      <AnimatePresence mode="wait">
        {/* ---------- pick a file ---------- */}
        {(phase === "idle" || phase === "chosen") && (
          <motion.div key="pick" {...panel} className="studio__stage">
            <label
              className={`dropzone${dragOver ? " dropzone--over" : ""}${file ? " dropzone--filled" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                chooseFile(e.dataTransfer.files?.[0] ?? null);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
                hidden
              />
              {file ? (
                <div className="dropzone__file">
                  <p className="dropzone__name">{file.name}</p>
                  <p className="mono muted">
                    {kind === "video" ? "video" : "image"} · {formatBytes(file.size)}
                  </p>
                  <button
                    type="button"
                    className="dropzone__change"
                    onClick={(e) => {
                      e.preventDefault();
                      inputRef.current?.click();
                    }}
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div className="dropzone__prompt">
                  <p className="dropzone__lead">Drop an image or video here, or click to choose one.</p>
                  <p className="mono muted">Images up to 30 MB · video up to 500 MB · processed on your machine</p>
                </div>
              )}
            </label>

            <fieldset className="quality">
              <legend className="quality__legend">How much reconstruction?</legend>
              <div className="quality__options">
                <QualityOption
                  id="fast"
                  active={quality === "fast"}
                  onSelect={() => setQuality("fast")}
                  title="Fast"
                  body="Roughly doubles resolution and returns quickly. Good for a quick lift on photos and clips."
                  meta="≈ 2× · seconds"
                />
                <QualityOption
                  id="high"
                  active={quality === "high"}
                  onSelect={() => setQuality("high")}
                  title="High quality"
                  body="Reconstructs more detail at a higher scale. Slower, and worth it when the source is rough."
                  meta="≈ 4× · slower"
                />
              </div>
            </fieldset>

            <div className="studio__actions">
              <button className="btn btn--primary" disabled={!file} onClick={run}>
                Reconstruct
              </button>
              {file && (
                <button className="btn btn--ghost" onClick={reset}>
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------- working ---------- */}
        {phase === "working" && (
          <motion.div key="work" {...panel} className="studio__stage studio__stage--working">
            <div className="work">
              <div className="work__head">
                <span className="mono work__stage">{progress ? STAGE_COPY[progress.stage] : "Preparing"}</span>
                <span className="mono work__pct">{pct}%</span>
              </div>
              <div
                className="work__track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="work__fill" style={{ width: `${Math.max(4, pct)}%` }} />
              </div>
              <div className="work__meta mono muted">
                {progress?.source && progress?.target ? (
                  <span>
                    {progress.source.width}×{progress.source.height} to {progress.target.width}×
                    {progress.target.height}
                  </span>
                ) : (
                  <span>measuring…</span>
                )}
                {progress?.detail && <span>{progress.detail}</span>}
              </div>
              <p className="muted work__note">
                {kind === "video"
                  ? "Video is reconstructed frame by frame and reassembled with its original audio. Larger clips take longer."
                  : "Reconstructing detail in a single pass."}
              </p>
              <button className="btn btn--ghost" onClick={cancel}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------- done ---------- */}
        {phase === "done" && result && (
          <motion.div key="done" {...panel} className="studio__stage">
            <CompareView kind={result.kind} beforeUrl={result.sourceUrl} afterUrl={result.resultUrl} />
            <div className="result">
              <dl className="result__figures mono">
                <div>
                  <dt>Original</dt>
                  <dd>{result.source.width}×{result.source.height}</dd>
                </div>
                <div>
                  <dt>Reconstructed</dt>
                  <dd>{result.target.width}×{result.target.height}</dd>
                </div>
                <div>
                  <dt>Scale</dt>
                  <dd>{result.scale}×</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{(result.elapsedMs / 1000).toFixed(1)}s</dd>
                </div>
              </dl>
              <div className="studio__actions">
                <a className="btn btn--primary" href={`/api/result/${result.jobId}?download=1`}>
                  Download result
                </a>
                <button className="btn btn--ghost" onClick={reset}>
                  Upscale another
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------- error ---------- */}
        {phase === "error" && (
          <motion.div key="error" {...panel} className="studio__stage">
            <div className="notice">
              <p className="notice__title">Reconstruction stopped</p>
              <p className="muted">{error}</p>
              <button className="btn btn--ghost" onClick={reset}>
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QualityOption(props: {
  id: string;
  active: boolean;
  onSelect: () => void;
  title: string;
  body: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      className={`qopt${props.active ? " qopt--active" : ""}`}
      aria-pressed={props.active}
      onClick={props.onSelect}
    >
      <span className="qopt__top">
        <span className="qopt__title">{props.title}</span>
        <span className="mono qopt__meta">{props.meta}</span>
      </span>
      <span className="qopt__body">{props.body}</span>
    </button>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
