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
    const pct = Math.round(p.fraction * 100);
    if (p.phase === "engine") {
      $("setup-bar").style.width = `${pct}%`;
      $("setup-status").textContent = `Downloading engine… ${pct}%`;
    } else if (p.phase === "extract") {
      $("setup-status").textContent = "Unpacking…";
    } else if (p.phase === "models") {
      $("setup-bar").style.width = `${pct}%`;
      $("setup-status").textContent = `Downloading models… ${pct}%`;
    }
  });
  try {
    await window.api.installEngine();
    show("app");
  } catch (err) {
    $("setup-status").textContent = `Setup failed: ${err.message}. Check your connection and reopen.`;
  }
}

function show(which) {
  for (const s of ["setup", "app"]) $(s).classList.toggle("hidden", s !== which);
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
  if (!file || !file.type.startsWith("image/")) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const res = await window.api.inputFromBytes(bytes, file.name);
  loadInput(res);
});

// --- run -------------------------------------------------------------------

async function loadInput(input) {
  state.input = input;
  state.output = null;
  $("dropzone").classList.add("hidden");
  $("pills").classList.add("hidden");
  $("stage").classList.remove("hidden");
  $("img-before").src = input.dataURL;
  $("img-after").src = input.dataURL; // shown, dimmed, while reconstructing
  $("save").disabled = true;
  $("meta").textContent = input.name;

  // start reconstruction — clean shimmer loading state, no fake compare
  const compare = $("compare");
  const label = $("loading-label");
  compare.classList.remove("is-error");
  compare.classList.add("is-loading");
  label.textContent = "Reconstructing";

  window.api.onUpscaleProgress(({ fraction }) => {
    label.textContent = `Reconstructing ${Math.round(fraction * 100)}%`;
  });

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

$("reset").addEventListener("click", () => {
  state.input = null;
  state.output = null;
  $("compare").classList.remove("is-loading", "is-error");
  $("stage").classList.add("hidden");
  $("pills").classList.remove("hidden");
  $("dropzone").classList.remove("hidden");
});

$("save").addEventListener("click", async () => {
  if (!state.output) return;
  const base = (state.input.name || "image").replace(/\.[^.]+$/, "");
  await window.api.save(state.output.outputPath, `${base}-upscaled.png`);
});

// --- before/after slider ---------------------------------------------------

function setupCompare() {
  const compare = $("compare");
  const clip = $("clip");
  const handle = $("handle");
  const before = $("img-before");

  const setPos = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    clip.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
    // keep the "before" image aligned to the full frame width
    before.style.width = `${compare.clientWidth}px`;
  };
  setPos(50);

  let dragging = false;
  const move = (clientX) => {
    const rect = compare.getBoundingClientRect();
    setPos(((clientX - rect.left) / rect.width) * 100);
  };
  handle.addEventListener("mousedown", () => (dragging = true));
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => dragging && move(e.clientX));
  compare.addEventListener("click", (e) => move(e.clientX));
  window.addEventListener("resize", () => (before.style.width = `${compare.clientWidth}px`));
}

boot();
