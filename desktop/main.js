"use strict";

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const engine = require("./engine");
const { run } = require("./upscale");
const video = require("./video");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1040,
    height: 760,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: "#ffffff",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  // Dock icon in development (packaged builds use build/icon.icns).
  if (process.platform === "darwin" && app.dock) {
    try {
      app.dock.setIcon(path.join(__dirname, "build", "icon.png"));
    } catch {}
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- helpers ---------------------------------------------------------------

function tmpDir() {
  return path.join(os.tmpdir(), "upscalify-desktop");
}

async function toDataURL(filePath) {
  const buf = await fs.readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase() || "png";
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${buf.toString("base64")}`;
}

async function toVideoDataURL(filePath) {
  const buf = await fs.readFile(filePath);
  return `data:video/mp4;base64,${buf.toString("base64")}`;
}

// Metadata for a chosen file: images carry a preview data URL, videos don't
// (they can be large — the renderer plays the result instead).
async function metaFor(p) {
  const name = path.basename(p);
  if (video.isVideoPath(p)) return { path: p, name, kind: "video" };
  return { path: p, name, kind: "image", dataURL: await toDataURL(p) };
}

// --- engine setup ----------------------------------------------------------

ipcMain.handle("engine:status", () => ({ installed: engine.isInstalled() }));

ipcMain.handle("engine:install", async () => {
  await engine.install((p) => win && win.webContents.send("engine:progress", p));
  return { installed: true };
});

// --- input: file dialog or dropped bytes -----------------------------------

ipcMain.handle("input:pick", async () => {
  const res = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [
      { name: "Images and video", extensions: ["jpg", "jpeg", "png", "webp", "bmp", "tiff", ...video.VIDEO_EXTS] },
      { name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "bmp", "tiff"] },
      { name: "Video", extensions: video.VIDEO_EXTS },
    ],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return metaFor(res.filePaths[0]);
});

// Preferred drop path: the renderer resolves the real file path via webUtils and
// hands it straight here, so large videos aren't copied through IPC as bytes.
ipcMain.handle("input:fromPath", async (_e, { path: p }) => metaFor(p));

ipcMain.handle("input:fromBytes", async (_e, { bytes, name }) => {
  await fs.mkdir(tmpDir(), { recursive: true });
  const id = crypto.randomUUID();
  const ext = path.extname(name) || ".png";
  const p = path.join(tmpDir(), `in-${id}${ext}`);
  await fs.writeFile(p, Buffer.from(bytes));
  return metaFor(p);
});

// --- run -------------------------------------------------------------------

ipcMain.handle("upscale:run", async (_e, { inputPath, quality }) => {
  await fs.mkdir(tmpDir(), { recursive: true });
  const id = crypto.randomUUID();

  // ---- video: ffmpeg Lanczos + unsharp, keeps audio ----
  if (video.isVideoPath(inputPath)) {
    if (!video.hasFfmpeg()) {
      throw new Error("Video needs ffmpeg. Install it with Homebrew: brew install ffmpeg, then reopen Upscalify.");
    }
    const outPath = path.join(tmpDir(), `out-${id}.mp4`);
    const r = await video.run(inputPath, outPath, quality, (p) =>
      win && win.webContents.send("upscale:progress", p),
    );
    return {
      outputPath: outPath,
      kind: "video",
      dataURL: await toVideoDataURL(outPath),
      scale: r.scale,
      model: r.model,
      elapsedMs: r.elapsedMs,
    };
  }

  // ---- image: Real-ESRGAN ----
  const install = engine.findInstall();
  if (!install) throw new Error("Engine is not installed.");
  const outPath = path.join(tmpDir(), `out-${id}.png`);
  const started = Date.now();
  const { scale, model } = await run(install, inputPath, outPath, quality, (frac) =>
    win && win.webContents.send("upscale:progress", { fraction: frac }),
  );

  return {
    outputPath: outPath,
    kind: "image",
    dataURL: await toDataURL(outPath),
    scale,
    model,
    elapsedMs: Date.now() - started,
  };
});

// --- save ------------------------------------------------------------------

ipcMain.handle("output:save", async (_e, { outputPath, suggestedName, kind }) => {
  const isVideo = kind === "video" || outputPath.toLowerCase().endsWith(".mp4");
  const res = await dialog.showSaveDialog(win, {
    defaultPath: suggestedName || (isVideo ? "upscaled.mp4" : "upscaled.png"),
    filters: isVideo
      ? [{ name: "MP4 video", extensions: ["mp4"] }]
      : [{ name: "PNG image", extensions: ["png"] }],
  });
  if (res.canceled || !res.filePath) return { saved: false };
  await fs.copyFile(outputPath, res.filePath);
  return { saved: true, path: res.filePath };
});
