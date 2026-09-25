# Brief — TKT-94 · Lenis smooth scroll, site-wide, guarded (EXE-16, Dev-22)

**Ticket:** TKT-94 (Backlog `TASK-89`) · M-009 · Feature · P2 · sp:2 · **Runs after** TKT-93/95 land so it tests the final pages.
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, **never push**).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Tushar asked for Lenis smooth scroll. Add it site-wide **for fine pointers only**, with native scroll under `prefers-reduced-motion` and on touch — smoothing only, no scroll-linked animation — without breaking keyboard, anchor, dialog, or accessibility behaviour.

## Read first
1. `decisions.md` **EXE-16**, **TP13** (decide-once pattern), **S11**, **D12**; `Design.md` **§11 Dev-22**, **§8**, **§10**.
2. `app/layout.tsx`, `components/navigation/{Header,MobileMenu,SkipLink}.tsx`, `components/ai/AskPanel.tsx` (scroll container), `lib/motion.ts` (`useReducedMotionSafe`, `usePointerFine`), `tests/e2e/{eval-007,eval-010,eval-015,layout}.spec.ts`, `tests/e2e/fixtures.ts`.
3. Lenis docs for the installed version (`node_modules/lenis/README.md` after install).

## Scope
- `pnpm add lenis` (latest stable; record the version). Import its CSS or add the recommended rules (`html.lenis, html.lenis body { height: auto }`, `.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain }`, `.lenis.lenis-stopped { overflow: hidden }`) under a `/* TKT-94 · lenis */` banner in `app/globals.css`.
- `components/interactions/SmoothScroll.tsx` (`"use client"`), mounted once in `app/layout.tsx`: in one mount effect, if `matchMedia("(pointer: fine)")` matches **and** `prefers-reduced-motion` does not, create one `Lenis` instance (`autoRaf: true` or a rAF loop), otherwise do nothing — decided once, no media-query listeners (TP13 pattern). Destroy on unmount. Expose the instance via a tiny module-level getter or context so others can call `scrollTo`/`stop`/`start`.
- Anchors: in-page hash links (e.g. `#ask` from the hero CTA), the `SkipLink`, and hash navigation on load scroll via `lenis.scrollTo(target, { offset: -headerHeight })`, then move focus to the target (`tabindex="-1"` if needed, `preventScroll: true`). Keep native behaviour when Lenis is not mounted.
- `MobileMenu` open → `lenis.stop()`, close → `lenis.start()` (a narrow desktop window can open it). `AskPanel` and any overflow container → `data-lenis-prevent`.
- `scroll-behavior: smooth` must not be set on `html` at the same time (conflicts); remove it if present.
- No parallax, scroll-triggered effects or scroll-linked animation.

## Gates
Unit: `SmoothScroll` mounts nothing when `matchMedia` reports reduced motion or a coarse pointer (jsdom mocks), mounts once otherwise. E2E (new `tests/e2e/lenis.spec.ts`): at `w1440` default → `html` has the `lenis` class; with `reducedMotion: "reduce"` → no `lenis` class; `w390` (touch) → no `lenis` class; hero "Ask my portfolio" click lands `#ask` in view under the header with focus inside it; `Tab` to the skip link + Enter moves focus to `main`; keyboard `PageDown`/`Space` scroll the page; opening `MobileMenu` at a 900 px-wide desktop viewport stops the scroll and closing restores it. Then `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; **FULL** `pnpm test:e2e` on a freshly restarted prod server (baseline 0 failures); `pnpm eval --only EVAL-007,EVAL-010,EVAL-015 --skip-build` PASS; bundle `/` recorded (must stay ≤ 180 kB gz; report the delta).

## Constraints
Everything on `/Volumes/E Drive` (pnpm store already there). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only (`package.json` + `pnpm-lock.yaml` included); never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`; restore churned `docs/screenshots/**`. Restart `pnpm start` after every build. Commit + trailer: `feat(scroll): Lenis smooth scroll for fine pointers, native for reduced motion + touch (TKT-94)`.

## Output — `docs/reports/TKT-94.md` (commit it)
Lenis version; bundle delta; guard behaviour per mode (evidence); anchor/skip-link/dialog results; e2e counts; eval statuses. Final chat reply ≤ 8 lines.
