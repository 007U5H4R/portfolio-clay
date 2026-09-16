# TKT-01 fix report — EVAL-008 overflow + min-target + header height (F1/F2/F4)

**Status:** F1/F2/F4 fixed and verified. F3 left to the orchestrator per brief (consequence of F1).
F5 untouched (deferred to TKT-14/TKT-49). **One new regression found (F6, below) — needs orchestrator
attention before the visual gate.**

Model tier: sonnet. Branch: `m-001-tracer`.

---

## Fixes

### F1 — EVAL-008 home overflow at w1024 (`components/hero/AvatarStage.tsx`)

Root cause: the frame's outer `div` used fixed `w-[280px] md:w-[360px] lg:w-[480px] 2xl:w-[520px]`.
A fixed pixel width on a flex/grid descendant contributes its own width as the ancestor grid
item's automatic minimum size (CSS Grid's `min-width: auto` behaviour) — so the hero's
`lg:grid-cols-[35fr_65fr]` track could never shrink below 480px, blowing out the row at 1024px
viewport width (`scrollWidth 1188 > clientWidth 1024`).

Fix: changed the same breakpoint ladder from fixed `w-[...]` to `w-full max-w-[...]`:
```
w-full max-w-[280px] md:max-w-[360px] lg:max-w-[480px] 2xl:max-w-[520px]
```
`w-full` (a percentage) contributes no intrinsic minimum, so the grid track is now free to shrink;
`max-w-[...]` still caps the avatar at the same four target widths whenever the column is wide
enough to offer them. The `lg:grid-cols-[35fr_65fr]` ratio itself was **not** touched (per brief).

### F2 — EVAL-008 header logo target 40px < 44 (`components/navigation/Header.tsx`)

Added `min-h-11` to the logo `<Link href="/">` (was already present on the nav links). Not
allowlisted — the control is now genuinely ≥44×44.

### F4 — header rest/compact height (`components/navigation/Header.tsx`)

Root cause (as reported in TSK-07): the header's inline `style={{ paddingTop: "env(safe-area-inset-top)" }}`
unconditionally overrode the `py-7`/`data-[compact]:py-3.5` classes' top padding — `env(...)` is
`0px` on desktop, so the rest header measured 72px instead of 96.

Fixing only the override surfaced a **second, pre-existing** discrepancy: the header row's real
content height is **44px** (set by the nav links' `min-h-11` Fitts's-Law target — Design.md §3
"≥44×44 hit area"), not the 40px the `28px`/`14px` (`py-7`/`py-3.5`) paddings were sized against
(`44 + 2×28 = 100`, `44 + 2×14 = 72` — both measured and confirmed, not just calculated, via a
temporary Playwright probe against the built page). Design.md's own text specifies both "96px
rest / 68px compact" **and** "≥44×44 hit area" for the nav links; those two numbers are only
mutually consistent at **26px/12px** padding, not 28px/14px. Final implementation:

```tsx
className="... py-[26px] [--header-py:26px] ... data-[compact]:py-3 data-[compact]:[--header-py:12px] ..."
style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + var(--header-py))" }}
```

`--header-py` is a CSS custom property toggled by the existing `data-[compact]:` variant, not a
JS-computed string — see F6 for why. Verified against the built page (not just Playwright's ±2px
test tolerance): **rest = 96px exactly, compact = 68px exactly**, safe-area inset still additive
on top of both.

---

## F6 — NEW regression found during verification (needs orchestrator decision)

**`VT fallback navigates card -> case study with identical end state` (@EVAL-015) now fails at
w768 only** — a client-side (`next/link`) navigation from `/` to `/work/teachspark` under
`prefers-reduced-motion: reduce` throws a production-only, minified React error **#185
("Maximum update depth exceeded")**, caught by Next's default (uncustomized) error boundary and
rendered as "This page couldn't load" instead of the TeachSpark case study.

**This is not caused by any specific implementation detail of F4** — it was isolated by bisection
across five different header implementations (JS-computed inline style, static CSS-var-driven
style, and even a bare `py-12` with the `style` prop removed entirely). Every variant that raises
the header's total rendered height by roughly this much reproduces the crash; every variant that
leaves the (buggy, 72px) height alone does not. It reproduces both with and without the
`noViewTransitions` test fixture (i.e. with Chromium's native `document.startViewTransition` both
present and deleted), so it is not specific to the EXE-5 plain-navigation fallback path either.
It does **not** reproduce in `next dev`, only in the production build, and only at the w768
project — w390/w1024/w1440 all pass the same test. A hard reload of `/work/teachspark` alone
(no prior client-side nav) never crashes.

**Root cause not fully identified** (React's production bundle strips the component stack for
this error, and Next.js does not ship a source map for the vendored React runtime chunk, so the
call stack only shows React's own internal scheduler frames, not the offending app component).
Candidate hypotheses tested and ruled out: `scrollbar-gutter` / breakpoint-crossing from a
scrollbar appearing/disappearing (added `scrollbar-gutter: stable` to `html` as a probe — did not
fix it, reverted). Most likely candidate given the evidence (untested further due to scope):
something in the client-navigation/View-Transition path re-triggers `useScrollY`'s
(`lib/motion.ts`) rAF-batched scroll subscription abnormally fast when the page's total height
changes enough during the transition, tripping React's nested-update-depth limit — but this is a
hypothesis, not a confirmed root cause.

**This is pre-existing latent fragility, not something F1/F2/F4 introduced** — any future change
that grows the header past ~72px would hit the same wall. Recommend triaging as its own ticket
(P1 — it's a real broken user flow, not just a test) before or alongside the TKT-02 visual gate.
Options for that ticket to evaluate: harden `useScrollY`'s notify path, disable native View
Transitions for this route pairing, or a different repro/fix approach with dev-mode React
source maps forced into the production bundle for one debug session.

---

## EVAL-008 before → after

| | Before (`baseline-v1.json`) | After (`tracer-postfix.json`) |
|---|---|---|
| Status | **FAIL** | **PASS** |
| Overflow | home w1024: `scrollWidth 1188 > clientWidth 1024` | 0 overflow at 390/768/1024/1440, both routes |
| Sub-44 targets | logo link 40px tall, all widths | 0 sub-44 targets, all widths |
| Spec runs | 8 specs, 5 runs (3 didn't reach assertion) | 8 specs, 8 runs — all pass |

## Header height before → after

| State | Before | After (target) | Measured |
|---|---|---|---|
| Rest | 72px | 96px | **96px exact** |
| Compact | untested pre-fix (inline style bug zeroed top padding in both states) | 68px | **68px exact** |

## Avatar max-widths chosen (F1, per breakpoint)

`w-full max-w-[280px] md:max-w-[360px] lg:max-w-[480px] 2xl:max-w-[520px]` — same four numbers as
the original plan (280/360/480/520), now expressed as caps instead of fixed widths so the avatar
shrinks inside its actual column at any viewport. At w1024/w1440 the avatar renders narrower than
480/520 (252px / 384px measured) because the `35fr` column genuinely isn't that wide once
`lg:grid-cols-[35fr_65fr]` is left untouched — this is F3, deferred to the orchestrator's visual
review per the brief, not re-litigated here.

## Verification run

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green.
- `dotenv -e .env.tooling -- pnpm exec playwright test tests/e2e/tracer.spec.ts` — 28 passed, 3
  failed (F3's avatar-width-ladder test ×2, expected/deferred; F6 above), 29 skipped.
- 8 screenshots regenerated: `docs/screenshots/tracer/{home,case}-{390,768,1024,1440}.png`.
- `pnpm eval --label tracer-postfix --informational` → `evals/results/tracer-postfix.json`
  (`baseline-v1.json` untouched). Totals: 4 pass · 2 fail (EVAL-005 informational unchanged;
  EVAL-015 is the new F6 finding) · 7 skip · 4 manual (of 17).

## Files changed

- `components/hero/AvatarStage.tsx` (F1)
- `components/navigation/Header.tsx` (F2, F4)
- `docs/screenshots/tracer/*.png` (8 files, regenerated)
- `evals/results/tracer-postfix.json` (new)
- `docs/reports/TKT-01-fix.md` (this report)
