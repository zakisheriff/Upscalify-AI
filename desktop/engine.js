"use strict";

// Manages the Real-ESRGAN NCNN/Vulkan engine: locating it, and downloading it
// once on first run into the app's data dir. Two pieces:
//   - the binary: upstream (xinntao) BSD-licensed realesrgan-ncnn-vulkan
//   - the weights: the Real-ESRGAN x4plus models (BSD), served as plain files
//     from the open-source Upscayl repo
// After the one-time fetch the app works fully offline.

const { app } = require("electron");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const https = require("node:https");
const { execFile } = require("node:child_process");

const BINARY_ZIP =
  "https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan/releases/download/v0.2.0/realesrgan-ncnn-vulkan-v0.2.0-macos.zip";
const BINARY_NAME = "realesrgan-ncnn-vulkan";

const MODEL_BASE = "https://raw.githubusercontent.com/upscayl/upscayl/main/resources/models";
const MODEL_FILES = [
  "upscayl-lite-4x.param",
  "upscayl-lite-4x.bin",
  "upscayl-standard-4x.param",
  "upscayl-standard-4x.bin",
];

function engineDir() {
  return path.join(app.getPath("userData"), "engine");
}
function modelsDir() {
  return path.join(engineDir(), "models");
}

// Walk the engine dir to find the binary (its exact path can nest inside the
// extracted archive folder).
function findBinary() {
  const root = engineDir();
  if (!fs.existsSync(root)) return null;
  let bin = null;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === BINARY_NAME) bin = full;
    }
  })(root);
  return bin;
}

function findInstall() {
  const bin = findBinary();
  const models = modelsDir();
  const hasModels = fs.existsSync(path.join(models, "upscayl-standard-4x.param"));
  return bin && hasModels ? { bin, models } : null;
}

function isInstalled() {
  return findInstall() !== null;
}

function download(url, dest, onChunk) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) => {
      https
        .get(u, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            return get(res.headers.location); // follow GitHub → CDN redirect
          }
          if (res.statusCode !== 200) return reject(new Error(`Download failed (${res.statusCode})`));
          res.on("data", (c) => onChunk?.(c.length));
          res.pipe(file);
          file.on("finish", () => file.close(() => resolve()));
        })
        .on("error", (err) => fs.unlink(dest, () => reject(err)));
    };
    get(url);
  });
}

function unzip(zip, dest) {
  // Native unzip preserves the fat Mach-O binary (JS zip libs can corrupt it).
  return new Promise((resolve, reject) => {
    execFile("/usr/bin/unzip", ["-oq", zip, "-d", dest], (err) => (err ? reject(err) : resolve()));
  });
}

function unquarantine(dir) {
  return new Promise((resolve) => execFile("/usr/bin/xattr", ["-dr", "com.apple.quarantine", dir], () => resolve()));
}

// Approximate total of everything fetched (binary zip ~5.5 MB + weights ~36 MB).
// Used for the overall bar and ETA; the final tick is pinned to 100% on success.
const ESTIMATED_TOTAL = 42 * 1024 * 1024;

async function install(onProgress) {
  const root = engineDir();
  await fsp.mkdir(root, { recursive: true });
  await fsp.mkdir(modelsDir(), { recursive: true });

  // Shared byte/speed tracker across the binary + all model files, so the user
  // sees one continuous "downloaded / total · speed · time left".
  let received = 0;
  let winBytes = 0;
  let winStart = Date.now();
  let bytesPerSec = 0;
  const tick = (phase) => {
    const now = Date.now();
    const dt = (now - winStart) / 1000;
    if (dt >= 0.4) {
      bytesPerSec = winBytes / dt;
      winBytes = 0;
      winStart = now;
    }
    const remaining = Math.max(0, ESTIMATED_TOTAL - received);
    const etaSec = bytesPerSec > 0 ? remaining / bytesPerSec : 0;
    onProgress?.({
      phase,
      receivedBytes: received,
      totalBytes: ESTIMATED_TOTAL,
      bytesPerSec,
      etaSec,
      fraction: Math.min(0.999, received / ESTIMATED_TOTAL),
    });
  };
  const chunk = (phase) => (len) => {
    received += len;
    winBytes += len;
    tick(phase);
  };

  // 1. binary
  const zipPath = path.join(root, "engine.zip");
  await download(BINARY_ZIP, zipPath, chunk("download"));
  onProgress?.({ phase: "extract", fraction: received / ESTIMATED_TOTAL, receivedBytes: received, totalBytes: ESTIMATED_TOTAL });
  await unzip(zipPath, root);
  await fsp.unlink(zipPath).catch(() => {});

  // 2. models
  for (const name of MODEL_FILES) {
    await download(`${MODEL_BASE}/${name}`, path.join(modelsDir(), name), chunk("download"));
  }

  // 3. make the downloaded binary runnable
  const found = findInstall();
  if (!found) throw new Error("Engine did not install correctly.");
  await fsp.chmod(found.bin, 0o755).catch(() => {});
  await unquarantine(root);
  onProgress?.({ phase: "done", fraction: 1, receivedBytes: ESTIMATED_TOTAL, totalBytes: ESTIMATED_TOTAL, bytesPerSec: 0, etaSec: 0 });
  return found;
}

module.exports = { isInstalled, findInstall, install, engineDir };
