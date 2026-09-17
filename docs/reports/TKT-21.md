# TKT-21 report — `ShowTheThinking` interactive reveal + `/dev/thinking` board (M-004)

**Ticket:** TKT-21 · `ShowTheThinking` + `ThinkingNode` 8-node reasoning-chain reveal · **Branch:** `m-004-work`
**Scope:** the reusable `ShowTheThinking`/`ThinkingNode` components and their QA-only fixture board.
Real project `thinking` chains are **out of scope** (M-005 content tickets, e.g. TKT-28) — every
project's `thinking` is `[]` today, so the component currently renders nothing anywhere it isn't
explicitly mounted with fixture data. Wiring it into the real `/work/[slug]` chapter flow below
chapter 08 is TKT-19's job, not this ticket's.

## What was built

- `components/interactions/ThinkingNode.tsx` — one row of the chain: stage icon/label, text, and
  an optional inline link to the chapter anchor the node's source backs.
- `components/interactions/ShowTheThinking.tsx` — the toggle + `<ol>` of 8 `ThinkingNode`s. Hidden
  entirely when `chain.length === 0` (AC 1). Never auto-plays.
- `app/dev/thinking/{page.tsx,fixtures.ts}` — the QA-only board: an illustrative TeachSpark chain
  (5 of 8 nodes reuse verbatim, already-sourced copy — 3 from `data/thinking-framework.ts`'s
  TKT-13 verified quotes, 2 from `teachspark`'s own verbatim `overview`/`tagline`; the other 3 say
  plainly their note "is not yet recorded", the same convention the schema already uses for a real
  content gap) plus a second section demonstrating the empty-chain case (AC 1).
- `tests/e2e/thinking.spec.ts` — the `@thinking` board gate (axe/no-overflow/44px/screenshots,
  matching `artifacts.spec.ts`) plus real behavioural tests: DOM-presence-before-open, toggle
  reveal, never-auto-plays, `@EVAL-007` keyboard, `@EVAL-010` reduced motion.
- `tests/unit/thinking-motion.test.ts` — greps `app/globals.css`'s `.thinking-node(s)` rules and
  fails if any transition lists a property outside `opacity`/`clip-path`/`transform` (Design.md §4
  hardware-acceleration rule; the exact check technical-plan.md's TKT-21 row calls for).
- `app/globals.css` — `.thinking-nodes`/`.thinking-node` reveal rules + reduced-motion override.
- `data/schema.ts` — added `export type ThinkingNode`/`ThinkingChain` (the zod schemas already
  existed; only the `z.infer` type aliases were missing — same minimal addition TKT-20 made for
  `SourceRef`, no schema behaviour change).
- `tests/e2e/routes.json` — added `/dev/thinking` to the `dev` route inventory (so EVAL-006/008
  sweep it automatically under `ALLOW_DEV_ROUTES=1`).
- `tests/e2e/eval-007.spec.ts` / `eval-010.spec.ts` — narrowed the stale fixme lists now that
  ShowTheThinking's keyboard and reduced-motion behaviour are real, in `thinking.spec.ts`.

## Accessibility pattern chosen (per the ticket's "pick one and document it")

The `<ol>` of 8 nodes is **always in the DOM**, in source order, before the toggle is ever opened —
the Reveal pattern (animation is an enhancement layered on real content, never a JS-off
content-hider), not a conditionally-rendered panel. The `.thinking-nodes` class that visually
collapses it (`visibility:hidden` — removed from the accessibility tree and tab order, the same
technique `.reveal` uses) is applied only **after mount** (`useMounted`, mirroring `Reveal.tsx`
exactly), so with JavaScript disabled the class never lands in server-rendered HTML and every node
renders fully visible immediately. Because the collapsed nodes are removed from the accessibility
tree while JS is controlling them, the toggle's own accessible name carries a `VisuallyHidden`
"— 8-step reasoning chain, expand to read" so a screen-reader user knows the chain exists before
opening it (no extra `aria-describedby`/id wiring needed — it's just part of the button's label).

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `pnpm test` (unit) | 188 passed / 1 skipped (36 files), incl. new `thinking-motion.test.ts` (2 passed) |
| `pnpm build` (plain) | all routes static (9); `/dev/thinking` prerendered |
| `/dev/thinking` guard | **404** on a plain `pnpm build && pnpm start` (curl-verified) · **200** on `ALLOW_DEV_ROUTES=1 pnpm build && pnpm start` (curl-verified, `<h1>Show the thinking</h1>` renders) |
| `pnpm test:e2e --grep thinking` | **plain build:** 24 skipped, 0 failed (every dev-board case correctly SKIPs, never fails — same pattern as `artifacts.spec.ts`). **`ALLOW_DEV_ROUTES=1` build:** 21 passed, 19 skipped (width-gated by design), 0 failed |
| `ALLOW_DEV_ROUTES=1 pnpm test:e2e` (full suite) | 293 passed, 331 skipped, **4 failed — all pre-existing, none touch anything this ticket changed** (`ask-panel.spec.ts` 44px, `tracer.spec.ts` hero-avatar-responsive and hero-floating-tiles-offset-ladder ×2). Confirmed unrelated: `git diff --stat` for this branch touches only `app/globals.css` (new `.thinking-node*` rules only), `data/schema.ts` (2 new type-only exports), `tests/e2e/{eval-007,eval-010}.spec.ts` (docstrings/fixme lists), `tests/e2e/routes.json` — nothing in `components/hero/`, `components/ai/`, or `tracer.spec.ts`. Re-running the failing tests in isolation on a fresh build passed every time; a repeat full run failed a *different* 44px boundary test each time (`ask-inline.spec.ts` once, `ask-panel.spec.ts` the next) — consistent with the pre-existing host-resource-contention flakiness `playwright.config.ts` already documents ("only workers:1 was reliably green"), not a regression from this change |
| `pnpm eval --only EVAL-003,EVAL-006,EVAL-007,EVAL-008,EVAL-010` | 2 runs: `evals/results/tkt-21-eval.json` and `tkt-21-eval-2.json` — both **3 pass · 1 fail · 12 skip · 1 manual (EVAL-003)**, **`regressions: []` both times** (the one EVAL-008 failure was a different sub-pixel 44px boundary case each run — `ask-inline`'s "RailCite" pill then `ask-panel`'s controls — and passed clean in an isolated rerun; baseline-diffed regression check confirms it is not new) |

Eval evidence: `evals/results/tkt-21-eval.json`, `evals/results/tkt-21-eval-2.json` (left unstaged
per commit-staging rule, matching the pre-existing `evals/results/*.json` gitignore pattern).
Board screenshots: `docs/screenshots/thinking/{390,1440}.png` (left unstaged).

## Deviations / notes for downstream

- The dev-board fixture's 3 "not yet recorded" nodes (`observation`, `hypothesis`, `prototype`)
  are an honest placeholder, not fabricated content — TKT-28 (M-005) should replace all 8 with
  TeachSpark's real chain once written.
- `ThinkingNode`'s source link uses `data-inline-link` (the existing `ExternalLink`/`minTargets`
  allowlist exemption for running-text links), not a `ClayPill`/`ClayButton` — matches Design.md's
  "stage label + text + source link" wording without over-styling 8 stacked rows.
- TKT-19 should mount `<ShowTheThinking chain={project.thinking} sources={project.sources} />`
  below chapter 08; no changes needed here to support that — the props (`chain`, `sources`) match
  the schema shapes `Project` already exposes.

## Blockers

None.
