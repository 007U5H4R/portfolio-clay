# TSK-07 report — Screenshots + minimal `pnpm eval` + baseline (M-001 / TKT-01)

**Status:** Harness built, Chromium installed on the E Drive, all deferred Playwright gates folded in and run, `baseline-v1.json` captured from real execution output. **Trio + build green.** The tracer harness surfaced real EVAL-008 failures and two design deviations — reported below, NOT fixed (per brief: the orchestrator decides fixes before the visual gate).

Model tier: most-capable. Branch: `m-001-tracer`. Everything ran on the E Drive.

---

## S07.01 — Playwright config + fixtures
- `playwright.config.ts`: 4 projects `w390` (390×844, isMobile+hasTouch) / `w768` / `w1024` / `w1440`, `webServer: pnpm start` on `127.0.0.1:3000` (`reuseExistingServer`), reporter `[list, json→.eval/playwright.json]`, `outputDir: test-results`, `reducedMotion: no-preference`.
- `tests/e2e/fixtures.ts`: `axe` (wcag2a/2aa/21aa, fails on critical|serious), `noOverflow`, `minTargets` (≥44×44 with a documented allowlist — currently only the sr-only SkipLink), `withReducedMotion`, `noViewTransitions`. (Fixture provider param named `provide`, not `use`, so ESLint's react-hooks rule doesn't misread it as a hook.)
- **Gate:** `playwright test --list` → 4 projects × 2 spec files (64 tests). `ls ~/Library/Caches | grep -c ms-playwright` → **0**.

## S07.02 — Chromium installed on the E Drive
- `dotenv -e .env.tooling -- pnpm exec playwright install chromium`.
- Install path: **`/Volumes/E Drive/Dev/.cache/ms-playwright/chromium-1243`** (+ `chromium_headless_shell-1243`, `ffmpeg-1011`).
- **`df -h /` (internal disk) before: 24Gi avail · after: 24Gi avail** — unchanged (browser landed on the E Drive, not the internal disk).
- `ls ~/Library/Caches | grep -c ms-playwright` → **0** (nothing on the internal disk).

## S07.03 — Tracer spec + folded-in deferred checks
- `tests/e2e/tracer.spec.ts` (tags `@EVAL-006 @EVAL-008 @EVAL-010 @EVAL-015`): both routes (`/`, `/work/teachspark`) at all 4 widths → 8 screenshots + `noOverflow` + `minTargets`; `axe` at 390/1440; VT fallback (EXE-5 plain nav, identical end state: h1 "TeachSpark" + header media) + no-JS static HTML; reduced-motion (card hover does not lift, header transition collapses); header compaction, NavPill, MobileMenu focus-trap/Esc/axe@390, SkipLink, AskAIButton tab-order, hero frame ladder (S05.02), tile offsets (S05.03), resume placeholder + `/resume.pdf`→404 (E-13).
- Fixed `avatar-edge.spec.ts` to use `process.cwd()` instead of `import.meta` (repo has no `"type":"module"`, so Playwright's CJS transform could not load it — it had never run before TSK-07).
- **Screenshots (9):** `home-{390,768,1024,1440}.png`, `case-{390,768,1024,1440}.png` (8) + `avatar-edge@2x.png`.
- **Avatar-edge halo verdict: NO HALO.** The cutout edges (hair, beard, shoulders) read clean over the sky→lavender gradient — no light fringe. `tsx scripts/avatar.ts --erode 1` re-shoot **not needed**.

## S07.04 — Lighthouse CI configs
- `lighthouserc.mobile.json` / `lighthouserc.desktop.json`: `startServerCommand: pnpm start`, `url: [/]` (tracer), `numberOfRuns: 3`, `startServerReadyPattern: "Ready in"`, `aggregationMethod: median`, assertions present but **`warn`-level (informational)** until TKT-07/S11.01 flips them to `error` and expands to 4 routes. Separate `outputDir` per form factor (`.lighthouseci/{mobile,desktop}`).
- **Gate:** `lhci autorun --config lighthouserc.mobile.json` completed 3 runs → `.lighthouseci/mobile/*.json`.

## S07.05 — Minimal orchestrator (schema v1)
- `scripts/eval.ts`: builds (unless `--skip-build`), runs Playwright + LHCI mobile+desktop + `scripts/bundle-budget.ts`, collects provenance (git HEAD/branch/dirty, node, pnpm, next from lockfile, os.release, timestamp, sha256 of `eval-cases.json`), maps → `cases[]` (PASS/FAIL for 006/008/010/015; measured+informational for 004/005; MANUAL for 001/003/009/017; SKIP `not built yet` for the rest), computes totals, writes `evals/results/<label>.json` and **never overwrites** (appends `-2`…). Flags `--label --only --skip-build --informational`; exits non-zero on FAIL among `critical` cases unless `--informational`.
- `scripts/bundle-budget.ts`: bundler-agnostic first-load JS for `/` — reads the prerendered `.next/server/app/index.html`, gzip-sums every `/_next/static/**.js` it references (Turbopack emits no `app-build-manifest.json`, so the manifest approach from the plan does not apply; the rendered HTML is the source of truth). `--json` for the orchestrator; human mode exits 1 over budget.
- `package.json` `eval` script wired to `dotenv -e .env.tooling -- tsx scripts/eval.ts`.
- **Gate:** `pnpm eval --label baseline-v1 --informational` wrote `evals/results/baseline-v1.json`; `node -e "…schemaVersion,provenance.commit.length,totals.cases"` → **`1 40 17`**. ✓

## S07.06 — Baseline captured (`baseline-v1.json`, from real execution output)

| EVAL | Status | Numbers |
|---|---|---|
| **EVAL-006** (axe) | **PASS** | 0 critical / 0 serious at 390 & 1440, both routes; 12 specs across w390/w768/w1024/w1440 |
| **EVAL-008** (responsive) | **FAIL** | (1) home **horizontal overflow at w1024: scrollWidth 1188 > 1024**; (2) header **logo link 40 px tall < 44** (all widths) |
| **EVAL-010** (reduced motion) | **PASS** | card hover does not lift, header transition collapses to `none` under reduced motion |
| **EVAL-015** (graceful degradation) | **PASS** | VT fallback plain-navigates card → `/work/teachspark` with identical end state; content + nav present with JS disabled |
| EVAL-004 (Lighthouse) | PASS *(informational)* | `/` mobile **[96,100,100,100]**, desktop **[100,100,96,100]** — all ≥ [90,95,95,95] |
| EVAL-005 (home budgets) | FAIL *(informational)* | **first-load JS 218.7 kB gz** (budget 180), **LCP mobile 2858 ms** (budget 2500), **CLS 0** (ok) |

Manual: EVAL-001/003/009/017. Skipped (`not built yet`): EVAL-002/007/011/012/013/014/016. Totals: **4 pass · 2 fail · 7 skip · 4 manual (of 17)**. `criticalFailures: []` (EVAL-008 is `high`; 004/005 informational) — the run exits 0.

## Findings (real — for the orchestrator, before the TKT-02 visual gate)

- **F1 · EVAL-008 · home horizontal overflow at w1024 (P-high).** `scrollWidth 1188 > clientWidth 1024`. Root cause: the fixed-width `AvatarStage` (`w-[520px]`) in the hero's `lg:grid-cols-[35fr_65fr]` column overflows / forces page scroll at 1024 (same root cause as F3). Would be visible at the visual gate.
- **F2 · EVAL-008 · header logo link 40 px tall < 44 (P-high, Fitts).** The `<a href="/">` logo (TP tile + wordmark) is 147–188×**40**. Options for the orchestrator: give the logo link `min-h-11`, or add a documented min-target allowlist entry. (I did NOT allowlist it, to avoid hiding the finding.)
- **F3 · S05.02 · hero avatar frame = 480 px at w1440, spec 520 (design deviation).** EXE-4's `--breakpoint-2xl:1440px` IS in the built CSS and `2xl:w-[520px]` exists, but `AvatarStage` is a flex item that shrinks to its `35fr` grid column (~480 px) before the 2xl width matters, so it never reaches 520. Untagged from EVAL-008 (it is a design-fidelity check, not an overflow/target criterion) but reported.
- **F4 · S04.03 · header rest height 72 px, spec 96 (design deviation).** `Header.tsx` sets inline `style={{ paddingTop: "env(safe-area-inset-top)" }}`, which **overrides** the `py-7` top padding (env = 0 on desktop) → header is 72 px rest instead of 96. Fix intent: `calc(env(safe-area-inset-top) + 1.75rem)`. Untagged (not a gating EVAL) but reported.
- **F5 · EVAL-005 · first-load JS 218.7 kB gz / LCP mobile 2858 ms (informational on the tracer).** Over the 180 kB / 2500 ms budgets. Expected per plan A14 (motion + no levers pulled yet); first optimization levers (`LazyMotion`, dynamic `AskPanel`, LCP tuning) are TKT-14/TKT-49. Informational only — does not gate the tracer.

## S07.07 — Ticket wrap
- **Trio + build green:** `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm test` (48 passed) ✓ · `pnpm build` (all routes static (5)) ✓.
- **AC-9:** `git diff` (below) lists only test/script/config/eval/docs files — no new component or route beyond the TKT-01 list. `docs/`, `evals/results/`, `.gitignore`, `package.json` (the `eval` script) are expected orchestration/config changes, not violations.
- `.eval/` added to `.gitignore`; `.lighthouseci/`, `test-results/`, `.eval/` are NOT committed.

### `git diff --cached --stat` (TSK-07 commit)
```
 .gitignore                                 |   1 +
 docs/screenshots/tracer/*.png (9 files)    | Bin
 evals/results/baseline-v1.json             | 225 +
 lighthouserc.desktop.json                  |  29 +
 lighthouserc.mobile.json                   |  29 +
 package.json                               |   2 +-
 playwright.config.ts                       |  59 +
 scripts/bundle-budget.ts                   | 104 +
 scripts/eval.ts                            | 423 +
 tests/e2e/avatar-edge.spec.ts              |   8 +-
 tests/e2e/fixtures.ts                      | 143 +
 tests/e2e/tracer.spec.ts                   | 296 +
 (+ docs/reports/TSK-07.md — this report)
```

## Notes on decisions taken during execution
- **Turbopack has no `app-build-manifest.json`** → bundle-budget reads the prerendered HTML instead (more robust and bundler-agnostic).
- **`networkidle` never settles** on this app (Vercel Analytics keeps a connection) → all `page.goto` use `waitUntil: "load"`; hydration-dependent checks (mobile menu open, header compaction) use `expect(...).toPass()` retries.
- **Closed `<dialog>` duplicates** (MobileMenu holds hidden copies of the Ask AI + resume controls) → visible-scoped locators (`main …`, `.filter({ visible: true })`).
- **EVAL-008 kept honest:** the logo target was NOT allowlisted and the failing case was NOT deleted — reported for the orchestrator.
