# TSK-35 · `eval-018.spec.ts` + violating fixture + `/dev/primitives` board + un-defer EVAL-018 — report

**Ticket:** TSK-35 (`TASK-65.3`) · parent TKT-70 (`TASK-65`) · M-009 · branch `m-009-redesign` · steps S70.09–S70.12 · TC-127, TC-128 (steps 1–2), TC-129 (steps 1–5).
**Implementer:** Fable 5.1 (most-capable tier). **Commit:** in the orchestrator hand-back (a report cannot carry its own SHA).

## 1. Files

| File | Change |
|---|---|
| `tests/e2e/eval-018-lib.ts` | new — the self-contained in-page collector (`collectDecorations`, serialised into `page.evaluate`), `RULE_LIMITS` (4 · 240 · 6 · 3), the per-unit row type, `applyParked` (route + unit + rule match, stale detection), `NEVER_PARKED` |
| `tests/e2e/eval-018.spec.ts` | new — tag `@EVAL-018`; one test per route (24 routes: 7 `routes.json` static + 10 more `/work/<slug>` + 5 `/thinking/<slug>` + `/definitely-missing` + `/dev/primitives`), w390 + w1440 only (w768/w1024 `test.skip` with reason); annotations `eval-018` (per-unit table) and `PARKED`; a tagged parked-list well-formedness test; **untagged** positive control on `?violate=1`; untagged nested-section / quote-in-flat test (TC-127 steps 3–4) |
| `tests/e2e/eval-018-parked.json` | new — `[]` |
| `tests/e2e/paper-drawin.spec.ts` | new — TC-128 steps 1–2 (draw-in 400 px → 0 px; reduced motion 0 px + `animation-name: none`). **A separate small untagged file**, not inside the EVAL-018 spec, so a motion regression never reads as a decoration-budget case failure |
| `app/dev/primitives/page.tsx` | rewritten — 10 paper sections (see §2), server-side readout per section, every primitive at its planned rotation; `devOnly()` unchanged; the TKT-05 layout demo (`layout-demo-*`, `reveal-demo` testids) kept so `layout.spec.ts` still has its precondition |
| `app/dev/primitives/ViolateFixture.tsx` | new — `"use client"`, raw markup, rendered only when `useSearchParams().get("violate") === "1"` under a `Suspense` boundary (keeps the route static; a server `searchParams` read would fail `assert-static`) |
| `scripts/eval-cases.ts` | `DEFERRED_SPECS` minus EVAL-018 |
| `scripts/eval.ts` | `PwTest.annotations` typed; `eval018Details()` summarises the spec's `eval-018` annotations into the case `details` (routes × widths, units, max count, unparked hits by rule, parked, stale, failing routes). Only appended for EVAL-018; no other case changes |
| `docs/eval.md` | Playwright row lists EVAL-018; new "EVAL-018 — decoration budget" section (rules table, annotations, parked-list semantics, controls, how to run one route) |
| `tests/e2e/primitives.spec.ts` | h1 assertion → "Paper primitive system"; the ClayPill hover test (its subject is no longer on the board) replaced by "every section's readout matches its owned `[data-decor]` count and none is over budget" |
| `tests/e2e/layout.spec.ts` | h1 assertion → "Paper primitive system" (one line; the board it targets was rewritten) |
| `docs/screenshots/m-009/primitives-{390,1440}.png` | new |

## 2. The board (`/dev/primitives`)

Counts measured by the spec at both widths (identical at 390 and 1440 — nothing is width-conditional):

| Unit | Count | Objects | Mirrors (§3.3) |
|---|---|---|---|
| `section#board-hero` | 3 | hero-size annotation (−2°) · h1 underline sketch (`data-drawin`) · figcaption annotation with arrow down (+2°) | `/` hero |
| `section#board-featured` | 4 | torn (paper-2) · dashed-arrow annotation · flow sketch · sticky (+4°) — 3 taped `card` Sheets not counted | `/` featured (at budget) |
| `section#board-journey` | 2 | torn · path sketch — 6 pinned `index` Sheets (rust/forest/steel pins) not counted | `/` how I think |
| `section#board-scraps` | 4 | free tape (−3°) · stamp note "TP" (+6°) · note (−4°) · kraft note (+3°) | free scraps (at budget) |
| `section#board-sketches` | 4 | spark · chain · tools · arrow | remaining variants (at budget) |
| `section#board-annotations` | 4 | sm/up (−3°) · md/left (+2°) · lg/right (−1°) · md at the +4° cap | remaining arrows (at budget) |
| `section#board-paper` | 1 | photo-frame caption annotation — postcard (stamp, `dt` labels), notebook (quote), taped `Illustration` photo (2 fasteners), pinned `photo` Sheet at +2.4°, `tag` Sheet, `DraftTag`, `StatusBadge`, `Tag` not counted | content paper |
| `section#board-band` | 1 | terracotta torn — tagline as `data-hand="quote"` + sr-only `Source:` | band footer |
| `section#board-deepdive` | 0 | — | case-study deep dive (outer) |
| `section#board-chapter` (nested) | 1 | annotation — `Prose` (`data-flat`) holding a `data-hand="quote"` blockquote with `<p>` inside, plus a `FlatZone as="table"` | chapter (TC-127 steps 3–4) |
| `section#board-layout` + inner `Section` | 0 | — | TKT-05 layout demo |
| legacy `header` / `footer` | 0 | — | (site chrome, still clay) |

Readout: `Board` walks its children's element tree (`countDecor`) — a `TornEdge`/`Sticky`/`Annotation`/`Sketch`/`Note` element or a `Tape` with `free` counts one; nested `<section>`/`Section` elements are not descended into (nearest-ancestor ownership); `Illustration`'s `caption` slot is walked. The new `primitives.spec.ts` test asserts the readout equals the DOM count for all 10 sections (passes at w1440).

**Fixture (`?violate=1`)** — `section#fixture-violate`: 5 raw notes + a raw free tape (inside a `[data-flat]` div) + a raw sticky = **7 / 4** (budget); a `<p class="font-hand">` with no `data-decor`/`aria-hidden`/`data-hand` (caveat); the tape inside `[data-flat]` (flat); the sticky without `aria-hidden` (hidden).

## 3. Controls

**Positive control** (`violating fixture fails all four rules`, untagged) — passed at w390 and w1440; the collector reported, all in `section#fixture-violate` and nowhere else:
```
budget  7 decorations (limit 4): note, note, note, note, note, tape, sticky
caveat  Caveat <p> "This paragraph is Caveat with no decoration, no aria-hidden …" outside [data-decor]/aria-hidden with no valid data-hand
flat    <span data-decor="tape"> inside [data-flat]
hidden  <p data-decor="sticky"> "An unhidden sticky — a hidden rule hit." is not aria-hidden="true"
```
Clean board: `@EVAL-018 /dev/primitives` passed at both widths, every unit ≤ 4 (table above). Nested-ownership test: outer 0, inner 1, 0 flat / 0 caveat violations — passed.

**Negative control** (`--check-specs`): with the tag intact → `22 cases OK · 18 automated · 4 manual` / `spec coverage OK · 10 Playwright-automated ids tagged · deferred: EVAL-019 (…)`. With every `@EVAL-018` in the spec rewritten to `@EVAL-x18` → `[eval-cases] missing @EVAL spec tags for: EVAL-018`, exit 1. Spec restored byte-identical (`git diff` empty). Note for the record: a first attempt that appended a suffix (`@EVAL-018-OFF`) did **not** fail — the tag scanner matches `/@EVAL-\d{3}/` as a prefix — so the control has to break the digits, not extend them.

**Parked-list controls** (TC-129 steps 4–5, run against the real `/about` hit, w1440, file restored to `[]` after):
- step 4, entry `{ route:"/about", unit:"section#impact", rule:"budget", … TKT-86 }` (matches nothing) → the `/about` test **failed** on both assertions: the real hit is unparked and the entry is stale.
- step 5, entry `{ route:"/about", unit:"section[aria-labelledby=\"about-hero-heading\"]", rule:"caveat", … TKT-86 }` → **1 passed**, annotation `PARKED /about · section[aria-labelledby="about-hero-heading"] · caveat → TKT-86 (…)` present in the run JSON.

## 4. Legacy hits (feeds TKT-74's parked list)

Full sweep, 24 routes × 2 widths = 48 route runs, 198 units, max 4/4 per unit. **Exactly one hit, at both widths:**

| Route | Width | Unit | Rule | Detail | Fixing ticket |
|---|---|---|---|---|---|
| `/about` | 390 | `section[aria-labelledby="about-hero-heading"]` | caveat | `<p>` "Same curiosity → bigger problems." in Caveat (`AboutHero` hand-sub, `font-hand`) outside `[data-decor]`/`aria-hidden`, no `data-hand` | TKT-86 (`/about` part 1 — hero rebuilt with the hand-sub as an `Annotation`) |
| `/about` | 1440 | same | caveat | same | TKT-86 |

Every other route (`/`, `/work`, all 11 `/work/<slug>`, `/thinking`, all 5 essays, `/playground`, `/contact`, 404) reported 0 decorations and 0 violations — the clay pages have no `data-decor` yet, and their only Caveat text (`components/hero/Annotation.tsx` on `/`) is `aria-hidden`. Proposed TKT-74 entry (verified to match in step 5 above):
```json
{ "route": "/about", "unit": "section[aria-labelledby=\"about-hero-heading\"]", "rule": "caveat",
  "reason": "legacy clay AboutHero hand-sub in Caveat without data-decor — rebuilt in TKT-86", "ticket": "TKT-86" }
```

## 5. Gates

| Gate | Result |
|---|---|
| `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-018.spec.ts tests/e2e/paper-drawin.spec.ts tests/e2e/primitives.spec.ts tests/e2e/layout.spec.ts` (ALLOW_DEV_ROUTES=1 build, fresh server) | **67 passed · 2 failed · 9 skipped** — the 2 failures are `@EVAL-018 /about` at w390 and w1440 (§4, expected until TKT-74 parks it). Positive control, clean board, nested-ownership, both TC-128 draw-in tests (400px→0px with `animationName: drawin`; reduced motion 0px + `none`), primitives (no-overflow, min-targets, axe AA at 390 and 1440, readout agreement) and layout all pass |
| `pnpm exec tsx scripts/eval-cases.ts --check-specs` | `22 cases OK …`; negative control fails naming EVAL-018 (§3) |
| `pnpm eval --only EVAL-018 --skip-build --label tkt-70-tsk35-eval018` | `FAIL EVAL-018 (high): 2 failing: … [w390]; … [w1440] · 24 routes × 2 widths · 198 units · max 4/4 per unit · 2 unparked hit(s) (caveat 2) · 0 parked · 0 stale park(s) · failing routes: /about` — honest FAIL, never SKIP; `details` carries the real counts; artifact `.eval/playwright.json` holds every per-unit table. Result file is under the gitignored `evals/results/tkt-*.json` pattern |
| `pnpm typecheck` · `pnpm lint` | clean |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` | **45 files passed, 1 skipped · 416 passed, 2 skipped** |
| `pnpm build` (plain) | `all routes static (13)` — the `useSearchParams` fixture keeps `/dev/primitives` static |
| `NODE_ENV=production pnpm start` (plain build) | `/dev/primitives` → **404**, `/dev/primitives?violate=1` → **404**, `/` → 200 |
| Screenshots | `docs/screenshots/m-009/primitives-{390,1440}.png` — taken from the **`ALLOW_DEV_ROUTES=1 pnpm build` + `pnpm start`** server (the built CSS, not `next dev`; the brief allowed `pnpm dev` — the production build is the closer proxy and was already up). `scrollWidth === clientWidth` at both widths (390/390, 1440/1440) |

Pre-existing e2e failures (TSK-30 §4a: `.glow-halo` overflow, `featured.spec`, `tracer.spec` `AVATAR_ALT`) were not part of these runs (not in the file list) and are unchanged by this task. The churned `docs/screenshots/primitives/*.png` from `primitives.spec.ts` were restored with `git checkout`. The :3000 server was killed after the last run.

## 6. First browser look at the TSK-34 CSS (from the two screenshots)

Nothing visibly broken. Cards, index cards, tape (l/c/r rotation), pins, notebook rules/holes/margin, postcard stamp, kraft tag, photo frame and the terracotta torn edge all render as the mockups intend at both widths; the underline finished drawing under "system"; the band's ivory text on terracotta reads (axe AA clean). Two expected-until-TSK-36 artefacts: (1) `Illustration` renders its alt as a caption box (stub manifest, no `publicSrc`) — on the hero the **bleed** placement's caption box sits absolutely at the top-right of the section, which is where the bleed scene will sit; (2) the taped photo frame is an ivory card carrying the alt text. One judgement call for TKT-86/TKT-88: the free-standing `Tape` (96 × 26) and the `Note` scraps are small at 390 — fine on a board, but page tickets should place them near a paper host so they read as intentional.

## 7. Deviations and judgement calls

1. **`scripts/eval.ts` edited** (not in the brief's Scope list, but S70.11's gate reads "writes real per-unit counts (`details` non-empty)"). Without it `details` would have been the generic "2 failing: …". The change is EVAL-018-only (one appended string) plus an optional `annotations` field on the `PwTest` type.
2. **`?violate=1` via a client `useSearchParams` component** rather than the page's `searchParams` prop: the latter makes the route dynamic and fails `assert-static` (TP1). The fixture is still raw markup and still lives under `app/dev/primitives/`.
3. **Label exemption does not require a `data-paper` ancestor.** §3.4 says a `label` lives "inside a `data-paper` object"; the brief's algorithm (technical-plan §F2, verbatim) only requires `data-hand ∈ {quote,cta,label}` + the text limit, so that is what the collector enforces. Adding the ancestry check is a one-line follow-up if Stage 8 wants it.
4. **Parked entries have no width dimension** (schema fixed by the brief). Since the spec runs per width, an entry must match at both 390 and 1440 or it is stale at one of them. Nothing in the current sweep is width-conditional; if a Phase-A/B section removes a decoration from the DOM below a breakpoint (§3.3 allows it), TKT-74 may need an optional `widths` field.
5. **`primitives.spec.ts` ClayPill hover test replaced**, not kept: `ClayPill` is no longer rendered on the board (the board is the paper board now; TKT-89 deletes `components/clay`). Its replacement guards the new readout instead.
6. **Draw-in first read uses `waitUntil: "commit"`** so the 400 px reading lands inside the 0.5 s delay; it passed twice in a row here, but if it ever flakes on a slow host the fix is to assert `animationName === "drawin"` and `offset !== "0px"` rather than the literal 400 px.
7. `evals/results/tkt-70-tsk35-eval018.json` is gitignored by pattern (`tkt-*.json`) — not committed, by repo convention.
