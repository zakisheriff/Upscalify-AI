"use strict";

const $ = (id) => document.getElementById(id);

const state = {
  quality: "fast",
  input: null, // { path, name, dataURL }
  output: null, // { outputPath, dataURL, scale, model }
};

// --- boot: ensure the engine is installed ----------------------------------

async function boot() {
  const { installed } = await window.api.engineStatus();
  if (installed) {
    show("app");
    return;
  }
  show("setup");
  window.api.onEngineProgress((p) => {
    const pct = Math.round((p.fraction || 0) * 100);
    $("setup-bar").style.width = `${pct}%`;
    if (p.phase === "extract") {
      $("setup-status").textContent = "Unpacking the engine…";
      $("setup-detail").textContent = "";
    } else if (p.phase === "done") {
      $("setup-status").textContent = "Finishing up…";
      $("setup-detail").textContent = "";
    } else {
      $("setup-status").textContent = `Downloading the model · ${pct}%`;
      $("setup-detail").textContent = fmtDetail(p);
    }
  });
  try {
    await window.api.installEngine();
    await showWelcome(); // first-run greeting, then Get started → app
  } catch (err) {
    $("setup-status").textContent = `Setup failed: ${err.message}. Check your connection and reopen.`;
  }
}

// Handwritten hello: the stroke draws itself along the letter path, then the
// letters fill in and a "Welcome to Upscalify" + Get started fades up.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function showWelcome() {
  show("welcome");
  const path = $("hello-path");
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  path.getBoundingClientRect(); // flush layout so the transition runs
  path.style.transition = "stroke-dashoffset 2.6s cubic-bezier(0.33, 0, 0.2, 1)";
  requestAnimationFrame(() => (path.style.strokeDashoffset = "0"));
  await wait(2600);
  path.classList.add("is-drawn"); // fill the letters in
  await wait(500);
  $("welcome-end").classList.add("show");
}

$("welcome-go").addEventListener("click", () => show("app"));

function show(which) {
  for (const s of ["setup", "welcome", "app"]) $(s).classList.toggle("hidden", s !== which);
}

// --- download detail formatting --------------------------------------------

const MB = 1024 * 1024;
const fmtMB = (b) => `${(b / MB).toFixed(1)} MB`;
const fmtSpeed = (bps) => (bps ? `${(bps / MB).toFixed(1)} MB/s` : "");
function fmtEta(sec) {
  if (!sec || !isFinite(sec)) return "";
  sec = Math.round(sec);
  if (sec < 60) return `about ${sec}s left`;
  const m = Math.floor(sec / 60);
  return `about ${m}m ${sec % 60}s left`;
}
function fmtDetail(p) {
  const parts = [];
  if (p.totalBytes) parts.push(`${fmtMB(p.receivedBytes || 0)} of ${fmtMB(p.totalBytes)}`);
  const sp = fmtSpeed(p.bytesPerSec);
  if (sp) parts.push(sp);
  const eta = fmtEta(p.etaSec);
  if (eta) parts.push(eta);
  return parts.join("  ·  ");
}

// --- quality pills ---------------------------------------------------------

$("pills").addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;
  state.quality = btn.dataset.quality;
  document.querySelectorAll(".pill").forEach((p) => p.classList.toggle("is-active", p === btn));
});

// --- input: browse + drag/drop ---------------------------------------------

const dz = $("dropzone");

// The whole dropzone opens the file picker.
async function openPicker() {
  const res = await window.api.pickInput();
  if (res) loadInput(res);
}
dz.addEventListener("click", openPicker);
dz.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openPicker();
  }
});
["dragenter", "dragover"].forEach((ev) =>
  dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.add("is-over");
  }),
);
["dragleave", "drop"].forEach((ev) =>
  dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.remove("is-over");
  }),
);
dz.addEventListener("drop", async (e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const isMedia = file.type.startsWith("image/") || file.type.startsWith("video/");
  if (!isMedia) return;
  // Prefer the real path (no byte copy — important for large videos).
  const p = window.api.pathForFile(file);
  const res = p
    ? await window.api.inputFromPath(p)
    : await window.api.inputFromBytes(new Uint8Array(await file.arrayBuffer()), file.name);
  loadInput(res);
});

// --- run -------------------------------------------------------------------

// Single progress dispatcher: whichever mode is active sets `onProgress`.
let onProgress = () => {};
window.api.onUpscaleProgress((p) => onProgress(p));

function loadInput(input) {
  state.input = input;
  state.output = null;
  $("dropzone").classList.add("hidden");
  $("pills").classList.add("hidden");
  $("stage").classList.remove("hidden");
  $("save").disabled = true;
  $("meta").textContent = input.name;
  if (input.kind === "video") return loadVideo(input);
  return loadImage(input);
}

async function loadImage(input) {
  $("videobox").classList.add("hidden");
  $("compare").classList.remove("hidden");
  $("img-before").onload = fitCompare; // size the frame as soon as the image is known
  $("img-before").src = input.dataURL;
  $("img-after").src = input.dataURL; // shown, dimmed, while reconstructing

  const compare = $("compare");
  const label = $("loading-label");
  compare.classList.remove("is-error");
  compare.classList.add("is-loading");
  label.textContent = "Reconstructing";
  onProgress = ({ fraction }) => {
    const pct = Math.round((fraction || 0) * 100);
    label.textContent = pct >= 99 ? "Finishing…" : `Reconstructing ${pct}%`;
  };

  try {
    const out = await window.api.upscale(input.path, state.quality);
    state.output = out;
    $("img-after").src = out.dataURL;
    compare.classList.remove("is-loading");
    $("save").disabled = false;
    $("meta").textContent = `${input.name} · ${out.model} · ${(out.elapsedMs / 1000).toFixed(1)}s`;
    setupCompare();
  } catch (err) {
    compare.classList.add("is-error");
    label.textContent = `Failed: ${err.message}`;
  }
}

async function loadVideo(input) {
  $("compare").classList.add("hidden");
  $("videobox").classList.remove("hidden");
  const frame = $("videoframe");
  const label = $("vloading-label");
  frame.classList.add("is-loading");
  label.textContent = "Reconstructing";
  onProgress = (p) => {
    label.textContent = p.detail
      ? `Reconstructing ${p.detail}`
      : `Reconstructing ${Math.round((p.fraction || 0) * 100)}%`;
  };

  try {
    const out = await window.api.upscale(input.path, state.quality);
    state.output = out;
    const v = $("result-video");
    v.src = out.dataURL;
    frame.classList.remove("is-loading");
    $("save").disabled = false;
    $("meta").textContent = `${input.name} · ${out.model} · ${(out.elapsedMs / 1000).toFixed(1)}s`;
  } catch (err) {
    label.textContent = `Failed: ${err.message}`;
  }
}

$("reset").addEventListener("click", () => {
  state.input = null;
  state.output = null;
  onProgress = () => {};
  $("compare").classList.remove("is-loading", "is-error");
  const v = $("result-video");
  v.pause();
  v.removeAttribute("src");
  v.load();
  $("stage").classList.add("hidden");
  $("pills").classList.remove("hidden");
  $("dropzone").classList.remove("hidden");
});

$("save").addEventListener("click", async () => {
  if (!state.output) return;
  const isVideo = state.output.kind === "video";
  const base = (state.input.name || "file").replace(/\.[^.]+$/, "");
  const suggested = `${base}-upscaled.${isVideo ? "mp4" : "png"}`;
  await window.api.save(state.output.outputPath, suggested, state.output.kind);
});

// --- before/after slider ---------------------------------------------------

let comparePos = 50;

// Size the frame to the fitted image so both layers share exact geometry.
function fitCompare() {
  const compare = $("compare");
  const base = $("img-before");
  const w0 = base.naturalWidth, h0 = base.naturalHeight;
  if (!w0 || !h0) return;
  const maxW = compare.parentElement.clientWidth;
  const maxH = Math.round(window.innerHeight * 0.6);
  const s = Math.min(maxW / w0, maxH / h0);
  const w = Math.round(w0 * s), h = Math.round(h0 * s);
  compare.style.width = `${w}px`;
  compare.style.height = `${h}px`;
  // the "after" image inside the clip must stay the full frame width
  $("img-after").style.width = `${w}px`;
  $("img-after").style.height = `${h}px`;
}

function setupCompare() {
  const compare = $("compare");
  const clip = $("clip");
  const handle = $("handle");

  fitCompare();

  const setPos = (pct) => {
    comparePos = Math.max(0, Math.min(100, pct));
    // left of the handle = after (revealed), so sliding right shows more after
    clip.style.width = `${comparePos}%`;
    handle.style.left = `${comparePos}%`;
  };
  setPos(comparePos);

  let dragging = false;
  const move = (clientX) => {
    const rect = compare.getBoundingClientRect();
    setPos(((clientX - rect.left) / rect.width) * 100);
  };
  handle.addEventListener("mousedown", () => (dragging = true));
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => dragging && move(e.clientX));
  compare.addEventListener("click", (e) => move(e.clientX));
  window.addEventListener("resize", () => {
    fitCompare();
    setPos(comparePos);
  });
}

boot();
