# Campfire triage — stale m-0…m-7 tickets — 2026-09-26

Scope: every non-Done ticket in milestones m-0…m-7 (48 tickets), per Tushar's instruction to check relevance and move "no longer needed" tickets to Blocked with a note explaining why. M-009 tickets (TASK-64…108, milestone m-8/no milestone) were not touched.

## Table

| Ticket | Title | Category | New status | Evidence |
|---|---|---|---|---|
| TASK-50 | TKT-55 Design-system evolution: aurora/glow | Superseded | Blocked | S11 supersedes M-008; aurora/glow deleted (TKT-89, TKT-90a) |
| TASK-51 | TKT-56 Homepage hero: badge/glow-halo/stat row | Superseded | Blocked | S14 removes clay avatar hero; current hero has no glow halo/stat row |
| TASK-53 | TKT-58 Hero avatar animation system | Superseded | Blocked | S14 + TKT-89/TASK-68.3 delete AvatarScene/avatar files |
| TASK-54 | TKT-59 Homepage Featured Work: product-scene layout | Superseded | Blocked | Replaced by TKT-75/TASK-70 (Done) |
| TASK-55 | TKT-60 Homepage How I Think: interactive journey | Superseded | Blocked | Replaced by TKT-76/TASK-71 (Done) |
| TASK-56 | TKT-61 About redesign: editorial + timeline | Superseded | Blocked | Replaced by TKT-86/TASK-81 + TKT-87/TASK-82 (Done) |
| TASK-57 | TKT-62 Work page: editorial numbered layout | Superseded | Blocked | Delivered instead by TKT-80/TASK-75 (Done); EditorialGrid gone |
| TASK-58 | TKT-63 Case study: cinematic layout | Superseded | Blocked | Replaced by TKT-81/82/83 (Done) paper template |
| TASK-59 | TKT-64 Contact: simplified personal layout | Superseded | Blocked | Delivered instead by TKT-88/TASK-83 (Done) |
| TASK-60 | TKT-65 Scene illustration assets (Higgsfield) | Superseded | Blocked | Replaced by M-009 illustration set (S20, TKT-73/TASK-68.1) |
| TASK-61 | TKT-66 Thinking/Playground/404 restyle | Superseded | Blocked | Delivered instead by TKT-84/TASK-79 + TKT-88/TASK-83 (Done) |
| TASK-62 | TKT-67 Redesign QA (M-008) | Superseded | Blocked | Superseded by TKT-90/TASK-85 (Done) M-009 QA sweep |
| TASK-1.2 | TSK-02 Avatar asset pipeline | Obsolete | Blocked | No `public/avatar` dir; avatar system deleted (S14, TKT-89) |
| TASK-1.3 | TSK-03 Minimal clay primitives | Obsolete | Blocked | No `components/clay` dir; clay tokens/primitives removed (S11/S12, TKT-89/90a) |
| TASK-1.5 | TSK-05 Hero + AvatarStage + FloatingTiles | Obsolete | Blocked | AvatarStage/FloatingTiles files don't exist; hero motion system removed (TKT-73/TASK-68.3) |
| TASK-16.2 | TSK-14 EditorialGrid sizing | Obsolete | Blocked | EditorialGrid doesn't exist; replaced by numbered `<ol>` index (TKT-80) |
| TASK-45 | TKT-49 Performance pass (clay design) | Obsolete | Blocked | Target design deleted; perf now owned by M-009's TKT-92/TASK-88 (out of scope) |
| TASK-1.1 | TSK-01 Scaffold + token file | Done, unclosed | Blocked | Files exist (globals.css, tokens-check.ts, lib/site.ts); parent TKT-01 Done |
| TASK-1.4 | TSK-04 Header + NavPill + MobileMenu | Done, unclosed | Blocked | Header.tsx exists, rebuilt via TKT-71 (Done) |
| TASK-1.6 | TSK-06 ProjectCard + stub /work/teachspark | Done, unclosed | Blocked | ProjectCard.tsx exists; teachspark full case study built (TKT-28) |
| TASK-1.7 | TSK-07 Screenshots + baseline-v1.json | Done, unclosed | Blocked | evals/results/baseline-v1.json exists (still the EV6 baseline) |
| TASK-7.1 | TSK-08 Vitest layer + eval-cases.json | Done, unclosed | Blocked | evals/eval-cases.json exists; parent TKT-07 Done |
| TASK-7.2 | TSK-09 Playwright project | Done, unclosed | Blocked | playwright.config.ts + fixtures exist |
| TASK-7.3 | TSK-10 Dead-control crawler (EVAL-011) | Done, unclosed | Blocked | tests/e2e/crawler.ts + eval-011-dead-controls.spec.ts exist |
| TASK-7.4 | TSK-11 Lighthouse CI + bundle budget | Done, unclosed | Blocked | lighthouserc.*.json + scripts/bundle-budget.ts exist |
| TASK-7.5 | TSK-12 pnpm eval orchestrator | Done, unclosed | Blocked | scripts/eval.ts exists |
| TASK-16.1 | TSK-13 FilterTabs | Done, unclosed | Blocked | components/projects/FilterTabs.tsx exists |
| TASK-16.3 | TSK-15 WorkHero + page assembly | Done, unclosed | Blocked | components/projects/WorkHero.tsx exists |
| TASK-19.1 | TSK-16 CaseStudyHeader + MetricCard-inline | Done, unclosed | Blocked | CaseStudyHeader/OG delivered; inline metric superseded by MetricStrip per code comment in MetricCard.tsx (TKT-97/TKT-81) |
| TASK-19.2 | TSK-17 OverviewToggle + Chapter + ChapterNav | Done, unclosed | Blocked | All three components exist |
| TASK-19.3 | TSK-18 NextProject + ProgressBar | Done, unclosed | Blocked | Both components exist, with tests |
| TASK-20.1 | TSK-19 InsightCard/HypothesisCard/MetricCard | Done, unclosed | Blocked | All exist in components/case-study/artifacts |
| TASK-20.2 | TSK-20 DecisionCard/EvaluationCard/ExperimentCard | Done, unclosed | Blocked | All exist |
| TASK-20.3 | TSK-21 PrototypeFrame/ArtifactCard + /dev/artifacts | Done, unclosed | Blocked | All exist, incl. app/dev/artifacts/fixtures.ts |
| TASK-34.1 | TSK-25 Token Toli page | Done, unclosed | Blocked | Project record in data/projects.ts, renders via shared template; parent TKT-54 Done |
| TASK-34.2 | TSK-26 Pratyasa page | Done, unclosed | Blocked | Same as above |
| TASK-34.3 | TSK-27 Tegaki page | Done, unclosed | Blocked | Same as above |
| TASK-34.4 | TSK-28 dino-arcade-pwa page | Done, unclosed | Blocked | Same as above |
| TASK-34.5 | TSK-29 cinematic-portfolio page | Done, unclosed | Blocked | Same as above |
| TASK-3 | TKT-03 Content schema + zod gate | Done, unclosed | Blocked | data/schema.ts, scripts/validate-content.ts, fixture, content-gate-proof.txt, prebuild wiring, forbidden-string test all exist |
| TASK-8 | TKT-08 Sanitised resume PDF + PII gate | Still relevant | Blocked (already) | No public/resume.pdf; resumeAvailable: false — needs Tushar |
| TASK-46 | TKT-50 Vercel project/deploy | Still relevant | Blocked (already) | No .vercel project; depends on media tickets — needs Tushar |
| TASK-49 | TKT-53 Production deployment | Still relevant | Blocked (moved) | No live prod deploy; blocked on TASK-8/46 — needs Tushar |
| TASK-22 | TKT-22 TeachSpark media | Still relevant | To Do | No content/media/teachspark; needs live recording |
| TASK-23 | TKT-23 RailCite media | Still relevant | To Do | No content/media/railcite; only mascot exists |
| TASK-24 | TKT-24 Nuptis + Velora media | Still relevant | To Do | No media captured; sign-in flows |
| TASK-25 | TKT-25 Bhakti-Vilas media | Still relevant | To Do | No media captured; fake-OTP flow needs confirmation |
| TASK-26 | TKT-26 Pratyasa/Tegaki/dino/cinematic media | Still relevant | To Do | Media dirs only hold SOURCES.md placeholders, no files |

## Counts

- Superseded (M-008 → M-009): 12
- Obsolete (thing built no longer exists): 5
- Done in substance but never closed: 23
- Still relevant: 8

## Still relevant, needs work

- **TASK-8** (résumé PDF + PII gate) — dependency: Tushar (sanitised PDF)
- **TASK-46** (Vercel project/preview deploy) — dependency: Tushar (release call) + real media
- **TASK-49** (production deployment) — dependency: Tushar (release call), blocked on TASK-8/46
- **TASK-22…26** (product media: TeachSpark, RailCite, Nuptis+Velora, Bhakti-Vilas, Pratyasa/Tegaki/dino-arcade/cinematic-portfolio) — dependency: Tushar (live access / sign-in approval) or an agent recording session against the live URLs
