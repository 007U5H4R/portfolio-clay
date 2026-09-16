# F6 debug report — client-side nav update loop (React #185)

**Ticket:** TKT-01 fix loop, round 2. **Branch:** `m-001-tracer`. **Status:** root-caused and fixed.

## Symptom

In the **production** build only, at viewport **w768** only, under **reduced motion**, a client-side
(`next/link`) navigation from `/` to `/work/teachspark` threw minified **React error #185**
("Maximum update depth exceeded" — an infinite render/update loop). Next's default error boundary
caught it and rendered "This page couldn't load" (`<h1>This page couldn't load</h1>`) instead of the
TeachSpark case study, failing the e2e test `VT fallback navigates card -> case study` (@EVAL-015).
Did not reproduce in `next dev`, at other widths, or with the original (short) header.

## Confirmed root cause — a layout-feedback oscillation (Schmitt-trigger with too-narrow band)

`Header` is a `position: sticky`, **in-flow** element. Its height toggles between **96px (rest)** and
**68px (compact)** — a **28px delta** — driven by `useScrollY(24)` in `lib/motion.ts`, which returns
`window.scrollY > 24` through a `useSyncExternalStore`.

Because the sticky header sits in normal flow, its height is part of the document's scrollable
height. So compacting the header **reduces the document's scroll range by 28px**, which **clamps
`window.scrollY` down by up to 28px** — and `window.scrollY` is the exact input the compaction
decision reads. The effect mutates its own cause.

On the tracer case-study page at w768 (viewport height 1024), the measured scroll geometry is:

| header state | header height | document scrollHeight | maxScroll (`scrollHeight − 1024`) |
|---|---|---|---|
| rest | 96px | 1065px | **41px** |
| compact | 68px | 1037px | **13px** |

41px and 13px **straddle the single 24px threshold**. The loop, captured live by instrumenting
`getSnapshot` during the failing nav (114+ reads before the crash; every pair is React's
render + post-commit tearing re-check):

```
… {y:41,r:true} {y:41,r:true} {y:13,r:false} {y:13,r:false} {y:41,r:true} {y:13,r:false} … (∞)
```

1. Nav settles scrollY at the rest maxScroll, **41**. `41 > 24` → **compact**.
2. Header shrinks 96→68 → document loses 28px → browser clamps scrollY **41 → 13**.
3. `useSyncExternalStore`'s post-commit tearing check re-reads `getSnapshot`: `13 > 24` is false →
   **un-compact**.
4. Header grows 68→96 → scroll range returns to 41 → scroll restoration/anchoring lifts scrollY
   back to **41** → back to step 1. React trips the nested-update-depth limit → #185.

**Why only w768:** only there does the short case page's scroll range land in the danger zone —
above the threshold with the tall header (41 > 24) yet below it with the compact header (13 < 24).
At w390/w1024/w1440 the page is either not scrollable past the threshold in either state or well past
it in both, so the toggle never flips.

**Why only production:** dev's non-batched, StrictMode double-invoked scheduling doesn't drive the
synchronous render → commit → tearing-recheck cycle tightly enough to hit the depth limit; the
production build does.

**Why the original short (72px) header didn't reproduce:** with the shorter header the case page's
total height at w768 was ≤ viewport (maxScroll below the threshold in both states), so scrollY never
crossed 24 and the toggle never flipped. Any change that grew the header past ~72px armed the trap —
which is exactly what F4 (correct 96px height) did. F4 did not *cause* the bug; it exposed
pre-existing latent fragility.

## The fix (root cause, minimal)

Give the compaction toggle **hysteresis** (a Schmitt trigger) with a dead band **wider than the
header height delta**. `useScrollY(enter, exit)` now latches: it turns true above `enter`, false
below `exit`, and **holds** its value in between.

- `components/navigation/Header.tsx`: `COMPACT_ENTER = 40`, `COMPACT_EXIT = 8` (band = **32px**).
- `lib/motion.ts`: `useScrollY(enterThreshold, exitThreshold)` with a latched `useRef`.

**Why this is provably sufficient, not just tuned to 41/13:** the loop requires the toggle to flip
*both* ways under a scroll change of at most the header delta `Δ`. Entering compaction requires
`scrollY_rest > enter`; the clamp then drops scrollY by at most `Δ`, so exiting requires
`scrollY_rest − Δ < exit`, i.e. `scrollY_rest < exit + Δ`. Both can hold only if
`enter < exit + Δ` ⟺ **`enter − exit < Δ`**. Keeping the band `enter − exit = 32 ≥ Δ = 28` makes the
flip range empty — impossible by construction. Verified against the live geometry: after step 1
(compact, scrollY clamped to 13), `13` is inside `[8, 40]`, so the state latches compact and settles
at scrollY 13. No loop.

`COMPACT_ENTER (40)` is still well below the 240px the S04.03 compaction test scrolls to, so
rest→compact behaviour is unchanged; `COMPACT_EXIT (8)` still expands the header near the top.

## Regression scar

`tests/e2e/tracer.spec.ts` → **`F6: card -> case study nav does not trip a render loop (React #185)`**
(`@EVAL-015`), run at all four widths: it navigates `/`→`/work/teachspark` under reduced motion +
`noViewTransitions`, asserts the `<h1>` reads **"TeachSpark"** (not the error boundary), and asserts
**no `pageerror`** containing "Maximum update depth" / "#185" fired during the nav. Confirmed to fail
on the pre-fix build and pass after.

## Hypotheses ruled out

- **`scrollbar-gutter` / a scrollbar appearing on breakpoint crossing** — ruled out earlier
  (TKT-01-fix.md); `scrollbar-gutter: stable` on `html` did not change the behaviour.
- **Specific to the F4 header implementation (JS inline style vs CSS var)** — ruled out by TKT-01's
  bisection: every variant that raised the header height reproduced it; the mechanism is the height
  delta, not how it is applied.
- **Specific to the EXE-5 plain-nav fallback / native View Transitions** — ruled out: reproduces with
  `document.startViewTransition` both present and deleted.
- **A stale re-render guard being too low** — rejected as a non-fix; it would only mask the loop.
  The oscillation is real layout feedback and is eliminated at the source by the hysteresis band.

## Verification

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green (unit: 48 passed).
- `@EVAL-015` e2e — **9 passed, 3 skipped, 0 failed** across w390/w768/w1024/w1440 (incl. the new F6
  regression test at every width).
- Full `tracer.spec.ts` — 33 passed, 2 failed (both the pre-existing, orchestrator-deferred F3
  avatar-width-ladder tests at w1024/w1440; unrelated to F6), 29 skipped.
- `pnpm eval --label tracer-postfix2 --informational` → `evals/results/tracer-postfix2.json`
  (baseline-v1.json / tracer-postfix.json untouched): **5 pass · 1 fail · 7 skip · 4 manual**.
  EVAL-015 now **PASS** (was the F6 FAIL); the only remaining fail is EVAL-005 (informational,
  pre-existing, unchanged).
