# Brief — TSK-23 · `AboutHero` + `ProductJourney` + `/about` route skeleton

**Ticket:** TSK-23 (Backlog `TASK-36.2`) · parent **TKT-40** · Milestone **M-006** · Type Task · P1 · sp:2
**Branch:** `m-006-pages` (already checked out; commit only here, never `main` — verify with `git branch --show-current`)
**Model tier:** standard. **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TSK-22 (done — `data/experience.ts`, `data/skills.ts` now exist), TKT-04 primitives (done).

## Objective
Create the `/about` route and its first two sections: `AboutHero` (a flat hero variant) and `ProductJourney` (a decorative reveal-on-scroll connector line). Leave clean insertion points for the sections that later tickets add to the SAME page: capability clusters + Impact (TSK-24), `ExperienceTimeline` (TKT-41), Awards/Research/Education + OG (TKT-42). **Do NOT build those later sections, and do NOT add `app/about/opengraph-image.tsx` — TKT-42 owns the About OG.**

## Read first (in order)
1. `tickets.md` → **TKT-40** (~832–850) and **TSK-23** (~856–859).
2. `Design.md` → **§3 Timeline** lines ~234–239 (`ProductJourney` = "same connector-line pattern at reduced scale, 4 stages, no click interaction — decorative `Reveal`-on-scroll labels only"; `AboutHero` = "flat hero variant of `Hero` — headline + avatar, no floating tiles") and **§3 Hero** ~183 for the base Hero it varies from. Note the motion table (~280) and a11y rows (~296–307): reduced motion, keyboard, no-overflow.
3. `CONTENT_INVENTORY.md` → **§4.1 AboutHero** (~169–175) and **§4.2 ProductJourney** (~177–185). All copy traces here.
4. `data/experience.ts` (exists) — do not re-author; ProductJourney is a DIFFERENT 4-stage framing (§4.2), not the 4 roles.
5. Pattern references: `app/work/page.tsx` (route: `buildMetadata`, `Container`, static-prerender discipline, `Suspense` only if a client child reads search params — About needs none), `components/hero/Hero.tsx` + `components/hero/AvatarStage.tsx` (base hero + how the avatar asset is loaded — reuse the SAME avatar asset the home Hero uses).

## Scope — files
- **Create** `components/about/AboutHero.tsx` — flat hero variant: headline (verbatim, VERIFIED) **"Senior Product Manager. Product Thinker · AI Builder · Problem Solver."**, a bio paragraph composed per §4.1 (fragments: "driven by curiosity, systems thinking, and a bias toward building products that solve real customer problems… questioning assumptions, uncovering insights hidden in everyday experiences" + "7+ years… cloud-native, AI, and data-driven products across GCP and AWS"; **OMIT the phrase "AI Product Manager"**), and the avatar. **No `FloatingTiles`, no `Annotation`** — flat means flat. Text measure ≤600px.
- **Create** `components/timeline/ProductJourney.tsx` — the reduced-scale connector line with **4 stages** (physical/enterprise → cloud & data → AI-enabled → AI-native) using `Reveal` (`@/components/interactions/Reveal`) only; **no click handlers, no StoryCard, no hash** (that is TKT-41's ExperienceTimeline, a separate component). Stage copy inline from §4.2 with a `// source: CONTENT_INVENTORY §4.2` comment. **OMIT the 2019–2022 gap note** (M-006 default — renders only after Tushar frames it). Reduced motion → opacity-only / snap, no transform (EVAL-010).
- **Create** `app/about/page.tsx` — `export const metadata = buildMetadata({ title: 'About · '+site.name, description: <one line>, path: '/about', ogFamily: <about family> })`; mount `<AboutHero/>` then `<ProductJourney/>` inside `Container`; add an `id="experience"` anchor placeholder comment where TKT-41's timeline will mount (the `/work` ExperienceStrip and Ask evidence deep-link to `/about#experience`). Route MUST stay statically prerendered.

## Imports (confirmed paths)
`@/components/clay/{ClayCard,ClayButton,ClayIcon}` · `@/components/interactions/Reveal` · `@/components/common/Prose` · `@/components/layout/Container` · `@/components/hero/AvatarStage` (or the avatar approach it uses) · `@/data/experience` (only if you need role dates for a stage caption — prefer §4.2 copy) · `@/lib/seo` (`buildMetadata`) · `@/lib/site` (`site`).

## Acceptance criteria (TKT-40 AC 3–6 that apply to this task; TC-095)
1. `AboutHero` is the flat variant — avatar + headline + bio, no floating tiles; bio omits "AI Product Manager"; positioning is "Senior Product Manager".
2. `ProductJourney`: 4 stages on the connector line, reveal-only (no click handlers), reduced-motion opacity-only; gap note absent.
3. `/about` renders both, stays statically prerendered (`pnpm build` → `/about` in the static route list; `assert-static` green).
4. `expectNoOverflow` at 390/768/1024/1440 (EVAL-008); axe clean at 390 and 1440 (EVAL-006); flat text ≤600px measure — not a wall of text.

## TDD / gates (all must pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. Add/extend `tests/e2e/about.spec.ts` (Playwright, **run with the project's `workers:1`** — host is memory-contended; retry once if OOM-killed): no-overflow at the 4 widths, reduced-motion path (ProductJourney doesn't transform), axe clean at 390/1440. Red before green where feasible.
3. `pnpm exec vitest run` — still green (no data changes expected).
4. `pnpm prebuild` — `content OK` unchanged.
5. `pnpm build` — `/about` static; `assert-static` passes.
6. Capture screenshots of `/about` at 390/768/1024/1440 into `docs/screenshots/about/` (evidence for the phase visual gate).

## Constraints
- Everything on `/Volumes/E Drive` (configured). Stage EXPLICIT paths only (your new files + `tests/e2e/about.spec.ts` + screenshots) — never `git add -A` (untracked eval-run churn must stay out).
- One commit, imperative subject e.g. `feat(m006): TSK-23 AboutHero + ProductJourney + /about route`. Co-Authored-By trailer for your actual model.
- The bio wording is DRAFT pending Tushar's sign-off — ship the faithful composed version and FLAG it in your report; do not invent facts beyond §4.1/§4.2.

## Output — `docs/reports/TSK-23.md`
Files created/edited; how the flat hero differs from base Hero; ProductJourney stage copy + its §4.2 trace; gate results (typecheck/lint/vitest/prebuild/build/e2e with counts) + any OOM retries; screenshot paths; the bio wording shipped (for Tushar's sign-off); the commit SHA; anything needing Tushar's eye (flag, don't block).
