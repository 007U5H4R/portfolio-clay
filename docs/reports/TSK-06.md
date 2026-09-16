# TSK-06 report — ProjectCard + ViewTransitionLink + stub `/work/teachspark` (M-001 / TKT-01)

**Model tier:** most-capable. **Branch:** `m-001-tracer`. **Status:** complete (A14 row-1 fallback, decision EXE-5).

## S06.01 — BREAKER (confirmed) → A14 fallback

`node -e "console.log(Object.keys(require('react')).filter(k=>/ViewTransition/i.test(k)))"` → **`[]`** (empty).

- React resolved in repo: **19.2.8** (stable, pinned). No `ViewTransition` / `unstable_ViewTransition` on the main entry (only `startTransition`, `unstable_useCacheRefresh`, `useTransition`); no `react/experimental` entry (`ERR_PACKAGE_PATH_NOT_EXPORTED`).
- **Confirmed React VT export name: NONE.** The breaker fired; the implementer stopped and reported. The coordinator authorised **Option 1 (A14 row 1 fallback)**, recorded as **EXE-5** in `decisions.md`. React stays at stable 19.2.8 (no experimental switch).
- EXE-1 config state re-verified: `next.config.ts` does **not** set `experimental.viewTransition` (removed in Next 16.3.5) — no "unknown experimental option" warning.

### Native-VT capability check (coordinator step 3, well under the 10-min cap → default to plain)
- `next/link` **does** expose `transitionTypes?: string[]`, but its JSDoc states the types are consumed by React `<ViewTransition>` components (via `React.addTransitionType`) — which stable 19.2.8 does not ship. So `transitionTypes` alone produces no shared-element morph.
- Next's client router does not wrap App Router navigations in `startViewTransition` without that React machinery; `next` exports no VT helper.
- **Conclusion:** no clearly-stable, dependency-free standalone native primitive → stayed **pure CSS-only + plain `next/link`**, exactly as the fallback prescribes. Did not add `transitionTypes` (inert + misleading without a `<ViewTransition>`).

## Per-step

- **S06.02 — `ViewTransitionLink`** (`components/interactions/ViewTransitionLink.tsx`, `"use client"`): thin wrapper over `next/link` (prefetch default). Renders **no** React VT element (nothing carries `data-vt`). Applies the shared-element name as an inline CSS `view-transition-name` on the anchor when `transitionName` is given. jsdom gate satisfied (see tests).
- **S06.03 — `ProjectCard` (featured)** (`components/projects/ProjectCard.tsx`) + `data/tracer.ts`. Anatomy per Design.md §3: `ClayIcon 56` (wrapped in a span carrying `icon-{slug}`) → `h3` name → proposition `line-clamp-2` → ≤3 `Tag` → `StatusBadge` → presentational ghost arrow (44×44, `aria-hidden`, never a nested control). Whole card is **one** `ViewTransitionLink` with `transitionName="project-{slug}"`; single accessible name = project name (`aria-label`). Hover: rise 5px / icon scale 1.03 / arrow translateX +4px / sheen +8% opacity, 200ms, all collapsed under `motion-reduce`. `mode:'grid'` returns `null` (TKT-16). TeachSpark copy verbatim from CONTENT_INVENTORY §1.4/§2.2 (proposition, tags `AI · WhatsApp · EdTech`) + S06.03 literal (`status:'pilot'`, `statusLabel:'Live pilot — uptime unverified since 2026-09-09'`, icon `MessageSquareText`).
- **S06.04 — `CaseStudyHeader` + stub routes** (`components/case-study/CaseStudyHeader.tsx`, `app/work/[slug]/page.tsx`). Flat 60/40 grid ≥1024; left h1 name + lead (one-line problem = proposition) + meta chips (role `Solo build`, duration `Aug 2026` — both sourced from CONTENT_INVENTORY §8: "built solo", first commit 2026-08-20 / 9-day build) + `StatusBadge`; right `ClayFrame 16/9 tier card` as the VT target (`project-{slug}`) with the `icon-{slug}` slot and a labelled `Hero media coming` placeholder. Route: `generateStaticParams → [{slug:'teachspark'}]`, `dynamicParams=false`, defensive `notFound()`; renders header + "Case study — coming in this build".
- **S06.05 — VT rules + fallback CSS hooks.** The A5 `globals.css` VT rules (`::view-transition-group(*)` 450ms/`--ease-vt`; reduced-motion `::view-transition-*` collapse) were **already present** (added at S01.05 / EXE-3), so no append was needed — colour DEFINITIONS unchanged (`pnpm tokens:check` → 13/13). The per-slug `view-transition-name` hooks are applied inline (dynamic per slug, can't be a static class). **Playwright w1440 / `noViewTransitions` / `reducedMotion` specs are deferred to TSK-07** (Chromium not installed); not authored here to avoid pre-empting S07.01's `fixtures.ts` + `playwright.config.ts` — the tracer spec that exercises this path is S07.03's `tests/e2e/tracer.spec.ts` (VT + fallback assertions, S06.05).

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass (clean) |
| `pnpm lint` | pass (clean) |
| `pnpm test` | **48 passed** (13 files) — incl. new `ViewTransitionLink` (3) + `ProjectCard` (4) |
| `pnpm build` | pass — `all routes static (5)`; `/work/teachspark` is SSG |
| `pnpm tokens:check` | **13/13 tokens round-trip OK** |
| `curl /work/teachspark` | **200** |
| `curl /work/nope` | **404** |
| `curl /` | 200; home card renders `view-transition-name:project-teachspark` + `icon-teachspark` |
| case-study HTML | `<h1>TeachSpark</h1>` + `Hero media coming` + both VT hooks present (morph target matches the card) |

## Deferred (TSK-07)

Playwright/e2e gates for S06.03 (one link named "TeachSpark"; hover changes transform, not under reduced motion) and S06.05 (click card → `/work/teachspark`, h1, header media; identical end state under `noViewTransitions` + `reducedMotion`). Deferred because Chromium is not installed (installed on the E Drive in S07.02) and the fixtures/config land in S07.01. The end state these assert is already verified statically above (URL 200/404, h1, media, VT hooks).

## Deviations

1. **A14 row-1 fallback (EXE-5):** no React `<ViewTransition>` (breaker); `ViewTransitionLink` wraps plain `next/link`; morph is a CSS-only browser-native progressive enhancement. Native VT primitive check performed and rejected (see S06.01).
2. **Arrow is a `<span>`, not `ClayButton`:** the plan named a "ghost `ClayButton`", but the whole card is already an anchor, so the arrow must be a presentational `aria-hidden` span (a nested `<button>`/`<a>` is invalid HTML). Matches the brief's "the arrow is presentational (aria-hidden)".
3. **Icon VT hook via wrapper span:** `ClayIcon` has no `style` passthrough and is outside this ticket's commit surface (TSK-03), so `icon-{slug}` is applied on a wrapping span rather than by modifying the shared primitive.
4. **`globals.css` not modified:** the A5 VT rules were already present (EXE-3); appending would have duplicated them.
5. **Home FeaturedWork:** the lone tracer card is width-capped (`max-w-[26rem]`) so it reads as intentional until TKT-12 supplies the full three-card grid.

## `git diff --cached --stat`

```
 app/page.tsx                                   | 17 +++--
 app/work/[slug]/page.tsx                       | 53 +++++++++++++++
 components/case-study/CaseStudyHeader.tsx      | 78 ++++++++++++++++++++++
 components/interactions/ViewTransitionLink.tsx | 36 ++++++++++
 components/projects/ProjectCard.tsx            | 91 ++++++++++++++++++++++++++
 data/tracer.ts                                 | 36 ++++++++++
 lib/motion.ts                                  | 11 ++++
 tests/unit/ProjectCard.test.tsx                | 36 ++++++++++
 tests/unit/ViewTransitionLink.test.tsx         | 42 ++++++++++++
 9 files changed, 394 insertions(+), 6 deletions(-)
```
