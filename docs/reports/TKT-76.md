# TKT-76 (TASK-71) · How I think — report

Branch `m009/tkt-76` · implementer Opus 5.5 · TC-148.

## AC checklist
| AC | Evidence |
|---|---|
| 1 six stages, wording from data, quote ≤ 240 + cite | `tests/unit/how-i-think.test.tsx`: label/principle/quote/attribution equal `data/thinking-framework.ts`; the longest quote is 195 chars, each with a `<cite>` sibling in the same card; one `DraftTag` per card (DRAFT principle) |
| 2 links resolve to case-study anchors | unit: every pill href ∈ `routes()` (`lib/anchors.ts`); e2e `@EVAL-011`: all 6 return 200 |
| 3 EVAL-018 count 2 @1440 / 1 @390, `data-hand` on Caveat | unit (matchMedia on/off) + e2e `@EVAL-018` (section count, plus no Caveat element without `data-hand`); full `eval-018.spec.ts` green at w390/w1440; `pnpm eval` EVAL-018 PASS (23 routes × 2 widths, max 4/4, 0 unparked) |
| 4 only the pills are focusable; roving code removed; spec rewritten | unit: 6 focusables, all `<a>`, no `[tabindex]`/`[aria-expanded]`; source grep for `roving\|tabIndex={-1}` → 0; e2e `@EVAL-007`: Tab from the heading hits the 6 pills in order, and the 7th Tab leaves the section |
| 5 Reveal stagger 70 ms, reduced motion instant | e2e `@EVAL-010`: delays 0/0.07/…/0.35 s; under reduced motion: opacity only, 0 s delay, ≤ 1 ms |

## Files changed
- `components/home/HowIThink.tsx`: now a server component: `section#how-i-think` + `TornEdge`, head, six `Sheet card` + `Pin` inside `Reveal`, `Sketch variant="journey"` inside `MediaGate min={1025}`. The `tone` prop is dropped from `HowIThinkStage`.
- `lib/stages.ts`: adds `stagePin` (rust/forest/steel, from the mockup's `.stage .pin`). `stageTone` is kept only because the schema requires `tone`.
- `tests/unit/how-i-think.test.tsx` (new), `tests/e2e/how-i-think.spec.ts` (rewritten; the expand/roving tests were removed along with the behaviour, as the AC requires).
- `docs/screenshots/m-009/home/how-i-think-{390,1440}.png`

## Shared-file edits
- `app/globals.css`: one appended block `/* TKT-76 · how I think … */ … /* end TKT-76 */` (`.hit*` classes + `.sketch[data-sketch="journey"]`).
- `components/paper/sketch-paths.ts` (not in the ownership table; the dispatch asked for a new Sketch variant): `"journey"` added to `SketchLineVariant` and a `journey` entry in `SKETCHES` (home.html `.journey .path`, verbatim, viewBox 0 0 1200 320). Additive only.

## Gates
typecheck 0 · lint 0 · tokens 0 · unit (full) 0 · build 0 · e2e w390+w1440 `how-i-think` + `home` + `eval-018`: 64 passed / 14 skipped / 0 failed (after one fix: the axe check had measured cards mid-fade, so the spec now waits for opacity 1) · `pnpm eval --only EVAL-003,007,011,018 --skip-build`: EVAL-007 PASS, EVAL-011 PASS, EVAL-018 PASS, EVAL-003 MANUAL (by design).

## Merge notes
- `app/page.tsx` (not mine) still passes `tone:` in `HOW_I_THINK_STAGES`. That typechecks, because `map` has no excess-property check, but the line is dead; drop it at merge.
- `.hit` uses `margin-top:-44px; z-index:3` and a transparent top strip, so the torn edge overlaps Featured's bottom. It shows only once TKT-75 gives `#work-featured` its `paper-2` fill. If TKT-75 gives Featured a z-index ≥ 3, the tear goes underneath it.
- `section#how-i-think` is no longer a `Section` primitive. `home.spec` measures rhythm on `#ask` only, so nothing breaks.
