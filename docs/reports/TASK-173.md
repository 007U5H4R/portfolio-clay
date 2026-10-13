# TASK-173 report: tilt parallax freezing at 85 %

## Root cause
`onOrient` in `lib/paper-world/motion.ts` advanced the sensor low-pass (`lp += 0.15 * (raw - lp)`) once per
`deviceorientation` event. The value therefore depended on the event count, not on time. A short burst of n events
left the target at 1 - 0.85^n (about 85 % after 11 events) and nothing moved it again until the next event, which on
iOS (changes only) may not come. The spring was fine; the target feeding it was stuck.

## What changed
- `lib/paper-world/motion.ts` (tilt path only; the object channel is untouched): the event handler now only stores
  the clamped raw reading. The low-pass advances in `tick` per frame (time constant derived from the old alpha 0.15
  at 60 fps, so the feel is the same) and the loop stays awake until it reaches the raw value, then sleeps.
  The jitter guard is kept.
- `tests/unit/paper-motion.test.ts`: the old test pinned the per-event behaviour (one event giving 0.15) and was replaced
  by three: clamp and settle, an 11-event burst ends at the full deflection (fails on the old code), and smooth approach then sleep.
- `tests/e2e/eval-033.spec.ts`: the real-site tilt assertion now polls (`expect.poll`) for its end value; the threshold
  (`ORIENTATION_PX.details - 1`) is unchanged.

## Judgement calls
- EVAL-033 did not reproduce here. It passed at w390 and w768, on the unfixed and the fixed code, also with 4 busy
  CPU loops and 3 repeats (51/51 each). The brief's failure (15.3 of 18 px, about 85 %) is consistent with a read taken
  mid-flight on a slow software-GL frame. I could not prove which of the two causes it was, so I fixed the real defect
  and made the harness assertion wait for the end state rather than weaken it.
- Chromium: the container has build 1194; Playwright wants 1243. I symlinked 1194 into `~/.cache/ms-playwright`
  (outside the repo). `.env.tooling` untouched.

## Gates
- typecheck clean; lint 0 errors, 2 warnings (pre-existing); tokens:check 12/12 and 73/73.
- `ALLOW_DEV_ROUTES=1 pnpm build` OK. `pnpm test`: 135 files, 1566 passed, 4 skipped.
- Full e2e (`--retries=0 --workers=3`, 4 widths): 2048 passed, 46 failed, 2106 skipped. EVAL-033 passes at both widths.
- The 46 failures:
  - known: EVAL-008 `/dev/artifacts` (and `/dev/thinking` once at w768), EVAL-039 x9 at w1440.
  - container network: YouTube/CSP video specs (media-player, portfolio-video, eval-014), playground HEAD checks, eval-011 external links (LinkedIn/Drive "fetch failed").
  - fonts: fallback-glyphs (4).
  - load-only: EVAL-030 lab, home-ask-tushky, eval-010 reduced motion. All passed when re-run with `--workers=1`.
- Re-run alone at `--workers=1`: 88 passed, 2 failed (eval-014 w390 and eval-011 w1440, both network). I did not re-run these on main; none touch the tilt code, and the eval-011 log shows only external-link fetch errors.

## Screenshots
None added. The e2e run rewrites `docs/screenshots/**` PNGs; those changes were discarded, not committed.

## Limitations
- No real device test; the sensor is simulated with synthetic events.
- The exact cause of the original EVAL-033 failure could not be observed in this container.
