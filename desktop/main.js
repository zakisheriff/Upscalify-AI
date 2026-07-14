"use strict";

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const engine = require("./engine");
const { run } = require("./upscale");

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
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "bmp", "tiff"] }],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  const p = res.filePaths[0];
  return { path: p, name: path.basename(p), dataURL: await toDataURL(p) };
});

ipcMain.handle("input:fromBytes", async (_e, { bytes, name }) => {
  await fs.mkdir(tmpDir(), { recursive: true });
  const id = crypto.randomUUID();
  const ext = path.extname(name) || ".png";
  const p = path.join(tmpDir(), `in-${id}${ext}`);
  await fs.writeFile(p, Buffer.from(bytes));
  return { path: p, name, dataURL: await toDataURL(p) };
});

// --- run -------------------------------------------------------------------

ipcMain.handle("upscale:run", async (_e, { inputPath, quality }) => {
  const install = engine.findInstall();
  if (!install) throw new Error("Engine is not installed.");
  await fs.mkdir(tmpDir(), { recursive: true });
  const outPath = path.join(tmpDir(), `out-${crypto.randomUUID()}.png`);

  const started = Date.now();
  const { scale, model } = await run(install, inputPath, outPath, quality, (frac) =>
    win && win.webContents.send("upscale:progress", { fraction: frac }),
  );

  return {
    outputPath: outPath,
    dataURL: await toDataURL(outPath),
    scale,
    model,
    elapsedMs: Date.now() - started,
  };
});

// --- save ------------------------------------------------------------------

ipcMain.handle("output:save", async (_e, { outputPath, suggestedName }) => {
  const res = await dialog.showSaveDialog(win, {
    defaultPath: suggestedName || "upscaled.png",
    filters: [{ name: "PNG image", extensions: ["png"] }],
  });
  if (res.canceled || !res.filePath) return { saved: false };
  await fs.copyFile(outputPath, res.filePath);
  return { saved: true, path: res.filePath };
});
