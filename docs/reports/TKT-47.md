# Report — TKT-47 · Responsive sweep, every route at 390/768/1024/1440

**Ticket:** TKT-47 (Backlog `TASK-43`) · Milestone **M-007** · Branch `m-007-quality` · Role: QA-tester (separate from implementers)

## Scope executed

1. Read `tests/e2e/eval-008.spec.ts` (the existing EVAL-008 harness) and `tests/e2e/routes.ts` / `routes.json` before touching anything.
2. **Finding:** `eval-008.spec.ts` imported `STATIC_ROUTES` from the committed `tests/e2e/routes.json`, whose `static` list was stale — `["/", "/work", "/work/teachspark", "/about", "/thinking", "/playground", "/contact"]` — only **7** routes. It was missing the other **10** personal case studies and all **5** essays (16 routes total unswept). The 14px-text check additionally only ever ran against `/`, never the other routes. This meant EVAL-008 was not actually proving AC1 ("all routes × 4 widths").
3. Extended `eval-008.spec.ts`'s own route list (not the shared `routes.json`, to avoid widening the sweep scope of EVAL-006/EVAL-011/EVAL-017, which are owned by other tickets and also consume that file) to derive the full 22-route public set the same way `app/sitemap.ts` does: `STATIC_ROUTES` (from `@/app/sitemap`) + every personal `@/data/projects` slug (`/work/<slug>`) + every `@/data/writing` essay slug (`/thinking/<slug>`). Also converted the single hard-coded `/`-only 14px-text test into a per-route loop over the same list, using the existing rule helpers verbatim — no threshold changed (EV2).
4. `pnpm build` (production build) → `pnpm eval --only EVAL-008` foreground, `workers:1` — surfaced one real defect (below).
5. Fixed the defect in a small commit, rebuilt, re-ran the gate to green.
6. Captured the full screenshot pack (22 routes × 4 widths = 88 files) via a temporary Playwright spec reusing the config's 4 viewport projects (deleted after the capture ran — not part of the permanent suite).
7. Manual review of the capture for clipping/wrap/peek-affordance issues (see below).

## Full public route set swept (22 routes)
`/`, `/work`, `/work/teachspark`, `/work/railcite`, `/work/velora`, `/work/cubicle`, `/work/nuptis`, `/work/bhakti-vilas`, `/work/token-toli`, `/work/pratyasa`, `/work/tegaki`, `/work/dino-arcade-pwa`, `/work/cinematic-portfolio`, `/about`, `/thinking`, `/thinking/green-tests-prove-it-runs`, `/thinking/worse-numbers-before-submitting`, `/thinking/refusal-is-a-feature`, `/thinking/killing-nuptis`, `/thinking/staleness-is-a-correctness-bug`, `/playground`, `/contact`.

## Pass/fail matrix (per route × the 4 widths — 390/768/1024/1440)

Overflow and 44px-target checks ran per-route across all 4 widths identically (a route either passed at all 4 widths or failed at all 4 — no width-specific divergence was observed). Text-size ran once per route (viewport-independent, per the harness's own `data-micro-label` contrast logic).

| Route | Overflow | 44px target | Text ≥14px |
|---|---|---|---|
| `/` | PASS | PASS | PASS |
| `/work` | PASS | PASS | PASS |
| `/work/teachspark` | PASS | PASS | PASS |
| `/work/railcite` | PASS | PASS | PASS |
| `/work/velora` | PASS | PASS | PASS |
| `/work/cubicle` | PASS | PASS | PASS |
| `/work/nuptis` | PASS | PASS | PASS |
| `/work/bhakti-vilas` | PASS | PASS | PASS |
| `/work/token-toli` | PASS | PASS | PASS |
| `/work/pratyasa` | PASS | PASS | PASS |
| `/work/tegaki` | PASS | PASS | PASS |
| `/work/dino-arcade-pwa` | PASS | PASS | PASS |
| `/work/cinematic-portfolio` | PASS | PASS | PASS |
| `/about` | PASS | PASS | PASS |
| `/thinking` | PASS | PASS | PASS |
| `/thinking/green-tests-prove-it-runs` | PASS | **FAIL → fixed → PASS** | PASS |
| `/thinking/worse-numbers-before-submitting` | PASS | **FAIL → fixed → PASS** | PASS |
| `/thinking/refusal-is-a-feature` | PASS | **FAIL → fixed → PASS** | PASS |
| `/thinking/killing-nuptis` | PASS | **FAIL → fixed → PASS** | PASS |
| `/thinking/staleness-is-a-correctness-bug` | PASS | **FAIL → fixed → PASS** | PASS |
| `/playground` | PASS | PASS | PASS |
| `/contact` | PASS | PASS | PASS |

88/88 overflow checks, 88/88 target checks (post-fix), 22/22 text-size checks — all PASS. No `data-micro-label` or `data-inline-link` exceptions were re-flagged (verified none of the 20 initial failures were on the allowlist).

## Defect found and fixed

**Fixed (in-scope, small commit):**
- **Route/width:** all 5 `/thinking/<slug>` essay pages, all 4 widths.
- **What:** the essay's "Related project: `<Name>` →" link (`components/thinking/EssayBody.tsx`) is a standalone block-level CTA link (its own line, not running text), measuring **h=27px** (only its text line-height) — below the 44px floor. It is not a `data-inline-link` (WCAG 2.5.8 inline-text exception doesn't apply — it isn't inline running text) and not on the min-target allowlist, so it's a real, in-scope defect.
- **Fix:** added `min-h-11` (the codebase's existing convention for exactly this pattern — see `components/layout/Footer.tsx`'s nav links, `components/navigation/Header.tsx`) to the link's className. One line changed, no new pattern introduced.
- **Verification:** re-ran `pnpm eval --only EVAL-008` after rebuild — all 20 previously-failing cases now pass.

**No `QA-###` deferrals were needed** — the only defect found by the automated sweep was small and clearly in this ticket's scope, so it was fixed rather than logged.

## Manual review (screenshot pack)

Reviewed all 88 captures for text clipping, awkward wrap, the `/work` FilterTabs horizontal peek, hero/avatar fit at 390, timeline at 390, and case-study chapter nav at 390:
- `/work` FilterTabs: horizontal scroll affordance renders as intended at 390 (a partial next-tab "peek", not a page-level overflow) — matches the existing accepted behavior asserted by `tests/e2e/work.spec.ts`'s own `@EVAL-008` case (`the filter row scrolls horizontally at 390 (peek, not a page-level overflow)`), unchanged.
- Hero/avatar at 390, timeline at 390, case-study chapter nav at 390: no clipping or overlap observed in any capture.
- No other visual defects found beyond the touch-target issue already fixed above.

## Screenshot pack

`docs/screenshots/<route>/<width>.png` — **88 files**, one per route × width (22 routes × 4 widths), full-page, captured against the production build after the fix landed. New route folders added: `work/` (root + 11 case-study slugs), `thinking/<slug>/` (5 essays), `playground/` (previously only had non-standard filenames). Refreshed pre-existing captures for `/`, `/about`, `/thinking` (root) to match the current build. `docs/screenshots/tracer/*` and `docs/screenshots/about/*-experience-open.png` were also regenerated as a side effect of the mandated `pnpm eval --only EVAL-008` gate run — that's pre-existing, established behavior of `tests/e2e/tracer.spec.ts` and `tests/e2e/timeline.spec.ts` (both tagged `@EVAL-008` and already write screenshots on every run), not new capture code from this ticket.

## Gate status

| Gate | Result |
|---|---|
| `pnpm run typecheck` | pass, 0 errors |
| `pnpm run lint` | pass, 0 errors/warnings |
| `pnpm exec vitest run` | pass — 40 files, **227 passed, 1 pre-existing skip** (unrelated `resume-pii.test.ts`) |
| `pnpm build` | pass — 49 static pages, `all routes static (13)` |
| `pnpm eval --only EVAL-008` (run 1, pre-fix) | **FAIL** — 289 passed, **20 failed** (the touch-target defect above), 11 skipped |
| `pnpm eval --only EVAL-008` (run 2, post-fix) | **PASS** — 309 passed, **0 failed**, 11 skipped. `evals/results/eval-run-0.2.0-f84fd9f-2.json`: `improvement EVAL-008 (status): FAIL → PASS` |

No threshold was weakened (EV2) — the 44/14/0-overflow rules and the EXE-7 (`data-micro-label`) / WCAG 2.5.8 (`data-inline-link`) exceptions are unchanged; the fix corrected the DOM, not the check.

## Environmental notes

Host load/memory checked via `uptime`/`vm_stat` before every foreground Playwright invocation (never a background Monitor). Load ranged 1.6–4.3, free memory 115MB–770MB across the session — calm enough throughout. **No OOM, no stall, no retry needed.** Every Playwright invocation ran foreground, one at a time (build → eval run 1 → eval run 2 → screenshot capture), never overlapping on `:3000`.

## Files changed

| File | Change |
|---|---|
| `tests/e2e/eval-008.spec.ts` | Route list now derived from `@/app/sitemap` + `@/data/projects` + `@/data/writing` (22 routes, was 7 via stale `routes.json`); 14px text-size check converted from a single `/`-only test into a per-route loop. No threshold changed. |
| `components/thinking/EssayBody.tsx` | Added `min-h-11` to the "Related project" link — fixes the 44px touch-target defect. |
| `docs/screenshots/**` | 88-file screenshot pack (see above) + gate-run side-effect refreshes (`tracer/*`, `about/*-experience-open.png`). |
| `backlog/tasks/task-43 - TKT-47-*.md` | Status `To Do`/`In Progress` → `Done`, all 4 ACs checked. |
| `docs/reports/TKT-47.md` | This report (new). |

Not touched: content/data truth, the cinematic site, `portfolio/index.html`, `tests/e2e/routes.json` (left as-is — its stale `static` list is now effectively superseded for EVAL-008 by the derived list in `eval-008.spec.ts`; not changed directly to avoid silently widening EVAL-006/011/017's sweep scope, which belong to other tickets).

## Commits (on `m-007-quality`)
1. `test(m007): TKT-47 broaden EVAL-008 to the full 22-route public sweep`
2. `fix(m007): 44px touch target on essay related-project link (TKT-47)`
3. `docs(m007): TKT-47 responsive screenshot pack (88 files)`
4. `docs(m007): TKT-47 QA report + task-43 done`

(SHAs recorded in `git log` on `m-007-quality` after commit.)
