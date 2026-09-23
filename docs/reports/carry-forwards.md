# Report — M-007 carry-forward hardening batch (CF-1 / CF-2 / CF-3)

**Brief:** `docs/briefs/carry-forwards.md` · **Branch:** `m-007-quality` · three independent commits, one per task.

## CF-1 · Crawler: timeout ⇒ warn, not dead (EVAL-011 robustness)

**File:** `tests/e2e/crawler.ts`. `checkExternal`'s `catch (err)` branch classified *every* fetch error as `dead`, including an `AbortSignal.timeout(EXTERNAL_TIMEOUT_MS)` firing on a slow-but-live host — indistinguishable from a genuine connection/DNS failure.

**Fix:** added an exported pure classifier `isTimeoutError(err)` (`err.name === "AbortError" || err.name === "TimeoutError"`, matching Node's undici fetch, which throws either name depending on runtime) and branched the catch block: a timeout ⇒ `{ verdict: "warn", detail: "timeout after 10000ms — unconfirmed, not dead" }`; anything else ⇒ unchanged `dead`. The 200–399/bot-block logic below the catch block was not touched.

**Regression:** `tests/unit/crawler.test.ts` (new, pure unit test, no server/network) — 6 cases: `isTimeoutError` classification (AbortError/TimeoutError/TypeError/non-error), and `checkExternal` end-to-end with `vi.stubGlobal("fetch", …)` throwing a simulated `DOMException("TimeoutError")` (expect `warn`) vs. a simulated `TypeError("fetch failed")` (expect `dead`).

**Red → green proof:** `git stash` on the pre-fix `crawler.ts` → 5/6 new tests failed (`isTimeoutError is not a function`; the AbortSignal-timeout case returned `dead` instead of `warn`) → `git stash pop` restored the fix → all 6 pass.

**Commit:** `09932e0` — `fix(crawler): classify external timeout as warn, not dead (CF-1, EVAL-011)`. Files: `tests/e2e/crawler.ts`, `tests/unit/crawler.test.ts`.

## CF-2 · TC-091 mechanical content-rule guards (EVAL-013 companion)

**Files (new):** `tests/unit/content-rules.test.ts` (48 assertions, 1 documented skip), `tests/fixtures/metric-allowlist.json`.

Implements every per-project string rule test-cases.md §TC-091 lists, as STRING assertions over the imported `data/projects.ts` objects (not raw source text — so JSDoc comments never count, only real field values). No content value was changed to make a rule pass.

**Content/rule disagreements found — reported, not silently forced green:**

1. **teachspark "no `'625'`".** The record legitimately quotes the pitch's debunked "625 tests" claim twice, specifically to disclose it was never reproduced ("The pitch's \"625 tests\" could not be reproduced and is not used"). A literal blanket ban fails against this correct, honest content. Implemented instead as *"`625` never appears without an adjoining disclaimer"* — the same conditional pattern TC-091 already uses for railcite's `5,687` figure ("only with 7 Sep context"). Genuinely passes today; would still catch a future regression where `625` is asserted as a real, undisclaimed number.
2. **cubicle "role text … not `'solo'`".** "solo" appears three times in the record — twice describing the *target persona* ("a solo founder"), once as an explicit denial ("role: 'Team build,' never solo") — never claiming Tushar built Cubicle solo. Implemented as *"no undisclaimed authorship claim of 'solo'"* (an allowlist of `solo founder` / `solo builders` / `never solo` context windows), not a blanket substring ban.
3. **tegaki "Master Prompt described only as 'internal'".** This fact lives only in `CONTENT_INVENTORY.md §8.9` ("Master Prompt v2.0 is internal IP") — tegaki is still a "thin five" record (`deepDive:false`, `chapters: EMPTY_CHAPTERS`), so it has never been carried into `data/projects.ts`. Per TC-091's own precondition ("each rule is SKIP-with-reason until its record has chapters"), this sub-rule is `it.skip`ed with that reason rather than faked against non-existent content.
4. **tegaki `"No AI in product"` / `"confirms without charging"`.** The actual wording is "no AI in the product" / "confirms an order without charging for it" — CONTENT_INVENTORY §8.9 confirms these are paraphrases of the real content, not literal quotes (unlike e.g. railcite's `"by construction"`, which matches verbatim). Implemented against the actual current phrasing (`/no AI in the product/i`, `"confirms an order without charging"` — both matched exactly).
5. **cinematic-portfolio `"7+"/"40+"/"180+"/"30%"`** and **`"a link to /playground exists"`.** Confirmed via CONTENT_INVENTORY §8.11 that the resume stats are shown on the *separate cinematic site* (`portfolio/index.html`, explicitly out of scope for this batch), never in `data/projects.ts` — the conditional guard is vacuously true today (none of those strings appear) and left in as a future-regression trip-wire. The `/playground` link check is a real Next.js route (`app/playground/page.tsx`) with its own e2e coverage (`tests/e2e/playground.spec.ts`, `eval-008.spec.ts`) — out of scope for a `data/projects.ts` string-rule file, not duplicated here.

**Metric-allowlist fixture:** built from each "thin five" slug's real `Metrics:` line in `CONTENT_INVENTORY.md §8.7–8.11` — `token-toli`/`pratyasa`/`tegaki`/`dino-arcade-pwa` → `[]` (packs say "interview counts only (team, not Tushar's)", "not product metrics", "MISSING", "none" respectively — none license a MetricCard); `cinematic-portfolio` → `["Film generation cost"]` (the 197-credit build-tooling cost; matches the pack's "film cost 197 credits exactly as preflighted").

**Red → green proof (planted-defect test):** temporarily edited a scratch copy of `data/projects.ts` (backed up first, reverted after, confirmed `git diff --stat` clean) to add an unsourced "23 respondents" claim to token-toli and an unsourced `PLANTED unsourced metric` to pratyasa's `metrics[]`. Re-running the suite caught all three: the token-toli "no other respondent total" rule, the pratyasa "metrics are empty" rule, and the thin-five allowlist rule. Reverted; suite green again with zero diff on `data/projects.ts`.

**Commit:** `22e12bc` — `test(content): TC-091 mechanical content-rule guards over data/projects.ts (CF-2)`. Files: `tests/unit/content-rules.test.ts`, `tests/fixtures/metric-allowlist.json`.

## CF-3 · Heading-order regression guard for the QA-003 fix

**File:** `tests/e2e/eval-006.spec.ts`. Axe's `wcag2a`/`wcag2aa`/`wcag21aa` tags do **not** include `heading-order` (it is tagged `best-practice`), so nothing in the existing sweep would catch a regression of TKT-48's QA-003 fix (`Chapter.tsx` h3→h2, `DecisionCard.tsx` h4→h3).

**Implementation choice:** `AxeBuilder#withRules` and `#withTags` are mutually exclusive on one builder instance (both set `option.runOnly`, confirmed by reading `@axe-core/playwright`'s source) — they cannot be chained to combine the WCAG tag set with the best-practice `heading-order` rule in one pass. Rather than restructure the shared `axe` fixture in `tests/e2e/fixtures.ts` (reused by 18 other spec files, including several `include:`-scoped partial checks where a subtree not starting at h1 would be a false positive under `heading-order`), added a second, additive, standalone `AxeBuilder({page}).withRules(["heading-order"])` pass inside `eval-006.spec.ts` itself, over the same route sweep, run once per route at 1440 (heading order is a document-structure property, not a per-viewport one). This satisfies the brief's stated location and full-route-coverage preference while keeping blast radius to the one file that owns EVAL-006.

**A real hydration gotcha found and handled:** case-study chapters (`Chapter.tsx`/`DecisionCard.tsx`) do not exist in the DOM at all until the page's `OverviewToggle` ("30-sec" | "Deep dive") is switched to "Deep dive" (TC-076) — confirmed empirically (a probe dump of `/work/teachspark`'s live DOM showed only `h1`/`h2`, zero `h3`, before opening the toggle). A heading-order check against the default page state would pass regardless of whether the QA-003 fix exists, making the guard meaningless. Fixed by clicking the "Deep dive" radio (and waiting for `nav[aria-label="Chapters"]` to appear) before running axe, for every slug whose `overview.deepDive` is `true`.

**Red → green proof:** temporarily reverted `Chapter.tsx`'s chapter heading `h2` → `h3` (matching the pre-QA-003 state), rebuilt (`next build`), ran the new check against `/work/teachspark` → **failed**, correctly flagging `#chapter-01-context` (`html: "<h3 id=\"chapter-01-context\" …>01Context</h3>"`, `"Heading levels should only increase by one"`) — teachspark also has `DecisionCard` artifacts in its "bet" chapter, satisfying the brief's "ideally on a route with DecisionCards" note. Restored the `h2` (confirmed `git diff --stat` clean), rebuilt, re-ran → **passed**. Full sweep (22 routes, w1440 project) then run: 21 passed, 1 `fixme` (see below).

**New, pre-existing, out-of-scope finding surfaced by this guard (not fixed here):** `/work` (the project-grid listing page) has a real, independent `heading-order` violation — its `h1` is followed directly by each `ProjectCard`'s `h3` title (`a[aria-label="TeachSpark"] > h3`, etc.); the section's `h2` eyebrow label ("Personal builds"-style) renders *after* the card grid in DOM order, and the footer's `h2` comes later still. This is unrelated to Chapter.tsx/QA-003 and was not introduced by this batch. Marked `test.fixme(route === "/work", …)` in `eval-006.spec.ts` with a pointer to this report, rather than silently fixed (out of CF-3's scope) or silently dropped from the sweep (still visible in `playwright test --list` / run output as an expected failure, not a gap in coverage). **Recommend:** a follow-up ticket to either promote the grid's section label to render before the cards, or demote card titles to `h4` under an `h2`/`h3` section heading — small, but a genuine content/DOM-order change on a shared page, outside this hardening batch's authorized scope.

**Commit:** `3bd719e` — `test(a11y): heading-order regression guard for the QA-003 fix (CF-3)`. File: `tests/e2e/eval-006.spec.ts`.

## Final gate status

| Gate | Result |
|---|---|
| `tsc --noEmit` | **PASS** — 0 errors |
| `eslint .` | **PASS** — 0 errors, 0 warnings on changed files (1 pre-existing "file ignored" info notice for the new `.json` fixture, expected — JSON isn't an ESLint target) |
| `next build` (+ `scripts/validate-content.ts` prebuild, `scripts/assert-static.ts`) | **PASS** — `content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)`; `all routes static (13)` |
| `vitest run` (full suite) | **PASS** — 280 passed, 2 skipped (both documented: CF-2's tegaki Master Prompt skip, 1 pre-existing unrelated `resume-pii.test.ts` skip), 0 failed, 43 test files |
| `pnpm eval --only EVAL-006,EVAL-011,EVAL-013 --skip-build` | **PASS** — EVAL-006 PASS, EVAL-011 PASS, EVAL-013 PASS (`evals/results/m007-cf-batch.json`). Playwright: 135 passed, 0 failed, 225 skipped (unselected `@EVAL-0xx` tags, out-of-scope viewport projects, and 2 pre-existing `fixme`s: AskPanel-TKT-10 and this batch's new `/work` heading-order finding). EVAL-011 crawl: 299 controls · 283 ok · 16 warn (LinkedIn/DOI bot-blocks, unrelated to CF-1) · **0 dead**. |

No threshold was weakened anywhere in this batch (EV2). No content truth value in `data/projects.ts` was changed. The cinematic site and `portfolio/index.html` were not touched. No `Monitor` tool was used for any Playwright run; every Playwright invocation ran foreground with `workers:1` (config-pinned) against `:3000`, one at a time, with `uptime` checked beforehand.

## Files touched (all three CFs)

- `tests/e2e/crawler.ts` (CF-1, fix)
- `tests/unit/crawler.test.ts` (CF-1, new)
- `tests/unit/content-rules.test.ts` (CF-2, new)
- `tests/fixtures/metric-allowlist.json` (CF-2, new)
- `tests/e2e/eval-006.spec.ts` (CF-3, additive)
- `docs/reports/carry-forwards.md` (this report)

Commit SHAs: `09932e0` (CF-1) · `22e12bc` (CF-2) · `3bd719e` (CF-3).
