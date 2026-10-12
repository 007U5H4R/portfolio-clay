# TASK-199 — Restructure the Gummy Lab pinball table

**Branch:** `m013/pinball-layout` (from `main` + the brief) · **Brief:** `docs/briefs/TASK-199.md` · **Tushar's annotated table:** `docs/redesign-mockups/m-013/pinball-layout-annotated.png`
Screenshots: `docs/screenshots/m-013/task-199/` (23 files, staged with `scripts/lab-screenshots-199.ts`).

## What changed

- **Black hole is inside the table.** It is now a sensor circle on the playfield (top-left on the desktop table, at about (−3.9, 5.35)), not a pocket cut into the cabinet's left wall. The gummy touching it spirals in, YOU_REALLY_FOUND_IT unlocks, and the game leaves through the existing `portalOnce` → `requestExit("portal")` path. The outside-the-frame placement, the wall opening and its back plate are gone (`wallBoxes()` has a plain left wall again). The "← Back to Portfolio" label and link are kept next to the hole: still a real focusable link named "Back to Portfolio", still exiting. The hole is painted on the board (below the gummy, so it passes in front and then spirals in) and swells while the gummy goes in. The camera frame no longer reserves an empty margin on the left (`minX` −hw−1.45 → −hw−0.65), so the machine is a little larger on screen.
- **Tighter bumper diamond, four distinct bumpers.** New pure module `lib/lab/bumpers.ts` (kick maths + which extras fire), used by `Arena.tsx`, the headless sim and the tests.

  | Type | Where (desktop) | Kick (out speed, u/s) | Extra | Look (tokens) |
  |---|---|---|---|---|
  | **Pop** | bottom | max(7.5, 0.8·v + 3) (the old kick) | none | round cream dome, five-point star, amber ring |
  | **Jet** | top | max(10.5, 0.9·v + 4.5) | ring flash (thin additive ring that spreads from the cap, then fades; a lit/unlit ring under reduced motion) | rust octagon cap, eight-point burst, magenta ring |
  | **Thumper** | left | max(13, 1.0·v + 6) | table shake = the Nudge's `rt.shake` 0.55 (not set under reduced motion; the camera also drops it) | steel square cap, ring mark, thick rim, cyan ring |
  | **Turbo** | right | max(9.5, 1.3·v + 4): leaves faster than it arrived | trail burst: `TrailBuffer.burst(0.7 s)` lengthens the live samples once and the new ones for 0.7 s; same fixed arrays, nothing allocated, off under reduced motion | sage triangle cap, two chevrons, pale ring |

  All four score 100 (see calls). Every kick is capped at the 28 u/s speed limit. Unit tests pin each impulse (`tests/unit/lab-bumpers.test.ts`).
- **Spinner** moved from the top to just under the diamond, centred (x 0, y −0.55, bar 1.2 long, turns from phase 1 as before).
- **AI / DESIGN / PRODUCT / BUILD bricks removed**, labels included, with everything that only existed for them: `TargetSpec`, `Target` component, `TARGET_POINTS`, `hitTarget`, the target scoring path, **TP MODE** (it needed all four targets), the TP emblem and "· TP" combo label, the `tpGlow` environment knob, the **Product sense** achievement, "Targets hit" on the end card, `hit-rules` use, and "targets" in the controls copy ("bumpers & slingshots" now). The score/combo store, farming rule and power-ups are untouched.
- **Two unlabelled trapezoidal slingshots** on the side walls at mid-height (desktop y 3.0, left on the left wall, right against the lane's divider wall). Long edge on the wall, short vertical face toward the table; the upper edge slopes down toward the table and the lower one up away from the wall, so nothing can rest against the wall. Same `Sling` component as the flipper triangles (now generalised to any convex polygon), kick maths in `lib/lab/slings.ts`, 30 points, lit strip flashes and the trim presses in on a hit. They are green cardstock so they read against the orange cabinet. The low divider-top wedge rail (`DIV-CAP`) was removed: the right slingshot covers that spot.
- **Phone table** gets the same changes: two bumpers (pop + turbo), both slingshots (smaller), the hole (see calls), no spinner (it never had one).
- **Kept as is:** lane gate, Nudge, StallWatch, plunger, drain, audio, flipper slingshots, ramps, pad. No new infinite CSS animations; the ring flash and trail burst reuse pooled objects; reduced motion works (checked by unit tests and the existing eval-030 reduced-motion tests).

## Headless sim: 50 random launches per table

`tests/unit/lab-pinball-sim.test.ts`. Each launch fires the plunger at a random force in [21, 27.5] and touches nothing else (no flippers), with StallWatch on as in the game; it ends when the gummy reaches the flipper zone, falls into the hole, or after 45 s. Same seeds before and after (199 desktop, 991 phone); "before" was measured on the unmodified branch head.

| | Reaches flippers | Black hole | Neither (45 s) | Longest stillness |
|---|---|---|---|---|
| Desktop, before | 46/50 (92 %) | 3 | 1 | 0.92 s |
| **Desktop, after** | **45/50 (90 %)** | 4 | 1 | **0.33 s** |
| Desktop, after, spinner turning | 45/50 | 4 | 1 | 0.33 s |
| Phone, before | 41/50 (82 %) | 7 | 2 | 1.80 s |
| **Phone, after** | **42/50 (84 %)** | 8 | 0 | **0.27 s** |

- **Reach the flippers ≥ 95 %:** flippers *or* the black hole is 49/50 = 98 % (desktop) and 50/50 = 100 % (phone). Counting only the flippers it is 90 % and 84 %, which is the same as before: the rest of the launches are the hole, which ends the run on purpose. I judged a launch that exits through the hole as reaching its goal; if you want flippers-only ≥ 95 % the hole would have to be nearly unreachable, which contradicts "reachable". The one desktop "neither" is a gummy bouncing between the left ramp and the table for 45 s; the before run also had one launch that never reached the flippers (see limitations).
- **No stillness longer than 2 s:** longest 0.33 s / 0.27 s (it was 0.92 s / 1.80 s).
- **Black-hole reachability** (`lab-portal-sim`), sweeping 131 plunger powers (21.0 → 27.5 in 0.05 steps): desktop 11/131 (8.4 %, was 9/131 = 6.9 %), phone 11/131 (8.4 %, was 7/131 = 5.3 %). On both tables a launch near full power reaches it, and so does a flipper shot (found by a scan of drops onto the swinging left flipper). It is a skill shot, not a constant: at most a fifth of random launches, asserted.
- **No wedge** (`lab-wedge`): 207 desktop and 189 phone drops (150 random + drops aimed above, beside and between every bumper and at both side slingshots) with the anti-stall **off**: none rests anywhere near the new parts. One desktop drop rests at the **old** ramp pocket (the left ramp's outer end against the in-lane sling, (−4.05, −0.03)); that pocket existed before (the TASK-185 follow-up reports it) and StallWatch frees it. With the anti-stall **on**, none of the drops is stuck after 40 s on either table. Before this change the same scan found wedges on both tables (≥ 3 each); StallWatch and Nudge are now tested on a deliberately too-narrow gap of two test-only posts, because the real table has no wedge to free.

## Judgement calls (nobody was available to ask)

1. **Phone black hole is on the left wall, low (about (−2.3, 0.8)), not top-left.** The phone table is 5.4 wide; I scanned every position along the top and left wall: any spot there is reached by 40–90 % of random launches (a launch skims the ceiling to the left wall and slides down it), which is not a skill shot. Low on the left wall, below the left slingshot, it is reached by 8–16 %, like before. The desktop hole is exactly where Tushar drew it. The label goes above the hole on the phone table so it does not sit on the start plaque.
2. **The diamond is not as tight as the sketch.** In the screenshot the left and right circles sit ~0.41 u (edge to edge) from the top and bottom ones; the brief's own binding rule is ≥ 1.5 gummy widths (0.975 u). The tightest layout that keeps the rule is a square diamond ±1.55 around (0, 2.9): adjacent gaps 1.03, top-to-bottom 1.94. Left and right moved in from ±2.0 to ±1.55; the whole diamond is smaller (width 4.0 → 3.1, area 5.4 → 4.8). The top bumper moved *up* (y 3.95 → 4.45) and the bottom one slightly up (1.25 → 1.35): a square diamond that keeps the clearance cannot also keep the old 2.7 height. Raising the top one has a useful side effect: the gap under the ceiling is 1.27 (a gummy is 0.98 tall, asserted > 1.1), so only a precisely aimed shot threads over it to the hole. With the old height every launch skimming the ceiling reached the top-left (30 % of launches).
3. **Bumper types:** top jet, left thumper, right turbo, bottom pop (the gentlest kick is nearest the flippers). **Phone: pop + turbo** — the two most different (a plain kick and a boost); a thumper's shake and a jet's flash are less useful on a 390 px screen where the whole table already moves in the camera. Phone clearance rule kept: bumpers ≥ 0.975 from each other, the walls and the slingshots (tested).
4. **All four bumpers score 100.** There was no clear reason for one to be worth more; a turbo or thumper worth more would just be the one to farm.
5. **TP MODE and Product sense were removed**, not rewired. The achievements list went 5 → 4. Existing localStorage entries for PRODUCT_SENSE are ignored (the list only drives toasts).
6. **Side slingshots lift the gummy a little more than the triangles** (+2.5 u/s vs +1) because their face is vertical: without it a kick drives the gummy flat across the table.
7. **The spinner has no room for the full 1.5 length** under the diamond: 1.2 long, sweep clearance from the bottom bumper 0.61 (asserted > 0.45).
8. **Holding the plunger to MAX reaches the hole on both tables** (it did before too). The highest powers (27.40–27.50) are among the 11 that reach it, and a flipper shot is the other way in; not changed.
9. **Playwright browsers:** this host has Chromium 1194 preinstalled and no download access, and the repo's Playwright wants 1243. I linked the installed build into `~/.cache/ms-playwright` instead of running `playwright install`. The screenshot script forces 8 cores for the desktop sessions (the sandbox reports 4, which selects the simplified arena without the spinner).

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | 0 errors, 2 warnings (both on main: `scripts/lcp-probe.ts`, `tests/e2e/eval-037.spec.ts`) |
| `pnpm tokens:check` | pass (13/13, 13/13 dark, 7/7 + 7/7 material, 69/69 contrast) |
| `ALLOW_DEV_ROUTES=1 pnpm build` | pass, 20 static routes |
| `pnpm test` | **1375 passed, 4 skipped**, 122 files (new: lab-bumpers, lab-slings, lab-pinball-sim, trail burst, wedge/portal/arena/clearance rewrites) |
| Full `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` (w390/768/1024/1440, 4004 tests) | **1994 passed, 25 failed, 1985 skipped** on the first run; after fixing the two lab tests below, all eval-030* specs: **162 passed, 86 skipped, 0 failed** at the four widths |

**The 25 first-run failures:**
- **2 were mine, both in eval-030, both fixed (tests only):** (a) *the black hole is a way in* (w1440) put the gummy a gummy's width and a bit from the sensor; on this host's ~1.5 fps a long frame fits many physics steps and the gummy fell past the hole first. It now starts at the sensor's edge. (b) *the Nudge button recharges* (w390): the parked gummy drained or, with the random nudge lean, wandered into the (now reachable) black hole and left the lab. The Nudge tests now park the gummy on the right, switch the sensor off for the test, and keep the gummy in play. 16/16 repeats pass; the Nudge-key test too.
- **23 are not the lab** and fail identically when re-run alone with `--workers=1` (23 failed / 457 passed): EVAL-008 `/dev/artifacts` ×4 (known, TASK-178); `eval-011-dead-controls` and `playground` live URLs ("fetch failed": no outbound network here); `eval-014`, `media-player` ×2, `portfolio-video` ×10 (YouTube iframes never come up: no network); `fallback-glyphs` ×4 (system font fallback on this host). None of them loads `/lab`, and this branch changes only `lib/lab`, `components/lab`, tests, scripts and docs. EVAL-033 and EVAL-039 did not fail this time.
- Not loosened: no threshold or assertion was relaxed; the 2 lab tests were made robust to frame rate, not weaker.

**eval-030 assertions changed** (all in `tests/e2e/eval-030.spec.ts`): the black-hole link position check (desktop: top-left of the canvas as before; phone: left half, inside the viewport); the "way in" test (aims at the in-table hole instead of the wall opening); the two Nudge tests (open-space parking, sensor off, keep-alive); the title/comments that said "opening in the left wall" and "corner". **Added:** a layout test (four bumper types or pop + turbo, the four slings WL/WR/SL/SR, no `targets` in the arena, hole inside the table, no PRODUCT / BUILD / DESIGN text in the lab). The removed bricks had no eval-030 assertion of their own; nothing tested target scores or TP MODE outside the unit tests, where `lab-engine`, `lab-hud`, `lab-storage`, `lab-controls-copy`, `lab-arena` and `lab-arena-clearance` were updated.

## Screenshots (`docs/screenshots/m-013/task-199/`)

`table-{light,dark}-{1440,390}`, `bumper-{jet,thumper,turbo,pop}-{light,dark}-1440`, `bumper-{pop,turbo}-{light,dark}-390`, `hole-{light,dark}-{1440,390}` (gummy beside the hole, link hovered), `hole-entry-light-1440` (the gummy spiralling in, the achievement toast up), `spinner-{light,dark}-1440` (run clock set to 12 s so phase 1 is live). Staged through `?debug` like the TASK-185 set (software GL runs the lab at ~1.5 fps, so a real hit is over before a frame is drawn): the gummy is fired at the bumper and the shot is taken on the real hit flash.

**Self-grade against the annotated image:** black hole at the top-left inside the table with the label beside it — yes; diamond with left and right moved in — yes, with the clearance caveat in call 2; four bumpers visibly different (round / octagon / square / triangle caps in cream, rust, steel, sage) — yes; spinner just under the diamond, centred — yes; bricks gone and a trapezoid on each wall at mid-height — yes. Caveats: the staged hit frames are 0.7–1 s after the flash, so the jet's ring flash is faint and the turbo's burst shows as a long pink trail behind it; the green slingshots are viewed at the camera's tilt so they look narrower than the sketch's trapezia.

## Limitations

- Not measured on a real GPU or phone: frame rate, draw calls, touch feel of the new slingshots, the shake's feel on a real screen. The only GL here is SwiftShader.
- The spinner is in the sim only as a turning bar (4 of 65 launches touch it); it is not in the screenshots of the phone table because the phone has none.
- The left ramp / flipper-sling pocket at (−4.05, −0.03) is older than this change and still exists (StallWatch frees it, after several nudges). In the sim one desktop launch of 50 is still in play and away from the flippers after 45 s (a gummy bouncing between the left ramp and the table); the before run had one such launch too, though I did not confirm it was the same loop. In the game the flippers and the Nudge button are there.
- A nudged or stuck gummy can now reach the black hole and leave the game: that is the hole being reachable, but a player who nudges near it may exit by accident.
- On the phone table the hole is low on the left wall and the label sits above it; on a very short phone the label may overlap the left slingshot.
- The test runs rewrote about 100 unrelated PNGs under `docs/screenshots/`; they were reverted, not committed. `.eval/` is git-ignored.

## Commits

- `0ee8f43` Move the black hole into the table, add four bumper types and wall slingshots, drop the target bricks (TASK-199)
- `542dd0b` Colour the wall slingshots green, move the hole's label clear of the bumpers, update eval-030 for the new table (TASK-199)
- `59c8012` Add TASK-199 review screenshots and the script that stages them (TASK-199)
- `6ef4f6c` Make the eval-030 black-hole and Nudge tests robust on a slow host (TASK-199)
- this report (committed last)
