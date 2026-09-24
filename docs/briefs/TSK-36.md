# Brief — TSK-36 · Illustration assets into the repo + `manifest.ts` + provenance `README.md` + `eval-021.test.ts`

**Ticket:** TSK-36 (Backlog `TASK-68.1`) · parent **TKT-73** (`TASK-68`) · M-009 · Task · P0 · sp:2 · **Depends on:** TKT-69 (done), TSK-34 (done — the manifest **stub** + `lib/illustrations.ts` accessor exist; you fill them).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** cheap (Sonnet 5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Bring the shipped illustration renditions into the repo with provenance, make the manifest the single source of `src`/`alt`, and prove it both ways with EVAL-021.

## Read first
1. `technical-plan.md` lines **864** (F1-9: `public/media/` doesn't exist; schema regex), **879** (F2 illustrations), **945–948** (S73.01–S73.04 — your steps + gates; follow exactly), E-17/E-18 at **1123–1124**.
2. `Design.md` **§6.1** (manifest type + nine ids + `usedOn`), **§6.2** (README columns), **§6.3** (exact alt strings — byte-identical).
3. `tickets.md` lines **1110** (TKT-73 AC 1), **1122–1125** (TSK-36).
4. `test-cases.md` **TC-138** and **TC-142**.
5. `docs/redesign-mockups/m-009/README.md` (source paths); existing `lib/illustrations.ts` + `content/media/illustrations/manifest.ts` (stub from TSK-34); `scripts/forbidden-strings.ts` (`contentForbiddenHits`, `PII_PATTERNS`).

## Sources (on disk, outside the repo — read-only)
- Byte-exact copies: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/animation/export/{hero-animation.webm,hero-animation.mp4,hero-poster.webp}` → `public/media/illustrations/`; the same `hero-poster.webp` → `content/media/illustrations/hero-desk.webp`.
- Scenes: `…/Portfolio-illustration/illustrations/scenes/scene-{work,casestudy,about,thinking,playground,contact}.png` → re-encode with `sharp` (`jpeg({ quality: 82, mozjpeg: true })`, long edge 2048) → `content/media/illustrations/scene-*.jpg`, each ≤ 614400 bytes (lower quality in steps of 4 if one is over; record the final quality per file). (`scene-work.png` may be missing — if so use the mockup JPEG `docs/redesign-mockups/m-009/assets/scene-work.jpg` re-encoded the same way; say which.)
- Reference: `…/illustrations/character-sheet/character-ref-LOCKED.png` → `content/media/illustrations/reference/character-sheet-b.jpg` ≤ 1.5 MB.
- Do the re-encode with a throwaway script in `/Volumes/E Drive/Dev/.scratch/m009/` (not committed) or a `pnpm exec tsx -e` one-liner.

## Gates
`shasum` of the three public files == sources; `stat -f %z` caps (webm ≤ 204800, mp4 ≤ 358400, poster ≤ 122880, scenes ≤ 614400); sharp `metadata()` 1280×684 for the poster; manifest length 9 via the tsx one-liner in S73.02; README has one row per id; `pnpm test -- eval-021` green **and** each one-sided fixture yields ≥ 1 finding; `pnpm eval --only EVAL-021 --skip-build` → `PASS` (quote the JSON line); `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`. Add an EVAL-021 section to `docs/eval.md`. Do **not** touch `scripts/eval-cases.ts` `DEFERRED_SPECS` for EVAL-019 (TSK-37); EVAL-021 is a Vitest case — confirm whether it is listed in `DEFERRED_SPECS` at all and report.

## Constraints
No new Higgsfield/image generation (no spend). Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only (binary assets included); never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. One commit: `feat(illustrations): shipped renditions, manifest, provenance + EVAL-021 (TSK-36)` + trailer.

## Output — `docs/reports/TSK-36.md` (commit it)
File table (path · bytes · sha/quality · source); gate outputs; commit SHA. Final chat reply ≤ 8 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
