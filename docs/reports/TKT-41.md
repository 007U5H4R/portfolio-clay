# Report — TKT-41 · `ExperienceTimeline` + `TimelineNode` + `StoryCard`

**Milestone** M-006 · **Branch** `m-006-pages` · **Type** Feature · P1 · sp:5
**Status** Complete — all gates green, keyboard + reduced-motion + deep-link pass honestly.

## Files

**Created**
- `components/timeline/timeline-logic.ts` — pure, framework-free helpers (no React): `storyCardId`, `roleIdFromHash` (deep-link parser), `toggleOpen` (single-open reducer), `nextNodeIndex` (arrow roving), `textStatesKind` (badge-suppression rule). Kept out of the client component so the behaviour is unit-testable without jsdom/`motion`.
- `components/timeline/TimelineNode.tsx` — one node: a real `<button>` with `aria-expanded` + `aria-controls`; CSS-only dual layout (mobile row with the dot pinned to the 24px-inset rail line; desktop centered column, label above the line / dot on it / date below, painting its own full-width line segment).
- `components/timeline/StoryCard.tsx` — the lavender card-tier `ClayCard` disclosure panel; `<dl>` definition grid (Context · Role · Scale · What changed · Outcomes), 2-col ≥768 / 1-col <768; 44×44 close button; renders `scale` verbatim incl. `"not recorded"`; outcome kind badges reusing MetricCard's vocabulary.
- `components/timeline/ExperienceTimeline.tsx` — `"use client"` orchestrator (renders its own `<section id="experience">`): single-open state, keyboard path, deep link + hash sync, delegated arrow/Esc handling.
- `tests/e2e/timeline.spec.ts` — the primary gate (36 cases across 4 viewports).
- `tests/unit/timeline-logic.test.ts` — 13 pure-logic unit tests (AC 1–3).
- `docs/reports/TKT-41.md` — this report.

**Edited**
- `app/about/page.tsx` — replaced the `id="experience"` placeholder `<div>` with `<ExperienceTimeline />` (the component renders the `<section id="experience">` itself, matching how Impact/CapabilityClusters own their `<Section>`; deviation from the brief's literal `<section><ExperienceTimeline/></section>` — functionally identical, keeps the anchor and follows the codebase convention).

`data/experience.ts` consumed as-is (not modified).

## Interaction model

- **One open at a time (AC 3):** a single value drives everything — `openId = userOpenId === undefined ? hashRole : userOpenId`. `userOpenId` is `undefined` (no interaction yet → follow the hash), `null` (explicitly all-closed), or a role id. `toggleOpen(current, id)` replaces any other open card, so exactly one is ever open. Opening/closing is verified in e2e by counting `[aria-expanded="true"]` (always 0 or 1).
- **Roving focus (AC 2):** nodes are plain Tab stops (accordion-disclosure pattern, all `tabindex=0` — simpler and more robust than roving `tabindex=-1`, which risks hiding nodes from Tab). Arrow keys are an enhancement: a single delegated `onKeyDown` on the rail reads `data-node-index` off the focused button and moves focus with `nextNodeIndex` (Left/Up = prev, Right/Down = next, wrapping). Enter/Space open natively (real `<button>`).
- **Esc-return (AC 2):** the same delegated handler catches `Escape` (bubbles up whether focus is on the node or inside the card), closes via `closeAndFocus(openId)`, and calls `.focus()` on the owning node's ref — so focus never drops to `<body>`.

## Layout animation + reduced-motion wiring

- **Approach: `grid-template-rows` 0fr→1fr CSS transition** (the proven `ExperienceStrip`/`HowIThink` technique), *not* `motion` `layout`. Reason: `layout` animations require the `domMax` feature bundle, which the shared `LazyMotionRoot` deliberately omits for the JS budget (A6); `AskPortfolio`, `HowIThink`, and `EditorialGrid` all took the same documented decision. The brief explicitly permits "a CSS/height transition gated on reduced-motion … as long as the spring feel + instant-snap contract holds." Duration ~300ms on `--ease-reveal` approximates the spring feel; content is only mounted while open, so a collapsed card exposes nothing focusable/readable.
- **Reduced-motion snap (EVAL-010):** `motion-reduce:transition-none` on the disclosure wrapper → the height jumps instantly with no interpolation (verified: computed `transition-property` is `none` under `prefers-reduced-motion: reduce`). The node dot's hover/focus scale is `motion-reduce:group-hover:scale-100` / `motion-reduce:group-focus-visible:scale-100` → no transform under reduced motion (verified: dot bounding box does not grow on hover). No bespoke JS branch needed.

## Deep-link handling

- **On load:** the location hash is read through a `useSyncExternalStore` external store (`subscribeHash`/`getHashSnapshot`/`getHashServerSnapshot`) — the same SSR-safe idiom as `lib/motion`'s `useReducedMotionSafe`. Server + first client render both read `null` (matching the all-closed prerendered HTML), then after commit the live hash resolves and the card opens. This satisfies `react-hooks/set-state-in-effect` (no `setState` in an effect) and avoids a hydration mismatch.
- **Scroll/focus:** a DOM-only effect (no `setState`) scrolls the deep-linked card into view and focuses it once — guarded to hash-driven opens so a normal click never yanks the viewport.
- **Hash sync:** toggling updates the URL via `history.replaceState` (open → `#experience-<id>`, closed → `#experience`); the first commit is skipped so a fresh load with no hash is never rewritten. `replaceState` fires no `hashchange`, so there is no feedback loop. The bare `#experience` section anchor keeps working for the `/work` ExperienceStrip + Ask evidence (verified).

## "not recorded" + kind badges (no double-print)

- **Scale:** the `Scale` `<dd>` renders `role.scale` verbatim — including the literal `"not recorded"` for Godrej/Quantiphi/Shellkode (never hidden; the honesty is the point). AmEx renders its real quantified scale. Verified in e2e for all four roles.
- **Kind badges:** the measured/self-reported badge vocabulary is replicated from `MetricCard`'s `kindMap` (tone/icon/label) — replicated, not imported, because that map is module-private and `MetricCard.tsx` is out of this ticket's edit scope; the vocabulary stays byte-consistent. Every outcome's text is kept verbatim. The badge is **suppressed** only when the text already spells out its kind (`textStatesKind`, case-insensitive "self-reported") — i.e. AmEx's `"…(self-reported)"` outcomes show no redundant badge, while Godrej/Quantiphi/Shellkode (whose texts omit the phrase, or carry a different qualifier like "(unquantified)") get the "Self-reported" badge to surface the provenance the text doesn't state. Net effect: the same qualifier is never printed twice, and no text is mutated.

## Four screen states

This view has **no async data source** (static `experience.ts`), so the classic loading/empty/error/working quartet collapses to two real states: **working** (a card open, rendered as a labelled `role="region"`) and **collapsed** (all closed). There is no fetch to show a spinner for, no empty result to design an empty state for, and no request to fail. The all-closed default reads as a clean, self-explanatory set of expandable nodes (each a labelled button with a visible affordance). Reasoning captured here per the Design.md a11y row ~306 requirement.

## Gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | **PASS** (clean) |
| `pnpm lint` | **PASS** (clean; resolved `react-hooks/set-state-in-effect` via the `useSyncExternalStore` hash store) |
| `pnpm exec vitest run` | **PASS** — 213 passed, 1 pre-existing skip (39 files); incl. 13 new `timeline-logic` tests |
| `pnpm prebuild` | **PASS** — content OK (ran as part of `pnpm build`) |
| `pnpm build` | **PASS** — `/about` still `○ (Static)`; `assert-static` → "all routes static (10)" |
| `pnpm eval --only EVAL-006,007,008,010,011 --skip-build` | **PASS** — 5 pass · 0 fail · 12 skip; **no regression** (EVAL-008 improved FAIL→PASS vs baseline); 167 Playwright tests passed, 0 failed, no OOM |
| e2e `timeline.spec.ts` | **PASS** — 14 executed pass, 22 width-gated skips (see below) |
| e2e `about.spec.ts` (regression) | **PASS** — 15 pass, 17 skips (no regression on existing About sections) |

### e2e cases (explicit)
- **Keyboard (EVAL-007):** Enter opens; Space opens; opening another closes the first (exactly one `aria-expanded="true"`); Enter on the open node toggles closed — **PASS**. Esc closes and returns focus to the owning node — **PASS**. ArrowRight/Left/Down move focus between nodes, wrapping at both ends — **PASS**.
- **Deep link:** `/about#experience-amex` opens the AmEx card on load with others closed (run at w1440 + w390) — **PASS**; bare `#experience` resolves to the section and auto-opens nothing — **PASS**.
- **Reduced motion (EVAL-010):** disclosure `transition-property: none` (instant snap) + node dot no hover-scale — **PASS**.
- **No overflow + orientation (EVAL-008):** vertical <1024 / horizontal ≥1024 asserted by node geometry; `noOverflow` + `minTargets` with a card open, at 390/768/1024/1440 — **PASS**.
- **axe (EVAL-006):** WCAG2.1AA clean at 390 and 1440 **with a StoryCard open** — **PASS**.
- **Honesty (AC 1):** "not recorded" present for Godrej/Quantiphi/Shellkode; AmEx shows its real scale + keeps verbatim "(self-reported)" — **PASS**.

**OOM retries:** none required (eval completed in ~2.6m, timeline spec ~17s; host stayed healthy at `workers:1`).

## Eval run + regression

- Written to `evals/results/eval-run-0.2.0-49b7177.json` (left **untracked** per the brief — eval-run churn stays out of the commit).
- **Regression summary:** 0 regressions. One improvement recorded: `EVAL-008` FAIL→PASS vs `baseline-v1.json` (the baseline predates the About-page overflow fixes; adding the timeline did not reintroduce overflow).

## Screenshots (`docs/screenshots/about/`)

Regenerated at all four widths, plus a card-open capture at each:
- Base (collapsed): `390.png`, `768.png`, `1024.png`, `1440.png`
- StoryCard open: `390-experience-open.png`, `768-experience-open.png`, `1024-experience-open.png`, `1440-experience-open.png`

## Commit

`feat(m006): TKT-41 ExperienceTimeline (keyboard-complete, deep-linkable)` — SHA recorded on commit (see final message).

## Flags for Tushar

- **Segment-brighten on hover:** the desktop "adjoining line segment brightens to `ink-2`" is implemented as *the hovered node's own* full-width segment brightening (each node paints its own segment, so the four join into one line). This reads as the hovered region highlighting rather than the two neighbouring half-segments specifically — a faithful, simpler realisation of the intent. Not gated by any AC/EVAL. Flagging in case you want the stricter "both adjoining halves" behaviour.
- **Card-open focus on deep link:** arriving via `/about#experience-amex` moves focus to the opened card region (tabindex=-1) and scrolls it to center. This aids screen-reader/keyboard users landing on a deep link; if you'd prefer focus to stay put (only scroll), it's a one-line change.
- **Page wiring:** `ExperienceTimeline` renders its own `<section id="experience">` (convention match with Impact/CapabilityClusters) rather than the brief's literal `<section><ExperienceTimeline/></section>` — same DOM, noted above.
