"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaKind } from "@/lib/inference/types";

interface Props {
  kind: MediaKind;
  beforeUrl: string;
  afterUrl: string;
}

/**
 * Interactive before/after. The divider is the same "reconstruction front" from
 * the hero, now under the user's control: drag it to wipe between the original
 * (left, unresolved) and the reconstructed result (right). For video both
 * tracks play in sync. Pointer + keyboard driven; no animation library owns
 * this element, so there is no transform conflict with the drag.
 */
export function CompareView({ kind, beforeUrl, afterUrl }: Props) {
  const [pos, setPos] = useState(50); // percent
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  }, []);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    }
    function up() {
      dragging.current = false;
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setFromClientX]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 3));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 3));
    if (e.key === "Home") setPos(0);
    if (e.key === "End") setPos(100);
  }

  return (
    <div className="compare">
      <div
        className="compare__frame"
        ref={frameRef}
        onPointerDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
      >
        {/* after (resolved) is the base layer */}
        <div className="compare__layer">
          {kind === "image" ? (
            <img src={afterUrl} alt="Reconstructed result at higher resolution" draggable={false} />
          ) : (
            <SyncedVideo src={afterUrl} muted />
          )}
        </div>

        {/* before (unresolved) clipped to the left of the front */}
        <div
          className="compare__layer compare__layer--before"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          {kind === "image" ? (
            <img src={beforeUrl} alt="Original file before upscaling" draggable={false} />
          ) : (
            <SyncedVideo src={beforeUrl} muted />
          )}
        </div>

        <span className="compare__tag compare__tag--before">Original</span>
        <span className="compare__tag compare__tag--after">Reconstructed</span>

        <div
          className="compare__front"
          style={{ left: `${pos}%` }}
          role="slider"
          aria-label="Reveal original versus reconstructed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onKeyDown={onKey}
        >
          <span className="compare__handle" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 3v8M9 3v8" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function SyncedVideo({ src, muted }: { src: string; muted?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);
  return <video ref={ref} src={src} muted={muted} loop playsInline autoPlay />;
}
