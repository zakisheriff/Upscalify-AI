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

Video stays in the web app — Upscayl-class desktop tools are image-only.

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
├── upscale.js         # Spawns Real-ESRGAN, parses progress
└── renderer/          # UI (index.html, styles.css, renderer.js)
```
