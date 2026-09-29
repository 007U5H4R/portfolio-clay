# TASK-133 — Home Featured Work → three-product editorial showcase

Cloud session, branch `cloud/task-133` (from `m-009-redesign` @ `35bcdac` + the brief commit `6492b9f`).
Spec: `docs/redesign-mockups/m-009/tushar-2026-09-29/featured-work-spec.md` (28 sections); reference
`featured-work-reference.jpg`; brief `docs/briefs/TASK-133.md`. Only the Featured Work section changed —
no other home section, no nav, no route changes.

## Summary (spec §28, the eight points)

1. **Files changed**
   - `components/projects/FeaturedWork.tsx` — rebuilt (server component; `Reveal` is the only client leaf, already on `/`).
   - `app/globals.css` — new TASK-133 block (`.fw-*`); the TKT-75 head/quote rules removed; the TKT-75 `.work-card*` rules kept for `ProjectCard`.
   - `data/projects.ts` — `featured` ranks reassigned; `gridSize: large` moved TeachSpark → RailCite (+ comments).
   - `data/featured.ts` (new) — the section's presentation extras (RailCite's one-liner, which metrics, CTA labels, art id).
   - `data/tushky/faq.json` — 11 FAQ entries re-stamped (see "Ask Tushky" below).
   - Art: `scripts/portfolio-art/collage.ts` (new torn-paper kit), `scripts/portfolio-art/featured/{railcite,slag-city,campfire-board,index}.ts` (new), `scripts/portfolio-art/build.ts` (+ `featured` target), `public/media/illustrations/featured/featured-*.svg` (new, 26 / 19 / 33 kB).
   - `content/media/illustrations/manifest.ts` + `README.md` — three `featured-<slug>` entries with provenance rows (sha256) and a TASK-133 note.
   - `Design.md` — §3.3 featured row (4 → 1), §6.3 three alts, §7.1 Featured paragraph, §11 **Dev-127**.
   - `app/page.tsx` — comment only.
   - Tests: `tests/unit/FeaturedWork.test.tsx` (new), `tests/unit/ProjectCard.test.tsx` (decoupled from FeaturedWork; the TKT-75 metric picks now live in the test so the card keeps its coverage), `tests/unit/eval-021.test.ts`, `tests/unit/paper.test.tsx`, `tests/e2e/featured.spec.ts` (rewritten), `tests/e2e/home.spec.ts`.
   - `components/projects/ProjectCard.tsx` is **untouched** (TASK-130 may be editing it); it is no longer used on `/`.
2. **Featured Work data source** — the existing `featured: 1|2|3` ranks in `data/projects.ts`: RailCite 1, Slag City 2, Campfire Board 3. Why ranks rather than a new `featuredProducts` list: the content gate (`data/index.ts`) already enforces exactly three featured personal builds with distinct ranks 1/2/3 and exactly one `gridSize: large`, so reassigning keeps ONE source of truth that the gate checks; a separate list would have left `teachspark.featured = 1` / `velora.featured = 3` stale beside it. `data/featured.ts` only adds presentation (keyed by slug; a missing entry or metric label throws at build). Other readers of `featured`: none in `app/` or `lib/` (sitemap, OG and the Ask index do not read it); `scripts/predeploy-check.ts` `FEATURED_VIDEOS` is the PB4 case-study MP4 list, unrelated to the field, so it is unchanged; `app/dev/primitives` is a dev board and unchanged.
3. **Card layout** — ≥ 1100 px: RailCite left (`1.5fr` ≈ 60 %, rows 1–2, −0.3°), Slag City top-right (+0.35°), Campfire Board bottom-right (−0.15°), equal right heights (237 px), gap 26 × 28. Desktop section = **852 px** at 1440 including the torn edge and heading (head 131 px, cards 500 px). Each card: a torn cream sheet (TASK-127 `tear-wide-*` mask, warm drop-shadow, one kraft tape fastener), copy + a pasted collage with a torn inner edge. RailCite adds its tags kicker, tagline, one-liner and two proof points.
4. **Product-art approach** — three hand-authored SVG cut-paper collages (no generation, no JS, transparent backgrounds, ≤ 40 kB, text-free), built with a new torn-paper piece kit on the TASK-127 print kit: torn fibre-rimmed pieces defined once and drawn via `<use>` (shadow → rim → face → halftone). RailCite is the richest: navy/cream/railway-red streamliner on a stone viaduct over a river, rust paper sun, layered torn hills, a circular with a round stamp shape + ruled lines + rust approval stamp, a grid-paper station map with a route line and stops, one evidence slip with a check. Slag City: charcoal foundry skyline (stacks, blast furnace, crane) before a rust sun and an industrial-blue city, district map fragment, slag heap with glowing run-off and the cover's forge hammer, dark water, an arcade ticket stub + blank token. Campfire Board: kraft planning board (three columns, scribble-only notes, ticks), a Gantt slip (its Execution Gantt view), a paper campfire, **one** chair + mug (solo tool), pines, lake, orange sun.
5. **Explore routing** — every CTA is a real `next/link` to `productHref(slug)` from `lib/portfolio.ts` → `/projects?product=railcite|slag-city|campfire-board`, same tab (no `target`), `aria-label` "Explore RailCite in Portfolio" / "Explore Slag City in Portfolio" / "Explore Campfire Board in Portfolio"; visible text "Explore case study →" (RailCite) and "Explore →". No link to `/work/`, no modal, no external URL.
6. **Query-param handling** — unchanged, reused: `IndependentProductsShowcase` reads `?product=` once on mount (`parseProductParam`), selects that tab, resets to its pitch poster and keeps the URL (`history.replaceState` with the same `productHref`). An unknown id falls back to the first product (TeachSpark). E2E verifies all three (active tab, tabpanel, sheet heading, stage poster) and the fallback.
7. **Responsive** — 700–1099 px: RailCite full width (copy | art, ≥ 460 px tall) over the two side cards side by side (art 16:10 over copy); < 700 px: one column RailCite → Slag City → Campfire Board, art over copy on every card. No horizontal overflow at 390/768/1024/1440; every CTA ≥ 44 px tall and fully inside its card (asserted). Motion (§25): the existing one-shot `Reveal` — head and RailCite rise 10 px, the right cards slide 10 px in from the right, once; nothing moves under reduced motion (asserted).
8. **Missing source content for Slag City / Campfire Board** — no metrics, users, outcomes, dates or one-line descriptions are recorded for either (their records say so), so none are shown. Each shows only its name, its verified cover line from `data/portfolio.ts` ("Coin-op brawler, in the browser." / "One dashboard, every project.") and Explore. The mockup's "Industrial intelligence, organized for action.", "A shared space for ideas, planning, and momentum." and the sticky-note words are not used (unit-tested).

## §28 checklist

| Check | Result | How |
|---|---|---|
| Featured Work contains exactly 3 products | verified | unit + e2e (3 `article[data-paper=card]`, h3s in order) |
| TeachSpark is removed | verified | unit + e2e (`not.toContainText("TeachSpark")`, also Velora/Nuptis) |
| RailCite is largest | verified | e2e ≥ 1100: 55–65 % of the row, height ≥ both side cards |
| Slag City top-right | verified | e2e geometry |
| Campfire Board bottom-right | verified | e2e geometry |
| Visual identities differ | judgement | three different compositions/metaphors (railway evidence · foundry city · camp planning board); screenshots |
| Section remains compact | verified | 852 px at 1440 (e2e asserts ≤ 900) — spec ~700–850 |
| Explore RailCite → Portfolio with RailCite selected | verified | e2e 390 + 1440 |
| Explore Slag City → Slag City selected | verified | e2e 390 + 1440 |
| Explore Campfire Board → Campfire Board selected | verified | e2e 390 + 1440 |
| No CTA opens a separate case-study page | verified | unit + e2e (no `a[href^="/work/"]` in the section; no new tab) |
| Query parameter is preserved | verified | e2e `toHaveURL(/projects?product=<id>$)` after landing |
| Mobile works | verified | e2e w390 layout + navigation; screenshot |
| No horizontal overflow | verified | e2e `noOverflow` at all four widths |
| No unsupported facts added | verified + judgement | every string from `data/*` except the spec's own head copy and Tushar's RailCite one-liner (brief-approved); the art has no readable text (EVAL-021 asserts no `<text>`) |

## Proof points (brief §3)
Read from RailCite's `metrics` by label, never retyped. Following the site's kind convention (MetricStrip / ProjectCard name the kind in text and date measured values):
- **5,760** documents indexed — "Measured · as of 15 Sep 2026" (`kind: measured`, `asOf: 2026-09-15`).
- **0** invented citations — "Structural · by construction" (`kind: structural`; forest, like the case study's zero metric). No date shown for it: it is a property of the code, not a measurement.

## Ask Tushky (brief §4 "keep those correct")
The FAQ cache versions each answer by a hash of the project records it depends on, so changing the `featured` / `gridSize` fields made 11 answers stale (build log: `tushky-faq: 10/21 fresh`; they would silently stop being served). I read each of the 11 against the change: none states a featured rank or the home layout ("TeachSpark and RailCite are the two flagships" in `who-is-tushar` refers to the two full case studies, still true). So I re-stamped them with `scripts/tushky-faq-refresh.ts --stamp …` (updates `profileVersion` + `updatedAt` only; `reviewed` untouched). Build now reports 21/21 fresh.

## Gates
- `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` ✓ (13/13)
- `pnpm test`: 66 files passed (1 skipped) · 714 tests passed, 4 skipped
- `pnpm build` ✓ — all 17 routes static; content gate OK, tushky-faq 21/21 fresh
- Bundle (`scripts/bundle-budget.ts`): `/` **161.3 kB** gz · `/projects` **170.6 kB** gz (budget 180) ✓
- **Full `pnpm test:e2e`** (w390, w768, w1024, w1440): **Full run** (`PW_WORKERS=3`, build at `eb65414`): **1352 passed, 15 failed, 1581 skipped** (project-scoped skips), 22.4 min. Every failure was then resolved or shown to be environmental / pre-existing:
  - **Caused by this change, fixed and re-run alone ✓** (6): `eval-002` w390 (hop 1 asserted a home link to `/work/teachspark` — now the Portfolio deep link, `f9a3d54`); `eval-015` VT-off w390 (card hop now starts on `/projects`, `8bc575e`); `eval-008` 14 px floor on `/` at all four widths (the RailCite kicker + proof kind are 12 px — marked `data-micro-label` like ProjectCard / MetricStrip, still ≥ 12 px + AA, `a431d15`). Also updated pre-emptively in `68940a0`: `eval-010` reduced-motion card hover and three `tracer.spec` card → case-study tests (they assumed the old home card).
  - **Environmental, identical on the untouched baseline `35bcdac`** (checked in a separate worktree): `eval-014` valid-src playback (this Chromium build cannot play the MP4 fixture); `portfolio-video` Campfire + Slag City at w390/w1440 (YouTube player → `error`, no YouTube egress). `eval-011-dead-controls` and `playground` live URLs: every "dead" control is an external link (Credly, *.vercel.app, github.io) answering **HTTP 403 from the sandbox egress proxy**; none is on `/`.
  - **Load-only, pass alone ✓**: `eval-019` hero clip timing (w1440) and `home-ask-tushky` suggestion cards (w1440).
  - **Targeted re-run** on the final build (1 worker: `eval-002`, `eval-008`, `eval-015`, `eval-019`, `home-ask-tushky`, `tracer`, `eval-010`, `featured`, `home`, all widths): **570 passed, 1 failed, 457 skipped**. The one failure — `home-ask-tushky` "hero ✦ Ask Tushky CTA" at w1024, a click that times out chasing the hero's TKT-106 scroll-driven lag — is a **pre-existing flake**: on the untouched baseline it fails 2 of 6 repeats (this branch 1 of 6), and the geometry at rest is identical on both builds.
- Screenshots `docs/screenshots/m-009/task-133/`: `before-{390,768,1440}.png` (baseline build, `35bcdac`), `after-{390,768,1440}.png`. The 1440 result was compared with the reference and refined twice (round 1: compact proof points, wider side-card copy, section 980 → 818 px; round 2: evidence slip moved inside the crop, side tagline measure). Bottom padding was then restored to the site's section scale (→ 852 px), see note 3.

## Commits
- `fbdd5ef` feat(home): hand-draw cut-paper collages for the Featured Work cards
- `f2a9561` content(home): feature RailCite, Slag City and Campfire Board (featured ranks, `data/featured.ts`, FAQ re-stamp)
- `ee1ee94` feat(home): rebuild Featured Work as a three-product editorial showcase
- `eb65414` test(home): assert the Featured Work showcase contract; record Dev-127
- `7167d43` docs(home): Featured Work before/after screenshots at 390, 768, 1440
- `f9a3d54` test(eval-002): hop 1 from / is the Portfolio deep link now
- `a431d15` fix(home): mark the Featured Work 12 px labels as micro-labels
- `8bc575e` test(eval-015): start the VT-off card hop on /projects
- `68940a0` test(e2e): move home card assumptions to the Explore link and /projects
- this report (last commit)

All commits end with the Co-Authored-By trailer; only `cloud/task-133` was pushed (nothing to `m-009-redesign` or `main`, no deploy, `backlog/` untouched).

## Notes
1. **Environment.** `.env.tooling` points at Tushar's Mac; every shell exported `TMPDIR=/tmp`. The session's rules forbid `playwright install`, so `~/.cache/ms-playwright/chromium*-1243` symlink the preinstalled Chromium (141) that Playwright 1.63 then launches; nothing in the repo changed for this. The full e2e ran with `PW_WORKERS=3` (1 worker would have taken hours on this 4-core VM).
2. **E2E contract changes.** Besides the specs below, `eval-002`, `eval-015`, `eval-010` and `tracer` assumed a home card linking to `/work/teachspark`; they now use the Explore link or start the card → case-study hop on `/projects` (their intent kept, no coverage removed). `featured.spec.ts` asserts the new contract (content, same-tab deep link + selected product + stage poster, invalid-id fallback, hrefs 200, 1 decoration, layout per breakpoint, uncropped CTAs, CTA hover −1 px / arrow +3 px, one-shot entrance, reduced motion). `home.spec.ts` featured decoration count 4 → 1. No coverage deleted: the TKT-75 `ProjectCard` coverage stays in `tests/unit/ProjectCard.test.tsx`.
3. **TKT-106 slide-over vs the CTAs.** The next section's torn sheet slides up to 200 px (phones 120 px) over this section's foot as you scroll on. With an 80 px bottom padding the Campfire CTA fell into that zone; the padding is back at the site's section scale (`clamp(100px, 8.4vw, 122px)`), and a full-motion e2e asserts each CTA is hit-testable at rest. The navigation clicks run under reduced motion (as the TKT-75 test did), because the scroll-driven lag lands a frame after Playwright's scroll and its click point chases it.
4. **Dev-only crash (pre-existing, not from this task).** `next dev` 500s on `/`: `components/hero/Hero.tsx` puts a `next/image` inside a `Sheet`, whose dev-only fastener check dots into the client reference. Production is unaffected; I queued it as a separate suggested task.
5. **Sync.** `git fetch origin && git merge origin/m-009-redesign` → "Already up to date" (`m-009-redesign` is still `35bcdac`, re-checked before the final push).
6. **Screenshot churn.** The full e2e run rewrites many tracked `docs/screenshots/**` files; that churn was restored (`git checkout -- docs/screenshots`), never committed. Only `docs/screenshots/m-009/task-133/` is new.
7. **Micro-labels.** The RailCite kicker and the proof-point kind line are 12 px Inter with `data-micro-label` (the ProjectCard / MetricStrip precedent). EXE-7 describes the exemption as for brand micro-labels; if Tushar prefers, both can go to 14 px instead (the RailCite copy column has room for one more line).

## Open questions for Tushar
1. **Label-in-name (WCAG 2.5.3).** RailCite's visible CTA text "Explore case study →" is not contained in the spec's accessible name "Explore RailCite in Portfolio" (the other two are fine: "Explore" ⊂ "Explore Slag City in Portfolio"). Kept as specified. Change the visible text to "Explore RailCite →", or the label to "Explore RailCite case study in Portfolio"?
2. **"Explore case study" wording.** It opens the Portfolio tab with RailCite selected, not the case study (spec §12). OK as is?
3. **Side-card kickers.** RailCite shows its tags ("AI · RAG · GovTech"); Slag City and Campfire Board show none, to match the mockup and keep their narrow copy column to name + cover line + Explore. Add their tags too?
4. **Period after cover lines.** The three cover lines get a closing period ("Coin-op brawler, in the browser.") for consistency with "Research on track." Keep?
5. **`ProjectCard` is now unused on `/`.** It and its CSS were left in place for TASK-130. Remove once TASK-130 settles?
