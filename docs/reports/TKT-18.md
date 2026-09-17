# TKT-18 report — `DemoVideo` component + four states + dev board (M-004)

**Ticket:** TKT-18 · `DemoVideo` four-state player + `/dev/video` fixture board · **Branch:** `m-004-work`
**Scope:** the reusable `DemoVideo` player component and its QA-only fixture board. Real demo video
assets are **out of scope** (M-005, TKT-22…27) — every project currently renders the `no-video`
state, honestly, until those tickets land. No video binary is committed anywhere in this change.

## Result summary
- `pnpm typecheck` ✅ · `pnpm lint` ✅ (0/0) · `pnpm test` ✅ (178 passed, 1 skipped) · `pnpm build` ✅ (all routes static (7), plain build unaffected).
- `pnpm test:e2e --grep 'eval-014|video'` ✅ — **plain build:** 1 passed (file-size sweep, route-independent), 27 skipped (every `/dev/video`-dependent case correctly SKIPs, never fails, on a normal production build — same pattern as `primitives.spec.ts`/`ask-inline.spec.ts`). **`ALLOW_DEV_ROUTES=1` build:** **17 passed, 23 skipped (width-gated by design), 0 failed** — the real evidence that all four states work.
- `/dev/video`: **404** on a plain `pnpm build && pnpm start` (curl-verified) · **200** on `ALLOW_DEV_ROUTES=1 pnpm build && pnpm start` (curl-verified). Excluded from the sitemap by construction (only in `STATIC_ROUTES`/project entries, never `/dev/*`); added to `tests/e2e/routes.json` `dev` list alongside `/dev/ask`/`/dev/primitives`.
- `pnpm eval --only EVAL-014,EVAL-011,EVAL-015` (plain build, no `ALLOW_DEV_ROUTES`, matching the standard `pnpm eval` gate) → **3 pass · 0 fail · 14 skip · regressions: []** (`evals/results/tkt-18-eval.json`, not committed — per-ticket `--only` runs match the pre-existing `evals/results/tkt-*.json` gitignore pattern). EVAL-014 reports PASS (its Playwright specs ran and all passed at the one un-gated viewport/case — the file-size sweep — with every dev-route case correctly SKIPping under the standard build); EVAL-011 and EVAL-015 PASS with no regression, confirming DemoVideo introduced no dead controls and no degradation-path breakage.

## The four states (EVAL-014), all verified under `ALLOW_DEV_ROUTES=1`
| State | Where verified | Evidence |
|---|---|---|
| `no-video` | `/dev/video` `[data-fixture="no-video"]`, e2e | poster fallback image + "Demo coming" badge (icon + text, never colour alone); **zero** `<video>` elements; no play control rendered (nothing to play) |
| `loading` | `/dev/video` `[data-fixture="valid"]` + `[data-fixture="error-throttled"]`, e2e with route interception (500ms/800ms artificial delay) | scrim + spinner, `role="status" aria-busy="true"`, `VisuallyHidden` "Loading demo video"; spinner respects `motion-reduce` |
| `playing` | `/dev/video` `[data-fixture="valid"]`, e2e — request intercepted with a ~1.7KB ffmpeg-generated clip (generated at test time into gitignored `.eval/fixtures/`, never committed) | native `<video controls muted playsInline preload="none">`, `paused === false`, `data-video-state="playing"` |
| `error` | `/dev/video` `[data-fixture="error-404"]` (real 404, unintercepted) + `[data-fixture="error-throttled"]` (intercepted delay + abort) | `role="alert"`, `ink`-on-`blush` overlay + `AlertTriangle` icon (Design.md §2 "no dedicated error hue" rule) + "View live →" link when `liveUrl` is set, "Demo coming" fallback when it isn't; every path also fires `console.warn('[video]', …)` — asserted directly in the 404 test via a console listener |

Additionally verified (structural, not one of the four named states but required by AC2): **no `<video>` element exists in the DOM before intent** (click, or — on `pointer:fine` desktop, verified separately by scrolling a fixture into view with no click at all — IntersectionObserver ≥50%); after intent the element carries `preload="none"`, `muted`, `playsInline`, `controls` exactly as specified.

## Per-step gates
| Step | What | Gate | Status |
|---|---|---|---|
| — | `components/projects/DemoVideo.tsx` | four `data-video-state` values render correctly per props; play button 56×56 (`ClayButton variant="secondary" iconOnly`), `aria-label="Play demo: {name}"`, keyboard-operable (real `<button>`) | ✅ |
| — | `data/schema.ts` | exported `Media` type (was previously only a runtime const) so `DemoVideo`'s `posterFallback` prop can be typed against it | ✅ |
| — | `app/dev/video/page.tsx` + `VideoDevBoard.tsx` | `devOnly()` guard; 4 labelled fixtures (`no-video`, `valid`, `error-404`, `error-throttled`); no `searchParams` read (stays static, TP1) | ✅ |
| — | `tests/e2e/eval-014.spec.ts` | fixme → 7 live tests (5 state-matrix + 1 IO-reveal + 1 file-size sweep), all tagged `@EVAL-014` | ✅ |
| — | `tests/e2e/routes.json` | `/dev/video` added to `dev` list | ✅ |

## Deviations (documented)
1. **State-matrix assertions run once at w390 (touch), not w1440, to avoid a real race.** The IO auto-reveal effect (`pointer:fine` + ≥50% in view → mount the native player) fires as soon as ANY part of a video fixture crosses the threshold — including during Playwright's own auto-scroll-into-view as part of `.click()`. On the w1440 desktop-Chrome project (`pointer:fine` true) this raced the custom play-button click and intermittently removed the button mid-click ("element was detached from the DOM"). The w390 project is `hasTouch:true`/`isMobile:true` (`pointer:coarse`), where the IO effect's own `matchMedia("(pointer: fine)")` guard never fires, so the click path is deterministic there. The IO-reveal behavior itself is real and correct — it's now covered by its own dedicated test, gated to w1440, that scrolls a fixture into view **without clicking** and asserts the native player mounts (paused, no fetch — `preload="none"` never fetches on its own).
2. **`Media` type export added to `data/schema.ts`.** `export const Media = z.object(...)` existed but had no corresponding `export type Media = z.infer<typeof Media>` (unlike `Project`/`Metric`/`Artifact`, which all did). `DemoVideo`'s `posterFallback` prop needs this type; added the one line following the exact existing pattern, no other schema changes.
3. **No video binary committed anywhere**, including for tests. The "valid src plays" case needs a real, tiny, decodable clip to exercise `playing`; it's generated by `ffmpeg` (already installed) at test-run time into `.eval/fixtures/tiny-valid.mp4` (gitignored, regenerated every run, ~1.7KB, 1s, silent, no audio track) and served to the browser only via Playwright's `page.route(...).fulfill({ path })` interception — it is never written under `public/`, never referenced by the app, and never staged.
4. **`/dev/video` fixtures use fake `/dev-fixtures/video/*.mp4` paths that don't exist on disk** (`valid.mp4`, `missing.mp4`, `throttled.mp4`), all sharing the real `/avatar/avatar.webp` as their poster so nothing 404s visually except the video stream itself. Opened directly in a browser without the Playwright interceptors running, the "valid" and "throttled" fixtures will honestly show the `error` state (a real 404) rather than their intended demo state — a deliberate, documented tradeoff to keep the "no committed video binaries" rule absolute; the 4 states are still all genuinely reachable and asserted under the automated suite.

## `git diff --stat` (intended files only)
```
 data/schema.ts              |  1 +
 tests/e2e/eval-014.spec.ts  | ~163 ++++++++++++++++++++++++++++++--- (fixme → live)
 tests/e2e/routes.json       |  1 +-
```
New: `components/projects/DemoVideo.tsx`, `app/dev/video/page.tsx`, `app/dev/video/VideoDevBoard.tsx`, `docs/reports/TKT-18.md`. No `evals/results/*.json` staged (per-ticket `tkt-18-eval*.json` runs match the existing gitignore pattern); no screenshots re-rendered.
