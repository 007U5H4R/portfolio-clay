# TASK-198: Gummy Lab paper-machine loading screen

Branch `m013/lab-loader`. Nothing deployed; `main`, `m-009-redesign` and `backlog/` untouched.

## What changed
- `lib/lab/boot.ts`: the boot lifecycle. A pure progress/stage mapper and a tiny external-store tracker, plus `trackFetch`, which streams the GLB and reports the bytes received.
- `components/lab/BootLoader.tsx`, `boot-loader.module.css`, `boot-gears.ts`: the loader (presentation only).
- `components/lab/GameScene.tsx`: three marks. Canvas created, physics world mounted (`PhysicsReady`, rendered only once Rapier's WASM has initialised) and first rendered frame with the physics world present (`FirstFrame`). No physics code changed.
- `components/lab/LabApp.tsx`: the old fire-and-forget GLB warm-up is now `trackFetch`; the loader replaces the "Warming up…" text; `INTRO_READY` now follows the real boot.
- `runtime.ts`/`create-runtime.ts`: `rt.boot`.
- Tests: `tests/unit/lab-boot.test.ts` (11) and `tests/e2e/lab-loader.spec.ts` (6 cases; the 390 px one runs at w390 only).

## How progress is measured (nothing is timer-driven)
Weights: base 5 (the lab chunk is running), GLB bytes 35 (received / content-length), canvas created 10, Rapier WASM + physics world mounted 20, model parsed or failed over to the procedural body 15, first frame with the world 15. 100 only when all are true; every in-flight state is capped at 99. The displayed value is `max(previous, computed)`, so it never goes backwards. Stages are the first incomplete milestone: Loading assets, Building world, Calibrating physics (= Rapier WASM init, the real step), Almost there….

## Judgement calls
1. **Intro now waits for the asset to settle** (reverses TASK-155's "intro never waits on the GLB") because the brief makes GLB loading a progress input and says the bar must not finish ahead of the real state. A failed GLB settles on the procedural body, so it never strands anyone.
2. **Fast loads:** the loader mounts only after 300 ms. A faster boot goes straight to the intro, keeping the previous 500 ms floor.
3. **Finish beat** is 450 ms (250 ms under reduced motion), within the 300-600 ms spec window, and only when the loader was actually visible.
4. **Bar is always determinate.** Unknown GLB size contributes nothing until the request ends; no number is invented.
5. **Failure:** no milestone for 15 s shows "Try again" (reload) beside the existing Back and Escape. WebGL-less devices already use the existing fallback screen.
6. **Art is procedural SVG/CSS** (gears, conveyor, gummy, tag) built from Design.md tokens; no Higgsfield generation, so **0 credits used** (brief allows procedural "where crisper"; it also keeps the lab chunk small and both themes token-driven). The reference's props (lamp, jars, books, sketches, leaves) were left out per the spec's "focused on the machine".
7. Caveat only on the annotation "Preparing the playground…" (`data-decor`, `aria-hidden`). The stage text is in a polite live region, `role=progressbar` has `aria-valuenow`/`valuetext`.
8. Motion: gear turn, fill width and gummy position are all driven by a single `--p` custom property through finite CSS transitions; one-shot hop and fade keyframes. No `infinite`, no rAF, no per-frame allocation. Reduced motion: no rotation, no travel, no hop; fill and percentage update; plain fade.
9. Colour literals replaced by tokens after EVAL-020 flagged them.

## Gates
- `pnpm typecheck`: clean. `pnpm lint`: 0 errors (2 pre-existing warnings). `pnpm tokens:check`: OK.
- `ALLOW_DEV_ROUTES=1 pnpm build`: OK.
- `pnpm test`: 1325 passed, 4 skipped, 0 failed (after the EVAL-020 fix; the first run had that 1 failure, fixed in cf92f30).
- Full `pnpm test:e2e --retries=0`, 4 widths: 2013 passed, 25 failed, 1986 skipped (project-specific skips).
  - Known/pre-existing: EVAL-008 `/dev/artifacts` x4 (TASK-178).
  - Sandbox/environment, none touch the lab: `portfolio-video` x10, `media-player` x2, `eval-014`, `playground` (ENOTFOUND, no outbound network for YouTube/Vercel hosts), `fallback-glyphs` x4 (no system fonts here), `eval-011-dead-controls`, `home-ask-tushky`. Re-run alone at w1440 with `--workers=1`: same failures (network/font), 30 passed.
  - **EVAL-030 "reduced motion draws no light trail…" at w390 failed in the full run** with "null pointer passed to rust" (a freed Rapier body hit by the test's `setTranslation` in `loseRun`). Re-running alone: failed twice right after, then passed 5 of 5 (three on a clean build). It passed 2/2 on `main`. I could not reproduce it deterministically or identify a cause in my change (the body ref is valid at probe time), so treat it as an intermittent race, possibly made likelier by the new boot ordering. Flagged, not hidden.
- EVAL-014 etc. were not re-verified on `main`; they are network-bound.

## Size
Total `.next/static/chunks` JS: 4,357,749 B raw / 1,470,346 B gz before, 4,369,542 / 1,473,936 after (+11.8 kB raw, +3.6 kB gz). `/lab` first-load JS unchanged at 157.7 kB gz (EVAL-027); the loader is in the lazy lab chunk.

## Screenshots
`docs/screenshots/m-013/task-198/{1440,390}-{light,dark}-{0,68,complete}.png`. Staged through `?debug`: the shots hold back real boot milestones on `rt.boot` (via a script-side patch of the debug handle), so the "0" shot reads 5% (base), the "68" shot reads 70% (GLB + canvas + physics, model/frame withheld) and "complete" is the real 100% with the 450 ms finish beat stretched. Those percentages are what the real component showed, not edited. Taken before the final token-only colour tweak (eyes/shine/nose), which is visually near-identical.

## Limitations
- Visual comparison was by eye against the reference; props around the machine were deliberately omitted.
- Theme switch mid-load updates through tokens (CSS), but was not separately exercised in a test.
- Retry is a page reload; a hung load was tested (button appears, Escape exits), a reload-and-succeed path was not.
- The browsers here were Chromium 1194 symlinked in place of the pinned 1243 (download blocked), run with SwiftShader.
