"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * The signature element. A single "resolve front" sweeps left to right: left of
 * it the scene is blocky and cool (unresolved), right of it it is sharp and warm
 * (reconstructed). The scene is a dusk skyline whose tiny lit windows are the
 * detail that visibly survives on the sharp side and collapses on the blocky
 * side — the product's whole premise in one image. GSAP owns this sweep; no
 * other library animates this element.
 */

// deterministic PRNG so blocky and sharp renders describe the same scene
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Building {
  x: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  lit: boolean[];
}

function buildScene(w: number, h: number): Building[] {
  const rnd = mulberry32(20260714);
  const buildings: Building[] = [];
  let x = -10;
  while (x < w + 10) {
    const bw = 26 + rnd() * 46;
    const bh = h * (0.28 + rnd() * 0.5);
    const cols = Math.max(2, Math.floor(bw / 9));
    const rows = Math.max(3, Math.floor(bh / 12));
    const lit: boolean[] = [];
    for (let i = 0; i < cols * rows; i++) lit.push(rnd() > 0.62);
    buildings.push({ x, w: bw, h: bh, cols, rows, lit });
    x += bw + 3 + rnd() * 5;
  }
  return buildings;
}

function paintScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  buildings: Building[],
) {
  // dusk sky: cool indigo at top -> warm amber at horizon
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#171b24");
  sky.addColorStop(0.55, "#1d2330");
  sky.addColorStop(0.82, "#3a2f2b");
  sky.addColorStop(1, "#6a4a2c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // horizon bloom
  const bloom = ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h, h * 0.9);
  bloom.addColorStop(0, "rgba(227,154,59,0.35)");
  bloom.addColorStop(1, "rgba(227,154,59,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // stars
  const rnd = mulberry32(99);
  for (let i = 0; i < Math.floor(w / 6); i++) {
    const sx = rnd() * w;
    const sy = rnd() * h * 0.5;
    ctx.fillStyle = `rgba(237,239,242,${0.15 + rnd() * 0.5})`;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // buildings + windows (the fine detail)
  for (const b of buildings) {
    const top = h - b.h;
    ctx.fillStyle = "#0f1218";
    ctx.fillRect(b.x, top, b.w, b.h);
    const padX = 3;
    const cw = (b.w - padX * 2) / b.cols;
    const chh = (b.h - 6) / b.rows;
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        if (!b.lit[r * b.cols + c]) continue;
        const wx = b.x + padX + c * cw + cw * 0.2;
        const wy = top + 4 + r * chh + chh * 0.2;
        const ww = Math.max(1, cw * 0.55);
        const wh = Math.max(1, chh * 0.5);
        ctx.fillStyle = "#f0b968";
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
  }
}

export function ReconstructionFront({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef({ x: 0.06 });

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;
    const cvs: HTMLCanvasElement = canvas;
    const parent = cvs.parentElement!;
    let raf = 0;
    let sharp: HTMLCanvasElement;
    let blocky: HTMLCanvasElement;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      const rect = parent.getBoundingClientRect();
      W = Math.max(320, rect.width);
      H = Math.max(260, rect.height);
      cvs.width = W * dpr;
      cvs.height = H * dpr;
      cvs.style.width = `${W}px`;
      cvs.style.height = `${H}px`;

      const scene = buildScene(W, H);

      sharp = document.createElement("canvas");
      sharp.width = W * dpr;
      sharp.height = H * dpr;
      const sctx = sharp.getContext("2d")!;
      sctx.scale(dpr, dpr);
      paintScene(sctx, W, H, scene);

      // blocky = sharp downsampled hard then scaled back with no smoothing
      const factor = 14;
      const small = document.createElement("canvas");
      small.width = Math.max(1, Math.floor((W * dpr) / factor));
      small.height = Math.max(1, Math.floor((H * dpr) / factor));
      const smc = small.getContext("2d")!;
      smc.imageSmoothingEnabled = true;
      smc.drawImage(sharp, 0, 0, small.width, small.height);

      blocky = document.createElement("canvas");
      blocky.width = W * dpr;
      blocky.height = H * dpr;
      const bctx = blocky.getContext("2d")!;
      bctx.imageSmoothingEnabled = false;
      bctx.drawImage(small, 0, 0, blocky.width, blocky.height);
      // cool, muddy wash over the unresolved side
      bctx.globalCompositeOperation = "source-atop";
      bctx.fillStyle = "rgba(58,72,92,0.34)";
      bctx.fillRect(0, 0, blocky.width, blocky.height);
      bctx.globalCompositeOperation = "source-over";
    }

    function draw() {
      const ctx = cvs.getContext("2d")!;
      const fx = frontRef.current.x * W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // unresolved (blocky) fills everything
      ctx.drawImage(blocky, 0, 0, W, H);

      // resolved (sharp) revealed to the right of the front
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, 0, W - fx, H);
      ctx.clip();
      ctx.drawImage(sharp, 0, 0, W, H);
      ctx.restore();

      // the amber seam + glow
      const seamW = 2;
      const glow = ctx.createLinearGradient(fx - 26, 0, fx + 26, 0);
      glow.addColorStop(0, "rgba(227,154,59,0)");
      glow.addColorStop(0.5, "rgba(240,185,104,0.5)");
      glow.addColorStop(1, "rgba(227,154,59,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(fx - 26, 0, 52, H);
      ctx.fillStyle = "#f0b968";
      ctx.fillRect(fx - seamW / 2, 0, seamW, H);

      // faint vignette to seat the image
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    build();
    draw();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tween: gsap.core.Tween | gsap.core.Timeline | null = null;
    if (reduce) {
      frontRef.current.x = 0.5;
      draw();
    } else {
      tween = gsap.timeline({ delay: 0.25 })
        .fromTo(
          frontRef.current,
          { x: 0.04 },
          { x: 0.96, duration: 2.6, ease: "power2.inOut", onUpdate: draw },
        )
        .to(frontRef.current, {
          x: 0.5,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: draw,
        });
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        build();
        draw();
      });
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      tween?.kill();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
