# Brief — TKT-41 · `ExperienceTimeline` + `TimelineNode` + `StoryCard`

**Ticket:** TKT-41 (Backlog `TASK-37`) · Milestone **M-006** · Type Feature · P1 · sp:5
**Branch:** `m-006-pages` (already checked out; commit ONLY here, never `main` — verify `git branch --show-current`)
**Model tier:** MOST-CAPABLE (opus). This is one of the two most novel interactions on the site — EVAL-007 (keyboard) and EVAL-010 (reduced-motion) name it explicitly. Correctness and a11y matter more than speed.
**Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-40 (done: TSK-22 data, TSK-23 AboutHero/ProductJourney/skeleton, TSK-24 clusters/Impact). The `app/about/page.tsx` already has an `id="experience"` placeholder where this mounts.

## Objective
Build the interactive **corporate experience timeline** on `/about`: a single connecting line with 4 nodes (Godrej · Quantiphi · Shellkode · AmEx), each expandable to a `StoryCard`. **Keyboard-complete, deep-linkable, reduced-motion-safe, no-overflow, axe-clean.** Mount it at the `id="experience"` anchor in `app/about/page.tsx` (the `/work` ExperienceStrip and Ask evidence deep-link to `/about#experience` and `/about#experience-{role}`).

## Read first (in order)
1. `tickets.md` → **TKT-41** (~866–882) — the full AC list. This brief expands it; the ticket is authoritative on scope.
2. `Design.md` → **§3 Timeline** (~234–239): the exact layout + interaction spec (quoted below), **§3 line 236** for `StoryCard` (ClayCard, card tier, `lavender` tone, 2-col definition grid ≥768 / 1-col <768, 44×44 close, one open at a time), the **motion table ~280** (`Timeline StoryCard expand` = `motion` layout animation, spring **stiffness 240 / damping 30**, ~300ms; **height snaps instantly under reduced motion**), and **a11y rows ~296–307** (full keyboard path names `ExperienceTimeline`; four screen states; reduced-motion + keyboard + SR paths for the two novel interactions).
3. `CONTENT_INVENTORY.md` → **§4.5** (~209–217) — the 4 roles' Context/Responsibility/Scale/What changed/Outcomes and the "via IntraEdge" note.
4. `data/experience.ts` (exists) — the REAL data. Read the shape precisely: `experience: Experience[]`, each `{ id, company, companyNote?, title, dates:{start,end} (YYYY-MM strings), context, responsibility, scale (literal string, `"not recorded"` for Shellkode/Quantiphi/Godrej), whatChanged, outcomes: Outcome[]{ text, kind:('measured'|'self-reported'), source }, sources }`. Order in the array is Godrej → Quantiphi → Shellkode → AmEx (chronological). Do NOT re-author this data.
5. **Interaction patterns to reuse:** `components/interactions/AskPanel.tsx` / its focus-trap + `Esc`-returns-focus logic (the established keyboard-panel precedent — reuse the same focus-management approach, don't reinvent); `lib/motion.ts` `useReducedMotionSafe` + `easings`; `components/interactions/ShowTheThinking*` (the other novel keyboard interaction — mirror its ARIA + reduced-motion discipline); `components/clay/ClayCard` + tiers (`lavender` tone, card tier). Check whether the project already uses `motion` (framer) layout animations elsewhere (Design table says `motion` layout animation) — reuse the same import/usage pattern; if `motion` layout isn't yet wired, a CSS/height transition gated on reduced-motion is acceptable as long as the spring feel + instant-snap contract holds.

## Design spec (verbatim from Design.md §3)
- **≥1024 (horizontal):** single horizontal `ink-3` connecting line spans the container; 4 `TimelineNode` dots evenly spaced, **company label above the line, date range below**. `hover` → node scales **1.1** + adjoining line segment brightens to `ink-2`. `click`/`Enter` → `StoryCard` (ClayCard, card tier, `lavender` tone) opens above or below the timeline (whichever has room), **full container width**, Context/Role/Scale/What changed/Outcomes as a **2-column definition grid (≥768) / 1-column (<768)**, **44×44 close**, URL hash per role, **only one card open at a time**.
- **<1024 (vertical):** rotates to a vertical timeline, connecting line runs down a **24px left inset**, `StoryCard` opens **inline as an accordion beneath its node**.

## Scope — files
- **Create** `components/timeline/TimelineNode.tsx` — a single node: dot + company label + formatted date range (use the project's date formatter, e.g. `lib/format` `formatDates`/`formatAsOf` — check what exists; format `YYYY-MM` → e.g. "Sep 2016 – Dec 2018", "Jun 2026 – Present" for open end). It is the interactive control: a real `<button>` with `aria-expanded`, `aria-controls={storyCardId}`, focusable, `hover`/`focus-visible` scale 1.1. Reduced-motion: no transform scale (opacity/outline only).
- **Create** `components/timeline/StoryCard.tsx` — the expandable panel: `ClayCard` card-tier `lavender`; heading = company + title; a definition grid (`<dl>`) with terms **Context · Role · Scale · What changed · Outcomes**; **Scale renders the literal `"not recorded"`** where the data says so (do not hide the row — the honesty is the point); **Outcomes render each with its kind badge** (reuse the same measured/self-reported badge vocabulary as `MetricCard`'s kindMap so the badge language is consistent site-wide) — render the kind as a badge, do NOT double-print "(self-reported)" if the text already carries it (note: some outcome `text` strings include "(self-reported)"/"(unquantified)" inline — badge the `kind`, keep the text verbatim, avoid visual duplication). 2-col grid ≥768, 1-col <768. `role`/`aria-labelledby`; a **44×44** close button that returns focus to the owning node. `id="experience-{role.id}"`.
- **Create** `components/timeline/ExperienceTimeline.tsx` — `"use client"` orchestrator: renders the connecting line + 4 `TimelineNode`s from `experience`, manages **exactly one open card** (opening another closes the first with the layout animation; reduced motion snaps), and:
  - **Keyboard (AC 2, EVAL-007):** Tab reaches each node; **Enter/Space opens**; **Esc closes and returns focus to the node**; **Arrow keys move focus between nodes** (roving tabindex or arrow handler — Left/Right on horizontal, Up/Down on vertical, or support both). `aria-expanded`/`aria-controls` wired.
  - **Deep link (AC 2):** on mount, read `window.location.hash`; if it matches `#experience-{id}`, open that card (and scroll/focus it). Keep `/about#experience` (the section anchor) working for the ExperienceStrip link.
  - **Responsive (AC 4):** horizontal ≥1024, vertical (24px left-inset line, accordion) <1024. Use CSS (container/media) — the layout must be correct in the statically-rendered HTML, no layout-shift flash.
  - **Reduced motion (EVAL-010):** card height/position snaps instantly; node hover scale disabled; no transform-based motion. Use `useReducedMotionSafe`.
  - **Four screen states (Design a11y row ~306):** this view's states are effectively working (cards) / "collapsed" (all closed) — there's no async load, but ensure the collapsed state and an all-closed default read cleanly; no empty/error/loading needed for static data. Note this reasoning in your report.
- **Edit** `app/about/page.tsx` — replace the `id="experience"` placeholder with `<section id="experience"><ExperienceTimeline /></section>` (keep the section anchor id AND the per-role card ids). Route MUST stay statically prerendered (the client component hydrates; the section HTML prerenders).

## Acceptance criteria (TKT-41, verbatim + expanded)
1. Four roles from `experience.ts`; **"Scale: not recorded"** rendered where MISSING; outcomes labelled by `kind` (self-reported/measured badge).
2. Keyboard: Tab to nodes, Enter/Space opens, `Esc` closes and returns focus, arrow keys move between nodes; `aria-expanded`/`aria-controls`; **deep link `/about#experience-amex` opens that card on load**.
3. Exactly one card open; opening another closes the first with layout animation; reduced motion snaps.
4. Vertical layout at 390/768; horizontal at 1024/1440; **no overflow at all four**; axe clean (390 + 1440).
5. `/about#experience` anchor exists for the `/work` ExperienceStrip link and Ask evidence.
6. `pnpm eval` shows no regression (keyboard + reduced-motion suites).

## TDD / gates (ALL must pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. **e2e is the primary gate here** — extend/author `tests/e2e/about.spec.ts` (or a dedicated `tests/e2e/experience-timeline.spec.ts`), run with the project's **`workers:1`** (host memory-contended; retry once if OOM-killed). Cover, red-before-green where feasible:
   - Enter/Space opens the focused node's card; `aria-expanded` toggles; only one open at a time.
   - `Esc` closes and focus returns to the node.
   - Arrow-key navigation moves focus between nodes.
   - Deep link: load `/about#experience-amex` → AmEx card open on load.
   - Reduced-motion (`emulateMedia({ reducedMotion: 'reduce' })`): card appears without transform animation (snap); node has no hover-scale.
   - `expectNoOverflow` at 390/768/1024/1440; layout is vertical <1024 / horizontal ≥1024.
   - axe clean at 390 and 1440 (including with a card open).
   - "Scale: not recorded" is present for Shellkode/Quantiphi/Godrej; AmEx shows its real scale.
3. `pnpm exec vitest run` — green (unit-test the date formatting / one-open-at-a-time reducer if you extract pure logic; red→green).
4. `pnpm prebuild` — `content OK` unchanged.
5. `pnpm build` — `/about` still in the **static** route list; `assert-static` green.
6. `pnpm eval` (or the applicable EVAL-006/007/008/010/011 specs) — no regression vs the current run; write the eval-run json under `evals/results/` (leave it untracked — do not commit eval-run churn).
7. Regenerate `/about` screenshots at 390/768/1024/1440 into `docs/screenshots/about/` (capture at least one with a StoryCard open).

## Constraints
- Everything on `/Volumes/E Drive` (configured). Stage EXPLICIT paths only (your new files + `app/about/page.tsx` + the spec file + screenshots) — never `git add -A` (untracked `evals/results/*` churn must stay out).
- One commit, imperative subject e.g. `feat(m006): TKT-41 ExperienceTimeline (keyboard-complete, deep-linkable)`. Co-Authored-By trailer = your actual model.
- Do NOT weaken any eval threshold or skip an a11y assertion to go green. If keyboard/reduced-motion cannot pass, STOP and report exactly what blocked you — this ticket's whole value is that those pass honestly.
- Do NOT touch Awards/Research/Education or the About OG (TKT-42), and do NOT modify `data/experience.ts` (consume it as-is).

## Output — `docs/reports/TKT-41.md`
Files created; the interaction model (how one-open-at-a-time + roving focus + Esc-return are implemented); how the layout animation + reduced-motion snap are wired (which library/approach); deep-link handling; how you rendered `scale:"not recorded"` and the outcome kind badges without double-printing; the four-screen-states reasoning; ALL gate results with counts (esp. the e2e keyboard/reduced-motion/deep-link cases) + any OOM retries; the eval-run path + PASS/regression summary; screenshot paths; the commit SHA; anything needing Tushar's eye — flag, don't block.
