# Implementer brief — TKT-03 · Content schema + zod build-gate + failing fixture + forbidden strings (M-002)

Fresh implementer. Execute **TKT-03 only** (steps S03.01–S03.09). Model tier: most-capable. This is the M-002 foundation — it defines the content schema every later ticket's data must satisfy, and the build-time gate (EVAL-013) that makes an unsourced/PII claim a build failure. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch **`m-002-foundations`** (already created from main; M-001 is merged). Do NOT `git init`, switch branches, or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, the sibling `portfolio/`. Everything on the E Drive.

## Read first
- `technical-plan.md` §B M-002 → **TKT-03 steps S03.01–S03.09** (lines ~544–552) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` **§A3 (Data model — the FULL zod schema, lines 103–265)** — `data/schema.ts` is A3 verbatim, including the build-failing rules (metric needs `asOf` + `source` in `sources`; ≤3 tags; distinct featured ranks 1/2/3; one `large`; knowledge `surface` 5/6; internal hrefs resolve; professional entries have no `links.live`; `repoPublic` needs github; `deepDive:true` needs the chapters).
- `CONTENT_INVENTORY.md` §1.5 (chapter anchors) + §9 (evidence-link hrefs) — the exact href list the anchors test asserts. §8.1 (TeachSpark overview sentence), §8 (role/dates) for the migrated record.
- Conflicts (§E): **E-2** internal hrefs use `?filter=` (single parser `lib/filters.ts` later; `validate-content` rejects unknown query keys); **E-3** chapter ids are schema values, anchors are presentation — the map lives once in `lib/anchors.ts` + `docs/anchors.md`.

## Steps (each has a hard Gate)
- **S03.01** `data/schema.ts` = A3 verbatim (≥25 exports). Gate: TYPECHECK; the exports-count node check ≥25.
- **S03.02** `data/index.ts` (`collections` + `validateAll()` with the cross-entity rules) + `scripts/validate-content.ts` (`CONTENT_FIXTURE=invalid` swap; prints `<entity>.<id> → path: message`; exit 1) + `package.json` `prebuild`. Gate: `pnpm exec tsx scripts/validate-content.ts` → `content OK (...)`; empty collections allowed until their tickets land.
- **S03.03** `lib/anchors.ts` (`CHAPTER_ANCHORS` 8 chapters with the exact anchor slugs from the plan, `PAGE_ANCHORS`, `routes()` builder) + `docs/anchors.md`. Gate: unit test — every CONTENT_INVENTORY §1.5 + §9 href resolves through `routes()`.
- **S03.04** Migrate the tracer literal → `data/projects.ts` (TeachSpark at card fidelity per the plan's field list), **delete `data/tracer.ts`**, update `ProjectCard`/`app/work/[slug]/page.tsx`/`app/page.tsx` to read from `projects`. Gate: BUILD (prebuild passes); the Playwright tracer spec still green.
- **S03.05** `tests/unit/schema.test.ts` (all data parses + targeted negatives asserting the zod path). Gate: UNIT ≥10 passed.
- **S03.06** `tests/fixtures/invalid-project.fixture.ts` + `tests/unit/content-gate.test.ts` (asserts `validateAll()` returns the 3 exact issue paths). Gate: UNIT green; fixture imported by exactly 2 files (grep).
- **S03.07** `scripts/forbidden-strings.ts` (A3 rule 5 pattern list; `--bundle` scans `.next/**`; reads `tests/forbidden.local.json`, prints SKIP when absent) + `tests/forbidden.local.example.json` (placeholder text ONLY — never a real code) + test + `.gitignore` entry (already present). Gate: `pnpm exec tsx scripts/forbidden-strings.ts` → `0 hits`; planting `PMP` in a tmp file exits 1.
- **S03.08** Prove the gate (EVAL-013): `CONTENT_FIXTURE=invalid pnpm build` fails at prebuild with the 3 issue lines and NO `.next` output → capture to `evals/results/content-gate-proof.txt` (with `exit=1`); then `pnpm build` (no env) green. Commit the proof file.
- **S03.09** Regression + wrap: `pnpm eval --only EVAL-013,EVAL-006,EVAL-008` → EVAL-013 PASS, no regression vs `baseline-v1.json`.

## Rules
- Everything on E Drive. Follow the plan + A3 verbatim; no schema fields or rules beyond A3.
- **NEVER** commit real PII or the TeachSpark sandbox join code — the forbidden-strings example file holds placeholder text only; `tests/forbidden.local.json` stays git-ignored.
- **Commit staging: explicit paths only** (`git add data/ lib/anchors.ts scripts/validate-content.ts scripts/forbidden-strings.ts tests/unit tests/fixtures tests/forbidden.local.example.json docs/anchors.md evals/results/content-gate-proof.txt package.json .gitignore components/projects/ProjectCard.tsx "app/work/[slug]/page.tsx" app/page.tsx docs/reports/TKT-03.md`). NEVER `git add -A`.
- If A3 as written can't satisfy a gate (e.g. a cross-entity rule is ambiguous), STOP and report the breaker — do not invent schema semantics.

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green; the EVAL-013 proof captured.
2. Commit: `feat(m002): TKT-03 content schema + zod build-gate + forbidden strings` + Co-Authored-By trailer. One commit (proof-file may be a second `chore` commit if cleaner).
3. Write `docs/reports/TKT-03.md`: per-step gate output; the content-gate-proof summary; the schema export count; `git diff --stat`; any A3 ambiguity encountered.
4. Final 5-line summary: steps done, EVAL-013 proof result, schema exports count, blockers, deviations, commit SHA.
