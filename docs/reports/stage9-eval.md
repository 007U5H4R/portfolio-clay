# Stage 9 — Code Review + Test & Eval Execution: Eval-Runner Report

**Scope:** execute the planned test/eval suites from real output and report per-ID results. Report only — no fixes, no commits, no pushes. Branch `m-007-quality`, HEAD `0e1a052`.

**Overall verdict: PASS-WITH-ACCEPTED-RISKS, plus 3 new findings that must be triaged before Stage 10 (QA-007, QA-008, QA-009).**

The `pnpm eval` harness itself reports `criticalFailures: []` on both the local build and the live preview, and every gate it computes is green except the pre-existing informational EVAL-005 bundle overage. But the raw Playwright output — which I read directly rather than trusting only the harness's summary — contains **5 real, deterministic test failures that no EVAL id ever surfaces** (they're in an untagged test), reproduced identically on both the local build and the live Vercel preview. I also found a live, currently-broken OG/canonical tag on the preview. None of this was hidden by me; the harness's own mapping doesn't count these tests toward any EVAL-0xx status, so `pnpm eval`'s clean exit code does not mean "the whole suite is green."

---

## 1. Results table — per EVAL id

Local run: `evals/results/eval-run-v1.0.0-rc2.json` (label `eval-run-v1.0.0-rc2`, commit `0e1a052`, `http://127.0.0.1:3000`).
Preview run: `evals/results/eval-run-preview-0e1a052.json` (label `eval-run-preview-0e1a052`, commit `0e1a052`, `https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app`).

| EVAL | Priority | Local (rc2) | Preview | Notes |
|---|---|---|---|---|
| EVAL-001 | critical | MANUAL | MANUAL | human inspector review, unchanged |
| EVAL-002 | critical | PASS | PASS | 20 specs / 9 runs both |
| EVAL-003 | high | MANUAL | MANUAL | unchanged |
| EVAL-004 | critical | PASS (informational) | SKIP (by design, `--base-url`) | local mobile `/`[0] 96 (1 threshold miss vs baseline, non-gating) |
| EVAL-005 | high | **FAIL** (informational, real) | SKIP (by design) | first-load JS 191.1 kB gz vs 180 budget — pre-existing, tracked TKT-14/49 |
| EVAL-006 | critical | PASS | PASS | 276 specs / 115 runs both |
| EVAL-007 | critical | PASS | PASS | 80 specs / 22 runs both |
| EVAL-008 | high | PASS | PASS | 320 specs / 309 runs both — FAIL→PASS improvement vs baseline |
| EVAL-009 | high | MANUAL | MANUAL | unchanged |
| EVAL-010 | high | PASS | PASS | 212 specs / 51 runs both |
| EVAL-011 | critical | PASS | PASS | 84 specs / 21 runs both |
| EVAL-012 | critical | PASS | PASS | vitest |
| EVAL-013 | critical | PASS | PASS | 0 forbidden/PII hits in 194 files incl. `.next` |
| EVAL-014 | medium | PASS | PASS | 28 specs / 1 run both |
| EVAL-015 | medium | PASS | PASS | 44 specs / 19 runs both |
| EVAL-016 | high | PASS | PASS | local: headers SKIP (no `--base-url`) · **preview: all 6 TP9 headers present** |
| EVAL-017 | high | PASS | PASS | unit + spec pass; inspector rendering MANUAL — **but see QA-009**, the tag *values* it would render are currently broken on preview |

**Totals:** local 13 pass / 1 fail / 0 skip / 3 manual (of 17); preview 12 pass / 0 fail / 2 skip (Lighthouse, by design) / 3 manual. `criticalFailures: []` both runs.

### What the totals table does not show: 5–6 real Playwright failures outside any EVAL id

Raw Playwright stats (`.eval/playwright.json` / direct output), not the eval harness's rollup:

- **Local:** `682 passed, 5 failed, 801 skipped` (7.6 min run).
- **Preview:** `681 passed, 6 failed, 801 skipped` (13.7 min run).

All 5 common failures are in `tests/e2e/case-study.spec.ts`, an **untagged** test (no `@EVAL-0xx` tag), at viewport w390:

```
case-study · teachspark deep dive: metrics (TC-075), OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)
case-study · railcite deep dive: ...
case-study · velora deep dive: ...
case-study · nuptis deep dive: ...
case-study · cubicle deep dive: ...
Error: horizontal overflow: scrollWidth {534–649} > clientWidth 390
```

The 6th (preview-only) is `tests/e2e/smoke.spec.ts` `home loads with no console errors @smoke` at w1440:
```
Loading the script 'https://vercel.live/_next-live/feedback/feedback.js' violates CSP directive "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"
```

Because `scripts/eval.ts` only rolls untagged Playwright results into the "did the suite build/run" pass/fail counts it prints in the console, not into any EVAL id's `cases[]` entry, these 6 failures never touch `criticalFailures`, `regressions`, or the JSON `totals`. **This is a real gap in the harness's own coverage, not something I introduced or am hiding** — see QA-007/QA-008 below.

---

## 2. TC table (TC-104…117, TC-091, plus Stage-8-touched areas)

| TC | Expected | Actual | Status | Evidence |
|---|---|---|---|---|
| TC-091 | mechanical content-rule assertions per project, string-level | 48/49 `it()` pass, 1 documented `it.skip` (tegaki Master Prompt rule — no chapters yet, tracked in CONTENT_INVENTORY §8.9, unrelated to M-007) | **PASS** | `tests/unit/content-rules.test.ts`, vitest run |
| TC-104 | 0 overflow / 0 sub-44px controls / 0 sub-14px text / 0 unsized images, default page state, all routes × 4 widths | green | **PASS** | EVAL-008, 320 specs/309 runs both envs. *Scope note: TC-104 asserts default-load state only — it does not click "Deep dive," so it does not cover the overflow QA-007 finds (see below).* |
| TC-105 | 0 critical/serious axe anywhere incl. open states | green | **PASS** | EVAL-006, 276 specs/115 runs both envs |
| TC-106 | 100% keyboard flows completable, visible focus ring at every stop | green | **PASS** | EVAL-007, 80 specs/22 runs both envs |
| TC-107 | 0 unlogged visual defects, Safari/Firefox parity | not run | **NA (manual)** | requires Safari/Firefox + human screenshot review — orchestrator/Tushar |
| TC-108 | 0 disallowed animations under reduced-motion | green | **PASS** | EVAL-010, 212 specs/51 runs both envs |
| TC-109 | VoiceOver reading order/announcements on `/`, `/work/teachspark`, `/about` | not run | **NA (manual)** | axe cannot assert this; needs a human VoiceOver pass |
| TC-110 | content/nav survive JS-off and a missing image | green | **PASS** | EVAL-015, 44 specs/19 runs both envs |
| TC-111 | predeploy-check script: 8/8 table-driven failure modes | 18/18 tests pass | **PASS** | `tests/unit/predeploy.test.ts`, vitest run |
| TC-112 | 0 token pairs below WCAG threshold | automated part green (within EVAL-006 sweep) | **PASS** (automated) / **NA (manual)** spot-check | no separate contrast-pair table file found this run; automated axe contrast checks pass as part of EVAL-006 |
| TC-113 | ≥90/95/95/95 on 8 route×preset combos on a real deployment; `/` JS ≤180kB, LCP ≤2.5s, CLS <0.05 | local (informational): mobile `/` 92 (1pt under 90? no — 92≥90, but −4 vs baseline's 96), all others ≥90; bundle 191.1kB > 180 budget (real, non-gating locally) | **PASS (local, informational)** / **SKIP (preview — Lighthouse is skipped under `--base-url` by design, per docs/eval.md; a dedicated `lhci autorun` against the preview was out of this task's instructed scope)** | `.lighthouseci/mobile`, `.lighthouseci/desktop` |
| TC-114 | all TP9 headers present on the deployment, 0 CSP violations | 6/6 headers present; **1 CSP violation found** (QA-008, `vercel.live` feedback script) | **PASS (headers)** / **FAIL (0-CSP-violations sub-clause)** | `curl -sI` + `scripts/security-headers.ts --base-url` below; smoke.spec.ts console-error capture |
| TC-115 | 0 high/critical deps; 0 forbidden/PII hits in deployed bundle; private files 404 | `pnpm audit --prod --audit-level=high`: 0 vulnerabilities; `forbidden-strings --bundle`: 0 hits/194 files; `.env`, `.env.local`, `.env.tooling`, `tests/forbidden.local.json`, a `SOURCES.md` all 404 on preview | **PASS** | commands below |
| TC-116 | every route 200/404 as expected, resume placeholder correct, videos play, eval file persisted | all 11 routes + sitemap.xml + robots.txt 200; `/nope` 404; `/resume.pdf` 404 (expected — `resumeAvailable:false`, PB5 not yet crossed); `eval-run-preview-0e1a052.json` persisted; Analytics dashboard confirmation not performed | **PASS (mechanical)** / **NA (manual)** Analytics dashboard | curl route sweep below |
| TC-117 | ≤6 clicks, every hop 200 | green both envs, resume hop correctly recorded BLOCKED (flag false) | **PASS** | EVAL-002, 20 specs/9 runs both envs |
| TC-118 | title/description/1200×630 image render on LinkedIn Post Inspector + opengraph.xyz for 7 families | not run (browser/manual step) | **MANUAL — orchestrator** | — but see QA-009: the underlying tag *data* on the live preview is objectively broken (og:image 404s), so the inspector render will fail when attempted |

---

## 3. New findings (QA-007, QA-008, QA-009)

Numbering confirmed live with the concurrent `code-review` agent (same branch, same session) to avoid collision: highest existing `CR-###` is CR-006 (decisions.md:247), last formally-logged `QA-###` is QA-005 (`docs/reports/M007-qa.md` §5). `QA-006` is referenced in a `lib/seo.ts` code comment for an already-implemented fix (see QA-009 — that fix does not actually hold on the live preview). QA-007/008/009 below are free slots, self-assigned by me as eval-runner since neither the code-review agent nor I have `decisions.md` write authority in this pass — Stage 10 should ratify.

### QA-007 (NEW) — Deep-dive view causes horizontal overflow at 390px on 5 of 11 case studies
- **Priority:** P1 (real, reproducible, user-facing functional defect — not caught by the `pnpm eval` gate)
- **Evidence:** `tests/e2e/case-study.spec.ts` lines 97 (teachspark), 135 (railcite), 172 (velora), 209 (nuptis), 248 (cubicle) — all fail identically, local and live preview: `horizontal overflow: scrollWidth {534,534,?,534,649} > clientWidth 390`, raised by `noOverflow()` in `tests/e2e/fixtures.ts:89` immediately after clicking the "Deep dive" radio (before ShowTheThinking is even opened — the test names are misleading; the overflow happens simply from switching to the deep-dive chapter view).
- **Root cause (traced, not fixed):** `components/case-study/artifacts/ArtifactGrid.tsx` uses `grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]`. The Stage-8 DES-002 fix (`557b85e`) narrowed the minimum track to `min(100%,15rem)` specifically to prevent narrow-mobile overflow, but CSS Grid items still default to `min-width: auto`, which sizes to the item's *min-content* — an unbreakable string (e.g. a long blockquote in the "Insight"/"Doc"/"Deck" artifact cards under chapters like "01 Context"/"02 Problem") can force a track wider than its `minmax` ceiling regardless of the grid template. The DES-002 fix addressed the track-sizing formula but not child min-width, so it doesn't fully cover long-text artifact content at 390px.
- **Why it isn't caught by `pnpm eval`:** this assertion lives in an untagged test in `case-study.spec.ts` (no `@EVAL-0xx` tag), so `scripts/eval.ts` never rolls its result into `EVAL-006`/`EVAL-007`/`EVAL-008`'s status even though it ran and failed as part of the same `pnpm eval` invocation.
- **Traces to:** TKT-20 (artifacts/MetricCard), DES-002 (Stage 8, `557b85e`), TC-077/TC-092.
- **Proposed fix (not applied):** add `min-w-0` (or `overflow-wrap: anywhere` on the artifact card's text nodes) to the `ArtifactGrid` children in `components/case-study/artifacts/` — cheap, well-understood CSS Grid fix; needs its own regression test (currently only caught incidentally, not by an `@EVAL`-tagged assertion).

### QA-008 (NEW) — CSP blocks Vercel's own preview-feedback script on live preview deployments
- **Priority:** P2 (preview-only; does not reach production, does not affect end-user content — but it is a real, deterministic console error that fails `smoke.spec.ts`'s zero-console-error assertion on every preview run)
- **Evidence:** `tests/e2e/smoke.spec.ts` `home loads with no console errors @smoke` at w1440, live preview only: `Loading the script 'https://vercel.live/_next-live/feedback/feedback.js' violates CSP directive "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"`.
- **Root cause:** `next.config.ts`'s CSP `script-src` allowlists `va.vercel-scripts.com` (Analytics/Speed Insights, per TC-114's note) but not `vercel.live` (the preview-only feedback/toolbar widget Vercel injects on branch previews). Independently confirmed from the code side by the concurrent Stage-9 code-review pass (same root cause, `next.config.ts`, unnumbered in their JSON output).
- **Traces to:** TKT-50 (security headers/CSP), TC-114.
- **Proposed fix (not applied):** either allowlist `https://vercel.live` in `script-src`/`connect-src` (matches the documented Analytics exception pattern), or accept as a preview-only, non-production-reaching caveat and scope `smoke.spec.ts`'s console-error allowlist to it (mirrors how QA-005 was resolved for the Analytics/local-`next-start` case).

### QA-009 (NEW) — Live preview's OG/canonical tags resolve to the project's still-unreachable production domain
- **Priority:** P1 (breaks the mandatory link-preview requirement — Global Web Deliverables gate — for anyone sharing the *preview* link before production is live; does not block production itself if the underlying gate works correctly once `main` deploys)
- **Evidence (all live, fetched from the actual preview origin, not assumed):**
  - `curl -s https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app/` → `<link rel="canonical" href="https://portfolio-clay.vercel.app">`, `<meta property="og:url" content="https://portfolio-clay.vercel.app">`, `<meta property="og:image" content="https://portfolio-clay.vercel.app/opengraph-image">`.
  - `curl -s -o /dev/null -w '%{http_code}' https://portfolio-clay.vercel.app` → **404** (no production deployment exists yet — confirmed by HANDOFF.md and by Vercel API: this project has never had a `READY` production deployment).
  - Confirmed via Vercel MCP (read-only): `filter_project_envs` on `prj_QrQmCfOiPTcaLV81FVekot4t6zsD` returns `envs: []` — **no `NEXT_PUBLIC_SITE_URL` is set anywhere on the Vercel project**, ruling out an env-var misconfiguration on Vercel's side. `list_project_domains` confirms `portfolio-clay.vercel.app` (with `gitBranch: null`, i.e. the default production alias) *is* the project's real `VERCEL_PROJECT_PRODUCTION_URL` value — so the string isn't a stray hardcode either (repo-wide grep for the literal string found nothing outside `.next` build output).
  - This means `lib/seo.ts`'s `siteUrl()` fallback chain is resolving through step 2 (`VERCEL_PROJECT_PRODUCTION_URL`, gated on `VERCEL_ENV === "production"`) rather than step 3 (`VERCEL_URL`, the correct branch-preview host) on this `m-007-quality` branch build — i.e. `VERCEL_ENV` is resolving to `"production"` for a non-`main`-branch deployment.
- **Why this is notable:** `lib/seo.ts:20-25`'s own comment describes exactly this failure mode as already fixed ("CR-002 / QA-006, Stage 9" — "without this gate every preview's canonical/og:url/og:image pointed at production — a 404 until the first production deploy exists"). The gate code is present in the source at HEAD `0e1a052`, and the deployment metadata (`get_deployment`) confirms this exact preview alias is serving that exact commit — yet the live behavior still reproduces the bug the gate was written to prevent.
- **Root-cause hypothesis (not confirmed — needs a Vercel dashboard check I don't have the read scope for):** the project's Git integration "Production Branch" setting may not be `main` (possibly still unset/defaulted, or accidentally `m-007-quality`), which would make Vercel report `VERCEL_ENV=production` for this branch's builds regardless of the branch name. Stage 10 should check Project Settings → Git → Production Branch before assuming the code fix is broken.
- **Traces to:** TKT-06 (SEO/OG), TKT-50/51 (deploy/OG inspector), decision referenced as "CR-002/QA-006" in `lib/seo.ts:23` (apparently not yet ratified in `decisions.md`), TC-118.
- **Impact if unresolved:** LinkedIn Post Inspector / opengraph.xyz will show a broken/404 image and a canonical link to nowhere for anyone who pastes the *preview* URL today. TC-118 (currently NA — manual, deferred to the orchestrator) will fail on first attempt until this is fixed or the Production Branch setting is corrected.

---

## 4. Baseline diff (`eval-run-v1.0.0-rc.json`, commit `6a78aa4` → `eval-run-v1.0.0-rc2.json`, commit `0e1a052`)

Both runs diff against the same frozen `baseline-v1.json` (M-001) per the harness design, so this is a same-baseline comparison across the two HEAD-commit runs, not a direct rc→rc2 diff object — reconstructed below from both JSONs' own `regressions`/`improvements` arrays.

| | rc (baseline commit) | rc2 (this run) |
|---|---|---|
| totals | 13 pass / 1 fail / 0 skip / 3 manual | 13 pass / 1 fail / 0 skip / 3 manual — unchanged |
| criticalFailures | `[]` | `[]` — unchanged |
| EVAL-004 regressions vs baseline | `/ mobile[0] 96→92 (−4)`, `/ mobile[2] 100→96 (−4)` (2 entries) | `/ mobile[0] 96→92 (−4)` only (1 entry) — **slightly better**, informational/non-gating |
| EVAL-004 improvements vs baseline | none | `/ desktop[2] 96→100 (+4)` — new |
| EVAL-005 (bundle) | `218.7→191.1 kB gz (−27.6)` | `218.7→191.1 kB gz (−27.6)` — **identical**, no code change between rc/rc2 (docs-only commits, confirmed) |
| EVAL-008 | `FAIL → PASS` improvement vs baseline | same improvement, still holds |

**No regressions introduced between rc and rc2** beyond Lighthouse mobile score noise (informational, swiftshader-affected per `docs/eval.md`, real gate is production). No new EVAL-id-level failures. The 3 new QA findings above are **not visible in this diff** because they live outside the EVAL-id mapping (QA-007/008) or outside `pnpm eval`'s scope entirely (QA-009, discovered via direct OG-tag inspection).

---

## 5. Live-preview findings summary

- **HTTP:** preview root and all 9 static routes + `/sitemap.xml` + `/robots.txt` → 200; `/nope` → 404; `/resume.pdf` → 404 (expected, `resumeAvailable:false`).
- **Security headers:** all 6 TP9 headers present and correctly configured (`content-security-policy`, `strict-transport-security: max-age=63072000; includeSubDomains; preload`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`, `x-frame-options: DENY`) — confirmed by both raw `curl -sI` and `scripts/security-headers.ts --base-url`.
- **Forbidden-string/PII scan:** `pnpm exec tsx scripts/forbidden-strings.ts --bundle` → 0 hits in 194 files incl. `.next` bundle (this scans the local build, byte-identical to the deployed commit per the task's own framing — one `SKIP` noted: `forbidden.local.json` sandbox-join-code check, expected/documented).
- **Dependency audit:** `pnpm audit --prod --audit-level=high` → 0 known vulnerabilities.
- **Private files:** `.env`, `.env.local`, `.env.tooling`, `tests/forbidden.local.json`, a `SOURCES.md` all 404 on the live edge.
- **OG tags on the real origin (EVAL-017 correctness):** **broken — see QA-009.** `og:url`/`canonical`/`og:image` all resolve to `https://portfolio-clay.vercel.app`, which 404s; they should resolve to the reachable preview host itself.
- **LinkedIn Post Inspector / opengraph.xyz render:** not attempted — MANUAL, orchestrator's step (would currently fail given QA-009).

---

## 6. Provenance & exact commands run

- Repo: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay`, branch `m-007-quality`, HEAD `0e1a052` (dirty: only `docs/screenshots/**` PNG re-renders + untracked `evals/results/m005-qa.json`, neither touched by me).
- Node v26.7.0, pnpm 11.25.0, Next 16.3.5, darwin 27.0.0.
- Host load: 3.39 (start) → 6.32 (mid-run), both under the 12 abort threshold; port 3000 killed before the first run per instructions.

```bash
lsof -ti :3000 | xargs kill
pnpm eval --label eval-run-v1.0.0-rc2                                    # → evals/results/eval-run-v1.0.0-rc2.json
curl -s -o /dev/null -w '%{http_code}' https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app
pnpm eval --base-url https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app --label eval-run-preview-0e1a052
                                                                            # → evals/results/eval-run-preview-0e1a052.json
pnpm exec tsx scripts/security-headers.ts --base-url https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app
curl -sI https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app/
pnpm exec tsx scripts/forbidden-strings.ts --bundle
pnpm audit --prod --audit-level=high
pnpm test                                                                  # vitest — .eval/vitest.json
# route/header/OG/private-file curl sweeps against the live preview (see §5)
```

**Vitest:** 43 files passed, 1 file skipped (44 total) — 300 tests passed, 2 skipped (302 total). No failures.

---

## 7. Recommendation

**PASS-WITH-ACCEPTED-RISKS to proceed toward Stage 10, conditional on Stage 10 explicitly triaging QA-007/008/009** (fix-vs-accept decisions, same pattern as QA-005) rather than silently folding them into the existing accepted-risk register. None of the three are hidden — they're stated here in full with root cause and evidence — but none of them currently gates `pnpm eval`'s exit code, which is a genuine harness coverage gap (`scripts/eval.ts` doesn't roll up untagged Playwright failures into any EVAL id) worth a follow-up ticket in its own right, separate from fixing the underlying defects.

QA-007 (overflow) and QA-009 (broken OG tags) are both P1, user-facing-on-preview, and should not be treated as "informational" the way EVAL-004/005 are — those have an explicit, documented informational carve-out in `docs/eval.md`; these two do not.
