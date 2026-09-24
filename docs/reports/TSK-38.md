# TSK-38 report — remove the M-008 hero motion system + `ProductScene`; record the JS number

**Ticket:** TSK-38 (`TASK-68.3`) · parent TKT-73 (`TASK-68`) · M-009 · Task · P0 · sp:1 · depends on TSK-37 (done)
**Branch:** `m-009-redesign` (verified before work; never `main`; not pushed)
**Model:** Sonnet 5 (cheap tier)

## 1. Files

### Deleted (S73.09)
`components/hero/AvatarScene.tsx`, `components/hero/AvatarStage.tsx`, `components/hero/FloatingTiles.tsx`,
`components/hero/HeroActivationContext.tsx`, `components/interactions/Parallax.tsx`,
`components/projects/ProductScene.tsx`, `hooks/usePointerParallax.ts`, `lib/heroMotion.ts`,
`tests/unit/Parallax.test.tsx`, `tests/e2e/avatar-edge.spec.ts`.

### Edited
| Path | Change |
|---|---|
| `lib/site.ts` | `site.avatarAlt` removed (its only reference, `tests/unit/site.test.ts`, never used it — no test edit needed there) |
| `components/about/AboutHero.tsx` | `AvatarStage` → temporary `<Illustration id="scene-about" placement="photo" sizes="(min-width: 1024px) 42vw, 100vw" />` (paper primitive, no motion); docstring reworded (TKT-86 does the real §6.4 scene-bleed rebuild) |
| `components/projects/FeaturedWork.tsx` | `ProductScene` flagship treatment reverted to the pre-M-008 plain `ProjectCard` grid (`gridSize`-driven `lg:col-span-2`/`1` span, same S12.02 equal-height contract featured.spec.ts already asserts) — no restyle, current copy (eyebrow/title/lead) kept |
| `app/page.tsx` | `HeroActivationProvider` wrapper removed (dead now that `AvatarScene`, its only reader, is gone) |
| `components/ai/AskPortfolio.tsx` | `useHeroActivation()`/`setActive` calls removed (the same dead cross-section link) |
| `app/globals.css` | `.glow-halo` (+ `@keyframes glow-pulse`) and the whole "Hero avatar scene motion" block (`.hero-scene-glow`, `.hero-avatar-lean`, `.hero-avatar-motion`, `.hero-avatar-variant`, `@keyframes hero-breathe`/`hero-enter-avatar`, `.hero-tile-enter`, `.hero-tile`, `@keyframes hero-enter-tile`) deleted — all zero-consumer after the file deletions above. Their reduced-motion overrides removed too. `.hero-highlight` **kept** (still used by `AboutHero.tsx`); the TSK-37 `/* TSK-37 · hero */` banner block untouched |
| `components/clay/ClayFrame.tsx`, `components/home/HowIThink.tsx`, `components/projects/EditorialGrid.tsx`, `tests/e2e/eval-008.spec.ts` | comment-only rewording (they named the deleted components/files in prose) |
| `tests/e2e/about.spec.ts` | avatar assertion → the `scene-about` illustration fallback caption (see §6.1); comments reworded |
| `tests/e2e/tracer.spec.ts` | `AVATAR_ALT` cap-ladder test → paper-hero poster visibility/alt/responsive-width test; floating-tiles offset-ladder test → hero CTA presence/href test (both read the alt from the manifest directly, not `lib/illustrations.ts` — Playwright can't load its static JPEG imports, same pattern `home.spec.ts`/`eval-019.spec.ts` already use) |

`public/avatar/*`, `content/media/avatar/**`, `scripts/avatar*.ts` untouched (TKT-89; OG still reads the avatar poster until TKT-78). `motion` stays a dependency (`LazyMotion`/`m` — Ask expand, filter reflow).

## 2. S73.09 grep gate

```
grep -rn "AvatarScene\|AvatarStage\|FloatingTiles\|HeroActivation\|usePointerParallax\|heroMotion\|ProductScene\|avatarAlt" app components lib hooks tests
```
→ **0 lines** (the `hooks` directory itself no longer exists — its one file, `usePointerParallax.ts`, was the deletion).

## 3. Gates

- `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` → `13/13 tokens round-trip OK` · `pnpm test` → **46 files passed, 1 skipped · 429 tests passed, 2 skipped** · `pnpm build` ✓ (`all routes static (13)`).
- `pnpm exec tsx scripts/bundle-budget.ts --route / --json` → **`firstLoadJsGzipKb: 188.9`** (chunkCount 10, raw 610.9 kB). **Still over the < 180 target** despite this ticket's deletions — flagged for the orchestrator in §7.
- `pnpm test:e2e` (full suite, 4 viewport projects): **682 passed · 82 failed · 888 skipped**. All 82 failures confirmed pre-existing (verified by stashing this ticket's diff and re-running each failing spec against the TSK-37 baseline, `56d5063`):
  - 80× `eval-008.spec.ts` "no visible content text below 14px" — `DraftTag`'s "Draft — pending sign-off" renders at 12px on 20 routes × 4 widths. Unrelated to the hero; a `DraftTag`/TSK-34-era gap.
  - 2× `eval-018.spec.ts` "/about … decoration budget" (w390, w1440) — `AboutHero`'s hand-sub Caveat `<p>` ("Same curiosity → bigger problems.") has no `data-hand` wrapper. Pre-existing on `AboutHero.tsx` since TSK-23; not touched by this ticket's `AvatarStage` swap (only the illustration column changed).
  - The three sets the brief named as known-pre-existing (`.glow-halo` overflow ×11, `featured.spec` vs `ProductScene` ×5, `tracer.spec` `AVATAR_ALT` ×4) are **gone** — `.glow-halo` was deleted (dead CSS, no consumer), `FeaturedWork.tsx` no longer uses `ProductScene`, and `tracer.spec.ts`'s avatar/tile assertions were replaced per the TSK-37 note (§6.2 below). featured.spec.ts and about.spec.ts (avatar test) now pass.
- `docs/screenshots/**` churned by the e2e run were restored (`git checkout -- docs/screenshots`) before committing.

## 4. `pnpm eval --only EVAL-001,EVAL-010,EVAL-013,EVAL-018,EVAL-019,EVAL-021 --skip-build`

`evals/results/eval-run-0.2.0-f5e4149.json` — totals **4 pass · 1 fail · 16 skip · 1 manual** (of 22):

| EVAL | Status | Note |
|---|---|---|
| EVAL-001 | MANUAL | Hero gate with Tushar — TKT-74 S74.05, not this ticket |
| EVAL-010 | PASS | reduced-motion (this ticket removed the last of the JS-driven hero motion the rule used to have to account for) |
| EVAL-013 | PASS | alt-text rule |
| EVAL-018 | **FAIL** | the same pre-existing `/about` hand-sub hit as §3 (2 unparked hits, both `/about`) — not caused by this ticket |
| EVAL-019 | PASS | hero once-and-hold matrix, unaffected by this ticket |
| EVAL-021 | PASS | illustration provenance |

## 5. Screenshots (prod build, `pnpm build && pnpm start`; stale `:3000` killed first per the TSK-30 server scar)

`docs/screenshots/m-009/tracer/hero-390.png`, `docs/screenshots/m-009/tracer/hero-1440.png` — both full-page, 2500 ms settle. At 1440 the Featured Work section now renders the plain 3-up `ProjectCard` grid (TeachSpark / RailCite / Nuptis → Velora) with TeachSpark visibly wider (large `gridSize`) — confirms the `ProductScene` removal renders correctly, not just green tests.

## 6. Deviations and judgement calls (for the orchestrator)

1. **Scope beyond the brief's explicit file list.** The brief's "Scope" section names `lib/site.ts`, `tests/unit/site.test.ts`, `tests/unit/motion.test.tsx`, `AboutHero.tsx`, `FeaturedWork.tsx`, `app/globals.css`. The S73.09 **grep gate**, though, is the actual contract (`0 lines` over `app components lib hooks tests`), and `HeroActivationContext.tsx` — one of the four files the technical-plan's own delete list names — was still imported live by `app/page.tsx` (`HeroActivationProvider` wrapping the whole page) and `components/ai/AskPortfolio.tsx` (`useHeroActivation().setActive` on the Ask input's focus/blur). Deleting the file without unwinding those two call sites would have broken the build. I removed the wrapper/hook calls (both now dead — `AvatarScene`, the only thing that ever read `active`, is also deleted) rather than leave the file in place past its named deletion. `tests/unit/site.test.ts` and `tests/unit/motion.test.tsx` needed **no** edits — neither referenced `avatarAlt` or a hero motion case (TSK-37 apparently already cleared motion.test.tsx's hero cases).
2. **`Illustration id="scene-about"` renders a caption fallback, not an `<img>`.** The manifest's `scene-about` entry has no `publicSrc` (Design.md §6.1: "publicSrc … clip + poster only; scenes go through next/image" — but `Illustration.tsx`/`IllustrationImg.tsx` currently read `entry.publicSrc` directly for every placement, with no `sceneImage(id)` wiring). This is pre-existing behavior (the same pattern is already live in `app/dev/primitives/page.tsx`'s `scene-work`/`scene-casestudy` demos), not something this ticket introduced or is in scope to fix — I adjusted the `about.spec.ts` assertion to match the real, documented fallback (alt as visible caption text) rather than assert a non-existent `<img>` role. Worth a ticket if TKT-86's real rebuild needs an actual rendered photo.
3. **`firstLoadJsGzipKb` is still over budget (188.9 vs < 180)** after this delete-only diff. The brief's own gate text treats this as expected-possible ("gated at TKT-74" / TC-145, with S74.03's fallback "else open TKT-92 perf before Phase A"). I did not chase further reduction — that would be outside a delete-only ticket's scope and risks scope creep into other tickets' code. Flagging for the orchestrator to decide whether TKT-74's Phase-0 gate needs a `TKT-92 perf` ticket opened before Phase A, per EV6.

## 7. Commits

1. `f5e4149` — `refactor(hero): remove the M-008 hero motion system + ProductScene (TSK-38)`.
2. (this report + `TKT-73.md` + the two hero screenshots) — SHA in the chat reply.
