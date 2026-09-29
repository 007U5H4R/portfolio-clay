# TASK-130 · Product case-study system and new-tab case-study links: final report

**Scope:** Tushar's case-study system spec (`docs/redesign-mockups/m-009/tushar-2026-09-29/case-study-system-spec.md`), run per `docs/briefs/TASK-130.md` on `cloud/task-130`.
- **Per-product audits and narratives** (spec §51 steps 1–5) are in `docs/reports/TASK-130/<slug>.md`, one file per product (13).
- **Screenshots:** `docs/screenshots/m-009/task-130/before/` and `after/`, full page at 1440 and 390 for all 13 case studies (26 each).
- **Benchmark:** RailCite is the quality bar. `railcite-case-study-reference.jpg` was used for layout and density only; its UI and numbers are illustrative, so none of them were copied.

**Where it ran:** a Claude cloud container, following the brief's cloud setup (§1).
- `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"` in every shell. `.env.tooling` was not edited.
- Every Playwright run started its own `next start` on a free `PW_BASE_URL` port (3130–3150). No server was reused.
- `git fetch origin && git merge origin/m-009-redesign` ran before each product and before the final push. Two merges brought changes in: Slag City (`a1f7b38`, TASK-129) and, before the final push, TASK-131/132 (`c9bfd55`, clean). The other fetches found nothing new.
- **Browser workaround:** `pnpm exec playwright install chromium` is blocked by the network policy, and Playwright 1.63 wants Chromium build 1243. The container ships build 1194 under `/opt/pw-browsers`, so `$HOME/.cache/ms-playwright/chromium-1243` and `chromium_headless_shell-1243` are symlinks to it. Nothing in the repo depends on this.
- **Network:** the proxy returns 403 for every live product host (railcite / slag-city / pratyasa `.vercel.app`, the TeachSpark landing on Railway) and for YouTube. **No live captures were possible.** Every product screenshot comes from `docs/case-study-sources/`; the rest of the imagery is TASK-127 covers and this task's hand-drawn SVG. For the products that lacked real screens, a follow-up pass (see *Real product screens from the product repos* below) took them from each product repo's README screenshots, or ran the product locally from its repo.
- **No `archify` skill** is available in this session. Per the brief's fallback, every architecture diagram is hand-authored as an accessible ordered list styled as a flow (see §7).
- **No image generation** was used. All art is hand-authored SVG from `scripts/case-study-art/`.

---

## §53 · The ten points

### 1. Shared case-study components created (`components/case-study/system/`)
| Component | What it is |
|---|---|
| `CaseStudyView` | Composes a page from its record: hero, sticky nav, sections, evidence, CTA, next project. It sets the three accent variables (`--csx-a1..3`) from the record's theme |
| `CaseStudyHero` | Breadcrumb, product code · status line, the one `h1` (keeps the `view-transition-name`), tagline, proposition, framed media (or pivot pair), up to four proof cards with the badge legend, per-theme decor |
| `SectionFrame` | Each section is a `<section aria-labelledby>` with a numbered mark, eyebrow and `h2`. It also renders the legacy chapter anchors (`01-context` … `08-what-i-learned`) as empty spans, so old deep links still land |
| `CaseStudyNav` | Sticky section navigator, ≥ 1024 px only, 44 px targets |
| `EvidenceBadge` + `BadgeLegend` | ● Measured / ◐ Self-reported / ◇ Structural / ○ Prototype (spec §19) |
| `MetricCard` | Value, label, badge, "as of" date and note |
| `ProblemFlow` | The problem as a short step flow, with an optional persona or JTBD quote |
| `ProductShowcase` | Summary, flow, `ProductMediaPlayer` video (YouTube via the existing player; `lib/csp.ts` untouched), up to four framed screenshots, state cards |
| `DecisionCard` | "Could have / Chose / Because", each with its source |
| `SystemFlow` | The architecture diagram (§7) |
| `OutcomeBoard` | Proof cards, an optional funnel chart and the named gaps ("what isn't proven") |
| `PivotFlow` | Killed product ✕ → evidence → decision → the product that survived |
| `ResearchWall` | Research quotes and the one insight |
| `LearningCard` | Two to four learnings |
| `EvidenceDrawer` | "View all evidence" opens a native modal `<dialog>`: Tab trap, Esc, focus returns to the button, `aria-expanded`. Private documents are listed without links; only public sources link out (new tab) |
| `CaseMotion` | One IntersectionObserver that reveals each section once. Under reduced motion (or with JS off) everything renders at rest |
| `CaseStudyCTA` | Live / Watch / Code actions that exist in the record, plus a meta line (role, dates, status) |
| `CaseImageFrame` | Browser / phone / print / plain frames, lazy-loaded, explicit width and height |
| `theme-decor` | Per-theme stamps, stickies, scribbles and paper shapes (static SVG in `public/`, `aria-hidden`, EVAL-018 budget) |

`NextProject` was kept and now opens the next case study in a new tab.

**Removed**, replaced by the above: `CaseStudyHeader`, `MetricStrip`, `OverviewToggle`, `Chapter`, `ChapterNav`, `Learnings`, `Sources`, `lib/sources.ts` and the per-page `SceneOpener`. The artifact components and `ShowTheThinking` stay, because the `/dev` boards still use them.

### 2. Case-study schema (`data/schema.ts`, records in `data/case-studies/`)
- **`CaseStudy`:**
  - `slug` and `story`;
  - `theme {key, metaphor, accents[1–3]}`;
  - `hero {tagline, proposition, proofs ≤ 4, media, layout, pivotFrom?}`;
  - `sections[3–7]`;
  - `evidence ≤ 12`;
  - `extraSources ≤ 6`.
- **Section kinds:** `problem`, `research`, `pivot`, `product`, `decisions`, `system` (5–8 steps), `outcome`, `learnings`.
- **`CaseProof`** needs a `kind` (one of the four badges) and a `source`. `CaseImage` needs a `provenance` string and a path under `/media/case-studies/<slug>/`, or a TASK-127 cover.
- **`validateAll` (`data/index.ts`) now also checks that:**
  - every personal build has exactly one record;
  - every `source` id resolves to the project's own sources or the record's `extraSources` (no clashes);
  - every legacy anchor still resolves in `routes()`;
  - a reused illustration keeps its manifest alt, and its `usedOn` lists the page.
- **Why a separate data file:** records live in `data/case-studies/`, not `data/projects.ts`. The Tushky FAQ answers are hashed over `data/projects.ts`, so editing it would have re-stamped them. `data/projects.ts` was not edited.
- **Unit test `tests/unit/case-studies.test.ts` checks that:**
  - every record parses and resolves its sources;
  - each page is ≤ 600 words;
  - there is no dev copy;
  - every proof has a badge;
  - RailCite's "0 invented citations" is Structural;
  - "625 tests" and "148 tests" appear nowhere.

### 3. Product-specific theme system
- **Shared layer:** `app/work/[slug]/case-study.css` holds the shared `.csx-*` system (typography, spacing, evidence UI, nav and a11y are identical everywhere). It is route-scoped, so no other page pays for it.
- **Per-product layer:** a `.csx[data-theme="<slug>"]` block sets the ground, section-mark shape, hero composition, frames and motion accent.
- **Colour:** every colour is one of the 13 tokens or a `color-mix()` of them (EVAL-020: 0 literals, 13/13 tokens). Accents are chosen per record from the portfolio accent set.
- RailCite's railway vocabulary appears on RailCite only.

| Product | Metaphor | Accents |
|---|---|---|
| RailCite | Railway field notebook / circular archive: engineering grid, a line with station stops, ticket-perforated proofs | rust, steel, kraft |
| TeachSpark | Teacher's workbook: ruled paper, coloured tabs, chat bubbles, a red-pen stamp | forest, rust, note |
| Velora | Sourcing dossier: kraft folder, inspection-stamp numerals, swatch tags, a struck first bet | forest, terracotta, kraft |
| Cubicle | Office OS / workbench: monitor bezel, LED state pills, pinned task cards | navy-2, green-2, note |
| Tegaki | Handwriting studio: genkō grid, brush underlines, a hand-drawn hanko | rust, navy-2, forest |
| Nuptis | Wedding run-sheet: marigold garland edge, rosette numerals, checklist clipboard | terracotta, forest, note |
| Bhakti Vilas | Dawn at a riverside temple: saffron light, diya-flame numerals | rust, note, forest |
| Token Toli | Research field notebook: a paper-plane line, sticky-note findings | green-2, steel, note |
| Pratyasa | Lab notebook and certificate: graph paper, a gold frame | forest, kraft, steel |
| Dino Arcade | Arcade cabinet on a phone: marquee stripes, scanlines, coin-slot numerals | steel, rust, note |
| Cinematic Portfolio | Screening room: dark letterbox hero, sprocket rules, "SC 01" frame counters | forest, note, kraft |
| Campfire Board | Night campsite planning wall: dark ground, index-card columns, ember numerals | terracotta, note, navy-2 |
| Slag City | Coin-op cabinet at night: CRT scanlines, neon HUD frames, molten accents | rust, steel, note |

**Motion** is one-time and viewport-triggered, with a per-theme accent (RailCite's rail scales in, TeachSpark's funnel fills, and so on). `prefers-reduced-motion` and JS-off both render every section at rest (e2e-asserted).

### 4. Pages redesigned
All 13 personal builds, in the brief's order: RailCite, TeachSpark, Velora, Cubicle, Tegaki, Nuptis, Bhakti Vilas, Token Toli, Pratyasa, Dino Arcade PWA, Cinematic Portfolio, Campfire Board, Slag City (merged mid-run from TASK-129).
- `app/work/[slug]/page.tsx` now renders `ProgressBar` and `CaseStudyView` only.
- A build fails if a personal build has no record.

| Page | Words | Sections |
|---|---|---|
| TeachSpark | 563 | problem, product, decisions, system, outcome, learnings |
| RailCite | 534 | problem, product, decisions, system, outcome, learnings |
| Velora | 478 | problem, research, pivot, product, outcome, learnings |
| Cubicle | 588 | problem, research, product, decisions, system, outcome, learnings |
| Tegaki | 449 | problem, product, research, decisions, system, outcome |
| Nuptis | 503 | problem, research, product, decisions, system, outcome, learnings |
| Bhakti Vilas | 466 | problem, research, decisions, product, outcome, learnings |
| Token Toli | 327 | problem, research, decisions, outcome, learnings |
| Pratyasa | 342 | problem, product, decisions, system, outcome |
| Dino Arcade PWA | 269 | product, decisions, system, outcome |
| Cinematic Portfolio | 303 | problem, product, decisions, system, learnings |
| Campfire Board | 261 | problem, product, decisions, system, outcome |
| Slag City | 309 | problem, product, decisions, system, outcome |

Thin records produce short pages on purpose (brief §3: no padding). A page with no recorded learnings has no learnings section.

**New-tab rule (Dev-129).** Every `/work/<slug>` link (with or without `#hash`; `/work` itself excluded) carries `target="_blank" rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)".
- **Where it's applied:**
  - `ProjectCard`;
  - the Portfolio info panel's "Read the case study";
  - `HowIThink`;
  - both links in `EssayBody`, and `ThinkingList`;
  - `ThinkingNode`;
  - Ask Tushky's source links (`EvidenceLinks`, `AskTushky`);
  - `NextProject`.
- **Helpers:** `lib/case-study-link.ts` (`isCaseStudyHref`, `caseStudyLinkAttrs`, `NEW_TAB_HINT`) and `components/common/NewTabHint.tsx`.
- **Test** `tests/e2e/case-study-new-tab.spec.ts`:
  - crawls every public route from `loadRoutes()`;
  - opens the Portfolio info sheet for every product tab;
  - opens Ask Tushky's suggested-answer sources;
  - asserts the attributes and the hint on every case-study link;
  - asserts that clicking one opens a popup and leaves the opener's URL unchanged.

### 5. Copy removed from each page
Across every page, these are gone:
- the 30-second / Deep-dive toggle;
- the eight-chapter deep dive and the "Show the thinking" chain;
- per-chapter artifact cards;
- the shared scene opener;
- the Role/Duration header row (moved to the CTA meta line);
- all dev copy: "Draft", "Pending sign-off", "coming soon", "Hero media coming", "Deep dive coming".

That last removal supersedes Dev-10 on case-study pages and is recorded as **Dev-127**. The footer's "open to work" band is also hidden on case studies, where it repeated the CTA. The template change itself is **Dev-128**.

Page-specific cuts (details and reasons in each `docs/reports/TASK-130/<slug>.md`):
- **RailCite:**
  - learnings cut from five to three;
  - the test count (345/1/2), the stack detail and the Cohort-8 context moved into the evidence drawer.
- **TeachSpark:**
  - the whitespace 2×2, the A1–A8 assumptions, the 17-manual/0-Google split, the Clarity/Mixpanel detail and the fourth learning are cut;
  - the is_test before/after numbers are removed because they mix two snapshot dates;
  - the pitch's "625 tests", the pitch snapshot, the Mixpanel funnel and the sandbox join code are never used.
- **Velora:**
  - the stack list, the ERRC detail, the seven-table schema and the fourth learning are cut;
  - the team's "verify before external use" day counts and the APQC median are not used.
- **Cubicle:**
  - the thinking chain, the contrast metric (drawer only), the eight pre-launch targets (shown only as "never tracked"), the decks mention and three secondary personas are cut;
  - cost and latency estimates stay prose, never proof cards.
- **Tegaki:** the pricing and sign-in screens, the ₹ tiers as copy (only "three depths" stays), the internal prompt name, and the 31-test-files figure (moved to the drawer) are cut.
- **Nuptis:** the stack versions, the Liquid Glass pass, the Vercel/OG lessons, the four-persona list and the fourth learning are cut.
- **Bhakti Vilas:** the "Insure the visit" idea (beyond one quote labelled "proposed, never built"), the competitor note, the 60 % willing-to-pay figure, the stack detail and the clinical `diabetes-cardio.jpg` image are cut.
- **Token Toli:** the TAM sizing, and the 44-interview figure as a proof (it appears only as a labelled gap), are cut.
- **Pratyasa:**
  - the device science (LOD, linear range, RSD, signal retention) stays prose and is never a card;
  - only "IN 429867" is used, never the conflicting SL number;
  - the ffmpeg note is cut.
- **Dino Arcade:** no game names, ROM/BIOS mentions or Chrome T-rex.
- **Cinematic Portfolio:** the site's résumé stats are not repeated; the 197-credit film cost appears only as a build rule.
- **Campfire Board:** nothing implies Tushar wrote Backlog.md (forked with credit).
- **Slag City:**
  - no story character is named, and the intro slides that name one are excluded;
  - the art-generation credit is left out, matching Tushar's TASK-129 edit to the project record.

### 6. Custom assets created
**Hand-authored SVG** (`scripts/case-study-art/`, built by `pnpm exec tsx scripts/case-study-art/build.ts`):
- **RailCite:** circular stamp, refusal stamp, demo poster.
- **TeachSpark:** worksheet sheet, "checked" red-pen stamp.
- **Velora:** swatch tag, "Day 7" stamp.
- **Tegaki:** brush underline, a stroke-drawn hanko (no CJK font dependency).
- **Nuptis:** marigold garland.

**Screenshots** were converted to WebP (q78, sharp) by `scripts/case-study-art/media.ts` from `docs/case-study-sources/`. Every image records its source path in its `provenance` field.
- 35 WebP files. With the SVG art, `public/media/case-studies/` is 1.2 MB for all 13 products together.
- Four products reuse their TASK-127 cover SVG in the hero (RailCite's as its pitch-video poster), and each manifest `usedOn` now lists the case study: RailCite, Cubicle, Token Toli, Dino Arcade.
- `scene-casestudy` stays in the manifest with `usedOn: []` (kept for `/dev/primitives`).

**Screenshot tool:** `scripts/case-study-art/shoot.ts` captures the before and after sets.

**Excluded source images:**
- Velora's `discover.jpg` (third-party certification marks) and `profile.jpg` (a drawn founder avatar);
- Slag City's intro slides (a character name);
- Bhakti Vilas's clinical image.

### 7. Diagrams created
Every diagram is a `SystemFlow`. The `<ol>` of steps is the text alternative, and a `<figcaption>` names what it shows. The schema enforces 5–8 steps; a product without a recorded architecture gets none.

| Product | Steps | Source |
|---|---|---|
| RailCite | Question → Embed + classify → Retrieve → Threshold → Synthesis → Citation validator → Answer or refusal | RC-PIPELINE |
| TeachSpark | Teacher on WhatsApp → Twilio webhook → Express server → Pure state machine → Claude → PDF / DOCX render → Back to WhatsApp | TS-RUNBOOK |
| Cubicle | POST /api/runs → Orchestrator → Four role agents → Stop rules → Four artifact calls → Postgres → Browser | CUB-TECHNICAL-PLAN |
| Tegaki | Google sign-in → Upload two pages → Row-level security → A human reads → Report delivered → Retention job | GR-BUILD |
| Nuptis | Agency UI → Context + reducer → localStorage → Supabase mirror → Nine-table schema | NUP-README |
| Pratyasa | Fact-locked PRD → Required-facts list → Fact checker → Static page → Live site | PT-SITE (§8.8) |
| Dino Arcade | Service worker → Your game file → EmulatorJS → Cabinet shell → On-screen controller | DN-README |
| Cinematic Portfolio | Generate the film → Post-process → 289 scrub frames → Smooth scroll → Static fallback | CN-LEDGER |
| Campfire Board | projects.json → backlog/ folders → Bun-compiled CLI → Embedded React UI → Board, Gantt, Workflow, Stats | CF-README |
| Slag City | Keyboard · gamepad · touch → One input frame → Pure core → Phaser 3 scene → Web Audio | SC-README |

- **No diagram (no recorded architecture):** Velora, Bhakti Vilas, Token Toli. Velora gets its pivot flow instead.
- **Other flows:**
  - problem and product flows: TeachSpark's seven-step WhatsApp loop, RailCite's lookup, Velora's "how a founder finds a factory today";
  - TeachSpark's activation funnel chart;
  - Velora's pivot flow.

### 8. Evidence sources used
Every claim traces to a `source` id in `data/projects.ts` (or a record's `extraSources`, each mapped to CONTENT_INVENTORY §8), and `validateAll` fails on an unresolved id. The claim → source tables are in each product report.

| Product | Drawer rows | Main sources |
|---|---|---|
| RailCite | 12 | Discovery and Final PRDs, Design North Star, query pipeline, synthesis prompt, citation validator, threshold calibration, UX critique, test run, live `/api/stats`, nightly-crawl design, build ledger |
| TeachSpark | 11 | Discovery, Solution-Space and Final PRDs (one snapshot: 2026-08-24, test handsets excluded), WhatsApp loop, runbook, question-paper adapter, QA phase-6 gate, mentor feedback, build series, pitch deck, live pilot |
| Velora | 9 | Velora PRD, Apparel Discovery PRD, team PRD (labelled team research), nine-day series, Nuptis PRD, README, Supabase notes, final review, live app |
| Cubicle | 9 | Discovery PRD, research notes, technical plan, decisions log, package.json + gateway, QA report ("conditionally ready"), HANDOFF, lessons learnt, buildathon brief |
| Tegaki | 5 | Discovery and Solution PRDs, README, the build (package, migrations, tests), live pilot pages |
| Nuptis | 11 | week-4 brief, PRD, procurement notes, PM strategy plan, DESIGN.md, README, app screenshots, mobile-sweep note, self-feedback, nine-day series, live app |
| Bhakti Vilas | 11 | brief, elder-care case study, refined and category hypotheses, team synthesis, primary research, solution doc, team PRD, build memory + audit, mentor Q&A, README |
| Token Toli | 5 | three discovery PRDs (Guru pod, bet and findings, team), research tracker, seven-day series |
| Pratyasa | 3 | fact-locked Discovery PRD, global constraints, the page + fact checker |
| Dino Arcade | 2 | README, Slag City Discovery PRD |
| Cinematic Portfolio | 3 | PRD, build ledger, poster frames |
| Campfire Board | 3 | README, pilot checklist, screenshots |
| Slag City | 4 | README, Discovery PRD, deploy notes, critique captures |

Private documents are listed in the drawer without links. Only four drawer rows link out, all to public live apps: RailCite, TeachSpark's pilot landing, Velora and Nuptis. Elsewhere on the page, only the CTA's live app, YouTube and public-repo actions link out, and only where the project record has them.

### 9. Responsive behaviour
- **390 px (< 768):**
  - single column; the hero's media follows the copy;
  - hero proofs sit two-up, with an odd last card spanning the row;
  - outcome proof cards become a horizontal, snap-scrolling, keyboard-focusable region (`role="region"`, labelled; spec §34);
  - problem flows and the architecture diagram are vertical lists;
  - screenshots stack; phone frames are capped at `min(260px, 72vw)`;
  - decorative paper shapes are hidden; the section nav is hidden;
  - no horizontal overflow and ≥ 44 px targets (e2e-asserted at w390).
- **768 px:** problem flows go three-across; screenshots sit two- or three-up; state, decision and learning cards go two-up (three-card sets stay single-column until 1024).
- **≥ 1024 px:**
  - split hero (or pivot / stacked, per record) and the sticky section nav;
  - the architecture diagram runs horizontally;
  - outcome proofs go up to four-across.
- **1440 px:** the site's 1200 px container (`--container-max`).
- **JS off:** everything renders at rest. The evidence section still shows the evidence-type chips; the drawer needs JS. With JS off, the e2e test asserts the `h1`, every section heading and the next-project link on all 13 pages.

### 10. Remaining products that need source information from Tushar
The pages say what isn't proven rather than fill gaps. These are what would make them stronger:
- **RailCite:** usage data after launch. Latency and groundedness evals are named as gaps. (Real UI is now on the page from the repo's README screenshots.)
- **TeachSpark:**
  - the teacher interviews (none recorded);
  - LLM output-quality evals;
  - D1 retention;
  - whether the Railway pilot is still up after 9 Sep 2026;
  - a product demo video.
- **Velora:** any user or pilot contact. Trust verification is out of scope by design.
- **Cubicle:** a live run. The page now shows the real UI run locally, but the finished-run capture replays the repo's hand-built test fixture and says so.
- **Tegaki:** pilot counts and learnings (none recorded, so no learnings section).
- **Bhakti Vilas:** UI screenshots. Its repo (`teenytinybot/Bhakti-Vilas`, an org account) isn't reachable from this session and the live site is blocked, so it still has none. The prototype imagery is captioned as illustrative.
- **Token Toli:** nothing blocking; the page is short by design.
- **Pratyasa:** the Soft Matter paper DOI (CONTENT_INVENTORY §8.8 MISSING); confirmation that the repo is public.
- **Dino Arcade:** a reviewed test run. In-game screens can't be shown: the app ships no game, and the cabinet's marquee carries a licensed title (cropped off the capture now on the page).
- **Campfire Board and Slag City:** usage and learnings (none recorded).
- **Cinematic Portfolio:** nothing blocking.

---

## Real product screens from the product repos (follow-up, 2026-09-29)

Tushar asked for real product screens: "use chrome or you have the product URL, if nothing is there then generate from the Product project repo", and pointed to the READMEs.

- **Live URLs, tried first:** the environment's network policy denies them (HTTP 403 on CONNECT for `railcite.vercel.app`, `pratyasa.vercel.app`, `slag-city.vercel.app`, `007u5h4r.github.io` and the TeachSpark Railway host). The fix is on the environment side: *Network access* in the cloud environment's settings, or an allowed-domains entry for those hosts.
- **Product repos, used instead:** each was cloned read-only at the commit named in `docs/case-study-sources/INDEX.md`, where every file's provenance is recorded.

| Product | Source | Now on the page | Handling |
|---|---|---|---|
| RailCite | README screenshots (`railcite@0112a6f docs/screenshots`) | Product section: the cited answer; the Sources panel with "Verified text" cards | Crops remove the signed-in account name, the mouse cursor and the floating nav. The home screen was not used (it greets the account by name) |
| Pratyasa | README screenshots (`pratyasa@f1ca4d5`) | "The page" section: the top of the live page | The evidence capture was not used: it lists the co-inventors' names. The browser scrollbar is cropped |
| Cubicle | No README screenshots. Run locally from `cubicle@6779998` (`next dev`, placeholder env values, no API keys, no database) | Product section: the idle home ("What are you building?"), and the office after a run (four desks Done, the PRD) | The finished-run view is `/dev/office` replaying the repo's **hand-built test fixture**. Its caption says "not a live run", and no claim changed. The dev stepper controls and the dev badge are cropped off. The transcript isn't shown (fixture timestamps render as "20725d ago") |
| Dino Arcade | No README screenshots. Served locally from `dino-arcade-pwa@0bd1368` (`python3 -m http.server`), 844×390 landscape phone | Product section: the cabinet's "Insert Coin" screen, beside the home-screen icon | The marquee shows a licensed game title, so it is cropped off. No game file was loaded (the app ships none). The theme's layout now gives the wide capture the row |
| TeachSpark | README screenshots exist (landing, how it works, join, demo, Spark Lab) | Unchanged | The page already uses the real mobile landing as its hero |
| Bhakti Vilas | Repo `teenytinybot/Bhakti-Vilas` not accessible to this session; live site blocked | Unchanged | Still needs UI screens from Tushar |

Checks after the change:
- typecheck, lint and the token check are clean;
- unit tests: 707 passed;
- build OK;
- case-study e2e (`case-study-system`, `case-study`, `eval-006` axe, `eval-008`, `eval-018`, `sweep`): **607 passed, 0 failed**; with `fallback-glyphs` and `eval-010`: 675 passed;
- "after" screenshots retaken for RailCite, Cubicle, Dino Arcade and Pratyasa.

## Per-product narrative choices
The dominant story (spec §41) for each product, with the one call that shaped each page. Detail is in `docs/reports/TASK-130/<slug>.md`.
- **RailCite:** *trust*. "0 invented citations" is ◇ Structural ("by construction", the validator rejects any citation not in the retrieved set), never ● Measured. The critique's P0 is named in the gaps.
- **TeachSpark:** *AI into real classroom work*.
  - One snapshot only: the Final PRD pilot of 2026-08-24, test handsets excluded.
  - Time saved is ◐ Self-reported.
  - The pilot's shortfall against its own targets is stated in the outcome.
- **Velora:** *killing the wrong bet*, told as the Nuptis → Velora pivot.
  - **"Vendor Passport" is not a product and gets no page.** The portable-trust story it pointed at is told inside Velora as "the bet: portable trust", with the record's own caveat: scores are authored, not verified.
  - Velora is apparel sourcing and vendor onboarding, not lifestyle.
  - Team research is labelled as team research.
- **Cubicle:** *visible collaboration (built, not launched)*. The status is "Built, not launched", and ○ Prototype badges mark what was never run live.
- **Tegaki:** *a human craft, carefully productized*. "A human reads" is a step in the system; no AI-grading claim.
- **Nuptis:** *risk-tiered vendor ops, the bet that lost*. It links forward to Velora, and its metrics are shown as defined, never measured.
- **Bhakti Vilas:** *devotion as behavioural health*. Team credit is exact (5 of 8 commits); the funnel is captioned as directional estimates.
- **Token Toli:** *discovery that didn't win, and why that's useful*. No respondent names, ages or cities.
- **Pratyasa:** *a true record of real work*. Tushar is a contributor, not owner: "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic" is quoted verbatim.
- **Dino Arcade:** *a cabinet in your pocket, and why it can't ship games*. BYO-ROM is the load-bearing decision; it leads to Slag City.
- **Cinematic Portfolio:** *answering "who is Tushar?" in one scroll*. The film is AI-generated footage of Tushar, as the record states.
- **Campfire Board:** *one dashboard for every project*. The pilot is two throwaway projects, marked ○ Prototype.
- **Slag City:** *a publishable arcade game, built like a cabinet*. Its own cabinet styling keeps it distinct from Dino Arcade.

## Verified vs judgement
**Verified (tests or tools):**
- every claim resolves to a declared source id (`validateAll`, unit test);
- ≤ 600 words per page;
- no dev copy (unit + e2e);
- every proof has a badge;
- no "625 tests" or "148 tests";
- one `h1` and labelled section landmarks;
- the drawer's focus trap, Esc and focus return;
- no private links;
- the new-tab rule on every crawled route;
- EVAL-006 axe on all 13 at four widths;
- EVAL-008 overflow and target sizes;
- EVAL-018 decoration budget;
- EVAL-020 colour tokens;
- EVAL-021 illustration manifest;
- the bundle budget;
- reduced motion and JS-off rendering;
- legacy anchors resolve.

**Judgement (mine, recorded so Tushar can overrule):**
- the dominant story and metaphor per product;
- which facts are headline proofs and which go to the drawer;
- the badge chosen for each proof, where the record's wording allowed more than one (for example, build-day counts as ◇ Structural);
- which source screenshots to use and how to crop them;
- the accent choices;
- hiding the footer hiring band on case studies (Dev-127);
- Velora's "portable trust" framing of the Vendor Passport idea;
- tightening Pratyasa's diagram to five steps by adding its live URL;
- leaving Slag City's art credit out, following the TASK-129 record edit.

**Review loop (spec §50):** each page got the checklist pass and at most two refinements.

Refinements made:
- **Accuracy:**
  - TeachSpark's "from day one" and "Monday's" wording;
  - Velora's asOf date;
  - Pratyasa's rules;
  - Cinematic and Campfire interpretive lines;
  - a guessed Nuptis table note.
- **Word count:** a Cubicle trim to fit 600 words.

Still short (source-limited, see §10):
- Bhakti Vilas lacks real product UI (repo not reachable from this session);
- five pages have no learnings section.

## Gates
All gates were run on the final tree (after the `c9bfd55` merge unless noted).

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `pnpm tokens:check` | 13/13 tokens round-trip OK |
| `pnpm test` (Vitest) | 65 files passed, 1 skipped · **707 passed**, 4 skipped |
| Content gate (`scripts/validate-content.ts`) | OK (projects 16, tushky-faq 21/21 fresh) |
| `pnpm build` | all routes static (17) |
| Bundle budget (≤ 180 kB gz first-load JS) | `/` 161.2 kB · `/projects` 169.8 kB · `/work/railcite`, `/work/teachspark`, `/work/velora`, `/work/slag-city` 158.3 kB each |
| Full `pnpm test:e2e` (w390, w768, w1024, w1440; 3,000 tests, 2 workers) | **1,294 passed, 24 failed, 1,682 skipped** (the per-width `test.skip` rules). See the breakdown below |
| Re-run of every spec with a real failure, on the rebuilt tree | **785 passed, 0 failed**: `fallback-glyphs`, `how-i-think`, `eval-010`, `layout`, `projects`, `case-study-system`, `case-study-new-tab`, `case-study`, `eval-006`, `eval-008`, `sweep`, `eval-018` |
| After the final base merge | `projects`, `case-study-new-tab` and the Portfolio specs: 31 passed |

**The 24 full-run failures:**
- **Real, fixed and re-verified (17):**
  - `fallback-glyphs` `/work/teachspark` ×2: a mono stack on the shared labels triggered a system font search. They now use the body face (`426c77f`).
  - `eval-010` hover sweep ×11 (every case study whose CTA has an action; Cubicle and Token Toli passed): the CTA's hover lift ran under reduced motion. It's now behind `prefers-reduced-motion: no-preference` (`bdc4dec`).
  - `layout` band footer ×1: quote attributions were `<footer>` elements. They are now `figcaption` (`8472aea`).
  - `projects` ×1: the spec still expected same-tab navigation to the case study. It now asserts the new tab (`f872490`).
  - `how-i-think` ×2 at w390: Playwright trace-file `ENOENT`, caused by my solo re-run clearing `test-results/` mid-run. Both pass alone.
- **Environmental (7), re-run alone and failing the same way:**
  - `eval-014` ×1: `spawnSync ffmpeg ENOENT`; ffmpeg isn't installed in the container.
  - `portfolio-video` Campfire Board ×2 and Slag City ×2: the YouTube player ends in state `error` because YouTube is blocked. Slag City's product and GitHub popups also can't reach their hosts. These are existing TASK-124/129 tests on `/projects`, not TASK-130 code.
  - `playground` live-URL HEAD ×1: HTTP 403 from the proxy.
  - `eval-011` dead controls ×1: all 60 "dead" controls are external links answered HTTP 403 by the proxy (Credly ×22 per width, vercel.app, github.io, Railway). No internal control is dead. The only case-study control among them is TeachSpark's "Live product" link, blocked the same way.

All seven environmental failures need network access to YouTube and the product hosts, or ffmpeg, to go green. A local run on Tushar's Mac should pass them.

**EVAL-006 axe** runs on all 13 case studies at all four widths (`eval-006`, `case-study`, `sweep`), with 0 critical/serious violations.

**Screenshots:** the brief's before/after sets are in `docs/screenshots/m-009/task-130/`. "Before" is the old template, captured before any change. "After" was retaken on the final build. The e2e specs also rewrite tracked evidence PNGs elsewhere under `docs/screenshots/`; those were restored after every run, so this branch doesn't touch them.

## Follow-ups (not done in this task)
- **Unused legacy CSS:** the old `.cs-*` case-study styles in `app/globals.css` no longer render anywhere. Removing them was left out to keep this diff reviewable.
- **Themed mono labels:** the retro themes (Cubicle, Dino, Cinematic, Slag City) use a platform monospace stack as a motif. On Linux that face comes from a system font search. Only `/` and `/work/teachspark` are fallback-glyph gated, and TeachSpark now uses the body face. A mono web font, or naming the platform faces, would close this for the others.
- **Live captures:** the network policy blocks the live product hosts, so nothing was captured live. Allowing those hosts, or a local run on Tushar's Mac, would allow live captures, and would give Bhakti Vilas its first UI screens.

## Commits
All on `cloud/task-130`, pushed after each product. `m-009-redesign` and `main` were never pushed to or merged into.

| Commit | Subject |
|---|---|
| `a759503` | Build the case-study system and the RailCite one-pager (TASK-130) |
| `a1f7b38` | Merge `origin/m-009-redesign` (brings in Slag City, TASK-129; the `ask-panel.spec` conflict was resolved keeping both intents) |
| `2fd9c5e` | Give TeachSpark its classroom-workbook case study |
| `467c216` | Tell the Nuptis → Velora pivot as its own case study |
| `217f899` | Give Cubicle an honest office-OS case study |
| `5cdb850` | Give Tegaki a handwriting-studio case study |
| `6fd3561` | Give Nuptis its wedding run-sheet case study |
| `b3cb1bb` | Give Bhakti Vilas a dawn-temple case study |
| `6ce0d7c` | Give Token Toli a short discovery-only case study |
| `04cbf04` | Give Pratyasa a patent-record case study |
| `e126187` | Give Dino Arcade a short cabinet case study |
| `3b34e25` | Give the Cinematic Portfolio a screening-room case study |
| `8154c40` | Give Campfire Board a campsite planning-wall case study |
| `379ee6f` | Give Slag City a coin-op cabinet case study |
| `426c77f` | Retire the chapter template for the case-study system; fix mono and diagram gates |
| `bdc4dec` | Keep the case-study action lift behind prefers-reduced-motion |
| `8472aea` | Caption case-study quotes with figcaption, not footer |
| `f872490` | Expect the Portfolio case-study link to open a new tab in projects.spec |
| `c9bfd55` | Merge `origin/m-009-redesign` (TASK-131, TASK-132; clean) |
| `2bb569e` | Retake the TASK-130 after screenshots on the final build |
| `729df06` | Add the TASK-130 final report |
| `dc995fe` | Show real product screens for RailCite, Cubicle, Dino Arcade and Pratyasa (follow-up) |
| *(last)* | This report update |

Every TASK-130 commit subject names the task (table abbreviated), and every commit ends with the `Co-Authored-By: Claude Opus 5.5` and `Claude-Session` trailers.

**Checks between products:** each intermediate product commit was verified with targeted gates (unit, typecheck, lint, tokens, build, and that product's system, axe and new-tab specs) before its push. The full four-width e2e suite ran on the final tree.
