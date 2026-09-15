# TSK-02 report — Avatar asset pipeline (M-001 / TKT-01)

## S02.01 — Export script — DONE
`scripts/avatar.ts` (sharp `0.35.4`) reads `content/media/avatar/avatar-cutout.png` and writes
`public/avatar/{avatar.webp, avatar@2x.webp, avatar-poster.webp, avatar-blur.txt}`, printing each
path + byte count, with the quality ladder 82→78→74 and `exit 1` if `avatar.webp` is still over
307200 bytes after 74. Supports `--erode <px>` (see deviation below) for later halo fixes.

**Gate — `pnpm media:avatar` output:**
```
$ tsx scripts/avatar.ts
public/avatar/avatar.webp — 94680 bytes
public/avatar/avatar@2x.webp — 122444 bytes
public/avatar/avatar-poster.webp — 32162 bytes
public/avatar/avatar-blur.txt — 415 bytes
avatar.ts: avatar.webp final quality 82, 1450×1800, hasAlpha=true
```
- `stat -f %z public/avatar/avatar.webp` → `94680` (≤ 307200 ✓)
- sharp metadata on `avatar.webp`: `hasAlpha: true`, `1450×1800` (height ≥ 1600 ✓), quality 82 —
  passed the ladder on the first attempt, no step-down needed.

## S02.02 — Edge inspection frame — AUTHORED, NOT RUN (deferred to TSK-07)
`tests/e2e/avatar-edge.spec.ts` written, tagged `{ tag: "@manual-shot" }`. Renders `avatar.webp`
(read fresh from `public/avatar/` at test time, base64-inlined) over a `linear-gradient(135deg,
#A8D7FF, #BFA8FF)` (sky→lavender) at viewport 1440×900, `deviceScaleFactor: 2`, in a 480px-wide
frame (matching the `AvatarStage` `lg:` breakpoint size), then clips a 400×400 region
(`x: 445, y: 70`) centred on the head — approximate first-pass coordinates based on the avatar's
actual pixel layout (head ≈ x∈[24,240], y∈[56,185] within the 480px frame), not yet verified
against a real render — to `docs/screenshots/tracer/avatar-edge@2x.png`.

**Not run** — Chromium is not installed until TSK-07/S07.02, per brief instruction. `pnpm typecheck`
and `pnpm lint` both pass on the file (confirms it compiles and satisfies eslint against the
installed `@playwright/test` types), but the screenshot itself does not exist yet and the halo
judgment has not been made. The orchestrator should run
`pnpm test:e2e tests/e2e/avatar-edge.spec.ts` once Chromium is available, eyeball the PNG, and if
a light fringe halo shows, rerun `tsx scripts/avatar.ts --erode 1` (regenerates
`avatar.webp`/`avatar@2x.webp` only, poster/blur unaffected) and re-shoot. The clip box may also
need a small manual nudge once the real render is visible.

## S02.03 — Provenance — DONE
Appended one block to `content/media/avatar/candidates/README.md`: source file (+ sha256), script
version, sharp version, output sizes, date, and the "no paid tool calls" line.

**Gate:**
- `git diff content/media/avatar/candidates/README.md` — one appended block (`## 2026-09-15 —
  avatar asset export (S02.01, TSK-02)`, 6 lines).
- `shasum -a 256 content/media/avatar/avatar-source.png`:
  - before: `0dcb088fe8b25c037bef3639cc939c027b86efdb3f489a22689cec91d1c7e4b2`
  - after: `0dcb088fe8b25c037bef3639cc939c027b86efdb3f489a22689cec91d1c7e4b2` — unchanged ✓

## S02.04 — Alt text constant — DONE
Added `avatarAlt: "Clay illustration of Tushar Pathak at a laptop"` to the `site` object in
`lib/site.ts`.

**Gate:** `grep -rn "Clay illustration of Tushar" app components lib | wc -l` → `1` (the
`components` grep target doesn't exist as a directory yet — that's expected pre-TKT-02's UI work
and produces only a warning, not a match; the count is still exactly 1).

## Deviations from the brief
1. **`--erode` implementation detail (not a scope/contract change).** sharp `0.35.4`'s
   `joinChannel` operator reports `hasAlpha: true` in `metadata()` immediately after joining, but
   silently drops the alpha channel when the pipeline is subsequently encoded to WebP or PNG (a
   sharp/libvips quirk in this version, reproduced independently in a scratch script before
   settling on the fix). Implemented erosion instead by reading the resized image as a raw
   interleaved RGBA buffer, overwriting only the alpha byte of each pixel with the eroded value,
   and re-ingesting that single buffer as raw RGBA — this reliably preserves alpha through
   encoding. Verified both the default path and `--erode 1` independently (see gate output above
   and the byte-size deltas: `--erode 1` produces smaller alpha-diet files as expected — 78088 /
   97416 bytes vs. 94680 / 122444 — with `hasAlpha: true` confirmed on both outputs). Contract
   (files, sizes, quality ladder, CLI flag shape) is unchanged from the brief.
2. **Erosion scope.** `--erode` only affects `avatar.webp` and `avatar@2x.webp` (the two
   alpha-carrying outputs) — `avatar-poster.webp` flattens onto an opaque background regardless,
   so erosion there wouldn't change the halo risk the flag exists to fix.
3. Package.json's `media:avatar` stub was rewired to `tsx scripts/avatar.ts` (was a placeholder
   `exit 1` stub from TSK-01) — required for the S02.01 gate command to run at all; in-scope for
   this ticket per the stub's own comment (`... not yet implemented (TKT-02 / S02.01)`).

No other deviations. `avatar-source.png` was never touched. No paid tool calls were made.

## Finish
- `pnpm typecheck && pnpm lint && pnpm test` — all green (3 unit tests passed; no e2e run, see
  S02.02 above).
- `git diff --stat` (this task's files only):
  ```
   content/media/avatar/candidates/README.md | 6 ++++++
   lib/site.ts                               | 2 ++
   package.json                              | 2 +-
   3 files changed, 9 insertions(+), 1 deletion(-)
  ```
  plus new files: `scripts/avatar.ts`, `public/avatar/{avatar.webp, avatar@2x.webp,
  avatar-poster.webp, avatar-blur.txt}`, `tests/e2e/avatar-edge.spec.ts`.
- Untouched, deliberately not staged: `backlog/pm-dashboard.json` (pre-existing orchestrator
  dirt), `docs/briefs/TSK-02.md`, `docs/briefs/TSK-03.md` (orchestrator files, out of scope).
