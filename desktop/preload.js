"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  engineStatus: () => ipcRenderer.invoke("engine:status"),
  installEngine: () => ipcRenderer.invoke("engine:install"),
  onEngineProgress: (cb) => ipcRenderer.on("engine:progress", (_e, d) => cb(d)),

  pickInput: () => ipcRenderer.invoke("input:pick"),
  inputFromBytes: (bytes, name) => ipcRenderer.invoke("input:fromBytes", { bytes, name }),

  upscale: (inputPath, quality) => ipcRenderer.invoke("upscale:run", { inputPath, quality }),
  onUpscaleProgress: (cb) => ipcRenderer.on("upscale:progress", (_e, d) => cb(d)),

  save: (outputPath, suggestedName) => ipcRenderer.invoke("output:save", { outputPath, suggestedName }),
});
