# TKT-11 report — AskPanel slide-over + focus trap + live AskAIButton (M-003)

**Ticket:** TKT-11 · `AskPanel` drawer/bottom-sheet + `lib/focus.ts` + wire the real `AskAIButton` · **Branch:** `m-003-home`
**Model tier:** most-capable (focus trap + global panel state).
**Decisions honoured:** PB3 (6 `surface:'panel'` prompts), S7 (deterministic — `lib/ask` only, no live LLM/network), EVAL-005 (AskPanel is a lazy chunk, NOT in `/` first-load), XSS (the query is never rendered as HTML; answers come from `data/knowledge.ts` only), E-8 (400 px right drawer at 768–1023 too).

## Result summary
- `pnpm typecheck` ✅ · `pnpm lint` ✅ (0/0) · `pnpm test` ✅ (163 passed, 1 skipped) · `pnpm build` ✅ (all 6 routes static).
- `pnpm test:e2e --grep 'ask-panel|eval-007'` ✅ — **27 passed, 41 skipped, 0 failed** (viewport-gated skips only).
- `pnpm test:e2e tracer.spec eval-011-dead-controls.spec` ✅ — **37 passed** (crawler: 0 dead controls; the live `AskAIButton` registers as a working control that opens `dialog[open]`).
- `pnpm eval --only EVAL-005,EVAL-006,EVAL-007,EVAL-010,EVAL-011` → **exit 0 (clean gate)** · `evals/results/eval-run-tkt11.json`. EVAL-006/007/010/011 PASS; EVAL-005 is `[informational]` (see Bundle below).

## What changed
- **`components/ai/AskPanel.tsx`** (new) — native `<dialog>` opened via `showModal()` (focus trap + top layer for free, the proven `MobileMenu` pattern). Right drawer 400 px ≥768 / 480 px ≥1440 (2xl=1440), bottom sheet 90 vh <768 (Deviation §5). Reuses `useAsk('panel')` + `AnswerView` (idle→loading→answer→empty→error) with the 6 panel prompts; input pinned to the panel bottom. Slide-in + scrim fade are CSS off a `data-open` attribute toggled imperatively one frame after `showModal()` (so the transition runs from the shown state, not `display:none`); reduced motion collapses both via the global rule.
- **`components/ai/AskPanelLazy.tsx`** (new) — `next/dynamic(() => import('./AskPanel'), { ssr:false })`. Mounted by `AskProvider` only after the first `openPanel()`.
- **`lib/focus.ts`** (new) — `lockBackground()`: `overflow:hidden` on `<html>` + `inert` on `#main`/`header`/`footer` while open; returns an idempotent restore for the effect cleanup. (Deviation: exposed as a returns-a-restore function rather than the plan's `withInert(elements, fn)` wrapper — same responsibility, effect-shaped.)
- **`components/ai/AskProvider.tsx`** — added `panelPrompts` prop + `everOpened` gate; `openPanel()` sets both; renders `<AskPanelLazy>` only once `everOpened`.
- **`app/layout.tsx`** — hoisted `AskProvider` from `app/page.tsx` to wrap SkipLink/Header/main/Footer (global panel on every route); computes the 6 `PANEL_PROMPTS` server-side (A1) and passes them in.
- **`app/page.tsx`** — removed the page-scoped `AskProvider`; `AskPortfolio` now renders within the hoisted context.
- **`components/navigation/AskAIButton.tsx`** — removed the M-001 tracer `aria-disabled`/"coming in this build" state; it now opens the panel and records `event.currentTarget` as the focus-return trigger (works for both the header and the MobileMenu instances).
- **`app/globals.css`** — `.ask-panel` slide + `::backdrop` scrim (ink/20, 20% dim) rules.
- **`tests/e2e/crawler-allowlist.json`** — removed the `ask-ai-disabled` entry (the control is live now → `[]`).
- **`tests/e2e/{ask-panel,eval-007}.spec.ts`** — new AskPanel spec + real EVAL-007 focus-trap/return scripts (desktop + 390).
- **`tests/e2e/tracer.spec.ts`** — updated the stale S04.06 test (was asserting `aria-disabled`) to assert the live control opens the panel.

**MobileMenu.tsx — intentionally unchanged.** The shared `AskAIButton` already renders in the MobileMenu footer, so removing its disabled state is what wires the mobile Ask row. The menu is left open behind the sheet (a deliberate choice) so focus returns to the exact Ask row that opened the panel; the sheet is 90 vh so the dimmed menu behind it is barely visible.

## Gates (per plan S11.01–03, S11.06)
| Step | Gate | Status |
|---|---|---|
| S11.01 | Panel shell + lazy mount; `/` bundle unchanged; panel chunk loaded only on open | ✅ AskPanel code lives in a **separate chunk** (`1d_y6fja3fn_y.js`), NOT among the 11 `/` first-load chunks; `dialog.ask-panel` absent from the DOM until first open (e2e `@EVAL-005 lazy`) |
| S11.02 | Focus trap, inert, scroll lock, return focus | ✅ `showModal()` traps (20 Tabs never reach a page control; native wrap passes benignly through `<body>`); `#main`/`header`/`footer` inert + `html{overflow:hidden}` verified; `Esc`/scrim/close → focus returns to the trigger |
| S11.03 | Bottom sheet <768 | ✅ w390: sheet at 90 vh, input in the lower half, `noOverflow`, axe-clean open |
| S11.06 | `pnpm eval --only EVAL-005,006,007,010,011` no regression | ✅ exit 0; EVAL-006/007/010/011 PASS |

## Focus trap / EVAL-007 (the critical gate)
- Focus **enters** the panel on open (input focused), **cycles within** (20-Tab sweep reaches no `header`/`#main`/`footer` control and repeatedly lands back inside the panel), `Esc`/scrim/close-button all **close** it, and focus **returns to the trigger** (`triggerRef` = the button that opened it — verified at 1440 for the header trigger and at 390 for the MobileMenu row).
- axe **0 critical/serious** with the panel open in idle + answer at **390 and 1440**. (Fixed one contrast issue found during QA: the shared `ink-3` honesty microcopy is 4.38:1 on `bg-surface` — the panel surface was set to the lighter `bg-bg`, which clears 4.5:1.)

## Bundle impact on `/` (EVAL-005)
- `/` first-load JS = **236.7 kB gz** — **below** the pre-TKT-11 239.7 kB, i.e. TKT-11 added **nothing** to `/` first-load. The AskPanel + `lib/focus` code is in its own lazy chunk, fetched only on first open (verified: not in `/`'s prerendered HTML script/modulepreload set).
- The eval flags a `+18.0 kB` regression and a budget FAIL, both `[informational]`: they are measured against the **M-001 `baseline-v1.json` (218.7 kB, pre-Ask-feature)** and represent the cumulative TKT-09/TKT-10 Ask client JS, not this ticket. The 180 kB budget is a known over-budget carried since M-001 with first levers deferred to TKT-14/49 (F5/A14/EV2); thresholds unchanged.

## Deviations
1. `lib/focus.ts` exports `lockBackground()` (returns a restore fn) instead of the plan's `withInert(elements, fn)` — effect-shaped, same responsibility.
2. Panel surface is `bg-bg` (not `bg-surface`) so the shared `ink-3` microcopy clears WCAG AA contrast (4.38 → ~4.6).
3. MobileMenu is left open behind the sheet on mobile (rather than closed) so focus can return to the Ask row that opened the panel; documented above.

## Not staged (per brief)
- `docs/screenshots/tracer/*.png` were re-rendered by the tracer e2e run and are **left unstaged** (not `git checkout`ed).
