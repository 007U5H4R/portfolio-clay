# M-011 Paper World — cloud session report (branch `m011/p0`, 2026-10-06)

Production frozen, nothing deployed, no PR, nothing pushed outside `m011/*`. `origin/m-009-redesign` merged at the start and re-checked at the end (already up to date); `origin/m011/p2-art` merged (one README conflict, both sides kept). EXE-48 re-added.

## Per-track state
| Track | Ticket | State |
|---|---|---|
| P0 tokens + `PaperParallaxScene` + `paperMotion` | TASK-156 | **Done.** 156.1 `--mat-*`, `--par-*`, bottom-right `--depth-*`/`--depth-side` + `tokens-check` pairs; 156.2–156.5 verified (EVAL-032/033/034 green); Opus review fixed (EXE-49). |
| P1 layered home hero | TASK-157 | **Done.** `Hero.tsx` → `PaperParallaxScene hero-home`, polaroids registered to the art grid (desktop + 16:10 phone frame), EVAL-035 spec, style gate PASS (EXE-51, EXE-54). |
| P2 scenes rollout | TASK-158 | **Done (code).** Seven scenes in `layers.ts`; every `SceneOpener` uses layers (frame = the scene's ratio ≥ 768, 4:3 below); EVAL-034 extended to 8 scenes; gate PASS with notes (EXE-52, EXE-54). |
| P3 cards, buttons, icons | TASK-159 | **Done** for cards (2 px `--mat-side` sidewall on `--shadow-paper`, `data-elev` on `Sheet`) and the six button families (one paper-button contract); icons stay inline SVG per Design.md §14.6 (no new set drawn — open item). EVAL-037 spec. |
| P4 About / timeline / skills | TASK-160 | **Done at CSS level:** skills as paper tags (four real clusters), experience rail as a paper strip. About keeps its TASK-136 notebook sheets; no origami (needs art). EXE-53. |
| P5 cursor | — | Folded into TASK-152 (EXE-47); not re-checked against §11 here (open item). |
| P6 contact scene | TASK-161 | **Done (code):** `OceanGate` (loops run only on screen / visible tab / not covered), filters off animated layers, front-wave up-cast shadow removed, no filter keyframes anywhere; EVAL-036 + EVAL-038 (sailboat inside the strip at 390/768/1024/1440, both themes, sail + rock extremes). Waves/boat art = the shipped M-010 art (placeholder, art requests #2/#3). |
| P7 integration gate → preview | TASK-162 | **Not done**: full gate on a quiet machine, preview push and the §11 cursor check remain. No push to `m-009-redesign` or any preview branch was made. |

## Gates run in this VM (exact counts)
- `pnpm lint`: 0 errors, 0 warnings. `pnpm typecheck`: clean.
- `pnpm test` (vitest): **100 files passed, 1 skipped; 1123 tests passed, 4 skipped, 0 failed.**
- `pnpm tokens:check`: 13/13 + 13/13 role tokens, 7/7 + 7/7 material tokens round-trip, **69/69 contrast pairs AA** (was 55; +14 material pairs, light + dark).
- `tsx scripts/eval-cases.ts --check-specs`: 38 cases OK, 23 Playwright ids tagged, deferred: none.
- Build (`ALLOW_DEV_ROUTES=1`): green, all 20 routes static. **Home first-load JS 166.2 kB gz** (budget 180; 164.9 before M-011 work on this branch).
- Playwright, full suite, projects w1440 + w390: **1298 passed, 36 failed, 490 skipped.** Tablet (w768 + w1024), hero/opener/home/tracer/projects/eval-019/025 specs: **60 passed, 0 failed, 116 skipped by design.** M-011 specs, last run: EVAL-032/033 13 passed, EVAL-035 8 passed, EVAL-037 19 passed (earlier targeted runs of 036/038 passed inside the 295-test run before the last fixes; the final full run had them green too).
- The 36 failures, classified: **environment, not M-011** — fallback-glyphs (4), eval-030 Gummy Lab (WebGL boot under software GL), portfolio-video + media-player (YouTube iframes: network blocked; they only *run* because this build had `ALLOW_DEV_ROUTES=1`, the baseline build skips the fixtures), eval-014 w390 (video fixture), eval-011 dead controls + playground URLs (external hosts answer HTTP 403), eval-028 (fail identically on the untouched baseline build). **Flaky under load, pass on rerun:** paper-drawin, case-study-new-tab. **Mine, fixed afterwards:** `projects.spec` "one scene img" (updated for layers, committed and pushed `test(m-011): /projects opener spec…`; it passed on the rerun). Baseline = `origin/m-009-redesign` built in a separate worktree.
- Not captured: `baseline-m011-p0` Lighthouse/LHCI numbers, EVAL-004/005 on a preview, TASK-155's smoothness eval (needs a quiet machine / preview).

## EXE decisions recorded in `decisions.md`
EXE-48 (P2 art gate, re-added) · EXE-49 (P0 verified, review fixes) · EXE-50 (EVAL-035 counts the visible layers: threshold 2 → 4; inactive theme warmed only after load) · EXE-51 (home hero on layers, polaroid grid, TKT-96 kept for the hero) · EXE-52 (openers on layers, EVAL-034 scene-level provenance rows, P3 paper contract in CSS) · EXE-53 (P4/P6 at CSS/markup level, no new content or raster) · EXE-54 (style gate PASS with notes for P1/P2/P3/P4/P6).

## Open items
1. **P7**: full gate on a quiet machine, preview deploy of the m011 work (needs `m-009-redesign` push by the owner of that branch), TASK-155 smoothness eval, EVAL-004/005 on the preview, `baseline-m011-p0`.
2. **Art (local session)** — `docs/briefs/m011-art-requests.md`: narrow-crop hero layers for phones (soft today), footer wave/boat refresh, optional detail layers for Portfolio/Certifications/About, a 4:3 `thinking` mid crop for mobile (style-gate note).
3. Opus review minors not changed (EXE-49): dark visitors still fetch the light eager pair; tablet-with-hover pointer parallax; hybrid-device input changes; landscape tilt axes; iOS 13 `addListener`.
4. Gate notes to watch in P7: dark `--depth-*` halo under the RailCite card; the Experience timeline's last card meets the Education torn edge at 1440 (pre-existing, compare with baseline); cream blip at the hero's torn edge at max shift.
5. P3 icon set (inline SVG paper-cut) and the §11 cursor check are not done; P4 About has no origami objects.
6. LCP assertions in EVAL-035 need a full Chromium (`PW_CHROMIUM`); the headless shell never reports LCP.
7. Cloud tooling notes: Playwright here needs `PLAYWRIGHT_BROWSERS_PATH` pointing at a dir with the expected `chromium_headless_shell-1243` layout (symlinked to `/opt/pw-browsers`); screenshot PNGs under `docs/screenshots` are rewritten by the suite and were reverted, never committed.
