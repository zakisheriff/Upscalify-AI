"use client";

import { useCallback, useRef, useState } from "react";
import { upscale, UpscaleError } from "@/lib/upscale";
import type { UpscaleProgress, UpscaleResult } from "@/lib/upscale";
import type { Quality, JobStage } from "@/lib/inference/types";
import { ACCEPTED, kindFromName } from "@/lib/media";
import { CompareView } from "./CompareView";

type Phase = "idle" | "working" | "done" | "error";

const STAGE_COPY: Record<JobStage, string> = {
  queued: "Preparing",
  reading: "Reading the file",
  analyzing: "Measuring detail",
  reconstructing: "Reconstructing",
  encoding: "Finishing",
  done: "Done",
  error: "Stopped",
};

export function Studio() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("fast");
  const [progress, setProgress] = useState<UpscaleProgress | null>(null);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const kind = file ? kindFromName(file.name) ?? (file.type.startsWith("video/") ? "video" : "image") : null;

  const chooseFile = useCallback((f: File | null) => {
    if (!f) return;
    const ok = kindFromName(f.name) || f.type.startsWith("image/") || f.type.startsWith("video/");
    if (!ok) {
      setError("That file type isn't supported. Choose an image or a video.");
      setPhase("error");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
    setPhase("idle");
  }, []);

  async function run() {
    if (!file) return;
    setPhase("working");
    setProgress({ stage: "queued", progress: 0 });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await upscale(file, { quality, signal: controller.signal, onProgress: setProgress });
      setResult(res);
      setPhase("done");
    } catch (err) {
      if (controller.signal.aborted) return reset();
      setError(err instanceof UpscaleError ? err.message : "Something went wrong while reconstructing.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setFile(null);
    setResult(null);
    setProgress(null);
    setError("");
  }

  const pct = progress ? Math.round(progress.progress * 100) : 0;

  // ---- done ----
  if (phase === "done" && result) {
    return (
      <div className="result">
        <CompareView kind={result.kind} beforeUrl={result.sourceUrl} afterUrl={result.resultUrl} />
        <p className="result__figures">
          <span>
            <b>{result.source.width}×{result.source.height}</b> to{" "}
            <b>{result.target.width}×{result.target.height}</b>
          </span>
          <span>{result.scale}× scale</span>
          <span>{(result.elapsedMs / 1000).toFixed(1)}s</span>
        </p>
        <div className="result__actions">
          <a className="btn btn--primary" href={`/api/result/${result.jobId}?download=1`}>
            Download
          </a>
          <button className="btn btn--ghost" onClick={reset}>
            Upscale another
          </button>
        </div>
      </div>
    );
  }

  // ---- error ----
  if (phase === "error") {
    return (
      <div className="studio">
        <div className="error">
          <strong>Couldn&apos;t finish that one.</strong>
          <span>{error}</span>
          <button className="btn btn--ghost" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ---- working ----
  if (phase === "working") {
    return (
      <div className="studio">
        <div className="working">
          <div className="working__head">
            <span className="working__stage">{progress ? STAGE_COPY[progress.stage] : "Preparing"}</span>
            <span className="working__pct">{pct}%</span>
          </div>
          <div className="track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span className="track__fill" style={{ width: `${Math.max(4, pct)}%` }} />
          </div>
          <div className="working__meta">
            {progress?.source && progress?.target ? (
              <span>
                {progress.source.width}×{progress.source.height} → {progress.target.width}×
                {progress.target.height}
              </span>
            ) : (
              <span>measuring…</span>
            )}
            {progress?.detail && <span>{progress.detail}</span>}
          </div>
          <button className="linkbtn" onClick={() => abortRef.current?.abort()}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ---- idle: dropzone + quality + action ----
  return (
    <div className="studio">
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
            <span className="dropzone__thumb" aria-hidden="true">
              {kind === "video" ? <FilmIcon /> : <PhotoIcon />}
            </span>
            <span className="dropzone__info">
              <span className="dropzone__name">{file.name}</span>
              <span className="dropzone__meta">
                {kind === "video" ? "Video" : "Image"} · {formatBytes(file.size)}
              </span>
            </span>
            <span className="dropzone__change">Replace</span>
          </div>
        ) : (
          <div className="dropzone__prompt">
            <span className="dropzone__icon" aria-hidden="true">
              <PhotoIcon />
            </span>
            <span className="dropzone__lead">Drag an image or video here</span>
            <span className="dropzone__hint">or click to choose · processed on your machine</span>
          </div>
        )}
      </label>

      <fieldset className="pills">
        <legend className="pills__legend">How much reconstruction</legend>
        <button
          type="button"
          className={`pill${quality === "fast" ? " pill--active" : ""}`}
          aria-pressed={quality === "fast"}
          onClick={() => setQuality("fast")}
        >
          Fast <span className="pill__meta">2×</span>
        </button>
        <button
          type="button"
          className={`pill${quality === "high" ? " pill--active" : ""}`}
          aria-pressed={quality === "high"}
          onClick={() => setQuality("high")}
        >
          High quality <span className="pill__meta">4×</span>
        </button>
      </fieldset>

      <div className="studio__actions">
        <button className="btn btn--primary btn--wide" disabled={!file} onClick={run}>
          Upscale
        </button>
      </div>
    </div>
  );
}

function FilmIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M3 15h18M8 4v16M16 4v16" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L17 18" />
      <path d="M14 15l1.8-1.8a2 2 0 0 1 2.8 0L21 15" />
    </svg>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
