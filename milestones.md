# Milestones — Clay Portfolio

Stage 5 (Problem Breakdown) · 2026-09-15 · consumes `Solution-PRD.md` (§5, §6, §8, §11), `Design.md`, `COMPONENT_ARCHITECTURE.md`, `SITEMAP.md`, `evaluation-plan.md` (EVAL-001…017), `decisions.md` (S1–S10, EV1–EV2, D1–D5), `CONTENT_INVENTORY.md`. Companion: `tickets.md` (TKT-01…TKT-54 in dependency order; TKT-34…38 retired into TKT-54 per decision PB2 — 49 live tickets, 162 sp; revised 2026-09-15 after Tushar's answers, decisions PB1–PB5). Consumed by Stage 6 (`technical-plan.md`, `test-cases.md`, Campfire PWA onboarding — milestone IDs below are mirrored onto PWA milestones verbatim).

Milestone IDs are stable (`M-001`…`M-007`). Ticket IDs are provisional (`TKT-##`) until Stage 6 onboarding assigns native Backlog IDs; the mapping is recorded in `tickets.md` §0.4.

## Definition of Done — base template (applies to every milestone; per-milestone additions listed below)

```text
[ ] Functional implementation complete
[ ] Acceptance Criteria satisfied (every ticket in the milestone)
[ ] Required tests created
[ ] Required tests pass
[ ] Required evaluation cases created (eval-cases.json rows exist for the EVAL IDs the milestone claims)
[ ] Applicable evaluation suite executed (`pnpm eval`, or the tracer-bullet minimal run for M-001)
[ ] Critical evaluations pass (no Critical EVAL regressed against the previous run)
[ ] No unacceptable regression against baseline (evals/results/baseline-v1.json)
[ ] Results persisted (evals/results/eval-run-<version>.json with commit/branch/timestamp)
[ ] Required documentation updated (HANDOFF.md, decisions.md EXE-n entries, tickets.md status)
[ ] Required observability added (build output, eval JSON, Vercel Analytics/Speed Insights where applicable)
[ ] Performance thresholds pass (performance-sensitive milestones: M-003, M-005, M-007)
[ ] Required security checks pass (security-sensitive milestones: M-002 content gate, M-007 deploy)
```

## Sequence and dependency graph

```
M-001 ──► M-002 ──► M-003 ──┐
              │             │
              ├──► M-004 ──►├──► M-005 ──┐
              │             │            ├──► M-007
              └──► M-006 ───┘────────────┘
```
M-002 is the fan-out point; M-003, M-004 and M-006 can run as interleaved phases once foundations exist. M-005 needs M-004's case-study system. M-007 needs everything. Per PB1, M-002's non-visual tickets (TKT-03 schema, TKT-07 harness) start as soon as TKT-01 is merged and overlap the TKT-02 gate; only the visual foundations wait for approval.

| ID | Milestone | Tickets | Count | sp total | Priority |
|---|---|---|---|---|---|
| M-001 | Tracer bullet & visual direction approved | TKT-01–02 | 2 | 9 | P0 |
| M-002 | Foundations & quality harness | TKT-03–08 | 6 | 25 | P0 |
| M-003 | Home complete | TKT-09–14 | 6 | 24 | P0 |
| M-004 | Work page & case-study system | TKT-15–21 | 7 | 26 | P0 |
| M-005 | Case-study content (11) & media | TKT-22–33, TKT-39, TKT-54 (TKT-34–38 retired) | 14 | 40 | P1 |
| M-006 | About · Thinking · Playground · Contact · 404 | TKT-40–46 | 7 | 20 | P1 |
| M-007 | Quality sweeps, deployment & production verification | TKT-47–53 | 7 | 18 | P0 |
| | **Total** | | **49** | **162** | |

---

## M-001 · Tracer bullet & visual direction approved

- **Objective.** Kill the riskiest assumption first: that premium claymorphism + the generated avatar + the shared-element card→case-study transition read as "Senior PM, not student" on a real rendered page at all four widths — before any other section exists.
- **Scope.** Project scaffold with Design.md tokens; compacting Header; Hero with the real avatar (`content/media/avatar/avatar-source.png` → cutout WebP), CTAs, three floating tiles; exactly one project card (TeachSpark) with the shared-element transition to a stub `/work/teachspark`; screenshots at 390/768/1024/1440; the first `pnpm eval` run persisted as `evals/results/baseline-v1.json`; a human visual-direction gate with Tushar.
- **Out of scope.** Every other section, page, data schema, test harness beyond the minimal baseline runner, any content beyond the hero copy and one card.
- **Deliverables.** Running Next 16 app (`pnpm dev` / `pnpm build`), `app/globals.css` `@theme` block, `public/avatar/*.webp`, `docs/screenshots/tracer/*.png` (8 files), `evals/results/baseline-v1.json`, Tushar's written approval recorded in `decisions.md` (EXE-1).
- **Associated tickets.** TKT-01 (tracer bullet, 7 tasks), TKT-02 (visual-direction gate).
- **Dependencies.** Stage 4 approved (`Design.md`, D5 avatar chosen). Stage 6 `technical-plan.md` must exist before TKT-01 is dispatched (workflow guardrail: no code before Stage 6).
- **Entry criteria.** Stage 6 complete; PWA onboarded; worktree/branch created per Execution rules.
- **Exit criteria.** All TKT-01 acceptance criteria met (including AC 10 — the "Resume — updating" placeholder state, PB5); baseline JSON persisted; TKT-02 approval given in writing (not silence); any direction changes written back into `Design.md`/`decisions.md` before the visual foundations (TKT-04/05/06) start. TKT-03 and TKT-07 may already be in flight (PB1).
- **Definition of Done.** Base template. Additional: `[ ] Tushar confirmed avatar likeness on the rendered page` · `[ ] 5-second checklist (EVAL-001) scored at 390 and 1440 on the tracer screenshots (informational — Hero alone should already carry 6/6)`.
- **Target sequence.** Phase 1 (first thing built).
- **Priority.** P0. **Status.** Planned.
- **Risks.** Avatar cutout edge quality on a soft clay frame; View Transitions API variance in Safari/Firefox (fallback must be plain navigation — Solution-PRD §9); the "toy" read appearing already at this stage (cheapest possible moment to catch it).
- **Blockers.** None known (avatar source already saved and approved — D5).
- **Notes.** This milestone is deliberately tiny. If the gate fails, the fix loop is on tokens/tiers/avatar treatment — not on more features.

## M-002 · Foundations & quality harness

- **Objective.** Make the truth rules and quality budgets mechanical before any page is built: content schema that fails the build on an unsourced claim, the complete clay primitive system (tiers = the anti-toy guardrail, D1), layout/reveal/motion infrastructure, SEO/OG generation, and the single `pnpm eval` command that every later ticket regresses against.
- **Scope.** `data/schema.ts` + zod gate + deliberate failing fixture + forbidden-string test; `components/clay/*` and `components/common/*`; `components/layout/*`, `Reveal`, `lib/motion.ts`; `lib/seo.ts`, `opengraph-image.tsx` generator, `sitemap.ts`, `robots.ts`; Vitest + Playwright (4 widths) + axe + Lighthouse CI + dead-control crawler + `eval-cases.json` + results/provenance writer; the sanitised resume PDF and its PII gate.
- **Out of scope.** Any page section; any project content beyond schema fixtures.
- **Deliverables.** Passing `pnpm typecheck && pnpm lint && pnpm test && pnpm eval`; a documented, reproducible failing-fixture run proving EVAL-013; `evals/eval-cases.json` with all 17 EVAL rows; `public/resume.pdf` sanitised (or an explicit blocker record if Tushar has not delivered it).
- **Associated tickets.** TKT-03 (schema + content-integrity gate), TKT-04 (clay primitive system), TKT-05 (layout/section/reveal/motion/footer shell), TKT-06 (SEO/OG/sitemap/robots), TKT-07 (test & eval harness, 5 tasks), TKT-08 (sanitised resume PDF + PII gate — Tushar).
- **Dependencies.** TKT-01 merged (for TKT-03 schema, TKT-07 harness, TKT-08 resume — PB1); M-001 exit / TKT-02 approval (for TKT-04, TKT-05, TKT-06 — the visual foundations).
- **Entry criteria.** Split per PB1: non-visual tickets enter on TKT-01 merge; visual tickets enter on TKT-02 approval with the token file locked (OKLCH regenerated, D2).
- **Exit criteria.** `pnpm eval` runs end-to-end on the tracer pages and writes `eval-run-*.json`; failing fixture demonstrably fails `pnpm build`; every clay primitive has a Storybook-free visual check page or Playwright screenshot; no primitive exposes clay tokens to a `flat`-tier consumer.
- **Definition of Done.** Base template. Additional: `[ ] Failing-fixture run captured in evals/results/ (EVAL-013 proven)` · `[ ] Security: forbidden-string grep covers repo + built bundle (EVAL-016 part)` · `[ ] Baseline comparison against baseline-v1.json shows no Critical regression`.
- **Target sequence.** Phase 2.
- **Priority.** P0. **Status.** Planned.
- **Risks.** Lighthouse CI flakiness on local runs (mitigate: 3-run median, per evaluation-plan §3); zod schema over-modelled before real content exists (mitigate: model exactly COMPONENT_ARCHITECTURE §2, extend in M-005 only with evidence); resume PDF delayed by Tushar (non-blocking here, blocking for M-007).
- **Blockers.** TKT-08 depends on Tushar (sanitised export, patent no. 429867, title) — non-blocking for this milestone and for previews (PB5 placeholder), hard-blocking only for production (TKT-53).
- **Notes.** Sequence inside the milestone (PB1): TKT-03 starts immediately after TKT-01; TKT-07 follows TKT-03 and crawls a static route list until TKT-06's sitemap exists; TKT-04 → TKT-05/06 start once TKT-02 is approved. TKT-08 any time.

## M-003 · Home complete

- **Objective.** The executive summary page passes the 5-second test and the Ask feature answers honestly from sourced content — the two things a recruiter and a product leader hit first.
- **Scope.** Ask my portfolio (knowledge data, `AnswerProvider`, `LocalKnowledgeProvider`, inline `AskPortfolio`, global `AskPanel` drawer/bottom sheet), Featured Work (3 cards), How I Think (6 stages with real examples), Final CTA + Footer, home OG image, home assembly in the fixed mobile order.
- **Out of scope.** RAG provider (stub only, S7), dark mode (S9), any home section not listed in Solution-PRD §5.
- **Deliverables.** `/` complete at 4 widths; `data/knowledge.ts` + `data/thinking-framework.ts`; EVAL-012 Vitest suite green (every suggested prompt → ≥2 evidence links; off-topic → empty state); EVAL-001 screenshot review pack.
- **Associated tickets.** TKT-09 (knowledge data + providers), TKT-10 (AskPortfolio inline), TKT-11 (AskPanel global), TKT-12 (Featured Work), TKT-13 (How I Think), TKT-14 (Final CTA + Footer + home assembly + 5-second test).
- **Dependencies.** M-002 exit. TKT-12's card→case-study link targets the TKT-19 shell (a stub route is acceptable until M-004 lands).
- **Entry criteria.** Schema, primitives, layout, eval harness available; Tushar's decision on the 8 KnowledgeIndex answers (sign-off or "ship as DRAFT-labelled") recorded.
- **Exit criteria.** EVAL-001 6/6 at 390 and 1440 (human + Claude review); EVAL-012 11/11 answered · 5/5 empty · 0 fabricated; EVAL-005 budgets on `/` (JS ≤ 180 kB gz, LCP ≤ 2.5 s, CLS < 0.05); EVAL-007 keyboard path through AskPanel; `pnpm eval` green with no Critical regression.
- **Definition of Done.** Base template. Additional: `[ ] Performance thresholds pass on / (EVAL-004/005)` · `[ ] Ask copy states answers come from portfolio content (S7) — verified in DOM`.
- **Target sequence.** Phase 3 (can interleave with M-004 after TKT-09).
- **Priority.** P0. **Status.** Planned.
- **Risks.** Knowledge answers stay DRAFT (mitigate: render with a visible "from portfolio content" note; sign-off is a Tushar dependency, not a build blocker); AskPanel focus-trap/bottom-sheet complexity (D3) eats budget; How I Think examples require case-study anchors that don't exist until M-005 (mitigate: link to `/work/<slug>` route root until chapter anchors exist, then update).
- **Blockers.** Tushar: sign-off on the 8 Ask answers + 3 additional prompts (see tickets.md §0.5 Q3).
- **Notes.** Featured cards use `ClayIcon` (lucide) not product images (Design.md §3 card anatomy), so no screenshot dependency.

## M-004 · Work page & case-study system

- **Objective.** The system that carries the portfolio's proof: a filterable editorial `/work` with professional experience visibly separated, and a data-driven `/work/[slug]` template (header, overview toggle, 8 chapters, 8 artifact types, Show-the-thinking, next project) that renders any conforming `Project` record.
- **Scope.** Expand `data/projects.ts` to all 14 entries at card fidelity; `/work` (WorkHero, FilterTabs URL-synced, EditorialGrid, ProjectCard grid mode, per-filter empty state); ExperienceStrip; DemoVideo with four states; case-study shell; artifact components; ShowTheThinking.
- **Out of scope.** Case-study chapter content (M-005); corporate case-study pages (Solution-PRD §6).
- **Deliverables.** `/work` complete; `/work/[slug]` renders for all 11 slugs from card-level data with chapters empty-but-honest (short page, no invented content); EVAL-014 four video states demonstrable with a fixture; EVAL-015 View Transitions fallback verified.
- **Associated tickets.** TKT-15 (project data at card fidelity), TKT-16 (`/work` page, 3 tasks), TKT-17 (ExperienceStrip), TKT-18 (DemoVideo), TKT-19 (case-study shell, 3 tasks), TKT-20 (artifact components, 3 tasks), TKT-21 (ShowTheThinking).
- **Dependencies.** M-002 exit; TKT-01's stub `/work/teachspark` is replaced by TKT-19.
- **Entry criteria.** Schema locked for `Project`; Tushar's FilterTabs decision for Token Toli / Pratyasa / Bhakti-Vilas (default: park under Experiments — zero visual impact either way).
- **Exit criteria.** Filters, grid sizes (1 large / 2 medium / rest small), URL sync, empty states pass Playwright at 4 widths; recruiter path hop `/work → /work/[slug]` green (EVAL-002 partial); keyboard + reduced-motion paths for ShowTheThinking (EVAL-007/010); `pnpm eval` green.
- **Definition of Done.** Base template. Additional: `[ ] ExperienceStrip never renders a live-link or arrow affordance (corporate ≠ public product)` · `[ ] Every artifact component locks to card tier and every chapter body to flat tier (D1)`.
- **Target sequence.** Phase 4.
- **Priority.** P0. **Status.** Planned.
- **Risks.** EditorialGrid math at 768–1023 (mitigate: Design.md §3 specifies every breakpoint); artifact-card sprawl (mitigate: one `ArtifactCard` DNA, shape props only); DemoVideo intent-loading on desktop 50 %-in-view vs Lighthouse (mitigate: `preload="none"` + poster is the LCP element, not the video).
- **Blockers.** Tushar: FilterTabs bucket decision (non-blocking with the Experiments default).
- **Notes.** TKT-18 and TKT-20/21 have no dependency on TKT-16/19 and can run in parallel with separate implementers (disjoint files).

## M-005 · Case-study content (11) & media

- **Objective.** Fill the system with the real evidence: one content ticket per case study sourced strictly from `CONTENT_INVENTORY.md` §8 packs, plus the media each needs (re-encoded/recorded demo videos ≤ 4 MB with posters, screenshots where they exist). Depth scales with evidence — TeachSpark, RailCite, Velora/Nuptis, Cubicle get full chapters; discovery-only and playground items get shorter, honest pages.
- **Scope.** Media: TeachSpark re-encode + screenshots, RailCite recording + screenshots, Nuptis + Velora recordings, Bhakti-Vilas recording + screenshots, Pratyasa/Tegaki/dino-arcade/cinematic recordings, Cubicle (conditional on deployment). Content: 7 tickets — 6 full-depth (TeachSpark, RailCite, Velora first; then Nuptis, Cubicle, Bhakti-Vilas) plus TKT-54 carrying the five thin case studies as one task each (PB2). Verification of the product-leader question mapping (EVAL-003).
- **Out of scope.** Any fact not in a §8 pack; corporate screenshots (CONTENT_INVENTORY §2.3 — none without employer clearance); videos > 4 MB; anything under `Game/neogeo/`; TeachSpark sandbox join code; `.env` values.
- **Deliverables.** `data/projects.ts` complete for 11 slugs (chapters, artifacts, thinking chain, metrics with `asOf`/`kind`/`source`, learnings, sources); `public/video/<slug>.mp4` + `public/video/<slug>-poster.webp` for every recorded app; `content/media/<slug>/` source captures; EVAL-003 traceability confirmed 8/8.
- **Associated tickets.** Media: TKT-22 (TeachSpark), TKT-23 (RailCite), TKT-24 (Nuptis + Velora), TKT-25 (Bhakti-Vilas), TKT-26 (Pratyasa + Tegaki + dino-arcade + cinematic), TKT-27 (Cubicle, conditional). Content: TKT-28 TeachSpark, TKT-29 RailCite, TKT-30 Velora, TKT-31 Nuptis, TKT-32 Cubicle, TKT-33 Bhakti-Vilas, TKT-54 thin five (TSK-25 Token Toli · TSK-26 Pratyasa · TSK-27 Tegaki · TSK-28 dino-arcade · TSK-29 cinematic-portfolio; TKT-34…38 retired). TKT-39 EVAL-003 traceability verification.
- **Dependencies.** M-004 exit (TKT-19/20/21). Media tickets depend only on TKT-01 (public/ layout exists) and can start during M-002–M-004. Per PB4, **every** media ticket is a soft dependency of its content ticket (DemoVideo's honest `no-video` state and a labelled hero placeholder cover late captures, including RailCite and Bhakti-Vilas); the featured-3 videos (TKT-22 TeachSpark, TKT-23 RailCite, TKT-24 Velora) are instead **hard blockers of the deployment ticket TKT-50** in M-007.
- **Entry criteria.** Case-study shell renders from data; Tushar's canonical TeachSpark metric snapshot decided (recommended 2026-08-24 Final PRD); RailCite corpus figure policy decided (recommended live-with-date).
- **Exit criteria.** All 11 `/work/[slug]` pages build with zero schema violations; every metric shows value + label + context + asOf + kind; every MISSING item from the pack is either omitted or rendered as a labelled placeholder; each recorded video ≤ 4 MB with poster; `pnpm eval` green including EVAL-013 and EVAL-014; EVAL-003 8/8.
- **Definition of Done.** Base template. Additional: `[ ] Performance thresholds pass on /work/teachspark (EVAL-004) after real media lands` · `[ ] Truth review: a reviewer can trace every sentence on TeachSpark/RailCite/Velora pages to a pack line`.
- **Target sequence.** Phase 5 (media tickets can be pulled forward as filler work from Phase 2 onward).
- **Priority.** P1 (TeachSpark/RailCite content tickets are P0 — they carry the featured proof). **Status.** Planned.
- **Risks.** TeachSpark Railway uptime unverified after 2026-09-09 — recording may be impossible (mitigate: verify first; if down, badge changes to "Pilot concluded" and video = re-encoded 08-23 mp4); Cubicle never deploys (ships as "Built, not launched" — S3, no video); content tickets drift into invention under time pressure (mitigate: schema gate + pack-only rule + reviewer trace).
- **Blockers.** Tushar: TeachSpark metric date, RailCite figure policy, Cubicle deploy decision (by 09-16), "via IntraEdge" presentation (affects About more than here).
- **Notes.** Content tickets are `Task` type (data authoring), not `Feature`. Icons for Cubicle and Token Toli do not exist as assets — cards use `ClayIcon` (lucide) per Design.md, so no icon ticket is needed.

## M-006 · About · Thinking · Playground · Contact · 404

- **Objective.** Close the funnel: the person and the proof of level (`/about` with the interactive timeline), the editorial voice (`/thinking` with DRAFT-labelled essays), the playful corner (`/playground`), the conversion endpoint (`/contact`), and a graceful 404.
- **Scope.** `data/experience.ts`, `data/skills.ts`, `data/writing.ts`; About (hero, Product Journey, 4 clusters, Impact, ExperienceTimeline with StoryCards, Awards, Research, Education); Thinking list + essay route; Playground tiles; ContactCard with CopyButton; not-found page; OG images for each page family.
- **Out of scope.** Contact form (S10); published essays (none exist — DRAFT only); certificates as images (MISSING); DOB/phone/address; PMP/SAFe.
- **Deliverables.** Five routes + 404 complete at 4 widths; ExperienceTimeline keyboard path (EVAL-007); resume reachable from `/about` and `/contact` (EVAL-002).
- **Associated tickets.** TKT-40 (About data + hero + journey + clusters + impact, 3 tasks), TKT-41 (ExperienceTimeline), TKT-42 (Awards/Research/Education + About assembly), TKT-43 (Thinking list + essay route), TKT-44 (Playground), TKT-45 (Contact), TKT-46 (404).
- **Dependencies.** M-002 exit; TKT-20 (MetricCard shape for Impact); TKT-15 (playground tiles read project data). TKT-08 is soft (PB5): Contact/About render the "Resume — updating" placeholder until the sanitised PDF flips `resumeAvailable`.
- **Entry criteria.** Primitives + layout + SEO available; Tushar decisions: "via IntraEdge" wording, 2019–2022 gap framing, years-of-experience wording ("7+" per resume).
- **Exit criteria.** All routes pass Playwright at 4 widths + axe; timeline: one card open at a time, URL hash per role, keyboard operable; DRAFT essays visibly labelled; every Impact number carries context + "self-reported" where applicable; `pnpm eval` green.
- **Definition of Done.** Base template. Additional: `[ ] No PII string present in repo or bundle (EVAL-013/016 grep)`.
- **Target sequence.** Phase 6 (can interleave with M-005 — disjoint files).
- **Priority.** P1. **Status.** Planned.
- **Risks.** Timeline StoryCard layout animation at tablet width; About page becoming a wall of resume text (mitigate: Design.md §3 — MetricCard shape, clusters as tiles, flat text kept to ≤600px measure).
- **Blockers.** Tushar: five essay titles sign-off (non-blocking — DRAFT label), Soft Matter DOI (omit until supplied), resume PDF (TKT-08).
- **Notes.** `/playground` links open live URLs in new tabs (`rel="noopener"`); the dead-control crawler treats external 200s as resolved.

## M-007 · Quality sweeps, deployment & production verification

- **Objective.** Prove the whole site against the release gates (evaluation-plan §6) on a real deployment, hand a complete evidence pack to Stages 8–10, then ship to the new domain and verify production.
- **Scope.** Responsive sweep, accessibility sweep, performance pass, Vercel project + preview deployment + security headers + Analytics, link-preview validation on real URLs, the hand-off-to-review full eval run, production deployment + verification + monitoring.
- **Out of scope.** Stage 8–10 review work itself (workflow stages, not tickets); `QA-report.md` and `lesson-learnt.md` authoring (produced by those stages); dark mode; RAG.
- **Deliverables.** `evals/results/eval-run-v1.0.0-rc.json` (full suite), `docs/screenshots/<route>/<width>.png` pack for Stage 8, Vercel project `portfolio-clay` on the new domain, production verification record, release provenance in `HANDOFF.md`.
- **Associated tickets.** TKT-47 (responsive sweep), TKT-48 (accessibility sweep), TKT-49 (performance pass), TKT-50 (Vercel project + preview deploy + headers), TKT-51 (link-preview validation), TKT-52 (hand-off to review: full eval run), TKT-53 (production deployment + verification).
- **Dependencies.** M-003, M-004, M-005, M-006 exits; **TKT-22, TKT-23, TKT-24** (featured-3 demo videos — hard blockers of TKT-50, PB4); TKT-08 (sanitised resume — hard blocker of production TKT-53 only, PB5; previews may ship the placeholder); Stage 8–10 approval + `QA-report.md` gate before TKT-53.
- **Entry criteria.** Every route built; every content ticket closed or explicitly parked; Tushar's domain name.
- **Exit criteria.** Every Critical EVAL passes and no High is unaddressed (evaluation-plan §6); production URL returns 200 on every route + `/resume.pdf` + `/sitemap.xml`; OG previews render on LinkedIn Post Inspector + opengraph.xyz; Vercel Analytics receiving; rollback path documented.
- **Definition of Done.** Base template. Additional: `[ ] Performance thresholds pass on all four Lighthouse routes, mobile + desktop` · `[ ] Required security checks pass (headers, pnpm audit, secret/PII grep on the deployed bundle)` · `[ ] Release provenance recorded (commit, build id, domain)`.
- **Target sequence.** Phase 7 (last).
- **Priority.** P0. **Status.** Planned.
- **Risks.** OG absolute URLs depend on the final domain — validate on preview, re-validate after production; Lighthouse on Vercel preview differs from local (use the deployed URL for the record run); resume PDF still unsanitised at production time (hard block on TKT-53 — the current PDF is never committed or published; the pre-deploy check in TKT-50 enforces it mechanically); RailCite auth blocking the TKT-23 recording would stall TKT-50 (escalate early, PB4).
- **Blockers.** Tushar: domain name; sanitised resume (TKT-08); Stage 8–10 sign-off.
- **Notes.** TKT-50 (preview) precedes TKT-51/52 so inspectors and the record eval run hit a real HTTPS deployment; TKT-53 is the only ticket that requires the post-review gate.
