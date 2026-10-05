# Brief — TKT-74 (local part) · Phase-0 tracer assembly · parked list · baseline run · Phase-0 QA gate

**Ticket:** TKT-74 (Backlog `TASK-69`) · M-009 · Task · P0 · sp:2 · **Depends on:** TKT-71, TKT-72, TKT-73 (all done).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`). **Do NOT push** — the push, the Vercel preview (S74.04) and the hero gate (S74.05) are the orchestrator's, after Tushar's OK.
**Role:** independent **QA-tester** (you did not implement any Phase-0 ticket). **Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Assemble `/` for the tracer, park the legacy EVAL-018 hit honestly, write the M-009 baseline, and run the Phase-0 QA gate (every Phase-0 TC + regressions) with a PASS/FAIL/BLOCKED/NA verdict per case — from real output only.

## Read first
1. `technical-plan.md` **961–966** (S74.01–S74.05), **877** (EVAL-018 parked semantics), **859** (F1-4: real `eval.ts` flags), **1065** (Phase-0 row of F4: the phase QA gate).
2. `tickets.md` **1137–1147** (TKT-74 AC 1–7).
3. `test-cases.md` **TC-122 … TC-145** (the Phase-0 cases; TC-146 is the human gate — mark it NA/pending).
4. `decisions.md` **TP12** (parking), **EV6** (budget never edited).
5. `docs/ledger.md` M-009 section (what each task shipped; known baseline = 2 e2e failures, both `eval-018 /about`), `docs/reports/TKT-69.md`, `TKT-70.md`, `TKT-71.md`, `TKT-72.md`, `TKT-73.md`.

## Steps
1. **S74.01 Assemble + screenshots.** Confirm `app/page.tsx` order = hero → Featured → How I think → Ask → (band via layout). Change only if wrong. Prod build (`pnpm build`, then a *fresh* `pnpm start` — kill any live :3000 first). Screenshots (Playwright CLI, env per `HANDOFF.md` §7, `--full-page`, `--wait-for-timeout=4500` so the clip has ended): `docs/screenshots/m-009/tracer/home-{390,768,1024,1440}.png` and `case-{390,768,1024,1440}.png` of `/work/teachspark`. **Read every PNG** and note anything visibly broken (overlap, overflow, invisible text, missing hero).
2. **S74.02 Park.** `tests/e2e/eval-018-parked.json` ← one entry per current legacy hit — today exactly `/about` hero hand-sub (caveat rule), `reason: "legacy clay section — rebuilt in TKT-86"`, `ticket: "TKT-86"` — using the exact `unit` string the spec reports (see `docs/reports/TSK-35.md` §4 for the ready-made entry). `/` and `/dev/primitives` must carry **no** entries. `pnpm test:e2e --project=w390 --project=w1440 tests/e2e/eval-018.spec.ts` → all green, `/about` reported PARKED, stale guard passing. Commit the parked list + screenshots: `test(eval): park the legacy /about EVAL-018 hit for TKT-86 (TKT-74)`.
3. **S74.03 Baseline.** With a **clean tree** (commit first — `dirty` must be `false`): `pnpm eval --label baseline-m009-tracer` → `evals/results/baseline-m009-tracer.json`. Read it with `node -e`: `provenance.commit` (40 chars), `branch === "m-009-redesign"`, `dirty === false`, EVAL-018/019/020/021 status ∈ {PASS, FAIL} (never SKIP), `criticalFailures` empty, EVAL-005 `jsKbGzip` (also run `pnpm exec tsx scripts/bundle-budget.ts --route / --json` and quote `firstLoadJsGzipKb` — expected ≈ 159; if > 180 say so loudly: a `TKT-92 perf` ticket is then required and the budget is never edited). Then `pnpm eval --baseline baseline-v1.json --reuse` → regression diff vs the pre-redesign baseline: list every regression and classify it (expected-by-design, e.g. a removed M-008 feature, vs real). Commit the baseline (check `.gitignore` — `eval-run-0.2.0-*.json` is ignored, a `baseline-*` name is not; `git check-ignore -v` to confirm): `eval: baseline-m009-tracer on the Phase-0 tracer`.
4. **Phase-0 QA gate.** Execute (or re-verify from committed evidence when a case is expensive and already proven in a ticket report — say which) every automated step of **TC-122 … TC-145** except the preview-only steps of TC-145 (steps 2–4 → `BLOCKED: needs preview`). Also run the regressions: `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` and the FULL `pnpm test:e2e` (4 projects, fresh server) — expected 0 failures now that `/about` is parked. Verdict per TC: PASS / FAIL / BLOCKED / NA with the evidence line. Any FAIL → do **not** fix product code; report it precisely (file, repro, expected vs actual).
5. Restore churned `docs/screenshots/**` PNGs that aren't yours; kill :3000 at the end.

## Output
- `docs/reports/TKT-74-local.md` (commit it): S74.01 notes per screenshot · parked entry · baseline read-outs (quote the `node -e` lines) · bundle number · regression diff vs baseline-v1 with classification · the **Phase-0 QA table** (TC id · verdict · evidence) · full e2e counts · anything that should block the hero gate.
- Final chat reply ≤ 10 lines: commit SHAs, bundle kB, EVAL-018…021 statuses, QA table totals (PASS/FAIL/BLOCKED/NA), full e2e counts, blockers.

## Constraints
Everything on `/Volumes/E Drive` (temp `/Volumes/E Drive/Dev/.scratch/m009`). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. Never lower a threshold, never skip or delete a test to get green, never hand-type a result.
