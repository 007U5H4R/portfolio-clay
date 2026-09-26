# Illustration provenance (Design.md §6.2; S20 — EVAL-021, EVAL-013)

One row per manifest id in `manifest.ts`. `sha256` is recorded for the two files that must stay
byte-identical to their disk source (`hero-desk` / the shipped hero poster, E-18); it is left as
"—" for entries where byte-exactness isn't a contract (the re-encoded scenes and the reference
sheet are derived renditions, not byte-exact copies). Spend after Stage 4 was approved by Tushar at the hero gate: 4 credits for two outpaints (`hero-banner`,
`scene-contact`; EXE-15, EXE-19). TKT-105 (2026-09-26): Tushar approved up to 8 more credits to clean the banner's text; 4.25 were spent. No further spend is approved beyond what Tushar approves per ask — on 2026-09-26 he approved Higgsfield spend for the M-009 follow-ups (`tushky`, TKT-104).

| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on | sha256 |
|---|---|---|---|---|---|---|---|---|---|
| `hero-desk` | `hero-desk.webp` | poster | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar at a warm desk — laptop, notebook, books, plant, lamp, pinned notes reading the six-stage process | 2026-09-23 | 1 | `/` (the clip's `poster` attribute only since TKT-93) | `f1eb1605d725eba8db2bff344af78d1d0eddabfce976d5f809c4767a4c777b14` |
| `hero-banner` | `hero-banner.webp` | scene | `outpaint` (Higgsfield) | input media `fc45d649-4038-4558-bd41-b659db56a9d3` (= `hero-poster.png`); job `6d94caf5-1a14-4151-9864-050b6a193615` | 21:9 outpaint of `hero-desk` to 3168×1344 for the full-bleed home banner (EXE-15, Dev-21/Dev-23); the clip registers on it at scale 1.912, x 362, y 6. **TKT-105:** all painted text removed except the book titles ("Systems" → "System Thinking"). `gpt_image_2_5` edit job `f32bd259-63f4-499f-bfd2-5f38698e0389` (input media `aa87a509-8281-41cd-b2eb-d8a2ecf90be8`) was composited only inside the text regions; no other pixel changed | 2026-09-25 · 2026-09-26 (TKT-105) | 2 + 4.25 | `/` | — |
| `hero-clip` | `hero-animation.webm`/`.mp4` (public) | clip | `Seedance 2.5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Single `generate_video`, 16:9 source, clip A trimmed to 2.5 s — Tushar thinking at his desk and turning a pen, plays once | 2026-09-24 | 1 | `/` | — |
| `scene-work` | `scene-work.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar pinning a product sketch to a corkboard covered in wireframes, flow diagrams, sticky notes and small landscape photos | 2026-09-23 | 1 | `/work`, `/` (decorative polaroid crop) | — |
| `scene-casestudy` | `scene-casestudy.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug, a mug and a stack of books | 2026-09-23 | 1 | `/work/[slug]` | — |
| `scene-about` | `scene-about.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar from behind on a hillside path at dawn, coffee and notebook, pine forest towards a snow-capped mountain horizon | 2026-09-23 | 1 | `/about`, `/` (decorative polaroid crop) | — |
| `scene-thinking` | `scene-thinking.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar writing in an open notebook at a wooden desk by a window — lamp, tea, stacked books, plant, sketched flow diagram | 2026-09-23 | 1 | `/thinking`, `/thinking/[slug]` | — |
| `scene-playground` | `scene-playground.jpg` | scene | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar at a tinkering workbench holding a small cardboard prototype with wires — breadboard, tape, scissors, paper planes, tablet sketch | 2026-09-23 | 1 | `/playground`, `/` (decorative polaroid crop) | — |
| `scene-contact` | `scene-contact.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 16:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `e3cf1013-0cde-4db5-9d83-ea7c77c63779` (= `scene-contact.png`), job `9a13a67b-cc70-436e-bbad-9be192327f3b` | Tushar standing by a window next to a tall leafy plant, terracotta coffee mug, other hand raised in a friendly wave | 2026-09-23 (scene) · 2026-09-25 (outpaint) | 1 + 2 | `/contact` | — |
| `character-sheet-b` | `reference/character-sheet-b.jpg` | reference | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Locked character reference sheet (Variant B) — front, three-quarter and profile views | 2026-09-23 | 1 | (never rendered — Stage-8 drift check only) | — |
| `tushky` | `tushky-bandana.webp` (public only; v2, TKT-104 r2 — supersedes `tushky.webp`, removed) | mascot | `gpt_image_2_5` (Higgsfield; quality medium, 1k, transparent background) | reference media = job `7312a2c0-ea7f-4d7e-8048-14b96542e76c` (the round-1 navy-bandana retriever alternate); job `20288256-cee5-4dcb-aa02-73a6e8be3647` (`tushky-bandana-a.png`, accepted first attempt — "Tushky" spelled correctly on the bandana). v1 history: job `6932218c-ea37-4685-bfbb-ce4b34065a76` (reference `902a0281-…`, crop of `hero-banner.webp`), retired | Tushky v2 (Dev-62) — a friendly golden retriever, head and shoulders, in a navy bandana lettered "Tushky" with a cream paw print, warm realistic-illustrated, no badge; 1024×1024 transparent PNG trimmed to the dog (830×1008) with `sharp` → lanczos3 280 px tall (231×280) → `webp({ quality: 80, alphaQuality: 85, effort: 6 })`, 25,756 bytes | 2026-09-26 (TKT-104 r2) | 0.5 (v1: 0.5 + 1.0 drafts, TKT-104 r1; Tushar approved the spend 2026-09-26) | the Ask Tushky drawer empty state (every route; lazy chunk only) | `ba71c8822ab65f172bec3adf883256cd039b4eeca7830d0e355634351ab88d33` |
| `tushky-avatar` | `tushky-avatar.webp` (public only) | mascot | `gpt_image_2_5` (Higgsfield; derived crop) | job `20288256-cee5-4dcb-aa02-73a6e8be3647` (same source as `tushky` v2) | Tushky's head, for the chat-bubble / chat-header avatar (Dev-62); `sharp` extract 640×640 at (190, 60) from the 1024 PNG → lanczos3 64 px → `webp({ quality: 82, alphaQuality: 90, effort: 6 })`, 2,606 bytes | 2026-09-26 (TKT-104 r2) | 0 (a crop of the `tushky` v2 generation) | Ask Tushky drawer chat bubbles + chat-mode header (lazy chunk only; rendered with alt="") | `a68ded28f7f0053349fea16be1ee775df2bee627db83941c624dbcf39a2cf167` |

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

### TKT-105 · text-free banner

Tushar (2026-09-26): *"only leave the book titles … instead of Systems write System Thinking. Remove all other texts."*
The outpaint master was **edited in place, not regenerated**. That keeps the clip registration (scale 1.912, x 362, y 6)
pixel-exact.

1. One `gpt_image_2_5` edit (high quality, 4k, 21:9, **4.25 credits**, job `f32bd259-63f4-499f-bfd2-5f38698e0389`) of the whole
   master, prompted to remove every piece of lettering and retitle the third spine. The output is 3840×1648 and the edit is not pixel-aligned,
   so it is used only as a source of patches.
2. For each text region, the edit was resized to 3168×1344 and aligned on that region's surrounding ring (integer shift, dx ≤ 3,
   dy ≤ 23). It was tone-matched to the original's low frequencies, then composited through a feathered mask of the text strokes. The mask is a box for the spine.
3. For the corkboard notes and papers, and for two small pseudo-lettering marks on the desk (an upside-down "ASI" on a book
   cover and a scribble row on a sketch), the ink was painted out directly on the original. Each stroke was filled from its
   own paper colour, so no generated pixels were used there.
4. `pixels changed outside the edit mask = 0`. Master: `Portfolio-illustration/animation/export/banner/hero-banner-outpaint-a1-clean.png`
   (sha256 `0dd6d623…6781d2`).

The renditions were re-encoded with the same settings as before. `hero-banner.webp` (`webp q86 effort 6 smartSubsample`) is **304,540 bytes**,
sha256 `6d757880d62bb309e5f1ae6cb6cec0fbd514724d33ecb3c0f34c33b116a98adf` (was 371,142). `hero-banner-mobile.webp` (same `extract`
box `640,0,1824×1344`) is **170,202 bytes**, sha256 `814d0b9b26d17edde1f0c242a1caf863c81c4bdbd48f1f135c6a9d6507bf8fc1` (was 210,964).

**Clip mask carve.** The clip (from `hero-desk`, which still carries its text) shows through the mask over parts of "The
journey. I enjoy.", the "Bigger horizons" caption, the laptop lid and the white mug. With the old mask, the clip therefore
painted fragments of the removed text back over the clean banner. `hero-clip-mask.png` now has feathered holes (alpha × (1 −
dilated text mask)) at those spots. Pixels where the clip actually moves (face, hand, pen, dog; frame range > 45/255) are excluded from the holes.
The video and poster files are unchanged. Result: 17,196 of 875,520 alpha values changed. The file was re-encoded exactly as before
(`sharp png({ palette: true, compressionLevel: 9, effort: 10 })`, which reproduces the old file byte-for-byte from the old alpha) and is **44,202 bytes**, sha256
`0af8d0ae0754b94956a91206bc0c7db756b82dc1a0388dbca2f7f887ab02b790` (was 38,998). The box and registration are unchanged.

## Manual per-asset checklist (Stage 8)

Filed separately at `evals/results/eval-021-<sha>.md` once Stage 8 runs: confirms per asset that it
depicts no metric, logo, product UI or claim (S20).

## Shared collage pieces — `/about` product journey (public, decorative — TKT-100)

Cropped (PIL, alpha kept, near-transparent noise < 16 zeroed) from the two transparent Higgsfield
sprite sheets generated 2026-09-26 (Tushar approved the spend: "use higgsfield to generate the
image, I will topup if required"; `gpt_image_2_5`, medium, 1k, 0.5 credits each, style reference
media `09b0c111-e66d-4ddf-a1bb-f0375f907d2c` = `hero-desk`; no new spend by this ticket). Shipped from
`public/media/illustrations/` as WebP (alpha, q82 unless noted); decorative only (`alt=""` inside the
`aria-hidden` `data-decor="collage"` layer of `components/timeline/JourneyCollage.tsx`), so no manifest
entry. Names follow the shared `collage-<piece>.webp` rule; the four files marked *TKT-102* are
byte-identical copies of that branch's exports so they collapse at merge (if TKT-102 merges first,
drop the duplicate rows here).

| file | sprite sheet · job id | piece | size | used on |
|---|---|---|---|---|
| `collage-scrap-sage.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn sage scrap (*TKT-102*) | 280×290 | `/about` |
| `collage-scrap-kraft.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn kraft scrap (*TKT-102*) | 280×327 | `/about` |
| `collage-scrap-rust.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn rust scrap | 280×282 | `/about` |
| `collage-scrap-grid.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn grid-paper scrap | 280×313 | `/about` |
| `collage-stamp.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | leaf postage stamp (no text) | 180×224 | `/about` |
| `collage-postmark.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | round postmark + wavy cancellation (no text) | 220×142 | `/about` |
| `collage-leaf-1.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | leaf sprig (*TKT-102*) | 120×366 | `/about` |
| `collage-leaf-2.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | second leaf sprig | 150×390 | `/about` |
| `collage-fern.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | fern (*TKT-102*) | 120×303 | `/about` |
| `collage-babys-breath-1.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | baby's-breath sprig (q44 to stay ≈ 26 kB) | 170×416 | `/about` |
| `collage-wildflower.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | golden wildflower | 120×420 | `/about` |

## Shared collage pieces (public, decorative — TKT-102)

Cropped (PIL, alpha kept) from the two transparent Higgsfield sprite sheets generated 2026-09-26
(Tushar approved the spend: "use higgsfield to generate the image, I will topup if required";
`gpt_image_2_5`, medium, 1k, 0.5 credits each, style reference media
`09b0c111-e66d-4ddf-a1bb-f0375f907d2c` = `hero-desk`). Shipped from `public/media/illustrations/`
as WebP (alpha); decorative only (`alt=""` inside an `aria-hidden` collage), so no manifest entry.
File names follow the shared `collage-<piece>.webp` rule so sibling branches' copies dedupe at merge.

| file | sprite sheet · job id | piece | used on |
|---|---|---|---|
| `collage-scrap-sage.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn sage scrap | `/certifications` |
| `collage-scrap-kraft.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | torn kraft scrap | `/certifications` |
| `collage-washi-blue.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | blue washi tape | `/certifications` (year labels) |
| `collage-washi-yellow.webp` | collage-paper · `6eab8569-c875-472c-ad3f-d217666fa120` | yellow washi tape | `/certifications` (year labels) |
| `collage-leaf-1.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | leaf sprig | `/certifications` |
| `collage-fern.webp` | collage-botanical · `8fddab59-5a19-4f49-8234-0190f4b40eb6` | fern | `/certifications` |
