# Brief — TSK-35 · `eval-018.spec.ts` + violating fixture + `/dev/primitives` board + un-defer EVAL-018

**Ticket:** TSK-35 (Backlog `TASK-65.3`) · parent **TKT-70** (`TASK-65`) · M-009 · Task · P0 · sp:1 · **Depends on:** TSK-34 (done — all paper primitives exist).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** most-capable (Fable 5.1). **Co-Authored-By trailer:** your session's actual model.

## Objective
Make the decoration budget **measurable**: a Playwright collector that implements `Design.md` §3.2 exactly, proven by a violating fixture that trips all four rules and a clean board that passes; EVAL-018 leaves `DEFERRED_SPECS`; legacy-route hits are reported honestly (they will fail now — TKT-74 parks them).

## The algorithm (implement verbatim — `technical-plan.md` line 877, F2 "EVAL-018 implementation")
For each route, at `w390` and `w1440`: `page.evaluate` collects `units = [header, ...document.querySelectorAll("section"), footer]`; for every `[data-decor]` element, `unit = el.closest("section, header, footer")` (nearest-ancestor ownership, D6); count per unit; fail on `> 4`. **Caveat rule:** for every `p,h1,h2,h3,h4,h5,h6,li,td,th,dt,dd` whose `getComputedStyle(el).fontFamily` matches `/Caveat/i`, require `el.closest('[data-decor],[aria-hidden="true"]')` **or** a `data-hand` on self/ancestor whose value ∈ `{quote,cta,label}` **and** whose text passes the §3.4 limit. **Flat rule:** `[data-flat] [data-decor]` must be empty. **Hidden rule:** every `[data-decor="sticky"|"annotation"|"note"]` and any `[data-decor="sketch"]` containing text must have `aria-hidden="true"`. Results are written as a per-unit table into the Playwright annotations (surfaced in the run JSON `details`). **Parked hits:** `tests/e2e/eval-018-parked.json` = `[{ route, unit, rule, reason, ticket }]`; a hit matching a parked entry is reported `PARKED` (test passes with an annotation), an unmatched hit fails, and a parked entry that no longer matches anything fails too (stale-park guard). Decision TP12 (`decisions.md` line 391).

## Read first
1. `Design.md` **§3.2** (normative counting contract), **§3.3** (planned counts per section — the board mirrors real section sizes), **§3.4** (limits), **§8** (draw-in timing for the TC-128 checks).
2. `technical-plan.md` lines **860, 865** (F1-5 eval-cases / `--check-specs`; F1-10 fixtures + projects + `routes.json`), **923–926** (S70.09–S70.12 — your steps + gates; follow exactly).
3. `decisions.md` **D6** (line 351), **TP12** (391).
4. `test-cases.md` **TC-127, TC-128, TC-129**.
5. Existing: `app/dev/primitives/page.tsx` (rewrite it), `tests/e2e/fixtures.ts`, `tests/e2e/routes.json`/`routes.ts`, `lib/anchors.ts` (`ALL_PROJECT_SLUGS`), `data/writing.ts`, `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `scripts/eval.ts` (Playwright tag mapping), `components/paper/*`.

## Scope
- `app/dev/primitives/page.tsx` rewritten per S70.09 (every paper primitive at planned rotation; per-section count readout computed server-side from the same rules; `?violate=1` fixture section via **raw markup**, not by weakening primitives; the nested-section case from TC-127 step 3 and the `data-hand="quote"` inside `[data-flat]` case from step 4 on the board; `devOnly()` production 404 unchanged).
- `tests/e2e/eval-018-lib.ts` (serialisable collector + limit checks), `tests/e2e/eval-018.spec.ts` (tag `@EVAL-018`; routes per S70.10; `w390`+`w1440` only, others `test.skip` with reason; untagged positive-control test on `?violate=1` asserting each rule ≥ 1 violation), `tests/e2e/eval-018-parked.json` = `[]`.
- Add the TC-128 draw-in checks (default 400→0 px; reduced motion 0 px + `animation-name: none` immediately) on the board, in the spec file or a small untagged `tests/e2e/paper-drawin.spec.ts` (state which in the report).
- `scripts/eval-cases.ts` (`DEFERRED_SPECS` minus EVAL-018), `docs/eval.md` (EVAL-018 section: rules, parked-list semantics, how to run one route).

## Gates
- `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-018.spec.ts`: positive-control test passes; `/dev/primitives` passes; legacy routes **fail** (expected) — list every hit per route/unit/rule in the report with the ticket that will fix it (map by `tickets.md` TKT-75…88 scope) — this feeds TKT-74's parked list.
- `pnpm exec tsx scripts/eval-cases.ts --check-specs` → `22 cases OK …`; negative control (remove the tag temporarily → fails naming EVAL-018; restore).
- `pnpm eval --only EVAL-018 --skip-build` → real per-unit `details`, status honest (FAIL now is correct; never SKIP).
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `NODE_ENV=production pnpm start` → `/dev/primitives` 404.
- Screenshots `docs/screenshots/m-009/primitives-390.png` and `-1440.png` (`/dev/*` is dev-only, so use `pnpm dev` for the board and say so — the board has no hero `next/image`, so the dev image-cache scar doesn't apply). Playwright env: `PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright" TMPDIR="/Volumes/E Drive/Dev/.scratch"`.
- Write `docs/reports/TKT-70.md` (ticket roll-up: AC 1–6 each with evidence; pull TSK-33/34 facts from their reports).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. Never lower a threshold or skip a legacy route to make it green. One or two commits: `test(eval): EVAL-018 decoration budget spec + violating fixture (TSK-35)` (+ `chore(eval): un-defer EVAL-018` if separate) + trailer.

## Output — `docs/reports/TSK-35.md` + `docs/reports/TKT-70.md` (commit both)
The legacy-hit table (route · width · unit · rule · detail · fixing ticket); positive/negative control outputs; gate outputs; commit SHA(s). Final chat reply ≤ 10 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.

- **TSK-33 note:** `data-drawin` is only on the `underline` Sketch variant (Design §8) — the TC-128 draw-in checks target the underline.

- **TSK-34 note:** the board is the first browser look at the Sheet/fastener/Illustration CSS — Read your two screenshots and flag anything visibly broken in the report. Until TSK-36, `Illustration` shows its alt as a caption (stub manifest) — expected.
