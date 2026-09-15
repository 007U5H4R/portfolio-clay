# Decision Log — Clay Portfolio

## S1 · Second site on its own domain — accepted
**Context.** A cinematic scroll-film portfolio is already live at tushar-pathak.vercel.app (shipped 2026-08-26). The brief describes a completely different multi-route claymorphism site.
**Decision.** Build the clay site as a separate product in a new repo, deployed to a new Vercel project/domain. The cinematic site and the vanilla glassmorphism `portfolio/index.html` stay untouched.
**Rejected.** Replace the live site (Tushar wants both to exist); rebuild in place (tangles the live git history and violates that repo's no-build-tools rule).

## S2 · Next.js + TypeScript + Tailwind + Framer Motion — accepted
**Context.** The old project CLAUDE.md mandates plain HTML; the brief prefers Next.js. The site needs multi-route case studies, data-driven `/work/[slug]`, shared-element transitions, image/video optimisation and a pluggable Ask-AI adapter.
**Decision.** Next.js 16 (App Router, static generation), TypeScript, Tailwind 4, `motion` (framer-motion) 13, lucide-react. New repo `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/`.
**Rejected.** Static HTML (manual multi-page upkeep, no image pipeline); Astro (weaker motion story for this brief).

## S3 · Three featured on home, every project on /work — accepted
**Context.** Brief §14/§38 limit the homepage to 3 projects; Tushar wants all projects displayed with live URL + demo video.
**Decision.** Home features TeachSpark, RailCite and Nuptis→Velora (Cubicle swaps in only if it is deployed with screenshots). `/work` lists all 11 personal builds plus clearly separated professional-experience entries, each with live URL, status badge and demo video.
**Rejected.** All projects on the homepage (breaks the whitespace rule); compact strip on home (adds a second project surface to maintain).

## S4 · Generate the clay avatar from photo.jpg — accepted
**Context.** Brief says "use my supplied claymorphism avatar"; none was supplied. Only `portfolio/photo.jpg` exists (identity reference already uploaded to Higgsfield).
**Decision.** Generate 3–4 semi-realistic clay portrait candidates from photo.jpg (Higgsfield/Recraft), Tushar picks one; every credit spend is approved first. Until then a clearly marked placeholder.
**Rejected.** Real photo in a clay frame (loses the material language); wait for a user-supplied file (blocks the tracer bullet).

## S5 · GitHub links wired but hidden until repos are public — accepted
**Context.** railcite, teachspark and cubicle are private repos; public links would 404.
**Decision.** `github` field lives in project data; the UI renders it only when `repoPublic: true`. Flip per project after visibility changes.
**Rejected.** Make public now (secrets/ROM scrub not yet done); drop code links entirely (weakens "actually builds").

## S6 · Demo videos are screen-recorded by Claude — accepted
**Context.** Only TeachSpark has an mp4. Tushar wants a demo video per project.
**Decision.** Record 20–40 s walkthroughs of each live app via browser automation; encode to ≤4 MB mp4 (+ webp poster); Cubicle requires a local run. Missing videos render as poster + "demo coming" state, never a broken player.
**Rejected.** Videos for featured three only; user-supplied videos (blocks progress).

## S7 · Ask-my-portfolio is deterministic, behind an adapter — accepted
**Context.** Brief: "Do not fake AI responses… build a deterministic local knowledge experience first, architect it so RAG can be integrated later."
**Decision.** `AnswerProvider` interface; v1 ships `LocalKnowledgeProvider` (intent/keyword match over sourced Q→A pairs with evidence links, honest "not in the portfolio yet" fallback). UI copy says answers come from portfolio content. A `RagProvider` hitting `/api/ask` is a future drop-in.
**Rejected.** Live LLM in v1 (cost, hallucination risk, no eval set yet); a chatbot widget (brief forbids).

## S8 · Positioning: Senior Product Manager — accepted
**Context.** Three titles exist: "AI Product Manager" (old CLAUDE.md), "Enterprise Product Leader – GenAI & Cloud" (resume + live site), "Senior Product Manager" (brief).
**Decision.** Site uses "Senior Product Manager" with supporting line "Product Thinker · AI Builder · Problem Solver". Known inconsistency: the linked resume PDF still says Enterprise Product Leader — Tushar to update the PDF or accept.
**Rejected.** "AI Product Manager" (brief forbids as primary).

## S9 · Dark mode deferred to v1.1 — accepted
**Context.** Brief §10 lists a theme toggle in the header. Claymorphism dark mode is a second full material system (shadows, highlights, gradients all invert) and doubles visual QA.
**Decision.** v1 ships light-only with tokens structured for a dark palette; the toggle is added with the dark theme in v1.1. Accepted with the PRD on 2026-09-15 (no override given).
**Rejected.** Ship an unpolished dark theme (undermines "premium").

## S10 · Contact = mailto + LinkedIn, no form backend — accepted
**Context.** Brief §31/§47 mention forms; a contact form needs a backend or third-party service and spam handling.
**Decision.** `/contact` offers copy-email, mailto, LinkedIn and resume download. A form can be added later via a provider if wanted.
**Rejected.** Form with serverless mailer (extra service, secrets, spam surface for v1).

## EV1 · Evaluation categories: functional · product-acceptance · performance · design · content-integrity; no AI layer — accepted
**Context.** Stage 3 must select only the layers the product warrants. The site is static with a deterministic Ask feature; the central risks are "toy vs premium", performance under clay/motion/video, and invented claims.
**Decision.** Seventeen EVAL cases (EVAL-001…017) across functional, product acceptance, performance, design/a11y, light reliability, light security, and a project-specific **content-integrity** layer enforced at build time (zod + forbidden-string test). No AI evals until a RAG provider ships.
**Rejected.** Full AI eval suite now (nothing is generated); functional tests only (would miss the 5-second/premium/whitespace judgments that decide whether the site works).

## EV2 · Release thresholds and critical failures — accepted
**Context.** Gates must be defined before code so they can't be bent later.
**Decision.** Lighthouse ≥ 90/95/95/95 on four routes (mobile + desktop), axe 0 critical/serious, zero dead controls, 11/11 Ask prompts answered with ≥2 evidence links and 0 fabrications, 6/6 five-second checklist at 390 and 1440, avatar likeness confirmed by Tushar, content-integrity gate proven by a failing fixture. Baseline captured on the tracer bullet; `pnpm eval` reruns on every behaviour-changing ticket. Thresholds are never lowered to pass.
**Rejected.** Softer Lighthouse targets (the brief sets these numbers); eyeballing motion/clay additions without a baseline.

## D1 · Clay tier system as the anti-"toy" mechanism — accepted
**Context.** DESIGN_DIRECTION §9 risk 1 ("clay tips into toy") needed a mechanical guardrail, not just a stated intention, before component work begins.
**Decision.** `Design.md` §2 fixes four clay tiers (hero/card/utility/flat) as a hard token-level gate: every component is assigned exactly one tier, and text-heavy zones (case-study bodies, essays, tables) are locked to flat with zero clay tokens available. This is enforced structurally (which token set a component reads), not by design review alone.
**Rejected.** A single clay style used everywhere with "restraint" left to visual judgment during build (too easy to erode ticket by ticket without a mechanical check).

## D2 · OKLCH tokens hand-computed, hex remains authoritative — accepted
**Context.** No colour-conversion tool was available in the t-design pipeline step; DESIGN_DIRECTION's palette is specified only in hex.
**Decision.** `Design.md` §2 derives OKLCH values via manual sRGB→OKLab conversion (accurate to ~±0.5%) so the `@theme` block is implementation-ready now, and flags them for regeneration with an exact converter before the token file is locked in Stage 6/7. Hex values are unchanged and remain the source of truth.
**Rejected.** Blocking Design.md on tooling access (delays Stage 5/6 for a mechanical, easily-fixed-later precision gap); shipping hex-only tokens (Tailwind 4 `@theme` and the brief's OKLCH requirement both expect OKLCH as the primary token form).

## D3 · Mobile `AskPanel` is a bottom sheet, not a right drawer — accepted
**Context.** COMPONENT_ARCHITECTURE fixes `AskPanel` at 400–480px wide; that cannot render as a right-side drawer on a 390px viewport without covering the whole screen and losing "page stays visible."
**Decision.** Below 768px, `AskPanel` becomes a bottom sheet (90vh, slides up, same scrim/state machine as desktop). Right-side drawer behaviour is unchanged at ≥1024/768–1023 per the original spec's intent (page visible behind, right-anchored).
**Rejected.** Force the fixed-width drawer at all widths (breaks "page visible" and Fitts's-Law thumb-reach on mobile); a full-screen takeover modal (loses the deliberate "not a chatbot widget, not a centered modal" requirement from the brief).

## D4 · `ShowTheThinking` is vertical-only at every breakpoint — accepted
**Context.** The brief frames Show-the-thinking as "one of the portfolio's signature interactions" with 8 sequential nodes; a horizontal desktop variant was considered for visual interest.
**Decision.** Render all 8 nodes as a single vertical list regardless of viewport, so the interaction stays fully keyboard- and screen-reader-operable without a separate horizontal-scroll affordance and matches its own "sequential reveal, read top to bottom" logic.
**Rejected.** Horizontal scroll-snap variant at ≥1024 (adds keyboard-navigation surface for no comprehension benefit — the sequence is linear, not spatial).

## D5 · Avatar: standing-D selected as the hero portrait — accepted
**Context.** Decision S4 required identity-referenced clay candidates approved by Tushar. Four were generated on Higgsfield (Nano Banana Pro route, 4:5, 8 credits total) from `portfolio/photo.jpg`; provenance in `content/media/avatar/candidates/README.md`.
**Decision.** `standing-D` (job 4f4d066f-9a1d-461a-975f-be475d5aa4c2) is the hero avatar — closest likeness (eye shape, jaw, expression), pale background, standing beside a desk with two books, laptop and plant (the ≤3 supporting objects). Source saved as `content/media/avatar/avatar-source.png`; background removal + WebP export happen in the asset ticket. Tushar confirmed likeness 2026-09-15.
**Rejected.** seated-A/B (weaker likeness — dot eyes, more cartoon); standing-C (deeper lavender background, near-identical likeness).

## PB1 · Visual gate blocks visual foundations only — accepted
**Context.** Stage 5 (2026-09-15) asked whether the tracer-bullet visual-direction gate (TKT-02) should block all of M-002. The schema/zod gate (TKT-03) and the eval harness (TKT-07) have no visual surface but sat behind the gate, idling capacity while Tushar reviewed.
**Decision.** TKT-03 and TKT-07 depend on TKT-01 (tracer scaffold) only and may run while the gate is pending. Clay primitives (TKT-04), layout/reveal (TKT-05), SEO/OG (TKT-06) and every visual ticket still depend on TKT-02 approval. The dead-control crawler reads a static route list until the sitemap exists.
**Rejected.** Strict gate over all of M-002 (wastes the review window on work the gate cannot change); unblocking TKT-04/05 too (the gate exists precisely to fix tokens/tiers before primitives are built).

## PB2 · Five thin case studies merged into one ticket — accepted
**Context.** Eleven content tickets, one per case study, were proposed. Token Toli, Pratyasa, Tegaki, dino-arcade and cinematic-portfolio have thin evidence packs (1–2 sp each) and would cost more in onboarding overhead than in authoring.
**Decision.** They become one ticket, TKT-54 (Task, sp:5), with one task per project (TSK-25…29), each still naming its `CONTENT_INVENTORY.md` §8 pack and MISSING list. TKT-34…38 are retired in the mapping table ("merged into TKT-54") and their IDs are never reused; nothing existing is renumbered.
**Rejected.** Eleven separate tickets (five near-empty Backlog items); renumbering the remaining tickets (breaks the stable-ID rule before onboarding).

## PB3 · Ask keeps 11 prompts; three authored from VERIFIED rows — accepted
**Context.** EVAL-012 expects 11 suggested prompts (home 5 + panel 6); `CONTENT_INVENTORY.md` §9 holds 8 answers. Either the threshold drops to 8 or three more prompts are authored.
**Decision.** TKT-09 authors three additional entries strictly from VERIFIED rows — "What did you learn when an assumption failed?", "How do you evaluate an AI product?", "What is your research background?" — flagged `draft:true` until sign-off. The EVAL-012 threshold stays at 11; it is not lowered.
**Rejected.** Lowering EVAL-012 to 8 (thresholds are never weakened to pass — EV2); inventing answers without sources (truth rule).

## PB4 · Demo videos are soft for content, hard for deployment (featured three) — accepted
**Context.** Media captures (recordings, screenshots) could block content authoring, or content could ship with DemoVideo's honest "Demo coming" state. RailCite and Bhakti-Vilas additionally have no product screenshots yet.
**Decision.** Every media ticket is a soft dependency of its content ticket; missing video renders the `no-video` state and missing screenshots render a labelled hero placeholder. The TeachSpark, RailCite and Velora videos (TKT-22/23/24) are hard blockers of the deployment ticket TKT-50 (and therefore production TKT-53) — the site does not go public without demos for the three featured projects. TKT-50's pre-deploy check enforces presence and the ≤4 MB budget.
**Rejected.** Every video a hard blocker of its content ticket (serialises authoring behind capture sessions); no deployment gate on videos (featured cards promising demos that do not exist).

## PB5 · Resume placeholder until the sanitised PDF exists — accepted
**Context.** The current `resume.pdf` contains DOB, phone and address and prints the wrong patent number; the sanitised export depends on Tushar. The tracer bullet's "Download Resume" CTA needed a target that is neither a dead control nor a PII leak.
**Decision.** A single `lib/site.ts` flag `resumeAvailable` (default `false`) drives every resume control. While `false`, controls render a labelled "Resume — updating" secondary button linking to `/contact#resume`; no resume file exists in the repo or any build. TKT-08 flips the flag when the sanitised PDF lands. Explicit acceptance criterion on TKT-01 (AC 10); TKT-50 keeps a deploy-time hard check (no PDF that fails the PII test, no `true` flag without a passing PDF); TKT-08 hard-blocks production (TKT-53) because EVAL-002 requires `/resume.pdf` 200.
**Rejected.** A git-ignored local copy of the current PDF (one mis-configured deploy away from publishing PII); blocking Contact/preview deploys on the PDF (delays everything on a Tushar-side task the placeholder already covers).

## TP0 · PWA onboarding — accepted
**Context.** Stage 6.2 requires the project in the Campfire Board PWA with stable IDs before technical planning proceeds. Backlog.md allocates its own task IDs, so the provisional `TKT-##`/`TSK-##` labels in `tickets.md` needed a recorded, never-regenerated mapping, and the PWA models only a subset of the ticket fields.
**Decision.** Onboarded 2026-09-15 via the Backlog CLI only (`backlog init --defaults --no-git --integration-mode none`, `milestone add`, `task create`), registered as `portfolio-clay` in the fork's `projects.json` (backup `projects.json.bak-2026-09-15`). Native IDs are canonical from now on: M-001…M-007 → `m-0`…`m-6`; TKT-01…TKT-33 → `TASK-1`…`TASK-33`, TKT-54 → `TASK-34`, TKT-39 → `TASK-35`, TKT-40…TKT-53 → `TASK-36`…`TASK-49`; sub-tasks `TASK-<parent>.<k>` (e.g. TSK-01 → `TASK-1.1`, TSK-25 → `TASK-34.1`). TKT-34…38 retired → TKT-54, never created. The authoritative machine-readable mapping is `backlog/id-map.json`; `tickets.md` §0.4 mirrors it. Conventions: (1) priority is mapped P0/P1 → `high`, P2 → `medium`, P3 → `low` and the `Pn` label is always kept, so the finer four-level priority survives the PWA's three levels; (2) `sp:<n>` is a label on every ticket and sub-task, 1 sp = 1 hour on the Campfire hours-axis Gantt, which schedules top-level tickets; (3) only hard blockers (`→` in tickets.md Appendix A) are Backlog dependencies — soft `⇢` edges stay in the Markdown. Acceptance criteria travel as `--ac` items; DoD, TC/EVAL links and blockers stay in `tickets.md`/`milestones.md` (PWA capability boundary).
**Rejected.** Hand-writing task files or pre-reserving IDs (forbidden by the fork's own rules and the stable-ID convention); customising the status set (default `To Do / In Progress / In Review / Blocked / Done` kept); putting `sp:` only on sub-tasks (the Gantt would show no effort for tickets); creating placeholder items for the retired TKT-34…38 (IDs are retired, not reused).

## TP1 · Static generation on the default Next build, not `output: 'export'` — accepted
**Context.** S2 and COMPONENT_ARCHITECTURE say "static generation / static output". Read literally as `output: 'export'`, that disables `next/image` optimisation (DESIGN_DIRECTION §9 requires AVIF/WebP), `headers()` in `next.config` (TKT-50 security headers) and makes the future `/api/ask` RagProvider (S7) a deployment-mode change.
**Decision.** Default Next 16 build on Vercel with every route statically prerendered (SSG). The guarantee is enforced by `scripts/assert-static.ts` in `pnpm build`, which fails if any app route is not prerendered. No API routes, middleware or ISR in v1; env is only `NEXT_PUBLIC_SITE_URL` (+ reserved `RAG_ENDPOINT`).
**Rejected.** `output: 'export'` (loses image optimisation and headers; needs `vercel.json` workarounds and a custom image loader); allowing dynamic routes where convenient (no mechanical guarantee, function invocations, harder rollback).

## TP2 · Shared-element transition via React 19.2 `<ViewTransition>` + Next `experimental.viewTransition`, progressive — accepted
**Context.** Design.md §4 specifies a 450 ms shared-element card → case-study transition with plain navigation as the fallback (Solution-PRD §9 risk).
**Decision.** `ViewTransitionLink` wraps `next/link`; card frame/icon and the case-study header media share `name="project-{slug}"` / `icon-{slug}`; timing via `::view-transition-group` CSS; the React export name is verified at S06.01 and re-exported once from `lib/motion.ts`. Browsers without `document.startViewTransition` and reduced-motion users get plain navigation with an identical end state (EVAL-015). View Transitions are used nowhere else.
**Rejected.** `motion` `layoutId` across routes (unsupported across App Router navigations); a hand-rolled FLIP overlay (fragile, duplicates the browser primitive); page-level cross-fades (first-paint cost, Safari scroll quirks).

## TP3 · Ask matching: canonical-token overlap with a synonym table, threshold 0.34, answers byte-identical to data — accepted
**Context.** S7 requires a deterministic, honest Ask feature; EVAL-012 requires 11/11 prompts answered with ≥2 evidence links, 5/5 off-topic empties and 0 fabrications, behind an `AnswerProvider` adapter.
**Decision.** `LocalKnowledgeProvider`: normalise (NFKC, lowercase, punctuation, stopwords) → canonicalise tokens through a fixed synonym table → exact prompt/alias match scores 1, else weighted keyword overlap + bigram bonus → best entry if score ≥ 0.34 (ties by data order), else the CONTENT_INVENTORY §1.3 fallback with 3 suggestions. The returned `text` is the entry's `answer` string unmodified (Vitest asserts byte-equality). `RagProvider` stub validates responses with the same zod `Answer` schema and is not wired.
**Rejected.** Embedding/vector similarity in the browser (bundle weight, non-determinism across builds, no eval set — EV1); string `includes` on raw prompts (misses paraphrases, fails the honest-empty requirement); a live LLM (S7 explicitly rejects fake/generated answers in v1).

## TP4 · Media pipeline: sharp for avatar/posters, ffmpeg libx264 with a 1000 kbps cap for demos, no AV1 in v1 — accepted
**Context.** Avatar cutout exists at 1856×2304 PNG; the TeachSpark demo is 42.85 MB and every video must ship ≤4 MB with a poster (DESIGN_DIRECTION §9, PB4); videos are muted and `preload="none"`.
**Decision.** `scripts/avatar.ts` (sharp) exports `avatar.webp` (≤300 kB, alpha, long edge 1800), `avatar@2x.webp`, an opaque poster and a blur placeholder. `scripts/encode-video.sh` trims 20–40 s, scales to ≤1280 px, `libx264 -crf 26 -maxrate 1000k -bufsize 2000k -movflags +faststart -an`, and fails above 4 MB; posters are WebP ≤120 kB. `next/image` handles AVIF/WebP for stills with declared dimensions.
**Rejected.** AV1/WebM secondary sources (encode time, no Lighthouse benefit with poster-first loading); keeping audio (players are muted; wastes budget); paid generation/upscaling tools for the avatar export (S4 spend rule; not needed).

## TP5 · Test & eval tooling: Vitest + Playwright (Chromium, 4 viewport projects) + axe + Lighthouse CI, orchestrated by `scripts/eval.ts` — accepted
**Context.** evaluation-plan §5 demands one reproducible command, results with provenance, a baseline on the tracer and regression detection; COMPONENT_ARCHITECTURE §5 names the layers.
**Decision.** `pnpm eval` runs Vitest (schema, providers, SEO, forbidden strings), Playwright projects w390/w768/w1024/w1440 against the production build (`pnpm start`), `@axe-core/playwright`, `@lhci/cli` mobile + desktop (3-run median, thresholds asserted), a dead-control crawler, `pnpm audit` and a header check, then writes `evals/results/eval-run-<version>-<sha>.json` (schema v1 with provenance: commit, branch, dirty flag, node/pnpm/next versions, OS, timestamp, base URL, config, eval-cases sha) without ever overwriting, and diffs against `baseline-v1.json`. Manual cases (EVAL-001/003/009 and the inspector half of 017) are recorded as `MANUAL` with evidence pointers. Playwright browsers and temp files are pinned to `/Volumes/E Drive` via `.env.tooling`.
**Rejected.** Cypress (heavier, no built-in multi-project viewports); running e2e against `next dev` (does not match Lighthouse conditions); Storybook for primitive review (a `/dev/primitives` route is enough — no extra toolchain).

## TP6 · Motion budget: CSS transitions first, `motion` only for springs/layout via `LazyMotion` + `m` — accepted
**Context.** Design.md §4 mixes CSS transitions and spring/layout animations; the home JS budget is 180 kB gzip (EVAL-005) and `motion` 13's default proxy adds ~20 kB.
**Decision.** Hover/press/reveal/compaction/node-reveal/annotation wash are CSS transitions on `transform`/`opacity`/`clip-path`. `motion` is used only for cursor parallax (`useSpring`), filter/Ask/StoryCard layout animations and the NavPill, loaded through `LazyMotion features={domAnimation} strict` with `m.*` components; `AskPanel` is dynamically imported on first open. `useReducedMotionSafe` returns `true` until mounted so the first client frame never animates.
**Rejected.** `motion` for everything (bundle and paint cost, double mechanisms); GSAP/Lenis (not in S2, scroll-hijack risk forbidden by the design direction); CSS-only for layout/height changes (Design.md forbids animating box-model properties frame by frame).

## TP7 · `/work?filter=` is read client-side; the route stays static; one-frame flash on deep links accepted — accepted
**Context.** TKT-16 AC 2 asks for the filter to be "server-read" and applied on first paint, but reading `searchParams` in a server component makes `/work` dynamic, contradicting TP1/S2.
**Decision.** The full personal-project grid is server-rendered into the static HTML; `FilterTabs`/`WorkGrid` read `useSearchParams` inside a `<Suspense>` boundary and apply the filter on hydration with `AnimatePresence`. On a deep link there may be a single-frame change from "all" to the filtered set; Playwright asserts the post-hydration state. `tickets.md` TKT-16 AC 2 is amended at the M-004 boundary (`EXE-n`).
**Rejected.** Dynamic rendering of `/work` (breaks the static guarantee); path-based filters like `/work/ai` (contradicts the approved `?filter=` URL contract and the sitemap); hiding the grid until hydration (harms LCP and no-JS users).

## TP8 · Chapter ids and anchor slugs are separate, mapped once in `lib/anchors.ts` — accepted
**Context.** TKT-03 fixes chapter ids as `context|problem|discovery|bet|built|evaluation|outcome|learned`; TKT-19 and CONTENT_INVENTORY §1.5/§9 use anchors like `#04-product-bet`, `#05-what-i-built`, `#08-what-i-learned`; How I Think and Ask evidence links depend on the anchors.
**Decision.** Schema ids stay short and stable; anchors and display titles live in `CHAPTER_ANCHORS` in `lib/anchors.ts` (documented in `docs/anchors.md`); `validate-content` fails the build on any internal `href` whose route or anchor does not resolve, so a dangling evidence link is a build error rather than a crawler finding.
**Rejected.** Renaming chapter ids to the anchor strings (leaks presentation into data and breaks the tuple contract); free-form anchors per project (links from Ask/How I Think would drift).

## TP9 · Security headers set in `next.config` `headers()`, CSP with `'unsafe-inline'` scripts for the static site — accepted
**Context.** TKT-50/EVAL-016 require CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy and frame protection. A nonce-based CSP needs per-request rendering, which TP1 excludes; Next's static pages carry inline bootstrap scripts.
**Decision.** `headers()` applies to `/(.*)`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; font-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`, plus HSTS (2 years, preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/microphone/geolocation, `X-Frame-Options: DENY`. Residual risk (inline-script XSS) is bounded because there are zero third-party scripts and no user input is rendered as HTML; Stage 10 reviews this explicitly.
**Rejected.** Nonce CSP via middleware (forces dynamic rendering of every page); hash-based CSP (Next's inline RSC payload changes per build/page, unmaintainable); no CSP (fails EVAL-016 and the global data-safety defaults).

## TP10 · Footer credit is "Built with curiosity."; authorship goes to an /about colophon — accepted
**Context.** The content inventory's authorship rule ("say built with Claude Code where the docs say so") leaked into the footer copy (TKT-05 AC 3, technical-plan E-1, TC-029), contradicting the brief §39, which fixes the small-footer line as "Built with curiosity."
**Decision.** Footer tier 2 reads exactly "Built with curiosity." A single colophon line on `/about` ("Designed and built with Claude Code") carries authorship transparency; case-study packs keep their per-project "built with Claude Code" notes. tickets.md, technical-plan.md, test-cases.md and CONTENT_INVENTORY.md aligned 2026-09-15.
**Rejected.** "Built with Claude Code" in the footer (overrides an explicit brief instruction); dropping the authorship note entirely (dishonest about how the site was made).
