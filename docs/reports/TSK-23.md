# Report — TSK-23 · `AboutHero` + `ProductJourney` + `/about` route skeleton

**Ticket:** TSK-23 (Backlog `TASK-36.2`) · parent **TKT-40** · Milestone **M-006** · Branch `m-006-pages`

## Files created
- **Created** `components/about/AboutHero.tsx` — flat hero variant.
- **Created** `components/timeline/ProductJourney.tsx` — reduced-scale connector line, 4 stages.
- **Created** `app/about/page.tsx` — the `/about` route, mounting both.
- **Created** `tests/e2e/about.spec.ts` — 6 test declarations (13 executions across the 4 viewport projects; 11 legitimately skipped as viewport-independent — see Gate results).
- **Created** `docs/screenshots/about/{390,768,1024,1440}.png` — visual-gate evidence.

No other files touched. `app/about/opengraph-image.tsx` was NOT created (TKT-42 owns it, per the brief). `data/experience.ts` was not re-authored; `ProductJourney`'s stage copy is inline, sourced from CONTENT_INVENTORY §4.2 (a different 4-stage framing than `experience.ts`'s 4 roles, which back TKT-41's `ExperienceTimeline` instead).

## How the flat hero differs from base `Hero`
`AboutHero` reuses `Hero.tsx`'s structural DNA (Container two-column grid, `AvatarStage`, same typography tokens) but differs by omission:
- **No `FloatingTiles`** — the home hero's "AI Products / People / Progress" 3-tile proof stack. About doesn't restate hero proof; `ProductJourney` right below carries that instead.
- **No `Annotation`** and **no CTA row** — "View My Work" / "Download Resume" already live in the header, footer, and Contact page; About's job is the bio, not a repeated conversion ask.
- **Eyebrow + headline + support (3 lines) collapses to a single `Prose` bio paragraph**, capped at `!max-w-[600px]` (narrower than `Prose`'s own 60ch default, per the brief's explicit ≤600px measure requirement).
- **Reuses the exact same `AvatarStage`** (same avatar asset, same corner `ClayIcon` tiles, same cursor-parallax / reduced-motion behavior) — one avatar treatment everywhere it appears, not a second bespoke implementation.
- Headline is composed from `site.title` + `site.tagline` (`lib/site.ts`, single source of truth) rather than hard-coded, so it can never drift from the header/footer's own copy: `${site.title}. ${site.tagline}.` renders exactly `"Senior Product Manager. Product Thinker · AI Builder · Problem Solver."`

## `ProductJourney` stage copy + §4.2 trace
All 4 stages are inline in the component with a `// source: CONTENT_INVENTORY §4.2` comment, transcribed (not invented) from that table:

| Stage | Range | Description |
|---|---|---|
| Physical / enterprise | Sep 2016 – Dec 2018 | Godrej Infotech — Assistant PM on the Godrej Smartnet platform; 12 features shipped in 11 months. |
| Cloud & data | Aug 2022 – Jun 2026 | Quantiphi (GCP) — cloud-native programs across data engineering, API modernization, and GenAI initiatives; Shellkode (AWS) delivery programs. |
| AI-enabled | Jun 2026 – present | American Express — Devin GenAI adoption across the MARS engineering ecosystem. |
| AI-native | Aug – Sep 2026 | TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched). |

The 2019–2022 gap note (education/patent/paper) is deliberately **omitted** — M-006 default per the brief; it renders only after Tushar confirms the framing (§4.2's own MISSING flag / Design.md TKT-40 AC 3). No click handlers, no `StoryCard`, no URL hash — that's TKT-41's separate `ExperienceTimeline` component. Reduced motion (opacity-only, no transform) comes for free from reusing the shared `Reveal` leaf and its existing global CSS override — no bespoke reduced-motion code was needed in this component.

## Gate results
- **`pnpm typecheck`** — pass, 0 errors.
- **`pnpm lint`** — pass, 0 errors/warnings.
- **`pnpm exec vitest run`** — pass, 37 test files, 194 tests passed, 1 pre-existing skip (unrelated). Note: the first run caught a real issue — my initial `AboutHero.tsx` docstring literally contained the banned phrase the brief told me to omit from the *bio*, which `tests/unit/forbidden-strings.test.ts` (scans `components/**`) correctly flagged even though it was only in a comment. Fixed by rephrasing the comment to reference the rule (`scripts/forbidden-strings.ts` A3 rule 5) instead of repeating the literal string; re-ran green.
- **`pnpm prebuild`** — pass: `content OK (projects:14 experience:4 skills:4 writing:0 knowledge:11 thinking:6)` — unchanged.
- **`pnpm build`** — pass. `/about` appears in the static route list (`○ /about`), and `assert-static` printed `all routes static (10)`.
- **`tests/e2e/about.spec.ts`** (Playwright, `workers:1`, run against the production build) — **13 passed, 0 failed, 11 skipped** (the skips are intentional — content/measure/axe/reduced-motion checks are viewport-independent and run once at their designated width, matching the codebase's existing `eval-006`/`eval-008`/`eval-010` convention). No OOM, no retry needed.
  - `@EVAL-008` no-overflow + 44px targets: green at all 4 viewports (390/768/1024/1440).
  - `@EVAL-006` axe WCAG2.1AA: clean at 390 and 1440.
  - `@EVAL-010` reduced motion: `ProductJourney`'s `.reveal` stage collapses `transitionProperty` to `"opacity"` (no `transform`) and does not move (Δy < 1px) under `prefers-reduced-motion: reduce`.
  - Structural checks: exact headline text, bio content/omission, avatar presence, no `FloatingTiles` labels, exactly 4 `ProductJourney` stages with correct labels, zero `<button>`/`<a>` inside the journey section, gap-note text absent, bio measure ≤600px.
- **TDD note:** these are new components with no pre-existing partial implementation to red/green against; I verified "red" implicitly by confirming `/about` 404'd before `app/about/page.tsx` existed (pre-existing `routes.json`/sitemap state), then wrote the components and the spec together and iterated to green. Genuine TDD reds/greens are naturally there for the reduced-motion assertion (it failed against the wrong locator/expectation twice while I was still shaping the stage markup) but the components themselves aren't behavior extracted from a failing spec in the strict sense — flagging for transparency rather than overclaiming.

## Screenshots
`docs/screenshots/about/{390,768,1024,1440}.png` — captured after scrolling the whole page through once (to fire every `ProductJourney` stage's `IntersectionObserver`-based reveal permanently) and resetting scroll to top, so the evidence shows the fully revealed state rather than the pre-reveal `opacity:0` frame. All 4 confirm: no horizontal overflow, avatar + headline + bio render correctly, the 4-stage connector line renders with all labels/ranges/descriptions visible, layout stacks cleanly on mobile (avatar → headline → bio → journey, single column, left-aligned).

## Bio wording shipped (DRAFT — for Tushar's sign-off)
> Driven by curiosity, systems thinking, and a bias toward building products that solve real customer problems, I enjoy questioning assumptions and uncovering insights hidden in everyday experiences. I bring 7+ years building cloud-native, AI, and data-driven products across GCP and AWS.

Composed from the CONTENT_INVENTORY §4.1 "PORT About" fragment (omitting the banned job-title phrasing per the brief) plus the résumé profile-summary fragment ("7+ years… cloud-native, AI, and data-driven products across GCP and AWS"). No fact beyond those two sourced fragments was invented; only connecting words were added for readability.

## Flags for Tushar's eye (not blocking)
1. **Bio wording** (above) is DRAFT — please confirm or edit before this ships beyond the branch.
2. **ProductJourney heading/lead copy** ("Career arc" eyebrow, "The product journey" title, "Four stages, from enterprise delivery to AI-native products." lead) is my own framing to give the section a heading — CONTENT_INVENTORY §4.2 only specifies the 4 stage rows, not a section heading. Flagging in case you want different framing or no heading at all.
3. The `id="experience"` anchor placeholder in `app/about/page.tsx` is an empty `<div>` for now — TKT-41 will replace it with the real `ExperienceTimeline` mount point.

## Commit
`feat(m006): TSK-23 AboutHero + ProductJourney + /about route` — see `git log` on `m-006-pages` for the SHA (recorded at commit time below).
