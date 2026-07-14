# <div align="center">Upscalify AI</div>

<div align="center">
<strong>A free, on-device image & video upscaler for Mac — real detail, not just bigger.</strong>
</div>

<br />

<div align="center">

![Electron](https://img.shields.io/badge/Electron-Desktop-47848f?style=for-the-badge&logo=electron&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon%20%2F%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white)
![Real-ESRGAN](https://img.shields.io/badge/Engine-Real--ESRGAN-2680eb?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="https://github.com/zakisheriff/Upscalify/releases/latest">
<img src="https://img.shields.io/badge/Download%20for%20Mac-Get%20the%20.dmg-000000?style=for-the-badge&logo=apple&logoColor=white" height="50" />
</a>

<br />
<br />

**[Website: https://upscalify.theatom.lk](https://upscalify.theatom.lk)**

</div>

<br />

> **"Rebuild the detail, don't just smooth the blur."**
>
> Upscalify is a native Mac app that turns a low-resolution or noisy file into a
> sharper, higher-resolution one — reconstructing real detail rather than stretching
> pixels. Everything runs on your own machine; nothing is ever uploaded.

---

## 🌟 What it is

- **A desktop app you install**, not a web service. You download it, run it, and use it locally.
- **Real reconstruction** with Real-ESRGAN — the same models behind Upscayl.
- **Images and video** — upscale photos with a before/after slider, and video with the original audio kept.
- **Free and private** — no account, no billing, no upload. Works offline after a one-time setup.

---

## ✨ Why Upscalify?

Most "upscalers" just stretch pixels and sharpen the noise. Upscalify runs the same
class of super-resolution models pro tools use — it denoises and **reconstructs** real
detail. It's a small, focused app that does one thing well.

---

## 🖥️ Platform support

| Platform | Status |
|---|---|
| **macOS** (Apple Silicon & Intel) | ✅ Supported |
| **Windows** | ⏳ Not yet — the app is built on Electron (cross-platform), but currently ships macOS-only binaries and installer. Windows support is planned. |
| **Linux** | ⏳ Not yet |

---

## 🚀 Install

1. **[Download the `.dmg`](https://github.com/zakisheriff/Upscalify/releases/latest)** and drag Upscalify into your Applications folder.
2. **First launch:** it's a new, unsigned build, so right-click the app → **Open** (you only do this once).
3. **One-time setup:** on first run it downloads the upscaling engine (~42 MB). After that it works completely offline.

---

## 🎯 Features

- **Fast (2×)** and **High quality (4×)** modes — exposed by outcome, never by model name.
- **Before / after slider** — drag right to reveal the upscaled result, left for the original.
- **Video upscaling** — a quick, temporally stable pass that preserves the original audio.
- **Drag & drop or browse** — JPG · PNG · WEBP · BMP · TIFF · MP4 · MOV · WEBM.
- **On-device** — your files never leave your machine.

---

## 🤖 How it works

- **Images → Real-ESRGAN** (`realesrgan-ncnn-vulkan`, GPU-accelerated via Metal). On first
  launch the app downloads the upstream BSD binary and the Real-ESRGAN x4plus weights
  (`upscayl-lite-4x` / `upscayl-standard-4x`) from the open-source Upscayl repo — the same
  models Upscayl uses, so results match. Nothing is redistributed in the app itself.
- **Video → ffmpeg** — a deterministic Lanczos scale + unsharp pass that is quick, temporally
  stable, and keeps audio. It needs `ffmpeg` on the machine (`brew install ffmpeg`). This is
  the same non-CUDA path the website uses.
- **SeedVR2 (video AI model)** is intentionally **not** bundled — it requires an NVIDIA CUDA
  GPU and cannot run on macOS.

---

## 🔐 Privacy — on-device by design

There is no server in the loop. Images and video are processed locally using your GPU, and
the app works offline after the one-time engine download. No accounts, no telemetry, no upload.

---

## 📁 Project structure

```
Upscalify/
├── desktop/            # The Mac app (Electron)
│   ├── main.js         # Electron main: windows + IPC (input, run, save)
│   ├── preload.js      # Safe IPC bridge (contextIsolation)
│   ├── engine.js       # First-run download of the Real-ESRGAN binary + models
│   ├── upscale.js      # Runs Real-ESRGAN for images
│   ├── video.js        # ffmpeg Lanczos+unsharp video path (keeps audio)
│   ├── build/          # App icon (.icns / .png)
│   └── renderer/       # UI (index.html, styles.css, renderer.js)
│
├── site/               # The landing website (Next.js) — deploys to Vercel
│   └── app/            # Homepage (download landing), SEO/AEO/GEO, sitemap, robots
│
└── (root Next.js app)  # The original in-browser tool + inference seam (kept for reference)
```

---

## 🛠️ Develop

**Desktop app**
```bash
cd desktop
npm install
npm start          # runs the app
npm run dist       # builds desktop/dist/Upscalify-<version>.dmg
```

**Website**
```bash
cd site
npm install
npm run dev        # http://localhost:3000
```

---

## 🌐 Deployment

**The app (`.dmg`)** — build it, then publish a GitHub Release:
```bash
cd desktop && npm run dist
# then: GitHub → Releases → Draft a new release → attach the .dmg → Publish
```
The website's download buttons point to `releases/latest`, so a published release makes them live.
The build is **unsigned** to start; for a clean double-click (no "unidentified developer" prompt),
sign + notarize with an Apple Developer account.

**The website** — deploy `site/` to Vercel:
1. Import the repo in Vercel.
2. Set **Root Directory** to `site`.
3. Deploy. Framework auto-detects as Next.js; no env vars needed.

---

## ☕️ Support

If Upscalify saved you time, you can support the work:

<a href="https://buymeacoffee.com/theoneatom">
<img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-ffdd00?style=for-the-badge&logo=buymeacoffee&logoColor=black" height="45" />
</a>

---

<div align="center">
Made by Zaki Sheriff · <a href="https://theatom.lk">The Atom</a>
</div>
