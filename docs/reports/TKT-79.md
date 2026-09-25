# TKT-79 (`TASK-74`) — Home assembly + Phase A evidence — implementer report

Branch `m009/tkt-79` from `86054cc`. Model: Opus 5.5. Tushar AFK (EXE-20): calls below were made by
plan/Design precedence and need confirmation at the Phase-A checkpoint.

## Outcome in one paragraph
The home was already assembled in the right order by TKT-74/75/76/77 (hero → Featured → How I think →
Ask → band). TKT-79 adds the TC-151 checks and the Phase-A evidence. It ships **no product-code
change**. The planned whole-section `Reveal` was built, measured and **reverted** (see Call 1).
**EVAL-001 fails at 1440 (3/6)** because of the post-EXE-15 hero banner (see Call 2). That is a hero
issue for TKT-92r2 or the orchestrator, and it blocks AC3.

## AC checklist
| AC | Status | Evidence |
|---|---|---|
| 1 EVAL-018 on `/` per unit | ✅ (with measured deltas) | `home.spec.ts` "@EVAL-018 home per-section decoration counts": w1440 header 1 · hero **4** · featured 4 · how-I-think 2 · ask 2 · band 1; w390 header **0** · hero 4 · featured 4 · how-I-think **1** · ask 2 · band 1. 0 violations. `pnpm eval --only EVAL-018`: PASS, 23 routes × 2 widths, 292 units, max 4/4, 0 parked. Deltas vs the plan: hero 4 not 3 (EXE-15 banner adds the postmark; the caption is gone), the header subline is removed < 640 (`MediaGate`), and How-I-think's journey sketch renders only ≥ 1025. All are inside the ≤ 4 budget. |
| 2 EVAL-005 ≤ 180 kB | ✅ | `bundle-budget --json`: `/` **158.6 kB gz** (budget 180) |
| 3 EVAL-001 6/6 at both widths | ❌ **1440 = 3/6**, 390 = 6/6 | `evals/results/eval-001-m009-home.md`; `home.spec.ts` "@EVAL-001 …first viewport" **fails at w1440** (h1 at y 836–983 in a 900 px viewport, CTAs below the fold). I left it failing on purpose, not skipped. |
| 4 No Critical regression vs tracer baseline | ⚠️ informational only | `evals/results/eval-run-m009-phase-a-86054cc-tkt79.json` (`--only EVAL-004,EVAL-005,EVAL-018 --baseline baseline-m009-tracer.json`): EVAL-018 PASS. EVAL-004/005 FAIL are both marked *informational* (local swiftshader Lighthouse: LCP mobile 4062 ms; /work mobile 86→80, /about 86→82). The orchestrator re-measures on the preview (EXE-17). None of this is caused by TKT-79 (no product-code change). |
| 5 Approval recorded | ⏳ pending Tushar | I don't own `HANDOFF.md`/`decisions.md` in this fan-out. The orchestrator records the Phase-A checkpoint. |

TC-151 step 1 (order, fills, torn edges) is automated and passes: "TC-151 home sections alternate paper / paper-2 and open with a torn edge". Step 6 (pairs) is committed.

## Call 1 — whole-section `Reveal` on home reverted (needs an EXE-n)
S79.01 says to put `Reveal` on the three sections. I built it (wrapper `div` outside each `<section>`, 70 ms stagger, threshold 0.1) and ran it through the gate. Measured result:
- With the base `.reveal { visibility: hidden }`, every link, card and Ask input below the hero drops out of the tab order until the reader scrolls there. Keyboard users would skip from the hero CTAs to the band.
- I kept the wrappers visible (opacity/translate only) to fix that. axe then failed on `/`: **303 color-contrast nodes at w390 and 1738 at w1440**. The cause is axe scrolling nodes into view, which fires the reveal mid-fade (foreground ≈ #e1ddd7 on paper). This failed `home.spec`, `eval-006 /`, `tracer` axe and `ask-inline` axe. It also broke `eval-010` "card hover does not lift" under reduced motion (the pre-reveal `translateY(12px)` read as a 12 px lift).
- After reverting, all of those pass. How-I-think already reveals its six stage cards (TKT-76), so the home still has one reveal below the hero, as Design §8 describes.
- If a section reveal is still wanted, the recommendation is to reveal only non-focusable heading blocks inside `FeaturedWork` / `AskSection`, with the component owners, and have the axe fixtures wait for `[data-revealed]`.

## Call 2 — EVAL-001 at 1440 (blocker for the Phase-A gate)
At 1440×900 the 21:9 banner is about 590 px tall. The copy block starts at y≈780, so the h1 is clipped and both CTAs sit below the fold. Design.md line 32 no longer holds after EXE-15/Dev-21. Hero files belong to TKT-92r2, so I did not change them. The options are in `eval-001-m009-home.md`. I recommend capping the banner height on wide viewports.

## Files changed
- `tests/e2e/home.spec.ts`: 3 new tests (TC-151 fills/torn, EVAL-018 per-unit counts at 390/1440, EVAL-001 first-viewport structure).
- `docs/screenshots/m-009/home/{390,768,1024,1440}.png` (full page, reveals fired) and `home/{390,1440}-first-viewport.png`.
- `docs/screenshots/m-009/pairs/home-{1440,390}.png`: mockup `home.html` on the left, route on the right. The mockup is rendered without mobile emulation because it has no viewport meta.
- `evals/results/eval-001-m009-home.md`, `evals/results/eval-run-m009-phase-a-86054cc-tkt79.json`, this report.
- Shared-file edits: **none** (the `globals.css` TKT-79 block was reverted with Call 1).

## Gates (numbers)
- `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm tokens:check` 13/13 ✅ · `pnpm test` 54 files / 567 passed, 2 skipped ✅ · `pnpm build` ✅, all 13 routes static. `eval-018-parked.json` untouched (`[]`).
- e2e (final run, 8 specs × 4 widths: home, featured, how-i-think, ask-inline, eval-006, eval-008, eval-010, tracer): **481 passed · 21 failed · 366 skipped**. The 21 failures:
  - 1 × `home.spec` EVAL-001 at w1440 (Call 2, real finding).
  - 12 × `eval-008` "no horizontal overflow in Deep dive" on 6 case studies at w390/w768. Not caused by TKT-79: these are `/work/*` routes, which TKT-79 does not touch, and both runs show the same failures.
  - 8 × `eval-008` "no visible content text below 14px" on `/` and `/about` at all widths. Pre-existing: Featured card meta at 12 px ("AI · WhatsApp · EdTech", "as of 24 Aug 2026"), owned by TKT-75, plus `/about`.
- An earlier run over 21 home-touching specs also passed eval-002/007/011/015/017/019, lenis, layout, smoke, scene-opener and not-found. The only extra failures in that run were the ones Call 1 caused.

## Stage-8 inputs from the pairs
- 1440: the route has about 200 px of empty paper between the How-I-think cards and the Ask section. The Ask section is sparser than the mockup (short lead, a large blank left column).
- The mockup's hero is two columns (superseded by Dev-21), so its first viewport carries the h1 and CTAs; the route's does not (Call 2).
- 390: Featured cards are close to the mockup. How-I-think cards run longer because of the DRAFT tags and the "See how I tested this" buttons.

## Merge notes
- Needs an orchestrator/Tushar decision: an EXE-n for Call 1 (drop whole-section Reveal on home) and the EVAL-001 1440 fix owner (TKT-92r2 hero).
- The `home.spec` EVAL-001 w1440 test stays red until the hero change lands.
