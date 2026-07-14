# SeedVR2 — high-quality video path

Upscalify's high-quality video reconstruction runs on **SeedVR2** (ByteDance's
one-step diffusion-transformer video restorer). The app shells out to the
standalone SeedVR2 inference CLI, then remuxes the original audio back onto the
reconstructed video.

The app finds SeedVR2 through environment variables (see below). When they're
unset, video falls back to the fast ffmpeg scaler — so the product still works
with nothing installed; it just won't reconstruct like the model.

## Requirements

- **An NVIDIA GPU with CUDA.** SeedVR2 is a diffusion model — it does not run
  usefully on CPU or on Apple Silicon (MPS). The 3B FP8 model is the lightest;
  more VRAM lets you raise `--batch_size` for better temporal consistency.
- Python 3.10+ and the SeedVR2 model weights.

## Setup

```bash
# from the repo root
bash inference/seedvr2/setup.sh
```

That clones the standalone SeedVR2 upscaler, creates a venv, installs deps, and
tells you where things landed. Then point the app at it:

```bash
# .env.local  (or export before `npm run dev` / `npm run start`)
SEEDVR2_DIR=/abs/path/to/ComfyUI-SeedVR2_VideoUpscaler
SEEDVR2_PYTHON=/abs/path/to/venv/bin/python
SEEDVR2_MODEL=seedvr2_ema_3b_fp8_e4m3fn   # or a 7B variant if you have the VRAM
SEEDVR2_RESOLUTION=1080                    # target short side
SEEDVR2_BATCH_SIZE=5                       # must be 4n+1; larger = better + more VRAM
SEEDVR2_CUDA_DEVICE=0                       # or "0,1" for multi-GPU
# optional: SEEDVR2_MODEL_DIR, SEEDVR2_SEED
```

Restart the app. Choose **High quality** on a video and it will route through
SeedVR2; **Fast** stays on the quick ffmpeg path.

## How the app calls it

`lib/inference/seedvr2.ts` builds this command and parses tqdm progress from it:

```bash
$SEEDVR2_PYTHON inference_cli.py <input.mp4> \
  --output <upscaled.mp4> --output_format mp4 --video_backend ffmpeg \
  --dit_model $SEEDVR2_MODEL --resolution $SEEDVR2_RESOLUTION \
  --batch_size $SEEDVR2_BATCH_SIZE --seed $SEEDVR2_SEED \
  [--model_dir $SEEDVR2_MODEL_DIR] [--cuda_device $SEEDVR2_CUDA_DEVICE]
```

`lib/inference/local-video.ts` then remuxes the original audio with ffmpeg and
reports the real source→target resolution.

## References

- SeedVR2 CLI (standalone): https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- ByteDance SeedVR / SeedVR2: https://github.com/ByteDance-Seed/SeedVR
