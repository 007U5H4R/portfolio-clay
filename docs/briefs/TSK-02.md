# Implementer brief — TSK-02 · Avatar asset pipeline (M-001 / TKT-01)

Fresh implementer. Execute **TSK-02 only** (steps S02.01–S02.04). Model tier: standard. TSK-01 is done and committed; the repo scaffold, `lib/site.ts`, `scripts/`, and E-Drive tooling all exist. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-001-tracer`. Do NOT touch `main`, `backlog/`, `docs/ledger.md`, or the sibling `portfolio/` project.

## Read first
- `technical-plan.md` §B → **TSK-02 steps S02.01–S02.04** (lines ~482–485) — *Files / Contract / Gate* are authoritative.
- `technical-plan.md` §A7 (media pipeline) for the exact sharp output spec (sizes, quality ladder, formats).
- Inputs already present: `content/media/avatar/avatar-cutout.png` (alpha cutout — the source), `content/media/avatar/avatar-source.png`, `content/media/avatar/candidates/`.

## Steps
- **S02.01** Write `scripts/avatar.ts` (sharp). Reads `content/media/avatar/avatar-cutout.png` → writes `public/avatar/{avatar.webp (long edge 1800, ≤300 kB, alpha), avatar@2x.webp, avatar-poster.webp (flattened on #FAF9FF, 1200×1500), avatar-blur.txt}`. Prints each path + bytes; quality ladder 82→78→74; exit 1 if `avatar.webp` > 307200 bytes after the ladder. Support an `--erode 1` option (1px alpha erosion) for later halo fixes. **Gate:** `pnpm media:avatar` lists 4 files; `stat -f %z public/avatar/avatar.webp` ≤ 307200; sharp metadata shows `hasAlpha:true` and width or height ≥1600. Run this and paste the output.
- **S02.02** Write `tests/e2e/avatar-edge.spec.ts` (tag `@manual-shot`): renders `avatar.webp` on a sky→lavender gradient at 1440, `deviceScaleFactor:2`, clips a 400×400 region around the hair/beard boundary → `docs/screenshots/tracer/avatar-edge@2x.png`. **DO NOT run this spec** — Chromium is not installed until TSK-07/S07.02. Just author the spec file so it is ready. Note in your report that the edge-shot + halo judgment is deferred to TSK-07 / the TKT-02 visual gate (orchestrator will eyeball it and rerun `scripts/avatar.ts --erode 1` if there is a halo).
- **S02.03** Append a provenance block to `content/media/avatar/candidates/README.md` (create the file if absent): source file, `scripts/avatar.ts` version, sharp version, output sizes, date (2026-09-15), and the line "no paid tool calls — background removal already existed (S4 spend rule respected)". **Gate:** `git diff` shows one appended block; `shasum content/media/avatar/avatar-source.png` is unchanged before/after (record both).
- **S02.04** Add `avatarAlt: 'Clay illustration of Tushar Pathak at a laptop'` to `lib/site.ts` (the ONLY place this alt string lives — EVAL-013 alt rule). **Gate:** `grep -rn "Clay illustration of Tushar" app components lib | wc -l` → `1`.

## Rules
- Everything on E Drive; no writes to the internal disk. Follow the plan verbatim; no extra files or features.
- If a gate genuinely cannot pass (e.g. the cutout is missing an alpha channel, or the ≤300 kB target is impossible at the lowest quality without visible degradation), STOP and report the breaker (command + output + the actual byte size achieved) rather than shipping a broken asset or an oversized file.

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test` green (no `pnpm build` needed unless you changed app code — you should not have; `lib/site.ts` change is covered by typecheck/test).
2. Commit on `m-001-tracer`: `feat(tracer): TSK-02 avatar asset pipeline` with the `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer. One commit.
3. Write `docs/reports/TSK-02.md`: per-step done/deferred with gate output; the 4 asset byte sizes; sharp version; the deferred S02.02 note; `git diff --stat`.
4. Final 5-line summary: steps done, gate numbers (esp. avatar.webp bytes + hasAlpha + dims), blockers, deviations, commit SHA.
