# TKT-10 report — Ask inline UI (AskProvider + AskPortfolio + AnswerView) (M-003)

**Ticket:** TKT-10 · `AskPortfolio` inline field + `useAsk` + views · **Branch:** `m-003-home`
**Scope:** the HOME inline Ask surface + the `AnswerProvider` wiring. The slide-over `AskPanel` and the header `AskAIButton` wiring are TKT-11 (not touched here).
**Decisions honoured:** S7 (deterministic — the UI calls `lib/ask` only; no live LLM, no network), PB3 (5 `surface:'home'` prompts), DRAFT-labelling where `draft:true`, EVAL-013 (every answer shows resolving EvidenceLinks), XSS (the user query is never rendered as HTML — answers come from `data/knowledge.ts` only).

## Result summary
- `pnpm typecheck` ✅ · `pnpm lint` ✅ (0/0) · `pnpm test` ✅ (163 passed, 1 skipped) · `pnpm build` ✅ (all routes static).
- `pnpm test:e2e --grep ask-inline` ✅ — 15 pass on a normal build (idle/answer/empty/keyboard/a11y/targets on `/`); 17 pass under `ALLOW_DEV_ROUTES=1` (adds the error + loading dev-fixture states). Dev-route tests SKIP (never fail) on a normal build, mirroring `primitives.spec.ts`.
- `pnpm eval --only EVAL-007,EVAL-008,EVAL-010,EVAL-012` → **4 pass · 0 fail · regressions: [] · criticalFailures: []** (`evals/results/tkt-10.json`). EVAL-007 PASS (critical), EVAL-012 PASS (critical), EVAL-010 PASS, **EVAL-008 improved FAIL → PASS**.

## Four screen states (all verified)
| State | Where verified | Evidence |
|---|---|---|
| idle (suggested prompts) | `/` e2e + `ask-ui.test.tsx` + `docs/screenshots/ask/idle-{390,1440}.png` | honesty microcopy + 5 SuggestedPrompts; axe-clean |
| answered | `/` e2e (type + Enter) + unit + `answer-{390,1440}.png` | "Answer" heading (focus target) + verbatim text + DRAFT badge + 3 resolving EvidenceLinks + microcopy + "Ask another"; URL unchanged; page still scrolls; card grows to ≥240px |
| no-match (empty) | `/` e2e (off-topic query) + unit + `empty-{390,1440}.png` | FALLBACK text + 3 fresh prompts, never an answer heading |
| error | `/dev/ask?mode=error` e2e + unit + `error-{390,1440}.png` | `ink` on `blush` flat surface + AlertTriangle + "Try again" (colour never alone); NO honesty microcopy (S10.03) |
| (loading) | `/dev/ask?mode=slow` e2e + unit + `loading-{390,1440}.png` | 2-line shimmer, `role="status"` + `aria-busy`, "Looking through the portfolio…"; ≥150 ms skeleton floor |

## Accessibility (EVAL-007) result
- Keyboard path verified at w1440: **field → suggested prompts → (submit via Enter) → answer heading (focus moves, not trapped) → evidence links → "Ask another"**, every focus-visible stop wearing the shared 3px accent ring (`keyboardOnly` fixture, 16 tabs).
- Targets ≥44px (EVAL-008): input 56px, submit 56×56, every pill min-h-11 — scoped `#ask` control sweep = 0 undersized across all four viewports.
- No console errors; reduced motion honoured (EVAL-010): the answer still resolves and the content settles with no lingering transform.

## Per-step gates
| Step | What | Gate | Status |
|---|---|---|---|
| S10.01 | `components/ai/AskProvider.tsx` (`useAsk` state machine + 150 ms floor) + `tests/unit/use-ask.test.tsx` | UNIT: idle→loading→answer; loading ≥150 ms; throw→error→retry; reset→idle | ✅ 6 tests |
| S10.02 | `SuggestedPrompts.tsx` + `EvidenceLinks.tsx` | jsdom: 5 prompts → 5 buttons; https evidence gets `rel="noopener"` | ✅ (`ask-ui.test.tsx`) |
| S10.03 | `AnswerView.tsx` (answer/empty/error + skeleton) | jsdom renders all four sub-states from props; S7 microcopy in idle+answer, not error | ✅ (`ask-ui.test.tsx`, 8 tests) |
| S10.04 | `AskPortfolio.tsx` in-place expansion + `app/page.tsx` mount | Playwright w1440: Enter → URL unchanged, focus on answer heading, page still scrolls, card 64→≥240px | ✅ |
| S10.05 | `app/dev/ask/page.tsx` (+`AskDevBoard.tsx`) fixture | `ALLOW_DEV_ROUTES=1` → each `?mode` renders its state; 10 PNGs in `docs/screenshots/ask/` | ✅ (10 shots captured) |
| S10.06 | `tests/e2e/ask-inline.spec.ts` | `--grep ask-inline` green; keyboard order; wrap to 2 rows @390; axe 390/1440; skeleton ≥150 ms | ✅ |
| S10.07 | Regression + bundle record | `pnpm eval --only …` no regression; bundle delta recorded | ✅ (see below) |

## Deviations (documented)
1. **zod removed from the client bundle (necessary fix).** TKT-10 is the first client consumer of `lib/ask`. `adapter.ts` co-located the runtime zod `AnswerSchema` with `AskError`, so importing `AskError` (or `createDefaultProvider` via `lib/ask/index`) dragged **all of zod into `/` (+108 kB gz)** — breaking A4's explicit "no client bundle pulls in zod" promise. Fix: moved `AnswerSchema` into `lib/ask/answer-schema.ts` (imported only by `rag-provider.ts` + tests); `adapter.ts` is now zod-free. `rag-provider.ts` and `ask-adapter.test.ts` imports updated. Behaviour unchanged; the RAG boundary is intact.
2. **`m.div layout` → CSS `min-height` transition + `m.*` content spring.** The plan named `m.div layout transition={springs.askExpand}`, but motion's `layout` feature lives only in `domMax`, not the shared `LazyMotionRoot` (`domAnimation`, A6) — pulling `domMax` onto the home page would grow first-load JS the A6 budget guards. The card height is eased with a cheap CSS `min-height` transition (same in-place-expand UX) while the answer content keeps the specified `springs.askExpand` opacity/y spring under the shared `LazyMotionRoot`. Reduced motion collapses both to instant.
3. **EvidenceLinks uses `ClayPill variant="link"` for internal + external** (the established evidence-pill primitive) rather than `next/link` for internal — one styled control, no duplicated pill classes; https links still get `target="_blank" rel="noopener noreferrer"`.
4. **`ClayPill` focus-ring fix (shared primitive).** `transition-colors` (Tailwind v4) also animates `outline-color`, so the focus ring FADED from currentColor to accent over 200 ms — a keyboard stop briefly showed the wrong ring colour (failed EVAL-007). Changed to `transition-[color,background-color]` so the ring snaps. Small blast radius: filter + link pills; hover bg still transitions.
5. **`AskProvider` scoped in `app/page.tsx`** for the inline surface. TKT-11 hoists it to `app/layout.tsx` so the global panel shares one provider/context. The panel seam (`panelOpen`/`openPanel`/`closePanel`/`triggerRef`) is declared but inert here.
6. **`/dev/ask` reads `?mode` client-side** (`window.location.search` via `useSyncExternalStore`), not `searchParams`, so the route stays fully static and satisfies the TP1 all-routes-prerendered guarantee (`assert-static`) even in an `ALLOW_DEV_ROUTES` QA build. Added `/dev/ask` to `tests/e2e/routes.json` `dev`.

## Bundle delta (S10.07)
`/` first-load JS: baseline **218.7 kB gz → 239.7 kB gz (+21 kB)** — ~6 kB is the client-side `knowledge` data (the provider is client-only by nature, A1) and ~11 kB is the shared `LazyMotion`/`domAnimation` feature set (a cost future spring/layout components — FilterTabs/StoryCard/NavPill — pay regardless), plus the Ask component code. The catastrophic +108 kB zod leak is fixed. `/` was already over the 180 kB budget at baseline; EVAL-005 is informational locally and the real perf pass is TKT-14/S14.05 (documented lever: keep `AskPanel` a separate lazy chunk — honoured, TKT-11 — and `LazyMotion` in use — honoured).

## `git diff --stat` (intended files; re-rendered `docs/screenshots/**` left unstaged)
```
 app/page.tsx                   | 27 +++++++++++++++
 components/clay/ClayPill.tsx   | 10 +++++--
 lib/ask/adapter.ts             | 29 +++-------------
 lib/ask/rag-provider.ts        |  3 +-
 tests/e2e/routes.json          |  2 +-
 tests/unit/ask-adapter.test.ts |  3 +-
```
New: `components/ai/{AskProvider,AskPortfolio,AnswerView,SuggestedPrompts,EvidenceLinks}.tsx`, `app/dev/ask/{page,AskDevBoard}.tsx`, `lib/ask/answer-schema.ts`, `tests/unit/{use-ask.test.tsx,ask-ui.test.tsx}`, `tests/e2e/ask-inline.spec.ts`, `docs/reports/TKT-10.md`, `evals/results/tkt-10.json` (~1,126 LOC of source/tests). Screenshots in `docs/screenshots/ask/` are generated artifacts (unstaged).
