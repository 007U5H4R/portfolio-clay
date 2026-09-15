# Implementer brief — TSK-05 · Hero + AvatarStage + FloatingTiles + Annotation (M-001 / TKT-01)

Fresh implementer. Execute **TSK-05 only** (steps S05.01–S05.06). Model tier: most-capable. Prereqs done: TSK-01 (scaffold/tokens/layout/site.ts), TSK-02 (`public/avatar/avatar.webp` + `avatarAlt`), TSK-03 (clay primitives incl. `ClayFrame`, `ClayTile`, `ClayIcon`, `ClayButton`), TSK-04 (`lib/motion.ts` with `springs`/`easings`/`useReducedMotionSafe`/`usePointerFine`, Header assembled in `app/layout.tsx`). Work in the repo root on branch `m-001-tracer`.

## Read first
- `technical-plan.md` §B → **TSK-05 steps S05.01–S05.06** (lines ~507–512) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` §A6 (motion: `springs.parallax` 120/20, reduced-motion, pointer-fine gating), §A7 (avatar image sizes), §A1 (client boundaries).
- `Design.md` §3 Hero (layout grid, headline, highlight wash, floating tiles) and §2 tokens.
- `CONTENT_INVENTORY.md` §1.2 — the hero copy (eyebrow, headline parts, support line, tagline, the 3 tile one-liners) is taken **verbatim** into `data/hero.ts`, each with its `source` label. Flag any DRAFT rows in your report.

## Steps (each has a hard Gate; Playwright gates run in TSK-07)
- **S05.01** `components/interactions/Parallax.tsx` (`"use client"`; props `depth`, `maxPx`; `useMotionValue`+`useSpring(springs.parallax)`; active only when `usePointerFine() && !useReducedMotionSafe()`, else renders children unmoved with NO listeners). Gate: jsdom — with `matchMedia('(pointer:fine)')` false, no `pointermove` listener added (spy on addEventListener).
- **S05.02** `components/hero/AvatarStage.tsx` (`ClayFrame ratio 4/5 tier hero tone sky tone2 lavender`; responsive widths `280/360/480/520`; `next/image src="/avatar/avatar.webp" alt={site.avatarAlt} priority placeholder="blur" blurDataURL` (read `public/avatar/avatar-blur.txt`) `sizes=...` width=1800; ≤3 supporting `ClayTile`s (Laptop/Sprout/BookMarked) at depths 0.5/1/1.5 in `Parallax`; avatar in `Parallax depth={-1} maxPx={6}`). Gate: TYPECHECK; frame widths verified in TSK-07.
- **S05.03** `components/hero/FloatingTiles.tsx` + `data/hero.ts` (typed literal, verbatim CONTENT_INVENTORY §1.2). 3 `ClayTile size 180` labels AI Products·People·Progress with sourced one-liners, vertical offsets -24/0/+24, depths via Parallax; `<1024` single column. Gate: Playwright later (offsets differ 24px at 1440; single column at 390).
- **S05.04** `components/hero/Annotation.tsx` (Caveat, `aria-hidden`, `rotate-[-4deg]`, copy "ideas → impact"; the "AI-native products" wash is a `span.hero-highlight` animating `background-position` over 700ms once, `@keyframes wash`, `animation-fill-mode:forwards`, REMOVED entirely under reduced motion). Gate: LINT; Playwright later (hero has exactly 1 aria-hidden annotation; `animation-name:none` under reduced motion).
- **S05.05** `components/hero/Hero.tsx` (server; grid `lg:grid-cols-[35fr_65fr]`; right column eyebrow→h1 (`text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)]`, contains `span.hero-highlight` "AI-native products")→lead (`max-w-[44ch] text-ink-2`)→CTA row (`ClayButton primary` "View My Work →" href="/work" + resume control from `resumeAction()`)→`FloatingTiles`; `<lg` stacked left-aligned, CTAs full-width `<md`). Also `app/page.tsx` (renders `<Hero/>` + one `<FeaturedWork/>` placeholder holding the single card from TSK-06 — leave a clearly-marked placeholder div if TSK-06 not merged yet), `app/work/page.tsx` stub ("Work — coming in this build", in `Container`), `app/contact/page.tsx` stub with `<section id="resume">` + "email me" note (so `/contact#resume` resolves — PB5). Gate: `pnpm build` → `all routes static` (count grows); DOM order at 390 = eyebrow/h1/CTA/tiles; h1 has `span.hero-highlight` "AI-native products".
- **S05.06** Verification only (no new files). Gate: reduced-motion → Parallax `transform:none` after synthetic pointermove; `curl -s localhost:3000 | grep -c 'fetchpriority="high"'` ≥1 (avatar LCP). The avatar-edge halo re-shot happens in TSK-07.

## Rules
- Everything on E Drive. Follow the plan verbatim; minimal tracer scope (no FeaturedWork real data yet — that's TKT-12).
- Do NOT install Chromium or run e2e (TSK-07 does). Satisfy typecheck/lint/build + jsdom now.
- **Commit staging: explicit paths only** (`git add components/interactions/Parallax.tsx components/hero data/hero.ts app/page.tsx app/work/page.tsx app/contact/page.tsx app/globals.css tests/unit docs/reports/TSK-05.md`). NEVER `git add -A`. (globals.css only if you add the `@keyframes wash` / `.hero-highlight` rule there — do so, keeping the `--color-` count at 13.)
- If the Hero cannot meet a Design.md contract without a token/plan change, STOP and report the breaker.

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green.
2. Commit: `feat(tracer): TSK-05 hero, avatar stage, floating tiles, annotation` + Co-Authored-By trailer. One commit.
3. Write `docs/reports/TSK-05.md`: per-step done; DRAFT hero copy rows flagged; fetchpriority result; deferred gates; `git diff --stat`.
4. Final 5-line summary: steps done, gates passed, DRAFT copy flagged, blockers, deviations, commit SHA.
