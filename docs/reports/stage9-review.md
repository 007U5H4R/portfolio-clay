# Stage 9 · Code Review + Test & Eval Execution — consolidated record

**Branch:** `m-007-quality` · **Reviewed diff:** `main..m-007-quality` · **Review HEAD:** `0e1a052` → **fixed HEAD:** `285adbd`/`76da616` · **Date:** 2026-09-22 · **Skill:** `bw-code-review-test-eval` (Fable, low effort)
**Inputs:** `docs/reports/DES-findings.md` (Stage 8), `docs/reports/M007-qa.md`, `test-cases.md`, `evaluation-plan.md`.
**Method:** three parallel agents — a `code-reviewer` (`/code-review` at low effort + a targeted manual pass, every finding re-verified against file:line or the live preview), an `eval-runner` (executed the planned suites from real output; report-only → `docs/reports/stage9-eval.md`), and a `silent-failure-hunter` over the M-007/Stage-8 code. The orchestrator triaged, fixed or parked every finding, and verified each fix red→green and on the deployed preview.

## Headline

- **Code review:** 9 `CR-` findings (5×P2, 4×P3) + 6 silent-failure findings (`SF-`, 1×P1) → **13 fixed, 4 parked with reasons, 0 open.**
- **Test & eval execution:** canonical local run + first live-preview run, both `criticalFailures: []`; the runner surfaced **3 findings the `pnpm eval` gate itself could not see** (QA-007/008/009) — one of them a real Stage-8 regression of mine, and one a **silent failure of the gate itself** (fixed, DC6).
- **Post-fix gate:** typecheck 0 · lint 0 · **vitest 306 pass / 2 skip** (298 → 306: every new case is a regression scar) · build `predeploy OK`, all routes static (13) · extended EVAL-008 sweep **333 pass / 0 fail** (was 327 / 6) · **final canonical `eval-run-v1.0.0-rc3`: see §5.**
- **Live on the deployed preview (`76da616`):** all 6 TP9 headers served · `og:image` **200** on every route (was 404) · opengraph.xyz **0 errors / 10 passes** (was 1 error) · 390px Deep-dive **no overflow on all 6 case studies.**
- **No threshold weakened (EV2); one gate strengthened (DC6). No content truth value changed.**

## 1. Code-review findings (`CR-`) — dispositions

| ID | Sev | File(s) | Finding (verified) | Disposition |
|---|---|---|---|---|
| CR-001 | P2 | `package.json`, `.env.tooling`, `docs/deploy.md` | `pnpm build` wraps `next build` in `dotenv -e .env.tooling`, whose E-Drive paths + placeholder `NEXT_PUBLIC_SITE_URL` break/mis-set a Linux build; the working override lived only in the Vercel dashboard. | **FIXED** `361adee` — committed `vercel.json` (`prebuild → next build → assert-static`), runbook §4 corrected. |
| CR-002 | P2 | `lib/seo.ts` | Preview OG/canonical/`og:image` resolved to the production host (404 until a production deploy exists); `VERCEL_PROJECT_PRODUCTION_URL` is set on previews too. = QA-006 = runner's QA-009. | **FIXED** `86c2c36` — production host only when `VERCEL_ENV==="production"`; unit tests updated + preview case. **Verified live:** `og:image` 200 on `5f5c3e7`/`76da616`. |
| CR-003 | P2 | `predeploy-check.ts`, `.gitignore` | PB5 résumé path can't ship via git deploy (PDF gitignored; `pdftotext` likely absent on Vercel's builder). | **PARKED → decision for Tushar / Stage 10.** Needs a delivery choice (commit the sanitised PDF vs fetch in prebuild) and either poppler in `installCommand` or PII extraction moved to CI with presence/size kept in prebuild. Latent until the résumé exists. |
| CR-004 | P2 | `tests/unit/{predeploy,forbidden-strings}.test.ts`, CI | Module-level `mkdirSync("/Volumes/E Drive/…")` → EACCES on a Linux runner; Actions has **0 runs ever**. | **FIXED (code)** `f95e8bb` — `tests/unit/scratch-dir.ts` (E Drive locally, OS tmpdir on CI). **Actions is enabled** (verified) but the workflow only triggers on `main` pushes / PRs → first green run will come from the Stage-10 merge PR (draft PR recommended). |
| CR-005 | P2 | `predeploy-check.ts:51` | Phone PII regex matched only 10 contiguous digits → `+91 98765 43210` passed the gate. | **FIXED** `f95e8bb` — single exported `PII_PATTERNS`; spaced-`+91` regression test. |
| CR-006 | P3 | `data/knowledge.ts` + synonyms | DES-005 aliases widened single-word cluster synonyms to score 1.0 (unpinned). | **ACCEPTED + PINNED** `3d8c2c9` — decision **DC5**; EVAL-012 case asserts cluster words resolve, off-topic stays empty. |
| CR-007 | P3 | `next.config.ts` CSP | Vercel's preview toolbar (`vercel.live`) blocked by CSP → console error on previews only; fails `smoke.spec` under `--base-url`. = runner's QA-008. | **PARKED → Stage 10 (security).** Recommend scoping the smoke console-error allowlist to that one origin (keeps prod CSP strict) over widening CSP. |
| CR-008 | P3 | `predeploy-check.ts:50` | DOB regex accepted a 2-digit year → version-like `12.05.26` flagged as DOB. | **FIXED** `f95e8bb` — canonical `(19\|20)\d{2}`. |
| CR-009 | P3 | `Parallax.tsx` | No initial `apply()` on re-activation → layer sat at 0 until the next pointermove, then snapped. | **FIXED** `f9a8bec`. |

## 2. Silent-failure findings (`SF-`) — dispositions

| ID | Sev | File | Finding | Disposition |
|---|---|---|---|---|
| SF-1 | **P1** | `forbidden-strings.ts` `walk()` | readdir/stat errors swallowed → the PII/forbidden-string **production gate under-scanned and reported "0 hits"** (fail-open). | **FIXED** `f95e8bb` — `ScanResult.skipped`; any unreadable path fails `checkForbiddenStrings` and the CLI (exit 1). Absent source-category root tolerated (absent ≠ unreadable); missing `.next` under `--bundle` is a recorded skip. Regression tests (unreadable dir: scan + gate). |
| SF-2 | P2 | same, per-file read | Unreadable file silently `continue`d. | **FIXED** (same commit) — recorded in `skipped`. |
| SF-3 | P2 | `readSandboxCodes` | Malformed `forbidden.local.json` → `[]` = "verified zero codes", no SKIP line. | **FIXED** (same) — throws; gate reports `forbidden-scan-skipped`. Tests: malformed vs absent. |
| SF-4 | P2 | `crawler.ts` `getInternal` | Any fetch error → `dead: "fetch failed"`, timeout indistinguishable, detail discarded. | **FIXED** `9fa9ac1` — timeout → `warn` (CF-1 parity), real error text kept. |
| SF-5 | P2* | `bundle-budget.ts --json` | Exits 0 on failure in JSON mode. | **PARKED** — verified `eval.ts` gates on the JSON `ok` field, not the exit code (documented intent). Follow-up: a `--strict` flag for future callers. |
| SF-6 | P3 | `AskProvider.tsx` | Caught provider error had zero operator logging. | **FIXED** `5f5c3e7` — `console.error` before the supersession check. |

## 3. Eval-runner findings (`QA-`) — ratified

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| QA-006 | P2 | Preview `og:image` 404 (found by the orchestrator via opengraph.xyz during Stage 9; canonical id for CR-002). | **FIXED** `86c2c36`, verified live. |
| QA-007 | **P1** | 390px horizontal overflow in Deep-dive on 6 case studies — **my Stage-8 DES-002 regression**; invisible to the EVAL-008 sweep (never opened Deep-dive) and to `pnpm eval` (untagged failing spec). Probe-verified root cause: the `auto-fit`/`min(100%,15rem)` template made the mobile column size to 601px. First fix attempt (`min-w-0`) was **wrong and caught by the new scars** (327/6 fail). | **FIXED** `285adbd` — explicit single column below `md`, auto-fit from `md` up. Scars: Deep-dive step in the EVAL-008 sweep; **DC6** fail-closed harness. Red→green 327/6 → 333/0; **verified on the deployed build (6/6 slugs, scrollWidth 390).** |
| QA-008 | P2 | = CR-007. | **PARKED → Stage 10.** |
| QA-009 | P1 | = CR-002/QA-006. The runner's "`VERCEL_ENV=production` on previews" hypothesis was an artefact of reading the then-uncommitted `seo.ts` while testing a preview built from the old code — **refuted empirically** (the gate resolved false; `VERCEL_URL` used). | **DUPLICATE of QA-006 — fixed.** |

## 4. Test-case execution (from real output; detail in `docs/reports/stage9-eval.md`)

TC-091 PASS · TC-104 PASS (+ now covers Deep-dive) · TC-105 PASS · TC-106 PASS · TC-107 NA(manual) · TC-108 PASS · TC-109 NA(manual, VoiceOver → Tushar) · TC-110 PASS · TC-111 PASS (18/18 → 22/22 with the new gate cases) · TC-112 PASS(automated)/NA(manual spot-check) · TC-113 PASS(local, informational)/SKIP(preview Lighthouse by design) · TC-114 PASS(headers 6/6) / **sub-clause "0 CSP violations" → QA-008 parked** · TC-115 PASS · TC-116 PASS(mechanical)/NA(Analytics dashboard) · TC-117 PASS · **TC-118 PASS (live)** — opengraph.xyz on `76da616`: 0 errors / 3 warnings (45-char description → DRAFT copy) / 10 passes; LinkedIn Post Inspector still to be run by Tushar (needs his LinkedIn login).

## 5. Eval records (real execution output, versioned, never overwritten)

| Record | Commit | Result |
|---|---|---|
| `evals/results/eval-run-v1.0.0-rc2.json` | `0e1a052` (pre-fix) | 17 cases · 13 pass · 1 fail (EVAL-005 informational bundle 191.1 kB, accepted risk EXE-11) · 3 manual · `criticalFailures: []` · **but 5 untagged Playwright failures (QA-007) invisible to the harness** — the reason for DC6 |
| `evals/results/eval-run-preview-0e1a052.json` | `0e1a052` live | 12 pass · 0 fail · 2 skip (Lighthouse, by design) · 3 manual · all 6 TP9 headers |
| `evals/results/stage9-qa007-eval008.json` | wrong fix | EVAL-008 **FAIL** 6 · `PLAYWRIGHT-SUITE` critical → exit 1 (scar proven red) |
| `evals/results/stage9-qa007-eval008-v2.json` | `285adbd` | EVAL-008 PASS 333/0 → exit 0 (green) |
| `evals/results/eval-run-v1.0.0-rc3.json` | `76da616` | **Final canonical run on the fixed HEAD, first full-suite run through the DC6 harness.** Build `predeploy OK` · vitest green · **Playwright 711 passed / 0 failed (7.1 min)** — the untagged case-study deep-dive tests that failed under rc2 (682 / 5) and the new Deep-dive sweep all pass; `playwrightUnexpected: []`. Lighthouse (informational: EVAL-004/005 accepted risks) + the JSON write were still finishing at the time of this record and are committed on completion. |

**rc3 result:** Playwright **711 / 0** (vs rc2 682 / 5) — the QA-007 regression is closed and the DC6 harness passes the whole suite; Lighthouse figures land with the JSON.

## 6. Exit criteria

- `/code-review` clean: every `CR-`/`SF-` fixed or parked with a written reason — **met.**
- Planned suite executed from real output; critical cases pass — **met** (rc2 + preview + targeted post-fix runs; rc3 pending as the final record).
- Not "merely builds/lints/type-checks" — the suite found and forced a real regression fix (QA-007) and a gate fix (DC6). **Stage 9 complete on rc3 confirmation.**

## 7. Carry-forwards → Stage 10 (Security Review + `QA-report.md`)

- **Decisions for Tushar:** CR-003 résumé delivery on Vercel; CR-007/QA-008 CSP vs preview toolbar; EXE-10/EXE-11 (unchanged); DES-003 hero fold (manual EVAL-001); DRAFT copy sign-off (also clears the 45-char OG description warning and the Ask "Draft" badges).
- **Accepted-risks register (carry):** EVAL-005 bundle 191.1 kB (EXE-11), EVAL-004 mobile Lighthouse swiftshader artefact, EXE-2 `extract-zip` highs, `uuid` moderate (dev-only), CSP `'unsafe-inline'`, SF-5 `--json` exit code.
- **Follow-ups:** first green CI run (draft PR `m-007-quality → main`); regenerate `docs/screenshots/about/*` (predate the DES-004 retier); DES-009 wording harmonisation (deferred again — content-sensitive, fold into the DRAFT sign-off pass); LinkedIn Post Inspector (Tushar).
- **Do NOT merge to `main` or deploy production before the Stage-10 `QA-report.md` gate.**
