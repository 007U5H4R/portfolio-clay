# TKT-05 — Layout system: Container · Section · SectionHeading · Reveal · motion lib · Footer

**Milestone:** M-002 · **Branch:** `m-002-foundations` · **Stage:** 7 (Execution)
**Status:** Complete. All step gates pass; `pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep primitives` (ALLOW_DEV_ROUTES build) green; plain `pnpm test:e2e` (tracer, incl. Footer-on-`/`) green; regression eval shows no regression vs baseline.

## CRITICAL correction applied (decision TP10 / E-1)

The footer tier-2 credit line is exactly **"Built with curiosity."** — the plan's own §B S05.04 prose ("Built with Claude Code") predates decisions TP10/E-1 and is stale; `Design.md` §3, `decisions.md` (TP10), `tickets.md` AC 3, and `CONTENT_INVENTORY.md` §1.6 already carry the corrected copy. Implemented as specified in the brief: `Footer.tsx` renders `Built with curiosity.` and nowhere renders `Built with Claude Code`. The `/about` authorship colophon is out of scope (M-006, TKT-40/42).

**Stale-fixture check:** `test-cases.md` TC-029 was **already corrected** (note 5 explicitly cites "brief §39, orchestrator ruling TP10, 2026-09-15") — no stale fixture found there. `technical-plan.md` §B S05.04's inline prose is the only place still carrying the old text; it is a plan artifact, not a test fixture, so per the brief's instruction I did not edit `technical-plan.md` itself, only noted the discrepancy here.

## Per-step gates

| Step | What shipped | Gate | Result |
|---|---|---|---|
| S05.01 | `Container` confirmed already-final (no change needed — matches the gate as-is); `Section.tsx` (py rhythm 72/96/128, optional single `tone`, `...rest` passthrough for `id`/`aria-labelledby`); `SectionHeading.tsx` (eyebrow + h2 + optional lead, `max-w-[44ch]`) | Playwright computed paddings @390/768/1024/1440; container max-width 1200@1024/1320@1440; gutters 24/40/64 | **PASS** — `layout.spec.ts` "Container gutters…" + "Section vertical rhythm…" |
| S05.02 | `Reveal.tsx` (`"use client"`, IO threshold 0.2 once, `data-revealed`; `.reveal` class added only post-mount so JS-off HTML is fully visible; `--stagger-index` × 70ms) | Playwright: visible with JS disabled; reduced-motion transform never changes across frames | **PASS** — 3 layout.spec.ts tests (visible no-JS, fires-once, reduced-motion opacity-only) |
| S05.03 | `lib/motion.ts`: `fadeUp`/`staggerChildren` variants, `LazyMotionRoot` (via `createElement` — file is `.ts`); `ProgressBar.tsx` (scroll-linked `scaleX`, `role=progressbar`, `aria-valuenow` throttled to ≤4×/s). Not mounted anywhere yet — TSK-18 (M-003) wires it into the case-study shell, per technical-plan.md line 690 | TYPECHECK; jsdom `ProgressBar` exposes `aria-valuenow` | **PASS** — `tsc --noEmit`; `tests/unit/ProgressBar.test.tsx` |
| S05.04 | `Footer.tsx` (server): tier 1 headline + resume (`resumeAction()`) / LinkedIn (`ClayButton external`) / Let's Talk; tier 2 name+title, nav Work·Thinking·About·Contact, GitHub + prior-site (`ExternalLink`), **"Built with curiosity."** credit, `pb-[calc(40px+env(safe-area-inset-bottom))]`; mounted in `app/layout.tsx` after `<main>` | Playwright: footer links resolve/have correct hrefs; "Built with curiosity." present; "Built with Claude Code" absent | **PASS** — `layout.spec.ts` 2 Footer tests |
| S05.05 | `tests/e2e/layout.spec.ts` (7 tests: Container, Section, Reveal ×3, Footer ×2) | green | **PASS** |
| S05.06 | Regression + wrap | `pnpm eval --skip-build --only EVAL-008,EVAL-010,EVAL-011` no regression | **PASS** — see below |

## Test-route strategy (mirrors TKT-04's precedent exactly)

`Container`/`Section`/`SectionHeading`/`Reveal` have no real page consumer yet (page tickets adopt them from TKT-14 onward) — `TC-027`'s own precondition says "a page with ≥2 sections (`/` after TKT-14, **or `/dev/primitives` layout board before**)". So a small demo board (`data-testid="layout-demo-container"` / `"layout-demo-section"` / `"reveal-demo"`) was added to `/dev/primitives`, and the Container/Section/Reveal assertions in `layout.spec.ts` are tagged `@primitives` — same reasoning as `primitives.spec.ts` (TKT-04): the QA-only `/dev` board only renders on an `ALLOW_DEV_ROUTES` build and must not be pulled into the eval harness's plain-build grep.

- Run the dev-route assertions: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm exec dotenv -e .env.tooling -- pnpm exec playwright test --grep primitives` → **18 passed, 14 skipped** (Container ×4, Section ×4, Reveal ×3 unique tests × width-skips + `primitives.spec.ts`'s own 4).
- Footer is mounted globally (`app/layout.tsx`), so its two `layout.spec.ts` tests target `/` directly and need **no** dev-route flag — they run under the plain `pnpm test:e2e` default.

## Two real bugs found and fixed while wiring the gates

1. **Footer contrast (axe, serious):** `bg-surface` under `text-ink-3`/`text-accent` measured 4.38/4.47 — just under WCAG AA's 4.5:1. `Footer.tsx` now uses `bg-bg` (lighter L, computed 4.64/4.72), and per Design.md §3 the footer is "Flat" anyway — dropping the tint is also a spec-alignment fix, not just a workaround.
2. **`SectionHeading` eyebrow contrast on toned `Section`s (axe, serious):** the shared `ink-3` eyebrow style (copied from `Hero`, which never sits on a toned background) measures only 3.85:1 against `toneClass`'s `lavender/30` wash — a real design-system gap for any future ticket that pairs `Section tone=` with `SectionHeading eyebrow=`. Fixed by using `ink-2` for `SectionHeading`'s eyebrow (7.53:1 against the same wash, verified via the sRGB relative-luminance formula for all current tones) — a permanent primitive-level fix, not scoped to the demo.
3. **`Reveal`'s pre-reveal state was only `opacity:0`,** which (a) axe still evaluated for color-contrast (near-invisible foreground vs. background, a false-positive "serious" finding) and (b) left not-yet-revealed content focusable/announceable despite being invisible — a real a11y gap independent of the axe finding. Added `visibility: hidden` → `visible` (toggling instantly on `data-revealed`, no transition-duration on `visibility` itself) alongside the opacity/transform animation. This also matches how `Reveal` was always intended to behave once real pages start wrapping interactive content in it.
4. **`data-revealed` attribute value:** initially wrote `data-revealed={revealed || undefined}`, which serializes to the string `"true"` (custom `data-*` attributes always stringify booleans in React) rather than an empty-value presence attribute. Fixed to `revealed ? "" : undefined`, matching the existing `data-compact`/`data-active` idiom in `Header.tsx`.

## Regression (S05.06) — `evals/results/tkt05-regression.json`

Generated from real execution (`pnpm eval --skip-build --only EVAL-008,EVAL-010,EVAL-011`, plain build, no `ALLOW_DEV_ROUTES`). No regression vs the effective baseline (`tkt04-regression.json`):

| EVAL | Baseline (tkt04) | TKT-05 | Δ |
|---|---|---|---|
| EVAL-008 (responsive/targets) | PASS (8 specs) | **PASS** (8 specs, 8 runs) | none |
| EVAL-010 (reduced-motion) | PASS | **PASS** (4 specs) | none |
| EVAL-011 (dead-control crawl) | SKIP (not built — TKT-07) | **SKIP** (not built) | none |

`pnpm tokens:check` → **13/13** (no `--color-*` DEFINITIONS added or changed).

## Final gate chain

`pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm test` ✓ (89 tests, 19 files, +1 new file `ProgressBar.test.tsx`) · `pnpm build` ✓ (`all routes static (5)`) · `ALLOW_DEV_ROUTES=1 pnpm build` ✓ (same 5 routes) · plain `pnpm test:e2e --grep-invert primitives` ✓ (41 passed, 35 skipped-by-width-design) · `ALLOW_DEV_ROUTES=1 pnpm test:e2e --grep primitives` ✓ (18 passed, 14 skipped-by-width-design).

## Deviations / notes

- **Footer action-row component choice:** technical-plan.md §B S05.04 says "LinkedIn (`ExternalLink` button)". `ExternalLink` (`components/common/ExternalLink.tsx`) is documented in Design.md as an **inline running-text** primitive (WCAG 2.5.8 exception, `data-inline-link`), not an action-button component, and `ContactCard` (the component Design.md's Footer prose says to reuse actions from) does not exist yet. Interpreted "ExternalLink" as describing the external-link *behaviour*, not the literal component, and used `ClayButton ... external` for the tier-1 action row (consistent sizing/hit-target with the other two tier-1 actions); kept the literal `ExternalLink` component for the tier-2 GitHub/prior-site links, which read as inline text, not actions.
- **Footer link-resolution scope:** `/about` and `/thinking` don't exist yet (later tickets, M-003+) — same situation as `lib/nav.ts`'s existing header `navItems`, which already link to those routes today. `layout.spec.ts` asserts hrefs for all four footer nav links but only live-fetches the two routes that exist now (`/work`, `/contact`); exhaustive resolution is explicitly deferred to TC-037's crawler (TKT-07, EVAL-011) per `test-cases.md` TC-029 note 5. External links (LinkedIn/GitHub/prior-site) are asserted by exact allowlisted `href` + `target=_blank`/`rel=noopener`, not a live network fetch.
- **`ProgressBar` is unmounted by design** — the plan's own module map (technical-plan.md line 690, TSK-18) wires it into `/work/[slug]` at M-003; TKT-05's gate is TYPECHECK + the jsdom test only, not a mounted page.
- **`fadeUp`/`staggerChildren`** are exported per S05.03 for future `m.*` consumers; no current component uses them (`Reveal` is explicitly CSS-only, A6) — typecheck-only gate, as specified.
- **Pre-existing flake, not a regression:** `tracer.spec.ts`'s "hero floating tiles use the asymmetric offset ladder at lg+" failed once at w1440 under `fullyParallel` worker contention, then passed 3/3 in an isolated `--repeat-each=3` rerun; unrelated to this ticket's changes (no Hero/FloatingTiles files touched).
- **Working tree:** re-running the eval/e2e suites re-rendered `docs/screenshots/{tracer,primitives}/*.png`; left unstaged per the brief (explicit-path staging; not `git checkout`ed).

## `git diff --stat` (files staged for commit)

```
 app/dev/primitives/page.tsx           |  31 +++++++++++
 app/globals.css                       |  36 +++++++++++++
 app/layout.tsx                        |   2 +
 lib/motion.ts                         |  32 ++++++++++-
 components/interactions/ProgressBar.tsx  | new
 components/interactions/Reveal.tsx       | new
 components/layout/Footer.tsx             | new
 components/layout/Section.tsx            | new
 components/layout/SectionHeading.tsx     | new
 tests/e2e/layout.spec.ts                 | new
 tests/unit/ProgressBar.test.tsx          | new
 evals/results/tkt05-regression.json      | new
```

Screenshot re-renders under `docs/screenshots/` are intentionally excluded (unstaged, deterministic churn from running the test suites).
