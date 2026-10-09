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

## 13. M-010 · Paper-cut system, dark mode and delight features — solution addendum (2026-10-05, approved 2026-10-05)

Source: six specs from Tushar, 2026-10-05, saved verbatim in `docs/specs/m-010/` (`paper-cut-2.md`, `dark-mode.md`, `toggle.md`, `cursor.md`, `card-updated.md`, `gummy-bear.md`, plus `toggle-reference.png`, the toggle's visual acceptance target). Sequencing plan approved the same day: `~/.claude/plans/i-want-to-add-immutable-raccoon.md`. Campfire: milestone `m-9`, tickets TASK-139…146. Decisions S22–S30.

### 13.1 Goal
Move the site from gouache illustration + paper collage to one coherent **3D paper-cut / layered-paper diorama** system, in a light and a **dark** theme, and add three optional delights: a semantic paper cursor, a paper-cut digital business card, and a hidden physics game. Everything M-009 guarantees (content provenance, tests, evals, budgets, accessibility, static prerender) stays.

### 13.2 Approach (what changes, what stays)
| Layer | M-009 (production since 2026-10-05) | M-010 |
|---|---|---|
| Scene art | Gouache/pencil scenes + collage sprites (Higgsfield) | Paper-cut dioramas per tab, each in a light and a matched dark variant (S23) |
| Home hero | Locked gouache character + clip A (plays once, holds) | A **paper-cut still** of the character; clip A and `HeroClip` are retired; no hero animation (S24) |
| Theme | Single paper theme, no toggle (S19) | Light + dark, system preference first, saved choice wins, no flash; paper-cut toggle (S22, S25) |
| Chrome | Paper header, torn edges, terracotta band | Paper-cut nav, section dividers with gentle parallax (they replace the torn edges, not add to them), footer ocean + ship, global depth rules (S23, S28) |
| New surfaces | — | `/card` business card (no Apple Wallet, S27); desktop-only cursor + paper trail (S29); hidden `/lab` game behind a 5-click trigger (S30) |
| Content, data, evals | `data/*.ts`, zod gate, `pnpm eval` | Unchanged; art never carries evidence (S20 stands) |

### 13.3 Scope (one milestone, M-010, tracks per the plan)
T0 this addendum + theme contract (TASK-139) → T1 paper-cut style lock on the **hero scene** as the pilot (TASK-140; Tushar's style gate) → T2 theme system: dark mode + toggle (TASK-141) → T3 every tab's scene, light + dark together (TASK-144) → T4 nav, dividers + parallax, footer ocean, depth pass (TASK-145) → T5 `/card` (TASK-146). Side lanes: T2b cursor (TASK-142, after T1) and T2c gummy `/lab` (TASK-143, after T0).

### 13.4 Out of scope
Apple Wallet `.pkpass` (needs an Apple Developer account; the card keeps a slot for it) · any hero animation or clip · runtime Higgsfield calls (all art is generated at build time and committed) · new content, metrics or claims · CSS-filter "dark versions" of rich art (spec: dark art is generated, not inverted).

### 13.5 Success criteria (in addition to §8 and §12.6; thresholds are never lowered)
- Every tab's scene exists in light and dark, in one paper-cut language, judged side by side at the T1 and T3 gates; the hero still matches the character sheet's likeness in paper-cut form.
- Theme: no wrong-theme flash on a hard reload with a saved choice; first visit follows `prefers-color-scheme`; the toggle works by keyboard and screen reader; WCAG AA contrast in both themes (EVAL-006 runs in both).
- Budgets: EVAL-005 ≤ 180 kB gz first-load JS on `/` (cursor lazy and fine-pointer only; `/lab` never in the home bundle) · EVAL-018 decoration budget unchanged · CLS < 0.05 in both themes and across theme switches.
- Reduced motion: parallax, cursor trail, ocean and card flip all degrade to static.
- Mobile: no horizontal scroll at 375 and 768 in both themes; the cursor never mounts on touch.

### 13.6 Risks & mitigations
| Risk | Mitigation |
|---|---|
| Paper-cut loses the character's likeness | T1 pilots the hero first; nothing else is generated until Tushar approves the style |
| Dark variants drift from their light scene | Generate each pair in one pass with the light image as reference; side-by-side QA (paper-cut-2 §153) |
| Credit overrun (608 cr on 2026-10-05) | Per-track estimate shown before spending; at most 2 regenerations per asset without approval |
| Theme flash / hydration mismatch | Inline pre-paint script sets `data-theme`; tokens switch by attribute; covered by a Playwright test |
| One big release at the end | Every track merges to the branch and preview with its own full e2e; production diff is reviewed as one release (S26) |
| 8 GB Mac | One heavy local session at a time; gummy can run in a cloud session |

### 13.7 Dependencies on Tushar
Style gate at T1 · scene gate at T3 · the toggle reference (received) · final release approval (S26).

### 13.8 Delivery plan
Per §13.3. Every track: ticket → build on the branch → full e2e + gates → preview → Tushar's look. Production: one release after T5 (S26).

## 14. M-011 · "Tushar Paper World" — layered parallax paper system — solution addendum (2026-10-06, approved 2026-10-06 on Tushar's behalf, EXE-39)

Source: `docs/specs/m-011/paper-world.md` (Tushar, verbatim; cited by section `§NN`). Decisions S31–S34 (Tushar), EXE-39 … (Claude, delegated by S33). Campfire milestone `m-10`, kickoff TASK-151.

### 14.1 Discovery (Stage 1, compressed — the spec already did the problem work)
- **Problem (Tushar's words, S31):** the scenes are single flat paper-cut images; the Portfolio and Certifications scenes show blank frames. Underneath: M-010 gave the site a paper *look* but not a paper *world* — scenes, cards, buttons, cursor, divider ridges and the footer ocean each solve depth their own way (three motion systems: CSS scroll timelines for the banner, ridges and torn-lag; Lenis smoothing; pointer rAF only in `/card` and the cursor), and nothing moves with the visitor's pointer or phone.
- **Who it's for:** the same audiences as §3 (hiring managers, founders, peers). The bar: "beautiful at first glance, tactile at second, interactive at third" (§Final) without costing the content its speed or legibility.
- **Riskiest assumption:** that the art pipeline can produce *separable, transparent, coherent* layers per scene and theme. **Tested first, before any code** (pilot, §14.6) — result: yes, by isolating each layer with an image-to-image edit of one approved composite.
- **Success looks like:** every scene is a stack of 3–5 paper layers that separate under mouse, tilt and scroll; cards, buttons, icons, timeline, skills and the contact scene obey one material, light and depth system; no budget, contrast, motion or accessibility gate gets worse.

### 14.2 What changes vs. the current system
| Layer | Now (M-010, on preview) | M-011 |
|---|---|---|
| Scene art | One flat 3168×1344 WebP per scene per theme | 3–5 layer WebPs per scene per theme (bg opaque, the rest transparent), named per §32, composed by `PaperParallaxScene` |
| Portfolio / Certifications | Empty frames, blank sleeves | Origami miniatures on the shelf and wall (S32); real covers/badges stay in content |
| Depth | `--depth-0…5` (T4) on `--shadow-ink`, 4 consumers | Same scale, extended to the spec's 0–6 levels and PAPER-0…5 elevations with a parallax factor each (Design.md §14) — renamed in place, not duplicated |
| Motion | CSS scroll timelines (banner, ridges, torn-lag) + Lenis smoothing; no pointer parallax | **One motion source** (`paperMotion`): one pointer listener, one optional gyro listener, one spring rAF loop that sleeps at rest; scroll stays on CSS scroll timelines; Lenis unchanged |
| Cards / buttons / icons | Page-specific classes (`fw-card`, `cx-btn`, `hero-btn`…) | Shared paper card + button contract (sidewall, lift, press) applied to the existing classes; paper-cut icon set |
| About / Experience | Collage timeline, skills list | Notebook About (§21), paper-strip timeline (§22), skills as paper tags by group (§23) |
| Cursor | T2b Paper Trail (pointer + trail) | Cardboard cursor (§11) replaces the pointer glyph inside T2b's gate; trail kept, restyled (EXE-41) |
| Footer | T4 ocean: 3 infinite drifting tracks + ship | Contact scene: layered paper waves + fully visible origami sailboat; pauses off-screen; no filter animation (§24, §26, TASK-143 scar) |

### 14.3 Conflicts and how each is resolved (recorded as EXE decisions)
1. **Palette vs the 13 role tokens (EVAL-020, D13).** The 13 role tokens stay the only colours for text and UI states; their hexes don't change, so the 55 AA checks stand. The five §02 materials become a second tier of **surface-only material tokens** (`--mat-*`, light and dark), never used for text; any text that sits on a material surface gets its pair added to `tokens:check` in both themes. Dark materials are navy-family equivalents, never black (EXE-40).
2. **Cursor §11 vs T2b Paper Trail (EVAL-028).** Evolve, don't replace: keep T2b's mount gate (fine pointer, no reduced motion, after `load`, idle-imported, exclusion zones), swap the glyph for the cardboard cursor with §11 states and spring, restyle the trail as kraft/cream scraps lit from the upper left (EXE-41).
3. **Typography §16–17.** Keep Fraunces (editorial serif), Inter (neutral sans), Caveat (hand accent, never nav or body). All three are within the spec's intent; changing fonts would cost LCP/CLS for no gain (EXE-42).
4. **Annotations §18 vs DraftTag.** Two different things. DraftTag stays the only "pending Tushar's sign-off" signal (terracotta hairline, unchanged). Annotations are a new decorative `PaperLabel` (kraft tab, Inter caps, `aria-hidden` unless it carries meaning) with a closed vocabulary that **excludes the word "DRAFT"**: ITERATION 0n, SHIPPED, IN PROGRESS, FIELD NOTE, OBSERVATION, SYSTEM 0n; at most one per section (EXE-43).
5. **One motion system, not three.** Pointer and gyro go through `paperMotion` → CSS custom properties (`--pp-x`, `--pp-y`, unitless −1…1) on the scene; each layer's `translate` = factor × range. Scroll depth stays on CSS scroll-driven animations (already transform-only, off-main-thread) and composes on a wrapper element. The banner-level TKT-96 scroll parallax becomes per-layer factors; T4 ridges keep their CSS timelines; Lenis keeps smoothing only. No second rAF loop anywhere (EXE-44).
6. **Gyroscope §28.** iOS: `DeviceOrientationEvent.requestPermission()` only from a tap on a small "Move your phone to explore" paper chip; denied or unavailable → silent scroll-only fallback. Android/others: orientation listener attaches only while a scene is in view. Never on load, never blocks navigation. The "touch movement" fallback is **rejected**: dragging a scene would fight native scrolling (§30) (EXE-44).

### 14.4 Scope (milestone M-011, Campfire `m-10`)
Tracks (each a Campfire ticket with subtasks per §-list at kickoff): **P0** tokens + `PaperParallaxScene` + `paperMotion` · **P1** layered Home hero pilot + style gate · **P2** scenes rollout (Portfolio, Experience, About, Certifications, Contact, Thinking, Playground; light + dark; S32 miniatures) · **P3** paper cards, buttons, icons · **P4** About notebook, paper timeline, skills tags · **P5** cardboard cursor · **P6** contact scene (footer waves + sailboat) · **P7** integration gate (full gate, preview). P5/P6 and any global-CSS edit wait for TASK-143 and TASK-150 to commit.

### 14.5 Non-goals
WebGL/3D or canvas scenes · new copy, metrics or claims · changes to case-study media or real covers/badges · runtime image generation · scroll-jacking or scroll snapping · touch-drag parallax · new fonts · a production release (S34: one release with M-010, Tushar's go only).

### 14.6 Pilot result (riskiest assumption, run 2026-10-06 before any code)
Home hero, light: four image-to-image edits of the approved hero (bg plate; man alone with his body continued below the desk; desk + props + dog; foreground leaves + torn strip) recombine into one coherent scene; positions hold except the figure (≈ 10 % larger, corrected by a per-layer transform in the layer manifest). Transparency: Higgsfield `remove_background` (≈ 2.25 cr) is clean on grey-containing layers; a free local key works on a magenta backdrop for layers with no grey/pink. Every layer needs **bleed** (overscan ≥ the max shift) or edges show at ±25 px. Spend: 8.5 cr light. Evidence: `Portfolio-illustration/illustrations/paper-world/pilot-home/` (+ `layers.json`), contact strips in `/Volumes/E Drive/Dev/.scratch/m011/`.

### 14.7 Success criteria (in addition to §8, §12.6, §13.5; nothing lowered)
- Every scene ships as layers per theme, passes the §33 eight-question check at its style gate (EXE per track), and shows no gaps at ±max shift.
- Motion: transform-only; reduced motion = a still, composed frame (no listeners attached); gyro permission only after a tap; no scroll-jacking (native scroll position = Lenis target); the motion loop sleeps when settled, off-screen or in a hidden tab.
- Budgets: EVAL-005 ≤ 180 kB gz first-load JS on `/` (the primitive ≤ 3 kB gz, no animation library on the first-load path); CLS < 0.05; LCP ≤ 2.5 s on the Lighthouse routes with the layered hero; per-scene layer bytes within Design.md §14 budgets; non-hero layers lazy.
- Contrast: tokens:check stays green in both themes with any new material pairs added.
- Contact: the whole sailboat (mast and sails) is visible at 390/768/1024/1440 in both themes.

### 14.8 Risks & mitigations
| Risk | Mitigation |
|---|---|
| Layers drift from one another or the character's likeness | Isolate every layer from ONE approved composite per scene/theme; per-layer transform in a layer manifest; side-by-side gate at rest and at ±max |
| More image bytes per scene | Bleed-trimmed transparent WebP, mobile layers at ≤ 1280 px, only bg + subject eager on the LCP scene, the rest lazy |
| Main-thread cost / jank | One spring loop, sleeps at rest; CSS variables on the scene root only; no filters animated; IntersectionObserver gating |
| Credits (553 cr after pilot) | Rollout estimate shown in technical-plan §M-011 before spending; ≤ 2 regenerations per layer |
| Collisions with TASK-143 / TASK-150 | Docs + pilot first; global CSS, header and footer work starts only after both commit; own worktrees per track |

## 15. M-012 · Premium interaction system — solution addendum (2026-10-08, approved 2026-10-08, S35)

Source: Tushar's brief of 2026-10-07 (condensed in `.scratch/interaction-system/BRIEF.md`), the Opus audit and plan (`.scratch/interaction-system/PLAN.md`), decisions S35 (Tushar) and EXE-59…EXE-64 (Claude, delegated by EXE-26). Campfire TASK-181, subtasks TASK-181.1…181.4 (P1…P4). Full tier; Stage 1 is compressed into §15.1 because the brief and the audit already did the problem work.

### 15.1 Problem
M-009…M-011 gave the site a paper look, a paper world and one paper-button contract, but hover and focus feedback is uneven: project cards have no card-level hover at all (FeaturedWork lifts only its CTA); about 14 hovers still transition `box-shadow` or `filter` (the TASK-143 cost class); keyboard focus rarely gets the hover feedback (only `fw-cta`, `cert-*`, `certm-*`); most hovers are not gated to fine pointers, so lifts stick after a tap; and the three featured artworks are single flat images with nothing to separate. The goal is "a physical paper world responding to the visitor's presence", not "a site with lots of animations".

### 15.2 Scope and non-goals
- **In scope:** a three-level motion hierarchy applied to header nav and links, buttons and icons (P1); project cards, the Portfolio thumbs and case files, and one signature per featured project (P2); the hero, Tushky and the Contact CTA (P3); Experience, skills, Thinking, the Playground bench and the remaining shadow offenders (P4). Visual QA at 1440, 1280, 1024, 430 and 390 after P2 and P4.
- **Non-goals:** **no Rive**; **no new animation library** (CSS, CSS 3D, custom properties and the existing `paperMotion` only); **no generic scale hovers** (no `scale(1.05)`, none at all on hover); no magnetic buttons (EXE-63); no new scroll reveals (EXE-63); no new art generation (the featured signatures are code-drawn, 0 Higgsfield credits); no head/eye tracking for Tushky; no invented skill relationships (S35); no production deploy (S34, production stays frozen until Tushar's go).

### 15.3 Motion grammar
| Level | Used for | Duration | Travel | Easing |
|---|---|---|---|---|
| **L1 micro** | nav, text links, buttons, icons, chips | 150–250 ms | 1–4 px | tighter curve; buttons keep the §14.6 overshoot |
| **L2 object** | project cards, feature cards, paper objects | 300–700 ms | 4 px lift; layers 2/4/6 px; art tilt ≤ 2° | `cubic-bezier(0.22, 1, 0.36, 1)` |
| **L3 signature** | hero CTA reactions, Tushky, per-project signatures, Contact | 500–1200 ms (sparingly) | small, physical, finite | `cubic-bezier(0.22, 1, 0.36, 1)`, one small overshoot where it reads as physical |

Only `transform`/`translate`/`rotate`/`opacity` animate (colour for L1 text links). Never `box-shadow`, `filter`, `backdrop-filter`, blur or a layout property (TASK-143 scar; EXE-61). Text never moves with parallax; on hover a title may shift 2–4 px and an arrow 3–4 px (S35 C7).

### 15.4 Architecture
- **One source.** `paperMotion` (`lib/paper-world/motion.ts`) gets an object channel: `registerObject(el)`, a second target/spring pair for at most one active object, stepped in the same rAF loop, activated inside the same single `pointermove` listener. Writes `--hx/--hy` ∈ [−1, 1] on the active object only; sleeps when both channels rest. One passive `scroll` listener opens a 150 ms window in which nothing activates (EXE-60). Object activation is gated by IntersectionObserver; nothing attaches under reduced motion; coarse pointers get no `pointermove`.
- **React glue.** `components/paper-world/ObjectMotion.tsx`, a hidden marker like `SceneMotion`, registers its parent. Server components stay server components. `usePressInteraction` is CSS only.
- **CSS custom-property contract.** `[data-pm-obj]` carries `--hx/--hy` (default 0). `.pm-layer[data-pm-depth="bg|art|fg"]` translate by `--hx/--hy` × `--pm-r` (2/4/6 px); `[data-pm-tilt]` rotates the art container only. The lift is plain `:hover` / `:focus-visible` CSS, so it works with JS off and for keyboard users. `will-change` only under `[data-pm-active]`.
- **Tokens.** Motion tokens in `globals.css @theme`, mirrored in `lib/motion.ts` (EXE-3): `--ease-paper`, `--ease-l1`, `--ease-press`, `--dur-l1(-out)`, `--dur-l2(-out)`, `--dur-l3`, `--dur-press`.
- **Shadow crossfade.** L2 shadow is a pseudo-element's opacity (EXE-61).
- **Touch, reduced motion, keyboard.** One table, Design §14.10 (EXE-62).

### 15.5 Success criteria (in addition to §8, §12.6, §13.5, §14.7; nothing lowered)
- EVAL-032 stays at 1 listener, 1 loop, 0 idle rAF; EVAL-037 stays at hover −1 px / press +1 px for buttons and −4 px ± 1 for cards; EVAL-039 thresholds unchanged (0 frames > 200 ms, ≤ 8 > 50 ms).
- 0 hover rules that transition `box-shadow`, `filter`, `backdrop-filter` or a layout property; 0 hover scale-ups; every hover on a focusable element has a focus-visible twin; hover gated to `(hover: hover) and (pointer: fine)`.
- New infinite animations: 0. At most one active object at a time. First-load JS on `/` ≤ 180 kB gz (EV6); `paperMotion` plus scene component ≤ 3 kB gz.
- Reduced motion: no transform changes on hover/focus/press, non-motion feedback present. Touch: no pointer listener, no sticky hover, `:active` press present.

### 15.6 Phases and eval rows
| Phase | Ticket | Content | Evals |
|---|---|---|---|
| **P1** | TASK-181.1 | primitives (object channel, glue, CSS contract, tokens, crossfade, touch/RM/keyboard), L1 nav, links, buttons and icons, L1 shadow/filter offenders | EVAL-040 (spec lands here); unit tests for the object channel; EVAL-032/037 unchanged |
| **P2** | TASK-181.2 | FeaturedWork layered parallax, tilt, shadow crossfade, three signatures, Portfolio thumbs and case files (absorbs TASK-159 AC #1) | EVAL-041, EVAL-043 specs |
| **P3** | TASK-181.3 | hero CTA reactions, Tushky finite breathing and lean, Contact stamp | EVAL-019/035/039 re-run |
| **P4** | TASK-181.4 | Experience, skills, Thinking, Playground, cert/tk/hat/theme-toggle shadows | EVAL-042 spec |

Eval rows added: **EVAL-040** interaction-hierarchy-contract, **EVAL-041** object-motion-single-source, **EVAL-042** interaction-rm-touch-parity, **EVAL-043** project-signatures; wording-only amendments to **EVAL-037** (new family classes and `.paper-lift` in the probe set) and **EVAL-039** (a scripted hover sweep added to the input). Thresholds unchanged. Specs for EVAL-041/042/043 are deferred to the phase that builds their surface (`DEFERRED_SPECS`, `scripts/eval-cases.ts`).

### 15.7 Risks
| Risk | Mitigation |
|---|---|
| A second pointer listener or loop breaks EVAL-032 | Object channel lives in the same file and loop; unit tests assert one listener and one loop |
| Masked, filtered `.fw-card` plus 3D tilt (Safari paper-dropout scar, TASK-168) | Tilt on the art container only, own layer; P2 starts with a tracer card, measured under EVAL-039 throttling |
| Focus twins change focus visuals (EVAL-007) | The ring is untouched; twins add the same transform as hover |
| TASK-143-class main-thread cost | No filter/shadow animation, no infinite loops, `will-change` only while active, measure with `getAnimations()` |
| Host contention flakes the gate | Heavy-gate lock; full suite on a quiet machine; failures re-run alone (EXE-38/56/57) |
