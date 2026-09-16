# Report — TKT-07a · Eval harness part 1 (TSK-08 Vitest layer + TSK-09 Playwright specs)

**Milestone:** M-002 · **Stage 7 (Execution)** · branch `m-002-foundations`
**Scope:** TSK-08 (S08.01–03) + TSK-09 (S09.01–03) only. TSK-10 (crawler), TSK-11 (LHCI enforcement),
TSK-12 (full orchestrator/CI/first-run) are TKT-07b — **not** touched here.

## Per-step gates (all passing)

| Step | What | Gate | Result |
|---|---|---|---|
| S08.01 | `vitest.config.ts` node+jsdom projects, jest-dom setup, JSON reporter → `.eval/vitest.json` | `pnpm test` runs both projects; `.eval/vitest.json` written | **PASS** — 22 files / 112 tests; `.eval/vitest.json` written (`numTotalTests 98→112`, `success true`) |
| S08.02 | `scripts/eval-cases.ts` (zod schema + `loadCases()` + invariants) + `evals/evaluation-plan.md` pointer | `tsx scripts/eval-cases.ts` → `17 cases OK · 14 automated · 3 manual` | **PASS** — prints exactly `17 cases OK · 14 automated · 3 manual` |
| S08.03 | `lib/format.ts` (`formatAsOf`/`formatRange`/`formatNumber`/`readingTime`) + tests | UNIT green | **PASS** — `tests/unit/format.test.ts` 9/9 |
| S09.01 | `fixtures.ts` finalised: `keyboardOnly` (3px accent ring per Tab) + `consoleErrors` collector | `pnpm test:e2e --grep @smoke` green | **PASS** — 2 passed (w1440), 6 skipped (other widths, by design) |
| S09.02 | Per-EVAL spec skeletons `eval-00{2,6,7,8,10,14,15}.spec.ts`, live/fixme, `@EVAL-0xx` in title | `--list \| grep -c '@EVAL-'` ≥ 8; no automated EVAL id missing | **PASS** — 116 `@EVAL-` lines; `--check-specs` → `spec coverage OK · 8 Playwright-automated ids tagged · deferred: EVAL-011 (TKT-07b)` |
| S09.03 | `tests/e2e/routes.json` + `routes.ts` loader (sitemap-preferred) | unit test for loader fallback order | **PASS** — `tests/unit/routes.test.ts` 5/5 |

### The `17 cases OK…` line (S08.02)
```
$ pnpm exec tsx scripts/eval-cases.ts
17 cases OK · 14 automated · 3 manual
```
Automated = EVAL-002,004,005,006,007,008,010,011,012,013,014,015,016,017 (14). Manual = EVAL-001,003,009 (3).

### EVAL spec count (S09.02)
`playwright test --list | grep -c '@EVAL-'` = **116** (token embedded in each test title; the `{ tag }`
option is kept so `--grep @EVAL-0xx` and the JSON-reporter mapping in `scripts/eval.ts` still work).
Distinct new ids: EVAL-002, 006, 007, 008, 010, 014, 015. `--check-specs` confirms every
Playwright-automated id has a spec except EVAL-011 (dead-control crawler, explicitly deferred to TKT-07b).

## Live vs fixme (per-EVAL specs)

| Spec | Live now | `test.fixme` (not-yet-built / out-of-scope, with owner) |
|---|---|---|
| eval-002 | `/ → /work → /work/teachspark → /contact` hops resolve (200 + heading); home links to case study | Full click-counted journey incl `/about` + resume 200 → **TKT-42 / TKT-08** |
| eval-006 | axe WCAG2.1AA on all 4 public routes @ 390/1440 | AskPanel-open axe → **TKT-10** |
| eval-007 | desktop-nav keyboard focus-ring sweep; MobileMenu open/trap/Esc/restore | Ask panel, FilterTabs, Timeline, ShowTheThinking, CopyButton keyboard → **TKT-10/16/17/13/45** |
| eval-008 | no-overflow on all 4 routes; 44px targets on `/`, `/work`, `/work/teachspark` | `/contact` 44px targets + 14px text floor → **see findings below** |
| eval-010 | reduced-motion: header transition collapses, card hover no lift | Ask/thinking/story/parallax reduced-motion → **TKT-10/13/16/21** |
| eval-014 | — (DemoVideo not built) | all 5 states + file-size assertions → **TKT-18 / TKT-22..27** |
| eval-015 | VT-off identical end state; JS-off static content + nav links | missing-hero-image placeholder → **TKT-18/19** |

Also added: `tests/e2e/smoke.spec.ts` (@smoke, exercises both new fixtures).

## Findings surfaced by the broadened sweep (real, pre-existing, OUT OF SCOPE for TKT-07a)

The harness works — broadening EVAL-008 to all routes surfaced two genuine defects in already-shipped
code (TKT-04/05/06). They are **not weakened and not faked green** (EV2): the assertion is kept and
`test.fixme`'d with the owner, so it flips to live once fixed.

1. **EVAL-008 · 14px text floor** — eyebrows ("Senior Product Manager"), the "TP" monogram, and the
   floating-tile captions render at **12–13px**, below the design's own caption token
   (`--text-caption: 0.875rem` = 14px) and EVAL-008's stated floor. Global via Header/hero/tiles.
   **Owner: TKT-04/05 components** + a threshold-owner ruling on whether overline/eyebrow microcopy is
   an accepted exception (à la the WCAG 2.5.8 inline-target exception already in `MIN_TARGET_ALLOWLIST`).
2. **EVAL-008 · `/contact` 44px target** — the "email me" link is **80×26** (height < 44) and is not
   marked `data-inline-link`, so it is neither a 44px control nor a declared inline exception.
   **Owner: TKT-06 (contact page)** — mark it inline or enlarge it.

## `pnpm test:e2e` status (Finish gate)

- **Non-dev suite green:** `pnpm test:e2e --grep-invert @primitives` → **95 passed, 137 skipped, 0 failed**
  (fixme'd specs skip; viewport-scoped tests skip off-width). Includes every new spec + @smoke.
- **Pre-existing caveat (not introduced here):** the 14 `@primitives` tests (`layout.spec.ts` /
  `primitives.spec.ts`) fail under a plain `pnpm test:e2e` because `/dev/primitives` is baked as a static
  404 unless the site is **built** with `ALLOW_DEV_ROUTES=1` (runtime env is not enough — the route is
  prerendered). `primitives.spec.ts`'s own header documents this as a separate QA job
  (`pnpm test:e2e --grep primitives` on an ALLOW_DEV_ROUTES build). My changes do not touch those specs,
  the dev route, or the build; this is unrelated to TKT-07a.

## Baseline / other gates
- `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm test` ✓ (112) · `pnpm build` ✓ (`all routes static (5)`).
- Colour DEFINITIONS unchanged (no token edits; `pnpm tokens:check` unaffected).
- `.eval/vitest.json` is git-ignored; no `docs/screenshots/**` changes were produced (re-renders were
  byte-identical). Staged with explicit paths only.

## `git diff --stat` (this ticket)
See the commit `feat(m002): TKT-07a eval harness pt1 (vitest projects + playwright specs)`.
Files: `vitest.config.ts`, `tests/setup/jest-dom.ts`, `scripts/eval-cases.ts`, `evals/evaluation-plan.md`,
`lib/format.ts`, `tests/unit/format.test.ts`, `tests/unit/routes.test.ts`, `tests/e2e/routes.json`,
`tests/e2e/routes.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/smoke.spec.ts`,
`tests/e2e/eval-00{2,6,7,8,10,14,15}.spec.ts`.
