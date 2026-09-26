# Illustration provenance (Design.md §6.2; S20 — EVAL-021, EVAL-013)

One row per manifest id in `manifest.ts`. `sha256` is recorded for the two files that must stay
byte-identical to their disk source (`hero-desk` / the shipped hero poster, E-18); it is left as
"—" for entries where byte-exactness isn't a contract (the re-encoded scenes and the reference
sheet are derived renditions, not byte-exact copies). Spend after Stage 4 was approved by Tushar at the hero gate: 4 credits for two outpaints (`hero-banner`,
`scene-contact`; EXE-15, EXE-19). No further spend is approved.

| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on | sha256 |
|---|---|---|---|---|---|---|---|---|---|
| `hero-desk` | `hero-desk.webp` | poster | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar at a warm desk — laptop, notebook, books, plant, lamp, pinned notes reading the six-stage process | 2026-09-23 | 1 | `/` (the clip's `poster` attribute only since TKT-93) | `f1eb1605d725eba8db2bff344af78d1d0eddabfce976d5f809c4767a4c777b14` |
| `hero-banner` | `hero-banner.webp` | scene | `outpaint` (Higgsfield) | input media `fc45d649-4038-4558-bd41-b659db56a9d3` (= `hero-poster.png`); job `6d94caf5-1a14-4151-9864-050b6a193615` | 21:9 outpaint of `hero-desk` to 3168×1344 for the full-bleed home banner (EXE-15, Dev-21/Dev-23); the clip registers on it at scale 1.912, x 362, y 6 | 2026-09-25 | 2 | `/` | — |
| `hero-clip` | `hero-animation.webm`/`.mp4` (public) | clip | `Seedance 2.5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Single `generate_video`, 16:9 source, clip A trimmed to 2.5 s — Tushar thinking at his desk and turning a pen, plays once | 2026-09-24 | 1 | `/` | — |
| `scene-work` | `scene-work.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar pinning a product sketch to a corkboard covered in wireframes, flow diagrams, sticky notes and small landscape photos | 2026-09-23 | 1 | `/work`, `/` (decorative polaroid crop) | — |
| `scene-casestudy` | `scene-casestudy.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug, a mug and a stack of books | 2026-09-23 | 1 | `/work/[slug]` | — |
| `scene-about` | `scene-about.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar from behind on a hillside path at dawn, coffee and notebook, pine forest towards a snow-capped mountain horizon | 2026-09-23 | 1 | `/about`, `/` (decorative polaroid crop) | — |
| `scene-thinking` | `scene-thinking.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar writing in an open notebook at a wooden desk by a window — lamp, tea, stacked books, plant, sketched flow diagram | 2026-09-23 | 1 | `/thinking`, `/thinking/[slug]` | — |
| `scene-playground` | `scene-playground.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar at a tinkering workbench holding a small cardboard prototype with wires — breadboard, tape, scissors, paper planes, tablet sketch | 2026-09-23 | 1 | `/playground`, `/` (decorative polaroid crop) | — |
| `scene-contact` | `scene-contact.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 16:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `e3cf1013-0cde-4db5-9d83-ea7c77c63779` (= `scene-contact.png`), job `9a13a67b-cc70-436e-bbad-9be192327f3b` | Tushar standing by a window next to a tall leafy plant, terracotta coffee mug, other hand raised in a friendly wave | 2026-09-23 (scene) · 2026-09-25 (outpaint) | 1 + 2 | `/contact` | — |
| `character-sheet-b` | `reference/character-sheet-b.jpg` | reference | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Locked character reference sheet (Variant B) — front, three-quarter and profile views | 2026-09-23 | 1 | (never rendered — Stage-8 drift check only) | — |

## Re-encoding record (S73.01)

Scenes were re-encoded from the PNG masters in
`/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/illustrations/scenes/` with `sharp`
(`jpeg({ quality: 82, mozjpeg: true })`, long edge 2048, no quality step-down needed — all six
landed under the 600 KB cap on the first pass):

| file | quality | bytes | dimensions |
|---|---|---|---|
| `scene-work.jpg` | 82 | 300,938 | 2048×1360 |
| `scene-casestudy.jpg` | 82 | 437,320 | 2048×1360 |
| `scene-about.jpg` | 82 | 350,979 | 2048×1360 |
| `scene-thinking.jpg` | 82 | 516,249 | 2048×1529 |
| `scene-playground.jpg` | 82 | 404,203 | 2048×1360 |
| `scene-contact.jpg` | 82 | 234,356 | 2048×1143 (16:9 outpaint, EXE-19) |

The reference sheet was re-encoded from `character-ref-LOCKED.png` at quality 90 (no step-down
needed, 536,725 bytes, well under the 1.5 MB cap, 2688×1520).

### TKT-93 · hero banner + clip mask

`hero-banner.webp` was encoded with `sharp` from the outpaint master
(`Portfolio-illustration/animation/export/banner/hero-banner-outpaint-a1.png`, 3168×1344 RGBA, fully
opaque → alpha dropped): `webp({ quality: 86, effort: 6, smartSubsample: true })`, long edge 3168,
**371,142 bytes** (cap 400 kB; q86 was the first quality tried that met it). The clip's feathered
alpha mask `public/media/illustrations/hero-clip-mask.png` (1280×684, **38,998 bytes**, palette PNG)
was built from the prototype's luminance mask (`/Volumes/E Drive/Dev/.scratch/m009/clip-mask-1280.png`,
white = show clip) by writing the luminance into the alpha channel over black — CSS `mask-image`
reads alpha (`mask-mode: match-source`), and the `-webkit-` form is alpha-only. It is not an
illustration (no manifest entry): it carries no picture, only the clip's shape.

### TKT-92 round 2 · narrow-screen banner rendition

`public/media/illustrations/hero-banner-mobile.webp` is a second rendition of `hero-banner` (like the
clip's `.mp4` is of `hero-clip`, so it has no manifest entry of its own): a crop of the same outpaint
master (`hero-banner-outpaint-a1.png`), `removeAlpha().extract({ left: 640, top: 0, width: 1824, height:
1344 })` → `webp({ quality: 86, effort: 6, smartSubsample: true })`, 1824×1344, **210,964 bytes**, sha256
`31e30331c5fb8919d5d68dc1a86b9ccb7078d7dd77650f2b8ca47307d62a1703`. Only the region the < 768 px 4:3
banner box shows (x 0.2072–0.7728 of the scene) plus ≈ 0.5 % a side, so phones download the visible part
only (`<picture>` art direction in `components/paper/SceneBanner.tsx`; placement in `components/hero/Hero.tsx`).
Same pixels, same alt (the `<img>` element is unchanged); no new picture content.

## Manual per-asset checklist (Stage 8)

Filed separately at `evals/results/eval-021-<sha>.md` once Stage 8 runs: confirms per asset that it
depicts no metric, logo, product UI or claim (S20).

### TKT-101 · `/work` Experience vignettes (decorative, `public/` only, no manifest entry)

Tushar approved the Higgsfield spend on 2026-09-26 ("use higgsfield to generate the image, I will
topup if required"). The orchestrator generated the art: `gpt_image_2_5`, medium quality, 1k,
transparent background, 0.5 credits each. Style reference media: `09b0c111-e66d-4ddf-a1bb-f0375f907d2c`
(= `hero-desk`). The masters are in `/Volumes/E Drive/Dev/.scratch/m009/hf/` (PROVENANCE.md). The
art is unbranded and has no text or logos; the real logos are composited separately (see
`content/media/logos/README.md`).

Each file is a generic building or campus drawn behind a taped logo card on the `/work` timelines.
They render inside the collage object, which is `aria-hidden`, with `alt=""`. They are lazy-loaded
and hidden below 768 px. They are served from `public/media/illustrations/` as plain `<img>` and are
not `content/` scenes, so they have no `manifest.ts` entry, like `hero-clip-mask.png`.

Encoding: PIL crop to the alpha bounding box (alpha > 24), Lanczos resize to 480 px wide (about 2×
display), then WebP with alpha (`method 6`, `alpha_quality 80`) at the first quality ≤ 40 kB.

| file | job id | master | quality | bytes | size | sha256 (first 16) |
|---|---|---|---|---|---|---|
| `office-amex.webp` | `dfd9f20a-54bd-4023-b578-2b6f0da2b8fc` | `office-amex.png` 1168×880 | 64 | 39,498 | 480×384 | `bc13f2a8204b5b6d` |
| `office-shellkode.webp` | `34def895-aa59-4f00-8ae4-5e51229170f5` | `office-shellkode.png` 1168×880 | 48 | 37,886 | 480×357 | `9eb346c3090f4423` |
| `office-quantiphi.webp` | `6cbf78cc-2658-4753-8f7e-a2c6af875ba6` | `office-quantiphi.png` 1168×880 | 48 | 37,134 | 480×361 | `bd0465379e3c7038` |
| `office-godrej.webp` | `73bed5ea-4def-4195-9316-1aa9e69df424` | `office-godrej.png` 1168×880 | 56 | 38,114 | 480×346 | `b1a7861a5fa6b517` |
| `campus-nitc.webp` | `6243b593-3d37-4430-87e1-bef74efc1e76` | `campus-nitc.png` 1168×880 | 56 | 37,102 | 480×352 | `0e491e441b971785` |
| `campus-bit.webp` | `7c4ee5e5-8452-49a5-8f70-0a91d9fc165c` | `campus-bit.png` 1168×880 | 56 | 38,146 | 480×353 | `f6b31d67cf1125dc` |

The shared `collage-paper.png` and `collage-botanical.png` sprite sheets are **not** used on `/work`.
Neither of Tushar's two references has scraps or botanicals.
