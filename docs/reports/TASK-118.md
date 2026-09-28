# TASK-118: Band footer headline with a cycling italic verb

**Branch:** `m009/task-118` (from `m-009-redesign` @ `a9cb3c4`; latest base merged at `9e46ea6`, TASK-117 Done). **Direction:** Tushar, 2026-09-28: "I want the bottom footer to change the italics text from Build, design etc. like in the recording." The recording was used for its motion only.

## What changed and where
- `components/layout/BandVerb.tsx` (new, client island). It exports `BAND_VERBS = build, ship, design, fix, create, rethink` and renders `<em class="band-verb">` with an sr-only "build" and an `aria-hidden` stack of the six verbs. One mount effect decides reduced motion once (the TP13 pattern). Otherwise, an IntersectionObserver plus `visibilitychange` write `data-cycle="run"` while the band is in view and the tab is visible, and `data-cycle="paused"` after that. There's no React state, and nothing runs before the band has been seen.
- `components/layout/BandFooter.tsx`: `Let's <em>build</em>` becomes `Let's <BandVerb />`. Line 2 is unchanged, and the footer is still a server component.
- `app/globals.css`, in the block `/* TASK-118 … */ … /* end TASK-118 */`:
  - The words stack in one `inline-grid` cell. The box is as wide as the widest verb, so "Let's", the `<br>` and line 2 never move.
  - `overflow: clip` (not `hidden`, which would move the baseline) keeps the vertical slide inside the word box, clear of the eyebrow.
  - Padding plus an equal negative margin leaves room for descenders and italic overhang.
  - Paper tokens only. The word keeps the existing `.band-h em` style (note colour, SOFT 60).
- `Design.md`: a §8 motion row "Band headline verb" and §11 **Dev-108**, disposition "Tushar, 2026-09-28 (TASK-118)". Dev-105 to 107 were taken by TASK-117 at merge time. Dev-108 records the exception to §8's "no continuous motion".

## Timing (one 15 s CSS loop, 6 × 2.5 s)
| Phase | Duration | Keyframes | Curve |
|---|---|---|---|
| Enter from below (`translateY(100%)` → 0) + fade in | 280 ms | 0 → 1.867 % | `cubic-bezier(.2,.7,.2,1)` |
| Hold | ≈ 1.84 s | → 14.133 % | — |
| Exit upward (0 → `translateY(-100%)`) + fade out | 280 ms | → 16 % | `cubic-bezier(.4,0,.2,1)` |
| Empty beat before the next verb | 100 ms | (next delay) | — |

- **Delays:** each verb is offset by 2.5 s, starting at −0.28 s, so "build" is already settled when cycling starts.
- **Specificity fix:** the delay selectors include `[data-cycle]` to out-rank the `animation` shorthand. The first version didn't, the shorthand reset every delay to 0 and all six verbs moved together. `band-verb.spec` caught it and the fix is in `f342e3d`.

## Accessibility
- The heading's accessible name stays "Let's build something people can use.": sr-only "build", verbs `aria-hidden`, no `aria-live`.
- Axe is clean on the band and on every route at all four widths.
- Under `prefers-reduced-motion: reduce`, `data-cycle` is never set and a media query adds `animation: none` as a backstop. The verb stays "build" with zero animations on the stack, so EVAL-010's route sweep is unaffected.
- EVAL-018 counts are unchanged, since the verb is copy, not a `data-decor`.

## Tests
- **Unit** (`tests/unit/band-footer.test.tsx`, +3 cases): six verbs in order, all `aria-hidden`; the static sr-only sentence; no `aria-live`; line 2 intact. Cycling starts only once in view and pauses on leaving. Under reduced motion no observer is created and nothing cycles. The existing heading test now asserts the accessible name instead of `textContent`.
- **e2e** (`tests/e2e/band-verb.spec.ts`, new):
  - At w1440 the visible verb changes over time in `BAND_VERBS` order, with axe clean on the band.
  - The h2 width and height and the line-2 and hiring-line offsets are identical across a full 15 s cycle (> 50 samples), which demonstrates CLS 0.
  - The verb box is at least as wide as the widest verb and uses `overflow: clip`, with no horizontal overflow at every width.
  - Under reduced motion the verb stays "build" for 3 s and there are no animations.
- `tests/e2e/home.spec.ts`: the band headline assertion moves to `toHaveAccessibleName`.

## Gate (after merging `m-009-redesign` @ `9e46ea6`)
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`: all green. Unit tests: 638 passed, 2 skipped. All 15 routes static.
- e2e through the lock (`band-verb`, `layout`, `parallax-stacking`, `torn-parallax`, `home`, `eval-006/007/008/010/018`; 4 projects): **633 passed, 0 failed**, 687 skipped by project gating.
- An earlier run on this branch had 77 failures. They were timeouts on `goto` or `networkidle`, and that run took 47.8 min against 19.7 min for the clean one, with the machine under load. All 24 w1440 eval-006 cases passed alone on a fresh server, and the full rerun above is green.
- The only real failure was `band-verb`'s delay bug, now fixed.
- Bundle budget for `/`: **160 kB gzip first-load JS** (163 859 B; budget 180). The `BandVerb` module is about 0.9 kB raw, about 0.4 kB gzipped, inside a shared chunk.

## Screenshots (`docs/screenshots/m-009/task-118/`)
- `1-build.png`, `2-build-exit.png`, `3-ship-enter.png`, `4-ship.png`, `5-design.png`: the h2 at w1440 through the first two transitions.
- `band-1440.png`: the whole band.
- `band-390-reduced-motion.png`: the static "build" at w390.
