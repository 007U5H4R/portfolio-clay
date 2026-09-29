# TASK-127 · Portfolio page fidelity pass: final report

**Scope:** Tushar's portfolio fidelity spec (`docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-fidelity-spec.md`), run per `docs/briefs/TASK-127.md` on `cloud/task-127` with Fable 5.1 at maximum effort.
- **Phase 1:** the audit (`docs/reports/TASK-127-audit.md`, commit `9780749`) was pushed before any code changed.
- **Phase 2:** implemented in the commits listed at the end.
- **Screenshots:** in `docs/screenshots/m-009/task-127/` (`before/`, `after/`).

**Where it ran:** locally on Tushar's Mac, in the E-Drive worktree, not in a cloud container.
- `.env.tooling`'s `/Volumes/E Drive` paths exist here, so I used them as-is and did **not** apply the brief's `TMPDIR=/tmp` export: it would put temp files on the nearly full internal disk, which the standing E-Drive rule forbids. `.env.tooling` is untouched.
- Image-generation connectors (Recraft, Higgsfield) were present in this session, but the brief says no image generation. All art is hand-authored SVG, and **0 credits** were spent.

---

## §32 · The ten points

### 1. Visual problems found (detail: the audit)
The page read as "a web page with paper styling" because every object was a rectangle carrying paper *decoration*:
- **Edges:** tears were 1 %-amplitude `clip-path` polygons, so they looked ruler-straight.
- **Backing papers:** peeked out as flat 16 px strips.
- **Covers:** ten of twelve were a gradient, a disc and a line icon; the stage poster was the enlarged icon cover.
- **Layout:** it kept the web grammar of a two-box feature row, a toolbar row, a scroll row and a card grid.
- **Intro:** the h1 (60 px, two lines) outweighed the stage.
- **Enterprise:** its cards read like miniature résumés behind an abrupt, flat torn edge.

### 2. Components preserved
- **Behaviour and markup contracts:** unchanged. That covers:
  - `IndependentProductsShowcase` (product and mode state, stage keying, `?product=` deep link with `replaceState`, tabpanel);
  - `ProductMediaPlayer` (untouched: click-to-load, youtube-nocookie only, one iframe, blocked-embed fallback);
  - `ProductCarousel` (tabs, roving tabindex, ←/→/Home/End with wrap, arrow buttons, scroll-into-view inside the track, live counter "n / N");
  - `ProductInfoPanel` (only existing actions render; Pitch / Demo carry `aria-pressed` and `aria-controls`; external links open a new tab with `noopener noreferrer`; the case-study link is the same link with the same name);
  - `EnterpriseClientWork` (six cards in order, source lines, no links).
- **Untouched files:** `lib/csp.ts`, `lib/video-providers.ts`, `data/projects.ts`, `data/enterprise.ts`.
- **Kept as-is:** the paper primitives (`Sheet`, `Pin`, `Tape`, `Annotation`, `TornEdge`, `Sketch`), the strip tints (`--strip-*`) and the EVAL-018 counts (products 2, enterprise 2).

### 3. Assets replaced
- **The eleven CSS cover scenes:** the `.pf-cover-scene` / `.pf-scene-*` / `data-scene` rules (≈ 330 lines) and the `scene` data field are deleted. The lucide glyph survives only as the plate emblem.
- **The stage poster:** was the enlarged icon cover; it is now each product's own artwork.
- **TeachSpark's painted cover** (`cover-teachspark.webp`): replaced by an SVG counterpart of the same concept, so the twelve share one illustration style. It stays in git history (`c448cc5`).
- **Tears and chrome:** every `clip-path` tear, the carousel toolbar row, the round arrow chips, and the enterprise card border plus folded corner are gone.

### 4. New assets created (no generation, 0 credits)
- **Twelve SVG covers,** one per product, in `public/media/illustrations/covers/cover-<slug>.svg`:
  - 21.7–34.7 kB each, all under the 40 kB budget;
  - 1600 × 900, text-free, self-contained;
  - sources in `scripts/portfolio-art/scenes/`, built by `scripts/portfolio-art/build.ts` on a shared print kit (`kit.ts`);
  - registered in the illustration manifest, the README (sha256 per file), Design.md §6.3 and `eval-021` (which now checks size, dimensions, no text and no external references).
- **Paper materials** in `public/media/portfolio/decor/` (from `scripts/portfolio-art/decor.ts`):
  - cream-fibre and kraft-crumple tiles;
  - a tide stain;
  - the selected cover's hand-drawn marker frame;
  - thirteen baked torn-edge masks.
- **Subjects, each drawn only from its `data/projects.ts` record:**
  - **TeachSpark:** a friendly helper robot, worksheets, a generic green chat bubble, a dusk classroom.
  - **RailCite:** a streamliner at dusk on tracks whose sleepers are ruled pages, a green signal, research volumes and a magnifier.
  - **Nuptis → Velora:** an apparel-sourcing atelier with a dress form, swatches tied with thread and workshop roofs (**not beauty**).
  - **Cubicle:** a 1990s CRT with four teammate panes and debate bubbles.
  - **Nuptis:** a marigold mandap being set up, with a planner's checklist.
  - **Bhakti Vilas:** a harmonium, a diya and a riverside temple at dawn.
  - **Token Toli:** a lit hillside home, a lane to a far city, a paper plane on the line, research notes.
  - **Pratyasa:** a lab bench with the analyser, a droplet, a phone graph and a sealed certificate scroll.
  - **Tegaki:** a handwriting page under a magnifier, a vermilion seal, a seigaiha band (**no Great Wave, no AI**).
  - **Dino Arcade:** a phone dressed as an arcade cabinet with a generic pixel sauropod (not the Chrome T-rex).
  - **Cinematic Portfolio:** a reel projector beaming mountains onto a screen (no person).
  - **Campfire Board:** a campfire, a kanban easel, a Gantt plank and tents.
- **Honesty rules:** robot/AI imagery appears only on the three products with AI (TeachSpark, RailCite, Cubicle). There are no logos or trademarks.

### 5. Poster (stage) changes
- **Stack:** four physical layers, rotated −0.4°:
  - kraft backing at −1.4°;
  - a navy torn under-layer peeking out top-right;
  - a lighter fibre rim plus a cream mat;
  - the 16:9 poster, hand-cut (a faint wobble, poster states only).
- **Pin and tape:** one pin, plus one strip of translucent kraft tape that *is* the "Pitch video" / "Demo video" label.
- **Shadow:** the stack casts one warm shadow that follows the torn silhouette.
- **Lettering:** HTML, centred in the art's calm top band, with the cover line in Caveat over a rust swipe.
- **Play disc:** sits in the art's reserved calm zone at (64 %, 52 %).
- **No recording yet:** products without one show a small torn kraft tag, pinned bottom-right (never a dead play button).

### 6. Carousel changes
- **Covers:** 5:6 collectible covers on one textured kraft band. Each has:
  - its art and HTML lettering in per-product colours (Bhakti's pale dawn gets navy lettering);
  - a code chip, a cream plate carrying the cover line plus an emblem, and a printed keyline and halftone;
  - a tilt between −0.7° and +0.8°.
- **Band:** a lighter fibre rim, torn top and bottom, visible torn ends ≈ 5 vw past the content from 1024, and a warm shadow. Its top edge tucks under the stage and sheet.
- **Arrows:** torn paper tabs at the band's two ends.
- **Label:** a small torn tag, "Select a product · n / N".
- **Selected cover:**
  - lifts 8 px with a longer shadow;
  - gets a hand-drawn rust marker frame (the `::after` the e2e test reads) and a steel pin;
  - its plate gets a marker swipe.
- **Covers per view:** six at ≥ 1280, five at 1024–1279, ≈ 3.5 at 768, ≈ 1.9 at 390 (the swipe cue).

### 7. Materiality and layering changes
- **One spread:** the intro joins the showcase grid (the tabpanel is a subgrid). The sheet rises beside the intro, the stage sits below, and the band tucks under both.
- **The sheet:** torn and stained ivory at +0.6° over a paper-2 under-sheet. It is pinned top-left and taped top-right, with one small rust spark by the name, and is as tall as its content.
- **Strips:** torn paper with torn icon chips, Fraunces labels, jitter and warm shadows. The case study is the last, kraft strip.
- **Textures:** paper-fibre tiles on the section.
- **Tears are baked masks, not a live filter.** A colour-free `feTurbulence` + `feDisplacementMap` filter was built first. A Chromium trace at DPR 2 measured **7–12.8 s** of raster work per page view with it, against **≈ 1.6 s** without it. The masks brought it to ≈ 3.1–3.4 s, and most of the remainder is the page's other layers (the twelve covers themselves raster in ≈ 65 ms).
- **The band's shadow:** lives on a static span. A shadow on the carousel itself pushed track-scroll frames from ≈ 17.5 ms to ≈ 30 ms; on the span they stay at ≈ 17.5 ms.

### 8. Enterprise changes
- **Chapter break:** the band's torn bottom edge, then ≈ 200 px of air, then a manila torn page edge showing above the fibre-frayed paper-2 seam, then ruled dossier paper.
- **Heading:** h2 on one line from ≈ 1100 px, with a hand note on kraft tape.
- **Grid:** 3 / 2 / 1, with 52–64 px row gaps.
- **Case files:** an ivory sheet clipped into a manila folder. The folder's tab carries the neutral "Case file 0N" stamp, and a paperclip crosses the top.
- **Content:** client, program, summary, sub-projects and tags. Role · dates and the source line move into a quiet file footer.
- **Unchanged:** still no "Open case file →" (no destination), no logos, the same six files in the spec §24 grouping.

### 9. Responsive changes
- **Order:** intro → media → sheet → strips → swipe carousel → enterprise (single column below 1024).
- **Phones:** rotations off on the stage and sheet, no navy under-layer, no doodle and no spark; a smaller tape label and "coming" tag; strip hints drop when the sheet is narrower than 350 px (container query).
- **Narrow covers:** the plate emblem drops below 150 px wide so the cover line fits in two lines.
- **Covers per view:** 1.9 (390), 3.5 (768), 5 (1024) and 6 (≥ 1280).
- **Overflow:** none at 390, 768, 1024 or 1440 (the e2e `noOverflow` gate).

### 10. Remaining limitations
See "Remaining limitations" below.

---

## §31 · Review loop (1440 beside reference 2)

Two rounds; the stop rule was met at round 2, when all ten answers were satisfactory. The composites are `docs/screenshots/m-009/task-127/after/compare-1440-round1.png` and `…-round2.png`.

| # | Question | Round 1 | Round 2 |
|---|---|---|---|
| 1 | Does this still look like standard UI with paper styling? | **No.** Torn, stacked papers, a pinned and taped sheet, a kraft band and real cover art. Residual UI-ness: evenly spaced strips and the tag chips on the case files. | **No.** |
| 2 | Are the posters actual designed artworks? | Yes: twelve composed scenes (three depth planes, one light source, halftone, grain). | Yes |
| 3 | Do the covers feel collectible? | Yes (shared packaging grammar, distinct art). | Yes (lettering one step bigger) |
| 4 | Does each product have its own identity? | Yes: a distinct world and palette each. | Yes |
| 5 | Does the info sheet feel physically separate? | Yes. | Yes |
| 6 | Does the top feel like one composed scrapbook spread? | Yes. | Yes |
| 7 | Is Section 2 spacious and mature? | Mostly. The seam's ivory was too close to the page tone to read as a layer. | Yes: a manila edge now reads as a second page |
| 8 | Is there controlled imperfection? | Yes. | Yes |
| 9 | Is material depth visible? | Mostly. The kraft band sat flat. | Yes: the band casts a warm shadow (static layer) |
| 10 | Does the page feel significantly closer to the references? | Yes. | Yes |

---

## Verified vs judgement

**Verified (evidence in this run):**
- **Gates:** the counts below.
- **Art files:** each cover's byte size, dimensions, no text and no external references (`eval-021`).
- **Spread layout:** the ≈ 62/38 split and the order when stacked (`projects.spec`).
- **Covers per view:** 6.0 at 1440 and ≈ 1.9 at 390 (`projects.spec`).
- **Cover lettering:** fits every cover and stage at 390 and 1440 (`projects.spec`, title-fit).
- **EVAL-018 counts:** products 2 and enterprise 2.
- **Accessibility and targets:** axe clean at 390 and 1440, with the default and a non-default product; 44 px targets; no horizontal overflow at the four widths.
- **Real YouTube embeds:** RailCite and Campfire Board (`projects.spec`, `portfolio-video.spec`).
- **Reduced motion:** swaps are instant (`eval-010`).
- **Text-size floor:** holds (`eval-008`). The two micro-labels are the 12 px code chip and the 12.5 px plate line, both with AA contrast.
- **Performance traces:** the raster and scroll-frame figures above (Chromium, DPR 2, this Mac).

**Judgement (mine, open to Tushar):**
- **Aesthetic calls:** every art-direction and composition decision (palettes, which story props, lettering colours). The art is hand-drawn vector in a printed-poster style; it is not painted.
- **5:6 covers:** the spec allows 4:5 or 5:6, and the reference's covers are ≈ 7:6 landscape, so I took the squarer option.
- **TeachSpark's raster:** replaced for style consistency.
- **Sheet height:** it is as tall as its content, so products with one or two actions end early instead of stretching empty paper.
- **Case study strip:** the link becomes a strip (same link, same name).
- **"Player select ·" prefix:** dropped (spec §28), while the count stays.
- **Plate cover line:** a 12.5 px micro-label, because it is packaging and the same line is real ≥ 17 px content on the stage and sheet.
- **Enterprise footer:** role · dates moved into the file footer.
- **Play disc:** placed at (64 %, 52 %).
- **Tape label:** it replaces the stage's second fastener, so the stage has one fastener.

## Gate counts

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass (0 errors) |
| `pnpm lint` | pass (0 problems) |
| `pnpm tokens:check` | 13/13 tokens round-trip OK |
| `pnpm test` (Vitest) | 64 files passed, 1 skipped · **705 passed, 2 skipped, 0 failed** |
| `pnpm build` | pass, all routes static (17) |
| `pnpm test:e2e` (w390, w768, w1024, w1440) | first full run 1,310 passed / 21 failed / 1,545 skipped; 2 genuine failures fixed, 17 passed on a one-worker rerun, `eval-011` passed alone, `eval-019` fails identically on the base commit (see below) |
| Bundle budget (first-load JS gz, budget 180 kB) | `/` 161.0 · `/work` 154.3 · `/projects` 169.8 (the brief's baseline was 167.2) · `/about` 154.9 · `/certifications` 155.1 — all pass |

**Full e2e, first run** (two workers, 1.4 h): **1,310 passed, 21 failed, 1,545 skipped** (the skips are each spec's own width filters). I classified every failure:
- **Genuine TASK-127 regressions, both fixed with the failing test as the guard:**
  - the carousel arrow tabs still nudged under reduced motion (`eval-010` hover sweep on `/projects`; commit `833fc52`);
  - the case files' `<footer>` gave `/projects` seven footers (`layout.spec` one-footer contract; commit `b0dd955`).
- **Load timeouts:** 17 passed on a one-worker rerun of just the failures. They ran 36 s–5 min in the contended tail of the run, while four art agents were still rendering.
- **`eval-011` (dead-controls crawler):** passed on its own rerun (4.8 min against its 5-minute cap). The base commit takes 4.1 min on this machine, and a per-route timing shows `/projects` is *faster* on this branch (24.8 s vs 28.6 s), so the crawl is simply close to its budget on this machine.
- **`eval-019` (home hero clip "ended within 4 s"):** fails here at 4.1–9.2 s, and it fails **identically on the untouched base commit `c448cc5`** (5.4 s and 4.1 s), built and run side by side. It is environmental: this machine after the E-Drive remount. No TASK-127 file touches the home hero.

**Found by the full unit gate and fixed in its own commit (`b90113d`):** `tushky-faq-versions` failed on the base branch before any TASK-127 change. TASK-124 added Campfire Board to `data/projects.ts` after TASK-123 stamped the Ask Tushky FAQ cache, so `who-is-tushar` and `products-built` had stopped being served. I re-read both against the data:
- `products-built` gains one sentence from Campfire Board's record;
- `who-is-tushar` still holds as written.

Both were re-stamped with the refresh script's `--stamp`, and `reviewed` stays `false` for Tushar.

## Remaining limitations
- **Painted vs vector:** the covers are hand-authored vector, not painted. They read as a printed-poster set, but the references are painterly AI renders, so the richness is different in kind.
- **Sparse sheets for honest data:** only RailCite and Campfire Board have videos, and only Dino Arcade, Cinematic Portfolio and Campfire Board have a public repo. No product has a PRD link. Several sheets therefore show one or two actions, not the reference's five.
- **Page paper tone:** stays the site's paper palette, lighter and cleaner than the references' aged paper; changing it would be a site-wide token change.
- **Mask stretch:** the torn-edge masks stretch to each layer. Very tall or very wide variants (for example a sheet with many strips) show slightly elongated fibres.
- **Covers are 5:6, not the reference's landscape,** per the spec's ratio.
- **Environment incident:** the E Drive unmounted once mid-run (during the typecheck gate, about 00:25). The disk re-enumerated (disk6 → disk4) and at first refused to mount. `diskutil verifyVolume` was clean (read-only; nothing repaired). It then remounted read-write by itself, and `git fsck` was clean. Every commit is pushed, and every gate was re-run after the remount. This machine has been slower since (see `eval-019`).
- **Local tooling note (not a repo change):** the Claude Code pre-commit hook runs `eslint --format compact`, but ESLint 9 no longer ships that formatter, so it blocked every commit with JS/TS files. I put the official `eslint-formatter-compact@9.0.1` into this worktree's git-ignored `node_modules`. It is not in `package.json`, and the hook now runs real ESLint again. Other repos on this machine will hit the same block until the hook or those repos are fixed. Twice, a stale zero-byte `index.lock` (left behind after interrupted git processes, with no git process running) had to be removed.
- **Parallel art agents:** the eleven non-RailCite scenes were drawn by four parallel art sub-agents (same model), working from one written art brief, the RailCite exemplar and a render-and-critique loop. I reviewed every scene before integrating it and rewrote alts where needed.
- **No human check:** no screen-reader session or real-device test was done; accessibility is automated (axe, the ARIA contract tests).

## Open questions for Tushar
1. **Velora's category:** the repo says apparel sourcing and vendor onboarding (no AI); the spec says beauty and routine. The cover follows the repo. Which is right?
2. **Vendor Passport:** it is in neither `data/projects.ts` nor the source documents, so it was not added. Can you supply its record if you want it?
3. **Painted art later?** The set is hand-drawn SVG. A painted set in the same compositions (Higgsfield or Recraft) would need approved credits. Keep the vector set, or commission paint?
4. **Cover ratio:** 5:6 (in the spec) or the reference's slightly landscape covers?
5. **Plate micro-label:** is the 12.5 px cover line acceptable, given it duplicates real content?
6. **"Player select ·" prefix:** it was dropped and the count kept. OK?
7. **Sparse sheets:** are sheets that end early (products with few links) the look you want, or should short sheets stretch to the band?

## Commits (on `cloud/task-127`)
- `7938ab2` docs: add Tushar's Portfolio fidelity spec, current screenshot and cloud brief (TASK-127) — the orchestrator's brief commit
- `9780749` docs(portfolio): add the TASK-127 Phase 1 visual audit and before screenshots
- `ed1e535` feat(portfolio): hand-draw SVG art for all twelve product covers (TASK-127)
- `7b5b834` feat(portfolio): rebuild the showcase and case files as layered torn paper (TASK-127)
- `0963582` docs(design): record the TASK-127 portfolio deviations Dev-121 to Dev-126
- `306f0f1` fix(portfolio): shadow the kraft band without slowing the carousel scroll (TASK-127)
- `b90113d` fix(ask): re-review the two FAQ answers Campfire Board made stale (TASK-127 gate)
- `833fc52` fix(portfolio): keep the carousel arrow tabs still under reduced motion (TASK-127)
- `b0dd955` fix(portfolio): keep one <footer> per page; case-file foot is a div (TASK-127)
- `4c8bf13` docs(portfolio): name the Cinematic cover's indigo palette in its source (TASK-127)
- `646e06d` docs(portfolio): add the TASK-127 after screenshots and review composites
- *(this report — the last commit)*
