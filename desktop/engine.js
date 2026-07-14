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

function download(url, dest, onProgress) {
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
          const total = Number(res.headers["content-length"]) || 0;
          let received = 0;
          res.on("data", (c) => {
            received += c.length;
            if (onProgress && total) onProgress(received / total);
          });
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

async function install(onProgress) {
  const root = engineDir();
  await fsp.mkdir(root, { recursive: true });
  await fsp.mkdir(modelsDir(), { recursive: true });

  // 1. binary
  const zipPath = path.join(root, "engine.zip");
  await download(BINARY_ZIP, zipPath, (f) => onProgress?.({ phase: "engine", fraction: f }));
  onProgress?.({ phase: "extract", fraction: 1 });
  await unzip(zipPath, root);
  await fsp.unlink(zipPath).catch(() => {});

  // 2. models
  for (let i = 0; i < MODEL_FILES.length; i++) {
    const name = MODEL_FILES[i];
    await download(`${MODEL_BASE}/${name}`, path.join(modelsDir(), name), (f) =>
      onProgress?.({ phase: "models", fraction: (i + f) / MODEL_FILES.length }),
    );
  }

  // 3. make the downloaded binary runnable
  const found = findInstall();
  if (!found) throw new Error("Engine did not install correctly.");
  await fsp.chmod(found.bin, 0o755).catch(() => {});
  await unquarantine(root);
  return found;
}

module.exports = { isInstalled, findInstall, install, engineDir };
