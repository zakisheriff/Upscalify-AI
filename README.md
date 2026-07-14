# <div align="center">Upscalify AI</div>

<div align="center">
<strong>100% Free, AI-Powered Image & Video Upscaler — Real Detail, Not Just Bigger</strong>
</div>

<br />

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="https://upscalify.theatom.lk">
<img src="https://img.shields.io/badge/View%20Live%20Demo-Click%20Here-2680eb?style=for-the-badge&logo=safari&logoColor=white" height="50" />
</a>

<br />
<br />

**[Visit Live Site: https://upscalify.theatom.lk](https://upscalify.theatom.lk)**

</div>

<br />

> **"Rebuild the detail, don't just smooth the blur."**
>
> Upscalify isn't a resize tool; it's a reconstruction engine.  
> Powered by real super-resolution models and designed with a quiet, editor-grade
> interface, it turns a low-resolution or noisy file into a sharper, higher-resolution one.

---

## 🌟 Vision

Upscalify's mission is to be:

- **A completely free upscaler** — no accounts, no billing, no queue, ever
- **A real AI reconstruction system** using Real-ESRGAN for images and SeedVR2 for video
- **A private, on-device tool** — your files never leave your machine

---

## ✨ Why Upscalify?

Most "upscalers" just stretch pixels and sharpen the noise.  
Upscalify runs the **same class of super-resolution models pro tools use** — it denoises
and reconstructs real detail, then lets you compare before/after and download. One page,
one job, done well.

---

## 🎨 Editor-Grade "Premiere" Design

- **Dark, Focused Aesthetics**  
  A Premiere Pro–inspired palette (Adobe Spectrum blue accent) keeps the file the hero.

- **One Page, No Chrome**  
  No navbar, no marketing sections — a title, a dropzone, two quality pills, and the result in place.

- **Before/After Compare**  
  A draggable slider (`CompareView`) reveals exactly what the model reconstructed.

- **System Fonts**  
  Native `-apple-system` typography with an Inter fallback for a clean, native feel.

---

## 🤖 AI-Powered Reconstruction

- **Real-ESRGAN (Images)**  
  The real NCNN/Vulkan engine + weights — denoises and reconstructs rather than sharpening noise.

- **SeedVR2 (Video)**  
  A one-step diffusion transformer with temporal-consistency batching for high-quality video.

- **Two Quality Paths, by Outcome**  
  Fast (~2×, seconds) and High quality (~4×, slower) — never exposed by model name.

- **Real Progress**  
  Jobs report genuine status parsed from the engine, polled live — not a synthetic timer.

---

## 🔐 Privacy-First, On-Device

- **Nothing Leaves Your Machine**  
  Files are processed locally; there's no cloud storage and no upload to a third party.

- **Ephemeral Storage**  
  Inputs/outputs live under the OS temp dir, keyed by job id, and are cheap to clear.

- **No Auth, No Tracking**  
  No sign-up, no cookies for identity, no billing — just the tool.

- **Portable Inference Seam**  
  A single `upscale()` boundary means the model can move to a server later without UI changes.

---

## 🎯 Complete Upscaling Experience

- **Drag & Drop**  
  Drop an image or video straight onto the dropzone.

- **Real Super-Resolution**  
  Real-ESRGAN reconstructs images; ffmpeg (or SeedVR2 when configured) handles video.

- **Live Job Status**  
  Watch real reconstruction progress, stage by stage.

- **Before/After Slider**  
  Compare the original and result pixel-for-pixel before you commit.

- **One-Click Download**  
  Grab the reconstructed file when you're happy with it.

- **Audio-Safe Video**  
  Original audio is remuxed back after the video upscale.

---

## 📁 Project Structure

```
Upscalify/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # The single page (title, Studio, footnote)
│   ├── layout.tsx                # Metadata, OG/Twitter, font + CSS imports
│   ├── globals.css               # Design tokens (Premiere Pro palette)
│   ├── components.css            # Component styles (vanilla CSS)
│   ├── sitemap.ts / robots.ts    # SEO/AEO/GEO
│   └── api/
│       ├── upscale/route.ts      # Accepts the file, starts a job
│       ├── jobs/[id]/route.ts    # Live job status (polled)
│       ├── result/[id]/route.ts  # Serves the reconstructed output
│       └── source/[id]/route.ts  # Serves the original for compare
│
├── components/
│   ├── Studio.tsx                # Dropzone, quality pills, progress, result
│   ├── CompareView.tsx           # Before/after slider
│   └── StructuredData.tsx        # JSON-LD (WebApplication/Org/FAQ)
│
├── lib/
│   ├── upscale.ts                # THE seam — everything runs through here
│   ├── jobs.ts                   # In-memory job registry
│   ├── storage.ts                # Filesystem (OS temp dir) storage
│   ├── media.ts / serve.ts       # File-type + response helpers
│   └── inference/
│       ├── backend.ts            # Picks local vs remote inference
│       ├── local-image.ts        # Real-ESRGAN (sharp fallback)
│       ├── local-video.ts        # ffmpeg (SeedVR2 fallback)
│       ├── realesrgan.ts         # Real-ESRGAN NCNN runner
│       ├── seedvr2.ts            # SeedVR2 CLI runner
│       ├── remote-image.ts       # Model-server client (INFERENCE_URL)
│       ├── scale.ts              # Quality → scale factor
│       └── types.ts              # Shared inference contract
│
└── deploy/                       # Single-VM Docker stack (web + inference + Caddy)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **ffmpeg** on PATH (for video)
- **Optional:** [Upscayl](https://upscayl.org) or a Real-ESRGAN NCNN install (for the real image model; the app falls back to a sharp Lanczos pass without it)

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/Upscalify.git
cd Upscalify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration (optional)

Create `.env` (all optional — the app runs on-device with no config):

```env
# Route inference to a model server instead of the local engine
INFERENCE_URL=

# Point at a Real-ESRGAN binary + models if not auto-detected
REALESRGAN_BIN=
REALESRGAN_MODELS=

# High-quality video via SeedVR2 (needs a CUDA GPU)
SEEDVR2_DIR=
```

### 4. Run the Application

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🎯 Key Features

### For Everyone

✅ **Drop & Go** — No sign-up, drop a file and upscale  
✅ **Real Models** — Real-ESRGAN reconstruction for images  
✅ **Two Quality Paths** — Fast (~2×) or High quality (~4×)  
✅ **Live Progress** — Genuine engine status, not a fake timer  
✅ **Before/After Compare** — Draggable slider to inspect the result  
✅ **Private by Default** — Nothing leaves your machine  
✅ **Audio-Safe Video** — Original audio remuxed after upscaling  

### For Deployers

✅ **One `upscale()` Seam** — Move inference to the cloud with zero UI changes  
✅ **Docker Stack** — `deploy/` ships web + inference + Caddy (HTTPS)  
✅ **Pluggable Backends** — Local engine or remote model server via `INFERENCE_URL`  

---

## 🔧 Tech Stack

### Application
- **Next.js 16** (App Router) + **React 19** — UI and API routes
- **TypeScript** — End-to-end types across the inference seam
- **Vanilla CSS** — No frameworks; design tokens only (Premiere Pro palette)

### Inference
- **Real-ESRGAN** (NCNN/Vulkan) — Real image super-resolution
- **SeedVR2** — Diffusion-transformer video super-resolution (GPU)
- **sharp** — Image I/O and the Lanczos fallback
- **ffmpeg** — Video decode/encode, audio remux, fallback filtergraph

### Deployment
- **Docker Compose** — web + inference + Caddy
- **Caddy** — Automatic HTTPS (Let's Encrypt)

---

## 🧩 The `upscale()` Seam

Everything the frontend does goes through one function: `upscale(file, options)` in
`lib/upscale.ts`. Nothing above it knows where inference runs — it posts to an API route
and polls real job status. Server-side, `getBackend()` picks the engine:

- **`INFERENCE_URL` set** → calls route to a model server (`remote-image.ts`).
- **Otherwise** → the on-device engine runs (Real-ESRGAN/ffmpeg, or the sharp/ffmpeg fallback).

Moving inference to the cloud is a change *behind* this function; callers never change.

---

## 📜 API Reference

### Job Lifecycle
- `POST /api/upscale` — Upload a file (`file`, `quality`) → returns `{ jobId, kind }`
- `GET /api/jobs/:id` — Live job status (stage, progress, dimensions, engine)
- `GET /api/result/:id` — Download the reconstructed output
- `GET /api/source/:id` — Fetch the original (for the compare slider)

---

## 🌐 Deployment

### Single VM (Docker — `deploy/`)
1. Provision a Linux box (e.g. Oracle Always Free ARM)
2. Point your domain's A record at it
3. `cd deploy && docker compose up -d --build`

Caddy fetches HTTPS automatically; the app runs as one long-lived process, so the
in-memory job registry and temp storage work unchanged. See `deploy/README.md` for the
full walkthrough. To use a hosted GPU model server instead, set `INFERENCE_URL`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — 100% Free and Open Source

---

## ☕️ Support the Project

If Upscalify saved you a subscription or inspired your next project:

- Consider buying me a coffee
- It keeps development alive and motivates future updates

<div align="center">
<a href="https://buymeacoffee.com/theoneatom">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="60" width="217">
</a>
</div>

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Because great detail shouldn't cost a subscription.</em>
</p>
