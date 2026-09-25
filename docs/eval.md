# Evaluation harness (`pnpm eval`)

The single, reproducible evaluation command for portfolio-clay. It runs every automated layer,
maps each result to an `EVAL-0xx` id, records real provenance, diffs against a baseline, and writes
one JSON report. Design: `technical-plan.md` §A16; case catalogue: `evals/eval-cases.json`
(authoritative for ids, priorities, automation flags).

## Running it

```bash
pnpm eval                         # full run: build → vitest → playwright → lighthouse → gates
pnpm eval --only EVAL-006         # just the axe sweep
pnpm eval --only EVAL-006,EVAL-011 --label smoke
pnpm eval --skip-build            # reuse the existing .next build
pnpm eval --base-url https://<preview>.vercel.app   # evaluate a deployed origin (adds header check)
pnpm eval --help                  # print the flag list
```

`pnpm eval` is wrapped in `dotenv -e .env.tooling` so Playwright's browser and all temp files stay
on the E-Drive (`PLAYWRIGHT_BROWSERS_PATH`, `TMPDIR`), never the Mac internal disk (global scar).

## Flags

| Flag | Meaning |
|------|---------|
| `--label <name>` | Output basename under `evals/results/` (default `eval-run-<version>-<shortSha>`). |
| `--only EVAL-0xx,…` | Run only these ids (comma-separated); every other case is recorded `SKIP` ("excluded by --only"). An unknown id is a runner error (exit 3). |
| `--baseline <file>` | Baseline JSON (relative to `evals/results/`) to diff against. Default `baseline-v1.json`. |
| `--base-url <url>` | Evaluate a deployed origin: skips the build and the local server, points Playwright at the URL, and runs the TP9 security-header check. Lighthouse under `--base-url` is skipped with a note (run `lhci autorun` against the preview directly). |
| `--skip-build` | Reuse the current `.next` build instead of rebuilding. |
| `--reuse` | Assemble the run from the layer artifacts already on disk (`.eval/*.json`, `.lighthouseci/*`) without re-executing vitest/playwright/lighthouse. For a memory-constrained host where Lighthouse's Chrome would OOM; implies `--skip-build`. Requires artifacts from a prior run of the same build. |
| `--help` | Print the flag list and exit 0. |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Clean — no critical FAIL, no regression. |
| `1` | At least one **critical** case FAILed (`priority: critical` in `eval-cases.json`). |
| `2` | A regression vs the baseline, with no critical FAIL. |
| `3` | Runner error (missing case file, build failed, unknown `--only` id, missing Playwright JSON). |

## Where results go

- `evals/results/<label>.json` — the report. **Never overwritten**: a second run with the same
  label writes `<label>-2.json`, `<label>-3.json`, … so evidence accumulates (EV2, workflow §12).
- `evals/results/baseline-v1.json` — the frozen M-001 baseline the diff runs against.
- `.eval/playwright.json`, `.eval/vitest.json`, `.eval/dead-controls.json`, `.lighthouseci/**` —
  intermediate layer artifacts (git-ignored) the runner reads.

## Result schema (v1)

Every field is generated from real execution output — nothing is hand-entered.

```jsonc
{
  "schemaVersion": 1,
  "runId": "eval-run-0.2.0-<sha>",
  "label": "...",
  "provenance": { "version", "commit", "branch", "dirty", "node", "pnpm", "next", "os",
                  "timestamp", "baseUrl", "evalCasesSha256", "config": { "viewports", "lighthouseRuns", "thresholds" } },
  "totals": { "cases", "passed", "failed", "skipped", "manual" },
  "cases": [ { "id", "status": "PASS|FAIL|SKIP|MANUAL", "priority", "category", "measured?", "threshold?", "details", "artifacts?" } ],
  "criticalFailures": [ "EVAL-0xx", ... ],
  "regressions":  [ { "id", "kind": "status|lighthouse|bundle", "detail" } ],
  "improvements": [ { "id", "kind", "detail" } ],
  "runtimeMs": 0,
  "baseline": "evals/results/baseline-v1.json"
}
```

## Layers → EVAL ids

| Layer | Command | Cases |
|-------|---------|-------|
| Vitest | `vitest run` (reads `.eval/vitest.json`) | EVAL-012 (Ask provider suite, TKT-09), EVAL-017 (SEO tag unit), EVAL-020 (paper token gate, `tests/unit/eval-020.test.ts`), EVAL-021 (illustration provenance, `tests/unit/eval-021.test.ts`) |
| Playwright | `playwright test` (`--grep @EVAL-0xx` under `--only`) | EVAL-002, 006, 007, 008, 010, 011, 014, 017, 018 (decoration budget, `tests/e2e/eval-018.spec.ts`), 019 (hero once-and-hold, `tests/e2e/eval-019.spec.ts`) |
| Lighthouse CI | `lhci autorun` mobile + desktop, median of 3 | EVAL-004 (category scores /route/form-factor), EVAL-005 (LCP/CLS + JS budget) |
| Content gate | `validate-content` + `forbidden-strings` + fixture proof | EVAL-013 |
| Security | `forbidden-strings --bundle` + `pnpm audit` + TP9 headers (`--base-url`) | EVAL-016 |
| Manual | recorded, not executed (`status: MANUAL`) | EVAL-001, 003, 009, and the EVAL-017 inspector sub-result |

## EVAL-020 — paper token gate (M-009, S12/D2)

`tests/unit/eval-020.test.ts` (TC-122, TC-123). `scripts/eval.ts` maps it by file name (generic
Vitest mapping, `VITEST_CASES`), so the run JSON's `EVAL-020` status is this file's pass/fail.

| Part | Checks | Threshold |
|------|--------|-----------|
| 1 | `scripts/tokens-check.ts` stdout starts `13/13 tokens round-trip OK`, exit 0 | 13/13 |
| 2 | `app/globals.css` defines exactly the 13 paper `--color-*` names (paper … kraft) | 13 |
| 3 | No colour literal (`#hex`, `rgb(`/`rgba(`, `hsl(`/`hsla(`, `oklch(`, `oklab(`) in `app/**`, `components/**`, `lib/**` (`.ts/.tsx/.css`) outside the allow-list `app/globals.css` + `lib/og.tsx` | 0 |
| 4 | No retired clay name (`bg surface lavender ink ink-2 ink-3 accent accent-deep mint sky blush peach butter`) as a Tailwind utility (`bg-/text-/border-/divide-/fill-/stroke-/outline-/ring-/from-/via-/to-/decoration-/placeholder-/shadow-/accent-` + name, variants and `/opacity` included) or as `var(--color-<name>)` / `--color-<name>:` in `app/**`, `components/**`, `lib/**` | 0 |
| 5 | Positive control: the same scanner functions over `tests/fixtures/retired-tokens.fixture.txt` find exactly its 5 planted hits and none of its decoys | 5 |

- **Comment-stripping rule.** The literal scan (part 3) runs after `//` and `/* */` comments are
  blanked out (string literals kept, line numbers preserved). A comment is not a colour, and the hex
  regex otherwise matches error-code references like `React #185` (`Header.tsx`, `lib/motion.ts`).
  The retired-name scan (part 4) is **not** comment-stripped: a stale token name in a comment is
  still dead code.
- **No English-word allow-list.** The retired-name regex is prefix-anchored, so copy ("surface"),
  tone prop values (`tone="mint"`, enum values — technical-plan F1-11) and paper names with a retired
  stem (`text-ink-soft`) cannot match; the fixture's decoy lines prove it.
- **Allow-list changes** are limited to the two files above (TKT-78 owns `lib/og.tsx`). Anything
  else needing a literal defines a `color-mix()` custom property in `globals.css` instead.

```bash
pnpm test -- eval-020                          # the unit file on its own
pnpm eval --only EVAL-020 --skip-build         # through the harness → evals/results/<label>.json
```

## EVAL-021 — illustration provenance (M-009, S20; TKT-73 S73.04)

`tests/unit/eval-021.test.ts` (TC-138, TC-142). `scripts/eval.ts` maps it by file name (generic
Vitest mapping, `VITEST_CASES`), so the run JSON's `EVAL-021` status is this file's pass/fail. The
automated scope covers provenance, alt-naming and forbidden-string checks; the "depicts no
metric/logo/product UI/claim" checklist is manual (Stage 8, filed at
`evals/results/eval-021-<sha>.md`).

| Part | Checks | Threshold |
|------|--------|-----------|
| 1 | Every file under `content/media/illustrations/**` (excluding `README.md`, `manifest.ts`; `reference/` included) has exactly one manifest entry, and vice versa | 0 orphans either way |
| 2 | Every manifest `id` has a `README.md` provenance row (§6.2 columns) with every cell non-empty | 9/9 |
| 3 | Every `alt` starts with `Illustration of ` / `Animated illustration of ` (scenes, poster, clip) or `Illustration reference sheet` (the reference kind); `character-sheet-b.usedOn` is `[]` | 0 mismatches |
| 4 | Every filename + alt passes `scripts/forbidden-strings.ts` `contentForbiddenHits` and `PII_PATTERNS` | 0 hits |
| 5 | Every `publicSrc` file exists under `public/`; `content/media/illustrations/hero-desk.webp` and `public/media/illustrations/hero-poster.webp` have equal sha256 (E-18) | byte-identical |
| 6 | Positive control: the same `check()` function run over the two one-sided fixtures in `tests/fixtures/illustrations-onesided/` (an extra file with no manifest entry; a manifest entry with no file) | ≥ 1 finding each |

- `check(dir, entries, readme)` is a pure function exported from the test file so it can run against
  both the real tree (0 findings) and each fixture (≥ 1 finding) without duplicating the rules.
- Nine manifest ids match Design.md §6.1 exactly; `lib/illustrations.ts` re-exports `ILLUSTRATION_IDS`
  and adds `sceneImage(id)` — static `next/image` imports of the six scenes for intrinsic size +
  AVIF/WebP (§6.4). The hero poster and clip are served as-is from `public/media/illustrations/` via
  `illustration(id).publicSrc`.

```bash
pnpm test -- eval-021                          # the unit file on its own
pnpm eval --only EVAL-021 --skip-build         # through the harness → evals/results/<label>.json
```

## EVAL-019 — hero once-and-hold (M-009, S14/D10/TP13; TKT-73 S73.07)

`tests/e2e/eval-019.spec.ts` (tag `@EVAL-019`; TC-139 step 1, TC-140, TC-141, TC-142) with the
`saveData` fixture in `tests/e2e/fixtures.ts`. Runs on `/` at **w390 and w1440** only (w768/w1024
skip with the reason; the case's `viewport` is ["390","1440"]). `scripts/eval.ts` maps it through the
generic Playwright branch. The component under test is `components/hero/HeroClip.tsx` (the state
machine of decision TP13) inside `components/hero/Hero.tsx` (Design.md §5.2 markup).

| Mode / part | How the spec produces it | Expected |
|---|---|---|
| default | the w1440 project (fine pointer, `reducedMotion: "no-preference"`) | `video[data-hero-clip]` with `autoplay muted playsinline preload="metadata" poster="/media/illustrations/hero-poster.webp" aria-hidden="true" tabindex="-1"`, **no** `loop`/`controls`, sources webm → mp4; `ended` ≤ **4 000 ms** after navigation (measured in-page with `performance.now()` on the `ended` event); over the next 3 s — with a scroll, a dispatched `visibilitychange` and a `resize` — `currentTime` sampled every 250 ms never decreases and the element stays `paused`/`ended`; the held frame is screenshotted to `docs/screenshots/m-009/tracer/hero-end-1440.png` (eyeballed against `animation/export/hero-end.webp` — a pixel diff would flake on codec differences, TC-141 note) |
| reduced motion | `test.use({ reducedMotion: "reduce" })`, both widths | 0 `<video>` after load + 2 s; poster `<img>` visible |
| touch / coarse pointer | the w390 project (`hasTouch: true`, `isMobile: true`) | 0 `<video>` |
| Save-Data | the `saveData` fixture (`context.addInitScript` → `navigator.connection = { saveData: true }`), both widths | 0 `<video>` |
| autoplay rejected | `addInitScript` overriding `HTMLMediaElement.prototype.play` to reject (`NotAllowedError`) | 0 `<video>` after 2 s — the video unmounts, the poster is the error state |
| SSR | `request.get("/")`, no JavaScript | exactly one banner `<img>` (TKT-93 / Dev-21: the static-imported 3168×1344 `hero-banner` is the LCP image) with `fetchpriority="high"`, `loading="eager"`, `width="3168" height="1344"`, `sizes="100vw"`, alt byte-equal to `illustration("hero-banner").alt`; **0** poster `<img>` (the poster is only the clip's `poster` attribute); **0** `<video` in the HTML |
| registration (TKT-93) | the w1440 project resizes to 1024 / 1440 / 1920 | the mounted `video[data-hero-clip]` bounding box equals `CLIP_REGISTRATION` (`components/hero/registration.ts`: left 11.4268 % · top 0.4464 % · width 77.2525 % · height 97.3071 % of `.scene-banner-canvas`) within **±2 px** per edge; the canvas covers the `.scene-banner` box (no gap); the slot keeps the clip's 1280/684 aspect |
| caps | `fs.statSync` on `public/media/illustrations/` | webm ≤ 204 800 B · mp4 ≤ 358 400 B · poster ≤ 122 880 B |

Every measured value (ended ms, the currentTime samples, the post-hold state, per-mode video counts,
byte sizes) is pushed into `test.info().annotations` (type `eval-019`) so `.eval/playwright.json`
carries the evidence. "After hydration" for the poster-only modes = `load` + a 2 s settle (TC-140
steps 2–4); the default-mode test shows hydration lands well inside that window (the clip has *ended*).

**Static guards.** `HeroClip.tsx` carries a file-scoped ESLint `no-restricted-syntax` configuration
comment (`.currentTime =`, `.load(`, `loop`, `visibilitychange`, `addEventListener("change"`) and
`tests/unit/hero-clip.test.tsx` greps the source for the same list from outside the file, plus the
jsdom state machine (TC-140 step 5, TC-141 step 5): reduced-motion/coarse/Save-Data → no `<video>`;
default → the exact attribute set, `play()` called once, a re-render with flipped signals never
remounts or replays; `play()` rejected or an `error` event → unmounted; and (TKT-93) the registration
percentages are derived from the measured placement (scale 1.912, x 362, y 6), never typed in. The hero
decoration count (4 since TKT-93: torn edge, underline sketch, hand-sub annotation, postmark sketch)
is EVAL-018's job (`/` hero unit).

```bash
pnpm test -- hero-clip                                                            # the jsdom state machine
pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-019.spec.ts           # the matrix (server up or auto-started)
pnpm eval --only EVAL-019 --skip-build                                            # through the harness
```

## EVAL-018 — decoration budget (M-009, S15/EV5/D6/TP12)

`tests/e2e/eval-018.spec.ts` (tag `@EVAL-018`; TC-127, TC-129) with the in-page collector in
`tests/e2e/eval-018-lib.ts`. It implements `Design.md` §3.2 verbatim on every route — `routes.json`
static + every `/work/<slug>` (`lib/anchors.ts` `ALL_PROJECT_SLUGS`) + every `/thinking/<slug>`
(`data/writing.ts`) + `/definitely-missing` (the 404 page) + `/dev/primitives` — at **w390 and w1440**
only (w768/w1024 skip with the reason). `scripts/eval.ts` maps it through the generic Playwright
branch and appends the real per-unit summary from the spec's `eval-018` annotations to `details`.

| Rule | What the collector measures | Threshold |
|------|-----------------------------|-----------|
| `budget` | Counting units = the page `<header>`, every `<section>`, the page `<footer>`. Every `[data-decor]` belongs to its **nearest ancestor** unit (`el.closest("section, header, footer")` — a nested chapter owns its own; D6). `data-fastener` / `data-paper` never count. | ≤ 4 per unit |
| `caveat` | Every `p, h1–h6, li, td, th, dt, dd` whose computed `font-family` matches `/Caveat/i` must sit inside `[data-decor]` or `[aria-hidden="true"]`, **or** under a `data-hand` ∈ `{quote, cta, label}` within its §3.4 limit **and placement**: `quote` ≤ 240 chars **and** a cite — a `<cite>`, a `[data-cite]`, or text starting `Source:` (sr-only counts) — inside its closest `[data-paper]` or `blockquote` (for a `blockquote`/span hand with no paper, its parent, so the `Hand` `<cite>` sibling and the BandFooter tagline's sr-only `Source:` sibling pass); `cta` ≤ 6 words, no placement rule; `label` ≤ 3 words, digits only as a 2-digit numeral, **and** a `[data-paper]` ancestor. | 0 |
| `flat` | `[data-flat] [data-decor]` is empty (`data-hand="quote"` inside a flat zone is content, allowed). | 0 |
| `hidden` | `[data-decor="sticky" \| "annotation" \| "note"]` and any `[data-decor="sketch"]` with text carry `aria-hidden="true"`. | 0 |

Each route test pushes a per-unit table (`unit`, `count`, `decor[]`, `caveatViolations`,
`flatViolations`, `hiddenViolations`) plus the violations into `test.info().annotations` (type
`eval-018`), so `.eval/playwright.json` is the evidence and the assertion message prints the table.

**Parked hits (decision TP12).** `tests/e2e/eval-018-parked.json` = `[{ route, unit, rule, reason,
ticket }]` (unit labels as the collector prints them: `section#id`, `section[aria-labelledby="…"]`,
`section:nth(n)`, `header`, `footer`). A hit whose route + unit + rule match an entry is reported
`PARKED` (annotation; the test passes); an unmatched hit fails; an entry that matches nothing on its
route fails too (stale-park guard, so a park cannot outlive its fix). `/` and `/dev/primitives` never
carry entries; a `@EVAL-018` test also rejects unknown routes/rules and entries without a reason and a
`TKT-` ticket. Thresholds are never lowered — parking is scoped to sections the design has not
reached. The file must be `[]` by TKT-90 (TC-175).

**Controls.** The untagged test `violating fixture fails all four rules` runs the collector on
`/dev/primitives?violate=1` (a raw-markup section, `app/dev/primitives/ViolateFixture.tsx`) and
asserts each rule reports ≥ 1 hit and that the §3.4 placement hits (a Caveat `label` outside any
`[data-paper]`, a `quote` with no cite) are both reported — it never counts as a case failure. Removing the `@EVAL-018` tag
makes `pnpm exec tsx scripts/eval-cases.ts --check-specs` fail naming EVAL-018 (negative control).
`/dev/primitives` 404s on a plain build (its tests **skip**); build with `ALLOW_DEV_ROUTES=1` to run
the board, the fixture and `tests/e2e/paper-drawin.spec.ts` (TC-128 draw-in checks).

```bash
# one route, both measured widths (the server must already be up, or Playwright starts `pnpm start`)
pnpm test:e2e --project=w390 --project=w1440 tests/e2e/eval-018.spec.ts --grep "@EVAL-018 /about "
# the whole case through the harness
pnpm eval --only EVAL-018 --skip-build
# board + fixture + draw-ins (dev route)
ALLOW_DEV_ROUTES=1 pnpm build && pnpm test:e2e --project=w390 --project=w1440 tests/e2e/eval-018.spec.ts tests/e2e/paper-drawin.spec.ts
```

## Local performance is informational (EVAL-004 / EVAL-005)

Local Chromium runs under **software rendering** (swiftshader, no GPU), so Lighthouse performance and
LCP are an environment artifact, not a real measurement of the shipped site. EVAL-004 and EVAL-005
are therefore **informational locally**: their real measured values are recorded (thresholds are
never lowered, cases are never deleted), but a local perf FAIL or perf regression does **not** gate
the run — each carries an `envCaveat` in the result JSON. The real performance gate is the
production/preview deployment (`pnpm eval --base-url …`) and the perf-lever tickets **TKT-14 /
TKT-49** (A14 / F5 / EV2). The **first-load JS budget** (EVAL-005 `jsKbGzip`) is deterministic and
*is* a real finding when over budget — tracked to TKT-14/49, not excused by the swiftshader caveat.

## Regression rules (vs baseline)

A run is a **regression** when, against the baseline:

- a non-metric case was `PASS` and is now `FAIL` (status flip); or
- a Lighthouse median on a shared route/form-factor dropped by more than **3 points** (EVAL-004); or
- first-load JS grew by more than **10 kB** gzip (EVAL-005).

`FAIL → PASS`, score gains, and JS shrinkage are recorded as `improvements`.

## The external-link WARN policy (EVAL-011 crawler)

The dead-control crawler (`tests/e2e/crawler.ts`) verifies every visible control. It is honest about
what it cannot control:

- **External links** — `HEAD` 200–399 is `ok`. A **403 from LinkedIn or GitHub** is a bot-block, not
  a broken link, so it is recorded as **WARN with the status**, never a FAIL. Results are cached per
  run (≤2 concurrent, 10 s timeout, one retry on 429/5xx).
- **Internal links to not-yet-built routes** (`/thinking`, `/about` during M-002) are **WARN with the
  owning ticket**, not FAIL, until that page ships (see `KNOWN_UNBUILT` in `crawler.ts`).
- **`aria-disabled` controls** must be listed in `tests/e2e/crawler-allowlist.json` with a reason and
  an `expires` ticket, else they are **DEAD**.
- Everything else — a broken internal link, a missing hash target, a button with no observable
  effect, a control with no accessible name — is **DEAD** and fails EVAL-011.

The full control inventory (ok/warn/dead) is written to `.eval/dead-controls.json` each run.

## Dev routes

`/dev/*` pages only exist under `ALLOW_DEV_ROUTES=1` (the CI QA job). On a plain `pnpm test:e2e` /
`pnpm eval` they 404, and their `@primitives` specs **SKIP** (never FAIL) — see `primitives.spec.ts`
and `layout.spec.ts`.

## Adding a new evaluation case

1. Add the case to `evals/eval-cases.json` (id, priority, category, `automated`, `runner`, …). The
   loader (`scripts/eval-cases.ts`) enforces `CASE_COUNT` unique ids (22 since the M-009 addendum,
   `evaluation-plan.md` §8) and the automation↔runner invariant, so update its count/mappings if you
   change the catalogue shape. A Playwright-automated id whose spec is not built yet goes in
   `DEFERRED_SPECS` with the ticket that owns it, so `--check-specs` stays honest.
2. Author the runner: a `@EVAL-0xx`-tagged Playwright spec, a Vitest test, or an LHCI assertion.
3. Map the id in `scripts/eval.ts` (add it to the relevant `*_CASES` array) so the orchestrator
   reads its status from the right layer.
4. Run `pnpm eval --only EVAL-0xx` and confirm the status.

## Non-negotiables (EV2)

- **Never lower a threshold to make a run pass.** A miss is a recorded FAIL, tracked to its fixing
  ticket (e.g. the first-load JS budget — see `bundle-budget.ts` and TKT-14/49).
- **Never overwrite** a results file — the harness auto-suffixes `-2`, `-3`.
- **Never hand-enter a number.** Every measured value comes from real execution output.
- **Never hide a failing case** to make the run green.

## CI

`.github/workflows/eval.yml` runs `typecheck → lint → test → playwright install → build → pnpm eval`
on push/PR (Node 26, pnpm 11, Ubuntu, Chromium), uploading `evals/results/ci-*.json`,
`playwright-report/`, and `.lighthouseci/` as artifacts. **CI is pending a GitHub remote** — the
workflow is authored and statically validated but has not run remotely yet.
