# TKT-93 report — hero banner restyle (hero-gate change request, EXE-15)

**Ticket:** TKT-93 (Backlog `TASK-87`) · M-009 · Feature · P0 · sp:5 · depends on TKT-73 (done)
**Branch:** `m-009-redesign` (verified; never `main`; not pushed)
**Model:** Fable 5.1 (most-capable tier)

## 1. What was built

The `/` hero is now the reference-style **full-bleed illustrated banner** (Design.md §11 Dev-21 / Dev-23; decision EXE-15) — style only, no reference content or branding:

| Piece | Where | Notes |
|---|---|---|
| Banner asset | `content/media/illustrations/hero-banner.webp` | the 3168×1344 outpaint master encoded with `sharp` (`webp q86, effort 6, smartSubsample`), alpha dropped (source was fully opaque) — **371,142 bytes** (cap 400 kB; q86 was the first quality tried that met it; a first `toFile` pass had re-encoded the buffer to 285 kB at default q80 — replaced by writing the q86 buffer directly, one lossy pass only) |
| Clip mask | `public/media/illustrations/hero-clip-mask.png` | the prototype's 1280×684 luminance mask rewritten as an **alpha** PNG (black RGB + luminance→alpha; CSS `mask-image` reads alpha, `-webkit-mask-image` is alpha-only), palette-quantised — **38,998 bytes** (RGBA non-palette was 56,964) |
| `components/paper/SceneBanner.tsx` | new, reusable (TKT-95) | `{ id, priority?, focalX?, sizes?, className?, children? }`. One outer box (`.scene-banner`, `overflow:hidden`, height `clamp(300px, 42vw, 620px)` ≥ 768 / `75vw` (4:3) below) crops one inner canvas (`.scene-banner-canvas`, the scene's own aspect ratio via `--scene-ar`, width `max(100%, height × ratio)`, `left` clamped so the focal point sits at the box centre without ever exposing a gap). The `<img>` (alt from the manifest, `preload` + `fetchPriority="high"` + eager when `priority`) and any children live inside the canvas, so overlays positioned in canvas percentages stay registered under every crop. **Not** in the `components/paper` barrel — the barrel's unit fixture renders every export under jsdom, where a static image import is a bare URL `next/image` rejects (documented in the file); import it from its module |
| `components/hero/registration.ts` | new | `BANNER_SIZE`, `CLIP_SIZE`, `CLIP_PLACEMENT { scale 1.912, x 362, y 6 }` → `CLIP_REGISTRATION` (left 11.4268 % · top 0.4464 % · width 77.2525 % · height 97.3071 %) and `clipSlotStyle()` → `--clip-*` inline vars. One source; Hero renders from it, the unit test derives from it, the e2e guard measures against it |
| `components/hero/Hero.tsx` | rebuilt | `<section class="hero">` → `.hero-banner` (SceneBanner `hero-banner` `priority focalX=0.49` with `.hero-clip-slot` (the `--clip-*` vars) wrapping the unchanged `HeroClip`; `TornEdge fill="paper"` absolutely at the banner's bottom edge; `MediaGate min=768` → three `Sheet variant="photo"` polaroids with `Tape` fasteners and `next/image` crops of `scene-work` / `scene-about` / `scene-playground` (`alt=""`, group `aria-hidden`, rotations −2.4 / 1.8 / −1.2 inside the ±2.4 photo cap); `Postmark` top-right) → `Container.hero-copy` centred: eyebrow, Fraunces h1 with the rust `Sketch` underline on "people can use.", `Annotation size="hero"` "Same curiosity. Bigger problems." (one line), support (hidden < 768), the two CTAs. Copy verbatim from `data/hero.ts` (D7). Decorations: **torn · underline sketch · hand-sub annotation · postmark sketch = 4** at both widths (the TSK-37 figcaption is dropped) |
| `components/hero/Postmark.tsx` | new | authored SVG, `data-decor="sketch" data-sketch="postmark" aria-hidden`: outer ring, dashed lettering ring, inner ring, Fraunces "TP" monogram (34 px), four cancellation waves to the left; rust ink, `mix-blend-mode: multiply`, −7°. See §6.2 for why it carries no ring words |
| `components/hero/HeroClip.tsx` | **untouched** | state machine unchanged (TP13); the `<video>` is positioned/masked by CSS only (`.hero-clip` inside `.hero-clip-slot`) |
| `content/media/illustrations/manifest.ts` | `hero-banner` entry (kind `scene`, `hero-banner.webp`, 3168×1344, the exact Dev-23 alt, `usedOn ["/"]`); id union extended; `hero-desk` keeps `usedOn ["/"]` (honest: it ships as the clip's `poster` attribute — commented); `scene-work` / `scene-about` / `scene-playground` gain `"/"` (decorative polaroid crops) |
| `content/media/illustrations/README.md` | `hero-banner` row: model `outpaint` (Higgsfield), input media `fc45d649-4038-4558-bd41-b659db56a9d3`, job `6d94caf5-1a14-4151-9864-050b6a193615`, 2026-09-25, 2 credits, `/`; `hero-desk` "used on" cell qualified; the three polaroid scenes' cells gain `/`; a TKT-93 encoding record (banner + mask bytes, alpha-mask rationale) |
| `lib/illustrations.ts` | static import of `hero-banner.webp`; `StaticIllustrationId = SceneId \| "hero-banner"`; `sceneImage()` accepts it |
| `app/globals.css` | the `/* TSK-37 · hero */` block is **replaced** by `/* TKT-93 · hero banner */` (same position): `.scene-banner*` (reusable cover/focal maths), `.hero-clip-slot` / `.hero-clip` (registration vars + alpha mask, unprefixed only — Lightning CSS adds `-webkit-`), `.hero-banner` (`overflow-x: clip` so the first polaroid can run off the left edge without widening the page), `.hero-torn`, `.hero-polaroids` / `.hero-polaroid:nth-child(n)` (square crops), `.hero-stamp*`, the centred `.hero-copy` block, CTAs carried over. Tokens / derived values only (EVAL-020 PASS) |

## 2. Registration — measured, not typed (AC: video box = canvas percentages ±2 px at 1024 / 1440 / 1920)

`tests/e2e/eval-019.spec.ts` "the masked clip stays registered on the banner canvas at 1024, 1440 and 1920" (w1440 project, viewport resized per width; also asserts the canvas covers the banner box on all four edges and the slot keeps the clip's 1280/684 aspect):

| width | canvas (w×h @ x,y) | video (w×h @ x,y) | Δ x · y · w · h (px) |
|---|---|---|---|
| 1024 | 1024.0×434.4 @ (0.0, 70.8) | 791.1×422.7 @ (117.0, 72.8) | 0.01 · 0.00 · 0.00 · 0.00 |
| 1440 | 1440.0×610.9 @ (0.0, 69.9) | 1112.4×594.5 @ (164.5, 72.7) | 0.01 · 0.01 · 0.01 · 0.00 |
| 1920 | 1920.0×814.5 @ (0.0, −24.3) | 1483.2×792.6 @ (219.4, −20.6) | 0.00 · 0.01 · 0.01 · 0.00 |

**PASS** (tolerance 2 px). Unit side: `tests/unit/hero-clip.test.tsx` "hero clip registration" — the percentages derive from `{1.912, 362, 6}` to four decimals (`11.4268% · 0.4464% · 77.2525% · 97.3071%`), and the scaled clip stays inside the banner.

Seam check (Read): `docs/screenshots/m-009/hero-banner/1440-mid-clip.png` (1.2 s, mid-motion — pen hand raised) and the held frame in `1440.png` / `docs/screenshots/m-009/tracer/hero-end-1440.png` (regenerated by the spec, now the 1440×605 banner box), both zoomed ×2 on the character: no halo, wall texture / pinned notes / laptop continuous through the mask edge; the only difference between frames is the character's hand and pen.

## 3. EVAL-019 contract (unchanged, selectors updated)

SSR (`curl` + the spec): **0** `<video`; **1** banner `<img>` — `fetchPriority="high" loading="eager" width="3168" height="1344" sizes="100vw"`, alt byte-equal to the Dev-23 string, once in the markup; **0** poster `<img>` (the poster is the clip's `poster` attribute only); hero `[data-decor]` in SSR = `torn, sketch, sketch, annotation`; polaroids absent from SSR (MediaGate). Default mode: `ended at 2653 ms` (≤ 4000), 0 restarts, attribute set unchanged, `poster="/media/illustrations/hero-poster.webp"`. Reduced motion / touch / Save-Data / rejected `play()`: 0 `<video>`, banner visible. Caps unchanged (webm 175,761 · mp4 312,137 · poster 86,800).

## 4. Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` | **49 files passed · 1 skipped · 464 tests passed · 2 skipped** (was 431; +2 registration, +1 EVAL-021 banner, the ten-id assertions updated) |
| `pnpm build` | ✓ `all routes static (13)`; `pnpm start` restarted after every build |
| **FULL `pnpm test:e2e`** (fresh prod server, final build) | **785 passed · 0 failed · 895 skipped** (9.0 min) — baseline 0 failures kept |
| `pnpm eval --only EVAL-018,EVAL-019,EVAL-020,EVAL-021 --skip-build` | **4 pass · 0 fail** → `evals/results/eval-run-0.2.0-2bc76a9.json` (git-ignored per-ticket run). EVAL-018: 23 routes × 2 widths · 168 units · **max 4/4 per unit** · 0 unparked · 2 parked (pre-existing `/about`) · 0 stale. EVAL-019 PASS (32 specs / 10 runs). EVAL-020 PASS. EVAL-021 PASS (both ways, ten ids) |
| `pnpm exec tsx scripts/bundle-budget.ts --route / --json` | **158.6 kB gz** (budget 180; 9 chunks) — unchanged from the tracer's 158.2 within noise; nothing new is client JS except the already-present `MediaGate` |

A first full e2e (against the pre-fix build) found one real failure — see §6.2 — was stopped, the fix built, and the suite re-run in full on the final build (the numbers above).

## 5. Screenshots (`docs/screenshots/m-009/hero-banner/`, prod build, `--wait-for-timeout=4500`, full page; every file Read)

| File | What I saw |
|---|---|
| `1440.png` | Full-bleed banner 1440×605 under the header; character centred (focal 0.49), the entire 21:9 frame visible (canvas = box width). Three square polaroids: `scene-work` tucked under the header's left edge, `scene-about` beside it, `scene-playground` at the bottom-left crossing the torn edge — together they cover the outpaint's garbled corkboard (its top-left ~21 % × 45 %): no readable garbled note remains; a sliver of corkboard brown shows between P1 and the "Problem → Impact" note (no text). Postmark top-right over the empty wall / hanging plant, clear of the "Currently:" checklist; "TP" legible. Torn paper edge clean across the width. Copy centred below: eyebrow (2 lines), h1 in Fraunces on 2 lines with the rust underline under "people can use.", the Caveat hand line, support, both CTAs. No overflow (e2e `noOverflow` on `/` at all widths) |
| `1440-mid-clip.png` | at 1.2 s: masked clip mid-motion (hand raised, pen turning) over the banner — seamless, see §2 |
| `1920.png` | banner height capped at 620 px → the 815 px-tall cover canvas is cropped **≈ 97 px top and bottom** (the tops of the pinned notes and the bottom of the desk papers are cut; the character and dog are intact). Polaroids at their 270 px max still cover the corkboard; stamp at the far right. **Judgement item for Tushar** — see §7 |
| `1024.png` | banner 1024×430, whole frame visible; polaroids (169 px) cover the corkboard; stamp small but readable; eyebrow 2 lines, h1 2 lines, CTAs side by side |
| `768.png` | banner 768×322; polaroids at their 136 px minimum still cover the notes (the corkboard's lower edge shows as brown, no text); stamp 120 px; copy centred, support visible |
| `390.png` | 4:3 crop (390×292) centred on the character — the corkboard is outside the crop; polaroids not mounted (MediaGate < 768); stamp 120 px top-right over the checklist's right edge (its ring text would have been illegible here — it has none, §6.2). Fold (844): banner → eyebrow (3 lines) → h1 (3 lines) → hand line → "View my work →" → "Ask my portfolio" ends at ≈ 800 px — every 5-second-test element is inside the first viewport (the e2e mobile-order test also passes: banner → h1 → CTA → sections) |

## 6. Judgement calls / deviations (for the orchestrator)

1. **Corkboard is top-left, not bottom-left.** The brief describes covering the corkboard with polaroids "overlapping the banner's bottom-left"; the outpaint's corkboard occupies the top-left ~21 % × 45 % (its notes end ≈ y 45 %). Polaroids only at the bottom-left cannot cover it, so the cluster runs down the left edge: two side by side across the corkboard (P1 tucked under the header's bottom edge with its tape on the right — a tape at the top-left would sit under the header), the third at the bottom-left crossing the torn edge (the reference's overlap). Square (1:1) crops were needed so P1/P2 reach the corkboard's bottom edge at every width ≥ 768 — a 4:3 crop left the lower notes ("Team projects", "probro") showing in the first capture.
2. **Postmark carries no ring words.** The brief suggested text such as "TP · BUILD · LEARN". EVAL-008's 14 px content-text floor (`tests/e2e/eval-008.spec.ts`) walks every text node with no `aria-hidden` exemption; a postmark's ring lettering (11.5 SVG px, rendered ≈ 7–8 px) failed it on `/` in the first full run. I did not want to bend `data-micro-label` (reserved for brand micro-labels with a 12 px + AA-contrast rule the SVG cannot honestly satisfy against an illustration background) or inflate the SVG font-size to pass a computed check while rendering micro text. The stamp keeps the postmark read — rings, a dashed lettering ring, the 34 px "TP" monogram (rendered 18–25 px) and cancellation waves. If Tushar wants the words, the honest route is a `data-micro-label` decision at Stage 8, not a CSS trick.
3. **Decoration budget.** With the torn edge now inside the hero section (it is the banner's bottom edge, `data-decor="torn"`), the hero is at exactly 4 (torn, underline, hand line, stamp). The TSK-37 figcaption "the desk where most of it happens" is dropped, as the brief allowed. Design.md §3.3 still lists the hero at 3 (superseded by Dev-21) — a Stage-8/Design.md reconciliation item, not edited here.
4. **`hero-banner` is `kind: "scene"`** (not `poster`): it ships through `next/image` as a static import like the six scenes, and `Illustration.kind` has no "banner" value. EVAL-021's alt-prefix rule for `scene` ("Illustration of ") holds. `tests/unit/eval-021.test.ts` and `tests/unit/paper.test.tsx` now expect **ten** ids — the paper test parses the tenth alt from Design.md §11 **Dev-23** (its `with alt "…"` clause) rather than editing §6.3 (a Stage-4 artifact).
5. **`SceneBanner` is not barrel-exported** (see §1) — TKT-95 imports `@/components/paper/SceneBanner`.
6. **`docs/screenshots/m-009/tracer/hero-end-1440.png` is committed changed** although the brief's restore list names it: it is the held frame `eval-019.spec.ts` writes (now the 1440×605 `.scene-banner` box), regenerated by the run that produced this evidence. The other churned dirs were restored before and after the work. `docs/eval.md` EVAL-019 section updated (SSR row = banner, new registration row, hero count 4).
7. **Mask semantics.** The prototype mask is luminance (white = show); CSS `mask-image` on an image defaults to alpha (`match-source`), so the shipped PNG carries the mask in its alpha channel. This is recorded in the README's TKT-93 section so nobody "fixes" it back to grayscale.
8. **`--focal` / `--scene-ar` are inline CSS vars** set by `SceneBanner`; `--clip-*` by `Hero`. The registration numbers therefore exist once in TypeScript.

## 7. Needs Tushar's eye (at the re-presented hero gate)

- **1920+ vertical crop** (§5): the 620 px max height crops ≈ 12 % top and bottom of the outpaint on wide screens. Alternatives: raise the max (e.g. 700 px — less fold space for the copy) or accept. Intentionally left at the brief's clamp.
- **Polaroid composition** (§6.1): a left-edge cluster rather than a pure bottom-left overlap — approve the placement or ask for the corkboard to be re-generated (attempt 2, 2 cr) so the polaroids can be fewer/lower.
- **Postmark without words** (§6.2).
- Dev-23 alt (orchestrator default) is now live in the manifest — confirm at the gate.

## 8. Scope note

Staged explicitly: `app/globals.css`, `components/hero/{Hero,Postmark}.tsx`, `components/hero/registration.ts`, `components/paper/SceneBanner.tsx`, `content/media/illustrations/{manifest.ts,README.md,hero-banner.webp}`, `lib/illustrations.ts`, `public/media/illustrations/hero-clip-mask.png`, `tests/e2e/{eval-019.spec,home.spec,tracer.spec}.ts`, `tests/unit/{eval-021.test.ts,hero-clip.test.tsx,paper.test.tsx}`, `docs/eval.md`, `docs/screenshots/m-009/hero-banner/*` (6), `docs/screenshots/m-009/tracer/hero-end-1440.png`, this report. Not staged: `docs/ledger.md`, `docs/briefs/*` (incl. the untracked TKT-94/95 briefs), `backlog/**`. Scratch under `/Volumes/E Drive/Dev/.scratch/m009/tkt93/` (encode scripts, logs, zoom crops). No Higgsfield spend.

## 9. Commits

1. `feat(hero): full-bleed banner with masked clip, polaroids and stamp (TKT-93)` — assets, manifest/README, lib, components, CSS.
2. `test(hero): banner SSR + clip registration guard, ten-id provenance (TKT-93)` — specs, unit tests, docs/eval.md, screenshots, held frame.
3. `docs(m-009): TKT-93 report` — this file. (SHAs in the chat reply.)
