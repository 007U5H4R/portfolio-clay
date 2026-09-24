# Solution PRD — Clay Portfolio (Tushar Pathak · Senior Product Manager)

Status: **approved by Tushar 2026-09-15** ("continue with next steps and stages") · Stage 2 of the build chain. Source brief: `~/Downloads/prompt.md` (50 sections). Companion artifacts in this folder: `decisions.md` (S1–S10), `SITEMAP.md`, `DESIGN_DIRECTION.md`, `COMPONENT_ARCHITECTURE.md`, `CONTENT_INVENTORY.md`, `AUDIT.md` (consolidated evidence base).

**§12 (M-009 · Illustrated editorial redesign) added 2026-09-24 — APPROVED by Tushar 2026-09-24 ("go ahead"; open items S16/S21/S17 resolved by their stated defaults).** §1–§11 remain the product definition; §12 replaces only the presentation layer (it supersedes `DESIGN_DIRECTION.md` and the M-008 direction).

## 1. Problem
Tushar's public footprint says three different things ("AI Product Manager" on the old one-pager, "Enterprise Product Leader – GenAI & Cloud" on the resume and live cinematic site) and none of it shows the *work*: eleven real builds — two of them live AI products with real corpora and real pilot funnels — sit in private repos and local PRDs where no recruiter or product leader can see them. The live cinematic site is a striking film, not a case-study portfolio.

## 2. Goal
A multi-route portfolio that makes a recruiter conclude in 30 seconds and a product leader in 3–5 minutes: *Senior PM who identifies real problems, makes explicit bets, ships AI-native products, measures them, and learns out loud.* Personal builds dominate; corporate experience proves level and scale.

## 3. Audiences & their jobs
| Audience | Time | Must be able to… |
|---|---|---|
| Recruiter / hiring manager | 30 s | See name, level, that he builds AI products, 3 proof projects, download resume, contact |
| Senior product leader | 3–5 min | Read how he finds problems, makes bets, prioritises, evaluates, works with AI, and what he learned when assumptions failed |
| Peer / engineer | 2 min | Verify technical depth (architectures, evals, live apps), find code when public |

## 4. Solution (approved decisions — details in `decisions.md`)
- **S1** Separate site, new Vercel domain; the cinematic site and old one-pager stay live and untouched.
- **S2** Next.js 16 · TypeScript · Tailwind 4 · `motion` 13 · lucide · pnpm · static generation · new repo `Portfolio-clay/`.
- **S3** Home = executive summary with **3 featured** (TeachSpark, RailCite, Nuptis→Velora; Cubicle swaps in only if deployed). `/work` = **all 11 personal builds** + clearly separated professional experience, each with live URL, status badge, demo video.
- **S4** Clay avatar generated from `photo.jpg` (identity-referenced), candidates approved by Tushar, spend approved first.
- **S5** GitHub links data-wired, rendered only when a repo is public.
- **S6** Demo videos screen-recorded from the live apps (Cubicle needs a local run); missing videos show an honest "demo coming" state.
- **S7** Ask-my-portfolio is deterministic behind an `AnswerProvider` adapter; UI says answers come from portfolio content; RAG is a later drop-in. No fake AI.
- **S8** Positioning: "Senior Product Manager · Product Thinker · AI Builder · Problem Solver".
- **S9 (proposed)** Dark mode / theme toggle deferred to v1.1. **S10 (proposed)** Contact = copy-email + mailto + LinkedIn + resume; no form backend.

## 5. Scope — v1 (everything below ships together)
**Routes:** `/`, `/work`, `/work/[slug]` ×11, `/about`, `/thinking` (+ `/thinking/[slug]`), `/playground`, `/contact`, 404. Full map in `SITEMAP.md`.

**Home (exactly, per brief §38):** compacting header · hero (35/65, avatar in clay frame, eyebrow, headline with "AI-native products" highlighted, supporting line, View My Work → / Download Resume ↓, three floating tiles with cursor parallax) · Ask my portfolio (large rounded field, 5 suggested prompts, expands in place into an answer panel with evidence links) · Featured Work (3 wide clay cards: icon, name, one sentence, ≤3 tags, arrow) · How I Think (6 clay stages; hover → principle, click → real example + link) · Final CTA + minimal footer.

**Work:** hero copy from brief §16 · animated filter tabs (All · AI · Enterprise · Cloud · Experiments) · editorial grid (1 large, 2 medium, rest small — never 9 identical rectangles) · Personal Projects vs Professional Experience visibly distinct; corporate items never imply a public product.

**Case study (each of 11):** header (name, one-line problem, role, duration, status, hero media, *verified* metrics with context + date) · 30-second overview default, Deep dive on demand · chapters 01 Context → 08 What I Learned built from typed artifacts (Insight / Hypothesis / Metric / Decision / Evaluation / Experiment / Prototype) · **Show the thinking** (8-node sequential reveal, user-triggered) · shared-element transition from the card (View Transitions, reduced-motion safe). Depth scales with evidence: TeachSpark, RailCite, Velora/Nuptis, Cubicle get full chapters; discovery-only and playground items get shorter, honest pages.

**About:** headline per brief §21 · avatar · Product Journey (physical → cloud & data → AI-enabled → AI-native) · 4 capability clusters · Impact numbers with context (resume-verified only) · interactive experience timeline (Godrej → Quantiphi → Shellkode → AmEx; hover expands, click opens Context / Role / Scale / What changed / Outcomes) · Awards · Research (patent + 2 papers) · Education. No DOB, phone, address.

**Thinking:** editorial numbered list, large type, minimal chrome. Essays exist only as DRAFT entries backed by real lesson-learnt/PRD passages until Tushar signs them off — placeholders are labelled, never faked.

**Playground:** "Small experiments. Big questions." — Pratyasa, Tegaki, dino-arcade PWA, the cinematic portfolio; stronger clay allowed here.

**Cross-cutting:** content from typed data (`data/*.ts`, zod-validated: unsourced claims fail the build) · Ask AI right-side panel (400–480 px, page visible) · OG/Twitter cards with purpose-built 1200×630 images per page family · sitemap/robots · four screen states on every data-backed view · WCAG AA, keyboard complete, visible focus, reduced motion · Lighthouse ≥ 90/95/95/95 · verified at 390/768/1024/1440.

## 6. Out of scope (v1)
Real LLM/RAG backend · CMS/MDX authoring · blog engine or RSS · dark theme + toggle (S9) · contact form backend (S10) · analytics beyond Vercel basic · i18n · testimonials, logos, certifications (PMP/SAFe unverified) · case-study pages for corporate work (they expand inline on `/work` and live on `/about`) · any change to the cinematic site or `portfolio/index.html`.

## 7. Content & truth rules (non-negotiable)
Every fact, number, quote and technology traces to a source in `CONTENT_INVENTORY.md` (resume, repo docs, live URL). Numbers carry context and an as-of date; structural guarantees are labelled structural (RailCite citation validity), self-reported ones self-reported (TeachSpark time saved). Where evidence is missing the site shows a labelled placeholder or omits — never an invention. Excluded: PII, PMP/SAFe claims, TeachSpark sandbox join code, `.env` values, ROM files.

## 8. Success criteria (how we'll know)
1. **5-second test** on the rendered home (390 & 1440): name, Senior PM, builds AI products, cares about user problems, actually builds, projects to explore — all legible in the first viewport.
2. **Recruiter path** (Playwright): home → work → case study → about → resume download → contact in ≤ 6 clicks, every link live, resume 200.
3. **Product-leader questions** (brief §43) each answered by at least one case-study artifact — checked against a traceability table in `test-cases.md`.
4. Lighthouse ≥ 90 / 95 / 95 / 95 mobile + desktop on `/`, `/work`, `/work/teachspark`, `/about`; axe 0 critical/serious; no horizontal scroll at 390/768/1024/1440.
5. Zero dead buttons (brief §47) — automated crawl of every visible interactive element.
6. Every Ask suggested prompt returns an answer with ≥ 2 evidence links; unknown queries return the honest empty state.
7. Build fails on any unsourced metric — verified by a deliberate failing fixture.
8. Visual QA screenshots (per brief §46) reviewed at four widths for each major page: not cluttered, whitespace ≥ 50 %, typography dominant, avatar recognisably Tushar, reads "Senior PM" not "student".
9. Link previews validated on LinkedIn Post Inspector + opengraph.xyz.

## 9. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Clay tips into "toy" | Clay tiers + flat text zones (DESIGN_DIRECTION §5), one accent colour per section, Stage 8 design critique against the running site |
| Avatar doesn't resemble Tushar | Identity-referenced generation, 3–4 candidates, Tushar picks; hard "resembles me" gate before use |
| Thin evidence for some projects | Depth scales with evidence; placeholders labelled; discovery-only items framed as discovery |
| View Transitions unsupported (Safari/Firefox variance) | Progressive: plain navigation fallback; no layout depends on it |
| Video weight hurts Lighthouse | `preload="none"`, posters, ≤ 4 MB, lazy mount on intent |
| Repos stay private | UI hides code links; live demos remain the proof |
| Three conflicting titles | S8 on site; resume PDF update flagged to Tushar |

## 10. Dependencies on Tushar
Approve this PRD · approve avatar candidates (and credit spend) · pick canonical TeachSpark metric snapshot (08-24 Final PRD recommended) · decide whether Cubicle ships by 09-16 · choose the new domain name · flip repo visibility when ready · update resume PDF title (or accept mismatch) · sign off DRAFT essays.

## 11. Delivery plan (global build chain, compressed where the brief already did the work)
1. **Stage 2 — this PRD** → your approval.
2. **Stage 3 — `evaluation-plan.md`** (light: functional, product-acceptance, performance, accessibility, design; no AI evals — Ask is deterministic).
3. **Stage 4 — `Design.md`** via t-design from `DESIGN_DIRECTION.md` + Mobbin references; **avatar generation** happens here.
4. **Stage 5 — `tickets.md` + `milestones.md`** via /to-tickets. **Ticket 1 is the brief's tracer bullet:** header · hero · avatar · CTAs · one project card · one interaction (card → case-study transition), rendered, screenshotted at 4 widths, visual direction fixed before anything else is built.
5. **Stage 6 — `technical-plan.md`, `test-cases.md`**, Campfire PWA onboarding.
6. **Stage 7 — Execution** in a worktree, one subagent per task, QA gate per phase, video recording and content data entry as tickets.
7. **Stages 8–10** design critique → code review + test execution → security review → `QA-report.md`.
8. **Stage 11** Vercel deploy on the new domain, production checks, `lesson-learnt.md`.

---

## 12. M-009 · Illustrated editorial redesign — solution addendum (2026-09-24, approved 2026-09-24)

Source: Tushar's master prompt "Illustrated Editorial Portfolio Redesign" (pasted 2026-09-23; the paste truncated after the home-hero Note 1 — the page-by-page specs were reconstructed as HTML mockups instead) + the approved mockups in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/` (copied into `docs/redesign-mockups/m-009/` at Stage 4). Problem statement: `Discovery-PRD.md` §9. Decisions: `decisions.md` S11–S21.

### 12.1 Goal
Same product, new skin: a **warm editorial illustration + paper collage + hand-drawn annotation** identity. Principle *"A more human approach to an AI-driven world"*; narrative *"Same curiosity. Bigger problems."* Feel: human, thoughtful, tactile, premium, editorial, credible, product-led. Not: corporate SaaS, childish, scrapbook-chaotic, Pinterest collage, clay UI, dashboard grids, cards everywhere. Every §8 success criterion still applies unchanged; §12.6 adds the redesign-specific ones.

### 12.2 Approach (what is replaced, what is kept)
| Layer | Today (main + M-008) | M-009 |
|---|---|---|
| Colour tokens | 13 clay tokens (`bg…butter`), `tokens:check` 13/13 | **13 paper tokens** swapped 1:1 — paper `#F7F1E7` · ivory `#FBF7EF` · paper-2 `#EFE7D8` · navy `#0D1735` · navy-2 `#2E3854` · ink-soft `#5A6178` · rust `#B64927` · terracotta `#92381F` · forest `#214F43` · green-2 `#496D58` · steel `#63799E` · note `#EEDCA9` · kraft `#D7BE93`; gate stays 13/13 (S12) |
| Type | Manrope + Caveat | **Fraunces** (display, variable, `opsz`+`SOFT` axes) + **Inter** (body/UI) + **Caveat** (handwritten only) via `next/font/google`, self-hosted (S13) |
| Material | Clay tiers D1 (`components/clay/*`), aurora mesh, glow halo | **Paper primitives** — torn section edges, tape, sticky note, notebook sheet, postcard, sketch/SVG draw-in, grain overlay; aurora/glow/clay removed, not restyled (S11, S15) |
| Hero | Claymorphic bust + parallax + 7 pose crossfades | **Illustrated desk scene** (locked character sheet Variant B) + the **2.5 s clip-A animation** (thinks, turns the pen; plays once on arrival, holds last frame; poster = LCP image; reduced-motion / touch / save-data → poster only) (S14) |
| Footer + Final CTA | Minimal footer "Built with curiosity." + home Final-CTA section | **Terracotta band footer** on every page (torn top, headline "Let's *build* something people can use.", hiring line, email, LinkedIn / GitHub / résumé, © bar); home Final-CTA removed (S16) |
| Header | Compacting glass header, accent pill | Paper header: monogram + wordmark + subline, serif nav with ink-stroke active state, navy pill "Let's connect →" → `/contact`, mobile menu; skip link and `lib/nav.ts` unchanged |
| Motion | `motion/react` springs, parallax, reveals | Reveals + small SVG draw-ins only; `motion` stays a dependency but the hero motion system (`heroMotion.ts`, `usePointerParallax`, `AvatarScene`, `HeroActivationContext`) is deleted |
| Ask my portfolio | Inline `AskPortfolio` + global `AskPanel` drawer | Kept, deterministic (S7), restyled as the notebook "ask" section; `AskPanel` kept behind a restyled trigger unless Tushar drops it (S21, open) |
| Data, schema, evals, tests, SEO, headers | — | **Unchanged.** `data/*.ts`, zod gate, `pnpm eval`, Playwright/Vitest suites, TP9 headers, sitemap/robots all carry forward; tests are updated only where selectors/copy change |

### 12.3 Scope (ships as one milestone, M-009, in phases — §12.9)
**Pages, each against its mockup (verbatim copy from `data/*.ts` via `mockups/content-brief.md`; handwritten annotations are the only authored text and never carry facts):**
- `/` — hero (scene + animation, eyebrow, headline, two CTAs), Featured Work (three taped project cards), How I Think (journey path with dashed connector, six stages), Ask (notebook), band footer.
- `/work` — pinboard scene, filters preserved (URL-synced, static prerender), numbered editorial list, professional experience visibly separated (postcards), band footer.
- `/work/[slug]` — paper header (name, problem line, role/duration/status, verified metrics, hero media as an honest paper note where no media exists), 30-second overview notebook + deep-dive toggle, chapters 01–08 with typed artifacts, Show the thinking, What I learned (renders `learnings[]`, S18), Sources. Template must degrade honestly for the thin projects (short page, "Deep dive coming" note, no invented content).
- `/about` — mountains-horizon scene, editorial opening, Product Journey, capability clusters, Impact (two credibility tiers, DC2), ExperienceTimeline (interaction model and `#experience-<id>` anchors preserved; lead copy fixed, S18), Awards / Research / Education.
- `/thinking` + `/thinking/[slug]` — writing-at-window scene, numbered essay list, essay page; DRAFT tag rendered once (S18).
- `/playground` — workbench scene, four experiment tiles (live links, `rel="noopener"`).
- `/contact` — wave-with-coffee scene, one primary CTA (copy email) with mailto / LinkedIn / résumé secondary; `#resume` anchor and `resumeAction()` single source preserved; no new PII.
- 404 — restyled to the paper system with an existing sketch asset; no new illustration spend (proposed default).
**Cross-cutting:** OG/Twitter images regenerated in the paper style per page family (1200×630, absolute HTTPS) · four screen states on every data-backed view · WCAG AA, keyboard complete, visible focus, reduced motion · verified at 390/768/1024/1440 · illustrations stored with provenance and treated as decorative (S20) · a Playwright decoration-budget check (S15).

### 12.4 Out of scope
Dark mode (paper is a single theme — S9 stands, S19) · new content, metrics or essays · RAG / real AI · a contact form · changes to the cinematic site or `portfolio/index.html` · new Higgsfield spend beyond what is already generated (character sheet, 6 scenes, hero clip) unless Tushar approves a specific item (dog-ear layer, 1080p upscale, 404 sketch) · production go-live inputs (videos, sanitised résumé, domain — still Tushar's hard-stops from M-007) · merging M-008 on its own (S11).

### 12.5 Content & truth rules — additions
§7 stands. Plus: (a) illustrations are decorative — alt text names them as illustrations, none depicts a metric, logo, product UI or claim; (b) every generated asset carries provenance (model, references, date, credits) in `content/media/illustrations/README.md`; (c) handwritten annotations are `aria-hidden` and never carry unique information (DESIGN_DIRECTION §7 rule kept); (d) the five extraction findings are handled explicitly, not silently (S18): double DRAFT prefix and the timeline lead wording are bugs fixed in-milestone; `hero.tagline` and `learnings[]` are rendered where the mockups place them; hero media stays an honest placeholder.

### 12.6 Success criteria (in addition to §8; EV2 thresholds are never lowered)
1. Every §8 criterion and every EVAL-001…017 threshold holds on the redesigned site; **EVAL-005 home first-load JS returns to ≤ 180 kB gz** (closing the provisional EXE-11 acceptance at 191 kB) — the hero motion system removal is expected to pay for the fonts.
2. `pnpm tokens:check` = 13/13 on the new palette; zero `--color-*` outside the 13; no hex literal in components.
3. Hero: video plays once and holds its last frame (no `loop`), poster is the LCP element, LCP ≤ 2.5 s mobile on the Vercel preview; `prefers-reduced-motion` renders the poster only (extends EVAL-010).
4. Decoration budget: ≤ 4 paper objects / handwritten notes per viewport section; Caveat never used for body copy — checked by Playwright (new EVAL row, Stage 3).
5. Mockup fidelity: each route reviewed side-by-side with its mockup at 1440 and 390 (Stage 8) — layout, copy and hierarchy match; deviations recorded in `Design.md` Deviations.
6. EVAL-009 premium rubric re-scored ≥ 10/12 with the item "avatar resembles Tushar" replaced by "character matches the locked sheet, no style drift" (EV2 wording updated at Stage 3).
7. Tushar approves the home hero on the Vercel preview (tracer gate) before the remaining pages are built.

### 12.7 Risks & mitigations
| Risk | Mitigation |
|---|---|
| Three font families + illustration + video sink Lighthouse / LCP | Tracer bullet measures it first (§12.9 Phase 0); `next/font` subsetting, AVIF via `next/image`, poster-first video with `preload="metadata"`, WebM 176 kB / MP4 312 kB already measured |
| Paper reads "scrapbook" or "children's book" | Decoration budget (S15), Caveat-only-for-annotations, flat text zones, Stage-8 critique against the mockups |
| Fraunces variable axes unsupported by `next/font` config | Verified in the tracer; fallback = static Fraunces weights with `font-variation-settings` dropped |
| Case-study template looks empty on the eight thin projects | Mockup already designs the honest placeholder; Playwright sweep over all 11 slugs at 390/1440 |
| Truncated master prompt hides a spec we never saw | Mockups are the reference of record (S17); Tushar can still supply the remainder and it becomes change requests, not rework |
| Removing the M-008 avatar/motion code breaks tests | Tests updated with the components; `pnpm eval` on every phase gate |
| Generated-image provenance / style drift across scenes | Locked character sheet used as reference for every scene; provenance README; no new spend without approval |

### 12.8 Dependencies on Tushar
Approve §12 · confirm the footer credit line (S16: keep TP10 "Built with curiosity." or adopt the mockup's "Built with curiosity, chai & Claude Code.") · confirm the hiring line copy (DRAFT) · keep or drop the global `AskPanel` (S21) · confirm the eight mockups are accepted as-is (S17) or give per-page notes · optional: the rest of the master prompt · production hard-stops unchanged (videos, résumé, domain).

### 12.9 Delivery plan (M-009)
1. **Stage 3** — `evaluation-plan.md` addendum: new rows (decoration budget, video once-and-hold, poster on reduced motion, token gate on the new palette), EV2 wording for the character gate, EVAL-005 target restored.
2. **Stage 4** — `Design.md` rewritten for the paper system from the mockup CSS (tokens, type scale, paper primitives, header/footer, per-page layouts, motion, states); mockups copied into `docs/redesign-mockups/m-009/`; `web-deliverables.md` gates addressed.
3. **Stage 5** — `milestones.md` M-009 + `tickets.md` (foundation · home · work + case study · about/thinking/playground/contact/404 · QA + cleanup).
4. **Stage 6** — `technical-plan.md`, `test-cases.md`, Campfire milestone + tickets.
5. **Stage 7** — Phase 0 tracer: tokens + fonts + header + band footer + hero (scene, video, poster) on `/`, Lighthouse measured, **Tushar's visual gate on the Vercel preview**; Phase A home complete + OG; Phase B work + case-study template (all 11 slugs) + thinking/essay; Phase C about, playground, contact, 404; Phase D redesign QA, dead-code removal (clay primitives, aurora, avatar system), `Design.md` deviations, PWA sync.
6. **Stages 8–10** critique against the mockups → review + eval run → security → `QA-report.md` addendum. **Stage 11** merge `m-009-redesign → main`; production remains gated on Tushar's inputs.
