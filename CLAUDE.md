# Upscalify AI — project context

Upscalify AI is an image and video upscaler from The Atom (upscalify.theatom.lk).
It takes a low-resolution or low-quality file and reconstructs a sharper,
higher-resolution version — rebuilding real detail rather than smoothing the
blur. Built by Zaki.

This document explains the current state and the decisions behind it. It is not
a changelog; it should let you understand where the project stands without
re-reading the code. See `AGENTS.md` for the same context framed for an agent
picking the project up cold (file map, built vs stubbed, deferred work).

## Product shape

The marketing surface and the tool are the same page. You scroll from the
reconstruction thesis (the hero) straight into uploading a real file. v1 does
one thing well: upload → reconstruct with real progress → compare before/after →
download. No auth, no billing, no queue, no cloud storage.

Two quality paths are exposed by outcome, never by model name:
- **Fast** — roughly 2×, returns in seconds.
- **High quality** — roughly 4×, slower, for rough sources.

## The `upscale()` seam (the load-bearing decision)

Everything the frontend does goes through one function: `upscale(file, options)`
in `lib/upscale.ts`. Nothing above it knows where inference runs. It posts to a
Next.js API route and polls real job status. Moving inference to the cloud later
is a change *behind* this function; callers do not change. This is the whole
reason the product can migrate the inference layer without touching the UI.

Server-side there is a second abstraction, `InferenceBackend` (`lib/inference/
types.ts`), selected in `lib/inference/backend.ts`:

- If `INFERENCE_URL` is set, calls route to a model server (Real-ESRGAN for the
  fast path, SeedVR2 for the high-quality path) via `remote-image.ts`. This is
  the exact seam a cloud deployment reuses.
- Otherwise a **deterministic local fallback** runs so the product works with
  nothing else installed:
  - Images → `local-image.ts` (sharp: Lanczos resample + denoise + unsharp).
  - Video → `local-video.ts` (ffmpeg: single deterministic filtergraph so
    motion stays temporally stable; original audio copied through; real
    progress parsed from ffmpeg `-progress`).

Swapping the local fallback for the model server is a change to `backend.ts` and
the `remote-*` client only. `scale.ts` is the single place quality maps to a
concrete scale factor.

## Local-vs-cloud boundary (current state)

v1 runs **entirely locally**. Cloud deployment of the inference layer is
deliberately out of scope and deferred. The code is structured so that phase is
an implementation change behind `getBackend()` / `INFERENCE_URL`, not a rewrite.

Storage is filesystem-only, under the OS temp dir (`lib/storage.ts`), keyed by
job id. The job registry (`lib/jobs.ts`) is an in-memory `Map` on `globalThis` —
appropriate for a single local user, replaced by a real store in the cloud phase.

## Design system

Concept: *latent detail resolving out of degradation* — a cool, muddy "before"
vs a warm, clear "after". That tension drives everything.

- Tokens live once in `app/globals.css` (`:root`), referenced everywhere.
  Component styles in `app/components.css`. Vanilla CSS only — no Tailwind, no
  CSS-in-JS. No magic values in components.
- Palette: graphite base (`--ink`), amber "clarity" accent (`--focus`). Chosen
  against the three AI defaults (not cream/terracotta, not acid-green-on-black,
  not broadsheet).
- Type: **Fraunces** (variable, optical-size axis — headlines literally sharpen
  in the hero via its `opsz`/`SOFT` axes), **IBM Plex Sans** body, **IBM Plex
  Mono** for real figures (resolutions, %, sizes).
- Signature: the **reconstruction front** — a sweeping seam with blocky/cool on
  one side and sharp/warm on the other. One idea, three uses: ambient in the
  hero (`ReconstructionFront.tsx`), interactive in the compare view
  (`CompareView.tsx`), and a quiet scroll echo (`Reveal.tsx`).

## Animation division of labor (strict)

Never let GSAP and Framer Motion animate the same property on the same element.
- **GSAP** owns: hero load sequence (`Hero.tsx`), the reconstruction-front
  canvas sweep, and scroll-triggered reveals (`Reveal.tsx`).
- **Framer Motion** owns: studio panel mount/unmount transitions (`Studio.tsx`).
These never touch the same element, so there is no transform conflict.

## Conventions

- Sentence case throughout. No emojis, no decorative icons or arrows, no
  eyebrows/labels above headings, no bright gradients, prose over lists.
- All text inputs are ≥16px (prevents iOS Safari zoom).
- Semantic HTML, landmarks, alt text, visible focus, reduced-motion respected.
- SEO/AEO/GEO: per-page metadata + OG/Twitter in `layout.tsx`/page metadata,
  JSON-LD in `components/StructuredData.tsx` (WebApplication + Organization +
  FAQPage), `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`.
- Commits: conventional prefixes, lowercase, present tense, no attribution
  lines. Commit and push after every meaningful change.

## Running

`npm run dev` (Turbopack). Needs `sharp` (bundled) for images and `ffmpeg` on
PATH for video. Set `INFERENCE_URL` to route to a model server instead of the
local fallback.
