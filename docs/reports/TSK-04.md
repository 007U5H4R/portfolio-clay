# TSK-04 — Header + NavPill + MobileMenu + SkipLink (M-001 / TKT-01)

Branch: `m-001-tracer`. Model tier: standard. Scope: steps S04.01–S04.06 only. Prereqs used:
TSK-01 (`app/layout.tsx`, `lib/site.ts`), TSK-03 (`ClayButton`, `ClayTile`, `ClayIcon`,
`components/common/Icon.tsx`).

## Steps

### S04.01 — Motion helpers
**Files:** `lib/motion.ts`.
- `springs`, `durations`, `easings` copied verbatim from technical-plan.md §A6; `easings` is
  byte-identical to the `--ease-*` tokens already in `app/globals.css` (EXE-3 sync requirement
  — diffed by hand, confirmed identical).
- `useReducedMotionSafe`, `usePointerFine`, `useScrollY(threshold)` all implemented on
  `useSyncExternalStore` (React 18/19's built-in isomorphic-external-store primitive) rather
  than `useState` + `useEffect(() => setState(...))`. **Reason (not a scope deviation, a
  mechanical fix):** the direct `useEffect`-calls-`setState` version tripped
  `react-hooks/set-state-in-effect` under `pnpm lint` (`eslint-config-next` 16's bundled
  `eslint-plugin-react-hooks`). `useSyncExternalStore` is the React-recommended replacement for
  exactly this "read a browser API value that differs between server and client" pattern: it
  renders with `getServerSnapshot` (`true` for reduced-motion, `false` for pointer-fine/scroll)
  on the very first client render, then re-renders with the live `getSnapshot` once mounted —
  the same "unknown until mounted" contract A6 asks for, with no lint suppression needed.
- **Documented deviation:** A6's prose says `useReducedMotionSafe` "wraps `motion`'s
  `useReducedMotion`". Inspected `framer-motion@13.3.0`'s source
  (`utils/reduced-motion/use-reduced-motion.mjs`): it reads `matchMedia` **synchronously in the
  `useState` initializer** (not deferred past mount) and never re-subscribes to the OS `change`
  event. Composing it would break both halves of the contract (SSR-safe true-until-mounted, and
  live updates), so `useReducedMotionSafe` talks to `matchMedia` directly instead. Not a
  breaker — the resulting behaviour matches the contract's prose more faithfully than composing
  the library hook would have.
- **Gate:** `TYPECHECK` — **PASS**. jsdom/node test — **PASS** (4/4, `tests/unit/motion.test.tsx`):
  1. `renderToStaticMarkup` (no effects ever run) renders `"true"` — proves the pre-mount seed
     value directly, sidestepping the fact that Testing Library's `render()` flushes the mount
     effect synchronously in jsdom (verified empirically before writing the test — a naive
     "render then read the DOM" test cannot observe the pre-effect value at all).
  2. mounted with `matchMedia` mocked `matches:false` → renders `"false"`.
  3. mounted with `matchMedia` mocked `matches:true` → renders `"true"`.
  4. `matchMedia` stubbed `undefined` (older browser) → never throws, stays `"true"`.

### S04.02 — `Container` + `SkipLink`
**Files:** `components/layout/Container.tsx`, `components/layout/SkipLink.tsx`.
- `Container`: polymorphic `as` (default `div`), same generic pattern as `ClayCard.tsx`
  (`ComponentPropsWithoutRef<E>` + `Omit`), reads `--container-max`/`--container-max-wide`/
  `--gutter-mobile/-tablet/-desktop` verbatim.
- `SkipLink`: `sr-only focus:not-sr-only`, `fixed left-4 top-4`, `href="#main"`, `.focus-ring`.
- **Gate:** covered by Playwright in TSK-07 (deferred, per brief). `TYPECHECK`/`pnpm build` —
  **PASS** (both consumed by `Header`/`app/layout.tsx`, which compile and render).

### S04.03 — `Header` shell + compaction
**Files:** `components/navigation/Header.tsx`, `lib/nav.ts`.
- `"use client"`; `useScrollY(24)` → `data-compact` (empty-string-when-true / absent-when-false,
  same convention as `ClayButton`'s `data-icon-only`) driving `data-[compact]:py-3.5
  data-[compact]:backdrop-blur-[12px] data-[compact]:bg-bg/80` off `py-7` rest;
  `transition-[padding,background-color,backdrop-filter] duration-[250ms] ease-in-out
  motion-reduce:transition-none`; `position: sticky; top: 0`; `padding-top:
  env(safe-area-inset-top)` via inline `style` (Tailwind has no arbitrary-`env()` padding
  utility that composes with the `py-*` scale here, so this one property stays inline).
- Left: `ClayTile size={40} tier="utility"` holding an `aria-hidden` "TP" text mark + wordmark
  stack (`site.name` always visible, `site.title` `hidden md:block` — **Deviation 5**).
  **Documented deviation:** the contract's prose says "`ClayIcon` 'TP' mark" but `ClayIcon`'s
  actual TSK-03 contract takes `icon: LucideIcon` — it cannot render text, and widening it to
  accept `children` would be an out-of-scope change to a component TSK-03 already shipped. Used
  `ClayTile` directly (the same utility-tier shell `ClayIcon` itself wraps) instead — same
  visual result (40×40, utility tier, `--shadow-utility`), no primitive contract touched.
- Nav from `lib/nav.ts` (`Home · Work · Thinking · About`, **E-9** — confirmed against
  `SITEMAP.md`, not the 5-item `CONTENT_INVENTORY.md` list), each link `min-h-11 px-4 flex
  items-center`; active link (`usePathname() === item.href`) gets `aria-current="page"` +
  renders `<NavPill/>` behind it.
- **Gate:** Playwright later (S07.03) — deferred. Verified now by inspection of the prod-build
  HTML (`pnpm build && pnpm start`, curled `/`): `sticky top-0 … data-[compact]:…` class string
  present, `aria-current="page"` present on Home, wordmark + "TP" mark + "Senior Product
  Manager" all render server-side.

### S04.04 — `NavPill`
**Files:** `components/navigation/NavPill.tsx`.
- `"use client"`; `LazyMotion features={domAnimation} strict` wraps a single `m.span
  layoutId="nav-pill"` (lavender-tint `bg-lavender/30`, `rounded-[var(--radius-pill)]`,
  `absolute inset-0`); only the currently-active `Header` link ever mounts one, so the shared
  `layoutId` FLIP-animates it to the new position when the route changes instead of popping.
  `aria-current="page"` lives on the `<Link>` in `Header.tsx`, never here — this element is
  `aria-hidden="true"`, purely decorative background.
- Reduced motion → `layout={false}` + `transition={{ duration: 0 }}` (had to branch into two
  object literals rather than passing `transition={reducedMotion ? {...} : undefined}` —
  `exactOptionalPropertyTypes` rejects `transition: undefined` against `motion/react`'s
  `HTMLMotionProps` type, which distinguishes "absent" from "present-but-undefined").
- **Gate:** Playwright later (S07.03/S04.04) — deferred (no second route exists yet to navigate
  between; `TYPECHECK`/`pnpm build` — **PASS**).

### S04.05 — `MobileMenu`
**Files:** `components/navigation/MobileMenu.tsx`.
- `"use client"`; hamburger = `ClayButton ghost iconOnly` with `aria-controls`/`aria-expanded`,
  `md:hidden`, icon swaps `Menu`↔`X` with open state. Native `<dialog>` (`showModal()`/`close()`
  driven by an `open` boolean + `useEffect` syncing the imperative API — the dialog's own
  `open`/`close` calls are the "external system" here, which is exactly what an effect is for,
  so this one doesn't trip `set-state-in-effect`) sized `h-dvh w-dvw` (full-screen sheet).
  56px-row nav links, bottom row `AskAIButton` + a `resumeAction()`-driven `ClayButton`. `Esc`
  fires the browser's native `cancel`→`close` sequence, which `onClose` syncs back into React
  state; a click whose `event.target === dialogRef.current` (i.e. lands on the dialog's own box,
  not a descendant) is the standard "backdrop click" pattern and also closes it. `overflow:
  hidden` toggled on `document.documentElement` for the open lifetime, reverted in the effect's
  cleanup. Native `<dialog showModal()` gives focus-trap and "focus returns to the trigger on
  close" for free per the HTML spec — not reimplemented by hand.
- **Gate:** Playwright `w390` later (S07.03/S04.05) — deferred, Chromium not installed in this
  task per the brief. `TYPECHECK`/`LINT`/`pnpm build` — **PASS**.

### S04.06 — `AskAIButton` (disabled) + assembly
**Files:** `components/navigation/AskAIButton.tsx`, `app/layout.tsx`, `tests/e2e/crawler-allowlist.json`.
- `ClayButton secondary` + `Sparkles` icon (via the shared `Icon` wrapper) + "Ask AI" text.
  Tracer state: `aria-disabled="true"` (not the native `disabled` attribute, so it stays
  focusable and in the tab order), `title="Ask AI — coming in this build"`, a visible
  `role="tooltip"` span shown on `:hover`/`:focus-within` and referenced via
  `aria-describedby`, and an explicit no-op `onClick={(e) => e.preventDefault()}` rather than no
  handler at all — per TKT-01 AC 3, never a dead control.
- `app/layout.tsx` now renders `SkipLink → Header → <main id="main"> → {children}` inside
  `<body>`, in that order.
- `tests/e2e/crawler-allowlist.json` created: one entry,
  `{"id":"ask-ai-disabled","selector":"[title=\"Ask AI — coming in this build\"]","reason":"…",
  "expires":"TKT-11"}`, matching the `{selector, reason, expires?}` shape S10.02 will consume.
- **Gate:** `LINT` (jsx-a11y strict) — **PASS**, 0 findings. Playwright ("in tab order + has an
  accessible description") later (S07.03) — deferred.

## Full gate run (Finish step 1)

```
pnpm typecheck   → exit 0, no errors
pnpm lint        → exit 0, no errors/warnings
pnpm test        → 10 files, 39 tests, all PASS (4 new: tests/unit/motion.test.tsx)
pnpm build       → next build succeeded; assert-static: "all routes static (2)"
```

Manual runtime check (`pnpm build && pnpm start`, curl `http://127.0.0.1:3000/`, then the
server was killed and port 3000 freed): HTTP 200; response HTML contains "Skip to main
content", "Ask AI", `aria-current="page"` (on Home), the `data-[compact]:…` header class
string, the "TP" mark, "Tushar Pathak", and "Senior Product Manager" — confirming
SkipLink/Header/nav/AskAIButton all render server-side with no runtime error.

## Gates deferred to TSK-07 (Chromium not installed in this task, per the brief)

- S04.02 SkipLink: `Tab` from load focuses it, `Enter` moves focus to `#main`.
- S04.03 Header: measured height 96±1px at scrollY 0 / 68±1px at scrollY 40; `backdrop-filter`
  computed `none` at rest / `blur(12px)` compact.
- S04.04 NavPill: navigating `/` → `/work` moves `aria-current` and the pill's bounding box
  overlaps the new active link (no second route exists yet in this branch to test against).
- S04.05 MobileMenu (`w390`): focus trapped in the dialog, `Tab` cycles inside, `Escape` closes
  + returns focus to the hamburger, axe 0 critical/serious with the menu open.
- S04.06 AskAIButton: confirmed in the tab order with an accessible description via Playwright's
  accessibility tree (LINT already confirms jsx-a11y is clean now).

## `git diff --stat` (this ticket's files only)

```
 app/layout.tsx                        |   4 ++
 components/layout/Container.tsx       |  30 +++++++++
 components/layout/SkipLink.tsx        |  14 ++++
 components/navigation/AskAIButton.tsx |  40 ++++++++++++
 components/navigation/Header.tsx      |  76 +++++++++++++++++++++
 components/navigation/MobileMenu.tsx  | 108 ++++++++++++++++++++++++++++++
 components/navigation/NavPill.tsx     |  31 +++++++++
 lib/motion.ts                         | 120 ++++++++++++++++++++++++++++++++++
 lib/nav.ts                            |  16 +++++
 tests/e2e/crawler-allowlist.json      |   8 +++
 tests/unit/motion.test.tsx            |  53 +++++++++++++++
 11 files changed, 500 insertions(+)
```

(`docs/reports/TSK-04.md`, this file, is added on top of the above in the commit.)

Pre-existing, untouched-by-this-task working-tree state noted for the record (not part of this
diff, not staged): `backlog/pm-dashboard.json` and `docs/ledger.md` carry uncommitted changes
from prior orchestration steps; `docs/briefs/TSK-05.md` and `docs/briefs/TSK-06.md` are
untracked brief files already prepared for later tasks. None of these were read or modified by
this task.

## Blockers / deviations

- **Deviation (non-blocking, mechanical):** `lib/motion.ts`'s three hooks use
  `useSyncExternalStore` instead of the naive `useState`+`useEffect` shape, to satisfy
  `react-hooks/set-state-in-effect` under `pnpm lint` — see S04.01 above. Behaviourally
  identical to (in fact more correct than) the naive version; no contract or token changed.
- **Deviation (non-blocking):** `useReducedMotionSafe` does not literally compose `motion/react`'s
  `useReducedMotion` — see S04.01 above (that hook's own behaviour contradicts the SSR-safety
  and live-update halves of the A6 contract).
- **Deviation (non-blocking):** Header's "TP" mark uses `ClayTile` directly instead of
  `ClayIcon`, because `ClayIcon`'s shipped (TSK-03) contract only accepts a `LucideIcon`, not
  text — see S04.03 above.
- No token or Design.md contract was redefined. No breaker required stopping.

## Deviations from the minimal-scope instruction

None beyond the three documented above — no extra components, props, routes, or dependencies
were added. `/work`, `/thinking`, `/about` are referenced as plain `href` strings in
`lib/nav.ts` (routes don't exist yet; `next.config.ts` has no `typedRoutes`, so this compiles
and links correctly today and will resolve once TKT-16/40/43 add those routes).
