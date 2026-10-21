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

---

# Stage 9 · Code Review + Test & Eval Execution — round 2 (Stage 7 + Stage 8 showcase work, Tushky FAQ)

**Reviewed range:** `6eaee1b5..de5a0bcb` on `main` — PRs #147 (TASK-303), #148 (TASK-305), #149 (TASK-307), #150 (TASK-308), #151 (TASK-305), #152 (Stage 8, TASK-309…316), #153 (TASK-317) · 28 files, +1410/−160 · **Date:** 2026-10-21 · **Skill:** `bw-code-review-test-eval` · **Fix branch:** `m025/stage9` (Campfire **TASK-318**; parked gate work **TASK-319**). Tushar AFK — "move to Stage 9, don't wait for my approval" (memory `afk-autonomy-2026-10-21`).
**Method:** `/code-review` at low effort over the range (10 findings, every one re-verified against file:line or production before triage) + the `silent-failure-hunter` agent on the same diff (6 findings) + the orchestrator's own probes on production de5a0bcb (loading state on the home hero and the Urja / TeachSpark case-study players with YouTube blocked; FAQ lookups through `lookupFaq`). Evals: **NA** — skipped by standing decision (memory `skip-evals-2026-10-14`); no `/evals/results` run was produced this round.

## 9A · Code review — `CR-` findings

| ID | File | Finding | Sev. | Resolution |
|---|---|---|---|---|
| CR-010 | `lib/ask/synonyms.ts` | The six TASK-317 synonym rows were inert: the FAQ path (`normaliseQuestion`) never consults `SYNONYMS`, and no `data/knowledge.ts` entry carries those terms, so the rows changed nothing (hyphenated twins were also dead duplicates — the hunter's SF-002). | P2 | **Fixed** — rows removed; the product questions are served by the FAQ aliases alone (10/10 lookups unchanged after removal). Rephrased product questions that miss the FAQ still fall to the generic index answer — pre-existing index behaviour, see SF-001 (parked). |
| CR-011 | `components/portfolio/ProductMediaPlayer.tsx` | The DES-016 loading poster was wrapped in a new absolute `.pf-loading-poster` div on **every** `ProductMediaPlayer` mount (hero intro, case-study players), where direct-child sizing rules no longer applied — verified on production: the TeachSpark case player's cover measured 158 px wide inside a 528 px screen while loading. | P2 | **Fixed** — the poster is rendered as a direct child again (one `poster` node shared with the poster state), the wrapper rule deleted; the "Loading video…" pill stays scoped to `.pf-stage-screen` (showcase + hero, both checked). |
| CR-012 | `app/work/[slug]/*-paper.css`, `app/globals.css` | TASK-307 satisfied EVAL-020 ("0 colour literals outside globals.css") by spelling `#000` as `black` in six case-study CSS files and adding ~25 value-named `--lit-*` / `--pp-*` tokens to globals.css. | P3 | **Parked → TASK-319** (extend `LITERAL_RE` to named colours with a deliberate allow-list; map the tokens onto the role / `--mat-*` tiers, EXE-40). Not a runtime defect. |
| CR-013 | `IndependentProductsShowcase.tsx` `watchVideo` | Re-implemented the header-offset scroll by hand and bypassed Lenis when mounted (fine-pointer visitors in a narrow window), skipping the `lenis.resize()` resync (TKT-90b) and the focus move. | P2 | **Fixed** — `scrollToTarget(stage)` first (Lenis-aware, focuses the target); the offset-chain native scroll remains the fallback for touch / reduced motion. |
| CR-014 | `tests/e2e/hover-stability.spec.ts` | Sampled `getBoundingClientRect()` right after `scrollIntoViewIfNeeded()`, before the stage's entrance transform and the smooth scroll settled — could fail with perfectly stable hover. | P3 | **Fixed** — settle wait + a stable-rect poll before the baseline sample. |
| CR-015 | `ProductMediaPlayer.tsx` | Keyboard focus moved into the iframe while the loading poster covered it; the only loading cue was CSS generated content, never a live region. | P2 | **Fixed** — focus moves on `ready`; an `sr-only` `role="status"` "Loading video…" accompanies the poster during loading (spec `stage8-des` TASK-313 asserts it). |
| CR-016 | `lib/ask/synonyms.ts` | Hyphenated synonyms were dead duplicates of their joined twins. | P3 | **Subsumed by CR-010** (rows removed). |
| CR-017 | `ProductMediaPlayer.tsx` | Poster markup duplicated verbatim in the loading and poster branches. | P3 | **Fixed** — one `poster` constant. |
| CR-018 | `components/portfolio/paper-selector-flag.ts` | Kill-switch doc named `.pf-paper` (the card/player class) instead of the emitted `.pf-psel`. | P3 | **Fixed** — comment corrected. |
| CR-019 | `components/portfolio/ProductCarousel.tsx` | Three-way nested ternary for the counter with the padding rule written twice. | P3 | **Fixed** — one `current` value, the paper skin only adds its span. |

## 9A · Silent-failure hunt — `SF-` findings

| ID | File | Finding | Sev. | Resolution |
|---|---|---|---|---|
| SF-001 | `lib/ask/local-provider.ts` + `data/knowledge.ts` | A product question that misses the FAQ falls to the keyword index, where no product term scores, so e.g. "What tech is Slag City built with?" returns the generic *built* answer; "Does he have a game?" returns the easter-egg answer (`game` is a `gummy` synonym). Pre-existing design of the deterministic index, not introduced by this range. | P2 | **Parked** — belongs with the deferred Tushky option 2 / a per-product knowledge-entry pass (memory `tushky-rag-later`); recorded in HANDOFF carry-ins. |
| SF-002 | `lib/ask/synonyms.ts` | Hyphenated multi-word synonyms unreachable after the normaliser splits hyphens. | P3 | **Moot** — rows removed (CR-010). |
| SF-003 | `app/globals.css` loading poster | The poster over the iframe swallowed clicks for the whole loading window (up to the 6–15 s grace). | P3 | **Fixed** — `[data-player-state="loading"] > :not(iframe) { pointer-events: none }`. |
| SF-004 | `IndependentProductsShowcase.tsx` `watchVideo` | Silent early return when the stage element is missing. | P3 | **Fixed** — dev-only `console.warn`. |
| SF-005 | `ProductInfoPanel.tsx` / `data/schema.ts` | A product without `cardLine` falls back to its full description under the 3-line clamp (campfire-board 108, cubicle 114, token-toli 139 chars). | P3 | **Covered** — `paper-card.spec.ts` (#147) asserts no product's description is clipped at 1440×900, and the Stage 8 probe confirmed 10/10 at 1440/1512/1920; no change. |
| SF-006 | `app/globals.css` narrow-card block | `display: none` on the kicker category at ≤ 300 px card width removed it from the accessibility tree. | P3 | **Fixed** — clipped (sr-only pattern) instead, so the tag still reaches assistive tech. |

Checked and fine (hunter): CTA label split keeps "Watch demo video" / "Watch demo" as the accessible name; hidden secondary labels use clip, not `display:none`; loading-state error paths still reach the visible error state; carousel ARIA unchanged; `checkFaq()` fails prebuild loudly (exit 1), stale entries never served; TASK-307's re-stamp of 17 answers matches the data (no "IntraEdge").

## 9B · Frontend performance (lab, production de5a0bcb, Lighthouse 12.6.1 from the repo's `@lhci/cli`, 2026-10-21 ~10:40 IST)

Conditions: `--only-categories=performance`, Lighthouse simulated throttling (mobile: Moto G Power profile, 4× CPU, slow-4G; desktop preset: 1× CPU), headless Chrome with a fresh temp profile, 3 runs per cell, cold cache each run, run on the build host **while the unit suite and a build were running on it** (TBT and render timings carry contention; TTFB and transfer sizes do not). **Field data: BLOCKED** — the keyless PageSpeed Insights API quota was exhausted (`Queries per day`), so no CrUX read; the site is new enough that CrUX is unlikely to have a mobile sample yet. Raw JSON: `/Volumes/E Drive/Dev/.scratch/stage9/lh/`.

| Route | Form factor | Runs | LCP ms median (range) | CLS | TBT ms | FCP ms | TTFB ms | Weight kB | Score |
|---|---|---|---|---|---|---|---|---|---|
| `/` | desktop | 3 | **1260** (1259–1266) | 0.001 | 7 (6–8) | 555 | 55 | 1756 | 97 |
| `/` | mobile | 3 | **5449** (5299–7338) | 0.000 | 378 (230–447) | 2745 | 60 | 1520 | 62 (54–71) |
| `/projects` | desktop | 3 | **1262** (1140–1460) | 0.008 | 312 (268–497) | 579 | 58 | 1835 | 79 (73–83) |
| `/projects` | mobile | 3 | **6410** (6273–6975) | 0.000 | 445 (364–656) | 2911 | 57 (49–1112) | 1222 | 53 (52–60) |

Budgets (`evaluation-plan.md` EVAL-005): LCP ≤ 2.5 s · CLS < 0.05 · home JS ≤ 180 kB gz (bundle gate, not re-measured here). **Desktop: PASS** on both routes (LCP 1.26 s, CLS ≤ 0.008). **Mobile: FAIL** on both routes — and worse than the 2.7–3.2 s Tushar accepted at EXE-24 (TKT-92, `QA-report.md`).

**Diagnosis (measured, not fixed):** the LCP element is the hero's mobile background `<img>` (`hero-home-bg-mobile.webp` on `/`, `scene-work-bg-mobile.webp` on `/projects`). Its phase split on `/` mobile: TTFB ≈ 640 ms · load delay 320–1590 ms · load time 460–600 ms · **render delay 2600–5770 ms**; on `/projects`: load delay 90–1120 ms · load time 240–1070 ms · **render delay 2900–5440 ms**. The image is on the wire by ~1.5–2.5 s and painted 3–5 s later, so the cost is between download and paint: main-thread work under 4× CPU (TBT 230–660 ms, 81 requests, two woff2 fonts of 119 kB + 73 kB and a 94 kB stylesheet ahead of it) and/or a reveal that waits for hydration. The clean desktop render delay (657 ms) points at CPU-bound work rather than the image path. One `/projects` run also hit a 1.1 s TTFB (cold edge), the others 50–60 ms. **QA-012 → TASK-320 (P1):** reproduce with a DevTools performance trace on an idle host, split hydration vs font blocking vs any JS-gated scene reveal, then decide the least visually destructive fix (the layered hero is a deliberate identity — measure its cost before trimming it). Not a Stage 7/8 regression: the hero and scene openers were not touched in this range; the paper-world hero shipped with M-011.

## 9B · Test execution

_(filled in below once the scoped run finishes)_
