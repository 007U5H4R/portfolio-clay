# TKT-70 · Paper primitives + the decoration contract + EVAL-018 spec — ticket roll-up

**Backlog:** `TASK-65` · M-009 · Feature · P0 · sp:5 · Phase 0 · tasks TSK-33 (`TASK-65.1`), TSK-34 (`TASK-65.2`), TSK-35 (`TASK-65.3`) · branch `m-009-redesign`.
**Sources:** `docs/reports/TSK-33.md`, `docs/reports/TSK-34.md`, `docs/reports/TSK-35.md` (each carries its gate outputs; SHAs in the ledger / `git log --grep "(TSK-3[345])"`).

## Acceptance criteria — evidence

| AC | Requirement (tickets.md) | Evidence | Status |
|---|---|---|---|
| 1 | Every primitive renders exactly the §3.1 attribute; unit tests assert `data-decor ∈ {torn, sticky, annotation, sketch, note, tape}`, `data-fastener ∈ {tape, pin}`, `data-paper` values, `data-flat`, `data-hand` values, `aria-hidden="true"` on every text-bearing decoration | TSK-33 §2 attribute table + barrel check ("every function export needs a render fixture; each decoration fixture renders exactly one `[data-decor]` with a value from the set, `aria-hidden="true"`, and no `data-fastener`/`data-paper`/`data-flat`/`data-hand`"); TSK-34 §1 (`Sheet` variants, `Pin`, `FlatZone`, `Hand` kinds, `DraftTag`/`StatusBadge` `data-paper="tag"`); `tests/unit/paper.test.tsx` **94 passed** at TSK-34. TSK-35 confirms in the browser: `/dev/primitives` per-unit tables list only those `data-decor` values, and rule 6 (hidden) reports 0 on the board | met |
| 2 | A `Sheet` refuses a third fastener (dev warning + test); rotation clamped to the caps; `Hand` label > 3 words / cta > 6 words / quote > 240 chars or without `cite` fails a fixture | TSK-34 §2 environment table + §4: "3 fasteners throw / 2 render / fastener outside a Sheet warns; Hand label 4 words, cta 7 words, quote 241 chars and quote with no cite all throw"; mutation check (MAX_FASTENERS→3, quoteChars→241 → 5 tests fail, reverted). TSK-33: `rotationStyle` clamp `Math.max(-cap, Math.min(cap, rotate))`, caps table, non-finite → default; browser check "Sticky rotate: 5deg" at the cap | met |
| 3 | `eval-018.spec.ts` counts per `<section>` + `<header>` + `<footer>` with nearest-ancestor ownership; fails on > 4, Caveat outside `[data-decor]`/`aria-hidden`/valid `data-hand`, `[data-decor]` inside `[data-flat]`, unhidden text decoration; proven with `/dev/primitives?violate=1` (fails all four) and a clean board that passes | TSK-35 §3: positive control reports budget 7/4, caveat, flat, hidden — all in `section#fixture-violate`, nowhere else, at 390 and 1440; clean board passes, every unit ≤ 4; nested chapter owns its 1 decoration while the outer section reads 0; `data-hand="quote"` inside `[data-flat]` → 0 violations (TC-127 steps 1–5) | met |
| 4 | `pnpm eval --only EVAL-018` runs the spec (not deferred) and writes real counts into the run JSON; legacy hits listed, not hidden — parked with a reason and assigned to the page's ticket | TSK-35 §5: `DEFERRED_SPECS` minus EVAL-018; `--check-specs` → `22 cases OK`, negative control fails naming EVAL-018; `pnpm eval --only EVAL-018 --skip-build` → `FAIL EVAL-018 (high) … 24 routes × 2 widths · 198 units · max 4/4 per unit · 2 unparked hit(s) (caveat 2) · 0 parked · 0 stale park(s) · failing routes: /about`. The one legacy hit (`/about` hero hand-sub in Caveat, both widths) is listed in TSK-35 §4 with its fixing ticket **TKT-86** and a ready-to-paste parked entry; the park + stale-park mechanics were exercised against that real hit (TC-129 steps 4–5). **Parking itself is TKT-74's step** (the tracer run) — the file is `[]` now, so EVAL-018 reads FAIL until then, by design (TP12) | met (FAIL is the honest state; TKT-74 parks) |
| 5 | Draw-ins: `stroke-dashoffset` 400 → 0 over 1.1 s, delay 0.5 s, once; reduced motion renders complete; `Reveal` restyled to opacity + 12 px, no scale | TSK-33 §1/§4: `.sketch[data-drawin]` + `@keyframes drawin` (1.1 s ease-out 0.5 s forwards), reduced-motion override; `.reveal` start offset 20 px → 12 px, `transform: none` at rest. TSK-35 `tests/e2e/paper-drawin.spec.ts` on the board at w1440: `animationName: drawin`, `400px` at t≈0 → `0px` at t = 2 s; `reducedMotion: "reduce"` → `0px` + `none` immediately — **both pass**. `data-drawin` is on the `underline` variant only (Design.md §8 lists only the headline underline; TSK-33 finding 2) | met |
| 6 | `/dev/primitives` shows every primitive at 390 and 1440 at its planned rotation, and the page itself passes EVAL-018 | TSK-35 §2 table (10 sections, planned rotations per §3.1 caps, every primitive incl. all 7 sketch variants, 5 arrow variants, 6 Sheet variants, both fasteners, 3 hand kinds, `DraftTag`, `Illustration` photo + bleed); `@EVAL-018 /dev/primitives` passes at both widths; `primitives.spec.ts` no-overflow + min-targets + axe AA pass at 390 and 1440; screenshots `docs/screenshots/m-009/primitives-{390,1440}.png` | met |

## Definition of Done

- [x] Functional implementation complete (TSK-33/34/35)
- [x] Acceptance criteria satisfied (table above)
- [x] Required tests created and passing — `tests/unit/paper.test.tsx` (94), `eval-018.spec.ts` (24 routes × 2 widths + controls), `paper-drawin.spec.ts`, `primitives.spec.ts` readout test
- [x] Required evaluation case wired — EVAL-018 executes; result persisted in the run JSON (`details` carries the counts; `.eval/playwright.json` the per-unit tables)
- [x] Critical evaluations pass **on the finished surfaces** (`/dev/primitives`, the controls). EVAL-018 as a whole is FAIL on `/about` until TKT-74 parks it — expected, documented, not hidden
- [x] No regression against baseline in the task-scoped e2e runs; the 19 pre-existing failures (TSK-30 §4a) are unchanged and owned elsewhere
- [x] EVAL-018 removed from `DEFERRED_SPECS`
- [x] `docs/eval.md` updated for EVAL-018
- [x] Observability: every route run leaves an `eval-018` annotation (per-unit table) and each parked hit a `PARKED` annotation in the Playwright JSON; `pnpm eval` prints the summary line

## Open points for the orchestrator (carried from the task reports)

1. **TKT-74** — add the `/about` parked entry from TSK-35 §4 (the only legacy hit); expect EVAL-018 to go PASS-with-PARKED in the tracer run.
2. **TSK-36** — `Illustration` currently shows its alt as a caption (stub manifest, no `publicSrc`); the `character-sheet-b` alt wording inconsistency (TSK-34 §5.2).
3. **TC-126 step 5 wording** (TSK-33 finding 1) was already updated in `07dfebf`.
4. ~~Design.md §3.4 vs the algorithm~~ — resolved in TSK-35 fix 1 (§6a): the collector enforces label placement (`[data-paper]` ancestor) and quote cites (`<cite>` / `[data-cite]` / `Source:` text in the `[data-paper]`/blockquote scope; the BandFooter sr-only shape passes). Legacy-hit count unchanged (1).
5. **Parked schema has no width** (TSK-35 §7.4) — only matters if a Phase-A/B section becomes width-conditional.
6. **Visible restyle on legacy pages** from `Tag`/`StatusBadge` (TSK-34 §5.4) stands until those pages are redesigned.
