# Brief — TSK-33 · Counted decorations: `TornEdge` · `Sticky` · `Annotation` · `Sketch` (7 variants) · `Note` · free `Tape` (+ `Reveal` restyle)

**Ticket:** TSK-33 (Backlog `TASK-65.1`) · parent **TKT-70** (`TASK-65`) · M-009 · Task · P0 · sp:2 · **Depends on:** TKT-69 (done — paper tokens + fonts).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Build the *counted* decoration primitives under `components/paper/` so every later page inherits the anti-scrapbook selector contract (S15/EV5/D6). Server components, no hooks; draw-ins are CSS-only.

## Read first
1. `Design.md` **§3.1** (vocabulary table — attribute per primitive, what counts), **§3.2** (counting contract — why the attributes must be exact), **§3.4** (Caveat exemptions), **§2.3** (rotation caps), **§8** (draw-in timing + reduced motion; `Reveal` = opacity + 12 px, no scale). Headings at lines 136–215, 131, 400.
2. `technical-plan.md` line **876** (F2 primitives bullet) and **910–914** (S70.01–S70.04 — your steps + gates; follow exactly).
3. `tickets.md` lines **1046–1067** (TKT-70 AC 1, 5 and TSK-33 notes).
4. `test-cases.md` **TC-126** (attribute contract — parts for these primitives) and **TC-128** (draw-ins + `Reveal`).
5. Mockup source for SVG paths: `docs/redesign-mockups/m-009/home.html` (`.torn`, sketch underline/spark, arrows) and the other `*.html` for `path`, `chain`, `flow`, `tools` variants. Lift paths; don't redraw.

## Scope
- `components/paper/{TornEdge,Sticky,Annotation,Note,Tape,Sketch}.tsx`, `components/paper/sketch-paths.ts`, `components/paper/index.ts` (barrel — TSK-34 will extend it), `tests/unit/paper.test.tsx`.
- `app/globals.css` — draw-in CSS (`.sketch[data-drawin]`, `@keyframes drawin`, reduced-motion override) and any primitive styles, under a `/* TSK-33 · paper decorations */` banner, in `@layer components`. Colours only via paper tokens / derived vars (EVAL-020 is live: `pnpm test -- eval-020` must stay green — no literals).
- `components/interactions/Reveal.tsx` — restyle to opacity + `translateY(12px)` → none, no scale (TC-128 step 3/4); keep its API and existing consumers working.
- Text-bearing decorations: `aria-hidden="true"` unconditionally; the props type **omits** `aria-hidden` (`@ts-expect-error` line in the test proves it). Rotation clamped with `Math.max(-cap, Math.min(cap, rotate))` via `style={{ "--rot": … }}`.
- Do **not** build `Sheet`/fasteners/`Illustration`/`FlatZone`/`Hand`/`DraftTag` (TSK-34) or the eval-018 spec/board (TSK-35). Don't delete or modify `components/clay/*`.

## Gates
`pnpm test -- paper` green (every S70.01–S70.04 jsdom assertion, snapshots per `TornEdge` fill and per `Sketch` variant, the barrel check that `data-decor` ∈ `{torn,sticky,annotation,sketch,note,tape}` and nothing else); `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`. The Playwright reduced-motion check for `Sketch` (TC-128) lands with the board in TSK-35 — note it as pending in your report, don't build the board.

## Constraints
Everything on `/Volumes/E Drive` (temp `/Volumes/E Drive/Dev/.scratch/m009`). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. One commit: `feat(paper): counted decoration primitives + draw-ins (TSK-33)` + trailer.

## Output — `docs/reports/TSK-33.md` (commit it)
Files; the attribute table actually rendered per primitive; which mockup file each SVG path came from; gate outputs (counts); commit SHA. Final chat reply ≤ 8 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
