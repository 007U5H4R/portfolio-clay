# Brief — TSK-34 · Content paper: `Sheet` · fasteners · `Illustration` (+ manifest stub) · `FlatZone` · `Hand` · `DraftTag` · `Prose`/`Tag`/`StatusBadge` on paper

**Ticket:** TSK-34 (Backlog `TASK-65.2`) · parent **TKT-70** (`TASK-65`) · M-009 · Task · P0 · sp:2 · **Depends on:** TSK-33 (done — counted decorations + barrel).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Build the *non-counted* paper primitives (content paper, fasteners, flat zones, hand exemptions) with their limits enforced at render, and swap the site's draft labels to `DraftTag`.

## Read first
1. `Design.md` **§3.1** (rows for `Sheet` variants, fasteners, `Illustration`, `FlatZone`, `Hand`, `DraftTag`, `StatusBadge`), **§3.4** (hand limits — label ≤ 3 words / 2-digit numeral, cta ≤ 6 words, quote ≤ 240 chars + cite), **§2.3** (radii, rotation caps, shadows), **§6.1 + §6.3** (manifest type + the nine exact alt strings — needed for the stub), **§6.4** (placement forms).
2. `technical-plan.md` lines **861–862** (F1-6 `DraftTag` doesn't exist; F1-7 `Prose` 60→68ch), **876** (F2 primitives), **879** (F2 illustrations), **917–920** (S70.05–S70.08 — your steps + gates; follow exactly).
3. `tickets.md` lines **1052–1060** (TKT-70 AC 1–2, notes) and **1069–1072** (TSK-34).
4. `test-cases.md` **TC-126** (all parts not covered by TSK-33).
5. Existing code: `components/paper/*` + `tests/unit/paper.test.tsx` from TSK-33 (extend, don't fork), `components/common/{Prose,Tag}.tsx`, `components/projects/StatusBadge.tsx`, `data/schema.ts` (`Media`).

## Scope
- New: `components/paper/{Sheet,Pin,FlatZone,Hand,DraftTag,Illustration,IllustrationImg}.tsx`; fastener variant of `Tape` (`data-fastener="tape"`), `Pin` (`data-fastener="pin"`), both with the `isFastener` static marker; `lib/illustrations.ts` + a **stub** `content/media/illustrations/manifest.ts` (nine ids, `file:""`, exact §6.3 alts — TSK-36 replaces file/publicSrc/sizes later; keep the exported type identical to §6.1 so TSK-36 only fills data). Extend the barrel `components/paper/index.ts`.
- Edited: `components/common/Prose.tsx` (68ch + `data-flat`), `components/common/Tag.tsx` (Inter 12 px pill, no `ClayPill`), `components/projects/StatusBadge.tsx` (ivory pill, steel border, icon + text; `data-paper="tag"` when `onPaper`).
- S70.08: replace every `<Tag>Draft — pending sign-off</Tag>` usage with `<DraftTag/>` — mechanical, no copy change; **do not** fix the essay double-prefix (TKT-84 owns it with TC-164).
- Dev-time enforcement must throw in the test env and `console.error` in dev, and be inert in production builds.
- CSS for sheet variants under a `/* TSK-34 · content paper */` banner in `app/globals.css`; tokens/derived vars only (EVAL-020 live).

## Gates
`pnpm test -- paper` (all S70.05–S70.07 assertions: 3 fasteners throw / 2 render / fastener outside a `Sheet` warns; unknown illustration id throws; alt byte-equal to manifest; bleed renders exactly one `img`; `Hand` label 4 words throws, cta 7 words throws, quote 241 chars throws, quote without cite throws; `Prose` has `data-flat`; `DraftTag` default text); `grep -rn "<Tag>Draft" components app` → 0; `grep -rn "ClayPill" components/common/Tag.tsx` → 0; `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; then `pnpm test:e2e` for specs touching draft labels / tags / status badges (`thinking*`, `about`, `how-i-think`, `ask-*`, `work`, `case-study`) — report counts; update selectors only if they asserted `ClayPill` markup (never delete a spec).

## Constraints
Everything on `/Volumes/E Drive` (temp `/Volumes/E Drive/Dev/.scratch/m009`). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. One commit: `feat(paper): content paper, fasteners, hand exemptions, DraftTag (TSK-34)` + trailer.

## Output — `docs/reports/TSK-34.md` (commit it)
Files; enforcement behaviour per env; the list of `DraftTag` swaps (file:line); gate outputs (counts); commit SHA. Final chat reply ≤ 8 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
