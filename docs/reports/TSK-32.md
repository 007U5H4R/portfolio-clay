# Report — TSK-32 (`TASK-64.3`) · `tests/unit/eval-020.test.ts` + `pnpm eval` wiring

**Ticket:** TKT-69 (`TASK-64`) · M-009 · S69.07–S69.09 · TC-122 (steps 1–2), TC-123 · Implementer: Claude Opus 5.5 (standard tier) · Branch `m-009-redesign` (not pushed).
**Commit:** `test(eval): EVAL-020 paper token gate with positive control (TKT-69)`. The SHA is in the hand-back, since a report cannot contain its own commit hash.

## 1. Files
| File | Change |
|---|---|
| `tests/unit/eval-020.test.ts` | new. S69.07 parts (1)–(5) plus a small stripper self-test (5b) |
| `tests/fixtures/retired-tokens.fixture.txt` | new. The positive control: 5 `HIT` lines, 3 `DECOY` lines, 2 comment-only decoys |
| `docs/eval.md` | Layers table: EVAL-020 added to the Vitest row. New section "EVAL-020 — paper token gate" covering what it checks, the comment-stripping rule, the allow-list policy, and how to run it |
| `docs/reports/TSK-32.md`, `docs/reports/TKT-69.md` | reports |

`scripts/eval.ts` did **not** change. The generic Vitest mapping (`VITEST_CASES` includes `EVAL-020`, and `vitestFileStatus(vf, "eval-020")` at ~l.626) picked the file up by name, as F1-5 says.

## 2. The test: what each part does
1. It spawns `pnpm exec tsx scripts/tokens-check.ts`. Stdout must match `/^13\/13 tokens round-trip OK/m` and the exit code must be 0.
2. It parses `^\s*--color-([a-z0-9-]+)\s*:` from `app/globals.css`. The result must be exactly 13 entries, equal as a set to the 13 paper names. That catches a 14th token, a missing one, or a duplicate.
3. **Literal scan** over `app/**`, `components/**` and `lib/**` (`.ts/.tsx/.css`), excluding only `app/globals.css` and `lib/og.tsx`, must return 0 hits. Scanning `lib/**` is TC-123 step 4: `og.tsx` is the only `lib/` file allowed a literal. The regex is the S69.07 one widened to `rgba?|hsla?`, because `\b(rgb|hsl)\(` alone lets `rgba(` through. That widening adds no hits in scanned files: the only `rgba(` uses are in `globals.css` (clay shadows) and `og.tsx`.
4. **Retired-name scan** over `app/**`, `components/**` and `lib/**` must return 0 hits. It has two parts:
   - The S69.04 utility regex, with prefix-anchoring, the `(?<![\w-])` lookbehind (variants pass) and the `/opacity` lookahead. It adds the two gaps TSK-30 found: the `divide` prefix and `;` in the lookahead.
   - `var(--color-<retired>` (with or without a fallback) and `--color-<retired>:`.
5. **Positive control.** The same `scanLiterals`/`scanRetired` functions run over the fixture and must return exactly `#FAF9FF, oklch(, text-ink-3, bg-lavender (from hover:bg-lavender/30), var(--color-accent`, which is **5 hits** (TC-123 expects 5). Every `HIT` line must be caught and no `DECOY` line may be. The decoys are `bg-white text-white`, `tone="mint"`, the paper names with retired stems (`text-ink-soft bg-paper-2 text-navy-2`), `// see React #185` and `/* … #ABCDEF … */`.
- 5b. The stripper removes `//` and `/* */` comments, keeps a string holding `https://`, and still sees a literal after it on the same line. Line count is preserved. `rgba(`/`hsla(` are caught.

### Decisions
- **Comment stripping before the literal scan (the `React #185` false positive).** The hex regex matched two comments: `components/navigation/Header.tsx:17` and `lib/motion.ts:141` (the brief knew about Header; `lib/motion.ts` turned up once `lib/**` was scanned). A comment is not a colour. The fix is to blank out comments while keeping string literals and newlines, so reported line numbers stay accurate. **Measured:** across the whole scanned tree, stripping removes exactly those 2 hits and changes no other file's count (`strip-diff.mjs` in scratch). `Header.tsx` was not edited. The path allow-list is still just `globals.css` + `lib/og.tsx`. The stripper's known limits are documented in the test: a bare `//` in JSX text or in a regex literal would blank the rest of that line. If that ever hides a real literal, the fix is a real tokenizer.
- **The retired-name scan is not comment-stripped.** A stale token name in a comment is still dead code (EVAL-020 also serves as TKT-89's gate), and this regex has no false-positive source in comments. The tree currently has 0 hits.
- **English-word allow-list: none.** The regex is prefix-anchored, so copy words, tone prop values (`tone="mint"`, F1-11) and paper names with a retired stem cannot match. The fixture decoys prove this, and the test comment explains it.

## 3. Gates
| Gate | Result |
|---|---|
| `pnpm test -- eval-020` / `vitest run eval-020` | **6/6 passed** |
| Mutation: `className="sr-only text-ink"` on `components/common/CopyButton.tsx:106` | **FAIL, as it should.** `× (4) zero retired clay token names …`, reporting `"components/common/CopyButton.tsx:106 [retired-utility] text-ink"` (1 failed, 5 passed, exit 1) |
| Revert | `git checkout -- components/common/CopyButton.tsx` gives an empty `git diff --stat`, and the re-run is 6/6 passed |
| `pnpm eval --only EVAL-020 --skip-build` | exit 0. `evals/results/eval-run-0.2.0-5ea0ca4.json` contains `{"id":"EVAL-020","priority":"high","category":"design","status":"PASS","details":"vitest eval-020 pass","artifacts":[".eval/vitest.json"]}`. Totals: 1 pass · 0 fail · 21 skip. `criticalFailures: []` |
| `pnpm typecheck` | exit 0 (after one fix: an `lines[i]` index needed `?? ""` under `noUncheckedIndexedAccess`) |
| `pnpm lint` | exit 0 |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` | 44 files passed, 1 skipped · **322 passed**, 2 skipped. That is 316 + 6 new tests |
| `pnpm build` | exit 0 · all routes static (13) |
| `pnpm test:e2e` (full) | see §4 |
| `bundle-budget --route / --json` | `firstLoadJsGzipKb` **194.1** (raw 625.7, 10 chunks), unchanged |

The run JSON (`evals/results/eval-run-0.2.0-5ea0ca4.json`) is **not committed**. `.gitignore:19` ignores `evals/results/eval-run-0.2.0-*.json`, and this is a partial `--only` run on a dirty tree anyway. The file stays on disk.

## 4. e2e
`pnpm test:e2e` ran the full suite: 4 projects, a fresh `webServer` on the new build, and nothing listening on :3000 beforehand. Result: **691 passed · 19 failed · 802 skipped** (10.4 min). These are the same totals as TSK-31.

**All 19 failures are pre-existing.** The run index and `line:col` were stripped from the failure titles, and the normalized list was compared with TSK-31's `tsk31-fails.norm` using `comm -3`, which printed **0 lines**. It is the same 19 tests: `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, and `tracer.spec` AVATAR_ALT ×4 (the M-008 debris; TSK-30 §4a proved them on `1a3422f`). TSK-32 adds no Playwright spec and changes no runtime code, so none of these can come from this task. The TSK-31 font guard (`smoke.spec.ts` "fonts are self-hosted …") passed at w1440.

**No test deleted:** `git diff --stat main..HEAD -- tests` lists 11 files, all modified with 0 deletions. `git log --diff-filter=D --name-only 1a3422f..HEAD -- tests` is empty. The e2e run's `docs/screenshots/**` churn was restored with `git checkout -- docs/screenshots`.

## 5. Evidence (scratch)
`/Volumes/E Drive/Dev/.scratch/m009/tsk32/` holds: `unit-green.log`, `unit-mutation.log`, `mutation.diff`, `eval-020.log`, `eval-020-case.txt`, `gate-{typecheck,lint,tokens,test,build,e2e}.log`, `budget-after.json`, `strip-diff.mjs`.
