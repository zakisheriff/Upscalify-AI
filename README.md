# Upscalify AI

An image and video upscaler from [The Atom](https://theatom.lk). Upload a
low-resolution or low-quality file and get back a sharper, higher-resolution
version — real detail reconstructed, not just enlarged. Live at
[upscalify.theatom.lk](https://upscalify.theatom.lk).

- **Images** are reconstructed in a single pass.
- **Video** is reconstructed frame by frame with temporal stability, then
  reassembled with its original audio.
- **Two paths**: fast (≈2×) and high quality (≈4×), named by outcome.

v1 runs entirely on your own machine. Nothing is uploaded to a third-party
service.

## Requirements

- Node.js 20+
- `ffmpeg` and `ffprobe` on your PATH (video only; images work without them)

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How inference is wired

The frontend only ever calls `upscale(file, options)` from `lib/upscale.ts`. It
does not know where reconstruction happens. By default a local engine runs
(sharp for images, ffmpeg for video). Point `INFERENCE_URL` at a model server
(Real-ESRGAN / SeedVR2) to route there instead — no frontend changes. See
`CLAUDE.md` and `AGENTS.md` for the full picture.

```bash
# optional: use a running model server instead of the local fallback
INFERENCE_URL=http://127.0.0.1:8008 npm run dev
```

## Build

```bash
npm run build && npm run start
```
