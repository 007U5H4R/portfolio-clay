# Implementer brief — TSK-04 · Header + NavPill + MobileMenu + SkipLink (M-001 / TKT-01)

Fresh implementer. Execute **TSK-04 only** (steps S04.01–S04.06). Model tier: standard. Prereqs done: TSK-01 (scaffold, tokens, `app/layout.tsx` with metadata + `<main id="main">`, `lib/site.ts`), TSK-03 (clay primitives — `ClayButton`, `ClayIcon`, `components/common/Icon.tsx`). Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-001-tracer`.

## Read first
- `technical-plan.md` §B → **TSK-04 steps S04.01–S04.06** (lines ~498–503) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` §A6 (motion architecture — the reduced-motion + spring constants for `lib/motion.ts`).
- `Design.md` §3 Header/Nav for visual contract; **§E-9**: nav copy is exactly **Home · Work · Thinking · About** (NOT the CONTENT_INVENTORY 5-item list — Playground/Contact are footer/CTA only). Deviation 5: the subtitle in the wordmark is `hidden md:block`.

## Steps (each has a hard Gate — most are Playwright-verified LATER in TSK-07; author to contract now)
- **S04.01** `lib/motion.ts` — A6 constants, `useReducedMotionSafe` (returns true on first render then the matchMedia value), `usePointerFine`, `useScrollY(threshold)` (boolean past-threshold via passive scroll listener + rAF). Gate: TYPECHECK; jsdom test: `useReducedMotionSafe` returns true first render.
- **S04.02** `components/layout/Container.tsx` (max-width + responsive gutters + `as` prop, reading the container/gutter tokens) and `components/layout/SkipLink.tsx` (`sr-only focus:not-sr-only` fixed top-left, `href="#main"`). Gate: covered by Playwright in TSK-07 (skip-link focus → Enter moves focus to #main).
- **S04.03** `components/navigation/Header.tsx` (`"use client"`; `useScrollY(24)` → `data-compact`; rest `py-7` (~96px) → compact `py-3.5` (~68px) + `backdrop-blur-[12px] bg-bg/80`; `transition-[padding,background-color,backdrop-filter] duration-250 motion-reduce:transition-none`; `position:sticky; top:0; padding-top:env(safe-area-inset-top)`; left = `ClayIcon` "TP" mark 40 + wordmark stack (subtitle `hidden md:block`); nav from `lib/nav.ts`, each link `min-h-11 px-4 flex items-center`) and `lib/nav.ts` (Home·Work·Thinking·About). Gate: Playwright later — height 96±1 at scrollY 0, 68±1 at scrollY 40; backdrop-filter none at rest, blur(12px) compact.
- **S04.04** `components/navigation/NavPill.tsx` (`m.span layoutId="nav-pill"` inside `LazyMotion features={domAnimation}`; lavender utility fill behind active item; `aria-current="page"` on the link not the pill; reduced motion → `layout={false}` instant). Gate: Playwright later.
- **S04.05** `components/navigation/MobileMenu.tsx` (`"use client"`; hamburger `ClayButton ghost` with `aria-controls`/`aria-expanded`, `md:hidden`; native `<dialog>` `showModal()` full-screen sheet; nav rows 56px; bottom row `AskAIButton` + `resumeAction()`; `Esc`/backdrop closes; focus returns to hamburger; `overflow:hidden` on `html` while open). Gate: Playwright (w390) later — focus trapped in dialog, Esc closes + focus on hamburger, axe 0 critical/serious with menu open.
- **S04.06** `components/navigation/AskAIButton.tsx` (`ClayButton secondary`, `Sparkles` icon + "Ask AI"; tracer state: `aria-disabled="true"` + `title="Ask AI — coming in this build"` + visible tooltip on focus/hover, STILL focusable, `onClick` no-op — **never a dead control**, TKT-01 AC 3) and assemble `app/layout.tsx` order: `SkipLink → Header → <main id="main"> → children`. Add a `tests/e2e/crawler-allowlist.json` entry `ask-ai-disabled` with the reason (removed in TKT-11). Gate: LINT (jsx-a11y clean); Playwright later (button in tab order + accessible description).

## Rules
- Everything on E Drive. Follow the plan verbatim; minimal tracer scope only.
- Playwright-based gates run in TSK-07 (Chromium installs there). For now, satisfy TYPECHECK/LINT/jsdom gates and author the components to the exact contracts so the TSK-07 specs pass. Do NOT install Chromium or run e2e here.
- **Commit staging: explicit paths only** (`git add lib/motion.ts lib/nav.ts components/layout components/navigation app/layout.tsx tests/e2e/crawler-allowlist.json tests/unit docs/reports/TSK-04.md`). NEVER `git add -A`.
- If a gate cannot pass without changing a Design.md/token contract, STOP and report the breaker.

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green.
2. Commit: `feat(tracer): TSK-04 header, nav pill, mobile menu, skip link` + Co-Authored-By trailer. One commit.
3. Write `docs/reports/TSK-04.md`: per-step done with gate output; note which gates are deferred to TSK-07 (Playwright); `git diff --stat`.
4. Final 5-line summary: steps done, gates passed (unit/typecheck/lint), deferred-to-TSK-07 gates, blockers, deviations, commit SHA.
