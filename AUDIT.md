# Portfolio Source Audit — Tushar Pathak

Compiled 2026-09-15 for the clay portfolio build (brief: `~/Downloads/prompt.md` §02, §45, §49). Everything below was verified against the resume, the local repos, the authenticated GitHub API, the files in `~/Downloads`, and live HTTP checks on 2026-09-15. Nothing is inferred; gaps are marked MISSING.

**Structure:** Part A — executive summary · Part B — GitHub account audit · Part C — assets & document audit · Part D — live URL checks · Part E — fact conflicts · Part F — full local repository & PRD audit (verbatim, per-project, with paths and quotes).

---

## Part A — Executive summary

| Project | What | Status (2026-09-15) | AI? | Evidence strength |
|---|---|---|---|---|
| **TeachSpark** | WhatsApp bot; Claude generates differentiated worksheets / question papers for Indian K-12 teachers | Deployed on Railway (HTTP 200); pilot Aug 19–29; private repo | Yes | **Strongest**: scored assumptions → shipped product → real pilot funnel → iteration → mentor feedback |
| **RailCite** | Cite-or-refuse RAG over Indian Railways commercial circulars for Chief Commercial Inspectors | Live (HTTP 200), nightly crawl, 5,760 docs / 14,406 chunks; private repo | Yes | Strong engineering (345/348 tests run today, calibration data); no screenshots, no usage data |
| **Cubicle** | Multi-agent "AI team" (PM/researcher/designer/dev) that debates visibly and emits PRD/scan/copy/plan | Code-complete, never run live, not deployed; commits stop 09-12 | Yes | Rigorous research + 326 tests; no images, no users, Tushar's role unrecorded |
| Nuptis → Velora | Wedding vendor-ops app → documented kill/pivot to B2B apparel sourcing; two live products in 9 days | Both live, mock data | No | Best PM-judgment narrative; screenshot-ready; no usage data |
| Token Toli · Elder Care / Bhakti-Vilas | Discovery-only case studies | Research / static prototype (Bhakti-Vilas live) | No | Good supporting discovery material; no product |
| Pratyasa · Tegaki · dino-arcade · cinematic-portfolio | Patented biosensor site · handwriting product · arcade PWA · current live portfolio | All live | — | Playground candidates |

**Recommended featured three:** TeachSpark · RailCite · Nuptis→Velora (Cubicle only if deployed with screenshots) — accepted as decision S3.

**Professional experience (resume-verified):** American Express (via IntraEdge) Senior PM, Jun 2026–present — Triumph→MARS migration, 35+ AR capabilities, 180+ stories across 4 Agile teams, −30 % cycle time, 40+ microservices/APIs, Devin GenAI adoption (−30 % dev effort, +25 % productivity) · Shellkode TPM Apr–Jun 2026 (Pulse adoption, delivery governance) · Quantiphi TPM Aug 2022–Apr 2026 (DynamoDB→Spanner, HIPAA migrations, GCP enablement) · Godrej Infotech APM Sep 2016–Dec 2018 (Smartnet: 12 features in 11 months, +25 % monitoring, +30 % productivity, −20 % turnaround). Patent (No. 429867), 2 papers (Langmuir 2025, Soft Matter 2023), awards (Google Cloud Partner All-Star 2024, Quantiphi Unsung Hero 2024, Godrej 12-in-11 2018). M.Tech NIT Calicut 2022, B.E. BIT Durg 2016.

---

## Part B — GitHub account audit (`github.com/007U5H4R`, authenticated + public API)

- Account created 2026-08-01 · profile name/bio/location empty · 0 followers.
- **Public repos: 2** — `cinematic-portfolio` (created 08-26, pushed 09-09, homepage tushar-pathak.vercel.app; PRD.md, Design.md, plan.md, 5 screenshots, 289 frames, README says "Enterprise Product Leader — GenAI & Cloud", work cards Pratyasa / Triumph→MARS / Devin GenAI / this portfolio) and `dino-arcade-pwa` (created 09-06, GH Pages, no screenshots, bring-your-own-ROM).
- **Private repos (verified via `gh repo view`):** `railcite` (homepage railcite.vercel.app, pushed 09-09), `teachspark` (homepage teachspark-production.up.railway.app, pushed 09-09), `cubicle` (no homepage, pushed 09-12). All three 404 for the public → code links must stay hidden until visibility flips (decision S5).
- Local checkouts: `Case Study 5/railcite` is a stale ancestor of `railcite-cron` (105 commits, `build/phase5`) — **`railcite-cron` is canonical**. `Case Study 4/teachspark` and `Case Study 6/cubicle` match their remotes.

## Part C — Assets & documents audit

- **Avatar:** brief says "use my supplied claymorphism avatar" — **none exists**. Only `portfolio/photo.jpg` (real photo: short dark hair, full beard, grey blazer over dark tee, blue textured background). Decision S4: generate from photo.jpg (Higgsfield identity reference already uploaded from the cinematic build).
- `~/Downloads` images: Sep-1 ChatGPT ×3 = handwritten-notebook stock shots (not avatar); **Sep-8 ChatGPT ×6 = Cubicle artifacts** — architecture (Next.js run engine · model gateway · Gemini Flash + Google Search · Supabase Postgres/Auth/RLS), Double Diamond → "Cubicle MVP", strategic value canvas vs ChatGPT/ChatPRD/Lovable/Manus, isometric "AI Office" illustration, run pipeline (queue guard → agent debate ≤45 s/6 msgs → 4 parallel artifacts → persist), ERD (anon_sessions, runs, messages, artifacts, events); `ok.png` = LinkedIn banner ("PMP Certified · SAFe Agilist · Google Delivery Excellence Awardee" — **PMP/SAFe not in resume → excluded**); Gemini/WhatsApp images and `aLt5…png` unrelated.
- `~/Downloads/Documents`: `Discovery PRD.pdf` = `Discovery PRD-2.pdf` = `Tushar Discovery PRD.pdf` (Case Study 1 Guru-pod "Ageing-in-Place Care Orchestration" PRD, 33 pp); `Tushar's PRD_ TechSpark.pdf` (TeachSpark); `Samarth_Elder_Care_Complaint_Research_Summary.md` (Case Study 2 research).
- Cinematic build assets (`portfolio/cinematic/assets`): hero-still.png, three film loops, posters, og-cover.png, 289 scrub frames — reusable only for the `/playground` cinematic entry.

## Part D — Live URL checks (2026-09-15, `curl -L`)

| URL | Status |
|---|---|
| https://railcite.vercel.app | 200 |
| https://teachspark-production.up.railway.app | 200 |
| https://pratyasa.vercel.app | 200 |
| https://tushar-pathak.vercel.app | 200 |
| nuptis.vercel.app · velora-nu-eight.vercel.app · bhakti-vilas.vercel.app · tegaki-one.vercel.app | 200 (checked by the audit agent) |
| Cubicle | no deployment |

## Part E — Fact conflicts to resolve (site uses the verified value; resume needs edits)

1. **Patent number:** resume prints "Patent No. 044152784"; the certificate (Pratyasa fact-lock) shows Patent **No. 429867**, SL No. 044152784.
2. **TeachSpark metrics:** 08-24 Final PRD (72 views → 17 sign-ups → 12 onboarded → 8 activated → 5 papers; median 37.5 min saved, self-reported) vs 08-26 pitch (18 joined, 9 activated, 30 min, 2 papers). Recommend 08-24 as canonical.
3. **RailCite figures:** decks say 148 tests / 5,687 docs; live today 348 tests / 5,760 docs.
4. **Employer naming:** "American Express (via IntraEdge)" in resume vs "American Express" elsewhere.
5. **Title:** resume + live site "Enterprise Product Leader – GenAI & Cloud" vs site "Senior Product Manager" (decision S8).
6. **"7+ years"** on resume vs 2016–2026 span with a 2019–2022 M.Tech gap (frame as research years: patent + papers).
7. Resume PDF contains DOB, phones, address → sanitised copy needed before it is linked.

**Never publish:** TeachSpark sandbox join code (`teachspark/docs/pilot/pitch.md:15`), any `.env`, `Game/neogeo/` ROM/BIOS files.

---

## Part F — Full local repository & PRD audit (verbatim)

# Local Project Audit — Portfolio Content Sourcing

Audited 2026-09-15. Rule applied throughout: report only what is present on disk; where absent, **MISSING**. Every claim cites an absolute path. Numbers that differ between artifacts are attributed to their source and date rather than reconciled.

Sections:
1. Case Study 1 — Token Toli / India's Convenience Economy (dark stores)
2. Case Study 2 — India Elder Care (Bhakti-Vilas, Madhu-Mukti, Doosri Innings)
3. Case Study 3 — Vendor Onboarding (Nuptis / Velora / TrustBridge)
4. Case Study 4 — TeachSpark
5. Case Study 5 — RailCite (+ `/Volumes/E Drive/Dev/railcite-cron`)
6. Case Study 6 — Cubicle
7. Playground folders (one line each)
8. Cross-project git table
9. Strongest portfolio candidates + MISSING lists

---

## Git baseline (verified directly, `git remote -v` / `git log`)

| Repo | Remote | First commit | Last commit | Commits |
|---|---|---|---|---|
| `case study 2/Bhakti-Vilas` | https://github.com/teenytinybot/Bhakti-Vilas.git | 2026-08-01 | 2026-08-01 | 8 |
| `Case Study 3/Nuptis` | https://github.com/007U5H4R/nuptis.git | 2026-08-08 | 2026-09-09 | 21 |
| `Case Study 3/Velora` | https://github.com/007U5H4R/velora.git | 2026-08-11 | 2026-09-09 | 46 (`build/mvp`), 45 on `main` |
| `Case Study 4/teachspark` | https://github.com/007U5H4R/teachspark.git | 2026-08-20 | 2026-08-29 local HEAD; `origin/main` 2026-09-09 | 138 local / 127 `origin/main` |
| `Case Study 5/railcite` | https://github.com/007U5H4R/railcite.git | 2026-08-28 | 2026-09-03 | 82 |
| `/Volumes/E Drive/Dev/railcite-cron` | https://github.com/007U5H4R/railcite.git (**same remote**) | 2026-08-28 | 2026-09-05 | 105 |
| `Case Study 6/cubicle` | https://github.com/007U5H4R/cubicle.git | 2026-09-09 | 2026-09-12 | 79 |
| `dino-arcade-pwa` | https://github.com/007U5H4R/dino-arcade-pwa.git | 2026-09-06 | 2026-09-07 | 3 |
| `Slag City` | no remote | 2026-09-06 | 2026-09-14 | 65 |
| `Game` | no remote | 2026-09-05 | 2026-09-06 | 29 |
| `Graphology` | https://github.com/007U5H4R/tegaki.git | 2026-09-01 | 2026-09-09 | 56 |
| Case Study 1, Case Study 5 root, Case Study 6 root, Mock Interview, Patent | not git repos | — | — | — |

---

## 3. Case Study 3 — Vendor Onboarding: Nuptis / Velora (+ team product "TrustBridge")

Root: `/Volumes/E Drive/Dev/Code/Claude/Case Study 3/`

### Context
Cohort Week 4 brief, `Case study __ Week 4 __ C8 - Our file.pdf`: "Case Study: Building an MVP for a Vendor Management Platform" — *"Companies already have software for procurement, payments, contracts, and finance. However, vendor onboarding continues to remain slow, fragmented, and difficult to manage across teams."* Deadline "Wednesday, 12th August 2026 | 11:59 PM IST"; presentation "Sunday 16th Aug". Rubric: Discovery 10+10, Opportunity 10, Product Thinking 20, Analytics 20, Solution Design 20, Communication 10.

**Two distinct products (separate repos, stacks, PRDs, remotes), not a rename.**

### Nuptis
- `Nuptis-PRD.md:3` — *"Vendor Ops for Wedding Planning Agencies"*.
- Problem (`Nuptis-PRD.md:18`): *"Wedding planning agencies run 15–30+ vendors across 5–7 ceremonies per wedding, coordinated over spreadsheets and WhatsApp threads, with no structured record of vendor verification status, active work orders, payment milestones, or backup coverage — so a single no-show or scope change turns into a scramble."*
- Framing (`:6`): *"a grounding/exploration project built alongside the actual Week 4 case study … applies the same 'vendor onboarding is fragmented' problem to a domain that's easier to reason about intuitively."*
- Personas (`:39-44`): Vendor Manager (primary), Event Manager (primary), Finance (secondary), Agency Owner (buyer).
- Role: `Nuptis-PRD.md:4` *"Owner: (solo)"*; `Nuptis-LinkedIn-Launch-Post.docx` *"I just shipped my first product, solo — Nuptis"*.
- Live: `https://nuptis.vercel.app/` (HTTP 200 on 2026-09-15). Figma: `https://www.figma.com/design/2hvOt6R9g9iseQxHXTDRpv/NuptisV2`.
- Stack (`Nuptis/package.json`): React 18.3.1, react-router-dom 6.28, @supabase/supabase-js 2.112, Vite 5.4, TypeScript 5.6. `README.md:98` *"There is no separate lint or unit-test script configured"*.
- Architecture (`Nuptis/README.md:83-88`): localStorage-first; context+reducer, *"The reducer is the API surface"*; optional Supabase mirror via 4 Postgres RPCs (`activate_backup`, `source_backup`, `approve_change_order`, `log_outcome`); HashRouter; ~28 KB hand-written CSS with light/dark tokens. Schema (`Nuptis/supabase/schema.sql`): 9 tables (vendors, weddings, work_orders, flags, milestones, team_members, invites, notifications, settings).
- `Nuptis/.env.local` exists (gitignored); keys `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- AI: **none**. `Nuptis/src/components/Assistant.tsx` is a keyword-matching canned-response widget (`answer()` does `s.includes('no-show')` etc.).
- Metrics: North Star defined (`Nuptis-PRD.md:175`) *"% of high-risk work orders with a named backup assigned before the event date"*; `:201` *"No real pilot data yet. All three success metrics in §11 are defined but unmeasured."* Mobile ledger note: *"9 routes swept @414px + 768px; 1 bug found+fixed"*. Automated tests: **MISSING**.
- Domain insight (`Wedding-Vendor-Onboarding-Procurement-Process.md:19-27`, risk-tier verification): *"spending three weeks vetting a card printer and two days vetting a fireworks vendor is backwards."*
- Design rigor (`DESIGN.md`): 62 dual-mode tokens, 168 frames, 283 prototype reactions, AA audit; Figma NuptisV2 built 6 Aug, "Liquid Glass" 7 Aug.

### Velora
- `Velora/PRD.md:3` — *"A B2B apparel sourcing marketplace where fashion brands and garment manufacturers swipe to connect, and matches turn into bids."*
- Problem (`:11`): *"Discovery today is broken: founders find manufacturers through cold referrals, trade fairs, or Alibaba-style directories where trust is unverified and non-portable."*
- Users (`:23-24`): **Brand (Buyer)** *"Indie / D2C apparel founder sourcing production. Small MOQs, sustainability-led"*; **Manufacturer (Vendor)** *"Garment factory / supplier (e.g. Tiruppur, Ludhiana, Bengaluru)."*
- Role: `Velora/PRD.md:5` *"Owner: Tushar"*; `PM Strategy Plan.md:7` *"You're working solo, starting from zero today."*
- Pivot rationale (`Case-Study-3-LinkedIn-9-Day-Series.docx`, Day 7): *"Weddings were blue — but a shallow pool. Few events, low willingness to pay… So the team pivoted — the same trust problem, aimed at apparel vendor onboarding."* Day 9: *"Nine days. Two products. One survived… learning to kill Nuptis without flinching."*
- Live: `https://velora-nu-eight.vercel.app/` (memory.md:111, `Velora/app/index.html:15`) and `https://velora-8mzf-eight.vercel.app/` (team PDF) — both HTTP 200 on 2026-09-15.
- Stack (`Velora/app/package.json`): React 19.2.8, react-router-dom 7.18, framer-motion 13.1, zustand 5.0, @supabase/supabase-js 2.112, lucide-react, fontsource Fraunces/Inter; Vite 8.2, TypeScript 6.0, vitest 4.1, oxlint. Root `vercel.json` builds `app/` subdir.
- Architecture (`Velora/README.md:76-81`): single Zustand store, env-gated Supabase client, `hydrateFromSupabase()` with mock fallback, CSS Modules, PhoneFrame shell. Schema (`Velora/supabase/schema.sql`): 7 tables (brands, vendors, rfps, bids, matches, chat_threads, chat_messages). `Velora/SUPABASE.md:67-71`: *"The live path was built but not run against a real project."*
- AI: **none**. `Velora/PRD.md:80` explicitly out of scope: *"Real government-API verification (Trust Scores are authored, shown as if verified)"*.
- Tests: `npx vitest run` executed by the auditing agent → 3 files, **10/10 passed** in 2.49 s (`store.test.ts` 8, `App.test.tsx` 1, `remote.test.ts` 1).
- Final review (`Velora/.superpowers/sdd/2026-08-11-velora-mvp/reports/task-6.3-review.md`): *"0 horizontal overflow at 375 and 768 on every route"*; bundle *"500.63 kB / 156 kB gzip"*; 2 MUST-FIX + 2 SHOULD found and cleared (`memory.md:77`).
- All 40+ Velora build commits dated 2026-08-11 (one-day build).

### Team submission — TrustBridge
`CASE STUDY 3 PRD.pdf` (25 pp): "Apparel Vendor Onboarding: Discovery, Problem Definition & Product Solution". Team product TrustBridge (§5.3) proposes *"Grounded Gemini AI matches, ranks, and summarizes verified suppliers"* (p.20) — proposal only, not built. §7 "Prototype/Product Links from the team": *"Tushar Pathak | Nuptis / Velora | https://nuptis.vercel.app/ https://velora-8mzf-eight.vercel.app/"*.

### Discovery evidence
- Interviews (team-pooled; `Week 4 __ Toliyooo.xlsx` sheet "Primary Insights"): Sujay Abraham (Procurement Manager – Asia Pacific), Alok Thapliyal (Deputy Manager – Reliance Retail), Chitharanjan Rao (Procurement Manager, Amazon), Reshma Ravuri (Investment head – Meenakshi Group), Akshit Nagpal (Regional head Enterprise Business – Park+), CA Supriya Rastogi (Commercial Controller, Digihaat) + unnamed "Senior Director – SW Firm" → 7 rows in team PDF p.10. **Which ones Tushar personally ran: MISSING.** Apparel-side interviews: none (Discovery PRD: *"Apparel-specific interviews are planned, not yet run."*).
- Verbatim quotes (team PDF p.10): *"I find out where a vendor is by asking around."* · *"We scrutinise new vendors. Changes to old ones, we just… trust."* · *"If the email looks like the last ten, we just update it."*
- Hypotheses H1–H5 (team PDF p.7), e.g. H1 *"The biggest delay is caused by coordination between teams, not by one team working slowly."* Key insight: *"Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs"* vs *"APQC median 3.0 days"*.
- Frameworks: Double Diamond + convergence funnel (PDF pp.8-9), Red vs Blue Ocean + ERRC grid (pp.11-12), Opportunity Solution Tree (p.16), problem-candidate matrix A–D (p.16), As-Is service blueprint (p.13), stakeholder ecosystem map (p.5).
- `Apparel-Vendor-Onboarding-Discovery-PRD.docx` (25 sections, 12 Aug): confidence-tagged [Known]/[Observed]/[Hypothesized]/[Validated]/[Unknown]; *"Nothing below presents a hypothesis as a validated fact."*
- Prioritization: Nuptis PRD §7 explicit cut list with reasons; `PM Strategy Plan.md:11` effort-tracks-points reasoning.

### Metrics evidence
- Nuptis: success metrics defined, unmeasured (see above). Analytics/event-tracking sheet planned for Sat 8 Aug (`PM Strategy Plan.md:48-52`): **MISSING**.
- Team PDF baseline table (p.18: 15–30 days, <10% active work, 2–5× resubmission, >$35k vs <$2.5k, ~30% third-party breach) is secondary research marked *"verify before external use"*.
- User/pilot data: **MISSING**.

### Visual artifacts
- Root logos (all 1408×768): `Nupti.png`, `Nupti dark mode.png`, `Nupti-transparent.png`, `Nupti-dark-transparent.png`, `Nuptis DM.png`, `Nuptis LM.png`, `Nuptis-DM-transparent.png`, `Nuptis-LM-transparent.png`.
- Nuptis app (`Nuptis/docs/screenshots/`, all 1568×661): `dashboard.jpg`, `onboarding.jpg`, `procurement.jpg`, `stage.jpg`, `contingency.jpg`, `contingency-drawer.jpg`, `payments.jpg`, `settings.jpg`; `wordmark.png` 767×181; `Nuptis/public/og-cover.png` 1200×630.
- Velora app (`Velora/docs/screenshots/`): `role-select.jpg`, `discover.jpg` (716×1070), `trust-profile.jpg`, `rfps.jpg`, `bids.jpg`, `chat.jpg`, `profile.jpg` (720×1070); `hero.jpg` 720×455; `Velora/app/public/og-cover.png` 1200×630.
- Velora art (`Velora/assets/`): `mandala-gold.png` 1400×1097, `wave-circle-ember.png` 1200×1200, `cert-badge-gold.png` 626×626, `kalighat-parrot.png` 501×626, `kalighat-parrot-loomcraft.png` 480×480. Four `Velora/WhatsApp Image 2026-08-10 …jpeg` (content not inspected).
- Decks: `Wedding-Vendor-Onboarding-Pitch-Deck.pptx` (14 slides), `Velora/Vendor Management Systems.pptx`, `Velora/MVP_Development_Workflow.pdf`.

### Learnings
- Self-feedback (`Week 4 __ Toliyooo.xlsx`, "Feedbacks for yourself", row 9): *"Got a good understanding on primary and secondary research. Team building activities helped in putting my thoughts and inputs without any fear of judgement."* Improve: *"I think I need to improve on prompt engineering. How to use claude code effectively. How to make a full fledged prototype."*
- Process lessons `memory.md:135-139` (Vercel subfolder deploy, OG tags, deploy propagation).
- Mentor feedback on Tushar's work: **MISSING**. `lesson-learnt.md` / retro / grade: **MISSING**.

### Dates
Cohort "Toliyooo" Day 1 = Mon 3 Aug 2026 (`PM Strategy Plan.md:7`); Nuptis PRD 7 Aug; Velora PRD 10 Aug; Discovery PRD 12 Aug; OG/LinkedIn session 13 Aug (`memory.md:108`). `memory.md:4`: *"PROJECT COMPLETE, DEPLOYED & ITERATING."* Last commits (9 Sep) are README rewrites.

### MISSING (Case Study 3)
analytics/event sheet · pilot or usage data · Tushar-specific interview list · mentor feedback/grade · lesson-learnt/retro · Excalidraw journey-map export · `backlog/decisions` + `backlog/milestones` (only `config.yml` present in both repos) · Velora Figma URL · public GitHub links (repos private) · live Supabase validation · Nuptis test suite · any AI/LLM component.

---

## 4. Case Study 4 — TeachSpark

Root: `/Volumes/E Drive/Dev/Code/Claude/Case Study 4/` (`TS` = `…/Case Study 4/teachspark`)

### Name, description, problem, users
- One-liner (`TS/README.md:3`): *"A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work."*
- Solution-Space PRD §0 (`Case Study 4 - Solution-Space PRD.docx`): *"TeachSpark is a WhatsApp bot that teaches a teacher the reusable AI skill to create a differentiated worksheet herself in ~2 minutes, measures the time she saved, and pulls her back the next day for the next skill."*
- Problem (Discovery PRD §6; `/Users/tushar/Downloads/Documents/Tushar Discovery PRD.pdf` p.9): *"School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context. They don't know what to learn, where to start, or how to translate generic AI tutorials into their specific subject/grade/board — so despite abundant free resources, most never build durable, confident, applied AI skills."*
- HMW (§6.1): *"How might we help a time-poor teacher solve a real classroom problem this week by learning the minimum AI skill required — and feel the impact — so that using AI becomes a confident, repeated habit rather than a one-off experiment?"*
- Persona "Meera" (Discovery PRD §1.1): *"Age / stage 25–40; 3–15 years of teaching experience · Role Full-time school teacher (K–12) … class sizes of 30–50; mixed-ability students … Not a 'developer', has never written a prompt with intent."* JTBD: *"When I'm overwhelmed by prep and grading, help me solve this week's specific teaching task with AI, so I get real time back and feel more in control — without having to become a techie first."*
- Core loop: *"Classroom Problem → Learn → Practice → Apply → Measure Impact → Next Skill."*

### Role, dates, status, links
- Role: *"Author: Tushar Pathak"* on Discovery, Solution-Space and Final PRDs. `TS/docs/investor/deck-content.md:97`: *"Tushar Pathak — Founder. Built the entire MVP solo (WhatsApp bot, web, admin, analytics)."* Brief (`Week 5 __ Case Study 4 __ Cohort 8.docx`): group discovery Sat–Mon, then "INDIVIDUAL" from Tuesday.
- Cohort: *"Case Study 4 (Week 5, Cohort 8) · Learning Tech & AI for the Next Generation of Professionals — Teacher vertical"*. Brief deadline 26 Aug. Discovery PRD 19 Aug 2026; Solution PRD 19 Aug; Final PRD 26 Aug; `MentorFeedback.md` "Captured 2026-08-29".
- Git: first commit 2026-08-20; commits/day 44, 15, 40, 10, 16, 1, 9, 3 (through 08-29). Build compressed into ~5 days then pilot iteration. `origin/main` last commit 2026-09-09 ("Rewrite README as a screenshot-driven landing page").
- Status: Final PRD *"Status LIVE PILOT — MVP in the hands of real teachers"*; `railway.json` (Railpack, `/health`, `numReplicas: 1`). Twilio **sandbox**, not a production WhatsApp number (runbook: *"sandbox for the case-study cohort"*). Whether the Railway service is still up post-2026-09-09: **not verified**.
- Live URL: `https://teachspark-production.up.railway.app` (Final PRD header; `TS/docs/linkedin/linkedin-playbook.md:6`; `deck-content.md:111`). Routes `/join`, `/admin`, `/api/admin/metrics` (bearer token).
- WhatsApp: Twilio sandbox `+1 415 523 ****` (last 4: 8886). Sandbox join code appears in `TS/docs/pilot/pitch.md:15` — do not publish.
- Demo: `TS/TeachSpark.mp4` (42.85 MB, 2026-08-23). Pitch: `pitch/teachspark-pitch.pdf` (14 slides), `pitch/teachspark-pitch.html`, `pitch/pitch-speech.md`.

### Tech stack, architecture, AI
- `TS/package.json`: `@anthropic-ai/sdk ^0.119.0`, `express ^5.2.1`, `twilio ^6.1.0`, `@supabase/supabase-js ^2.112.3`, `pdfkit ^0.19.1`, `docx ^9.7.1`, `zod ^4.4.3`, `node-cron ^4.6.0`, `libphonenumber-js`, `express-rate-limit`, `@microsoft/clarity`; dev `typescript ^7.0.2`, `vitest ^4.1.11`, `supertest`, `tsx`. Node `>=24.15`. Web (`TS/web/package.json`): React 19, react-router 8, `mixpanel-browser`, Vite 8, `vite-plugin-pwa`, Testing Library + jsdom.
- Architecture (`TS/docs/runbook.md:10-65`): *"WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX → back to WhatsApp"*. `transition()` in `src/bot/machine.ts` is a *"PURE function, no I/O (Teacher, Message, now) -> Step { updates, events, actions }"*; `Executor.runStep` runs actions through **ports** (`src/ports.ts`: Clock, TeacherRepo, EventLog, GenerationStore, Messenger, Generator, PdfBuilder, PdfStore, MediaFetcher, PaperGenerator); adapters in `src/adapters/` (supabase, twilio, anthropic, anthropic-paper, pdf, docx, media, storage, memory). Nudge sweep via `node-cron` (`*/10 * * * *`). 5 Supabase migrations (init, paper, web_signups, signup_email_method, teacher_is_test).
- AI/LLM: model `claude-sonnet-5` default (`src/config.ts` `WORKSHEET_MODEL`, `PAPER_MODEL`), `claude-haiku-4-5` env-switchable (`src/adapters/anthropic.ts:9`). Runbook: *"Cost is roughly $0.01 per generation"*.
  - Worksheet/quiz: `src/adapters/anthropic.ts` — `messages.create`, `max_tokens 4096`, system prompt `GENERATION_SYSTEM_PROMPT` in `src/bot/skills.ts` (*"You are an experienced school teacher's assistant in India… stay within the syllabus of the stated board (CBSE, ICSE or a State board)… Never ask for or include any student's personal details."*), adaptive thinking `effort: 'low'`, handles `stop_reason === 'refusal'`. Teacher-facing `reusablePrompt` (*"Create a differentiated {grade} {board} {subject} worksheet on "{topic}" with 3 levels…"*).
  - Question paper: `src/adapters/anthropic-paper.ts` — `messages.parse` with structured outputs (`zodOutputFormat(PaperJsonZ)`, `effort: 'medium'`, `max_tokens 30_000`, 480 s timeout), vision on teacher-sent photos, second QC pass (`qcPaper`). Prompts in `src/bot/paper/prompts.ts` (*"If a supplied page is unreadable or blurry, add a note to sourceNotes… never hallucinate"*). Rendered to `.docx` via `src/adapters/docx.ts`.
- `TS/.env` key names: NODE_ENV, PORT, PUBLIC_BASE_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_SANDBOX_JOIN_CODE, TWILIO_VALIDATE_SIGNATURE, ANTHROPIC_API_KEY, WORKSHEET_MODEL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PDF_BUCKET, ADMIN_TOKEN, CRON_SECRET, NUDGE_TIMEZONE, NUDGE_CRON, DEMO_TOKEN, VITE_MIXPANEL_TOKEN, VITE_CLARITY_ID.

### Discovery evidence
- Discovery PRD (`Case Study 4 - Discovery PRD.docx`; PDF 14 pp with 7 figures): persona, pains by journey stage, competitive landscape (6 categories), gap analysis, opportunity + problem statements, HMW, central hypothesis, 8 decomposed assumptions A1–A8 (type + risk), validation-question guide, convergence.
- Blue Ocean / ERRC: `TeachSpark - Blue Ocean Strategy.png` (1376×768), `docs/assets/disc-blue-ocean.jpg` (1500×844). Whitespace 2×2: `docs/assets/disc-whitespace-quadrant.jpg` — *"generic↔classroom-specific and task-execution↔capability-building."*
- Prioritisation: Solution PRD §4 IN/OUT table; MVP wedge chosen by *"high frequency, high pain, easy to template and measure"*; risk table §15; Kano "delighter" framing (pitch slide 8); AARRR mapping (Final PRD §5.1).
- **Interviews: MISSING.** Discovery PRD plans *"8–12 teachers"* (§8); no notes, counts, transcripts or synthesis exist. Only trace: pitch slide 13 *"it started with one real teacher: my mother, who teaches Sanskrit"*; LinkedIn playbook *"My best user research was remembering my mother's evenings."* `TS/docs/pilot/observation-sheet.md` is a blank template.
- Portfolio-worthy lines: (1) *"The problem is not scarcity of content, it is that content is generic and disconnected from the classroom."* (Discovery PRD §0) (2) *"Everything either does the task for you or teaches you generically — nobody does problem-led, applied, capability-building learning with impact feedback. That white space is the wedge."* (§4.2) (3) *"Capability, not dependency."* (Solution PRD §3; pitch slides 4, 6, 11)

### Evaluation & metrics evidence
- Tests: `TS/test/` 43 `*.test.ts` + fixtures/helpers; `TS/web/test/` 26 files; ≈545 `it(`/`test(` call sites. Pitch claims *"625 tests"* — **not reproduced**. Last recorded QA gate run: Phase 6, 2026-08-21, *"Tests 335 passed | 2 skipped (337)"* (`TS/docs/qa/phase-6.md`).
- QA gate reports (`TS/docs/qa/`): phase-1 (17 tests PASS), phase-2 (132), phase-3 (159; real Claude→PDF→Supabase URL HTTP 200), phase-4 (204; e2e via Twilio-shaped webhook, *"27 funnel events logged"*, fault injection), phase-6 (335; honest "Does not prove" section), phase-7-landing (responsive/a11y at 375/768/1280, contrast 7.85:1 / 16.36:1, Lighthouse **NOT RUN**).
- Pilot funnel, Final PRD snapshot 2026-08-24, test handsets excluded (`docs/final-prd.docx` §0/§7; `/Users/tushar/Downloads/Documents/Tushar's PRD_ TechSpark.pdf` pp.19-21): *"Landing views → sign-ups 72 → 17 (23.6%) · Joined on WhatsApp 17 · Onboarded 12 (71% of joined) · Activated 8 (47% of joined) · Question papers exported 5 · median 37.5 min saved (self-report) · Referrals 3 · Nudge re-engagement 1 of 4 (25%)"*. Sign-up method *"17 manual · 0 Google"*. Targets: joined 40–50, activation ≥60%, D1 ≥25%.
- Pitch snapshot 2026-08-26 (`pitch/teachspark-pitch.pdf` slides 9, 12): *"18 Teachers on WhatsApp · 9 Activated (50%) · 30 min median time saved · 2 question papers exported · 3 referrals · ~$1.50 total cost"*; AARRR *"25 sign-ups → 19 tapped to WhatsApp; 18 real teachers on the bot"*. Snapshots disagree; LinkedIn Post 9 explains the is_test flag: *"Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30. Papers went from 5 to 2."*
- Mixpanel (transcribed from images): `docs/assets/mixpanel-funnel.png` — "Landing → WhatsApp join · 3-step Funnel · Last 30 days · 14.81%": landing_view **27 (100%)** → signup_completed **7 (25.93%)** → join_tapped **4 (57.14%)**. `docs/assets/mixpanel-daily-signups.png` — 0 from Jul 28–Aug 23, **4** on Aug 24, **3** on Aug 25 (partial). Final PRD caveat: Mixpanel only captured from 24 Aug; first-party store (72 views) is authoritative.
- Instrumentation: *"32 event types instrumented"* (`deck-content.md:35`); server-side event store + `/admin/metrics` (`src/metrics/funnel.ts`), Mixpanel, Clarity, CSV export. `scripts/check-live-metrics.mjs` prints Joined/Activated/Onboarded.
- LLM-quality evals: **MISSING** (no `/evals`; only in-product QC pass). Retention curve, K-factor value, NPS/CSAT: **MISSING**.

### Visual artifacts
- `docs/assets/`: `disc-blue-ocean.jpg` 1500×844 · `disc-content-vs-problem.jpg` 1500×1000 · `disc-core-loop.jpg` 1254×1254 · `disc-current-journey.jpg` 1500×1000 · `disc-missing-bridge.jpg` 1149×1369 · `disc-persona.jpg` 1500×1000 · `disc-validation-funnel.jpg` 1024×1536 · `disc-whitespace-quadrant.jpg` 1254×1254 · `p2-architecture.jpg`, `p2-at-a-glance.jpg`, `p2-insight-iteration.jpg`, `p2-results.jpg`, `p2-whatsapp-loop.jpg` (1500×837) · `mixpanel-funnel.png` 1500×466 · `mixpanel-daily-signups.png` 1500×467.
- Root: `TeachSpark - Blue Ocean Strategy.png` 1376×768. Video `TS/TeachSpark.mp4`.
- Web: `TS/web/public/og-cover.png` 1200×630, `demo-poster.jpg` 450×972, `img/teacher-class.jpg`, `img/teacher-prep.jpg` 1000×737. Design: `TS/design/landing-redesign/assets/teacher-prep.png`, `teacher-class.png` 1216×896 (+ `Design.md`, option-a/b/c.html).
- Decks: `pitch/teachspark-pitch.pdf` (14 pp), `TS/docs/investor/teachspark-deck.pdf` (15 slides, assumption-flagged), 3 LinkedIn carousel PDFs.
- Product screenshots (`docs/screenshots/landing.jpg`, `how-it-works.jpg`, `demo.jpg`, `join.jpg`, `spark-lab.jpg`, `wordmark.png`) exist **only on `origin/main`** (2026-09-09), not in the local checkout.

### Learnings / mentor feedback
`MentorFeedback.md` (2026-08-29): *"a teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow."* · *"Telling me to go back to ChatGPT weakens the reason for using your product."* · *"WhatsApp is a strong distribution decision, but it should not become the entire product differentiation."* · *"the original objective was also to help the end user learn Tech + AI. That part is currently missing from the experience."* · *"the GTM thinking needs to become much stronger… how the first 100 or 1,000 teachers actually discover it, try it, trust it, use it repeatedly and bring another teacher in."* Response: *"Core bet — best worksheet tool leads, learning delivered in-product as the trust mechanism… Wave 1 (trust & clarity) approved to build."* → commit 2026-08-29 "Wave 1: trust & clarity on the landing (mentor feedback)".

Retro (Final PRD §8): *"The typed WhatsApp-number field on the sign-up form was redundant… That field was the likely top drop-off… What shipped (4 changes)."* Pitch slide 10: India map *"placed zero real sign-ups — case-sensitive lookup vs 14 hard-coded cities"*.

`TS/docs/linkedin/9-day-build-series.md`: *"364 tests passed. Then I opened the actual file… Green tests prove it runs. They don't prove it's right."* · *"Teachers had typed 'Bangalore' four different ways. My lookup expected 'Bengaluru.'"* · *"The day before submitting, I made my own numbers worse… Honest smaller numbers earn more trust than impressive fake ones."* · *"The number wasn't low. It was structurally impossible."* (D1 vs 24-h window).

Planned deviations (`implementation.md`): WA numbers stored raw (nudges need them); numbered menus instead of quick-reply buttons; nudge <24 h; `referral_reported` replaces unobservable `share_clicked`.

### Git
Remote `https://github.com/007U5H4R/teachspark.git` (private). Branches: main, feat/landing-pwa, feat/pilot-tweaks, feat/signup-conversion (local HEAD), feat/wave2-refine (unmerged Wave 2 PRD + plan, 2026-08-29). 142 commits across all branches. `backlog/` empty (no decisions/milestones).

### MISSING (Case Study 4)
discovery interview notes/counts/synthesis (planned 8–12, none recorded) · filled observation sheets · pilot teacher verbatim quotes/testimonials · post-2026-09-09 status / live URL health check · retention/cohort curves · computed K-factor · LLM output-quality evals · `backlog/decisions` + `backlog/milestones` · Lighthouse scores (NOT RUN) · production WhatsApp number · local copies of product screenshots (only on `origin/main`).

---

## 1. Case Study 1 — "Discovering India's Convenience Economy" (Week 2, 20–25 July 2026)

Root: `/Volumes/E Drive/Dev/Code/Claude/Case Study 1/` (not a git repo; pure research artifacts; no code, no AI usage, no deployed artifact)

### Context
Brief: `Week 2 _ Case Study 1 _ C8_ Discovering India_s Convenience Economy.pdf` — *"You are a Product Manager in the Emerging Opportunities Team… Your recommendation may involve building: for gig workers, through gig workers, or because of gig workers."* Deadline "Saturday 11:59pm > 25th july". Rubric: Discovery 50, Opportunity 20, Thinking 15, Communication 15.
Team "Token Toli" (12 people, 4 pods). `Token Toli -W2- C8.xlsx` sheet "PMAPM ": *"Week 2 (20th - 25th july) | Gursimran & Shubham"* (rotating PM/APM); *"9th Aug - 15th Aug | Tushar & DJ"*. Sheet "Converge questios": *"Prakriti pod | Aditi Pod- Shubham & piyush | Guru pod - Tushar & Suyash | Varun Pod - DJ & Shivali"*.

### Two distinct outputs — do not conflate

**A1. Tushar's pod PRD (Guru pod; not selected by the team)**
- File: `/Users/tushar/Downloads/Documents/Discovery PRD-2.pdf` (33 pp, created 2026-07-25; byte-identical MD5 to `/Volumes/E Drive/Dev/Code/Claude/Case Study 1/Discovery PRD-2.pdf`). `/Users/tushar/Downloads/Documents/Discovery PRD.pdf` is the **same document re-rendered** (identical text). **Both belong to Case Study 1** despite the elder-care topic. Also embedded inside `Discovery PRD_All_Team.docx` under "Guru pod".
- Cover: *"Discovery PRD — Ageing-in-Place Care Orchestration for Long-Distance Families / Gursimran Singh • Tushar Pathak • Suyash P / Date: 25th July 2026"*.
- Problem (p.30): *"Who: Adult children living away from ageing parents who manage their care remotely. Problem: They lack a trusted, medically informed view of their parent's health and care. Why: Existing solutions coordinate services but do not prioritize medical accountability and reporting."*
- Hypotheses (p.30): *"H1.1: The core unmet need is medically informed accountability rather than logistics — Validated"*; *"H1.2: Elder-care demand is episodic, making a retainer model more appropriate — Partially Validated"*; *"H1.3: Acute events generate greater willingness to pay than routine care — Validated"*; *"Relationship Manager Acceptance — Partially Validated"*.
- Research plan (p.24): *"5–8 distant adult children… 3–5 current or former customers of competing services… 2–3 ageing parents… 2–3 doctors"*. Findings (pp.25–27) quote 11 named respondents (4 adult children, 3 parents, 2 doctors, 2 competitor customers). **Explicit total interview count: MISSING.**
- Quotes: *"My mother always says, 'Everything is fine.' I only discover later that she skipped a test or forgot to take a medicine."* — Priya Nair (38), PM, Bengaluru. *"I can arrange an Uber in two minutes. I can't verify whether the doctor changed the medication…"* — Anuranbh Sen, Delhi. *"The biggest issue isn't getting elderly patients to the clinic. It's ensuring someone remembers and follows the treatment plan."* — Dr. Neha Kapoor (46). *"I wanted peace of mind, not another booking platform."* — Vikram Singh (40).
- Insight (p.27): *"The binding constraint is trust, not demand."* Surprise (p.29): *"Transportation was rarely viewed as the biggest problem despite initial assumptions."*
- Sizing (p.31): *"30M elderly living alone × 30% with distant adult children × 40% urban/reachable = 3.6M addressable households… ≈ ₹2–6 lakh crore TAM (~$25–70B)"*.
- Scope-down (p.20): *"Focus the MVP on a medically informed accountability layer for chronic care, sold as a monthly subscription to distant adult children, with guaranteed emergency response as the key trust-building differentiator."*
- Frameworks: stakeholder map, dual-persona journey map, assumptions table with confidence stars, competitor matrix (Emoha, Samarth, Anvayaa, Yodda, KhyaalCare), For/Through/Because framing, risk-vs-confidence "Hypothesis Testing Framework", 8 infographics (Figs 1–8, embedded only — no standalone image files).
- Tushar's spreadsheet tab (`Token Toli -W2- C8.xlsx` → "Tushar"): 40 research questions, 6 "Improved Hypothesis" rows tagged FOR/THROUGH/BECAUSE, self-critique column (*"Is this actually a credit problem, or an income problem wearing a credit costume?… Before pitching this to anyone, you need 20-30 structured interviews…"*).

**A2. Team final submission (Piyush's pod problem; Tushar as team member)**
- `Final Submission/Week1_Token_Toli_Discovery_PRD.pdf` (15 pp, **no author page**). Problem: *"How might we enable gig workers to demonstrate trusted, verifiable financial histories so that formal financial institutions can confidently provide access to financial products such as loans?"*
- Interviews (p.7): *"we conducted 44 interviews… Delivery Workers 10, Cab Drivers 7, Home-service Professionals 5, Logistics Partners 4, Freelance Platform Workers 4, Banks & NBFCs 5, Insurers 3, Gig Platforms 3, AA / Policy Experts 3"* — *"Gurgaon, Pune and Bangalore… 2-8 years of experience"*.
- Key lines: *"Workers don't wake up wanting a loan. They wake up wanting to solve an urgent financial problem."*; *"borrowing from contractors or private lenders charging ~10% interest per month (≈150-170% annually)"*; *"The challenge is not irregular income. It is the absence of trusted proof of income."*; *"Estimated SAM: 10M+ workers… Estimated SOM: 250K-400K workers"*.
- Deck `Final Submission/Week1_Token _Toli_PPT.html` — "The Earning Is Real, The Proof Isn't — Field Discovery", 4-scene roleplay. Numbers: *"44+ depth interviews 70+ field conversations"*; *"Informal lender · low 97% / high 178%"*; *"20% fail even address verification"*; *"~1.2 Cr Total gig workers · FY25 / ~60 L TAM / ~18 L SAM"*. **Inconsistency:** PRD says SOM 250K–400K vs deck SAM 18 L; PRD 44 interviews vs deck "44+ … 70+".
- Tushar's role in A2 (`skills.md`): *"Team selects Piyush's lending PRD over the other three pods' work"*; `LinkedIn Posts - 7 Day Series.docx`: *"Day 6 — Watching my own idea lose… We picked a teammate's, Piyush's"*; *"Day 7 — Performing the problem instead of presenting it… Presenting our finalised PRD to our mentor."* Section authorship in team PRD: **MISSING**.

Other files: `DJ.docx` (NITI Aayog summary), `Shubham_Discovery.docx` (workforce stats), `Granola Notes .docx` (only a link), `Dark_Store_Field_Research_Questionnaire_updated.docx`, `DiscoveryPRD_Aditi_Pod_v3.docx`. `skills.md` is an AI-session log (LinkedIn series *"Posts haven't been published yet"*).

### Metrics / visuals / learnings
Metrics: interview counts only; no product metrics. Screenshots: **none** (visuals embedded in PDFs/HTML only). Mentor feedback / grade: **MISSING** (`skills.md`: *"If more case-study material gets added later (e.g. final grade, mentor feedback)…"*).

### MISSING (Case Study 1)
explicit interview count for Tushar's pod · author page on team PRD · mentor feedback/score · standalone images · any deployed artifact · section attribution within team PRD.

---

## 2. Case Study 2 — "Building for India's Elder Care Market" (Week 3, 26 July–1 Aug 2026)

Root: `/Volumes/E Drive/Dev/Code/Claude/case study 2/`

### Context
Brief: `Case Study 2 - C8_ Building for India_s Elder Care Market.docx` — *"You are a Product Manager at an early-stage health-tech startup… The market doesn't appear to have a shortage of products. It appears to have a shortage of clarity… What is the most important problem that remains unsolved in India's elder care ecosystem?"* Deadline "Saturday 11:59pm > 1st Aug". Rubric: Solution Design 30, Thinking 20, Discovery 25, Opportunity 10, Communication 15.
`CLAUDE.md`: *"Two distinct things… A research/strategy corpus… and `Bhakti-Vilas/` — the one actual buildable code project."* `skills.md` (Aug 1) is the index, written as an AI-session log — the docs are Tushar-directed, AI-assisted synthesis. Files dated Jul 27 → Aug 3 2026.

### Tushar's explicit artifacts
- Week 3 tracker tab "Tushar" (`Week 3 C8 Token Toli.xlsx`) refined hypothesis: *"We believe long-distance adult children… experience chronic anxiety and an inability to act on their parents' day-to-day wellbeing, because the elder care ecosystem consists of dozens of disconnected point solutions with no shared layer of visibility or coordination — forcing the family itself to act as the system integrator despite being the stakeholder least present to do it."*
- `Team-Research-Synthesis.md`: *"Tushar | Tier-wise segmentation, hypotheses → refined hypotheses, persona interview guides | ✅ Complete"*; *"Five contributors (Prakriti, Shivali, Piyush, DJ, Tushar) independently… converged on the same root cause… a missing trust/accountability layer."*
- `India-Elder-Care-Case-Study.md`: *"India's elder-care ecosystem has no trusted, independent, verifiable layer of accountability that lets the person who pays and decides… reliably know that the person who is with their parent, right now, in their home, is providing safe, competent, dignified care."*
- `Category-Hypotheses.md`: 5 categories / 10 hypotheses in "we believe [user] experiences [problem] because [assumption]" form; flags *"Category 3… is the weakest-evidenced… 'financial burden' ranked dead last as a challenge (1 of 70 mentions)"*.
- `Refined-Hypothesis-and-Lateral-Solution.md`: *"Proof-of-Visit + Care Escrow utility layer"*; *"Emoha spends ₹1.50 to earn ₹1. Portea has burned ~$93M over 13 years… Papa (US) raised $242M… and still collapsed"*; *"Insure the visit, don't vet the person."*
- `Converging Results/[Tushar] 3-4 pager solution.docx` = **Madhu Mukti Solution Ecosystem** (Tushar's named submission): *"Brand: Madhu Mukti — madhu (the root of madhumeha…) + mukti (liberation)… the health meaning is coded, not front-loaded"*; WhatsApp-first (Sadhna Sandesh), temple walks (Parikrama Trails), Sadhna Lock, staged reveal 100% → ~60% → ~25% → ~10% (*"directional estimates, not measured data"*). `Madhu-Mukti-Solution-Space-and-PRD.md` adds 5 design principles, AARRR, feature/data-source table, assumptions (*"The entire concept… is desk research"*).
- `Bhakti-Vilas/Why-Bhakti-Mentor-QA.md` — mentor asked *"why is this the right theme, what made you choose it over other ideas, and what's the actual logic connecting bhakti to health?"* Answer cites 11 sources (Holt-Lunstad *"26% increased mortality risk from chronic loneliness"*; LASI 2022 n=31,464). Caveat: *"a well-evidenced hypothesis with real mechanisms, not a proven guarantee"*.
- `/Users/tushar/Downloads/Documents/Samarth_Elder_Care_Complaint_Research_Summary.md` — *"Prepared by: Tushar… Day 2/7 of a product management practice series"*; review-mining: *"Justdial… 4.4/5 across 57 reviews"*; *"Samarth Elder Care and Community (Gurugram) — 4.4★ average across 72 reviews"*.
- `LinkedIn-7-Day-Journey-Series.md` — Day 3: *"Distance was never the variable. Availability was."*; Day 7: *"Shipped Bhakti Vilas — a working prototype, live and deployed, not a deck."*

### Team artifacts (not Tushar's)
- Primary research, Prashant's pod (`Elder_Care_Problem_Hypotheses.md.pdf`, `Primary Research - Prashant_s POD/`): *"the family survey (two waves, n=23 deep-dive + n=47 broad), the healthcare-workers survey (n=12), and… 9 elder personas + 3 expert interviews"*. Numbers: *"Parental resistance… #1 challenge in the broad family wave (16 mentions)"*; *"only 60% agreed to pay even ₹200/month"*; *"24 of 46 say they 'don't need these services' even though 62%… reports parental health issues"*; *"10 of 12 hit medication conflicts at least monthly"*. Expert: *"BHAROSA (trust) crisis"*.
- Secondary research, Prakriti's pod (`Secondary Research - Prakriti Pod/`).
- Team final PRD `Case Study 2 PRD.pdf` (23 pp, 2026-08-03, **no author names**): "Discovery PRD — Healthy Ageing in India". Pivot: *"Change 2 — From Elder Care to Healthy Ageing… People between 45 and 60…"*; *"Why Bhakti? …People are more willing to attend a kirtan than a diabetes screening"*; *"4-week retention (north-star metric)"*; *"Open Blocker: Both health quizzes require a doctor's review"*. Its 5 design principles restate Tushar's Madhu-Mukti principles almost verbatim (*"Build on habits people already have… We prevent disease, but we never say the word 'prevention'…"*) — evidence Tushar's concept shaped the team direction. Prototype links: `https://bhakti-vilas.vercel.app/bhakti_wellness_home/code.html`, `https://glucoeats.vercel.app/` (teammate's).
- `Case Study 2 - Primary Research.docx` is effectively empty (title only).

### Bhakti-Vilas (code)
- Path `…/case study 2/Bhakti-Vilas/`. README: *"An interactive prototype for भक्ति Vilas, an elder-focused wellness platform for India built around bhajan… positioned as devotion-as-behavioral-health rather than a clinical wellness app… No database, no backend, no build step. All data is mock data in `assets/app.js`."*
- Live: `https://bhakti-vilas.vercel.app/` → 307 → `/bhakti_wellness_home/code.html` HTTP 200 (verified 2026-09-15).
- Stack (verified): 4 static HTML pages + vanilla JS (`app.js` 65 KB, `app-pages.js` 86 KB, `auth.js`, `audio.js` Web Audio synth, `i18n-engine.js`/`i18n-dict.js`), hand-written CSS + Tailwind CDN, `sessionStorage` state, fake phone+OTP login. No package.json, no tests, no CI. `memory.md`: *"Grew out of a Stitch (Google) design export"*.
- AI/LLM: **none** (grep zero hits).
- Git: `https://github.com/teenytinybot/Bhakti-Vilas.git`; 8 commits, all 2026-08-01; authors 5 × 007U5H4R, 3 × Shivali. `backlog/` only `config.yml`.
- Known gaps (README): *"Translation coverage is partial (~90 of ~500 strings)"*; *"Medical copy is unreviewed"*. Verified flows (memory.md): session booking (learn → date → circle on map → payment → QR pass), mobile audit *"390×844 and 360×800… No console errors"*.

### Visuals
- `Madhu-Mukti-TOFU-MOFU-BOFU-Funnel.png` 1600×924 (+ `.svg`).
- `Bhakti-Vilas/assets/`: `tea-circle.jpg` 1536×1024; `diabetes-hero.jpg`, `menopause-hero.jpg` 1200×800; `belonging-image.jpg`, `bhakti-breathwork.jpg`, `deep-rest-nidra.jpg`, `japa-mantra.jpg`, `joint-mobility.jpg`, `kirtan-dance.jpg`, `morning-bhajan.jpg`, `temple-walk-group.jpg`, `walking-mantras.jpg` 1400×933; `face-*.jpg` 240×240.
- `Bhakti-Vilas/bhakti_wellness_home/`: `diabetes-cardio.png`, `diabetes-image.png`, `menopause-meditation.png` 1536×1024.
- Inline SVG charts inside `Team-Research-Synthesis.md`, `India-Elder-Care-Case-Study.md`, `Elder-Tech-Existing-Solutions.md`, both Madhu-Mukti `.md`s. **UI screenshots of Bhakti Vilas: MISSING** (capture from live URL).

### Metrics / learnings
Team survey numbers above. Bhakti Vilas product metrics, analytics, tests, evals: **MISSING**. Mentor grade: **MISSING** (only the mentor's three questions recorded).

### MISSING (Case Study 2)
team PRD authors · mentor grade/feedback text · Bhakti Vilas UI screenshots, usage/analytics, tests · backlog decisions/milestones · interviews fielded by Tushar himself (guides only — `skills.md`: *"The interview guides exist and have not been run with outside families"*) · GlucoEats source · body of `Case Study 2 - Primary Research.docx`.

---

## 5. Case Study 5 — RailCite (+ `/Volumes/E Drive/Dev/railcite-cron`)

Roots: `/Volumes/E Drive/Dev/Code/Claude/Case Study 5/` (not a git repo; contains `railcite/` clone) and `/Volumes/E Drive/Dev/railcite-cron/`

### Identity
- Author line (`Case Study 5/docs/final-prd.docx`): *"Author Tushar Pathak · Case study Week 5 · Case Study 5 · Cohort 8 · Government / Public Sector · Date 7 September 2026 · Live https://railcite.vercel.app"*.
- One-liner (`Discovery-PRD.md` L3-5): *"A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular — with number, date, and supersession lineage — and drafts a defensible justification note, without ever inventing a citation."*
- Problem (`Discovery-PRD.md` L38-41): *"A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists, reading scanned circulars, guessing which version is current, and hand-writing a justification note that cites them. It is slow, error-prone, and one wrong/superseded citation damages the inspector's credibility — not the tool's."*
- Target user (`Discovery-PRD.md` L45-51): *"Ravi (composite of a real CCI — the builder's father and his colleagues). Middle-aged, Group-C commercial supervisory cadre; not an officer… low tolerance for a tool that 'sounds confident and is wrong.'"* Final PRD: *"Age / stage 40-58"*.
- Brief (`FINAL CASE STUDY C8.docx`): 9-day Government/Public Sector case study; *"Small problem. Deep thinking. Functional product."*

### Role, dates, status
- Role: *"RailCite is a solo-built MVP"* (final-prd.docx §0; `docs/linkedin/railcite-9day-linkedin-series.md` L7). Git: 104/105 commits by `007U5H4R <tushar_pathak@outlook.com>`, 1 by Vercel bot.
- Dates: Discovery-PRD 2026-08-28; first commit 2026-08-28 (*"chore: scaffold next 15 app"*); last commit 2026-09-05; Final PRD 7 Sep 2026.
- **Status: LIVE.** `https://railcite.vercel.app/` HTTP 200; `/api/stats` → `{"documents":5760,"chunks":14406}` (checked 2026-09-15). Nightly crawl GitHub Actions on a self-hosted Mac runner (`railcite-cron/.github/workflows/daily-crawl.yml`).

### Stack / architecture / AI (verified from `railcite/package.json`, identical in both clones)
- next 15.5.24, react 19.1.0, `@anthropic-ai/sdk` ^0.122.0, `@supabase/supabase-js` ^2.112.4, zod ^4, motion ^13, mixpanel-browser, `@vercel/analytics`, `@vercel/speed-insights`; dev vitest ^4, Testing Library, jsdom, tsx, sharp. Scripts: `ingest:local`, `ingest:crawl`, `ask`, `calibrate`, `lineage:load`, `db:apply`, `og`, `icons`.
- Env key names (`.env.local.example`): ANTHROPIC_API_KEY, VOYAGE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL, NEXT_PUBLIC_MIXPANEL_TOKEN, NEXT_PUBLIC_SITE_URL, RELEVANCE_THRESHOLD, DATA_DIR (+ NEXT_PUBLIC_CLARITY_PROJECT_ID).
- Embeddings: Voyage `voyage-3`, 1024-dim (`lib/embeddings.ts` L12; `migrations/001_init.sql` L23 `embedding vector(1024)`); cosine RPC `match_chunks(query_embedding, match_count, filter_verified, filter_domain)`.
- Synthesis: `claude-sonnet-5`, forced tool `record_conclusion`, zod-validated union `answered|refused`, max_tokens 4096, one bounded retry (`lib/synthesize.ts`). System prompt L8-21: *"EXTRACTIVE ONLY… If no provided passage actually governs the case, you MUST refuse… Never claim finality. Never invent circular numbers, dates, or provisions."*
- Query-domain classifier: `claude-haiku-4-5-20251001` (`lib/classifyQueryDomain.ts` L55). Hindi translation: `claude-sonnet-5` (`lib/translate.ts` L46).
- P0 citation validator (`lib/validate.ts`): drops any block whose citations don't resolve to 1..sourceCount; all-dropped → refused.
- Pipeline (`app/api/query/route.ts`): Supabase JWT auth → corpusStats + embed + domain classify in parallel → scope-aware answer cache (migrations 004/006) → `matchChunks` k=8 → threshold gate (`RELEVANCE_THRESHOLD` calibrated 0.32) → synthesize → validate → `getLineage` → cache. Anthropic errors → 503 `generation_unavailable`.
- Ingest: `lib/ingest/extract.ts` (pdftotext), `ocr.ts` (pdftoppm 200 dpi + tesseract), `chunk.ts` (target 1000 tok, overlap 150), `discover.ts` (cron only). Lineage: `scripts/load-lineage-auto.ts` (*"a fabricated relationship is a P0… 0-match and >1-match corrigendums are LOGGED, not guessed"*).
- Reranking: **none**. DB: Supabase Postgres + pgvector; migrations 001–006 (+007_crawl_runs, 008_dead_urls in cron). Analytics: Mixpanel EU, six events, PII-free (`lib/analytics.ts`).
- Data: 67 PDFs in `Case Study 5/Data/` (e.g. `COMMERCIAL MANUAL VOLUME II.pdf`, `CRT_Corrig_50_Haulage_Charge_290422.pdf`). `ingest/local-manifest.json` 65 entries; `crawl-manifest.json` 6,333 entries.

### railcite vs railcite-cron
Same product, same repo (both remotes `https://github.com/007U5H4R/railcite.git`). `railcite/` HEAD (82 commits, branch `fix/auto-domain-and-badge-overflow`, 2026-09-03) is an ancestor of `railcite-cron/` HEAD (105 commits, branch `build/phase5`, 2026-09-05). README/package.json byte-identical. railcite-cron adds `lib/ingest/discover.ts`, `scripts/crawl-daily.ts`, `reocr-*.ts`, `lib/distinctLabel.ts`, migrations 007/008, `.github/workflows/daily-crawl.yml`, `docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md`. **railcite-cron is the newer canonical checkout; `Case Study 5/railcite` is a stale clone.** Not a separate service.

### Discovery evidence
- Files: `Discovery-PRD.md` (JTBD ×4, persona, trust model, metrics, risks, 13 sections); `Solution-PRD.md`; `Design.md` (28 KB: North Star, OKLCH tokens, components, motion, a11y); `docs/final-prd.docx` (persona table, pains by moment, landscape table, gap analysis, HMW, 8 assumptions A1–A8, validation questions; Part II results); 7 decks (HTML+PDF): discovery-prd, solution-prd, pitch, investor, architecture-flow, roadmap-vision, security-brief.
- **Interviews: MISSING as artifacts.** Final PRD §6: *"The builder's father is a serving CCI; he and colleagues ran real freight/demurrage cases against RailCite"* — no count, names, dates, recorded feedback. `BUILD-LEDGER.md` L65: *"Phase 4 QA gate … HITL: 3 real CCI cases"* still `pending`. Problem tree, prioritization matrix: MISSING.
- Portfolio-worthy lines: central hypothesis (final-prd §7.1) *"We believe CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date, and because generic AI is confidently wrong… We'll know we're right when a real CCI completes a real justification using a tool-generated, correctly-cited draft, and the tool refuses rather than fabricates on an uncovered case."* · Insight (`Discovery-PRD.md` L25-28): *"The Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included 'should not be deemed to have been superseded simply because of their non-inclusion.'"* · Reframe: *"We move from search-led ('find the circular faster') to accountability-led ('prove which version governs today')."* / *"The officer who sanctions is the officer who defends."* · Design North Star (`Design.md` L21-24): *"Refuse is a first-class success state, never an error… This is the single most important design decision in the document."*

### Evaluation / metrics
- Formal eval plan / dataset / `evals/`: **MISSING**. `railcite/backlog/*` empty. No `evaluation-plan.md`, `QA-report.md`, `lesson-learnt.md`, `decisions.md`.
- Threshold calibration (`scripts/calibrate.ts`: 5 relevant + 3 irrelevant queries; `QA-phase2.md` P2-10): *"irrelevant ≤0.25, relevant 0.29–0.66; gap → 0.32"*. P2-1: *"7 blocks, 0 uncited dropped, sims 0.43–0.665"*. P2-3: *"para 2511 present at p.178–179"* verified with pdftotext. P2-5: nonsense query refused (*"all hits ≤0.20 < 0.32"*).
- Corpus numbers (final-prd §7.1 + investor deck): 6,333 PDFs discovered; 5,687 ingested; 3,865 OCR (68%); 14,078 chunks; 193 lineage links. Live 2026-09-15: 5,760 docs / 14,406 chunks. Phase-1 (`BUILD-LEDGER.md` L221): *"458 chunks / 4 docs"*; OCR *"41-page… 101s, ~2.4s/pg"*.
- Citation validity: *"100% by construction"* (validator) — **no measured sample over N queries**. Retrieval precision/recall, groundedness, latency percentiles, Mixpanel funnel, time-to-cited-answer: **MISSING** (final PRD §7.4: *"Multi-user funnel… early, low-volume traffic"*; *"Quantified time-saved… not yet captured"*).
- Tests (run by auditing agent): railcite-cron `npx vitest run` → **345 passed, 1 failed, 2 skipped (348 tests, 48 files)**; failure `tests/lib/crawl-workflow.test.ts` (stale `poppler-utils` expectation after self-hosted runner move). Older `railcite/` → 243 passed, 1 skipped (244 tests, 36 files). Decks claim "148 tests" (stale). No e2e.
- Impeccable critique of live Ask screen (`railcite/.impeccable/critique/2026-08-31T14-59-19Z__components-caseconsole-tsx.md`): **22/40 "Acceptable"**, 1 P0 (*"Flagship starter refuses"*), 4 P1. Deck critique (2026-09-03): 14/16.

### Visuals
- **Screenshots: MISSING** (zero png/jpg under Case Study 5 root, `docs/`, `decks/`).
- Present: `railcite/public/bholu.png` 520×647 (mascot), `icon-192.png`, `icon-512.png`, `apple-icon.png` 180×180, `bholu-signal.mp4`. OG image code-rendered (`app/opengraph-image.tsx`, 1200×630).
- Deck PDFs (1280×720 slides, 78 total): `decks/railcite-pitch-deck-templated.pdf`, `railcite-investor-deck-templated.pdf`, `railcite-architecture-flow-templated.pdf`, `railcite-discovery-prd.pdf`, `railcite-solution-prd.pdf`, `railcite-roadmap-vision.pdf`, `railcite-security-brief.pdf`. `docs/redesign-mockup.html`.

### Learnings
- Mentor feedback: **MISSING**. Formal retro: **MISSING**.
- Final PRD §8 "Insight → iteration": *"retrieval could let a passage from one commodity/volume surface for a different-domain case… bleed has to be impossible, not merely unlikely"* → hard SQL domain filter + per-PDF traceability + scope-aware cache (commits 2026-09-03).
- `BUILD-LEDGER.md`: Voyage rate limit *"3 RPM / 10K TPM… STRUCTURAL, not transient"* (L207); `claude-sonnet-5` rejecting `temperature` found only by live smoke (L234); threshold 0.45 → 0.32 (L253).
- Cron design doc (`railcite-cron/docs/superpowers/specs/…design.md` L16-19): *"staleness is not a missing feature — it is a correctness bug… A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached."*
- LinkedIn series (9 drafted posts): Day 5 *"The feature is a citation. The product is trust."* Posted: unknown.

### MISSING (Case Study 5)
interview notes/counts/quotes · user-testing log for "father + colleagues" claim · usage/Mixpanel numbers · measured time-to-cited-answer · groundedness/retrieval/latency eval + dataset · `evals/`, `evaluation-plan.md`, `QA-report.md`, `lesson-learnt.md`, `decisions.md` · product screenshots · mentor feedback · problem tree / prioritization matrix · recorded fix for the P0 "starter refuses" defect · deck figures stale vs live (148 tests / 5,687 docs vs 348 / 5,760).

---

## 6. Case Study 6 — Cubicle

Root: `/Volumes/E Drive/Dev/Code/Claude/Case Study 6/` (not a git repo; app at `cubicle/`)

### Identity
- Tagline (`Discovery-PRD.md:3`): *"Your first team fits in a cubicle."*
- One-line (`Discovery-PRD.md:260`): *"Cubicle is a hosted web app where a solo founder types a product idea and watches four AI teammates — PM, researcher, designer, developer — visibly collaborate to produce a one-page PRD, a competitor scan, landing-page copy, and a build plan, shareable by link, in about 90 seconds."*
- Problem (`:146`): *"Solo builders have no team, so ideas die in the gap between thought and first artifact. The AI tools that could fill that gap either speak in one generic voice or hide their work, so the founder cannot trust the output enough to act on it."*
- Target user (`:48`): *"Meet Aarav Mehta, 29, Bengaluru. Senior product analyst at a mid-size fintech. Has spent eleven months with an idea for a subscription-tracking product for Indian households sitting in a Notion page. No co-founder. He has pasted the idea into ChatGPT three times and got three slightly different, equally generic PRDs that he never sent to anyone."* Secondary (`:65-69`): Startup PM, Indie developer, Freelancer/agency lead.

### Role, dates, status
- Role: "Tushar" appears nowhere in root artifacts. `Discovery-PRD.md:10` *"| Author | Product owner, Case Study 6 team |"*; `Solution-PRD.md:11` *"| Owner | Product owner, Case Study 6 team |"*. Brief (`Rethink Buildathon - 10 Days.pdf` p.2): *"You will form a team of 6 people and build one digital product together in 10 days."* Team names: **MISSING**. Tushar's named role: **MISSING**.
- Dates: *"RETHINK BUILDATHON C-8 · 10 Days… Sept 7 → Sept 16, 2026 · Final Presentations: Wednesday, Sept 16 at 10:00 PM IST"*. Requirements (p.6): *"A live digital product… 100+ real users with verifiable usage… Feedback from at least 5 PMs/founders outside your immediate team…"*. Artifacts: Discovery-PRD 8 Sept, Solution-PRD 8 Sept, Design.md 9 Sept, technical-plan/test-cases 9 Sept, QA-report + lesson-learnt 12 Sept. Git: 79 commits 2026-09-09 → 2026-09-12 (25/35/13/6 per day).
- **Status: code-complete offline prototype, never run live, not deployed.** `QA-report.md:13`: *"The real 4-agent end-to-end run has never been executed (no live model/DB) → the product's core loop is verified by construction + fixtures, not against reality."* `HANDOFF.md:3`: *"M-003 UI COMPLETE + all reviews done; offline build FINISHED. `main` @ `6779998` — PUSHED to origin 2026-09-12; CI GREEN… Next work = the §6 turnkey pre-launch checklist… (user-only: provision services → first real run…)"*. M-004 (accounts/share/telemetry), M-005 (launch), M-006 (users/presentation) not started. Backlog: 46 `Done`, 67 `To Do`. No commits after 12 Sept (deadline 16 Sept).
- Live URL: **MISSING**. Repo `https://github.com/007U5H4R/cubicle` (private).

### Stack / architecture / AI (verified `cubicle/package.json`)
- Next.js 16.3.4 (App Router, TS strict), React 19.2.8, Tailwind 4, `@google/genai` ^2.21.0, `@supabase/ssr` + `@supabase/supabase-js`, zod ^4.5.4, framer-motion ^12, `@tanstack/react-virtual`, react-markdown + rehype-sanitize, `@vercel/functions`, Vitest ^5, pnpm 11.25.0. CI (`.github/workflows/ci.yml`): typecheck, lint, test, `check:outline`, gitleaks. Migrations `0001_init.sql`, `0002_rls.sql`. (technical-plan says Next 15; installed 16.3.4. `smoke` script points at missing `scripts/smoke.ts`.)
- Architecture (`technical-plan.md:14`): *"A single Next.js App Router app. One streaming route handler (`POST /api/runs`) is the whole run engine: it runs the orchestrated debate, then four parallel artifact calls, writing every message and artifact to Postgres the moment it exists and mirroring it to the client as SSE. The database is the truth; the stream is a convenience… One module (`lib/gateway`) is the only thing that touches Gemini. One writer (`lib/events.ts`) is the only thing that writes telemetry, against a closed allowlist."* Data model: `anon_sessions`, `runs`, `messages`, `artifacts`, `events`.
- AI: Gemini only via `@google/genai` in one file `cubicle/lib/gateway/transport.ts`. Defaults (`lib/config.ts:9-10`): `MODEL_AGENT: "gemini-3.8-flash"`, `MODEL_ORCHESTRATOR: "gemini-3.5-flash-lite"`. Structured JSON output, streaming, Google Search grounding on competitor-scan only (decision S5); fallback `UNVERIFIED_PREFIX = "From memory, unverified — could not reach search.\n\n"` (`lib/engine/deliver.ts:45`). Multi-agent protocol (Solution-PRD §5–8): orchestrator picks next speaker; four role agents exchange envelopes with speech acts `propose|question|objection|agree|done`; stop rules (6 msgs / 45 s / 70% tokens / repeat hash / hop=3); then four parallel artifact calls. Prompts `cubicle/lib/prompts/{roles,orchestrator,dispatch,headings}.ts`. Replay harness `cubicle/tests/replay/`. No RAG/embeddings. Cost estimate (Solution-PRD `:256-262`, unmeasured): *"≈ $0.04"* per run; *"50–75 s; hard cap 90 s"*.
- `.env.example` keys: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SITE_URL, RUN_CONCURRENCY_CAP, RUN_DAILY_CAP, RUN_TOKEN_CAP, RUN_WALL_CAP_S, DEBATE_MSG_CAP, DEBATE_WALL_CAP_S, MODEL_AGENT, MODEL_ORCHESTRATOR.

### Discovery evidence
- Method (Discovery §2): compressed double diamond; six candidate problem spaces scored on the brief's four questions (§4.1, lines 79-86); persona + JTBD; red-ocean landscape (7 categories, §6.1); blue-ocean four-actions grid (§7.2) + strategy canvas (§7.3); bottom-up sizing (§6.3); 8 success metrics (§9); risks (§10); GTM (§13).
- Secondary research: `research-notes.md` — 46 sources [S1]–[S46] tagged High/Medium/Low with URL + date; evidence-gap appendix.
- **Primary interviews: MISSING.** `Discovery-PRD.md:359`: *"Placeholder — to be filled during the build: Interview 1 · … · Interview 5"*. Interview guide (7 questions) at lines 346-353.
- Hypotheses (§9): activation ≥60%, return ≥20%, share ≥25%/≥10%, reliability ≥95%, cost ≤$50.
- Decks: `decks/discovery/Cubicle-Discovery-Pitch.{html,pdf}` (13 pp), `decks/solution/Cubicle-Solution-Pitch.{html,pdf}` (13 pp). `decisions.md`: S1–S6, EXE-1, EXE-2.
- Portfolio-worthy lines: `Discovery-PRD.md:134` *"The product that wins the solo founder is not the one with the most autonomous agents; it is the one whose agents' work you can watch."* · `:196` *"Nobody makes the collaboration visible. The word 'why' is missing from the whole table. That is the gap."* · `:338` *"The order matters. Trust first, ownership second, autonomy last. That is the opposite of how the red ocean is sequencing it, and it is our bet."*

### Evaluation / metrics
- `test-cases.md`: 97 TC rows. Status tally as written: **PASS 29 · partial 2 · BLOCKED 17 · Planned 48 · FAIL 0** (TC-051…069 and TC-096 still "Planned" in file though ledger/QA-report record them PASS — bulk update never landed).
- Automated suite (`QA-report.md:51`): *"`pnpm typecheck` ✓ · `pnpm lint` 0 errors ✓ · `pnpm test` 326 passed / 3 skipped ✓ · `pnpm check:outline` clean ✓ · `pnpm audit --prod` no known vulns ✓"*. 55 test files. CI green.
- QA gates (`QA-report.md:114-120`): Design **PASS** · Code Quality **PASS** · Functional **PASS (offline) / CONDITIONAL (live)** · Security **PASS WITH CONDITIONS** · Overall **PASS WITH CONDITIONS**. Severity (`:88-93`): Critical 0 · High 2 (+1 a11y) all resolved · Medium 4 (3 resolved, 1 accepted) · Low 9 (3 resolved, 6 accepted/parked). Findings DES-001…005, CR-001…008, QA-001/002, SEC-001…003.
- Deployment recommendation (`:20,122`): *"CONDITIONALLY READY — STEPS REQUIRED (live verification + launch hardening)"*; *"LIVE VERIFICATION NOT DONE (dominant caveat)."*
- Contrast (`:14`): *"WCAG AA text contrast now met (≥5.18:1 light / ≥6.14:1 dark)"*.
- `evals/`, `evaluation-plan.md`, measured product metrics (users, activation, run time, cost): **MISSING**.

### Visuals
**MISSING.** No PNG/JPG under Case Study 6 anywhere; only Next.js template SVGs in `cubicle/public/`. Renderable substitutes: the two 13-page deck PDFs; offline dev harness `/dev/office` (needs `pnpm dev`).

### Learnings (`lesson-learnt.md`, 12 Sept)
L1: *"Never trust jsdom for anything positional… Extract the geometry into pure functions and unit-test those; verify the rendered result in a real browser."* · L2: *"build a client-only dev harness that mounts the real production components against recorded fixtures, and mount EVERY new UI component into it."* · L5: *"separate `-text` variants from fill/accent variants from the start — one hue can't satisfy both the 4.5:1 text bar and a vivid fill."* · L8: *"The two most important defects this session… were both found by reading the code/reasoning, not by any test… never skip the human-style read-the-diff review just because the gate is green."* · L61: *"Deployment (Stage 10) — PENDING. Blocked on the user's Gemini/Supabase/Vercel."*

### MISSING (Case Study 6)
live URL · deployment · any real end-to-end run · users/activation/return/share/run-time/cost measurements · 5 PM/founder interviews · team member names + Tushar's named role · screenshots · `evals/`, `evaluation-plan.md` · `metrics.sql` · final presentation deck · OG image · D1–D8 design decision labels · updated TC statuses · `scripts/smoke.ts`.

---

## 7. Playground folders (one line each)

- **Mock Interview** (`/Volumes/E Drive/Dev/Code/Claude/Mock Interview`): `shravan-mock-interview/` repo — README *"AI mock interviews for PM candidates, fronted by Shravan Tickoo's voice and avatar. Powered by Rethink Systems."*; Discovery-PRD *"Owner: Tushar (avatar layer)… DRAFT… Not committed."* Remote `https://github.com/teenytinybot/shravan-mock-interview.git`, 4 commits, last 2026-09-10 = a `Revert`. No live URL. **Weak candidate** (team draft, reverted, third-party likeness).
- **Patent** (`…/Patent`): Pratyasa — static showcase for granted Indian patent IN 429867 (sepsis biomarker biosensor); `discoveryPRD.md` *"Author: Tushar Pathak (with Claude) · Revised 2026-08-24"*. Sub-repo `pratyasa-site/` → `https://github.com/007U5H4R/pratyasa.git`, 13 commits, last 2026-09-09. Live `https://pratyasa.vercel.app`. **Candidate: yes** — shipped credibility piece, not an experiment.
- **dino-arcade-pwa** (`…/dino-arcade-pwa`): mobile PWA arcade cabinet (EmulatorJS, BYO ROM). 3 commits, last 2026-09-07. Live `https://007u5h4r.github.io/dino-arcade-pwa/`. **Candidate: yes as playground** (ROM-licensing caveat limits public framing).
- **Slag City** (`…/Slag City`): *"Original arcade beat-'em-up (Phaser 3 + Vite + TypeScript)"*; full 12-stage artifacts; HANDOFF *"Stage 6 Execution — Phase A complete"*. No remote, 65 commits, last 2026-09-14. No live URL. **In-progress playground; nothing shippable yet.**
- **Game** (`…/Game`): planning workspace for Dino Arcade PWA (PRD *"Owner: Tushar Pathak · 2026-08-09 · Personal / hobby project"*) + nested `dino-arcade-pwa/` copy + `neogeo/` BIOS/ROM files (**do not publish**). No remote, 29 commits, last 2026-09-06. **Duplicate of dino-arcade-pwa; use the repo folder.**
- **Graphology** (`…/Graphology`): Tegaki — *"pilot handwriting personality assessment platform"* (Next.js 16 + Supabase + React 19/Tailwind 4; 18 migrations with RLS; Owner Tushar Pathak). Remote `https://github.com/007U5H4R/tegaki.git`, 56 commits, last 2026-09-09. Live `https://tegaki-one.vercel.app`. **Strong candidate — a full shipped product, not a playground.** (Not audited in depth here.)

---

## 8. Summary table

| Project | What | Status | AI? | Discovery evidence | Metrics evidence | Screenshots | Live URL |
|---|---|---|---|---|---|---|---|
| CS1 Token Toli / Guru-pod PRD | Gig-worker & ageing-in-place discovery PRDs (research only) | Research artifacts; no product | No | Y (44 team interviews; Tushar-pod named quotes, validated hypotheses) | Interview counts only | N (embedded figs only) | — |
| CS2 Elder Care / Madhu Mukti / Bhakti-Vilas | Elder-care diagnosis → bhakti-wellness prototype | Static mock-data prototype, live | No | Y (team surveys n=23/47/12; Tushar hypotheses, mentor Q&A) | Survey numbers only; no product metrics | Y (hero images; **no UI screenshots**) | https://bhakti-vilas.vercel.app |
| CS3 Nuptis | Wedding vendor-ops app | Deployed, live, mock data | No | Y (team 7 interviews; Nuptis PRD; risk-tier insight) | N (metrics defined, unmeasured) | Y (8 app shots 1568×661) | https://nuptis.vercel.app |
| CS3 Velora | B2B apparel sourcing marketplace | Deployed, live, mock data | No | Y (Discovery PRD, pivot rationale) | 10/10 unit tests only | Y (8 app shots 720×1070) | https://velora-nu-eight.vercel.app |
| CS4 TeachSpark | WhatsApp bot: Claude-generated differentiated worksheets/papers for Indian K–12 teachers | Deployed; live pilot (Twilio sandbox); status after 09-09 unverified | **Yes** (Claude Sonnet 5 / Haiku 4.5, structured outputs, vision, QC pass) | Y (PRD lineage, persona, A1–A8 assumptions, Blue Ocean) — **no interviews** | **Y** (72→17 signups 23.6%; 8 activated 47%; median 37.5 min saved; 3 referrals; Mixpanel funnel 27→7→4; QA gates 335 tests) | Y (15 discovery/results figs, Mixpanel PNGs, pitch PDF, mp4) | https://teachspark-production.up.railway.app |
| CS5 RailCite | Cite-or-refuse RAG assistant over Indian Railways commercial circulars for CCIs | **Deployed, live, nightly crawl** | **Yes** (Voyage-3 embeddings + pgvector; Claude Sonnet 5 forced-tool extractive synthesis; Haiku classifier; citation validator) | Y (Discovery/Solution/Design/Final PRD, 7 decks) — **no interview artifacts** | Partial (corpus 5,760 docs / 14,406 chunks; threshold calibration; 345 tests) — **no usage/groundedness metrics** | **N** (mascot/icons/decks only) | https://railcite.vercel.app |
| CS6 Cubicle | Multi-agent "AI team" that debates visibly then emits PRD/scan/copy/plan | Code-complete offline; **never run live, not deployed** | **Yes** (Gemini 3.8 Flash agents + 3.5 Flash-Lite orchestrator, search grounding) | Y (46-source research, scored problem matrix, blue ocean) — **no interviews** | Build-quality only (326 tests, QA gates); **zero product metrics** | **N** | — |
| railcite-cron | Canonical newer checkout of RailCite (adds nightly crawl) | Same as CS5 | same | same | same | same | same |

---

## 9. Strongest portfolio candidates and MISSING lists

### 1. TeachSpark (Case Study 4) — strongest overall
The only project with a **full closed loop**: discovery PRD with 8 explicit assumptions → shipped AI product → real, test-handset-excluded pilot numbers → insight→iteration (sign-up form fix, is_test flag) → mentor challenge → Wave 1 response. Rich visuals, honest write-ups, real LLM engineering (structured outputs, QC pass, refusal handling).
**MISSING:** teacher interview notes/counts (planned 8–12, none) · pilot teacher quotes/testimonials · retention curve / K-factor · LLM output-quality eval · verified current live status · production WhatsApp number · local product screenshots (only on `origin/main`) · a single canonical metrics snapshot (24 Aug vs 26 Aug disagree — pick one, cite date).

### 2. RailCite (Case Study 5) — strongest AI-engineering story
Live, real-corpus RAG (5.7k government PDFs, 68% OCR) with an **architecturally enforced cite-or-refuse contract** you can point at in code; a sharp reframe (speed → accountability) grounded in a Railway Board quote; a shipped cross-domain-bleed fix; nightly crawl with drift guards; 345 tests; seven decks.
**MISSING:** any interview/user-testing artifact (the "father + colleagues" claim is unrecorded) · usage/Mixpanel numbers · measured time-to-answer · groundedness/retrieval/latency eval + dataset · product screenshots · mentor feedback · `QA-report.md`/`lesson-learnt.md`/`decisions.md` · fix record for the P0 "starter refuses" defect · refreshed deck figures.

### 3. Case Study 3 — Nuptis → Velora (best "PM judgment" narrative) — with CS1/CS2 discovery as supporting material
Two live products in nine days with a documented kill decision (Red/Blue Ocean), confidence-tagged Discovery PRD, verbatim procurement-manager quotes, and the "queue-time not work" insight. Screenshot-ready. Zero AI, so frame it as PM craft, not AI product work.
**MISSING:** any usage/pilot data · analytics sheet · Tushar-attributed interviews · mentor feedback · Nuptis tests · Velora Figma URL · public repo links.

**Runner-up:** Cubicle (CS6) has the most rigorous discovery writing and a genuine multi-agent design, but never ran live and has no images or users — usable as a "design + build discipline" piece only if framed as unlaunched. **Tegaki (Graphology)** is live and full-stack but was outside this audit's depth; worth a follow-up audit before featuring.

### Cross-cutting cautions
- Several docs are visibly AI-session logs; phrase authorship as "directed/authored with Claude Code" where the artifact says so.
- Mentor grades/feedback exist **only** for TeachSpark (`MentorFeedback.md`); everywhere else MISSING.
- No project has fielded interviews that Tushar personally ran and recorded, except the Case Study 1 Guru-pod PRD (named respondents, count unstated).
- Do not publish: TeachSpark sandbox join code (`TS/docs/pilot/pitch.md:15`), `.env` files, `Game/neogeo/` ROM/BIOS files.

