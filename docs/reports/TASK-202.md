# TASK-202 report: 3D paper-cut art for the carousel and Featured Work cards

Finished locally on branch `m013/card-art` after two cloud attempts failed (no Higgsfield connection; then no download from the CDN). The four jobs the second cloud run completed were reused.

## What was made
- **13 carousel covers** (`public/media/illustrations/covers/cover-<slug>.webp`, 1344x756, WebP q78): teachspark, velora, token-toli and campfire-board are the cloud run's jobs; the other nine were generated here. Railcite, slag-city and bhakti-vilas needed a second try (first tries looked painted or photographic, not paper-cut). Nuptis is slightly soft but was kept (decision: on-style enough, no spend on a third look).
- **3 Featured Work cards**, each as three transparent depth layers (back, mid, front) in AVIF + WebP with a transparent bleed: `featured-<slug>.*`, `--mid.*`, `--front.*`. Generated with `background: transparent`, so no keying was needed. RailCite is 3:2; Slag City and Campfire were generated 21:9 and cropped to the card ratio.
- Provenance (model, prompt, job id, bytes, attempt) is in `public/media/illustrations/card-art-README.md`. Encoder: `scripts/card-art/encode.mjs` (masters stay in `/Volumes/E Drive/Dev/.scratch/card-art/raw/`).
- Every cover and layer is text-free by prompt and was checked by eye; light is from the upper left throughout.

## Credits
Start 428.65 (cloud run 2), now 412.15. Total TASK-202 spend **16.5 credits**, inside the ~25 budget (0.5 per image, 33 images):
- cloud run 2: 4 images (2.0);
- this run, covers: 10 first-pass renders (5.0, one was a wasted duplicate token-toli render), 3 retries (1.5);
- Featured layers: 10 renders (5.0, includes one RailCite front retry), then 6 redone at 21:9 for the card crop (3.0).
Rate limits (429) hit several submissions; those were not charged and were resubmitted in batches of 2-3.

## Bytes (assets this task replaced: 13 cover SVGs + 25 featured layer SVGs)
- Before: **465,151 B** (SVG).
- After on disk: covers 1,647,278 B (WebP) + featured 550,372 B (WebP) + 225,028 B (AVIF) = 2,422,678 B.
- What a visitor downloads: covers go through `next/image` (resized, AVIF/WebP negotiated; the carousel loads thumbnail sizes, not the 1344 px masters); a Featured card pulls its three layers as AVIF (72,969 / 80,117 / 71,942 B per card) or WebP fallback (159,556 / 221,846 / 168,970 B), lazy.
- Honest read: the art costs more bytes than the vector it replaced. Not measured: LCP, CLS and the JS bundle budget (no Lighthouse run). Reasons they should hold: no JS changed, the Featured layers are below the fold and lazy, every `<img>` has explicit width/height, and `/projects` LCP is the unchanged scene opener.

## Code changes
- `data/featured-layers.ts`: three layers per card (bg 2 / art 4 / fg 6 px parallax kept), new sizes and bleed, `featuredLayerSrc(slug, name, ext)`.
- `components/projects/FeaturedWork.tsx`: `<picture>` with AVIF source + WebP img; the three CSS spark chips removed.
- `app/globals.css` (TASK-186 block): removed the signature rules for parts that no longer exist (halo, glow, lit, hot, puff, flames, notes, sparks); added hover/focus-visible rules for `works`, `slag`, `board`, `camp` (small translate nudges, same timing, reduced motion unchanged). Hover is still fine-pointer only with `:focus-visible` twin; no scale hovers, nothing infinite.
- `content/media/illustrations/manifest.ts`: covers now `.webp` 1344x756; featured entries `.webp` with the bleed sizes and new alts. `Design.md` section 6.3: the three `featured-*` alt strings updated (paper.test reads them from there).
- `tests/unit/eval-021.test.ts` and `tests/unit/featured-layers.test.ts` rewritten for the raster art (see below). `scripts/portfolio-art/build.ts` now builds only the decor SVGs; the old scene/collage generators stay in the repo, unused.

## Decisions (no one was available to ask)
1. **Signature overlays.** The old RailCite halo, Slag City glow/lit/smoke and Campfire flames/notes/sparks were hand-drawn overlays registered to the old SVG art; they cannot be aligned to generated art. I replaced them with layer nudges (RailCite: mid and front slide like the train did; Slag City: works rise, slag shifts; Campfire: board and camp shift). The brief's "keep the RailCite signature overlays aligned" is therefore met by removing the overlay, not by re-aligning it. If the overlays are wanted back they need new generated overlay layers.
2. **Layer test.** The old test pinned the stacked layers to the sha256 of the original SVG collages, which cannot hold for new art. The new test checks: three layers per card in depth order, WebP and AVIF present, alpha channel, exact bleed canvas, fully transparent bleed strip, <= 100 kB per file, back layer = manifest entry, signature tokens distinct per card, and CSS rules (hover and focus twin) for exactly the tokens used. The old SHA-pinning was removed, not edited to pass.
3. **Cover test.** Now asserts WebP container, 1344x756, <= 180 kB, no leftover SVG (was: text-free SVG <= 40 kB). Cover size is 1344x756 (the generated width), not 1600x900; no upscaling.
4. **Side-card left padding.** The generated art reached further left than the old collage and brushed the Slag City copy. First fix (shrink the stage to 92 % in CSS) broke the existing EVAL-041 no-seam contract (layer images must cover the sheet), so I reverted it and instead padded the Slag City and Campfire layers with ~92 px of transparent paper on the left in the encoder.
5. **Covers are WebP only** (no AVIF twins): `next/image` already serves AVIF from them; the Featured layers are plain `<img>`, so they carry both formats.

## Gates (all on the merged tree, after merging origin/main 026da48b)
- `pnpm typecheck`: pass. `pnpm lint`: pass (0 errors, 3 pre-existing warnings). `pnpm tokens:check`: pass.
- `ALLOW_DEV_ROUTES=1 pnpm build`: pass.
- `pnpm test` (unit): 136 files passed, **1587 passed**, 2 skipped, 0 failed.
- Playwright (ALLOW_DEV_ROUTES=1, `--retries=0`, all four projects w390/w768/w1024/w1440) on carousel, featured, eval-040, eval-041, eval-043, projects, home, overflow-375-768, parallax-stacking, regressions-m009 and layout specs: **189 passed**, 283 skipped (width-specific by design), 0 failed. In the final run one test (EVAL-041 "no seam at +-max", w1440) hit the 30 s timeout while three other lanes were loading the machine; run alone with `--workers=1` it passed (6 passed, 1 skipped). An earlier run of the same spec failed on a real gap with the 92 % stage (decision 4); that is fixed.
- Not run: the full `pnpm test:e2e` over every spec (only the specs covering `/projects`, Featured Work and the layer/motion contracts, as scoped). The known pre-existing failures (EVAL-008 `/dev/artifacts`, EVAL-033, EVAL-039) were not in the run set.

## Screenshots
`docs/screenshots/m-013/task-202/`: `home-featured-{1440,390}-{light,dark}.png` (Featured Work), `home-featured-<slug>-390-{light,dark}.png` (each card on a phone), `projects-{1440,390}-{light,dark}.png` and `projects-carousel-{1440,390}-{light,dark}.png` (the carousel).

## Limitations
- Cover titles are HTML lettering over the top of the art; several generated covers have detail in the upper band (e.g. TeachSpark's robot head sits under its title). Readable in the screenshots, but a calmer upper band would be better; TeachSpark, Velora, Token Toli and Campfire came from the cloud run, which did not ask for one.
- Generated paper-cut covers read more photographic than the retired flat SVGs; Nuptis and Cubicle are the softest.
- Byte weight is up (see Bytes); LCP, CLS and bundle budgets were reasoned, not measured.
- Masters live only on the E Drive scratch; regenerating needs the job ids in the README.
