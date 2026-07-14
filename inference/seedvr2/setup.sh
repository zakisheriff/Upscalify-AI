#!/usr/bin/env bash
# Bootstrap the SeedVR2 standalone video upscaler for Upscalify's high-quality
# video path. Requires an NVIDIA/CUDA GPU. See README.md in this folder.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${SEEDVR2_DIR:-$HERE/ComfyUI-SeedVR2_VideoUpscaler}"
REPO="https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git"

echo "==> SeedVR2 will be installed at: $TARGET"

if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "!! No nvidia-smi found. SeedVR2 needs an NVIDIA/CUDA GPU and will not run"
  echo "   usefully on CPU or Apple Silicon. Continuing to install the code anyway."
fi

if [ ! -d "$TARGET/.git" ]; then
  git clone --depth 1 "$REPO" "$TARGET"
else
  echo "==> Repo already present, pulling latest"
  git -C "$TARGET" pull --ff-only || true
fi

if [ ! -f "$TARGET/inference_cli.py" ]; then
  echo "!! inference_cli.py not found in $TARGET — check the upstream repo layout."
  exit 1
fi

echo "==> Creating virtualenv"
python3 -m venv "$TARGET/.venv"
# shellcheck disable=SC1091
source "$TARGET/.venv/bin/activate"
pip install --upgrade pip
if [ -f "$TARGET/requirements.txt" ]; then
  pip install -r "$TARGET/requirements.txt"
else
  echo "!! No requirements.txt found; install torch + deps per the upstream README."
fi

cat <<EOF

==> Done. Add these to Upscalify's .env.local:

  SEEDVR2_DIR=$TARGET
  SEEDVR2_PYTHON=$TARGET/.venv/bin/python
  SEEDVR2_MODEL=seedvr2_ema_3b_fp8_e4m3fn
  SEEDVR2_RESOLUTION=1080
  SEEDVR2_BATCH_SIZE=5
  SEEDVR2_CUDA_DEVICE=0

The model weights download on first run (or per the upstream README). Then pick
"High quality" on a video in the app.
EOF
