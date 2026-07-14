"use strict";

const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("api", {
  engineStatus: () => ipcRenderer.invoke("engine:status"),
  installEngine: () => ipcRenderer.invoke("engine:install"),
  onEngineProgress: (cb) => ipcRenderer.on("engine:progress", (_e, d) => cb(d)),

  pickInput: () => ipcRenderer.invoke("input:pick"),
  // Resolve a dropped File to its on-disk path (no byte copy — good for video).
  pathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch {
      return null;
    }
  },
  inputFromPath: (filePath) => ipcRenderer.invoke("input:fromPath", { path: filePath }),
  inputFromBytes: (bytes, name) => ipcRenderer.invoke("input:fromBytes", { bytes, name }),

  upscale: (inputPath, quality) => ipcRenderer.invoke("upscale:run", { inputPath, quality }),
  onUpscaleProgress: (cb) => ipcRenderer.on("upscale:progress", (_e, d) => cb(d)),

  save: (outputPath, suggestedName, kind) =>
    ipcRenderer.invoke("output:save", { outputPath, suggestedName, kind }),
});
