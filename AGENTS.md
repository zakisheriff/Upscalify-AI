# Upscalify AI — operating context for agents

Read this before touching the code. It describes what exists, what is stubbed,
and what is deliberately deferred, so you can work without re-deriving the
project from scratch. `CLAUDE.md` holds the same context with more of the "why".

## What this is

An image and video upscaler from The Atom. Upload a low-res file, reconstruct a
sharper higher-res version, compare before/after, download. v1 runs entirely on
the local machine. Next.js (App Router) + TypeScript, vanilla CSS. The UI is a
single minimal light page — no navbar, hero, sections, or footer.

## The one seam that matters

`lib/upscale.ts` → `upscale(file, options)` is the only entry the frontend uses.
It hides that v1 posts to a local API route and polls job status. Do not let
UI code learn where inference runs. Server-side, `lib/inference/backend.ts` →
`getBackend(kind)` picks the backend; a cloud phase slots in here via
`INFERENCE_URL` with no change above it.

## File map

```
app/
  layout.tsx            fonts (Inter + Caveat, system-first), metadata, JSON-LD mount.
                        Imports BOTH globals.css and components.css — keep both.
  globals.css           design tokens (:root) + base — edit tokens here, not components
  components.css        all component styles, token-referenced
  page.tsx              the single page: title + <Studio /> + footnote. Nothing else.
  sitemap.ts, robots.ts SEO route handlers
  api/
    upscale/route.ts    POST file+quality -> {jobId,kind}; kicks off async backend run
    jobs/[id]/route.ts  GET real job status (stage, progress, dims, engine)
    result/[id]/route.ts GET reconstructed output (?download=1 forces attachment)
    source/[id]/route.ts GET original upload, for the before/after view
components/
  Studio.tsx            the whole tool: bar + pills + working + done/error states
  CompareView.tsx       draggable before/after; image + synced video; keyboard accessible
  StructuredData.tsx    JSON-LD (invisible; SEO/AEO)
lib/
  upscale.ts            client seam (the public interface)
  inference/
    types.ts            InferenceBackend + shared types
    backend.ts          backend selection (local fallback vs INFERENCE_URL)
    scale.ts            quality -> scale factor mapping (single source)
    local-image.ts      sharp fallback
    local-video.ts      ffmpeg fallback (real progress, audio preserved)
    remote-image.ts     model-server client (used when INFERENCE_URL set)
  jobs.ts               in-memory job registry (globalThis Map)
  storage.ts            filesystem storage under OS temp dir
  media.ts              accepted types, size limits, kind detection
  serve.ts              file response helper with content types
public/
  llms.txt              plain-language product description for AI answer engines
  og.svg                social card
```

## Built vs stubbed

- **Fully working**: image upscaling (sharp), video upscaling with preserved
  audio and real progress (ffmpeg), upload → progress → compare → download,
  before/after slider, error handling, all SEO/AEO files. Verified end-to-end
  against the running server.
- **Present but inactive by default**: the remote model-server client
  (`remote-image.ts`). It activates only when `INFERENCE_URL` is set. There is
  no Real-ESRGAN/SeedVR2 server bundled — the local fallback stands in for the
  models with the same interface and scale factors.

## Intentionally deferred (cloud phase)

- Hosting the inference layer remotely. The seam (`getBackend` / `INFERENCE_URL`)
  is ready; the model server and its NDJSON progress contract are not built.
- Persistent storage / a real job store (currently filesystem + in-memory Map).
- Anything auth, billing, queue, or multi-user. Out of scope for v1 by design.

## Known constraints

- Video needs `ffmpeg` + `ffprobe` on PATH. `sharp` is bundled and marked a
  server-external package in `next.config.ts`.
- Job state lives in the running process; restarting the server drops jobs.
- Image limit 30 MB, video 500 MB (`lib/media.ts`).
- Local fallback clamps output pixels to keep single-machine processing sane.

## House rules (enforced)

Keep it minimal: one light page, white background, single blue accent, system/
Apple fonts (Inter fallback). Sentence case; no emojis or decorative arrows;
icons only when functional. Body/inputs ≥16px. Reduced motion respected. Commit
+ push after every meaningful change with lowercase conventional messages and no
attribution lines.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
