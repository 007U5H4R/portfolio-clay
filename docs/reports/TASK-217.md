# TASK-217 — Selected Work showcase: 3D paper-craft restyle

## Audit and change plan (written before coding)

**Target component.** The `/projects` showcase (`components/portfolio/IndependentProductsShowcase.tsx`): `MainMediaStage` (poster + pitch/demo player), `ProductInfoPanel` (info + actions), `ProductCarousel` (13 projects, tablist, TASK-197). Home's "Selected Work" (TASK-211) is a different component and is untouched. Phones (<= 639 px) render the TASK-210 list/detail and hide the carousel; the phone CSS is not changed.

**Current state.** Everything is already a "torn paper" collage built from ~1,000 lines of stacked CSS in `app/globals.css`: kraft backing with navy under-layer and tear masks behind the poster, a torn ivory sheet pinned and taped on the right, five coloured torn strips as actions, and a full-bleed torn kraft band behind 5:6 collectible covers with a tilted selection frame. The intro sits in the same grid and the sheet rises beside it; below 1024 px the DOM/visual order is carousel, details, poster, actions.

**Gaps against the brief.** (1) The kraft band is page-level scenery. (2) Poster and info are two separate collage objects, not one display. (3) Actions are five equally weighted strips, no primary/secondary/tertiary. (4) No "01 / 13" or category in the info panel. (5) Cards are covers with baked lettering, with no separate number / title / category. (6) The carousel precedes the window on tablet. (7) Pins, tape and tear masks read as scrapbook, not premium layered paper.

**Data and behaviour kept.** All data comes from `PortfolioProduct` (13 products, tags, videos, links); selection state, URL sync, analytics, keyboard roving tabindex, announce region, `aria-pressed` pitch/demo switching and the player are unchanged. The play control exists only when a video exists (already true); unavailable actions are not rendered (already true).

**Plan (smallest set).**
1. `app/globals.css`: one new scoped block at the end, `@media (min-width: 640px)`, that restyles window, poster frame, info sheet, buttons, tray and cards with CSS-only depth (layered pseudo-elements, hard 1-2 px stacked-edge shadows, gradients, soft single-direction shadows; no blur filters). Tokens only, so dark mode follows.
2. `ProductInfoPanel`: add "01 / 13" + category kicker, action tiers (primary / secondary / tertiary), drop pin and tape. Accessible names keep "Pitch video" / "Demo video" / "Read the case study".
3. `ProductCarousel`: cards become art + number + name + category; drop kraft band and `ObjectMotion`; prev/next stay.
4. `MainMediaStage`: drop pin and doodle; mode label becomes a small embossed tab.
5. `IndependentProductsShowcase`: carousel moves after the panel in the DOM (window first, tray beneath; matches visual order at every width).
6. Update tests that assert the old order; add `tests/e2e/paper-showcase.spec.ts` (selection sync, play only with video, raised active card).

**Known tension.** Poster art is 16:9 and must not be cropped, so the window is ~2.4:1 on desktop rather than 1.7-1.9:1; a taller poster viewport would crop the art.

## Result

**Files changed.** `app/globals.css` (one appended, scoped block `/* === TASK-217 === */`, >= 640 px only), `components/portfolio/{IndependentProductsShowcase,MainMediaStage,ProductCarousel,ProductInfoPanel}.tsx`, tests `tests/e2e/{paper-showcase (new),carousel,projects}.spec.ts` and `tests/unit/portfolio.test.tsx`.

**What changed.**
- One window object: slate-blue rear plate, parchment frame (stacked 1-2 px edges), a poster mat on its own slate layer, the info sheet raised on the frame. Poster stays 16:9 and uncropped, poster lettering unchanged; the play disc is warm ivory with a dark-brown glyph, centred, rendered only when a video exists. Pins, tape, doodle and tear masks are gone.
- Info panel: "01 / 13" + category (first two tags) kicker, name, descriptor, description, status line, then tiers: one primary (Watch pitch video; else Watch demo video; else Read the case study), secondary outlined (Watch demo video, Open live product), tertiary text links with thin separators (GitHub, PRD, Read the case study). Unavailable actions are not rendered; no destination repeats. Pitch/Demo remain the same `aria-pressed` stage switches.
- Tray: directly beneath the window at the same width (DOM order = visual order). Cards = existing art + two-digit index + name + compact category; the active card is raised 6 px, ringed in terracotta, with a short indicator bar; hover raises 3 px; prev/next are 44 px paper discs. The kraft band is removed, so there is no scenery behind the component.
- Dark mode uses the flipping tokens (charcoal-slate paper, copper accents); reduced motion honoured. Text is >= 14 px except `data-micro-label` items (12 px), so eval-008 holds.
- Phones (< 640 px) are untouched: TASK-210 list/detail, no carousel.

**Tests.**
- Unit: full `vitest run` 1,650 passed / 1 failed / 2 skipped. The failure was `eval-027` (build-scan timeout while an e2e run shared the machine); it passes alone (9/9). `portfolio.test.tsx` + `analytics-clicks.test.tsx`: 39/39 after updating button names.
- E2E (production build with `ALLOW_DEV_ROUTES=1`, port 3401): `paper-showcase`, `carousel`, `projects`, `portfolio-video`, `media-player*`, `analytics`: 84 passed, 159 skipped (width-gated), 1 failed. The failure was the stale phone-width case in `carousel.spec.ts` (a phone has no carousel since TASK-210); its skip now excludes phones. An accidental full-suite start (a path filter matched the worktree name) was stopped; before that, eval-008 (105 tests) and eval-010 (115 tests) were green against this build.
- `typecheck` clean; `lint` 0 errors (2 pre-existing warnings).
- New `paper-showcase.spec.ts` (6 tests at w768 / w1024 / w1440): window/tray geometry, selection sync by click / arrows / keyboard, play control only with a pitch video, one primary action with no repeated destination, raised active card, tray scrolls without overflow.
- Visual: screenshots at 1440 / 1024 / 768 / 390 / 320, light and dark, plus Velora and Dino Arcade at 1440, in `/Volumes/E Drive/Dev/.scratch/showcase-217/shots/`. No horizontal overflow and 0 console errors on the production build.

**Remaining issues / decisions.**
- Window aspect is ~2.0-2.4:1, not 1.7-1.9:1: the 16:9 art may not be cropped.
- Card categories are the first two tags and truncate with an ellipsis on narrow cards; the full name and tagline stay in the accessible name.
- `ProductCover`'s `thumb` size is no longer used by the carousel (dead branch and its CSS left in place to keep this change scoped).
- "Open live product" is the project's single `links.live`; the data has no separate demo or blog URL, so none is shown.
- Home's Selected Work (TASK-211) is untouched.
