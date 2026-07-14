# Upscalify Desktop

A native macOS image upscaler — like Upscayl — built on real Real-ESRGAN.
Everything runs on the user's own machine (GPU-accelerated via Metal); nothing
is uploaded. This is the desktop counterpart to the web app in the repo root.

## How it works

- **Electron** shell with a native window.
- On **first launch** it downloads, once, into the app's data dir:
  - the upstream (BSD) `realesrgan-ncnn-vulkan` binary, and
  - the Real-ESRGAN x4plus weights (`upscayl-standard-4x` / `upscayl-lite-4x`).
- After that it works fully offline. The main process spawns the binary
  (`upscale.js`); the renderer is the dark, Premiere-style UI with a
  before/after slider.

Quality is exposed by outcome, never by model name:
- **Fast** → `upscayl-lite-4x` (light, quick)
- **High quality** → `upscayl-standard-4x` (full Real-ESRGAN x4plus)

**Video** is supported too (`video.js`). It uses the same deterministic ffmpeg
path the web app uses off-CUDA — a Lanczos scale + unsharp pass that is quick,
temporally stable, and keeps the original audio. No AI model or extra weights;
it only needs `ffmpeg`/`ffprobe` (located from the usual install dirs or PATH —
`brew install ffmpeg`). SeedVR2 is intentionally not bundled: it needs a CUDA
GPU and cannot run on macOS.

## Run it (development)

```bash
cd desktop
npm install
node node_modules/electron/install.js   # if the electron binary didn't fetch
npm start
```

## Build a distributable `.dmg`

```bash
npm run dist
```

Output lands in `desktop/dist/`. The build is **unsigned** to start, so on first
open macOS shows an "unidentified developer" prompt — right-click the app →
**Open**. For a clean double-click experience later, sign + notarize with an
Apple Developer account ($99/yr).

## Files

```
desktop/
├── main.js            # Electron main: windows + IPC (input, run, save)
├── preload.js         # Safe IPC bridge (contextIsolation)
├── engine.js          # First-run download of binary + models; locates them
├── upscale.js         # Spawns Real-ESRGAN for images, parses progress
├── video.js           # ffmpeg Lanczos+unsharp video path (keeps audio)
└── renderer/          # UI (index.html, styles.css, renderer.js)
```
