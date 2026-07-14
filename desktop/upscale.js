"use strict";

// Runs the real Real-ESRGAN engine on a single image and reports progress.
// Quality maps to a model, by outcome (never exposed by model name). Both are
// 4× models; "fast" uses the lighter lite model, "high" the full standard one.
//   fast → upscayl-lite-4x      (light, quick)
//   high → upscayl-standard-4x  (full reconstruction, = Real-ESRGAN x4plus)

const { spawn } = require("node:child_process");
const fs = require("node:fs");

function modelFor(quality) {
  return quality === "high"
    ? { name: "upscayl-standard-4x", scale: 4 }
    : { name: "upscayl-lite-4x", scale: 4 };
}

function run(engine, input, output, quality, onPercent) {
  const { name, scale } = modelFor(quality);
  const args = [
    "-i", input,
    "-o", output,
    "-n", name,
    "-m", engine.models,
    "-s", String(scale),
    "-f", "png",
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(engine.bin, args);
    let tail = "";
    const onData = (buf) => {
      const text = buf.toString();
      tail = (tail + text).slice(-2000);
      // The engine prints tile progress as bare percentages ("12.50%").
      const matches = text.match(/(\d+(?:\.\d+)?)%/g);
      if (matches && onPercent) {
        const last = parseFloat(matches[matches.length - 1]);
        // The engine reports 100% when all tiles are *submitted*, but GPU compute
        // and the PNG write still follow — so cap at 0.99 and let process-close
        // signal the real finish. Avoids a "stuck at 100%" state.
        if (last >= 0 && last <= 100) onPercent(Math.min(0.99, last / 100));
      }
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(output)) resolve({ scale, model: name });
      else reject(new Error(`Engine exited (${code}). ${tail.split("\n").slice(-2).join(" ").trim()}`));
    });
  });
}

module.exports = { run, modelFor };
