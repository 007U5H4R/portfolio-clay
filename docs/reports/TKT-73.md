# TKT-73 report — Hero: illustration manifest + provenance + shipped assets, hero section + `HeroClip` (D10), EVAL-019/021, hero motion system removed

**Ticket:** TKT-73 (`TASK-68`) · M-009 · Feature · P0 · sp:8 · Phase 0 tracer
**Sub-tasks:** TSK-36 (`TASK-68.1`, assets+manifest+provenance) → TSK-37 (`TASK-68.2`, hero+`HeroClip`+EVAL-019) → TSK-38 (`TASK-68.3`, delete the M-008 hero motion system + `ProductScene`, this ticket's wrap)
**Branch:** `m-009-redesign` (never `main`, not pushed)

This is the AC-by-AC roll-up per the brief (S73.10), drawing evidence from `docs/reports/TSK-36.md`, `docs/reports/TSK-37.md`, and `docs/reports/TSK-38.md` (this ticket's own delete step) — no re-verification of already-reported facts, only cross-references plus the whole-branch gates run after TSK-38 landed.

## AC 1 — `illustration(id)` sole source; nine manifest ids; `README.md`; `eval-021.test.ts` green both ways
**TSK-36.** `content/media/illustrations/manifest.ts` has the nine `Design.md` §6.1 ids with `file`/`publicSrc`/`width`/`height`/alt (alts byte-identical to §6.3); `lib/illustrations.ts`'s `illustration(id)` throws on an unknown id (static call sites only). `content/media/illustrations/README.md` has one row per id (§6.2 columns + a `sha256` column for the byte-exactness assets). `pnpm test -- eval-021` → **6/6 passed** (real tree 0 findings; one-sided `extra-file`/`missing-file` fixtures each produce ≥1 finding; manifest-id/count, `publicSrc` existence and `hero-desk.webp`/`hero-poster.webp` sha256-equality rules all covered). **PASS.**

## AC 2 — static HTML poster (fetchpriority/eager/1280×684/§6.3 alt, no `<video>`); hydration mounts `<video>` only in default mode; reduced-motion/touch/Save-Data never mount `<video>` (4/4 modes × 2 widths)
**TSK-37.** SSR grep on `pnpm build && pnpm start`: `grep -c '<video'` → **0**; poster `<img>` carries `fetchPriority="high"` (React 19 camelCase; `img.getAttribute("fetchpriority")` and `.fetchPriority` both `"high"` in the parsed DOM), `loading="eager"`, `width="1280" height="684"`, the exact §6.3 alt, `sizes="(min-width: 1024px) 58vw, 100vw"`. `eval-019.spec.ts` matrix: default mode mounts `video[data-hero-clip]` with the exact attribute set (w1440, w390 is the touch project); reduced-motion → 0 `<video>` both widths; touch/coarse (w390 project) → 0 `<video>`; Save-Data → 0 `<video>` both widths — **4/4 modes covered, PASS** (touch is inherently width-scoped to w390 by the project design, not a gap).

## AC 3 — default mode: `ended` ≤ 4000 ms; `currentTime` never decreases over 3 s incl. scroll + `visibilitychange`; last frame stays painted
**TSK-37.** Measured `ended` at **3200 ms** and **2937 ms** across two runs (≤ 4000 ms). 13 `currentTime` samples over 3 s (wheel scroll, dispatched `visibilitychange`, dispatched `resize`) held at `2.500` — never decreased; `{paused:true, ended:true, loop:false}` after. Held-frame screenshot (`hero-end-1440.png`) matched the reference `hero-end.webp` composition (TSK-37 §4). **PASS.**

## AC 4 — asset caps: webm ≤ 200 kB, mp4 ≤ 350 kB, poster ≤ 120 kB
**TSK-36 + TSK-37.** webm 175,761 B ≤ 204,800 · mp4 312,137 B ≤ 358,400 · poster 86,800 B ≤ 122,880 — all measured from disk (`fs.statSync`), all under cap. **PASS.**

## AC 5 — hero decoration count = 3; no `FloatingTiles`; 5-second-test elements in the first viewport at 390/1440
**TSK-37 + TSK-38.** `[data-decor]` inside `section.hero` = **3** (`sketch`, `annotation` ×2 — the hand-sub and the caption), measured by TSK-37. `FloatingTiles` (the M-008 proof-tile stack) is now **deleted** (TSK-38 §1/§2 — 0 grep hits repo-wide over `app components lib hooks tests`); the hero never rendered it (TSK-37's rebuild didn't import it). TSK-37 §4 confirms every 5-second-test element (eyebrow, h1, hand-sub, CTAs, poster frame) intersects the first viewport at both 390 and 1440. **PASS.**

## AC 6 — hero motion system files deleted; `pnpm typecheck`/`lint`/`test` green; `bundle-budget --json` recorded on `/`
**TSK-38 (this ticket's own step).** Deleted: `components/hero/{AvatarScene,AvatarStage,FloatingTiles,HeroActivationContext}.tsx`, `components/interactions/Parallax.tsx`, `components/projects/ProductScene.tsx`, `hooks/usePointerParallax.ts`, `lib/heroMotion.ts`, plus their tests. Grep gate `grep -rn "AvatarScene\|AvatarStage\|FloatingTiles\|HeroActivation\|usePointerParallax\|heroMotion\|ProductScene\|avatarAlt" app components lib hooks tests` → **0 lines**. `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` → 13/13 ✓ · `pnpm test` → 429 passed / 2 skipped ✓ · `pnpm build` ✓.

**`firstLoadJsGzipKb` on `/` = 188.9** (`pnpm exec tsx scripts/bundle-budget.ts --route / --json`; chunkCount 10, raw 610.9 kB). **Target < 180 not met** — the EXE-11 motion-system JS is gone, but `/` is still over budget by ~9 kB gz. This is a **release gate for TKT-74 (S74.03 / EV6)**, not TSK-38: per the technical-plan, TKT-74's baseline run either clears ≤ 180 or opens `TKT-92 perf` before Phase A. Flagged here for the orchestrator's judgement at that gate — thresholds are not lowered (EV2/EV6); the number is reported honestly rather than optimized ad hoc inside a delete-only ticket.

## AC 7 — `pnpm eval --only EVAL-019,EVAL-021` executes both (un-deferred), real values
**TSK-37** un-deferred EVAL-019 (`scripts/eval-cases.ts` `DEFERRED_SPECS → {}`) and ran `pnpm eval --only EVAL-019,EVAL-021 --skip-build` → **2 pass · 0 fail · 20 skip**. **TSK-38** re-ran the wider gate the brief specifies for the ticket wrap, `pnpm eval --only EVAL-001,EVAL-010,EVAL-013,EVAL-018,EVAL-019,EVAL-021 --skip-build` → `evals/results/eval-run-0.2.0-f5e4149.json`, **4 pass · 1 fail · 16 skip · 1 manual**:

| EVAL | Status | Note |
|---|---|---|
| EVAL-001 | MANUAL | hero gate with Tushar — TKT-74 S74.05, out of scope here |
| EVAL-010 | PASS | reduced motion |
| EVAL-013 | PASS | alt-text rule |
| EVAL-018 | **FAIL** | pre-existing `/about` hand-sub Caveat hit (×2 widths) — `AboutHero.tsx`'s subline has no `data-hand` wrapper, a gap since TSK-23, unrelated to the hero/motion work; confirmed pre-existing by re-running against the pre-TSK-38 tree |
| EVAL-019 | PASS | hero once-and-hold matrix |
| EVAL-021 | PASS | illustration provenance |

**AC 7 satisfied** (both named ids execute and produce real values; the wider set the wrap gate also names is reported above rather than omitted).

## Whole-branch e2e (`pnpm test:e2e`, all 4 viewport projects, after TSK-38)
**682 passed · 82 failed · 888 skipped.** All 82 failures are pre-existing and unrelated to this ticket (verified by stashing the TSK-38 diff and re-running each failing spec against the TSK-37 baseline `56d5063`):
- 80× `eval-008.spec.ts` 14px-floor — `DraftTag`'s "Draft — pending sign-off" at 12px, 20 routes × 4 widths (a TSK-34-era gap, unrelated to the hero).
- 2× `eval-018.spec.ts` `/about` — same hand-sub Caveat hit as the EVAL-018 row above.

The three failure sets the earlier briefs called out as known pre-existing on this branch (`.glow-halo` overflow ×11, `featured.spec` vs `ProductScene` ×5, `tracer.spec` `AVATAR_ALT` ×4 — `docs/reports/TSK-30.md` §4a) are now **resolved, not just tolerated**: `.glow-halo` was dead CSS deleted with the motion system, `FeaturedWork.tsx` no longer renders `ProductScene`, and `tracer.spec.ts`'s avatar-cap-ladder / floating-tile assertions were rewritten to the paper hero per the TSK-37 note (poster alt from the manifest, CTA hrefs) — `about.spec.ts`, `featured.spec.ts` and `tracer.spec.ts` all pass in full now.

## Fraunces-axes outcome (from `docs/reports/TSK-31.md`)
`axes: ["opsz","SOFT"]` was **accepted by `next build`** with no warning or error (Next 16.3.5) — the §12.7 fallback path (static `weight:"500"`, drop `font-variation-settings`, a `Design.md` §11 row) was **never triggered**. The built CSS carries `font-variation-settings:"opsz" 144, "SOFT" 30` on `h1`. No `decisions.md` entry was needed.

## Screenshots
`docs/screenshots/m-009/tracer/hero-390.png`, `hero-1440.png` — prod build (`pnpm build && pnpm start`, stale `:3000` killed first per the TSK-30 server scar), full-page, 2500 ms settle. At 1440, Featured Work renders the plain 3-up `ProjectCard` grid (TeachSpark wide / RailCite / Nuptis → Velora) confirming the `ProductScene` removal visually, not just via green tests.

## Definition of Done
Paper DoD + Perf (recorded, **over budget — see AC 6**) + `[x]` EVAL-019 removed from `DEFERRED_SPECS` (TSK-37) + `[x]` EVAL-021 provenance README committed (TSK-36).

## Open item for the orchestrator
`firstLoadJsGzipKb` = 188.9, still over the < 180 target after the M-008 hero motion system's removal. This needs a decision at TKT-74's S74.03 gate: proceed to Phase A only if a further reduction lands, or open `TKT-92 perf` per the technical-plan's documented fallback (EV6 — the budget itself is never lowered).

## Commits (TSK-38's own; TSK-36/TSK-37 commits are in their own reports)
1. `f5e4149` — `refactor(hero): remove the M-008 hero motion system + ProductScene (TSK-38)`.
2. (this report + `TSK-38.md` + the two hero screenshots) — SHA in the chat reply.
