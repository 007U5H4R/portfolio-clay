# QA Report — Clay Portfolio

This file holds two sections. **M-009** (current, below) is evidence only; its Stage 8–10 gate has not been assembled. **M-007** (further down) is kept unchanged as history.

---

# M-009 · `m-009-redesign` — test evidence to date (Stages 8–10 not yet run)

Updated 2026-09-28 (TASK-86). Branch `m-009-redesign` @ `27d0004`. Preview: https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app. `main` and production are untouched (`origin/main` = `22d6f66`, the M-007 merge).

**Status:** this is **not** a release gate. `decisions.md` EXE-24 says that "Stages 8–10 (design critique, code review, security review) have not run on M-009". The release waits on the PB4 videos and on Tushar. Every number below is copied from the cited file; where no record exists, it says "not recorded".

## M9-1. Record runs (release-candidate level)

| Run | Unit | E2E (4 widths) | `pnpm eval` | Source |
|---|---|---|---|---|
| RC `809e326` (integration) | not recorded (the entry says "unit" passed; no count given) | **1050 passed / 0 failed** (1 worker, 15.0 min) | **16 pass · 2 fail · 0 skip · 4 manual**. Both fails are informational local SwiftShader Lighthouse (EVAL-004/005). Regression vs baseline: EVAL-004 `/` mobile 96→85 | `decisions.md` EXE-21; `evals/results/m009-rc-809e326.json` |
| RC `dbc047c` (integration `db8f782`) | **625 passed** | **1209 passed / 0 failed** (2 workers) | preview `--base-url`: **16 pass · 0 fail · 2 skip (EVAL-004/005, Lighthouse skipped under `--base-url`) · 4 manual**; `criticalFailures: []`, `regressions: []` | `docs/reports/RC-dbc047c.md`; `evals/results/m009-rc-dbc047c.json` |
| After TKT-92 r4 (integration `80581e2`) | 625 | 1212 passed / 1 failed (lenis PageDown at w1440; 3/3 green alone, recorded as a load flake) | not recorded | `docs/reports/RC-dbc047c.md` |
| TASK-116 final tree | 632 | **1300 / 0** (latest full e2e recorded) | `--only EVAL-006,008,011,013,018,021`: 6 pass · 0 fail | `backlog/tasks/task-116`; `docs/reports/TASK-116.md` |
| Current tip `27d0004` (after TASK-117…122) | not recorded | **not recorded** (targeted runs only; see M9-3) | **not recorded** | — |

**Manual EVAL cases** (EVAL-001, 003, 009, 022) are MANUAL in both RC runs. EVAL-022 and the hero/Phase A/Phase B sign-offs were given by Tushar (EXE-22). The EVAL-001 home record is `evals/results/eval-001-m009-home.md`. Stage-8 re-scoring on the current home: not recorded.

## M9-2. Performance (preview Lighthouse, mobile, median of 3)

| Build | `/` perf / LCP | `/work/teachspark` perf / LCP | Desktop | Source |
|---|---|---|---|---|
| Tracer `1941383` | 85–86 / 3824–3988 ms | 87–89 / 3234–3467 ms | — | EXE-17 |
| `2bd4949` | 95 / 2338 ms | 98 / 2274 ms | 100 / 100; `/` CLS 0.054 (over the 0.05 gate) | EXE-21 |
| TKT-92 r3 (CLS fix) | — | — | desktop `/` CLS 0.0543 → **0.0019** | `docs/reports/TKT-92.md` §Round 3 |
| `dbc047c` | 83 / 2228 ms | 89 / **3471 ms** | 100 / 564 ms; 100 / 475 ms | `docs/reports/RC-dbc047c.md` |
| `1de0ba6` (TKT-92 r4) | **93 / 2659 ms** | **88 / 3164 ms** | both 100, LCP ≈ 0.5 s | `docs/reports/RC-dbc047c.md`, `TKT-92-r4.md` |

**Verdict recorded:** the TASK-88 bar (perf ≥ 90 and LCP ≤ 2.5 s on both pages) is **not met** at the median. Tushar accepted TKT-92 as measured (EXE-24). The thresholds are unchanged (EV2/EV6).

**First-load JS, gz (budget 180 kB):**
- `/` 160.1 · `/work` 153.4 · `/about` 153.9 · `/certifications` 154.2 kB (`RC-dbc047c.md`).
- `/projects` 164.5 kB (TASK-116), 166.1 kB (`task-121`) and 167.0 kB (`task-122`).
- Lighthouse on the current tip: not recorded.

## M9-3. Per-ticket gate evidence after the RC (targeted unless marked full)

| Ticket (report) | Unit | E2E | Eval / other |
|---|---|---|---|
| TKT-96 / TASK-91 (`TKT-96.md`) | 579 | **full 1055 / 0** | — |
| TKT-97 / TASK-92 (`TKT-97.md`) | 579 | **full 1050 / 0**; CopyButton `--repeat-each=20` 300 / 0 | `eval-018-parked.json` = `[]` |
| TKT-98 / TASK-93 (`TKT-98.md`) | — | — | OG: 6 of 7 families pass; the essay `og:image` 404 was fixed in `016c0ab` with an EVAL-017 guard (`task-93`). LinkedIn Inspector passed per Tushar on `c352abd`; re-check needed for `/`, `/projects` and `/certifications` (`task-86`) |
| TKT-99 / TASK-94 (`TKT-99.md`) | 581 | **full 1060 / 0** | — |
| TKT-100–102, 104–108, 110 (their `TKT-1xx.md` reports) | 578–591 with **1 failing snapshot** (`paper.test.tsx` TornEdge terracotta, stale since `43d5f73`, recorded as pre-existing) | targeted, 0 failed in final runs (e.g. TKT-107 627 / 0, TKT-110 525 / 0) | TKT-110 lhci desktop `/` CLS ≈ 0.001 |
| TKT-104 r2 / TASK-101 (`TKT-104-r2.md`) | 623 | 551 passed, 36 failed at w1440 after a browser crash mid-run (recorded in the report) | merged at `801bd61` with full e2e 1201 / 0 (EXE-23) |
| TKT-111 / TASK-108 (`TKT-111.md`) | 592 | 392 / 0 | bundle `/` 158.9 kB |
| TKT-113 / TASK-109 (`TKT-113.md`) | 625 | 718 passed / 6 failed (3 test fixes, 3 load flakes: 60 / 60 on rerun); final 80 / 80 | — |
| TASK-112 (`TASK-112.md`) | 625 | **full 1259 / 0** | — |
| TASK-113 (`TASK-113.md`) | 631 | 592 / 0 | `eval-018-parked.json` = `[]` |
| TASK-114 (`TASK-114.md`) | 632 | 542 / 0 | `--only EVAL-021,013`: 2 / 0 |
| TASK-116 (`TASK-116.md`) | 632 | full 1275 / 7 (stale `/projects` tests + crawler) → fixed; targeted 325 / 0; final full 1300 / 0 (`task-116`) | 6 / 0 |
| TASK-117 (`TASK-117.md`) | 635 post-merge (`task-117`) | 670 / 0; post-merge 413 / 0 | `--only EVAL-021,013`: 2 / 0 |
| TASK-118 (`TASK-118.md`) | 638 | 633 / 0 | — |
| TASK-119 (`task-119`) | 632 | 110 (w390/768/1440) | — |
| TASK-121 (`task-121`; plan in `TASK-121-plan.md`) | 641 | 262 + 107 (7 load flakes cleared on rerun) | report: not recorded (plan only) |
| TASK-122 (`task-122`) | 678 | video 16 / 16; prod e2e 98 passed | report: not recorded (ticket notes only); `tests/unit/csp.test.ts` pins the CSP |

**Whether the TornEdge snapshot failure was fixed:** the fixing commit is not recorded. Later reports (TKT-104 r2, TKT-113, TASK-112 onward) show 0 unit failures.

## M9-4. What is not yet evidenced (for Stages 8–10)

- **Stage 8** (design critique vs `Design.md`): not run. The M-009 `DES-` findings are not recorded. `docs/reports/DES-findings.md` is M-007.
- **Stage 9** (code review + `test-cases.md` execution): not run on M-009. `stage9-review.md` and `stage9-eval.md` are M-007.
- **Stage 10** (security review): not run on M-009.
  - Surface changes since M-007 include the CSP `frame-src` for youtube-nocookie (`lib/csp.ts`, Dev-119/113), a third-party iframe player (`lib/video-providers.ts`), a real headshot asset (Dev-102) and the PMP/SAFe scope in `scripts/forbidden-strings.ts` (`TKT-102.md`).
- **Full e2e + `pnpm eval` + lhci on the current tip `27d0004`:** not recorded.
- **Manual VoiceOver pass:** not recorded. `docs/a11y-pass.md` is an ARIA-snapshot proxy.
- **Accepted and open items:** the mobile LCP miss (EXE-24), PB4 videos (EXE-24), the sanitised résumé (PB5 / TASK-8), and the open Tushar decisions listed in `HANDOFF.md` §2.

---
---

# HISTORY — M-007 QA report (`m-007-quality` → `main`, 2026-09-22). Kept unchanged; superseded for M-009 by the section above.

# QA Report — Clay Portfolio · `m-007-quality` → `main`

**The single consolidated pre-deployment gate** (Stage 10). Branch `m-007-quality`, HEAD `420238e` (M-007 quality sweeps + Stage-8 design fixes + Stage-9 review fixes + Stage-10 security hardening), diff base `main` (M-001…M-006). Live public preview: `https://portfolio-clay-git-m-007-quality-tushar-49a6.vercel.app`. Date: 2026-09-22. Assembled in the main orchestrator context from the stage records below; every number is from real execution output.

**Sources:** `docs/reports/DES-findings.md` (Stage 8) · `docs/reports/stage9-review.md` + `stage9-eval.md` (Stage 9) · `evals/reports/eval-report-v1.0.0-rc3.md` + `evals/results/eval-run-v1.0.0-{rc2,rc3}.json`, `eval-run-preview-0e1a052.json` · Stage-10 security review (this document, §5) · `decisions.md` DC1–DC7, EXE-1..11 · `docs/reports/M007-qa.md`.

---

## 1. Executive summary

**Overall recommendation: READY WITH ACCEPTED RISKS** — approve the merge of `m-007-quality` into `main` and the current public preview as the reference build. **Production deploy is conditionally unlocked by content, not by quality:** it still requires (a) the three featured demo videos (PB4 gate fails closed without them — proven), (b) the sanitised résumé PDF (PB5) plus a delivery decision (CR-003), (c) a custom domain, and (d) Tushar's sign-off on the DRAFT copy. No unresolved Critical or High defect exists; every remaining item is either an accepted, documented risk or a Tushar-supplied input.

What the last three stages found and fixed (34 findings; 28 fixed, 6 parked with reasons, 0 open):
- **Stage 8 (design):** a P0 content-clipping bug in case-study artifact cards, the 19-card Impact wall, the flagship Ask returning "I don't have that" for the site's own products — all fixed and re-verified; 4 false positives dismissed with proof (one by testing a production build).
- **Stage 9 (review + tests):** two gate defects that could have let bad builds through — the PII/forbidden-string production gate was **fail-open** on unreadable trees (SF-1) and `pnpm eval` **exited green over five real failing tests** (DC6). Fixing the latter immediately caught a Stage-8 regression of my own (QA-007, mobile overflow) and rejected a wrong first fix. Also: preview link-previews pointed at a 404 host (CR-002), the Vercel build config lived only in the dashboard (CR-001), three drifting PII regexes (CR-005/008), CI-portable tests (CR-004).
- **Stage 10 (security):** no exploitable finding on a pure-SSG surface; the résumé PII gate was format-narrow (SEC-001, fixed with 10 regression cases); HSTS `preload` is a custom-domain commitment (SEC-002, checklist); CSP kept strict — the Vercel preview toolbar was disabled instead (DC7).

---

## 2. Per-stage results

| Stage | Scope | Findings | Fixed | Parked (reason) | Dismissed | Aggregate evidence |
|---|---|---|---|---|---|---|
| 8 · Design Critique | `impeccable` vs `Design.md`, running build (dev + prod) | 11 DES | 4 (DES-001 P0, 002, 004, 005) | 3 (003 → manual EVAL-001; 009 → content pass; 011 spec-met) | 4 (006 by design; 007 dev-only StrictMode; 008 measured correct; 010 convention) | e2e about+006+008 **349/0**; mobile/four-states/link-preview gates PASS |
| 9A · Code Review | `/code-review` low + manual pass + silent-failure hunt, `main..m-007-quality` | 9 CR + 6 SF | 12 | 3 (CR-003 Tushar decision; CR-007 → DC7; SF-5 documented) | — | typecheck 0 · lint 0 · vitest 298→306 |
| 9B · Test & Eval | `test-cases.md` TC-091/104–118 + full `pnpm eval` local + live preview | 4 QA (006–009) | 2 (006/=CR-002; **007**) | 1 (008 → DC7) | 1 (009 dup of 006) | rc2 13/1-info/3-manual; preview 12/0/2-skip/3-manual; **rc3 13/1-info/3-manual, Playwright 711/0, regressions none** |
| 10 · Security | threat-surface pass, live origin, `pnpm audit` | 2 SEC | 1 (SEC-001 Low) | 1 (SEC-002 Info → Stage-11 checklist) | — | prod audit **0/0/0/0/0**; headers served 6/6; private paths 404; vitest 316 |

**Gate totals on HEAD `420238e`:** typecheck 0 · lint 0 · **vitest 316 pass / 2 skip** · build `predeploy OK` / `content OK` / all routes static (13) · rc3 `criticalFailures: []`, `playwrightUnexpected: []`.

---

## 3. Unified Findings Register (one canonical row per underlying problem; strongest severity; every source stage)

| # | Canonical problem | Sources | Sev | Status | Resolution / evidence |
|---|---|---|---|---|---|
| U-01 | ExperimentCard text overflowed its 184px card (illegible) | DES-001 | P0 | **Fixed** `557b85e` | vertical connector; overflow measured 0 |
| U-02 | Case-study mobile column overflow at 390px in Deep-dive (Stage-8 regression of U-03's grid) | QA-007 (Stage 9), untagged e2e | P1 | **Fixed** `285adbd` | explicit 1-col < md; EVAL-008 Deep-dive sweep 333/0; live 6/6 slugs scrollWidth 390 |
| U-03 | Artifact grid: 184px slivers + empty tracks | DES-002 | P1 | **Fixed** `557b85e` (+`285adbd`) | auto-fit ≥ md, lone card fills column |
| U-04 | `/about` Impact 19-card wall buried measured numbers | DES-004 (M-006 carry) | P1 | **Fixed** `8175391` | two credibility tiers; no numbers changed |
| U-05 | Ask returned empty for flagship product names | DES-005; widening → CR-006 | P1 | **Fixed** `7ec03a1`; widening **accepted+pinned** (DC5, `3d8c2c9`) | aliases; EVAL-012 pin |
| U-06 | `pnpm eval` exited green over failing untagged Playwright tests | Stage-9 runner; DC6 | **P1 (gate)** | **Fixed** `285adbd` | fail-closed `PLAYWRIGHT-SUITE`; rc3 first clean full run |
| U-07 | PII/forbidden-string production gate fail-open on unreadable paths / corrupt sandbox file | SF-1, SF-2, SF-3 | **P1 (gate)** | **Fixed** `f95e8bb` | `skipped[]`, throws on corrupt file; 3 regression tests |
| U-08 | Preview OG/canonical/og:image → 404 production host | CR-002 = QA-006 = QA-009; DES link-preview gate | P2 | **Fixed** `86c2c36` | `VERCEL_ENV` gate; live og:image 200; opengraph.xyz 0 errors |
| U-09 | Vercel build command only in dashboard; `pnpm build` not Linux-safe; runbook wrong | CR-001 | P2 | **Fixed** `361adee` | `vercel.json` + `docs/deploy.md` §4 |
| U-10 | Résumé PII gate too narrow (3 drifting copies; ISO/textual DOB, intl/spaced phones, Western addresses, postal codes) | CR-005, CR-008, **SEC-001** | P2 | **Fixed** `f95e8bb` + `420238e` | single `PII_PATTERNS` + résumé-only `RESUME_PII_PATTERNS`; 10 regression cases; negative fixture |
| U-11 | Tests hard-code a macOS scratch path → CI EACCES; Actions 0 runs | CR-004 | P2 | **Fixed (code)** `f95e8bb`; CI run **pending** | `scratch-dir.ts`; first green run via the merge PR (triggers are `main`/PR) |
| U-12 | Résumé PDF delivery on Vercel (gitignored; `pdftotext` likely absent on builder) | CR-003 | P2 | **PARKED — Tushar decision** | commit sanitised PDF vs fetch; poppler in `installCommand` vs PII gate in CI; latent until the résumé exists |
| U-13 | Vercel preview toolbar blocked by CSP → console error on previews | CR-007 = QA-008; SEC review | P3 | **Resolved by DC7** | toolbar disabled (reversible); CSP unchanged; verify on next preview build |
| U-14 | Crawler internal-fetch errors lost detail / timeout = dead | SF-4 | P2 | **Fixed** `9fa9ac1` | timeout → warn, detail kept |
| U-15 | `bundle-budget --json` exits 0 on failure | SF-5 | P2* | **Parked — documented** | eval gates on JSON `ok`; `--strict` follow-up |
| U-16 | Parallax re-activation snap | CR-009 | P3 | **Fixed** `f9a8bec` | initial `apply()` |
| U-17 | Ask provider failure had no operator logging | SF-6 | P3 | **Fixed** `5f5c3e7` | `console.error` |
| U-18 | Hero CTA row below the fold at a 748px-tall 1440 viewport | DES-003 | P2 | **Parked → manual EVAL-001 (Tushar's device)** | EXE-9 was human-signed; local viewport artefact; recommended `lg:pt-32→pt-24` only if confirmed |
| U-19 | "0 invented citations" wording differs `/about` vs `/work/railcite` | DES-009 | P3 | **Parked → DRAFT-copy sign-off pass** | both truthful |
| U-20 | HSTS `preload`+`includeSubDomains` is a future custom-domain commitment | SEC-002 | Info | **Checklist** `docs/deploy.md` §6a | no change on `*.vercel.app` |
| U-21 | OG description 45 chars (inspector warning) | opengraph.xyz (Stage 9) | P3 | **→ DRAFT-copy sign-off** | content, not code |
| — | Dismissed with proof | DES-006 (Draft badge = intentional), DES-007 (dev-only StrictMode; prod verified), DES-008 (grid measured correct), DES-010 (convention), DES-011 (spec met) | — | Closed | see `DES-findings.md` |

**Severity summary (canonical rows):** P0 1 (fixed) · P1 6 (all fixed) · P2 9 (6 fixed, 3 parked with owner) · P3 5 (3 fixed, 2 parked to content) · Info 1 (checklist). **Unresolved Critical/High: 0.**

---

## 4. Open issues & accepted risks (never silently omitted)

**Accepted-risks register (carried into release):**
1. **EVAL-005 bundle 191.1 kB gz vs 180 budget** — informational; residual is the *approved* cursor-spring; provisional B2 (EXE-11); budget not weakened; real perf score to be read on Vercel (desktop Lighthouse 100 locally).
2. **EVAL-004 mobile Lighthouse on this host** — swiftshader/no-GPU artefact (documented since M-002); rc3 shows no regression; verify on real infra.
3. **`extract-zip` 2 highs (EXE-2 allowlist) + `uuid` moderate** — dev-only (`@lhci/cli` → lighthouse → puppeteer chain, not Playwright as EXE-2's text says — provenance note); prod audit 0/0/0/0/0.
4. **CSP `'unsafe-inline'` on `script-src`** — required by Next's SSG RSC bootstrap (2 inline scripts); no markup-injection sink exists (0 `dangerouslySetInnerHTML`/`innerHTML`/`eval`); accepted.
5. **SF-5** `bundle-budget --json` exit code — documented; eval gates on `ok`.
6. **DC5** Ask single-word synonym widening — accepted, pinned.

**Open decisions for Tushar (block production, not merge):** CR-003 résumé delivery · EXE-10 ratify · EXE-11 B1-vs-B2 · DES-003 hero fold (manual EVAL-001 on his device) · DRAFT copy + 8 Ask answers sign-off (clears the Ask "Draft" badges, DES-009, the 45-char OG description) · VoiceOver spot-check (TC-109) · LinkedIn Post Inspector (his login) · the three demo videos (PB4) · sanitised résumé (PB5) · domain.

**Known process caveats (honest):** the `/security-review` slash command could not execute in the Stage-10 agent (it refuses outside a git cwd and the session shell is pinned to the sibling `portfolio` folder) — the review was the manual equivalent over the same diff plus live-origin probing; GitHub Actions has never run for this repo (triggers only on `main`/PR) — the merge PR will be its first run; three EVAL cases are MANUAL by design (001/003/009).

---

## 5. Security review (Stage 10) — findings

| ID | Component | Finding | Sev | Status |
|---|---|---|---|---|
| SEC-001 | `scripts/forbidden-strings.ts` `PII_PATTERNS` → `scanResumePii` | Résumé PII gate format-narrow (ISO/textual DOB, `+1 (415) 555-0123`, `98765 43210`, Western street words, postal codes all passed). Self-leak gate, not attacker-driven; no PDF committed today. | Low | **Fixed** `420238e` — résumé-only superset, 9 positive + 1 negative regression cases; content scan deliberately unchanged |
| SEC-002 | `next.config.ts` HSTS | `preload; includeSubDomains` unconditional — irreversible commitment on a future apex domain; no-op on `*.vercel.app`. | Info | **Checklist** `docs/deploy.md` §6a (Stage 11) |

**Verified clean:** headers served byte-identical to config (CSP, HSTS, XFO `DENY`, Referrer-Policy, Permissions-Policy, nosniff; no `x-powered-by`) · `'unsafe-inline'` justified, zero injection sinks · Ask: input is state only, no `RegExp` from input, React text rendering · logging: no user input/secrets · all `target=_blank` carry `rel="noopener noreferrer"` · media/OG `src` from typed data · secrets: only `.env.example`/`.env.tooling` (secret-free) tracked; `/.env*`, `/tests/forbidden.local.json`, `/resume.pdf`, `/SOURCES.md`, `/HANDOFF.md`, `/.git/HEAD` → 404 · dev routes 404 in prod, `robots.txt` disallows `/dev/`, sitemap = 22 public routes · predeploy gate wired via `vercel.json` `prebuild` · Analytics gated on `VERCEL`, same-origin beacons · `lib/seo.ts` host gate confirmed live.

---

## 6. Formal QA gate & release gates

| Gate | Verdict | Basis |
|---|---|---|
| **Design** | PASS | Stage 8 clean re-run; web-deliverables mobile / four-states / link-preview verified on the deployed build |
| **Code Quality** | PASS | `/code-review` findings all fixed or parked with owner; typecheck 0 / lint 0 |
| **Functional Test** | PASS | vitest 316/0; Playwright 711/0 (rc3, fail-closed harness); TC-091/104–118 PASS or NA-manual |
| **Evaluation** | PASS with accepted risks | rc3: 13 pass / 1 informational fail (EVAL-005) / 3 manual; `criticalFailures: []`; no regression vs baseline; thresholds unchanged (EV2) |
| **Security** | PASS | 0 exploitable; SEC-001 fixed; SEC-002 checklisted; prod audit clean |
| **Overall** | **READY WITH ACCEPTED RISKS** | Merge `m-007-quality` → `main` approved on this evidence. **Production deploy: conditional on PB4 videos, PB5 résumé (+ CR-003), domain, DRAFT sign-off — all Tushar-supplied.** |

**Release-gate check (eval-framework):** critical functionality fails — none · critical security issue — none · mandatory acceptance criteria fail — none · required suites not executed — none (all executed from real output; 3 MANUAL by design) · critical regression — none · mandatory threshold missed — only the informational bundle budget (accepted EXE-11, not weakened). **No unresolved Critical contradicts this verdict.**

**Approval:** this recommendation requires Tushar's explicit approval before Stage 11 (merge + deploy). Until then: do not merge to `main`, do not deploy production.
