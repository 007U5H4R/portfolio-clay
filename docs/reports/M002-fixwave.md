# M002-fixwave report — EXE-7 EVAL-008 font floor + TKT-08 resume PII test infra

**Status:** Both parts green, committed separately on `m-002-foundations`. TKT-08 stays BLOCKED (no PDF committed, `resumeAvailable` unchanged) — this wave only built its test infra.

---

## Part A — EXE-7 / EVAL-008 font-floor fixes

**Decision governing this work:** `decisions.md` EXE-7 — the 14px `--text-caption` floor governs CONTENT/reading text; small non-content brand micro-labels get a documented `data-micro-label` exception (≥12px + AA contrast), mirroring the `data-inline-link` WCAG 2.5.8 exception TKT-04 established.

### Before → after

| Finding | Before | After |
|---|---|---|
| `FloatingTiles` tile one-liner `copy` | `text-[0.75rem]` (12px) — CONTENT below the floor | `text-[length:var(--text-caption)]` (14px token) |
| Header wordmark subtitle ("Senior Product Manager") | 12px, no exception marker | still 12px, now `data-micro-label` (ink-3 on bg ≈ 4.8:1, AA-safe) |
| Header "TP" monogram | 13px, `aria-hidden`, no exception marker — would still trip the un-fixme'd sweep | still 13px, now `data-micro-label` (ink on the utility tile, wide AA margin) — this element wasn't named in the brief but is the same class of decorative brand label EXE-7's "and similar decorative brand labels" language covers, and the un-fixme'd sweep walks all visible text nodes regardless of `aria-hidden` |
| `/contact` "email me" | inline `<a>`, 80×26 (h<44), not `data-inline-link` | a real `ClayButton` (`min-h-11 min-w-11`) on its own line below the sentence, still a working `mailto:` link |
| `tests/e2e/eval-008.spec.ts` 44px sweep | excluded `/contact`, one `test.fixme` for it | runs on every route incl. `/contact`, no fixme |
| `tests/e2e/eval-008.spec.ts` 14px sweep | one `test.fixme`, no micro-label concept | live `test`, encodes: content text must be ≥14px; `[data-micro-label]` elements are exempt from 14px but must be ≥12px **and** pass WCAG AA contrast (≥4.5:1) against their resolved background, computed via an off-screen `<canvas>` (`fillStyle` parses any CSS color function — rgb/oklch/hsl — sidestepping `getComputedStyle` serialization differences) |

### Gate A evidence
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green (117 unit tests passed at this point, before Part B added the 118th/skipped).
- `pnpm tokens:check` → `13/13 tokens round-trip OK`.
- `pnpm test:e2e --grep @EVAL-008` → **44 passed, 0 failed**, no `fixme`/`skip` entries left. Includes 4 runs (one per viewport: 390/768/1024/1440) of the un-fixme'd font-floor assertion and 4 routes × 4 viewports of the un-fixme'd `/contact` 44px-target assertion — all green.
- No-overflow assertions (all four routes, all four viewports) passed after the tile-copy font bump, confirming the layout still fits at 390/1024/1440 without a manual screenshot pass.

**Commit:** `f6268df` — `fix(m002): EVAL-008 font floor — tile copy 14px, micro-label exception, contact target (EXE-7)`

---

## Part B — TKT-08 S08r.01 resume PII test infra

Added `tests/unit/resume-pii.test.ts` per `technical-plan.md` §B TKT-08 S08r.01. No PDF was created; `site.resumeAvailable` is untouched (`false`).

**Behaviour matrix implemented:**
- file absent + `resumeAvailable=false` (today's real state) → **SKIP, loudly** (reason baked into the test title, visible in any reporter).
- file absent + `resumeAvailable=true` → **FAIL** (verified by temporarily flipping the flag locally, confirming the FAIL, then reverting — `git diff lib/site.ts` is empty, nothing committed).
- file present → runs `pdftotext -layout` via `spawnSync` (fails **closed**, not skipped, if the binary can't be found) and asserts: no DOB pattern, no `+91`/10-digit phone, no street-address keywords (`Road|Street|Nagar|Layout|Apartment|Flat No`), contains `429867`, does not contain `044152784`, and contains `site.title` ("Senior Product Manager") or `decisions.md` records an `EXE-` block mentioning "resume title".

**Verification against a synthetic scratch PDF** (built with `cupsfilter`, never committed, immediately deleted from `/Volumes/E Drive/Dev/.scratch/portfolio-clay/` after the check): a fixture containing a DOB, a phone number, "Flat No 12, MG Road", both `429867` and `044152784` correctly produced **4 failing assertions** (DOB, phone, street keyword, redacted-marker) and **2 passing assertions** (required marker present, title present) — confirming every detection rule fires as specified.

### Gate B evidence — real repo state (no PDF, flag false)
```
$ pnpm test -t resume-pii
✓ resume PII gate (TKT-08 S08r.01) > SKIP: public/resume.pdf absent and
  site.resumeAvailable=false — TKT-08 blocked on Tushar's sanitised export;
  no PDF is committed and none should be created to satisfy this test
Test Files  1 skipped (1)
     Tests  1 skipped (1)
```
- `pnpm typecheck` / `pnpm lint` — both green.
- Full `pnpm test` — 117 passed, 1 skipped (this test), 24→25 files.

**Commit:** `0f9c301` — `feat(m002): TKT-08 resume PII test infra (S08r.01)`

---

## Summary
- Part A: EVAL-008 fully green, the two previously-`fixme`'d assertions now run and pass.
- Part B: resume PII test skips loudly on the current (no-PDF, flag-false) state; FAIL and file-present branches verified locally without committing any PII or touching `resumeAvailable`.
- `pnpm tokens:check`: 13/13.
- Blockers: TKT-08 remains BLOCKED — needs Tushar's sanitised resume PDF before it can close.
- Commits: `f6268df` (Part A), `0f9c301` (Part B).
