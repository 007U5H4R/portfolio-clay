# TSK-36 report — illustration assets into the repo + `manifest.ts` + provenance `README.md` + `eval-021.test.ts`

**Ticket:** TSK-36 (`TASK-68.1`) · parent TKT-73 (`TASK-68`) · M-009 · P0 · sp:2
**Branch:** `m-009-redesign` (verified before work, never `main`, not pushed)

## 1. File table

| Path | Bytes | sha256 / quality | Source |
|---|---|---|---|
| `public/media/illustrations/hero-animation.webm` | 175,761 | sha256 `4c9e6de…35db` — **matches** source | `Portfolio-illustration/animation/export/hero-animation.webm` (byte-exact `cp`) |
| `public/media/illustrations/hero-animation.mp4` | 312,137 | sha256 `c524d82…9701` — **matches** source | `Portfolio-illustration/animation/export/hero-animation.mp4` (byte-exact `cp`) |
| `public/media/illustrations/hero-poster.webp` | 86,800 | sha256 `f1eb160…c777b14` — **matches** source | `Portfolio-illustration/animation/export/hero-poster.webp` (byte-exact `cp`) |
| `content/media/illustrations/hero-desk.webp` | 86,800 | sha256 `f1eb160…c777b14` — **matches** `hero-poster.webp` (E-18) | same source file, mirrored per S73.01 |
| `content/media/illustrations/scene-work.jpg` | 300,938 | quality 82 (no step-down) | `illustrations/scenes/scene-work.png` re-encoded (sharp, mozjpeg, long edge 2048) |
| `content/media/illustrations/scene-casestudy.jpg` | 437,320 | quality 82 | `illustrations/scenes/scene-casestudy.png` re-encoded |
| `content/media/illustrations/scene-about.jpg` | 350,979 | quality 82 | `illustrations/scenes/scene-about.png` re-encoded |
| `content/media/illustrations/scene-thinking.jpg` | 516,249 | quality 82 | `illustrations/scenes/scene-thinking.png` re-encoded |
| `content/media/illustrations/scene-playground.jpg` | 404,203 | quality 82 | `illustrations/scenes/scene-playground.png` re-encoded |
| `content/media/illustrations/scene-contact.jpg` | 431,849 | quality 82 | `illustrations/scenes/scene-contact.png` re-encoded |
| `content/media/illustrations/reference/character-sheet-b.jpg` | 536,725 | quality 90 (no step-down) | `illustrations/character-sheet/character-ref-LOCKED.png` re-encoded (no long-edge cap — reference only) |

`scene-work.png` was present on disk (source master exists), so the mockup JPEG fallback in the
brief was not needed. No scene needed a quality step-down — all six landed under the 614,400-byte
cap on the first pass at quality 82.

## 2. Manifest + accessor + README

- `content/media/illustrations/manifest.ts` — nine entries filled with `file`/`publicSrc`/`width`/`height`; alts unchanged (byte-identical to the TSK-34 stub and Design.md §6.3). **Deviation from the stub's `width`/`height`:** `scene-thinking` is 2048×1529 (not 2336×1744) and `scene-contact` is 1638×2048 (not 1792×2240) — the stub used the *master PNG's* pixel size, but the master's long edge (2336 / 2240) scales to 2048 under the re-encode contract, so the *shipped* rendition's dimensions differ. Recorded in the manifest's header comment.
- `lib/illustrations.ts` — replaced the TSK-34 stub import path with static imports of the six scene JPEGs (`sceneImage(id)` returns `StaticImageData` for `next/image`); `illustration()`/`ILLUSTRATION_IDS` unchanged. `hero-desk`/`hero-clip` are served via `publicSrc` (as-is), not static-imported, per Design.md §6.1.
- `content/media/illustrations/README.md` — nine rows, §6.2 columns (id · file · kind · model · reference media ids · prompt summary · generated · credits spent · used on) plus a `sha256` column for the two byte-exactness-contract assets; a re-encoding record table; the Stage-8 manual-checklist pointer.

## 3. Gate outputs

- `shasum -a 256`: all three public files match their `animation/export/` sources exactly (table above).
- `stat -f %z` caps: webm 175,761 ≤ 204,800 · mp4 312,137 ≤ 358,400 · poster 86,800 ≤ 122,880 · all six scenes ≤ 614,400. Pass.
- `sharp().metadata()` on the poster: **1280×684**. Pass.
- `pnpm exec tsx -e '…ILLUSTRATIONS.length'` → **9**. Pass.
- README has one row per manifest id (9/9), verified by `eval-021.test.ts` rule 2.
- `pnpm test -- eval-021` → **6/6 passed** (real tree 0 findings; both one-sided fixtures ≥ 1 finding each: `extra-file` → `orphan-file`; `missing-file` → `orphan-entry-file`; manifest-id/count check; `publicSrc` existence; `hero-desk.webp`/`hero-poster.webp` sha256 equality).
- `pnpm eval --only EVAL-021 --skip-build` → wrote `evals/results/eval-run-0.2.0-9847b1c.json`; case row:
  `{"id":"EVAL-021","priority":"high","category":"content-integrity","status":"PASS","details":"vitest eval-021 pass; automated scope: provenance, alt-naming and forbidden-string checks; the 'depicts no evidence' checklist is manual","artifacts":[".eval/vitest.json"]}`
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` — all green. `pnpm test`: 46 files / 422 tests passed, 1 file / 2 tests skipped (pre-existing, unrelated to this task). `pnpm build`: `all routes static (13)`.
- Added an EVAL-021 section to `docs/eval.md` (parts 1–6, `check()` contract, commands) and added EVAL-021 to the Vitest row of the layer table.
- **`DEFERRED_SPECS` check:** confirmed EVAL-021 is **not** listed in `scripts/eval-cases.ts` `DEFERRED_SPECS` — only `EVAL-019` is deferred there (hero, TSK-37's scope). EVAL-021 is a Vitest case (matched by `scripts/eval.ts`'s generic `VITEST_CASES` file-name mapping), not a Playwright `@EVAL` tag, so it was never subject to `--check-specs`'s tag requirement in the first place. `pnpm exec tsx scripts/eval-cases.ts --check-specs` → `22 cases OK · 18 automated · 4 manual` / `spec coverage OK · 10 Playwright-automated ids tagged · deferred: EVAL-019 (…)`. `docs/briefs`/`scripts/eval-cases.ts`'s `DEFERRED_SPECS` block was **not** touched by this task.

## 4. Scope note

`git status --short` before staging showed only files under `content/media/illustrations/**`,
`public/media/illustrations/**`, `lib/illustrations.ts`, `tests/unit/eval-021.test.ts`,
`tests/fixtures/illustrations-onesided/**`, and `docs/eval.md` — no `docs/ledger.md`,
`docs/briefs/*`, or `backlog/**` changes. Staged and committed explicit paths only.

## 5. Commit

`feat(illustrations): shipped renditions, manifest, provenance + EVAL-021 (TSK-36)` — SHA recorded
after commit (see chat reply).
