# TSK-05 report — Hero + AvatarStage + FloatingTiles + Annotation (M-001 / TKT-01)

Branch `m-001-tracer`. Implementer: most-capable tier. Date 2026-09-15.

## Per-step status

| Step | Deliverable | Gate | Result |
|---|---|---|---|
| S05.01 | `components/interactions/Parallax.tsx` (`useMotionValue`+`useSpring(springs.parallax)`; active only when `usePointerFine() && !useReducedMotionSafe()`) | jsdom: no `pointermove` listener when `(pointer:fine)` false | **PASS** — `tests/unit/Parallax.test.tsx` (2 tests): 0 pointermove listeners when inactive; children render unmoved. |
| S05.02 | `components/hero/AvatarStage.tsx` (hero `ClayFrame` sky/lavender, `next/image` avatar `priority`+blur, 3 `ClayIcon` tiles in `Parallax`, avatar `Parallax depth={-1} maxPx={6}`) | TYPECHECK | **PASS** — typecheck clean. Frame widths `w-[280] md:360 lg:480 2xl:520`. Playwright width check deferred to TSK-07 (see Blocker B1). |
| S05.03 | `components/hero/FloatingTiles.tsx` + `data/hero.ts` (verbatim §1.2) | Playwright (deferred) | **DONE** — 3 `ClayTile size 180` (AI Products/People/Progress), offsets `lg:-mt-6/0/+6`, depths 0.5/1/1.5, single column `<1024`. |
| S05.04 | `components/hero/Annotation.tsx` + `.hero-highlight`/`@keyframes wash` in `app/globals.css` | LINT | **PASS** — lint clean. Wash animates `background-position` 700ms once (`forwards`); reduced-motion sets `animation-name: none` + `background-image: none`. `--color-` count still **13**. |
| S05.05 | `components/hero/Hero.tsx` + `app/page.tsx` + `app/work/page.tsx` + `app/contact/page.tsx` | BUILD → all routes static; DOM order; h1 has `.hero-highlight` | **PASS** — `all routes static (4)`. DOM order at load: eyebrow < h1 < CTA < tiles (verified via curl). h1 contains `<span class="hero-highlight">AI-native products</span>`. `/work` 200, `/contact` 200 with `id="resume"`. |
| S05.06 | Verification only | reduced-motion Parallax (deferred); `fetchpriority` ≥1 | **PARTIAL** — see Blocker B2. LCP priority hint IS present; literal grep string mismatches React 19 casing. |

## Gates passed now
- `pnpm typecheck` ✓  · `pnpm lint` ✓  · `pnpm test` ✓ (41 passed, incl. 2 new Parallax) · `pnpm build` ✓ → `all routes static (4)`.

## DRAFT hero copy flagged (CONTENT_INVENTORY §1.2 — needs Tushar's sign-off)
- **eyebrow** — "Senior Product Manager · Product Thinker · AI Builder · Problem Solver" — DRAFT (title VERIFIED, supporting triad DRAFT).
- **headline** — "I turn ambiguity into **AI-native products** people can use." — DRAFT (given / fixed copy).
- **support line** — "7+ years shipping cloud, data and AI products at Godrej Infotech, Quantiphi, Shellkode and American Express — and, since August 2026, a run of solo-built AI products with real users." — DRAFT.
- VERIFIED (no sign-off needed): tagline "Observing what others overlook."; all three tile one-liners (AI Products / People / Progress) — each date-stamped/sourced per §1.2.

Each row in `data/hero.ts` carries its `source` label and a `status` field so DRAFT rows are self-identifying.

## Blockers / deviations for the orchestrator

- **B1 — `2xl` breakpoint ≠ 1440 (deferred gate risk).** No `--breakpoint-2xl` override exists in the theme, so `2xl:` = Tailwind default **1536px**, but Design.md §3 / the TSK-07 gate expect the avatar frame to be **520px at ≥1440** (and Container's `2xl:max-w-…` wide behaviour). Implemented `2xl:w-[520px]` / `2xl:gap-24` **verbatim per the plan**. The TSK-07 Playwright check "frame width at 1440 = 520" will read 480 until `--breakpoint-2xl: 1440px` is added to `@theme` in `app/globals.css`. This is **shared config also affecting Container (TSK-01)** — not changed here (out of TSK-05 scope). **Recommendation:** orchestrator adds `--breakpoint-2xl: 1440px` before TSK-07's width gate.
- **B2 — `fetchpriority` gate string vs React 19 casing.** Next 16.3.5's `next/image` does **not** derive `fetchpriority` from `priority` (it only emits the LCP preload `<link>`); I set `fetchPriority="high"` explicitly. React 19 serialises it **camelCase** → the HTML contains `fetchPriority="high"` on both the avatar img and the preload link. The plan's literal `curl … | grep -c 'fetchpriority="high"'` (case-sensitive, lowercase) therefore returns **0**, while `grep -ic 'fetchpriority="high"'` returns **2**. HTML attributes are case-insensitive, so the LCP priority hint IS correctly applied. **Recommendation:** update the TSK-07 gate command to case-insensitive (`grep -ic`).
- **Minor deviations (documented, non-aesthetic):**
  - Hero-tile vertical offsets applied as `lg:-mt-6/mt-0/mt-6` (margin), not `translate`, to avoid colliding with `Parallax`'s motion-driven `transform`.
  - `FloatingTiles` uses `!h-auto lg:aspect-[9/7]` on `ClayTile` to relax its inline square default to the ~180×140 hero-tile shape while letting the (long, verbatim) one-liners grow the box rather than clip — no change to the `ClayTile` primitive (TSK-03 untouched).
  - `AvatarStage` reads `blurDataURL` from `public/avatar/avatar-blur.txt` via `node:fs` at build time (server component) to keep a single source of truth.

## Deferred to TSK-07 (Playwright / Chromium not installed here — per brief)
- Frame-width-by-breakpoint (S05.02), tile offset/single-column (S05.03), annotation count + `animation-name:none` under reduced motion (S05.04), DOM-order at 390 + `SHOT(home-1440)` (S05.05), reduced-motion Parallax `transform:none` + avatar-edge re-shot (S05.06).

## `git diff --stat` (commit surface — explicit paths only)
Added: `components/interactions/Parallax.tsx`, `components/hero/{AvatarStage,FloatingTiles,Annotation,Hero}.tsx`, `data/hero.ts`, `app/work/page.tsx`, `app/contact/page.tsx`, `tests/unit/Parallax.test.tsx`, `docs/reports/TSK-05.md`. Modified: `app/globals.css` (hero-highlight + wash), `app/page.tsx` (Hero + FeaturedWork placeholder).
