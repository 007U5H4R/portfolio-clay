# TASK-185 — The Gummy Lab as a paper-cut pinball machine

**Branch:** `m013/gummy-pinball` · **Spec:** `docs/redesign-mockups/m-013/tushar-2026-10-08/gummy-pinball-spec.md` · **Reference:** `pinball-reference.png`
Screenshots: `docs/screenshots/m-013/task-185/{start,charge,play,bumper,hole}-{light,dark}-{1440,390}.png` (20 files).

## What changed

- **Machine.** The lab is a side-on paper-cut pinball cabinet seen from below (camera tilt), with a painted board, hills and pines, lit tubes, edge shadows, a drain with a danger mouth, a right-hand shooter lane, two slings, four bumpers (plus the RB spinner), four mounted targets, two ramps with a pad, and tapered paper flippers with a cream inlay and a lit edge. Everything is procedural; no new dependencies, no third-party requests.
- **Plunger.** Space charges (`lib/lab/plunger.ts`, `MAX_CHARGE_MS` 1500, force 21 → 27.5). Release applies `mass × force` as an impulse to the real Rapier body inside the fixed step. The spring compresses, the knob trembles, and an 8-lamp power meter with a percentage shows the charge. Touch has a press-and-hold plunger control in the lane.
- **Controls.** Left flipper ←/A/Z, right flipper →/D/M, Space plunger, P pause, Esc exit. `preventDefault` on Space and arrows only while the game is active and never when focus is in a button or link. Touch halves still flip.
- **Scoring.** Targets AI 150, DESIGN 200, PRODUCT 250, BUILD 300; bumpers 100; slings 30. Timer, combo, reset, audio and StallWatch are kept (the lane is exempt from the stall watch while the gummy is in it).
- **Black hole.** The visible exit is now a real focusable link named "Back to Portfolio" over a torn-paper black hole in the top-left corner (swirl, orbiting stars, hover swell), using the same exit path as before.
- **Trail and light.** A fixed-size `TrailBuffer` (56 samples) drives two ribbons (aura + core) rewritten in place; particles are pooled. Neon is a small set derived from tokens. Under reduced motion the trail and particles have capacity 0 and nothing orbits or swirls.
- **Layout.** In play the diorama frame is scaled up so the machine fills the viewport; the HUD and opening geometry rules are preserved.

## §34 final success test (self-grade, from the screenshots)

| Question | Answer | Where to look |
|---|---|---|
| Pinball | **Yes.** Cabinet, shooter lane, flippers, bumpers, slings, targets and drain read at a glance in both themes and sizes. | `start-light-1440`, `start-dark-390` |
| Launcher | **Yes.** Right-side lane with a helix spring, rod, knob, "LAUNCH POWER" meter and a hold-to-charge plaque at the start. | `start-light-390`, `charge-*` |
| Space | **Yes.** Spring visibly compresses and the meter lights as the key is held. | `charge-light-1440`, `charge-dark-390` (78 %) |
| Force | **Yes.** Unit test (charge→force monotonic) and an e2e comparing a short and a long hold: longer = higher launch speed. | `lab-plunger.test.ts`, `eval-030.spec.ts` |
| Flippers | **Yes.** Tapered paper blades with inlay and a lit edge, pivoting at the lower inner corners above the drain. | `play-*-1440` |
| Drain | **Yes.** Danger mouth between the flippers; "DRAINED" banner on loss. | `start-*`, `play-*` |
| Bumpers | **Yes.** Layered paper rings with a star cap and a lit ring that compresses and flashes. | `bumper-*` |
| Targets | **Yes.** Mounted plates with Fraunces labels that set back on a hit. | `start-*`, `bumper-*` |
| Trail | **Mostly yes.** Visible amber core with cyan/magenta edges, fading 100/70/40/15/0. It is softer on the cream table (light theme) than on navy. | `play-light-1440`, `play-dark-1440` |
| Light | **Yes.** Light is tied to speed (trail width, head glow) and impact (flash on bumper/launch), and is capped to a small part of the frame. | `bumper-*`, `play-*` |
| Black hole | **Yes.** Top-left tear with a labelled "Back to Portfolio" link; hover swells it. | `hole-*` |
| Paper | **Yes.** Same cardstock, torn edges, tokens and Fraunces/Inter as the rest of the site. | all |
| Premium | **Yes at this fidelity**, with the limits below. | all |

## Judgement calls

1. **The black hole sits outside the table**, in the cabinet's top-left. The old in-field sensor and its YOU_REALLY_FOUND_IT trigger path are removed; the link is the only exit besides Esc.
2. **Zoomed frame in play.** The diorama frame is scaled in CSS while a game is on so the machine is large.
3. **Ramps moved and narrowed; targets moved up** so shots from the flippers reach them and nothing overlaps the new layout.
4. **Scoring.** Bumpers 100, slings 30 (the brief gave no sling value).
5. **Launch speed.** `force` is the launch vy (the impulse is `mass × force` after zeroing the velocity).
6. **Touch plunger.** An overlay button in the lane; the touch flipper halves were moved off the lane.
7. **Intro keeps the classic Back tab**; the in-play "Back to Portfolio" is the black hole.
8. **The hint only appears after launch.**
9. **Screenshots are staged through `?debug`** (`window.__gummyLab`) because software GL here renders at ~1.5 fps: the plunger charge is set to 78 %, the trail is fed the path a 60 fps run would record, and the bumper frame is taken on the real hit flash. `scripts/lab-screenshots-185.ts` is committed.
10. **Design.md over the spec's hexes.** Colours come from site tokens; neon is derived from them.

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | 0 errors; 1 pre-existing warning (`scripts/lcp-probe.ts`, unused disable directive) |
| `pnpm tokens:check` | pass (13/13, 13/13 dark, 7/7 + 7/7 material, 69/69 contrast) |
| `ALLOW_DEV_ROUTES=1 pnpm build` | pass, 20 static routes |
| `pnpm test` | **1227 passed, 4 skipped**, 110 files |
| Full `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` (w390/768/1024/1440) | **1923 passed, 29 failed, 1912 skipped** |

**New tests:** `lab-plunger.test.ts` (charge→force), `lab-trail.test.ts` (pool never grows), `lab-arena.test.ts` and a pinball scoring block in `lab-engine.test.ts` (targets/bumpers), `lab-gummy-controller.test.ts` (plunger and keys); in `eval-030.spec.ts` the Space charge/release (longer = stronger), black-hole focus and exit, and reduced-motion trail/particles tests.

**The 29 e2e failures, none in the lab:**
- Re-run alone with `--workers=1`: every `eval-030`, `eval-030-remodel` and `eval-023` test **passes** (the Esc-exit at w768 and the system-theme-flip at w1440 had failed only under full-suite load).
- `home-ask-tushky` §24 (w768, w1440): fails alone too — the hero "Ask Tushky" click is intercepted by `section#work-featured`. This is the home page, which this branch does not touch (`git diff` has no changes outside `lib/lab`, `components/lab`, tests, scripts and docs).
- **Environmental (no outbound network here):** `eval-011-dead-controls` (external links "fetch failed"), `portfolio-video`, `media-player`, `eval-014`, `playground` live URLs (YouTube/external).
- **Environmental / resource-bound:** `fallback-glyphs`, `perf-smoothness` (4× CPU throttle on software GL), `eval-008` `/dev/artifacts` (3 viewports) — the same set failed identically on an unmodified baseline in the earlier A/B run (28 failures there), so they are not caused by this branch.
- I did not loosen any threshold.

## Lab chunk size (gzip)

- Before (baseline build): **276,647 B**
- After: **290,641 B** (+13,994 B, +5.1 %)

## Performance notes

- ~183 draw calls and ~46.7k triangles at 1440 (~159 / 45k at 390). Pins and pines are instanced.
- Trail, particles and score pops are fixed pools; the trail ribbons are rewritten in place, with nothing allocated per frame. No infinite CSS animations.
- A low tier drops glow sprites and halos.
- **fps was not measured**: the only GL here is SwiftShader (~1.5 fps), which says nothing about a real GPU. Draw-call and triangle counts are the proxy.

## Known limitations

- The light-theme trail is softer than the dark one; on cream it is carried by the deeper amber core.
- Not checked on a real GPU or phone: frame rate, touch feel of the plunger, and the audio mix.
- The lane exit geometry was tuned with a headless Rapier simulation; very slow frames snap the gummy back to the spawn if it hasn't launched.
- `home-ask-tushky` and the environmental failures above are not fixed here.
- The test runs rewrote about 100 unrelated PNGs under `docs/screenshots/` in the working tree; they are deliberately not committed.

## Commits

- `875e3c1` docs: add Tushar's Gummy pinball redesign spec, reference and cloud brief (TASK-185)
- `0def251` Rebuild the Gummy Lab as a paper-cut pinball machine (TASK-185)
- `d7fe2ee` Polish the paper-cut pinball machine and its tests (TASK-185)
- `0425393` Add pinball review screenshots at 1440 and 390, light and dark (TASK-185)
- this report (committed last)
