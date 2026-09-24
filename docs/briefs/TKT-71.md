# Brief — TKT-71 · Header (one height, D12) + `MobileMenu` paper sheet + nav (D8 five items) + reading progress + `AskAIButton` ghost

**Ticket:** TKT-71 (Backlog `TASK-66`) · M-009 · Feature · P0 · sp:3 · **Depends on:** TKT-69, TKT-70 (done). TKT-73 has also landed (hero) — don't touch hero files.
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** most-capable (Fable 5.1) — dialog/focus + deletions. **Co-Authored-By trailer:** your session's actual model.

## Objective
Global chrome every route shares, in paper: a single-height sticky header with serif nav, a native-`<dialog>` paper sheet on mobile, the reading-progress bar on case studies, and the M-008 compaction code gone for good.

## Read first
1. `Design.md` **§4.1** (header + mobile menu, verbatim spec), **§3.3** header row (unit count 1), **§3.4** (`data-hand="cta"`), **§10** (a11y), **§8** (motion).
2. `decisions.md` **D12** (381), **D8** (361 — five items default), **TP14** (401 — `MediaGate`), **S21** (326 — Ask stays).
3. `technical-plan.md` lines **867** (F1-12 layout), **1122** (E-16 `MediaGate`), **929–933** (S71.01–S71.05 — your steps + gates; follow exactly).
4. `tickets.md` lines **1079–1089** (TKT-71 description, AC 1–8, notes).
5. `test-cases.md` **TC-130, TC-131, TC-132, TC-133**.
6. Existing: `components/navigation/{Header,MobileMenu,AskAIButton,NavPill,SkipLink}.tsx`, `lib/{nav,motion}.ts`, `components/interactions/ProgressBar.tsx`, `app/work/[slug]/page.tsx`, `tests/e2e/{layout,eval-007}.spec.ts`, `tests/unit/{routes,motion}.test.ts(x)`, `tests/e2e/crawler-allowlist.json`, mockup `docs/redesign-mockups/m-009/home.html` header block.

## Scope
Per S71.01–S71.04: `lib/nav.ts` (+ Playground, doc comment with the one-line D8 revert path), `Header.tsx` (server shell + tiny client `HeaderScroll`), `Monogram.tsx`, `InkUnderline.tsx`, `components/paper/MediaGate.tsx` (TP14: renders `null` until mounted, evaluates `matchMedia` once, no subscription), `MobileMenu.tsx` restyle (keep native dialog + focus return), `AskAIButton` ghost 44 px, `ProgressBar.tsx` restyle + mount only on `/work/[slug]`. **Delete** `useScrollY` (from `lib/motion.ts`), `NavPill.tsx`, `headerGlassClass`, compaction classes, and their unit cases (assertions replaced, `motion.test.tsx` kept). If `.glass` in `globals.css` has no consumer left after this, delete it. CSS under a `/* TKT-71 · header */` banner in `app/globals.css`; tokens/derived only (EVAL-020 live).

## Gates
S71.02 Playwright rewrite of `tests/e2e/layout.spec.ts` (height equal ±1 at scrollY 0/400 on all four projects; `[data-scrolled]` only after scroll; subline absent at `w390`, present + `aria-hidden` at `w1440`); S71.03 keyboard path in `tests/e2e/eval-007.spec.ts` + axe with the sheet open; S71.04 progress present on `/work/teachspark`, absent on `/`, transform changes at 50 %; grep `useScrollY\|NavPill` → 0; `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `pnpm test:e2e` full (counts; failures proven pre-existing or fixed; no spec deleted); `pnpm eval --only EVAL-007,EVAL-008,EVAL-011,EVAL-018 --skip-build` (header unit = 1 on every route — legacy *section* hits may still fail; list them); every control ≥ 44 px (`minTargets`); screenshots `docs/screenshots/m-009/header-390.png`, `header-1440.png` (prod build, menu closed) + `header-390-menu.png` (sheet open).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. Commits (1–3, one logical change each) + trailer, e.g. `feat(header): paper header, one height, D8 nav (TKT-71)`, `refactor(header): remove compaction + NavPill (TKT-71)`.

## Output — `docs/reports/TKT-71.md` (commit it)
AC 1–8 each with evidence; deleted code list; e2e counts; eval statuses; screenshots; commit SHA(s). Final chat reply ≤ 10 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
