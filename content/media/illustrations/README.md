# Illustration provenance (Design.md §6.2; S20 — EVAL-021, EVAL-013)

One row per manifest id in `manifest.ts`. `sha256` is recorded for the two files that must stay
byte-identical to their disk source (`hero-desk` / the shipped hero poster, E-18); it is left as
"—" for entries where byte-exactness isn't a contract (the re-encoded scenes and the reference
sheet are derived renditions, not byte-exact copies). Spend after Stage 4 was approved by Tushar at the hero gate: 4 credits for two outpaints (`hero-banner`,
`scene-contact`; EXE-15, EXE-19). TKT-105 (2026-09-26): Tushar approved up to 8 more credits to clean the banner's text; 4.25 were spent. No further spend is approved beyond what Tushar approves per ask — on 2026-09-26 he approved Higgsfield spend for the M-009 follow-ups (`tushky`, TKT-104).

`scene-contact`; EXE-15, EXE-19). TKT-107 (Tushar 2026-09-26, cap 16 credits): 16 credits for eight
outpaints — the six scenes to 21:9 plus one retry each for `scene-thinking` and `scene-about` (see
"TKT-107 · 21:9 scene outpaints" below). No further spend is approved.

| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on | sha256 |
|---|---|---|---|---|---|---|---|---|---|
| `hero-desk` | `hero-desk.webp` | poster | `gpt_image_2_5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Tushar at a warm desk — laptop, notebook, books, plant, lamp, pinned notes reading the six-stage process | 2026-09-23 | 1 | `/` (the clip's `poster` attribute only since TKT-93) | `f1eb1605d725eba8db2bff344af78d1d0eddabfce976d5f809c4767a4c777b14` |
| `hero-banner` | `hero-banner.webp` | scene | `outpaint` (Higgsfield) | input media `fc45d649-4038-4558-bd41-b659db56a9d3` (= `hero-poster.png`); job `6d94caf5-1a14-4151-9864-050b6a193615` | 21:9 outpaint of `hero-desk` to 3168×1344 for the full-bleed home banner (EXE-15, Dev-21/Dev-23); the clip registers on it at scale 1.912, x 362, y 6. **TKT-105:** all painted text removed except the book titles ("Systems" → "System Thinking"). `gpt_image_2_5` edit job `f32bd259-63f4-499f-bfd2-5f38698e0389` (input media `aa87a509-8281-41cd-b2eb-d8a2ecf90be8`) was composited only inside the text regions; no other pixel changed | 2026-09-25 · 2026-09-26 (TKT-105) | 2 + 4.25 | `/` | — |
| `hero-clip` | `hero-animation.webm`/`.mp4` (public) | clip | `Seedance 2.5` | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1` | Single `generate_video`, 16:9 source, clip A trimmed to 2.5 s — Tushar thinking at his desk and turning a pen, plays once | 2026-09-24 | 1 | `/` | — |
| `scene-work` | `scene-work.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `f0bd71db-95b3-4388-8ac0-f4138749b535` (= `scene-work.png`), job `1ca3b494-4789-4200-9c58-059aa89212f6` | Tushar pinning a product sketch to a corkboard covered in wireframes, flow diagrams, sticky notes and small landscape photos | 2026-09-23 (scene) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 | `/work`, `/` (decorative polaroid crop) | — |
| `scene-casestudy` | `scene-casestudy.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `0b9c5e58-dfba-4d10-b7b4-7565b15c723e` (= `scene-casestudy.png`), job `f89e058d-c570-4fd7-a433-6297e7888de0` | Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug, a mug and a stack of books | 2026-09-23 (scene) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 | `/work/[slug]` | — |
| `scene-about` | `scene-about.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `c0e1ecc2-5abd-4f52-9ec2-6d99d8b49927` (= `scene-about.png`), job `5b1a209f-e295-4bc7-a79e-bedd682918e0` (shipped); retry job `42bcf7df-9b6f-4894-83a7-85a5b659cd42` (input `82a6ba90-95f1-4549-9fda-79f54c954401`, rejected) | Tushar from behind on a hillside path at dawn, coffee and notebook, pine forest towards a snow-capped mountain horizon | 2026-09-23 (scene) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 + 2 | `/about`, `/` (decorative polaroid crop) | — |
| `scene-thinking` | `scene-thinking.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `2c430d2a-d5f2-48c6-aefa-96ab9d0aca7a` (= `scene-thinking.png` cropped to 3:2, 40 px off the top / 147 px off the bottom, resized to 2016×1344), job `30ccdf16-b23f-476e-9be2-f59dfb3780b1` (shipped); first job `d8f44314-d776-4a8d-8c87-afe88d00e2c4` (input `ceb84636-bfe5-4120-851f-cf15ee08de3b`, rejected — re-scaled the figure and redrew the desk) | Tushar writing in an open notebook at a wooden desk by a window — lamp, tea, stacked books, plant, sketched flow diagram | 2026-09-23 (scene) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 + 2 | `/thinking`, `/thinking/[slug]` | — |
| `scene-playground` | `scene-playground.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `01e522b7-2ed7-482e-8367-37817767a453` (= `scene-playground.png`), job `9da3348f-6d25-4bd4-904e-af5291a48271` | Tushar at a tinkering workbench holding a small cardboard prototype with wires — breadboard, tape, scissors, paper planes, tablet sketch | 2026-09-23 (scene) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 | `/playground`, `/` (decorative polaroid crop) | — |
| `scene-contact` | `scene-contact.jpg` | scene | `gpt_image_2_5` + `outpaint` (Higgsfield, 16:9 → 21:9) | `df5cca50-08c2-4588-9c0a-33f5fbd1a859`, `f49a95f5-6069-4131-85b7-c0283d000ee1`; outpaint input media `e3cf1013-0cde-4db5-9d83-ea7c77c63779` (= `scene-contact.png`), job `9a13a67b-cc70-436e-bbad-9be192327f3b`; 21:9 outpaint input media `a2aab3d2-e5e1-41f1-9bf2-06ab8ffef3a9` (= `scene-contact-wide-a1.png`, the 16:9 master), job `d01b4abe-a6c7-4ef1-9731-79345be1ef6c` | Tushar standing by a window next to a tall leafy plant, terracotta coffee mug, other hand raised in a friendly wave | 2026-09-23 (scene) · 2026-09-25 (16:9 outpaint) · 2026-09-26 (21:9 outpaint, TKT-107) | 1 + 2 + 2 | `/contact` | — |
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

### TKT-107 · 21:9 scene outpaints (Design.md §11 Dev-48)

Tushar 2026-09-26: "make the images of all the tabs same height and width similiar to Home tab". Each scene was
outpainted with Higgsfield `outpaint_image` (`aspect_ratio: "21:9"`, 3168×1344 — `hero-banner`'s size; no
prompt, the tool takes none), 2 credits per job, 16 in total (balance 56.4 → 38.9 across the session; the other
1.5 was a sibling agent's `GPT Image 2.5` spend, per `transactions`). Inputs were the PNG masters in
`Portfolio-illustration/illustrations/scenes/` (`scene-contact`: the 16:9 master `wide/scene-contact-wide-a1.png`;
`scene-thinking`: the 4:3 master cropped to 3:2 — 40 px off the top, 147 px off the bottom, sky/floor only, head and
notebook kept — so less of the frame is invented). Masters: `Portfolio-illustration/illustrations/scenes/wide21/`.
The subject stays whole in every result; `scene-about`'s outpaint keeps the figure left of centre (the landscape
extends right, towards the mountain) — its focal point is set accordingly. Checked at full size and 1440 wide: no
seams, no text, no logos. Rejected: `scene-thinking` a1 (figure re-scaled, desk redrawn) and `scene-about` a2
(landscape re-composed, sky over-saturated) — `…-rejected.png` in `wide21/`.

Encoded with `sharp` `jpeg({ quality: 82, mozjpeg: true })` (as S73.01) at 3168×1344; `scene-thinking` needed the
S73.01 step-down to q78 to stay under the 600 KB cap. next/image serves resized AVIF/WebP, so these source bytes are
not what a visitor downloads.

| file | quality | bytes | master sha256 |
|---|---|---|---|
| `scene-work.jpg` | 82 | 348,290 | `6976b2f0a8ab38291012219015e1a939da86338fb8a5ea946eee9a7dc13f7049` |
| `scene-casestudy.jpg` | 82 | 519,903 | `e6c4ede3a19dbc3d24505c433c7438cae768d151a067f82267dfd2f0203b2e48` |
| `scene-about.jpg` | 82 | 439,486 | `38acce451765a711bc8954d7b28a370a3bf1c328936044b965f091de77007b78` |
| `scene-thinking.jpg` | 78 | 567,594 | `3fab9288ae8e7b597c5b0fbdb770e2fee256c0bed3144da9d929c4e94ca7e3ad` |
| `scene-playground.jpg` | 82 | 478,845 | `2c8e402cff0316e79f6c642d2b2fe3b737e554f9ba29dc6d32955c57ca4a781c` |
| `scene-contact.jpg` | 82 | 394,061 | `ffd819d1f8c74a96a02f781d9a75f3fc45526fac3c8dd68b8fdb98406c863dc3` |

Narrow renditions (home's TKT-92r2 approach, no manifest entries — second renditions of the same scenes, same alt):
`public/media/illustrations/scene-<page>-mobile.webp`, each the region the < 768 4:3 box shows at that scene's focal
point (`components/paper/scene-opener-frames.ts`, one source for both the crop and the box) plus 16 px a side, full
height, `webp({ quality: 86, effort: 6, smartSubsample: true })`:

| file | crop (left, width) | bytes | sha256 |
|---|---|---|---|
| `scene-work-mobile.webp` | 830, 1824 | 267,700 | `4013a32cbd231c7d93b53d3a2f931ea3100d60517c29a2281618a8ed5435f75f` |
| `scene-casestudy-mobile.webp` | 672, 1824 | 366,098 | `2be275b0f09e8928187357455c5bd21059dc523e4573977b20ca5fa65a82ee4a` |
| `scene-about-mobile.webp` | 419, 1824 | 271,930 | `7b75b87d0ed73636e3447677b597e925cf137f08cdf01552bffb1350267971c7` |
| `scene-thinking-mobile.webp` | 672, 1824 | 441,878 | `1b1b38325ec5a2bf9b47e0de40c9c38181a695f52f46c1d5f9e6efc3c1b69ebf` |
| `scene-playground-mobile.webp` | 672, 1824 | 310,752 | `9668fff25c5949ae641e304b862b774efed103b5423953d5982e0babbd707ef4` |
| `scene-contact-mobile.webp` | 735, 1824 | 216,246 | `723764b444b2a5ae48d1b9fe280b589576c684d38619d4e187a6746d38e2856f` |

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

## Decorative collage pieces — home How I think (TKT-99; shipped as `public/media/illustrations/collage-hit-*.webp` so they don't collide with the TKT-100/102 crops of the same sheets)

Not manifest entries (decorative, `alt=""`, `aria-hidden`, lazy; EVAL-021's manifest covers the ten
content illustrations). Cropped with PIL from two transparent Higgsfield sprite sheets generated
2026-09-26 with Tushar's approved spend (`gpt_image_2_5`, medium, 1k, transparent background,
0.5 credits each; style reference media `09b0c111-e66d-4ddf-a1bb-f0375f907d2c`): alpha kept,
connected-component masks so no neighbour bleeds in, exported webp at ×2 display size, ≤ 25 kB
each. Shared names — TKT-100/101/102 reuse the same files. First shipped by TKT-99 (home
"How I think" collage, Design.md §11 Dev-41).

| piece | file | source sheet | job id | credits | used on |
|---|---|---|---|---|---|
| `collage-scrap-sage` | `collage-scrap-sage.webp` (291×300) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-scrap-rust` | `collage-scrap-rust.webp` (297×300) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-scrap-kraft` | `collage-scrap-kraft.webp` (254×300) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-scrap-grid` | `collage-scrap-grid.webp` (269×300) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-notebook-strip` | `collage-notebook-strip.webp` (560×158) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-stamp` | `collage-stamp.webp` (178×220) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-postmark` | `collage-postmark.webp` (260×168) | `collage-paper.png` | `6eab8569-c875-472c-ad3f-d217666fa120` | shared 0.5 | `/` How I think |
| `collage-leaf-1` | `collage-leaf-1.webp` (125×380) | `collage-botanical.png` | `8fddab59-5a19-4f49-8234-0190f4b40eb6` | shared 0.5 | `/` How I think |
| `collage-leaf-2` | `collage-leaf-2.webp` (142×380) | `collage-botanical.png` | `8fddab59-5a19-4f49-8234-0190f4b40eb6` | shared 0.5 | `/` How I think |
| `collage-fern` | `collage-fern.webp` (143×380) | `collage-botanical.png` | `8fddab59-5a19-4f49-8234-0190f4b40eb6` | shared 0.5 | `/` How I think |
| `collage-wildflower` | `collage-wildflower.webp` (108×380) | `collage-botanical.png` | `8fddab59-5a19-4f49-8234-0190f4b40eb6` | shared 0.5 | `/` How I think |

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

### TKT-108 · Tushky head sticker (hero "Ask Tushky" CTA)

A decorative sticker, not a manifest illustration (it carries no scene and no alt text — `alt=""`,
`aria-hidden`, lazy, 64 px CSS next to the hero's secondary CTA). Provenance, same columns as the table
above:

| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on | sha256 |
|---|---|---|---|---|---|---|---|---|---|
| `tushky-head` (sticker, no manifest entry) | `public/media/illustrations/tushky-head.webp` | sticker | `gpt_image_2_5` (Higgsfield, medium, 1k, transparent) | reference `902a0281-2459-45a7-9cea-09eaab3e7581` (= crop of `hero-banner.webp`, the sleeping golden retriever); job `36837247-25de-4830-8f58-c069b00d2188` | Tushky — the banner's golden retriever — as a small die-cut head sticker (cream border, no text) | 2026-09-26 | 0.5 (Tushar-approved Higgsfield spend, 2026-09-26) | `/` | `0fbc24a2a26b5f873f68342fd8b2473c1febc4c4227706e0ee3a50289a4625a8` |

Encoded with PIL from the 1024×1024 RGBA master (`/Volumes/E Drive/Dev/.scratch/m009/hf/tushky-dog-head.png`):
alpha < 48 → 0 (drops the faint generation halo), cropped to the alpha bbox, centred on a square
transparent canvas, Lanczos → 128×128 (2× the 64 px display), `WEBP quality 85, method 6`, **7,932 bytes**.
