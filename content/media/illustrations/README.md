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

## Manual per-asset checklist (Stage 8)

Filed separately at `evals/results/eval-021-<sha>.md` once Stage 8 runs: confirms per asset that it
depicts no metric, logo, product UI or claim (S20).
