# Solution PRD — Clay Portfolio (Tushar Pathak · Senior Product Manager)

Status: **approved by Tushar 2026-09-15** ("continue with next steps and stages") · Stage 2 of the build chain. Source brief: `~/Downloads/prompt.md` (50 sections). Companion artifacts in this folder: `decisions.md` (S1–S10), `SITEMAP.md`, `DESIGN_DIRECTION.md`, `COMPONENT_ARCHITECTURE.md`, `CONTENT_INVENTORY.md`, `AUDIT.md` (consolidated evidence base).

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
