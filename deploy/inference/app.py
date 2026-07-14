"""
Real-ESRGAN inference server (CPU).

This is the model server behind the app's INFERENCE_URL seam. It runs the real
Real-ESRGAN weights on CPU via PyTorch (no Vulkan/GPU needed), so a GPU-less
free host — e.g. an Oracle Always Free ARM VM — produces the same reconstructed
detail the NCNN/Vulkan binary would, just slower.

Contract (matches lib/inference/remote-image.ts):
  POST /upscale  multipart: file, scale (2|4), quality, kind
    -> PNG bytes, with headers:
       x-source-width, x-source-height, x-output-width, x-output-height
"""

import io
import os
import time

import numpy as np
import torch
from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image
from spandrel import ImageModelDescriptor, ModelLoader

torch.set_num_threads(max(1, os.cpu_count() or 2))
DEVICE = torch.device("cpu")
MODELS_DIR = os.environ.get("MODELS_DIR", "/models")

# Guard rails so a huge upload can't OOM the box or produce an absurd output.
MAX_SRC_PIXELS = 16_000_000        # reject sources larger than ~16 MP
DOWNSHIFT_PIXELS = 4_000_000       # above ~4 MP, use x2 even if x4 was asked
TILE = 256
OVERLAP = 16

_MODELS: dict[int, ImageModelDescriptor] = {}
_MODEL_FILE = {4: "RealESRGAN_x4plus.pth", 2: "RealESRGAN_x2plus.pth"}

app = FastAPI(title="upscalify-inference")


def get_model(native_scale: int) -> ImageModelDescriptor:
    if native_scale in _MODELS:
        return _MODELS[native_scale]
    path = os.path.join(MODELS_DIR, _MODEL_FILE[native_scale])
    model = ModelLoader().load_from_file(path)
    if not isinstance(model, ImageModelDescriptor):
        raise RuntimeError(f"{path} is not a single-image super-resolution model")
    model.to(DEVICE).eval()
    _MODELS[native_scale] = model
    return model


def _to_tensor(arr: np.ndarray) -> torch.Tensor:
    return torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).float().div_(255.0)


def _to_uint8(t: torch.Tensor) -> np.ndarray:
    t = t.squeeze(0).clamp_(0, 1).permute(1, 2, 0).cpu().numpy()
    return (t * 255.0 + 0.5).astype(np.uint8)


@torch.inference_mode()
def _upscale_tiled(model: ImageModelDescriptor, img: np.ndarray, scale: int) -> np.ndarray:
    h, w, c = img.shape
    out = np.zeros((h * scale, w * scale, c), dtype=np.uint8)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(0, y - OVERLAP), max(0, x - OVERLAP)
            y1, x1 = min(h, y + TILE + OVERLAP), min(w, x + TILE + OVERLAP)
            res = _to_uint8(model(_to_tensor(img[y0:y1, x0:x1, :]).to(DEVICE)))
            top, left = (y - y0) * scale, (x - x0) * scale
            ph, pw = min(TILE, h - y) * scale, min(TILE, w - x) * scale
            out[y * scale:y * scale + ph, x * scale:x * scale + pw, :] = \
                res[top:top + ph, left:left + pw, :]
    return out


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/upscale")
async def upscale(
    file: UploadFile,
    scale: int = Form(4),
    quality: str = Form("high"),
    kind: str = Form("image"),
) -> Response:
    started = time.time()
    data = await file.read()
    try:
        pil = Image.open(io.BytesIO(data))
        pil.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image.")

    src_w, src_h = pil.size
    if src_w * src_h > MAX_SRC_PIXELS:
        raise HTTPException(status_code=413, detail="Image is too large to process.")

    has_alpha = pil.mode in ("RGBA", "LA") or (pil.mode == "P" and "transparency" in pil.info)
    alpha = pil.convert("RGBA").getchannel("A") if has_alpha else None
    arr = np.asarray(pil.convert("RGB"))

    native = 4 if int(scale) >= 4 else 2
    if native == 4 and src_w * src_h > DOWNSHIFT_PIXELS:
        native = 2  # keep the output and memory sane on big sources

    out_arr = _upscale_tiled(get_model(native), arr, native)
    out_img = Image.fromarray(out_arr, "RGB")
    if alpha is not None:
        out_img = out_img.convert("RGBA")
        out_img.putalpha(alpha.resize(out_img.size, Image.LANCZOS))

    buf = io.BytesIO()
    out_img.save(buf, format="PNG")
    print(f"upscaled {src_w}x{src_h} ->{out_img.width}x{out_img.height} "
          f"(x{native}) in {time.time() - started:.1f}s", flush=True)

    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={
            "x-source-width": str(src_w),
            "x-source-height": str(src_h),
            "x-output-width": str(out_img.width),
            "x-output-height": str(out_img.height),
        },
    )
