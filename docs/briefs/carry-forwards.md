# Brief — M-007 carry-forward hardening (CF) · 3 quality guards

**You are a fresh implementer subagent. Self-contained brief — no prior chat context.** Three small, independent hardening tasks carried forward from M-005/M-006 into the M-007 sweep. Scope is exactly these three; no unrelated refactors. Read cited files yourself.

## Repo / environment
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — **everything on E Drive**. Branch `m-007-quality` (checked out). Commit here, not `main`. One small commit per task (CF-1/CF-2/CF-3).
- Stack: Next.js 16.3.5, React 19, Tailwind 4, Vitest 4, Playwright, pnpm 11.25.0, node 26.7.0.
- **Host memory-tight. Vitest is fine to run foreground. Any Playwright run: FOREGROUND, `workers:1` (pinned), `:3000` reuseExistingServer, one at a time, check `uptime` first, NEVER a background Monitor. If it stalls/OOMs, reap + retry once + report.**
- Keep typecheck/lint/build green after each task. No threshold weakening (EV2). Don't touch content/data truth values, the cinematic site, or `portfolio/index.html`.

## CF-1 · Crawler: a timeout/network error must be WARN, not DEAD (EVAL-011 robustness)
- File: `tests/e2e/crawler.ts`. Read the external-URL check (`checkExternal`, ~lines 110–150). Currently the `catch (err)` branch returns `{ verdict: "dead", ... }` for **any** fetch error — including `AbortSignal.timeout` firing (an `AbortError`/`TimeoutError`) on a slow-but-live external host. A timeout means "this bot couldn't confirm it in N seconds", NOT "the link is dead for humans" — same class as the existing `BOT_BLOCK_STATUSES` → WARN handling.
- **Fix:** in the catch branch, classify an abort/timeout error (`err.name === "AbortError"` or `"TimeoutError"`, or the DOMException from `AbortSignal.timeout`) as **`warn`** (detail e.g. `"timeout after ${EXTERNAL_TIMEOUT_MS}ms — unconfirmed, not dead"`), while genuine connection/DNS errors stay `dead`. Keep the status recorded either way. Do not weaken the 200–399 = ok / bot-block = warn logic already there.
- **Regression (scar):** if the classification is (or can cheaply be made) a small pure exported function, add a `tests/unit/*.test.ts` case asserting a simulated timeout → `warn` and a real connection error → `dead`. If it's only reachable through the live crawl, add/extend a case in `tests/e2e/eval-011-dead-controls.spec.ts` (there is already a fixture positive-control pattern) that proves a timing-out URL is reported `warn` not `dead`. Prefer the unit test (no server) if feasible.

## CF-2 · TC-091: mechanical content-rule guard (EVAL-013 companion)
- Files to CREATE: `tests/unit/content-rules.test.ts` and `tests/fixtures/metric-allowlist.json`.
- Spec: `test-cases.md` **TC-091** (search "### TC-091", ~line 1026). It lists per-project string presence/absence rules — one `it()` each — over `data/projects.ts`, each `SKIP`-with-reason until its record has chapters (all content is merged now, so most run). Read the full rule list there. Examples it names:
  - teachspark: all `metrics[].asOf` identical; **no** `"625"`; **contains** `"335 passed"`; **no** `"08-26"` date string.
  - velora: `"secondary research"` or `"team baseline"` present near `"15–30 days"`; `"authored, not verified"` present; no `"users"`/`"pilot"` claim words in outcome (allowlist `"no pilot"`).
  - railcite + the others: per TC-091's list.
  - thin five: no `MetricCard` metric absent from its pack — checked against `tests/fixtures/metric-allowlist.json` (a per-slug file mirroring each thin project's real pack metrics).
- **Build the rules to match the CURRENT, correct content in `data/projects.ts`** (the content is manually-correct today; this test freezes it so a future edit can't silently reintroduce a wrong metric like "625"/"solo"). Read the actual data + `CONTENT_INVENTORY.md` packs to author `metric-allowlist.json` truthfully — do NOT invent allowlist values; mirror what the data legitimately contains. Every `it()` must genuinely pass against today's data (confirm red→green by temporarily planting a banned string in a temp copy if useful, then revert).
- These are STRING assertions, not content edits — you must not change any content value to make a rule pass; if a rule and the data disagree, STOP and report it (that would be a real content defect, not a test bug).

## CF-3 · QA-003 heading-order regression guard (a11y)
- Context: TKT-48 fixed a heading-outline skip on the 11 case studies (`Chapter` now `h2`, `DecisionCard` now `h3` — outline h1→h2→h3). Axe's WCAG2AA ruleset does **not** include `heading-order`, so nothing currently prevents a regression.
- **Fix:** add the lightest reliable guard. Preferred: enable axe's `heading-order` best-practice rule in `tests/e2e/eval-006.spec.ts` (e.g. include it via `.withRules(["heading-order"])` in addition to the wcag2a/2aa tags, or an explicit rule enable) so the existing 22-route axe sweep also catches heading skips. Alternative if that's awkward: a small e2e/unit that asserts no heading-level is skipped on `/work/teachspark` (and ideally on a route with DecisionCards). Confirm it FAILS if you revert the QA-003 fix (red→green), then keep the fix. Do not weaken any existing axe rule.

## Report to `docs/reports/carry-forwards.md`
Per CF-1/CF-2/CF-3: what changed, the regression/guard added (and its red→green proof), files changed, commit SHA. Any content/data disagreement found in CF-2 (report, don't fix). Final gate status (typecheck/lint/build; `pnpm eval --only EVAL-011,EVAL-013,EVAL-006` or the relevant subset; `vitest run`). Note any environmental (OOM) blocks.
