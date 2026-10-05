# TKT-110 — How I think choreography: inspection + plan

Ticket TKT-110 (Campfire TASK-107). Spec: `docs/redesign-mockups/m-009/tushar-2026-09-26/how-i-think-choreography-spec.md`.
Base: `ec55aaa` (TKT-99 round 1). TKT-99 round 2 (static visuals) is merged in before the section is wired, if it lands in time.

## Inspection (spec "Before implementation" 1–6)

1. **Architecture.** `components/home/HowIThink.tsx` is a server component. Each card is
   `li.hit-stage > Reveal(div.hit-reveal) > Sheet(article.hit-card)` with a `Pin`, three torn
   `clip-path` paper layers (`.hit-paper-*`) and the content. The only motion today is the generic
   `Reveal` (IntersectionObserver, opacity + 12 px, 70 ms stagger). `motion/react` is installed but
   not loaded on `/`.
2. **Where things render.** Cards: `ol.hit-stages` inside `div.hit-journey`. Path:
   `<MediaGate min={1025}><Sketch variant="journey" class="hit-path"/></MediaGate>` — client-only,
   absent ≤ 1024. Backdrop: `HowIThinkCollage` (one `data-decor="collage"` object).
3. **Stacking.** `.hit-journey` (relative) → collage z0, path z1, stages z2. Each Sheet is its own
   stacking context (rotate + `isolation`), so the pin lives inside the card's context.
4. **Path.** Inline SVG, one dashed cubic in a stretched `0 0 1200 320` viewBox
   (`preserveAspectRatio="none"`) — cannot be trimmed to the pins at every width.
5. **Clipping parents.** `.hit` has `overflow-x: clip` (horizontal only) — a vertical bounce is safe,
   and the roll clip leaves a 24 px margin on the sides so rotated corners / pins are not clipped.
   No `overflow: hidden` on `.hit-journey` / `.hit-stages`.
6. **Layout.** 6 columns ≥ 1025 (odd cards +28 px), 3 columns ≤ 1024, 2 ≤ 640, 1 ≤ 440. Path only ≥ 1025.

## Plan

**Engine (new, `components/motion/journey/`)**, data-driven, reusable:

- `timeline.ts` — pure. The spec §6 timing as data (`JOURNEY_TIMING`), the state list derived from the
  stage ids (`idle → backgroundReveal → pathToProblem → problemReveal → … → impactReveal → complete`),
  `buildJourneySteps(ids)` (ordered steps with durations) and `journeySchedule()` (absolute times,
  total ≈ 7.6 s). Stage data (`JOURNEY_STAGES`: id, index, final rotation, start rotation offset).
- `runner.ts` — the state machine driver over the DOM. Steps run strictly in order; a stage step
  waits until its stage is *eligible* (IntersectionObserver ≥ 30 % or already scrolled past) and the
  previous stage has settled. Sets `data-journey-state` on the root, `data-roll=rolled|rolling|settled`
  on each `[data-journey-stage]`, `data-draw=drawing|drawn` on each `[data-journey-segment]`. One
  `setTimeout` chain, cancelled on unmount; `skip()` jumps to `complete`. Runs once per page load.
- `ProductThinkingJourney.tsx` (client) — the `.hit-journey` root. After hydration: reduced motion,
  or the board not fully below the fold → `complete` (nothing hidden). Otherwise arm the pre-state
  and start the runner. `focusin` before completion → skip to `complete` (keyboard users never land
  on hidden content). Never touches scroll.
- `StageRoll.tsx` (server-safe) — replaces `Reveal` around each card (keeps `li > div > article`):
  carries `data-journey-stage` and the per-stage rotation vars.
- `AnimatedJourneyPath.tsx` (client, inside the existing `MediaGate min={1025}`) — keeps the
  `svg[data-decor="sketch"][data-sketch="journey"]` contract; measures the pin positions (from each
  stage's box, ResizeObserver) and draws 7 segments (start → Problem, 5 between, final tail) as
  dashed paths revealed through a solid mask path each (`pathLength=1`, dashoffset 1 → 0), so the
  dash pattern survives the draw. Arcs run above the pin row, ending at each pin's rim (the pin
  itself stays visible on top).
- `RadialReveal` — CSS on the collage backdrop (`[data-journey-radial]`): `clip-path: circle(0% at
  50% 50%)` → `circle(75%)` (≥ half-diagonal), `cubic-bezier(0.22, 1, 0.36, 1)`, 1.4 s, opacity
  0.85 → 1.

**Motion (CSS, appended `/* TKT-110 */` block)**: only `transform`, `opacity`, `clip-path`,
`stroke-dashoffset`; all pre-states scoped to `[data-journey-armed]` inside
`@media (prefers-reduced-motion: no-preference)`, so SSR / no-JS / reduced motion render the final
state. Roll: clip `inset(-24px -24px calc(100% - 28px) -24px)` (top ~28 px + pin visible) → open
over 60 % of 750 ms, then a 300 ms recoil (translateY 0 → 4 → −2 → 0, rotate 0.4 → −0.2 → 0).
Pin lands at ~85 % rollout (scale 1.3 → 0.92 → 1, y −8 → 2 → 0, 250 ms). Content staggers
60 ms from 55 %. Path z-index raised to 4. Durations are CSS vars written from `JOURNEY_TIMING`
(one source of truth). No `filter`, no layout properties.

**Budget.** No `motion/react` on `/` (measured cost is the whole library); CSS + ~3 kB of
IntersectionObserver/timeout code.

**Tests.** Vitest for the timeline + runner (fake timers). New
`tests/e2e/how-i-think-choreography.spec.ts` (order via a MutationObserver timestamp log, segment
before card, z-order, radial origin, once, no scroll lock, reduced motion, focus skip, overflow,
total duration). Update the how-i-think / a11y-90d assertions that depended on `Reveal`, and teach
the axe fixture to wait for the choreography like it waits for `.reveal`.
