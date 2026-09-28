# HANDOFF — Portfolio (M-009 · Illustrated editorial redesign)

Updated 2026-09-28 (TASK-86, docs only). Branch `m-009-redesign` @ `27d0004`. **Stage 7 (Execution) is complete. Stages 8–10 have not run on M-009** (`decisions.md` EXE-24). Every claim below cites a file in this repo. Where the repo has no record, it says so.

## 0. State in five lines

- **What M-009 is:** the illustrated editorial ("paper") redesign. It replaces the clay site in place on the existing codebase and supersedes M-008 (`decisions.md` S11). The spec is `Design.md`, and the plan is `milestones.md` M-009 (TKT-69–91). In Campfire it is milestone `m-8` (`decisions.md` TP11).
- **Build:** every planned M-009 ticket is merged. Tushar signed off the hero gate, Phase A and Phase B (EXE-22). A second wave of Tushar-directed changes has also merged: TKT-96…113 and TASK-112…122 (`backlog/tasks/`).
- **Release is blocked:** the PB4 rule in `scripts/predeploy-check.ts` needs local MP4s at `VERCEL_ENV=production`. Tushar chose "Wait for videos", and on skipping Stages 8–10 he said "hold on" (EXE-24).
- **Preview:** https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app (branch `m-009-redesign`; `docs/reports/RC-dbc047c.md`).
- **`main` and production are untouched.** `origin/main` is still `22d6f66` (the 2026-09-23 M-007 merge). `m-009-redesign` is 318 commits ahead and not merged. No production deploy exists (`backlog/tasks/task-49` is Blocked; EXE-24).

## 1. What shipped

### Planned build (Phase 0 → D), all Done
- **Phase 0:** tokens and fonts, paper primitives, header, band footer, hero plus `HeroClip`, and the tracer (TKT-69–74). The hero was then restyled on Tushar's change request (EXE-15…19): TKT-93 banner, TKT-94 Lenis, TKT-95 page scene openers, and TKT-92 perf.
- **Phase A** (home) TKT-75–79 · **Phase B** (`/work`, 11 case studies, `/thinking`) TKT-80–85 · **Phase C** (`/about`, `/playground`, `/contact`, 404) TKT-86–88 · **Phase D** (dead code, QA sweep, a11y fixes) TKT-89–90. Summary in EXE-21.
- **TKT-92 perf (TASK-88):** Done, and accepted by Tushar as measured (EXE-24). The mobile LCP target was **not** met; see §4.

### Tushar-directed changes after the RC (all Done unless noted; statuses from `backlog/tasks/`)

| Area | Tickets | Design.md §11 |
|---|---|---|
| Home banner: whole scene + parallax, text-free, polaroids, hero copy | TASK-91 (TKT-96), 98, 102, 105, 108 | Dev-39, Dev-50, Dev-80 |
| Paper-over-paper parallax at every torn edge; overlap fixes | TASK-103, 110, 115 | Dev-96 |
| How I think collage + choreography | TASK-94, 107 | Dev-41, Dev-70–72 |
| `/about` journey collage; About hero rebuild | TASK-96, 117 | Dev-42, Dev-105–107, EXE-25 |
| `/work` → Experience timeline; Certifications tab | TASK-97, 99 | Dev-46, Dev-56, Dev-90–93 |
| Scene openers uncropped, 21:9, plus Experience and Certifications | TASK-100, 104, 114 | Dev-40, Dev-95, Dev-103/104 |
| Ask Tushky drawer + Home launcher | TASK-101, 109 (TKT-104 r2, TKT-113) | Dev-47–49, Dev-60–69, EXE-23 |
| Header tabs at every width (no hamburger) | TASK-112 | Dev-97 |
| Contact scrapbook page + real-photo stamp | TASK-111, 113 | Dev-98–102 |
| Band footer: narrower teeth, compact, cycling verb | TASK-95, 106, 118 | Dev-43, Dev-108 |
| `/projects` → Portfolio (products + enterprise case files) | TASK-116, 119 | Dev-109–114 |
| Portfolio scrapbook rework | **TASK-121 In Progress** (merged `762ea58`; painted covers open) | Dev-115–118 |
| Click-to-load YouTube/Vimeo player, CSP derived from data | TASK-122 (merged `15abb00`) | Dev-119/120 |
| Hardening: CopyButton test, OG verification | TASK-92 (TKT-97), TASK-93 (TKT-98; the essay `og:image` 404 was fixed in `016c0ab`) | — |

**Still open in the backlog:** TASK-86 (this hand-off, In Progress), TASK-121 (In Progress) and TASK-120 (To Do: remove the legacy `/projects` CSS left by TASK-116). Also blocked: TASK-8 (sanitised résumé), TASK-46/49 (deploy and production) and TASK-22…26 (demo media, `on-hold`) (`docs/reports/CAMPFIRE-TRIAGE-2026-09-26.md`; EXE-24).

## 2. Open decisions for Tushar

Each one was checked against `backlog/tasks/` and `decisions.md`.

1. **Release gate (PB4):** `scripts/predeploy-check.ts` fails a production build unless `public/video/{teachspark,railcite,velora}.mp4` exist (≤ 4 MB) (PB4; EXE-24). Videos will now be hosted on YouTube (`task-122`), so should PB4 require pitch-video IDs instead of MP4s, and for which products? *Recorded:* `task-122` says "PB4 proposal not applied", and EXE-24 records "Wait for videos" and the rejected option of relaxing PB4. *Not recorded:* the proposal's text and its product list. All video IDs are still empty (`task-122`).
2. **Demo videos and media:** when will the TASK-22…26 media (TeachSpark, RailCite, Nuptis/Velora, Bhakti-Vilas, Pratyasa/Tegaki/dino-arcade/cinematic) be recorded or linked? All five are Blocked and `on-hold` (EXE-24).
3. **Painted covers:** approve about 2.5 credits to paint the 10 remaining product covers? Only TeachSpark has painted art (Dev-115). The other 10 are CSS covers because Higgsfield's daily limit blocked them (`task-121`).
4. **Live Gemini for Ask Tushky:** should Ask stay deterministic? The repo records only the deterministic local provider: "no live LLM" (S7, S21; `components/ai/AskProvider.tsx`; `data/knowledge.ts`), and Tushky "answers only from the portfolio index" (Dev-61). *Not recorded:* a Gemini request and any approval, and a "curated FAQ cache".
5. **Vendor Passport and Velora:** can you supply the Vendor Passport data? It is in neither `data/projects.ts` nor the source documents, so it was left out (`docs/reports/TASK-116.md`, `TASK-121-plan.md`). Is Velora apparel sourcing / vendor onboarding (as in `data/projects.ts`) rather than the spec's "beauty / routine"? Also open in `task-121`: the status-label wording.
6. **Résumé label and header:**
   - Should `resumeAction()`'s placeholder change site-wide from "Resume — updating" to "Resume — available on request"? The band footer, `/about` and home still read "updating"; only `/contact` changed (`docs/reports/TASK-113.md`, Dev-99).
   - Is the two-row header acceptable at 1024–1439 px too? "No hamburger" extended it below 1440 (`docs/reports/TASK-112.md`, `task-112`, Dev-97).
7. **Video play and CSP:**
   - One press or two to play? Today one press mounts the iframe with `autoplay=1`, and nothing plays on selection (Dev-120; `components/portfolio/ProductMediaPlayer.tsx`). *Not recorded:* a separate question about two presses.
   - Keep `'self'` out of CSP `frame-src`? Spec §9 lists it, but it was left out because every route sends `frame-ancestors 'none'` (Dev-119, "awaits Tushar"). The other TASK-116 open items: CSP hosts, a GitHub action only for public repos, trimming the carousel, and corporate records only on `/work` (`task-116`).
8. **PMP/SAFe in Ask:** may Ask answers name PMP and SAFe? Today `scripts/forbidden-strings.ts` allows them only on the certifications surfaces; the ban stands everywhere else, and the résumé omits them (`docs/reports/TKT-102.md`, `data/certifications.ts`).

**Smaller confirmations flagged in `Design.md` §11:**
- Dev-50 hero-copy accounting.
- Dev-64/65: the Home field doesn't open the drawer on focus, and there is no paperclip.
- Dev-105: 640–899 is one column.
- Dev-106: the `/about` decoration accounting.
- `docs/reports/TKT-102.md`: how expired Credly credentials should display, and the PSPO year (2023 vs 2024).
- LinkedIn Post Inspector: re-check `/`, `/projects` and `/certifications` before release (`task-86` notes).

## 3. How to run the gates

Scripts are in `package.json`. `.env.tooling` redirects Playwright, TMPDIR and LHCI to the E Drive.

| Gate | Command |
|---|---|
| Types / lint / tokens | `pnpm typecheck` · `pnpm lint` · `pnpm tokens:check` (13/13) |
| Unit | `pnpm test` (Vitest) |
| Build | `pnpm build`. `prebuild` runs `predeploy-check.ts` + `validate-content.ts`; then `assert-static.ts` |
| E2E | `pnpm test:e2e` runs the Playwright production build on `pnpm start`, Chromium, projects **w390 / w768 / w1024 / w1440** (`playwright.config.ts`). The default is 1 worker; `PW_WORKERS=2` opts in to 2. Filter one width with `--project=w390` |
| Eval | `pnpm eval` (full), `--only EVAL-0xx,…`, `--skip-build`, `--label <name>`, `--base-url <preview>` (adds the header check; skips Lighthouse). Results go to `evals/results/<label>.json` (`docs/eval.md`) |
| Lighthouse | `pnpm exec lhci autorun` with `lighthouserc.mobile.json` / `lighthouserc.desktop.json` (median of 3; perf ≥ 0.9, LCP ≤ 2500 ms, CLS ≤ 0.05) (`docs/eval.md`, `scripts/eval.ts`) |
| Pre-deploy | `pnpm predeploy` |

CI (`eval.yml`) runs only on pushes and PRs to `main`, so branch pushes don't trigger it (EXE-17).

## 4. Latest evidence (full summary in `QA-report.md` §M-009)

- **RC record run `dbc047c`** (`docs/reports/RC-dbc047c.md`): unit 625 · full e2e 1209/0 · `pnpm eval --base-url` preview 16 pass / 0 fail / 2 skip / 4 manual (`evals/results/m009-rc-dbc047c.json`).
- **After TKT-92 r4 (`1de0ba6`):**
  - mobile `/` perf 93 and LCP 2659 ms;
  - `/work/teachspark` perf 88 and LCP 3164 ms;
  - LCP is over 2.5 s at the median, which Tushar accepted (EXE-24).
- **Latest full e2e recorded:** 1300/0 on TASK-116's final tree (`task-116`).
- **After that, only targeted runs exist:** TASK-117, 118, 121 and 122. **No full e2e or `pnpm eval` is recorded on the current tip `27d0004`.**

## 5. Where the specs live

- `Design.md` (normative) plus the eight M-009 mockups: `docs/redesign-mockups/m-009/*.html` (S17).
- Tushar's later specs and targets:
  - `docs/redesign-mockups/m-009/tushar-2026-09-26/`: Ask Tushky drawer, Home Ask, certifications, How-I-think choreography, and target PNGs.
  - `…/tushar-2026-09-27/contact-spec.md`
  - `…/tushar-2026-09-28/`: about-hero, portfolio, portfolio-rectify, projects-scene-left, and video-embed specs, plus reference PNGs.
- Per-ticket reports are in `docs/reports/` (TKT-*, TASK-*, RC-*), and screenshots are in `docs/screenshots/m-009/**`.

## 6. Design.md §11 deviations (from `Design.md` itself)

§11 holds 94 `Dev-` rows. The "pending" and "to confirm" rows are listed in §2. Three notes for Stage 8:
- **Dev-41 appears twice**, as identical rows at `Design.md` lines 533 and 557.
- Numbering has gaps: Dev-18, 44–45, 51–55, 57–59, 73–79 and 81–89 are absent. The repo has no record of whether these were renumbered or never used.
- Dev-08 and Dev-12 still say "**pending Tushar**" (D8/D9). However, EXE-20 applied the five-item nav and dropped the quiet closes as defaults, and the nav is now tabs (Dev-97). Dev-20 and Dev-23 say "confirm at the hero gate", and that gate was signed off (EXE-22). Their disposition text has not been updated.

## 7. What Stages 8–10 should open

- **Stage 8 (design critique):**
  - Open the running preview against `Design.md` and the spec folders in §5.
  - Screenshots: `docs/screenshots/m-009/**`.
  - Accessibility pass: `docs/a11y-pass.md`. It is an ARIA-snapshot proxy, not a VoiceOver session.
  - EVAL-021 asset checklist: `evals/results/eval-021-ff806f5.md`.
  - Manual EVAL-001/003/009/022.
- **Stage 9:** `/code-review` over `main..m-009-redesign`, then `test-cases.md`, a full `pnpm test:e2e` and `pnpm eval` on the tip, and `lhci` on the preview.
- **Stage 10:** `/security-review` and a threat pass. The CSP changed (`lib/csp.ts`, `tests/unit/csp.test.ts`: YouTube `frame-src`). There is a new third-party embed (`lib/video-providers.ts`, youtube-nocookie). Also check the new headshot asset (`content/media/portrait/`) and the PII gate (`scripts/forbidden-strings.ts`, `CREDENTIAL_SURFACES`). Then assemble `QA-report.md`.

## 8. Hard stops (unchanged)

- The 13-token gate holds.
- Thresholds are never lowered without a `decisions.md` entry (EV2/EV6).
- No PII.
- Decoration budget ≤ 4 per section (EVAL-018; the parked list stays `[]`).
- All routes are static.
- Everything lives on `/Volumes/E Drive`.
- **Never push to `main`, merge to `main`, deploy to production or spend money without Tushar's explicit approval.**
- IDs (`M-`, `TKT-`, `TSK-`, `TASK-`, `EVAL-`, `Dev-`) are stable and never regenerated.
