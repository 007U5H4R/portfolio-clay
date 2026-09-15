# CONTENT_INVENTORY.md — Tushar Pathak PM Portfolio

Maps every piece of site content → verified source → page → component. Compiled 2026-09-15 from the local-project audit and the resume. **Rule:** nothing appears on the site that is not in this file with a source; anything needed-but-unsourced is a `MISSING — …` row (a visible placeholder, never a fabrication).

Consumed by: `Solution-PRD.md` (content requirements), the ticketing stage (one ticket per MISSING cluster + per page), and the Ask-AI `KnowledgeIndex`.

## Source-of-truth summary (10 lines)

1. **Primary sources:** `AUDIT` (424-line verified audit, 2026-09-15) and `RESUME` (`portfolio/resume.pdf`). Secondary: the specific repo/PRD files the audit cites (paths below); nothing beyond those was explored.
2. **Verified and rich:** TeachSpark (full loop: discovery → shipped AI product → pilot numbers → mentor feedback → iteration), RailCite (live RAG, cite-or-refuse enforced in code, corpus numbers live), Nuptis→Velora (two live products, documented kill decision, screenshots).
3. **Verified but thin:** Cubicle (rigorous docs, 326 tests, **never deployed, no screenshots, Tushar's named role unrecorded**), Bhakti-Vilas (live prototype, no UI screenshots), Token Toli (research PRDs only, no product), Tegaki/Pratyasa/dino/cinematic (live, small, no metrics).
4. **Professional Experience (AmEx MARS, Quantiphi, Shellkode, Godrej Smartnet)** is sourced **only from the resume**; all its metrics are self-reported, undated inside the role, and have no supporting artifact. Never imply a public URL exists.
5. **Canonical-date decision #1 — TeachSpark pilot numbers:** Final-PRD snapshot **2026-08-24** (test handsets excluded: 72→17 sign-ups 23.6%, 12 onboarded, 8 activated 47%, 5 papers, median 37.5 min saved, 3 referrals) **vs** pitch snapshot **2026-08-26** (18 on WhatsApp, 9 activated 50%, 30 min median, 2 papers). Recommend the 08-24 Final-PRD snapshot (documented methodology) and state the date on every metric.
6. **Canonical-date decision #2 — RailCite corpus:** Final-PRD 7 Sep 2026 (5,687 ingested / 14,078 chunks / 3,865 OCR 68% / 193 lineage links) **vs** live `/api/stats` 2026-09-15 (5,760 docs / 14,406 chunks). Recommend "live, as of <date>" with a fetch-time footnote; decks still say 148 tests / 5,687 docs (stale).
7. **Structural vs measured:** RailCite "100% citation validity" is **enforced by `lib/validate.ts`**, not measured over N queries — always label "by construction". Nuptis/Velora Trust Scores are authored, not verified. Cubicle's core loop is "verified by construction + fixtures, not against reality".
8. **Fact conflict to fix:** `RESUME` prints "Patent No. 044152784"; the certificate (via `PT/discoveryPRD.md` FACT-LOCK) shows **Patent No. 429867**, Application 202241053140, **SL No. 044152784**. Site uses IN 429867; resume PDF needs correcting before it is linked.
9. **Excluded by rule:** DOB, phone numbers, address (all present in `RESUME` — strip before publishing); PMP/SAFe-Agilist certification claims (not in resume; "SAFe" appears only as a methodology skill); TeachSpark sandbox join code (`TS/docs/pilot/pitch.md:15`); all `.env*` values; anything under `Game/neogeo/`.
10. **Authorship phrasing:** where a doc says "with Claude" / "Scribe: Claude" / superpowers artifacts exist (Pratyasa, cinematic, Tegaki, Cubicle, RailCite, TeachSpark, CS1/CS2 syntheses), the site says **"built with Claude Code"**. TeachSpark/RailCite additionally *use* Claude as the product model — a different, separately stated fact.

### Path legend (all absolute)

| Key | Path |
|---|---|
| `AUDIT` | `/Volumes/E Drive/Dev/.scratch/portfolio-clay/audit-local-projects.md` |
| `RESUME` | `/Volumes/E Drive/Dev/Code/Claude/portfolio/resume.pdf` |
| `PORT` | `/Volumes/E Drive/Dev/Code/Claude/portfolio/CLAUDE.md` |
| `CS1` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 1/` |
| `CS2` | `/Volumes/E Drive/Dev/Code/Claude/case study 2/` |
| `CS3` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 3/` |
| `CS4` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 4/` |
| `TS` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 4/teachspark/` |
| `CS5` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 5/` |
| `RC` | `/Volumes/E Drive/Dev/railcite-cron/` (canonical newer RailCite checkout) |
| `CS6` | `/Volumes/E Drive/Dev/Code/Claude/Case Study 6/` |
| `GR` | `/Volumes/E Drive/Dev/Code/Claude/Graphology/` (Tegaki) |
| `PT` | `/Volumes/E Drive/Dev/Code/Claude/Patent/` (Pratyasa) |
| `DN` | `/Volumes/E Drive/Dev/Code/Claude/dino-arcade-pwa/` |
| `CN` | `/Volumes/E Drive/Dev/Code/Claude/portfolio/cinematic/` |
| `DL` | `/Users/tushar/Downloads/Documents/` |
| `MEM` | `/Users/tushar/.claude/projects/-Volumes-E-Drive-Dev-Code-Claude-portfolio/memory/cinematic-portfolio-build.md` |

Status vocabulary: **VERIFIED** (quoted/derived from a cited artifact) · **DRAFT** (copy composed only from VERIFIED facts; needs Tushar's sign-off) · **MISSING** (no source exists; placeholder).

---

## 1. `/` Home

### 1.1 `Header`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Wordmark "Tushar Pathak" | `RESUME` p.1 name; `PORT` "Name: Tushar Pathak" | `Header` | VERIFIED |
| Nav: Work · About · Thinking · Playground · Contact | Site IA (this file §2–§7) | `Header` | DRAFT |
| "Download Resume" (PDF) | `RESUME` — **must be re-exported without DOB/phone/address and with Patent No. corrected to 429867** | `Header` | VERIFIED (content) / MISSING (sanitised export) |

### 1.2 `Hero`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Eyebrow: "Senior Product Manager · Product Thinker · AI Builder · Problem Solver" | `RESUME` "Senior Product Manager (Accounts Receivable), American Express (via IntraEdge), June 2026 – Present"; positioning per user instruction | `Hero.eyebrow` | VERIFIED (title) / DRAFT (supporting triad) |
| Headline: "I turn ambiguity into **AI-native products** people can use." | User instruction (fixed copy) | `Hero.headline` | DRAFT (given) |
| Supporting line: "7+ years shipping cloud, data and AI products at Godrej Infotech, Quantiphi, Shellkode and American Express — and, since August 2026, a run of solo-built AI products with real users." | `RESUME` profile summary ("7+ years… cloud-native, AI, and data-driven products across GCP and AWS"); career timeline; `AUDIT` §4/§5 (TeachSpark/RailCite solo-built, first commits 2026-08-20 / 2026-08-28) | `Hero.support` | DRAFT |
| Tagline (optional secondary): "Observing what others overlook." | `PORT` "Tagline: Observing what others overlook." | `Hero.tagline` | VERIFIED |
| CTA "View My Work" → `/work` | Site IA | `Hero.cta[0]` | DRAFT |
| CTA "Download Resume" → sanitised PDF | See 1.1 | `Hero.cta[1]` | MISSING (sanitised export) |
| Hero photo | `/Volumes/E Drive/Dev/Code/Claude/portfolio/photo.jpg` (`PORT` "photo.jpg: my photo"); alt: `GR/public/tushar.jpg` | `Hero.photo` | VERIFIED (file exists; dimensions not captured — measure at build) |
| `FloatingTiles[0]` **AI Products** — "TeachSpark · RailCite — two live AI products, built solo, Aug–Sep 2026" | `TS/README.md:3`; `CS5/Discovery-PRD.md` L3-5; `AUDIT` git table (first commits 2026-08-20, 2026-08-28) | `FloatingTiles` | VERIFIED |
| `FloatingTiles[1]` **People** — "17 teachers joined a WhatsApp pilot in its first week (TeachSpark, snapshot 2026-08-24, test handsets excluded)" | `CS4/docs/final-prd.docx` §0/§7; `DL/Tushar's PRD_ TechSpark.pdf` pp.19-21 | `FloatingTiles` | VERIFIED (date-stamped) |
| `FloatingTiles[2]` **Progress** — "35+ Accounts Receivable capabilities migrated off a legacy platform; 180+ stories across four Agile teams (AmEx, 2026)" | `RESUME` AmEx Key Achievements | `FloatingTiles` | VERIFIED (self-reported in resume; no external artifact) |

### 1.3 `AskPortfolio`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Search field placeholder "Ask about my work…" | Site copy | `AskPortfolio.input` | DRAFT |
| 8 suggested prompts (chips) | §9 `KnowledgeIndex` (this file) | `AskPortfolio.suggestions` | DRAFT |
| Deterministic answers + evidence links | §9 `KnowledgeIndex` — every answer composed only from VERIFIED rows | `AskPortfolio.answer` | DRAFT |
| Fallback answer for unmatched queries: "I only answer from the sourced facts on this site — try one of the prompts, or email me." | Site copy (honesty rule) | `AskPortfolio.fallback` | DRAFT |

### 1.4 `FeaturedWork` (exactly 3)

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| **TeachSpark** — "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work." · Live · AI · demo video | `TS/README.md:3`; live `https://teachspark-production.up.railway.app` (Final PRD header; `TS/docs/linkedin/linkedin-playbook.md:6`) — **post-2026-09-09 uptime unverified**; video `TS/TeachSpark.mp4` (42.85 MB, 2026-08-23) | `FeaturedWork.card[0]` | VERIFIED (live status needs re-check) |
| **RailCite** — "A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular… without ever inventing a citation." · Live · AI | `CS5/Discovery-PRD.md` L3-5; live `https://railcite.vercel.app` (HTTP 200, `/api/stats` 2026-09-15) | `FeaturedWork.card[1]` | VERIFIED |
| **Nuptis → Velora** — "Two vendor-onboarding products in nine days — and the decision to kill the first." · Live ×2 · PM craft (no AI) | `CS3/Nuptis-PRD.md:3,18`; `CS3/Velora/PRD.md:3`; `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx` Day 7/9; live `https://nuptis.vercel.app/`, `https://velora-nu-eight.vercel.app/` (both HTTP 200, 2026-09-15) | `FeaturedWork.card[2]` | VERIFIED |
| Swap rule: Cubicle replaces slot 3 **only if deployed** | `CS6/HANDOFF.md:3` ("offline build FINISHED… user-only: provision services → first real run"); `CS6/QA-report.md:13` | `FeaturedWork` (rule) | VERIFIED (currently not deployed) |
| Featured-card images | TeachSpark: `CS4/docs/assets/p2-whatsapp-loop.jpg` 1500×837 · RailCite: **MISSING — product screenshot (only mascot `railcite/public/bholu.png` 520×647 exists; capture from live URL)** · Nuptis: `CS3/Nuptis/docs/screenshots/dashboard.jpg` 1568×661 | `FeaturedWork.card.image` | VERIFIED / MISSING (RailCite) |

### 1.5 `HowIThink` (Problem · Insight · Bet · Build · Evaluate · Impact — one real example each)

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| **Problem** — RailCite: "A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists… one wrong/superseded citation damages the inspector's credibility — not the tool's." → `/work/railcite#02-problem` | `CS5/Discovery-PRD.md` L38-41 | `HowIThink.step[0]` | VERIFIED |
| **Insight** — Vendor onboarding: "Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs" (team research, Week 4) → `/work/velora#03-discovery` | `CS3/CASE STUDY 3 PRD.pdf` p.7 (team-pooled interviews; Tushar's individual share MISSING) | `HowIThink.step[1]` | VERIFIED (attribute to team) |
| **Bet** — TeachSpark: "Capability, not dependency." — teach the reusable AI skill instead of doing the task → `/work/teachspark#04-product-bet` | `CS4/Case Study 4 - Solution-Space PRD.docx` §3; `CS4/pitch/teachspark-pitch.pdf` slides 4, 6, 11 | `HowIThink.step[2]` | VERIFIED |
| **Build** — RailCite: a P0 citation validator drops any answer block whose citations don't resolve; all-dropped → refuse. "Refuse is a first-class success state, never an error." → `/work/railcite#05-what-i-built` | `RC/lib/validate.ts`; `CS5/Design.md` L21-24; `RC/lib/synthesize.ts` L8-21 | `HowIThink.step[3]` | VERIFIED |
| **Evaluate** — TeachSpark: added an `is_test` flag and excluded own handsets the day before submission: "Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30." → `/work/teachspark#06-evaluation` | `TS/docs/linkedin/9-day-build-series.md` (Post 9); migration `teacher_is_test` (`AUDIT` §4 architecture) | `HowIThink.step[4]` | VERIFIED |
| **Impact** — TeachSpark pilot (2026-08-24, test handsets excluded): 17 teachers joined, 8 activated (47%), median 37.5 min saved (self-report) → `/work/teachspark#07-outcome` | `CS4/docs/final-prd.docx` §0/§7 | `HowIThink.step[5]` | VERIFIED (date-stamped, self-reported time) |

### 1.6 `FinalCTA` / `Footer`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| "Building something AI-native? Let's talk." + email | `PORT` "Email: Tushar_Pathak@outlook.com" | `FinalCTA` | DRAFT (copy) / VERIFIED (email) |
| LinkedIn `https://www.linkedin.com/in/pathaktushar` | `PORT`; `RESUME` "linkedin.com/pathaktushar" | `Footer` | VERIFIED |
| GitHub `https://github.com/007U5H4R` (public repos: cinematic-portfolio, dino-arcade-pwa; others private) | `MEM` (cinematic PUBLIC); `AUDIT` git table | `Footer` | VERIFIED |
| "Built with curiosity." credit line (footer) · "Designed and built with Claude Code" colophon (`/about`) | Brief §39 (footer) · Authorship rule (§ summary line 10) | `Footer` · `AboutColophon` | VERIFIED / DRAFT |
| Prior portfolio link `https://tushar-pathak.vercel.app/` (cinematic scroll film) | `MEM`; `CN/ledger.md` 08-26 rows | `Footer` | VERIFIED |

---

## 2. `/work`

### 2.1 `WorkHero` + `FilterTabs`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Heading "Work" + line: "Personal builds first. Corporate work is listed as experience, not product." | Rule from user instruction | `WorkHero` | DRAFT |
| Tabs: All · AI · Enterprise · Cloud · Experiments | User instruction | `FilterTabs` | DRAFT |
| Tab-assignment gap: Token Toli (discovery-only), Pratyasa (research record), Bhakti-Vilas (prototype) fit no tab cleanly | — | `FilterTabs` | **MISSING — decide: add "Discovery" tab or park these under Experiments (Tushar)** |

### 2.2 `EditorialGrid` → `ProjectCard` (personal builds)

| Content (card) | Source (path/URL) | Component | Status |
|---|---|---|---|
| **TeachSpark** · icon: wordmark **MISSING locally** (`docs/screenshots/wordmark.png` exists only on `origin/main`) · prop: "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work." · tags: AI · WhatsApp · EdTech · live: `https://teachspark-production.up.railway.app` · video: `TS/TeachSpark.mp4` · badge: "Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified" · tab: AI | `TS/README.md:3`; `AUDIT` §4 | `ProjectCard` + `DemoVideo` | VERIFIED |
| **RailCite** · icon: `CS5/railcite/public/icon-512.png` · prop: "Cite-or-refuse assistant over Indian Railways commercial circulars for Chief Commercial Inspectors." · tags: AI · RAG · GovTech · live: `https://railcite.vercel.app` · video: **MISSING — to be screen-recorded** · badge: "Live · nightly crawl" · tab: AI | `CS5/Discovery-PRD.md` L3-5; `RC/.github/workflows/daily-crawl.yml` | `ProjectCard` + `DemoVideo` | VERIFIED / MISSING (video) |
| **Cubicle** · icon: **MISSING** (only Next.js template SVGs in `CS6/cubicle/public/`) · prop: "Four AI teammates debate visibly, then produce a PRD, competitor scan, landing copy and build plan in ~90 seconds." · tags: AI · Multi-agent · Gemini · live: **MISSING (not deployed)** · video: **MISSING — needs a live run first** · badge: "Built, not launched" · tab: AI | `CS6/Discovery-PRD.md:260`; `CS6/QA-report.md:13,20`; `CS6/HANDOFF.md:3` | `ProjectCard` | VERIFIED (status) / MISSING (icon, URL, video) |
| **Nuptis** · icon: `CS3/Nuptis-LM-transparent.png` 1408×768 (or `CS3/Nuptis/docs/screenshots/wordmark.png` 767×181) · prop: "Vendor ops for wedding-planning agencies — verification status, work orders, payment milestones and backup coverage in one place." · tags: B2B · Vendor ops · Supabase · live: `https://nuptis.vercel.app/` · video: **MISSING — to be screen-recorded** · badge: "Live (mock data)" · tab: Enterprise | `CS3/Nuptis-PRD.md:3,18`; `CS3/Nuptis/README.md:83-88` | `ProjectCard` | VERIFIED / MISSING (video) |
| **Velora** · icon: `CS3/Velora/assets/cert-badge-gold.png` 626×626 or `CS3/Velora/docs/screenshots/hero.jpg` 720×455 · prop: "A B2B apparel sourcing marketplace where fashion brands and garment manufacturers swipe to connect, and matches turn into bids." · tags: B2B · Marketplace · React 19 · live: `https://velora-nu-eight.vercel.app/` · video: **MISSING** · badge: "Live (mock data)" · tab: Enterprise | `CS3/Velora/PRD.md:3`; `CS3/Velora/app/index.html:15` | `ProjectCard` | VERIFIED / MISSING (video) |
| **Bhakti-Vilas** · icon: `CS2/Bhakti-Vilas/assets/morning-bhajan.jpg` 1400×933 (crop) · prop: "An elder-focused wellness prototype built around bhajan — devotion as behavioural health, not a clinical app." · tags: Prototype · Health · Team · live: `https://bhakti-vilas.vercel.app/` · video: **MISSING** · badge: "Live prototype (mock data, team build)" · tab: Experiments | `CS2/Bhakti-Vilas/README.md`; git authors 5×007U5H4R / 3×Shivali (`AUDIT` §2) | `ProjectCard` | VERIFIED / MISSING (video) |
| **Token Toli** (discovery-only) · icon: **MISSING** (no standalone images; figures embedded in PDF) · prop: "Ageing-in-place care orchestration for long-distance families — a discovery PRD with 11 named respondents and four tested hypotheses." · tags: Discovery · Research · Healthcare · live: — · video: — · badge: "Discovery only" · tab: (see gap) | `CS1/Discovery PRD-2.pdf` (= `DL/Discovery PRD-2.pdf`, MD5-identical) cover, pp.24-31 | `ProjectCard` | VERIFIED / MISSING (icon) |
| **Pratyasa** · icon: `PT/pratyasa-site/assets/wordmark.webp` 786×75 · prop: "A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage." · tags: Patent · Static · Record · live: `https://pratyasa.vercel.app` · video: `PT/pratyasa-site/assets/demo.mp4` (device footage, not a product screen-recording) · badge: "Live" · tab: (see gap) | `PT/discoveryPRD.md` Goal, §4 FACT-LOCK; `AUDIT` §7 | `ProjectCard` + `DemoVideo` | VERIFIED |
| **Tegaki** · icon: `GR/docs/screenshots/wordmark.png` 864×208 · prop: "What your handwriting suggests about you — read and written by hand." · tags: D2C · Supabase RLS · Pilot · live: `https://tegaki-one.vercel.app` · video: **MISSING** · badge: "Live pilot" · tab: Experiments | `GR/README.md` (tagline, highlights); `GR/Solution-PRD.md` §1 | `ProjectCard` | VERIFIED / MISSING (video) |
| **dino-arcade-pwa** · icon: `DN/assets/icon-512.png` · prop: "A mobile PWA that turns your phone into an arcade cabinet — bring your own ROM, nothing ships or uploads." · tags: PWA · Offline · EmulatorJS · live: `https://007u5h4r.github.io/dino-arcade-pwa/` · video: **MISSING** · badge: "Live (BYO-ROM)" · tab: Experiments | `DN/README.md` | `ProjectCard` | VERIFIED / MISSING (video) |
| **cinematic-portfolio** · icon: `CN/assets/posters/hero.jpg` 1280×720 · prop: "A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step." · tags: Motion · Static · Higgsfield · live: `https://tushar-pathak.vercel.app/` · repo: `https://github.com/007U5H4R/cinematic-portfolio` (PUBLIC) · video: the site itself scrubs `CN/assets/film/hero-orbit.mp4`; screen-recording **MISSING** · badge: "Live" · tab: Experiments | `CN/PRD.md`; `CN/ledger.md` 08-26; `MEM` | `ProjectCard` | VERIFIED |

### 2.3 `EditorialGrid` → Professional Experience entries (clearly separated; no live URL, no demo)

| Content (card) | Source (path/URL) | Component | Status |
|---|---|---|---|
| **MARS Accounts Receivable modernization — American Express (via IntraEdge), Jun 2026–present.** "Owned the migration roadmap for 35+ AR capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform; led Devin GenAI integration for AI-assisted development." tags: Enterprise · Cloud · GenAI · badge: "Professional experience" · tab: Enterprise, Cloud, AI | `RESUME` AmEx section | `ProjectCard.variant=experience` | VERIFIED (resume only) |
| **Cloud & data platform modernization programs — Quantiphi (GCP), Aug 2022–Apr 2026; Shellkode (AWS), Apr–Jun 2026.** "DynamoDB→Cloud Spanner and SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; GCP capability-building program; Agile delivery governance." tags: Cloud · Data · Delivery · tab: Cloud, Enterprise | `RESUME` Quantiphi + Shellkode sections | `ProjectCard.variant=experience` | VERIFIED (resume only) |
| **Godrej Smartnet platform — Godrej Infotech, Sep 2016–Dec 2018.** "Assistant Product Manager: end-to-end lifecycle of the Smartnet platform; 12 features in 11 months; Agile transformation." tags: Product · Enterprise · IoT/Platform (**"IoT" unverified — resume says "platform" only; use "Platform"**) · tab: Enterprise | `RESUME` Godrej section | `ProjectCard.variant=experience` | VERIFIED (resume only) |
| Any screenshot/architecture image for the above | — | `ProjectCard.image` | **MISSING — none may be published without employer clearance; use abstract illustration** |

---

## 3. `/work/[slug]` — shared components (per-project content is in §8 source packs)

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Name, one-line problem, role, duration, status, verified metrics | §8 pack per slug | `CaseStudyHeader` | see pack |
| Hero screenshot / prototype | §8 "Artifacts" per slug (path + dimensions) | `CaseStudyHeader.media` / `PrototypeFrame` | see pack |
| 30-sec summary vs deep dive toggle | 30-sec = pack "tagline + problem + outcome"; deep dive = chapters 01–08 | `OverviewToggle` | DRAFT |
| Chapters 01 Context · 02 Problem · 03 Discovery · 04 Product Bet · 05 What I Built · 06 Evaluation · 07 Outcome · 08 What I Learned | §8 pack fields map 1:1 (Context/dates → 01; Problem → 02; Users + discovery chain → 03; Bet → 04; Stack/architecture → 05; Tests/evals → 06; Metrics → 07; Learnings → 08) | `Chapter[]` | see pack |
| `ArtifactCard` (PRDs, decks, ledgers) | pack "Artifacts" | `ArtifactCard` | see pack |
| `InsightCard` / `HypothesisCard` / `DecisionCard` | pack "Show-the-Thinking chain" | as named | see pack |
| `MetricCard` — every number carries date + context + "self-reported"/"by construction" where applicable | pack "Metrics" | `MetricCard` | see pack |
| `EvaluationCard` / `ExperimentCard` | pack "Evaluation" | as named | see pack |
| `ShowTheThinking` (Observation → User problem → Insight → Hypothesis → Product decision → Prototype → Evaluation → Outcome) | pack chain, each node sourced | `ShowTheThinking` | see pack |
| "Built with Claude Code" note where applicable | pack "Authorship" | `CaseStudyHeader.meta` | see pack |

---

## 4. `/about`

### 4.1 `AboutHero`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| "Senior Product Manager. Product Thinker · AI Builder · Problem Solver." | `RESUME` title; positioning instruction | `AboutHero.title` | VERIFIED / DRAFT |
| Bio paragraph — composed from: "driven by curiosity, systems thinking, and a bias toward building products that solve real customer problems… questioning assumptions, uncovering insights hidden in everyday experiences" (**omit the phrase "AI Product Manager"**) + "7+ years… cloud-native, AI, and data-driven products across GCP and AWS" | `PORT` About; `RESUME` profile summary | `AboutHero.bio` | DRAFT |
| Portrait | `/Volumes/E Drive/Dev/Code/Claude/portfolio/photo.jpg` | `AboutHero.photo` | VERIFIED |

### 4.2 `ProductJourney`

| Stage | Content | Source (path/URL) | Component | Status |
|---|---|---|---|---|
| Physical / enterprise | Godrej Infotech, Sep 2016–Dec 2018 — Assistant PM on the Godrej Smartnet platform; 12 features in 11 months | `RESUME` Godrej | `ProductJourney.stage[0]` | VERIFIED (resume) |
| (gap) | 2019–2022: M.Tech Nanotechnology, NIT Calicut (2022); patent filed 16 Sep 2022, granted 24 Apr 2023; Soft Matter paper 2023 | `RESUME` Education; `PT/discoveryPRD.md` §4 | `ProductJourney.note` | VERIFIED (dates) / **MISSING — Tushar to confirm 2019–2022 framing** |
| Cloud & data | Quantiphi (GCP), Aug 2022–Apr 2026 — cloud-native programs: data engineering, API modernization, GenAI initiatives; Shellkode (AWS), Apr–Jun 2026 | `RESUME` Quantiphi, Shellkode | `ProductJourney.stage[1]` | VERIFIED (resume) |
| AI-enabled | American Express, Jun 2026–present — Devin GenAI adoption in the MARS engineering ecosystem | `RESUME` AmEx | `ProductJourney.stage[2]` | VERIFIED (resume) |
| AI-native | Aug–Sep 2026 — TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched) | `AUDIT` §4, §5, §6 | `ProductJourney.stage[3]` | VERIFIED |

### 4.3 `CapabilityClusters` (4 clusters)

| Cluster | Content | Source (path/URL) | Component | Status |
|---|---|---|---|---|
| Product | Strategy, vision & roadmap · discovery & requirements · governance & delivery · end-to-end lifecycle · data-driven decisions | `RESUME` Core Competencies | `CapabilityClusters[0]` | VERIFIED |
| AI | Shipped LLM features: structured outputs + vision + QC pass (TeachSpark, Claude Sonnet 5 / Haiku 4.5); RAG with Voyage-3 + pgvector, forced-tool extractive synthesis, citation validator (RailCite); multi-agent orchestration design (Cubicle, Gemini); enterprise GenAI adoption (Devin at AmEx; GenAI initiatives at Quantiphi) | `TS/src/adapters/anthropic.ts`, `anthropic-paper.ts`; `RC/lib/embeddings.ts`, `synthesize.ts`, `validate.ts`; `CS6/cubicle/lib/gateway/transport.ts`; `RESUME` | `CapabilityClusters[1]` | VERIFIED |
| Technology | GCP · AWS · microservices vs legacy monoliths · BigQuery · Cloud Spanner · SQL · Looker · Supabase/Postgres (RLS, pgvector) · Next.js/React · Vercel/Railway | `RESUME` Technical Skills; `GR/README.md` (18 RLS migrations); `RC/migrations/001_init.sql` | `CapabilityClusters[2]` | VERIFIED |
| Execution | Agile · Scrum · SAFe · Kanban (methodologies, **not certifications**) · program governance · cross-functional leadership · Jira/Azure DevOps | `RESUME` Agile Methodologies, PM Tools | `CapabilityClusters[3]` | VERIFIED |

### 4.4 `Impact` (numbers with context)

| Metric | Context + date | Source (path/URL) | Component | Status |
|---|---|---|---|---|
| 35+ AR capabilities · 180+ user stories · 4 Agile teams · −30% feature delivery cycle time | AmEx MARS migration, Jun 2026–present; self-reported in resume | `RESUME` | `Impact.metric` | VERIFIED (resume only) |
| 40+ cloud-native microservices/API capabilities delivered | AmEx MARS; self-reported | `RESUME` | `Impact.metric` | VERIFIED (resume only) |
| −30% development effort · +25% developer productivity | Devin GenAI adoption in MARS; self-reported; measurement method MISSING | `RESUME` | `Impact.metric` | VERIFIED (resume only) |
| 12 features in 11 months · +25% service-monitoring effectiveness · +30% team productivity · −20% turnaround | Godrej Smartnet, 2016–18; self-reported | `RESUME` | `Impact.metric` | VERIFIED (resume only) |
| 17 teachers joined · 8 activated (47%) · median 37.5 min saved (self-report) · 3 referrals | TeachSpark pilot, snapshot 2026-08-24, test handsets excluded | `CS4/docs/final-prd.docx` §0/§7 | `Impact.metric` | VERIFIED |
| 5,760 documents · 14,406 chunks live; 68% of ingested PDFs needed OCR (3,865 of 5,687 at 7 Sep) | RailCite corpus, live `/api/stats` 2026-09-15; OCR share from Final PRD §7.1 | `AUDIT` §5; `CS5/docs/final-prd.docx` §7.1 | `Impact.metric` | VERIFIED (date-stamped) |
| 0 invented citations — enforced by a validator, not sampled | RailCite `lib/validate.ts`; label "by construction" | `RC/lib/validate.ts` | `Impact.metric` | VERIFIED (structural) |
| Any external validation of resume metrics (perf reviews, dashboards) | — | `Impact` | **MISSING — none on disk; publish as "self-reported"** |

### 4.5 `ExperienceTimeline` (Godrej → Quantiphi → Shellkode → AmEx)

| Role | Context · Responsibility · Scale · What changed · Outcomes | Source (path/URL) | Component | Status |
|---|---|---|---|---|
| **American Express (via IntraEdge), Bengaluru — Senior Product Manager (Accounts Receivable), Jun 2026–present** | Context: legacy Triumph → cloud-native MARS microservices. Responsibility: AR transaction-capability roadmap; requirements; backlog; Devin GenAI integration. Scale: 35+ capabilities, 180+ stories, 4 Agile teams, 40+ microservices/APIs. What changed: legacy retirement accelerated; AI-assisted development adopted. Outcomes: −30% cycle time; −30% dev effort; +25% dev productivity (self-reported) | `RESUME` | `ExperienceTimeline.role[3]` | VERIFIED (resume only) — **decide how to show "via IntraEdge"** (`PORT` omits it) |
| **Shellkode, Bengaluru — Technical Project Manager, AWS Division, Apr–Jun 2026** | Context: AWS delivery programs. Responsibility: end-to-end program delivery; Agile/DevOps/CI-CD frameworks; exec + client engagement. Scale: MISSING. What changed: org-wide adoption of internal PM platform "Pulse"; standardized stories/AC/docs/repos. Outcomes: qualitative only | `RESUME` | `ExperienceTimeline.role[2]` | VERIFIED (resume only) |
| **Quantiphi Analytics, Bengaluru — Technical Project Manager, GCP Division, Aug 2022–Apr 2026** | Context: enterprise cloud-native programs (data engineering, API modernization, GenAI). Responsibility: program governance, charters, risk, dependencies. Scale: MISSING (no client/program counts). What changed: DynamoDB→Cloud Spanner migrations; SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; GCP capability-building program. Outcomes: "reducing latency and optimizing operational costs", "zero data loss" (unquantified) | `RESUME`; awards below | `ExperienceTimeline.role[1]` | VERIFIED (resume only) |
| **Godrej Infotech, Mumbai — Assistant Product Manager, Sep 2016–Dec 2018** | Context: Godrej Smartnet platform. Responsibility: end-to-end lifecycle; roadmap; Scrum adoption. Scale: MISSING. What changed: Agile institutionalized across portfolio. Outcomes: 12 features/11 months; +25% monitoring effectiveness; +30% productivity; −20% turnaround | `RESUME` | `ExperienceTimeline.role[0]` | VERIFIED (resume only) |
| Role-level artifacts (architecture sketches, before/after, testimonials) | — | `ExperienceTimeline.artifacts` | **MISSING — Tushar to supply cleared, non-confidential material or none** |

### 4.6 `Awards`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Google Cloud Partner All-Star: Delivery Excellence (2024) | `RESUME` Awards | `Awards[0]` | VERIFIED (resume; certificate MISSING) |
| Annual Unsung Hero Award, Quantiphi Analytics Solutions (2024) | `RESUME` Awards | `Awards[1]` | VERIFIED (resume; certificate MISSING) |
| 12 in 11 Award, Godrej Infotech (2018) | `RESUME` Awards | `Awards[2]` | VERIFIED (resume; certificate MISSING) |
| Excluded: PMP, SAFe Agilist | Not in `RESUME`; banner-only claims | — | EXCLUDED |

### 4.7 `Research` (patent + 2 papers)

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Patent: "A Low-Cost Portable Electrochemical Biosensor for Rapid Detection of Endotoxin and Method Thereof" — **IN 429867**, Application 202241053140, filed 16 Sep 2022, granted 24 Apr 2023, patentee NIT–Calicut; inventors: Dr. N. Sandhyarani, **Tushar Pathak**, Haritha K, Dr. Arun R, Dr. M. K. Ravi Varma → `https://pratyasa.vercel.app` | `PT/discoveryPRD.md` §4 FACT-LOCK (from certificate `PT/Ed__6d16ff33-…pdf`); `RESUME` (prints SL no. as patent no. — **conflict, certificate wins**) | `Research.patent` | VERIFIED |
| Paper 1: Kuttoth, H.; Pathak, T.; Sandhyarani, N. "A Point-of-Care Aptasensor for the Real-Time Detection of Sepsis Biomarker." *Langmuir* 2025, 41(26). DOI 10.1021/acs.langmuir.5c00784 | `PT/discoveryPRD.md` §4; `RESUME` Paper Publications; local PDF `PT/kuttoth-et-al-2025-…pdf` (do not redistribute; link DOI) | `Research.paper[0]` | VERIFIED |
| Paper 2: "Topological Phases in Nanoparticle Monolayers: Why Crystalline, Hexatic, and Isotropic-Fluid Phases Coexist at the Same Temperature." *Soft Matter*, RSC (2023) | `RESUME` Paper Publications | `Research.paper[1]` | VERIFIED (title) / **MISSING — DOI + author list** |
| Rights/safety line: "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic." | `PT/discoveryPRD.md` Global Constraints + footer copy L199 | `Research.disclaimer` | VERIFIED |

### 4.8 `Education`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| M.Tech., Nanotechnology — National Institute of Technology Calicut, Kozhikode, 2022 | `RESUME` Education | `Education[0]` | VERIFIED |
| B.E., Mechanical Engineering — Bhilai Institute of Technology, Durg, 2016 | `RESUME` Education | `Education[1]` | VERIFIED |
| Languages: English, Hindi, Bengali (optional) | `RESUME` Personal Details | `Education.meta` | VERIFIED (optional; not PII) |

---

## 5. `/thinking` — `ThinkingList` (no articles exist; ≤5 DRAFT candidates, each backed by a real passage)

| Candidate title | Backing passage (quoted) | Source (path/URL) | Component | Status |
|---|---|---|---|---|
| "Green tests prove it runs. They don't prove it's right." | "364 tests passed. Then I opened the actual file… Green tests prove it runs. They don't prove it's right." + "The two most important defects this session… were both found by reading the code/reasoning, not by any test." | `TS/docs/linkedin/9-day-build-series.md`; `CS6/lesson-learnt.md` L8 | `ThinkingList.item[0]` | DRAFT — needs Tushar's sign-off |
| "I made my own numbers worse the day before submitting" | "Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30. Papers went from 5 to 2." · "Honest smaller numbers earn more trust than impressive fake ones." | `TS/docs/linkedin/9-day-build-series.md` (Post 9); `CS4/docs/final-prd.docx` §0 | `ThinkingList.item[1]` | DRAFT — needs Tushar's sign-off |
| "Refusal is a feature: designing an AI that would rather say no" | "Refuse is a first-class success state, never an error… the single most important design decision in the document." · "The feature is a citation. The product is trust." | `CS5/Design.md` L21-24; `CS5/docs/linkedin/railcite-9day-linkedin-series.md` Day 5; `RC/lib/synthesize.ts` L8-21 | `ThinkingList.item[2]` | DRAFT — needs Tushar's sign-off |
| "Killing Nuptis: two products in nine days and why one had to die" | "Weddings were blue — but a shallow pool. Few events, low willingness to pay… the same trust problem, aimed at apparel vendor onboarding." · "learning to kill Nuptis without flinching." | `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx` Day 7, Day 9 | `ThinkingList.item[3]` | DRAFT — needs Tushar's sign-off |
| "Staleness is a correctness bug, not a missing feature" | "A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached." | `RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md` L16-19 | `ThinkingList.item[4]` | DRAFT — needs Tushar's sign-off |
| Page empty state copy: "Essays in progress — five drafts, none published yet." | — | `ThinkingList.empty` | DRAFT |
| Any published article/URL | — | `ThinkingList` | **MISSING — none exist; LinkedIn series posting status unknown (`AUDIT` §1 skills.md "Posts haven't been published yet"; §5 "Posted: unknown")** |

---

## 6. `/playground` — `PlaygroundGrid`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| **Pratyasa** — patent record page; static, zero third-party requests; fact-checker script in CI (`verify-facts.py`) | `PT/discoveryPRD.md`; `PT/pratyasa-site/verify-facts.py`; live `https://pratyasa.vercel.app`; screenshot `PT/pratyasa-site/assets/device-photo.jpg` 1600×900, `case-framed.webp` 1000×856, OG `og-cover.png` 1200×630 | `PlaygroundGrid.card[0]` | VERIFIED |
| **Tegaki** — handwriting-assessment pilot; Next.js 16 + Supabase, 18 RLS migrations, honesty guard `check-claims` in CI; first commit 2026-09-01, last 2026-09-09; 31 test files (vitest + Playwright) | `GR/README.md`; `GR/package.json`; `GR/supabase/migrations` (18); live `https://tegaki-one.vercel.app`; screenshots `GR/docs/screenshots/{hero,how-it-works,anatomy,report-excerpt,pricing,sign-in}.jpg` 1568×661; OG `GR/public/og-cover.png` 1200×630 | `PlaygroundGrid.card[1]` | VERIFIED |
| **dino-arcade-pwa** — BYO-ROM PWA arcade cabinet; EmulatorJS 4.2.3 + FBNeo core self-hosted; offline via service worker; 3 commits (2026-09-06/07) | `DN/README.md`; live `https://007u5h4r.github.io/dino-arcade-pwa/`; icons `DN/assets/icon-512.png`; **screenshot MISSING** | `PlaygroundGrid.card[2]` | VERIFIED / MISSING (screenshot) |
| **cinematic-portfolio** — scroll-film portfolio; 1 still + 3 clips generated via Higgsfield (197 credits), 289 scrub frames, Lenis; live 2026-08-26 | `CN/PRD.md`; `CN/ledger.md`; live `https://tushar-pathak.vercel.app/`; repo `https://github.com/007U5H4R/cinematic-portfolio`; media `CN/assets/posters/{hero,work,close}.jpg` 1280×720, `CN/assets/og-cover.png` 1200×630, `CN/assets/stills/hero-still.png` 2752×1536 | `PlaygroundGrid.card[3]` | VERIFIED |
| Exclusion note (one line each): **Slag City** — in-progress, no remote, no live URL (`AUDIT` §7). **Mock Interview** — team draft, last commit is a revert, fronted by a third party's likeness (`AUDIT` §7). **Game** — duplicate planning copy of dino-arcade-pwa and contains ROM/BIOS files that must never be published (`AUDIT` §7). | `AUDIT` §7 | `PlaygroundGrid.note` (internal; do not render the ROM detail) | VERIFIED |

---

## 7. `/contact` — `ContactCard`

| Content | Source (path/URL) | Component | Status |
|---|---|---|---|
| Email `Tushar_Pathak@outlook.com` | `PORT`; `RESUME` | `ContactCard.email` | VERIFIED |
| LinkedIn `https://www.linkedin.com/in/pathaktushar` | `PORT`; `RESUME` | `ContactCard.linkedin` | VERIFIED |
| Resume PDF (sanitised) | `RESUME` — re-export required (§1.1) | `ContactCard.resume` | MISSING (sanitised export) |
| Location line "Bengaluru, India" (city only) | `RESUME` (address stripped to city) | `ContactCard.location` | VERIFIED (city only; no street/PIN) |
| Phone | `RESUME` | — | EXCLUDED (PII) |

---

## 8. Case-study source packs (11)

Field order per pack: slug · name · tagline · category tags · status · role · dates · live URL · repo · stack (verified) · problem · users (quoted) · Show-the-Thinking chain · metrics (dated) · artifacts (path + dimensions) · video · learnings · authorship · MISSING.

### 8.1 `teachspark`

- **Name / tagline:** TeachSpark — "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work." (`TS/README.md:3`)
- **Tags:** AI · WhatsApp · EdTech · **Status:** Live pilot (Twilio sandbox, not a production WhatsApp number — `TS/docs/runbook.md` "sandbox for the case-study cohort"); uptime after 2026-09-09 **unverified**.
- **Role:** "Author: Tushar Pathak" on all three PRDs; "Built the entire MVP solo (WhatsApp bot, web, admin, analytics)" (`TS/docs/investor/deck-content.md:97`). Group discovery Sat–Mon, individual from Tuesday (`CS4/Week 5 __ Case Study 4 __ Cohort 8.docx`).
- **Dates:** Discovery + Solution PRD 2026-08-19; first commit 2026-08-20; Final PRD 2026-08-26; mentor feedback captured 2026-08-29; `origin/main` last commit 2026-09-09. 142 commits across branches.
- **Live:** `https://teachspark-production.up.railway.app` (routes `/join`, `/admin`). **Repo:** `https://github.com/007U5H4R/teachspark` — private (placeholder "Repo available on request").
- **Stack (verified `TS/package.json`, `TS/web/package.json`):** Node ≥24.15, Express 5, `@anthropic-ai/sdk` ^0.119, Twilio 6, Supabase JS 2.112, pdfkit, docx, zod 4, node-cron; web: React 19, react-router 8, Vite 8, vite-plugin-pwa, Mixpanel, Clarity; tests vitest 4 + supertest + Testing Library. Hosted on Railway (`railway.json`, `/health`).
- **Architecture:** "WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX → back to WhatsApp" (`TS/docs/runbook.md:10-65`); `transition()` pure function in `src/bot/machine.ts`; ports/adapters (`src/ports.ts`, `src/adapters/`). Models: `claude-sonnet-5` default, `claude-haiku-4-5` switchable (`src/config.ts`, `src/adapters/anthropic.ts:9`); question-paper path uses structured outputs (`zodOutputFormat`), vision on teacher photos, second QC pass (`src/adapters/anthropic-paper.ts`). "Cost is roughly $0.01 per generation" (runbook).
- **Problem:** "School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context…" (Discovery PRD §6; `DL/Tushar Discovery PRD.pdf` p.9).
- **Users (quoted):** Persona "Meera": "Age / stage 25–40; 3–15 years of teaching experience · Full-time school teacher (K–12) … class sizes of 30–50; mixed-ability students … has never written a prompt with intent." JTBD: "When I'm overwhelmed by prep and grading, help me solve this week's specific teaching task with AI, so I get real time back… without having to become a techie first." (Discovery PRD §1.1)
- **Show-the-Thinking chain:**
  - Observation — "it started with one real teacher: my mother, who teaches Sanskrit" (`CS4/pitch/teachspark-pitch.pdf` slide 13); "My best user research was remembering my mother's evenings." (`TS/docs/linkedin/linkedin-playbook.md`)
  - User problem — Discovery PRD §6 (above).
  - Insight — "The problem is not scarcity of content, it is that content is generic and disconnected from the classroom." (Discovery PRD §0); white space: "generic↔classroom-specific and task-execution↔capability-building" (`CS4/docs/assets/disc-whitespace-quadrant.jpg`).
  - Hypothesis — central hypothesis + 8 assumptions A1–A8 with type/risk (Discovery PRD); HMW §6.1.
  - Product decision — "Capability, not dependency." (Solution PRD §3); MVP wedge chosen by "high frequency, high pain, easy to template and measure" (Solution PRD §4); WhatsApp as distribution.
  - Prototype — shipped bot + landing + admin (stack above); `TS/TeachSpark.mp4`.
  - Evaluation — QA gates phase-1…7 (`TS/docs/qa/`); pilot instrumentation "32 event types" (`TS/docs/investor/deck-content.md:35`); `is_test` flag exclusion (LinkedIn Post 9).
  - Outcome — funnel below; mentor challenge → Wave 1 "trust & clarity" commit 2026-08-29 (`CS4/MentorFeedback.md`).
- **Metrics (dated):**
  - **Canonical (recommended) — Final PRD snapshot 2026-08-24, test handsets excluded:** landing views 72 → sign-ups 17 (23.6%) → joined WhatsApp 17 → onboarded 12 (71%) → activated 8 (47%) → question papers exported 5 · median 37.5 min saved (self-report) · referrals 3 · nudge re-engagement 1 of 4. Sign-up method 17 manual / 0 Google. Targets: joined 40–50, activation ≥60%, D1 ≥25%. (`CS4/docs/final-prd.docx` §0/§7; `DL/Tushar's PRD_ TechSpark.pdf` pp.19-21)
  - **Conflicting — pitch snapshot 2026-08-26:** 18 on WhatsApp · 9 activated (50%) · 30 min median · 2 papers · 3 referrals · ~$1.50 total cost (`CS4/pitch/teachspark-pitch.pdf` slides 9, 12). **Choose one date; do not mix.**
  - Mixpanel (from 24 Aug only; first-party store is authoritative): landing_view 27 → signup_completed 7 (25.93%) → join_tapped 4 (`CS4/docs/assets/mixpanel-funnel.png`).
  - Tests: last recorded gate 335 passed / 2 skipped (phase-6, 2026-08-21, `TS/docs/qa/phase-6.md`); ≈545 test call sites on disk; pitch "625 tests" **not reproduced — do not use**.
- **Artifacts:** `CS4/docs/assets/`: `disc-persona.jpg` 1500×1000 · `disc-core-loop.jpg` 1254×1254 · `disc-whitespace-quadrant.jpg` 1254×1254 · `disc-blue-ocean.jpg` 1500×844 · `disc-validation-funnel.jpg` 1024×1536 · `disc-current-journey.jpg` 1500×1000 · `disc-missing-bridge.jpg` 1149×1369 · `disc-content-vs-problem.jpg` 1500×1000 · `p2-architecture.jpg`, `p2-at-a-glance.jpg`, `p2-insight-iteration.jpg`, `p2-results.jpg`, `p2-whatsapp-loop.jpg` 1500×837 · `mixpanel-funnel.png` 1500×466 · `mixpanel-daily-signups.png` 1500×467. `CS4/TeachSpark - Blue Ocean Strategy.png` 1376×768. Web: `TS/web/public/og-cover.png` 1200×630, `demo-poster.jpg` 450×972. Decks: `CS4/pitch/teachspark-pitch.pdf` (14 pp), `TS/docs/investor/teachspark-deck.pdf` (15 pp). PRDs: `CS4/Case Study 4 - Discovery PRD.docx`, `CS4/Case Study 4 - Solution-Space PRD.docx`, `CS4/docs/final-prd.docx`.
- **Video:** `TS/TeachSpark.mp4` (42.85 MB, 2026-08-23) — **needs compression/poster for web**.
- **Learnings:** Mentor: "a teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow." · "WhatsApp is a strong distribution decision, but it should not become the entire product differentiation." (`CS4/MentorFeedback.md`, 2026-08-29). Retro: redundant WhatsApp-number field was "the likely top drop-off" (Final PRD §8); India map "placed zero real sign-ups — case-sensitive lookup vs 14 hard-coded cities" (pitch slide 10); "Teachers had typed 'Bangalore' four different ways." (`TS/docs/linkedin/9-day-build-series.md`).
- **Authorship:** built with Claude Code (superpowers artifacts under `TS/docs/superpowers/`); product model is Claude (Sonnet 5 / Haiku 4.5).
- **MISSING:** teacher interview notes/counts (planned 8–12, none recorded) · pilot teacher testimonials · retention curve / K-factor · LLM output-quality evals · current live-status check · production WhatsApp number · local product screenshots (only on `origin/main`) · web-ready demo video.

### 8.2 `railcite`

- **Name / tagline:** RailCite — "A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular — with number, date, and supersession lineage — and drafts a defensible justification note, without ever inventing a citation." (`CS5/Discovery-PRD.md` L3-5)
- **Tags:** AI · RAG · GovTech · **Status:** LIVE (HTTP 200; `/api/stats` 2026-09-15); nightly crawl via GitHub Actions on a self-hosted Mac runner (`RC/.github/workflows/daily-crawl.yml`).
- **Role:** "RailCite is a solo-built MVP" (`CS5/docs/final-prd.docx` §0); 104/105 commits by Tushar. Case study: "Week 5 · Case Study 5 · Cohort 8 · Government / Public Sector".
- **Dates:** Discovery-PRD 2026-08-28; first commit 2026-08-28; last commit 2026-09-05; Final PRD 7 Sep 2026.
- **Live:** `https://railcite.vercel.app`. **Repo:** `https://github.com/007U5H4R/railcite` — private (placeholder). Canonical checkout `RC` (branch `build/phase5`, 105 commits); `CS5/railcite` is a stale clone.
- **Stack (verified `RC/package.json`):** Next 15.5, React 19.1, `@anthropic-ai/sdk` ^0.122, Supabase JS 2.112 (Postgres + pgvector), zod 4, motion 13, Mixpanel (EU), Vercel Analytics/Speed Insights; vitest 4, Testing Library. Embeddings Voyage `voyage-3` 1024-dim (`RC/lib/embeddings.ts` L12; `RC/migrations/001_init.sql` L23). Synthesis `claude-sonnet-5` with forced tool `record_conclusion`, union `answered|refused` (`RC/lib/synthesize.ts`); classifier `claude-haiku-4-5-20251001` (`RC/lib/classifyQueryDomain.ts` L55); Hindi translation Sonnet 5 (`RC/lib/translate.ts` L46). Ingest: pdftotext + pdftoppm/tesseract OCR; chunks 1000 tok / 150 overlap. No reranker.
- **Pipeline:** JWT auth → embed + domain classify → scope-aware cache → `matchChunks` k=8 → threshold 0.32 → synthesize → `validate` → lineage → cache (`RC/app/api/query/route.ts`). System prompt: "EXTRACTIVE ONLY… If no provided passage actually governs the case, you MUST refuse… Never invent circular numbers, dates, or provisions." (`RC/lib/synthesize.ts` L8-21)
- **Problem:** `CS5/Discovery-PRD.md` L38-41 (quoted in §1.5).
- **Users (quoted):** "Ravi (composite of a real CCI — the builder's father and his colleagues). Middle-aged, Group-C commercial supervisory cadre; not an officer… low tolerance for a tool that 'sounds confident and is wrong.'" (`CS5/Discovery-PRD.md` L45-51); "Age / stage 40-58" (Final PRD).
- **Show-the-Thinking chain:**
  - Observation — the builder's father is a serving CCI (Final PRD §6).
  - User problem — Discovery-PRD L38-41.
  - Insight — "The Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included 'should not be deemed to have been superseded simply because of their non-inclusion.'" (`CS5/Discovery-PRD.md` L25-28); reframe "from search-led ('find the circular faster') to accountability-led ('prove which version governs today')"; "The officer who sanctions is the officer who defends."
  - Hypothesis — "We believe CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date, and because generic AI is confidently wrong… We'll know we're right when a real CCI completes a real justification using a tool-generated, correctly-cited draft, and the tool refuses rather than fabricates on an uncovered case." (Final PRD §7.1)
  - Product decision — "Refuse is a first-class success state, never an error… the single most important design decision in the document." (`CS5/Design.md` L21-24)
  - Prototype — live app; 7 decks in `CS5/decks/`.
  - Evaluation — threshold calibration 5 relevant + 3 irrelevant queries: "irrelevant ≤0.25, relevant 0.29–0.66; gap → 0.32" (`RC/scripts/calibrate.ts`; `CS5/docs/superpowers/reports/QA-phase2.md` P2-10); nonsense query refused (P2-5); impeccable critique 22/40 with 1 P0 "Flagship starter refuses" (`CS5/railcite/.impeccable/critique/2026-08-31T14-59-19Z__components-caseconsole-tsx.md`).
  - Outcome — cross-domain bleed fix: "bleed has to be impossible, not merely unlikely" → hard SQL domain filter + per-PDF traceability + scope-aware cache (Final PRD §8; commits 2026-09-03); nightly crawl shipped.
- **Metrics (dated):** Live 2026-09-15: 5,760 documents / 14,406 chunks (`/api/stats`). Final PRD 7 Sep: 6,333 PDFs discovered; 5,687 ingested; 3,865 OCR (68%); 14,078 chunks; 193 lineage links. Tests 2026-09-15 (`RC`): 345 passed / 1 failed (stale `poppler-utils` expectation) / 2 skipped, 48 files. Citation validity "100% by construction" — **structural, not measured**. Voyage rate limit "3 RPM / 10K TPM… STRUCTURAL" (`CS5/docs/superpowers/BUILD-LEDGER.md` L207). Decks say "148 tests" — stale.
- **Artifacts:** **Product screenshots MISSING.** Available: `CS5/railcite/public/bholu.png` 520×647 (mascot), `icon-512.png`, `bholu-signal.mp4`; OG rendered by `app/opengraph-image.tsx` 1200×630; decks (1280×720, 78 slides): `CS5/decks/railcite-pitch-deck-templated.pdf`, `railcite-investor-deck-templated.pdf`, `railcite-architecture-flow-templated.pdf`, `railcite-discovery-prd.pdf`, `railcite-solution-prd.pdf`, `railcite-roadmap-vision.pdf`, `railcite-security-brief.pdf`. PRDs: `CS5/Discovery-PRD.md`, `CS5/Solution-PRD.md`, `CS5/Design.md`, `CS5/docs/final-prd.docx`. Data sample: `CS5/Data/COMMERCIAL MANUAL VOLUME II.pdf`.
- **Video:** MISSING — to be screen-recorded.
- **Learnings:** "staleness is not a missing feature — it is a correctness bug" (`RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md` L16-19); `claude-sonnet-5` rejecting `temperature` found only by live smoke (BUILD-LEDGER L234); threshold 0.45 → 0.32 (L253); "The feature is a citation. The product is trust." (`CS5/docs/linkedin/railcite-9day-linkedin-series.md` Day 5).
- **Authorship:** built with Claude Code (superpowers + impeccable artifacts); product models Claude Sonnet 5 / Haiku 4.5 + Voyage-3.
- **MISSING:** interview/user-testing record for "father + colleagues" (HITL "3 real CCI cases" still pending, BUILD-LEDGER L65) · usage/Mixpanel numbers · measured time-to-cited-answer · groundedness/retrieval/latency eval + dataset · product screenshots · mentor feedback · `QA-report.md` / `lesson-learnt.md` / `decisions.md` · fix record for P0 "starter refuses" · refreshed deck figures.

### 8.3 `cubicle`

- **Name / tagline:** Cubicle — "Your first team fits in a cubicle." (`CS6/Discovery-PRD.md:3`); "a hosted web app where a solo founder types a product idea and watches four AI teammates — PM, researcher, designer, developer — visibly collaborate to produce a one-page PRD, a competitor scan, landing-page copy, and a build plan, shareable by link, in about 90 seconds." (`:260`)
- **Tags:** AI · Multi-agent · Gemini · **Status:** code-complete offline prototype; **never run live, not deployed** (`CS6/QA-report.md:13`; `CS6/HANDOFF.md:3`). Deployment recommendation "CONDITIONALLY READY — STEPS REQUIRED".
- **Role:** **MISSING** — "Author | Product owner, Case Study 6 team"; brief says team of 6 (`CS6/Rethink Buildathon - 10 Days.pdf` p.2). Card must not claim solo.
- **Dates:** Buildathon Sept 7 → Sept 16, 2026; PRDs 8 Sept; Design/technical-plan 9 Sept; QA-report + lesson-learnt 12 Sept; 79 commits 2026-09-09 → 09-12.
- **Live:** MISSING. **Repo:** `https://github.com/007U5H4R/cubicle` — private (placeholder).
- **Stack (verified `CS6/cubicle/package.json`):** Next.js 16.3.4 (App Router, TS strict), React 19.2, Tailwind 4, `@google/genai` ^2.21, Supabase SSR + JS, zod 4.5, framer-motion 12, react-markdown + rehype-sanitize, Vitest 5, pnpm; CI: typecheck, lint, test, `check:outline`, gitleaks. Models `gemini-3.8-flash` agents / `gemini-3.5-flash-lite` orchestrator (`lib/config.ts:9-10`); Google Search grounding on competitor scan only; fallback prefix "From memory, unverified — could not reach search." (`lib/engine/deliver.ts:45`).
- **Architecture:** one streaming route `POST /api/runs`; debate protocol with speech acts `propose|question|objection|agree|done`; stop rules 6 msgs / 45 s / 70% tokens / repeat hash / hop=3; then four parallel artifact calls; "The database is the truth; the stream is a convenience." (`CS6/technical-plan.md:14`)
- **Problem:** "Solo builders have no team, so ideas die in the gap between thought and first artifact. The AI tools that could fill that gap either speak in one generic voice or hide their work…" (`CS6/Discovery-PRD.md:146`)
- **Users (quoted):** "Meet Aarav Mehta, 29, Bengaluru. Senior product analyst at a mid-size fintech… He has pasted the idea into ChatGPT three times and got three slightly different, equally generic PRDs that he never sent to anyone." (`:48`)
- **Show-the-Thinking chain:** Observation — six candidate problem spaces scored (§4.1). User problem — `:146`. Insight — "Nobody makes the collaboration visible. The word 'why' is missing from the whole table. That is the gap." (`:196`). Hypothesis — activation ≥60%, return ≥20%, share ≥25%/≥10%, reliability ≥95%, cost ≤$50 (§9). Product decision — "Trust first, ownership second, autonomy last… the opposite of how the red ocean is sequencing it" (`:338`); decisions S1–S6 (`CS6/decisions.md`). Prototype — offline build + dev harness `/dev/office`. Evaluation — 326 tests / 3 skipped; 97 TC rows (PASS 29 · BLOCKED 17 · Planned 48); QA gates Design PASS · Code PASS · Functional PASS (offline)/CONDITIONAL (live) · Security PASS WITH CONDITIONS (`CS6/QA-report.md:51,114-120`). Outcome — **no live run, no users**.
- **Metrics:** build-quality only (above); WCAG AA contrast ≥5.18:1 / ≥6.14:1 (`QA-report.md:14`). Cost/latency estimates "≈ $0.04", "50–75 s" are **unmeasured** (Solution-PRD `:256-262`).
- **Artifacts:** **No screenshots.** Decks `CS6/decks/discovery/Cubicle-Discovery-Pitch.pdf` (13 pp), `CS6/decks/solution/Cubicle-Solution-Pitch.pdf` (13 pp); `CS6/research-notes.md` (46 sources); full 12-stage artifact set at `CS6/` root.
- **Video:** MISSING — requires a live run.
- **Learnings:** L1 "Never trust jsdom for anything positional"; L2 client-only dev harness against recorded fixtures; L8 "never skip the human-style read-the-diff review just because the gate is green" (`CS6/lesson-learnt.md`).
- **Authorship:** built with Claude Code (full superpowers chain); product model Gemini.
- **MISSING:** live URL · deployment · any real end-to-end run · product metrics · 5 PM/founder interviews · team names + Tushar's named role · screenshots · `evals/` · final presentation deck · OG image.

### 8.4 `nuptis`

- **Name / tagline:** Nuptis — "Vendor Ops for Wedding Planning Agencies" (`CS3/Nuptis-PRD.md:3`).
- **Tags:** B2B · Vendor ops · Supabase · **Status:** Live (mock/local-first data); "PROJECT COMPLETE, DEPLOYED & ITERATING" (`CS3/memory.md:4`).
- **Role:** "Owner: (solo)" (`Nuptis-PRD.md:4`); "I just shipped my first product, solo — Nuptis" (`CS3/Nuptis-LinkedIn-Launch-Post.docx`). Framed as "a grounding/exploration project built alongside the actual Week 4 case study" (`:6`).
- **Dates:** Cohort Week 4 (Day 1 = 3 Aug 2026); Nuptis PRD 7 Aug; Figma NuptisV2 6 Aug; first commit 2026-08-08; last 2026-09-09 (README rewrite); 21 commits.
- **Live:** `https://nuptis.vercel.app/`. Figma: `https://www.figma.com/design/2hvOt6R9g9iseQxHXTDRpv/NuptisV2`. **Repo:** `https://github.com/007U5H4R/nuptis` — private (placeholder).
- **Stack (verified `CS3/Nuptis/package.json`):** React 18.3, react-router-dom 6.28 (HashRouter), Supabase JS 2.112, Vite 5.4, TypeScript 5.6; localStorage-first, context+reducer ("The reducer is the API surface"), optional Supabase mirror via 4 Postgres RPCs; 9-table schema (`CS3/Nuptis/supabase/schema.sql`); ~28 KB hand-written CSS. **No lint/test script** (`README.md:98`). **No AI** — `Assistant.tsx` is keyword-matching canned responses.
- **Problem:** "Wedding planning agencies run 15–30+ vendors across 5–7 ceremonies per wedding, coordinated over spreadsheets and WhatsApp threads, with no structured record of vendor verification status, active work orders, payment milestones, or backup coverage — so a single no-show or scope change turns into a scramble." (`Nuptis-PRD.md:18`)
- **Users:** Vendor Manager (primary), Event Manager (primary), Finance (secondary), Agency Owner (buyer) (`:39-44`).
- **Show-the-Thinking chain:** Observation — Week 4 brief: "vendor onboarding continues to remain slow, fragmented, and difficult to manage across teams" (`CS3/Case study __ Week 4 __ C8 - Our file.pdf`). User problem — `:18`. Insight — risk-tier verification: "spending three weeks vetting a card printer and two days vetting a fireworks vendor is backwards." (`CS3/Wedding-Vendor-Onboarding-Procurement-Process.md:19-27`). Hypothesis — North Star "% of high-risk work orders with a named backup assigned before the event date" (`:175`). Product decision — PRD §7 explicit cut list; "effort-tracks-points" reasoning (`CS3/PM Strategy Plan.md:11`). Prototype — live app; Figma 168 frames, 283 prototype reactions, 62 dual-mode tokens, AA audit (`CS3/DESIGN.md`). Evaluation — mobile sweep "9 routes swept @414px + 768px; 1 bug found+fixed" (ledger note); **no automated tests, no pilot**. Outcome — "No real pilot data yet. All three success metrics in §11 are defined but unmeasured." (`:201`) → killed in favour of Velora (Day 7).
- **Metrics:** none measured (state this).
- **Artifacts:** `CS3/Nuptis/docs/screenshots/{dashboard,onboarding,procurement,stage,contingency,contingency-drawer,payments,settings}.jpg` 1568×661; `wordmark.png` 767×181; `CS3/Nuptis/public/og-cover.png` 1200×630; logos `CS3/Nuptis-LM-transparent.png` etc. 1408×768; deck `CS3/Wedding-Vendor-Onboarding-Pitch-Deck.pptx` (14 slides); `CS3/Nuptis-PRD.md`, `CS3/DESIGN.md`.
- **Video:** MISSING — to be screen-recorded.
- **Learnings:** Self-feedback: "I think I need to improve on prompt engineering. How to use claude code effectively. How to make a full fledged prototype." (`CS3/Week 4 __ Toliyooo.xlsx` "Feedbacks for yourself" row 9). Process: Vercel subfolder deploy, OG tags, propagation (`CS3/memory.md:135-139`).
- **Authorship:** built with Claude Code (`CS3/memory.md` session log; self-feedback above).
- **MISSING:** pilot/usage data · analytics/event sheet (planned 8 Aug) · automated tests · mentor feedback · Excalidraw journey map export · public repo.

### 8.5 `velora`

- **Name / tagline:** Velora — "A B2B apparel sourcing marketplace where fashion brands and garment manufacturers swipe to connect, and matches turn into bids." (`CS3/Velora/PRD.md:3`)
- **Tags:** B2B · Marketplace · React 19 · **Status:** Live (mock data; "The live path was built but not run against a real project." `CS3/Velora/SUPABASE.md:67-71`).
- **Role:** "Owner: Tushar" (`PRD.md:5`); "You're working solo, starting from zero today." (`CS3/PM Strategy Plan.md:7`). Team submission "TrustBridge" (`CS3/CASE STUDY 3 PRD.pdf`) lists "Tushar Pathak | Nuptis / Velora" under §7 prototype links.
- **Dates:** Velora PRD 10 Aug 2026; all 40+ build commits 2026-08-11 (one-day build); Discovery PRD 12 Aug; last commit 2026-09-09; 46 commits.
- **Live:** `https://velora-nu-eight.vercel.app/` (also `https://velora-8mzf-eight.vercel.app/`). **Repo:** `https://github.com/007U5H4R/velora` — private (placeholder). Figma URL MISSING.
- **Stack (verified `CS3/Velora/app/package.json`):** React 19.2, react-router-dom 7.18, framer-motion 13, zustand 5, Supabase JS 2.112, lucide-react, Fraunces/Inter; Vite 8.2, TS 6.0, vitest 4.1, oxlint. Single Zustand store, env-gated Supabase with mock fallback, CSS Modules, PhoneFrame shell; 7-table schema. **No AI**; "Trust Scores are authored, shown as if verified" (`PRD.md:80`).
- **Problem:** "Discovery today is broken: founders find manufacturers through cold referrals, trade fairs, or Alibaba-style directories where trust is unverified and non-portable." (`PRD.md:11`)
- **Users (quoted):** Brand (Buyer): "Indie / D2C apparel founder sourcing production. Small MOQs, sustainability-led"; Manufacturer (Vendor): "Garment factory / supplier (e.g. Tiruppur, Ludhiana, Bengaluru)." (`PRD.md:23-24`)
- **Show-the-Thinking chain:** Observation — procurement interviews (team-pooled; 7 rows, `CASE STUDY 3 PRD.pdf` p.10): "I find out where a vendor is by asking around." · "We scrutinise new vendors. Changes to old ones, we just… trust." User problem — `PRD.md:11`. Insight — "Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs" vs "APQC median 3.0 days" (team PDF p.7). Hypothesis — H1 "The biggest delay is caused by coordination between teams, not by one team working slowly."; Discovery PRD confidence tags [Known]/[Observed]/[Hypothesized]/[Validated]/[Unknown] (`CS3/Apparel-Vendor-Onboarding-Discovery-PRD.docx`). Product decision — pivot: "Weddings were blue — but a shallow pool… the same trust problem, aimed at apparel vendor onboarding." (LinkedIn Day 7); Red/Blue Ocean + ERRC (team PDF pp.11-12). Prototype — live app, one-day build. Evaluation — `npx vitest run` 10/10 passed (2026-09-15); final review "0 horizontal overflow at 375 and 768 on every route", bundle 500.63 kB / 156 kB gzip (`CS3/Velora/.superpowers/sdd/2026-08-11-velora-mvp/reports/task-6.3-review.md`). Outcome — "Nine days. Two products. One survived." (Day 9); no users.
- **Metrics:** 10/10 unit tests (2026-09-15); team baseline table (15–30 days, <10% active work, 2–5× resubmission) is secondary research marked "verify before external use" (team PDF p.18) — **do not present as own data**.
- **Artifacts:** `CS3/Velora/docs/screenshots/{role-select,discover,trust-profile,rfps,bids,chat,profile}.jpg` 716–720×1070; `hero.jpg` 720×455; `CS3/Velora/app/public/og-cover.png` 1200×630; art `CS3/Velora/assets/mandala-gold.png` 1400×1097, `cert-badge-gold.png` 626×626, `kalighat-parrot.png` 501×626; `CS3/Velora/PRD.md`, `CS3/Velora/design-system.md`.
- **Video:** MISSING — to be screen-recorded.
- **Learnings:** kill decision (Day 7/9); Discovery PRD rule "Nothing below presents a hypothesis as a validated fact."
- **Authorship:** built with Claude Code (`.superpowers/sdd/` artifacts).
- **MISSING:** usage/pilot data · Tushar-attributed interviews (apparel-side interviews "planned, not yet run") · mentor feedback · Figma URL · public repo · live Supabase validation.

### 8.6 `bhakti-vilas`

- **Name / tagline:** Bhakti Vilas (भक्ति Vilas) — "An interactive prototype for… an elder-focused wellness platform for India built around bhajan… positioned as devotion-as-behavioral-health rather than a clinical wellness app." (`CS2/Bhakti-Vilas/README.md`)
- **Tags:** Prototype · Health · Team · **Status:** Live prototype, mock data ("No database, no backend, no build step").
- **Role:** team build — 8 commits all 2026-08-01, authors 5 × Tushar (007U5H4R), 3 × Shivali; Tushar's named contribution to the case: "Tier-wise segmentation, hypotheses → refined hypotheses, persona interview guides" (`CS2/Team-Research-Synthesis.md`); Tushar's own solution doc = Madhu Mukti (`CS2/Converging Results/[Tushar] 3-4 pager solution.docx`).
- **Dates:** Week 3, 26 Jul–1 Aug 2026; team PRD 2026-08-03.
- **Live:** `https://bhakti-vilas.vercel.app/` (→ `/bhakti_wellness_home/code.html`). **Repo:** `https://github.com/teenytinybot/Bhakti-Vilas` (org account; visibility unverified — placeholder).
- **Stack (verified):** 4 static HTML pages + vanilla JS (`app.js` 65 KB, `app-pages.js` 86 KB, `auth.js`, Web Audio synth, i18n engine), Tailwind CDN, sessionStorage state, fake phone+OTP login; "Grew out of a Stitch (Google) design export" (`CS2/Bhakti-Vilas/memory.md`). **No AI.** No tests.
- **Problem:** "India's elder-care ecosystem has no trusted, independent, verifiable layer of accountability…" (`CS2/India-Elder-Care-Case-Study.md`); Tushar's refined hypothesis: "long-distance adult children… experience chronic anxiety… forcing the family itself to act as the system integrator despite being the stakeholder least present to do it." (`CS2/Week 3 C8 Token Toli.xlsx` tab "Tushar")
- **Users (quoted):** team survey (Prashant's pod): "family survey (two waves, n=23 deep-dive + n=47 broad), the healthcare-workers survey (n=12)… 9 elder personas + 3 expert interviews" (`CS2/Elder_Care_Problem_Hypotheses.md.pdf`); "only 60% agreed to pay even ₹200/month".
- **Show-the-Thinking chain:** Observation — brief: "The market doesn't appear to have a shortage of products. It appears to have a shortage of clarity" (`CS2/Case Study 2 - C8_…docx`). User problem — above. Insight — "Distance was never the variable. Availability was." (`CS2/LinkedIn-7-Day-Journey-Series.md` Day 3); "financial burden ranked dead last as a challenge (1 of 70 mentions)" (`CS2/Category-Hypotheses.md`). Hypothesis — 5 categories / 10 hypotheses (`Category-Hypotheses.md`); "Insure the visit, don't vet the person." (`CS2/Refined-Hypothesis-and-Lateral-Solution.md`). Product decision — Madhu Mukti: "the health meaning is coded, not front-loaded"; WhatsApp-first, temple walks; team PRD's 5 design principles restate Tushar's almost verbatim (`CS2/Case Study 2 PRD.pdf`). Prototype — Bhakti Vilas live; verified flows: session booking learn → date → circle map → payment → QR pass; mobile audit 390×844 / 360×800 no console errors (`memory.md`). Evaluation — mentor's three questions answered with 11 sources; caveat "a well-evidenced hypothesis with real mechanisms, not a proven guarantee" (`CS2/Bhakti-Vilas/Why-Bhakti-Mentor-QA.md`). Outcome — "Shipped Bhakti Vilas — a working prototype, live and deployed, not a deck." (Day 7); no users/metrics.
- **Metrics:** team survey numbers only; product metrics MISSING. Staged-reveal funnel 100% → ~60% → ~25% → ~10% is "directional estimates, not measured data".
- **Artifacts:** `CS2/Madhu-Mukti-TOFU-MOFU-BOFU-Funnel.png` 1600×924 (+ .svg); `CS2/Bhakti-Vilas/assets/tea-circle.jpg` 1536×1024, `morning-bhajan.jpg`, `temple-walk-group.jpg`, `kirtan-dance.jpg` 1400×933; `CS2/Bhakti-Vilas/bhakti_wellness_home/diabetes-cardio.png` 1536×1024. **UI screenshots MISSING — capture from live URL.**
- **Video:** MISSING.
- **Learnings:** README gaps: "Translation coverage is partial (~90 of ~500 strings)"; "Medical copy is unreviewed" — disclose on the case page.
- **Authorship:** docs are Tushar-directed, AI-assisted synthesis (`CS2/skills.md`) — "built with Claude Code".
- **MISSING:** UI screenshots · usage/analytics · tests · team PRD authors · mentor grade text · interviews fielded by Tushar himself (guides only).

### 8.7 `token-toli` (discovery-only)

- **Name / tagline:** Token Toli — Week 2 "Discovering India's Convenience Economy"; Tushar's pod output: "Discovery PRD — Ageing-in-Place Care Orchestration for Long-Distance Families / Gursimran Singh • Tushar Pathak • Suyash P / 25th July 2026" (`CS1/Discovery PRD-2.pdf` cover).
- **Tags:** Discovery · Research · Healthcare · **Status:** research artifacts only; no product, no code, no deployed artifact.
- **Role:** co-author of the Guru-pod PRD (3 names); team member on the selected lending PRD (Piyush's pod). "Day 6 — Watching my own idea lose… We picked a teammate's, Piyush's" (`CS1/LinkedIn Posts - 7 Day Series.docx`). Rotating PM/APM slot "9th Aug - 15th Aug | Tushar & DJ" (`CS1/Token Toli -W2- C8.xlsx` "PMAPM").
- **Dates:** 20–25 July 2026.
- **Live / repo:** none.
- **Stack:** n/a.
- **Problem:** "Who: Adult children living away from ageing parents… Problem: They lack a trusted, medically informed view of their parent's health and care. Why: Existing solutions coordinate services but do not prioritize medical accountability and reporting." (p.30)
- **Users (quoted):** "My mother always says, 'Everything is fine.' I only discover later that she skipped a test or forgot to take a medicine." — Priya Nair (38), PM, Bengaluru · "The biggest issue isn't getting elderly patients to the clinic. It's ensuring someone remembers and follows the treatment plan." — Dr. Neha Kapoor (46) · "I wanted peace of mind, not another booking platform." — Vikram Singh (40) (pp.25-27; 11 named respondents; **explicit count MISSING**).
- **Show-the-Thinking chain:** Observation — brief "for gig workers, through gig workers, or because of gig workers" (`CS1/Week 2 _ Case Study 1 _ C8_…pdf`). User problem — p.30. Insight — "The binding constraint is trust, not demand." (p.27); surprise "Transportation was rarely viewed as the biggest problem despite initial assumptions." (p.29). Hypothesis — H1.1 medically informed accountability — Validated; H1.2 episodic demand/retainer — Partially Validated; H1.3 acute events → higher WTP — Validated (p.30). Product decision — "Focus the MVP on a medically informed accountability layer for chronic care, sold as a monthly subscription to distant adult children, with guaranteed emergency response as the key trust-building differentiator." (p.20); sizing "3.6M addressable households… ≈ ₹2–6 lakh crore TAM" (p.31). Prototype — none. Evaluation — self-critique column: "Before pitching this to anyone, you need 20-30 structured interviews…" (xlsx tab "Tushar"). Outcome — not selected by the team; concept carried into Week 3 (CS2).
- **Metrics:** interview counts only; team PRD "44 interviews" (`CS1/Final Submission/Week1_Token_Toli_Discovery_PRD.pdf` p.7) — **team work, not Tushar's own; deck says "44+ … 70+" (inconsistent)**.
- **Artifacts:** `CS1/Discovery PRD-2.pdf` (33 pp; Figs 1–8 embedded only); `CS1/Token Toli -W2- C8.xlsx` (40 research questions, 6 improved hypotheses); team `CS1/Final Submission/Week1_Token_Toli_Discovery_PRD.pdf`, `Week1_Token _Toli_PPT.html`. **No standalone images.**
- **Video:** n/a.
- **Learnings:** "Day 7 — Performing the problem instead of presenting it" (LinkedIn series).
- **Authorship:** `CS1/skills.md` is an AI-session log — "authored with Claude Code" for the synthesis.
- **MISSING:** explicit interview count for Tushar's pod · author page on team PRD · mentor feedback/score · standalone figures · section attribution.

### 8.8 `pratyasa`

- **Name / tagline:** Pratyasa — "A public, fast, self-contained web page that showcases granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — as a credible record of work" (`PT/discoveryPRD.md` Goal).
- **Tags:** Patent · Static · Record · **Status:** Live.
- **Role:** co-inventor (2nd of 5): "I worked across the portable analyser's electronics and firmware, the Android application, sensor preparation, and the validation testing in blood and food samples." (`PT/discoveryPRD.md` L192); page author "Tushar Pathak (with Claude)".
- **Dates:** PRD rev 2 2026-08-24; commits 2026-08-24 → 2026-09-09 (13).
- **Live:** `https://pratyasa.vercel.app`. **Repo:** `https://github.com/007U5H4R/pratyasa` (visibility unverified — placeholder).
- **Stack:** HTML5 + CSS custom properties/grid + vanilla JS + Web App Manifest; zero third-party requests; system fonts; facts enforced by `PT/pratyasa-site/verify-facts.py` (REQUIRED tokens list L267).
- **Problem:** "The invention is real, the prototype exists, the science is published… What is missing is any presentable record of it — no page, no narrative, nowhere to point someone who asks." (§1)
- **Users:** "Recruiters, potential collaborators, colleagues, and the occasional company or investor… *what did you actually build?*" (§3)
- **Show-the-Thinking chain:** Observation — no presentable record. User problem — §1. Insight — rev 1 was "a sales page for patent buyers"; brainstorming established "a general credibility page" (What changed in rev 2). Hypothesis — n/a (record, not product). Product decision — "Attribution framing: contributor, not owner… must remain true when a reader clicks through to the paper"; safety framing "research prototype, not an approved or regulated diagnostic device". Prototype — live page. Evaluation — mechanical fact checker. Outcome — live; linked from cinematic portfolio work card.
- **Metrics (device, from paper — not product metrics):** LOD 10 ag mL⁻¹; linear range 10 ag → 10 ng mL⁻¹; 8.2% RSD; 71% signal after 100 CV cycles; validated in whole blood, mayonnaise, fruit juice (§4).
- **Artifacts:** `PT/pratyasa-site/assets/device-photo.jpg` 1600×900 · `case-framed.webp` 1000×856 · `device-cutout.webp` 1400×631 · `certificate.jpg` 848×1200 · `langmuir-cover.jpg` 421×560 · `demo-poster.jpg` 1280×720 · `og-cover.png` 1200×630 · `wordmark.webp` 786×75; `PT/pratyasa-framed.png` 1042×892.
- **Video:** `PT/pratyasa-site/assets/demo.mp4` (device footage). Product screen-recording not needed.
- **Learnings:** "ffmpeg has no drawtext… use Chrome headless for text-bearing images" (Global Constraints).
- **Authorship:** built with Claude Code.
- **MISSING:** none blocking; Soft Matter paper DOI for the Research section.

### 8.9 `tegaki`

- **Name / tagline:** Tegaki (手書き) — "What your handwriting suggests about you — read and written by hand." (`GR/README.md`)
- **Tags:** D2C · Supabase RLS · Pilot · **Status:** Live pilot ("the checkout confirms an order without charging for it").
- **Role:** "Owner: Tushar Pathak · Scribe: Claude" (`GR/Discovery-PRD.md`); productizes Tushar's manual handwriting-analysis practice.
- **Dates:** Discovery/Solution PRD 2026-09-01; commits 2026-09-01 → 2026-09-09 (56).
- **Live:** `https://tegaki-one.vercel.app`. **Repo:** `https://github.com/007U5H4R/tegaki` (visibility unverified — placeholder).
- **Stack (verified `GR/package.json`):** Next.js 16.3.3, React 19.2, Tailwind 4, Supabase JS 2.112 (Google Auth, 18 migrations with RLS, buyer-scoped storage, signed-URL delivery), Vercel Cron retention job, vitest 4 + Playwright 1.62 (31 test files). CI honesty guard `check-claims`. **No AI in product** (report generation is manual/offline; Master Prompt v2.0 is internal IP).
- **Problem:** "The platform productizes what is today a fully manual practice (analysis → Master Prompt v2.0 → polished report docx/PDF)." (`GR/Discovery-PRD.md` §1); pilot question "*would a stranger trust and pay for this experience?*" (`GR/Solution-PRD.md` §1)
- **Users:** "Indian consumers seeking personal insight / self-discovery, paying ₹999–₹2,999 via UPI" (`Discovery-PRD.md` §3).
- **Show-the-Thinking chain:** Observation — existing manual practice + sample reports (§2). User problem — §1. Insight — "The operator half is unspecified (biggest gap)… Turnaround promises live or die in… the admin surface" (§5.1). Hypothesis — "5–10 pilot users complete the loop" (Solution-PRD §2). Product decision — pilot reframe: gateway/domain/email deferred; "readings are indicative and growth-oriented, never a diagnosis" enforced in CI (README). Prototype — live. Evaluation — 31 test files; sample guardrails enforced "in the browser, the server action, *and* the database CHECK constraints" (README). Outcome — **no pilot users recorded**.
- **Metrics:** MISSING (pilot counts, orders).
- **Artifacts:** `GR/docs/screenshots/{hero,how-it-works,anatomy,report-excerpt,pricing,sign-in}.jpg` 1568×661; `wordmark.png` 864×208; `GR/public/og-cover.png` 1200×630; `GR/public/hero-poster.jpg` 1600×900.
- **Video:** MISSING — to be screen-recorded.
- **Learnings:** none recorded (no lesson-learnt file seen).
- **Authorship:** built with Claude Code.
- **MISSING:** pilot user/order counts · lesson-learnt · anonymised sample report consent · deeper audit (out of this audit's depth).

### 8.10 `dino-arcade-pwa`

- **Name / tagline:** Dino Arcade — "A mobile-first Progressive Web App that turns your phone into an arcade cabinet… styled as a backlit cabinet with a marquee, recessed bezel, CRT shader, and an on-screen beat-'em-up controller." (`DN/README.md`)
- **Tags:** PWA · Offline · EmulatorJS · **Status:** Live.
- **Role:** "Owner: Tushar Pathak · Personal / hobby project" (PRD in `Game/`; do not link that folder).
- **Dates:** 3 commits 2026-09-06 → 09-07.
- **Live:** `https://007u5h4r.github.io/dino-arcade-pwa/`. **Repo:** `https://github.com/007U5H4R/dino-arcade-pwa` (GitHub Pages → public).
- **Stack:** static HTML/CSS/JS; vendored EmulatorJS 4.2.3 + FBNeo core self-hosted; IndexedDB ROM storage; service worker precache; "No backend… No accounts, no servers, no analytics."
- **Problem / decision:** "This app ships no game data. No ROM or BIOS is included… You are responsible for supplying a game file you are legally entitled to use." — BYO-ROM framing is the load-bearing product decision (README).
- **Users:** personal.
- **Chain:** minimal — Observation (phone as cabinet) → decision (BYO-ROM, offline-first) → prototype (live) → evaluation (`DN/test/` exists; results MISSING) → outcome (live).
- **Metrics:** none.
- **Artifacts:** `DN/assets/icon-512.png` 512×512; **screenshot MISSING**.
- **Video:** MISSING.
- **Authorship:** built with Claude Code (planning artifacts in `Game/`).
- **MISSING:** screenshot · test results · note: keep public framing to "BYO-ROM" (licensing caveat, `AUDIT` §7).

### 8.11 `cinematic-portfolio`

- **Name / tagline:** "TUSHAR PATHAK, a scroll film" — "A cinematic '3D scroll' personal portfolio… AI-generated film of Tushar as the backdrop, scroll-driven like an Apple product page." (`CN/PRD.md`)
- **Tags:** Motion · Static · Higgsfield · **Status:** Live since 2026-08-26.
- **Role:** "Author: Tushar Pathak (with Claude)".
- **Dates:** PRD 2026-08-25; built 08-25; deployed 08-26.
- **Live:** `https://tushar-pathak.vercel.app/`. **Repo:** `https://github.com/007U5H4R/cinematic-portfolio` (PUBLIC).
- **Stack:** static HTML + CSS + vanilla JS, no build step; Lenis + Google Fonts via CDN with fallbacks; 289 scrub frames; film via Higgsfield (Seedance 2.5, Nano Banana Pro still), ffmpeg/Chrome post-processing.
- **Decision chain:** Observation — recruiters ask "who is Tushar Pathak?" → decision: film-as-backdrop, `prefers-reduced-motion` static fallback → evaluation: QA-A 8/8, QA-B 11/11, QA-C 12/12; scrub benchmark mean 0.04 ms/frame, 0 frames >16 ms; final review 1 Critical + 2 Important fixed (`CN/ledger.md`) → outcome: live, OG verified.
- **Metrics:** film cost 197 credits exactly as preflighted (`CN/ledger.md`); stats shown on that site "7+ · 40+ · 180+ · 30%" trace to `RESUME` (years, microservices, stories, cycle-time).
- **Artifacts:** `CN/assets/stills/hero-still.png` 2752×1536; posters `CN/assets/posters/{hero,work,close}.jpg` 1280×720; `CN/assets/og-cover.png` 1200×630; clips `CN/assets/film/hero-orbit.mp4` (12.0 s), `work-desk.mp4`, `close-walk.mp4`.
- **Video:** the site itself; screen-recording MISSING.
- **Learnings:** Higgsfield plan gating, refunds on failed render, start_image vs reference (`CN/ledger.md`; memory `higgsfield-mcp-gotchas.md`).
- **Authorship:** built with Claude Code.
- **MISSING:** LinkedIn Post Inspector / opengraph.xyz human check never recorded (`MEM`).

---

## 9. Ask-AI `KnowledgeIndex` (deterministic Q→A; ≤3 sentences; facts only from VERIFIED rows)

| Prompt | Answer | Evidence links | Status |
|---|---|---|---|
| What products have you built? | Since August 2026 I've shipped TeachSpark (a WhatsApp bot that generates differentiated worksheets for Indian K–12 teachers), RailCite (a cite-or-refuse assistant over Indian Railways circulars), and two vendor-onboarding products, Nuptis and Velora, in nine days. Smaller live builds include Tegaki, Pratyasa, a PWA arcade cabinet and a scroll-film portfolio. Cubicle, a multi-agent "AI team", is built but not yet launched. | `/work/teachspark` · `/work/railcite` · `/work/velora` | DRAFT (sources: `TS/README.md:3`; `CS5/Discovery-PRD.md` L3-5; `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx` Day 9; `CS6/QA-report.md:13`) |
| How do you approach product discovery? | I start from a real person and a specific moment — a Sanskrit teacher's evenings, a CCI defending a demurrage decision — then write the hypothesis down with its confidence level before building. In the vendor-onboarding work every claim was tagged [Known]/[Observed]/[Hypothesized]/[Validated]/[Unknown], and in TeachSpark eight assumptions were listed with type and risk before a line of code. When the evidence says kill it, I kill it — Nuptis died on day seven. | `/work/velora#03-discovery` · `/work/teachspark#03-discovery` · `/thinking` (Killing Nuptis) | DRAFT (sources: `CS4/pitch/teachspark-pitch.pdf` slide 13; `CS3/Apparel-Vendor-Onboarding-Discovery-PRD.docx`; Discovery PRD A1–A8; LinkedIn Day 7) |
| What AI products have you worked on? | TeachSpark uses Claude Sonnet 5 with structured outputs, vision on teacher-sent photos and a second QC pass to produce worksheets and question papers over WhatsApp. RailCite is a retrieval system over 5,700+ government PDFs (Voyage-3 embeddings, pgvector) with extractive Claude synthesis and a validator that drops any uncited claim. At American Express I led the integration of Devin GenAI into the MARS platform. | `/work/teachspark#05-what-i-built` · `/work/railcite#05-what-i-built` · `/about#experience` | DRAFT (sources: `TS/src/adapters/anthropic-paper.ts`; `RC/lib/validate.ts`; `RESUME`) |
| Show me your most technical project. | RailCite: a Next.js + Supabase/pgvector RAG pipeline that ingests and OCRs thousands of scanned railway circulars nightly, classifies query domain with Haiku, retrieves k=8 above a calibrated 0.32 threshold, and forces Claude into an `answered|refused` tool schema whose citations are validated before display. It runs live with 5,760 documents and 14,406 chunks (as of 15 Sep 2026) and 345 passing tests. | `/work/railcite` · `https://railcite.vercel.app` · `/work/railcite#06-evaluation` | DRAFT (sources: `RC/app/api/query/route.ts`; `RC/scripts/calibrate.ts`; `AUDIT` §5 tests) |
| What impact have you created? | At American Express I own the migration roadmap for 35+ Accounts Receivable capabilities — 180+ stories across four Agile teams — with a 30% reduction in feature delivery cycle time (self-reported). TeachSpark's first-week pilot (24 Aug 2026, test handsets excluded) took 17 teachers onto WhatsApp, activated 8, and saved a median 37.5 minutes per teacher by their own report. RailCite keeps 5,760 government documents searchable with zero invented citations by construction. | `/about#impact` · `/work/teachspark#07-outcome` · `/work/railcite#07-outcome` | DRAFT (sources: `RESUME`; `CS4/docs/final-prd.docx` §7; `RC/lib/validate.ts`) |
| What makes Tushar a product manager? | Ten years across product and delivery — Godrej Smartnet, Quantiphi's GCP programs, Shellkode, and now Senior Product Manager at American Express — plus a habit of building the thing myself to test the idea. I write the hypothesis before the feature, publish smaller honest numbers over bigger fake ones, and design refusal as a success state when trust is the product. | `/about` · `/thinking` · `/work` | DRAFT (sources: `RESUME` timeline 2016–present; `TS/docs/linkedin/9-day-build-series.md`; `CS5/Design.md` L21-24). **Note:** "Ten years" spans 2016–2026 including the 2019–22 study gap; resume says "7+ years" — use "7+ years" unless Tushar prefers otherwise. |
| Show enterprise experience | American Express (via IntraEdge), 2026–present: Senior PM for Accounts Receivable, migrating 35+ capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform and championing Devin GenAI adoption. Quantiphi (2022–26): GCP programs including DynamoDB→Cloud Spanner migrations and HIPAA-compliant healthcare data migration. Godrej Infotech (2016–18): Assistant PM on the Smartnet platform, 12 features in 11 months. | `/about#experience` · `/work?tab=enterprise` | DRAFT (source: `RESUME`) |
| Strongest product skills | Discovery and hypothesis framing (confidence-tagged PRDs, assumption tables), AI product design where trust is the feature (cite-or-refuse, QC passes, honest instrumentation), and enterprise delivery at scale (roadmaps across four Agile teams, program governance on GCP/AWS). | `/about#capabilities` · `/work/railcite` · `/work/teachspark#06-evaluation` | DRAFT (sources: `RESUME` Core Competencies; `CS5/Design.md`; `CS4/docs/final-prd.docx`) |

---

## 10. Consolidated MISSING / needs-Tushar checklist

**Decisions (blocking copy):**
- [ ] TeachSpark canonical metrics date: 2026-08-24 Final-PRD (recommended) vs 2026-08-26 pitch.
- [ ] RailCite corpus figure: live-with-date (recommended) vs Final-PRD 7 Sep snapshot.
- [ ] How to present "American Express (via IntraEdge)" (resume) vs "American Express" (`PORT`).
- [ ] FilterTabs bucket for Token Toli / Pratyasa / Bhakti-Vilas (add "Discovery" tab or Experiments).
- [ ] Years-of-experience wording ("7+" per resume) and framing of the 2019–2022 gap (M.Tech + research).
- [ ] Sign-off on all 5 `/thinking` candidate titles and all 8 `KnowledgeIndex` answers.

**Assets to produce (Tushar or a capture session):**
- [ ] Sanitised resume PDF (remove DOB/phone/address; correct Patent No. to 429867).
- [ ] RailCite product screenshots (none exist) + screen-recorded demo.
- [ ] Bhakti-Vilas UI screenshots from live URL.
- [ ] TeachSpark product screenshots pulled from `origin/main` (`docs/screenshots/`) + web-compressed demo video (42.85 MB mp4 → poster + ≤8 MB clip).
- [ ] Demo videos for Nuptis, Velora, Tegaki, dino-arcade-pwa, cinematic-portfolio (screen-record).
- [ ] Cubicle: deploy + first live run before any screenshot/video; otherwise keep "Built, not launched".
- [ ] Icons: Cubicle, Token Toli (no images exist).
- [ ] Hero photo dimensions / a higher-res portrait if `photo.jpg` is small.
- [ ] Award certificates (3) if they are to be shown as images.
- [ ] Soft Matter (2023) paper DOI + author order.

**Facts nobody has recorded (publish as absent, not invented):**
- [ ] Any user interviews Tushar personally ran (TeachSpark planned 8–12: none; RailCite "father + colleagues": unrecorded; CS3: team-pooled; CS1 Guru pod: named respondents, count unstated).
- [ ] Pilot/usage data for Nuptis, Velora, Bhakti-Vilas, Tegaki, Cubicle (none).
- [ ] TeachSpark retention curve, K-factor, teacher testimonials, LLM output-quality evals; current Railway uptime.
- [ ] RailCite Mixpanel/usage numbers, measured time-to-cited-answer, groundedness/retrieval/latency evals, mentor feedback, fix record for P0 "starter refuses".
- [ ] Cubicle team names and Tushar's named role.
- [ ] Mentor grades/feedback for every case except TeachSpark.
- [ ] Any external validation of resume metrics (all self-reported).
- [ ] Shellkode / Quantiphi / Godrej scale numbers (clients, team size) beyond what the resume states.
- [ ] Public GitHub links: all product repos private except cinematic-portfolio and dino-arcade-pwa — decide "on request" placeholder vs making repos public.

**Never publish (hard rule):** TeachSpark sandbox join code (`TS/docs/pilot/pitch.md:15`) · any `.env` value · anything under `Game/neogeo/` · DOB/phone/address · PMP/SAFe-Agilist certification claims · "AI Product Manager" as a title.
