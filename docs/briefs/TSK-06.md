# Implementer brief — TSK-06 · ProjectCard + ViewTransitionLink + stub /work/teachspark (M-001 / TKT-01)

Fresh implementer. Execute **TSK-06 only** (steps S06.01–S06.05). Model tier: most-capable. Prereqs done: TSK-01 (scaffold/tokens/`lib/motion.ts` via TSK-04), TSK-03 (`ClayFrame`, `ClayIcon`, `Tag`, `StatusBadge`, `ClayButton`), TSK-04 (`lib/motion.ts`), TSK-05 (Hero + `app/work/page.tsx` stub). Work in the repo root on branch `m-001-tracer`.

## Read first
- `technical-plan.md` §B → **TSK-06 steps S06.01–S06.05** (lines ~516–520) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` §A5 (View Transitions strategy + the globals.css VT rules), §A14 row 1 (VT fallback), and **EXE-1 in decisions.md** (Next 16.3.5 removed `experimental.viewTransition`; VT is built into the App Router — the config flag is gone; you verify the React export name here).
- `Design.md` §3 ProjectCard/FeaturedWork anatomy; **E-11** featured cards use `ClayIcon`, NOT product imagery. **E-3** chapter ids vs anchor slugs (not relevant to the stub, but keep the header shell generic).
- `CONTENT_INVENTORY.md` §1.4 for the TeachSpark card copy (name, tagline, tags, status label) — verbatim into `data/tracer.ts`.

## Steps
- **S06.01 — BREAKER CHECK FIRST.** Run `node -e "console.log(Object.keys(require('react')).filter(k=>/ViewTransition/i.test(k)))"`. If it prints a non-empty array, note the exact export name (likely `unstable_ViewTransition`) and re-export it from `lib/motion.ts` as `ViewTransition`. **If the array is EMPTY → STOP immediately and report the breaker** (this triggers the A14 fallback = plain `next/link` + CSS-only, no shared element). Do NOT improvise VT code without a confirmed export. Also confirm `pnpm dev` starts with no "unknown experimental option" warning (the flag was correctly omitted at EXE-1). Gate: the chosen name printed; dev starts clean.
- **S06.02** `components/interactions/ViewTransitionLink.tsx` (`"use client"`; wraps `next/link`, renders children inside `<ViewTransition name={transitionName}>` only when `typeof document!=='undefined' && 'startViewTransition' in document && !reducedMotion`, else plain `Link`; `prefetch` default; set a `data-vt` attr when active). Gate: jsdom — with `document.startViewTransition` undefined, no VT element rendered (query `data-vt`).
- **S06.03** `components/projects/ProjectCard.tsx` (`mode:'featured'|'grid'` — implement featured only; grid is TKT-16). Anatomy: `ClayIcon 56` (VT name `icon-{slug}`) → `h3` name → proposition `line-clamp-2` → ≤3 `Tag` → `StatusBadge` → presentational ghost arrow 44×44 (`aria-hidden`); whole card is ONE link via `ViewTransitionLink transitionName="project-{slug}"`; single accessible name = project name; hover rise 5px / icon scale 1.03 / arrow translateX 4px / gradient +8%, 200ms (removed under reduced motion). `data/tracer.ts` (TeachSpark literal: name, tagline §1.4, tags `AI · WhatsApp · EdTech`, `status:'pilot'`, statusLabel per §1.4, icon `MessageSquareText`). Gate: Playwright later — exactly one `a` whose accessible name includes "TeachSpark"; hover changes transform (desktop, not under reduced motion).
- **S06.04** `components/case-study/CaseStudyHeader.tsx` (flat 60/40 grid ≥1024; left h1 name + lead + meta chips role/duration/status; right `ClayFrame ratio 16/9 tier card` VT target `project-{slug}` with a labelled placeholder `Media.kind:'placeholder'` "Hero media coming"; icon slot `icon-{slug}`) and `app/work/[slug]/page.tsx` (`generateStaticParams → [{slug:'teachspark'}]`, `notFound()` otherwise; header + "Case study — coming in this build"). Gate: `pnpm build` → all routes static (count grows); `curl` `/work/teachspark` → 200, `/work/nope` → 404.
- **S06.05** `app/globals.css` VT rules from A5 (append; keep `--color-` count 13). Gate: Playwright w1440 (deferred to TSK-07) — click card → `/work/teachspark`, h1 "TeachSpark", header media present; same under `noViewTransitions` + `reducedMotion` fixtures → identical assertions. Author the rules + note the deferral.

## Rules
- Everything on E Drive. Follow the plan verbatim; minimal tracer scope.
- Do NOT install Chromium or run e2e (TSK-07). Satisfy typecheck/lint/build + jsdom now.
- **Commit staging: explicit paths only** (`git add components/interactions/ViewTransitionLink.tsx components/projects/ProjectCard.tsx components/case-study/CaseStudyHeader.tsx data/tracer.ts app/work/[slug] app/page.tsx app/globals.css lib/motion.ts tests/unit docs/reports/TSK-06.md`). NEVER `git add -A`.
- The S06.01 breaker is real: if the React VT export is absent, STOP and report — do not build VT on an assumption.

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green.
2. Commit: `feat(tracer): TSK-06 project card, view-transition link, case-study stub` + Co-Authored-By trailer. One commit.
3. Write `docs/reports/TSK-06.md`: the confirmed React VT export name; per-step done; `/work/teachspark` 200 + `/work/nope` 404; deferred Playwright gates; `git diff --stat`.
4. Final 5-line summary: VT export name (or breaker), steps done, gates passed, blockers, deviations, commit SHA.
