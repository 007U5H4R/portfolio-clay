# TASK-142 report — Paper Trail cursor (M-010 T2b), branch `m010/t2b-cursor`

## Commits (after 14d3785 + brief b162a3c)
- 57dbcb4 asset manifest + 8 SVG pieces (142.1) · 3 commits for 142.2 (build, gate, labels), `--forbid` + EVAL-027 test (142.3) · EVAL-028 spec + test-cases (142.4) · image-drag fix + screenshots, token-only CSS + About route theme (142.5). The cursor, trail and gating landed together in the 142.2 commit; subtask labels are approximate.

## Subtasks
142.1 done · 142.2 done · 142.3 done · 142.4 done · 142.5 done (screenshots in `docs/screenshots/m-010/t2b/`, generator `scripts/cursor-screenshots.ts`).

## Gate (this sandbox; Chromium only)
- `pnpm install --frozen-lockfile` ok · `pnpm typecheck` ok · `pnpm lint` 0 errors, 0 warnings
- `pnpm test`: 75 files passed, 1 skipped · 889 tests passed, 4 skipped (baseline 868; +21 new)
- `eval-cases --check-specs`: 31 cases OK; EVAL-028 no longer deferred · `pnpm build` ok, 18 static routes; `/` first-load 163.3 kB gz (≤180)
- Full `pnpm test:e2e`: 1389 passed, 1685 skipped, **18 failed**, none from the cursor:
  - 12 at w1024 (contact, certifications, home, eval-008, scene-opener, and my eval-028 reduced-motion case): 30 s timeouts under load; re-run in isolation 131/131 pass.
  - 6 (w390 + w1440 portfolio-video ×2 each, eval-011 dead controls, playground live URLs): need outbound internet (YouTube, external hosts). They fail identically at base 14d3785 (checked on w1440: same 4 fail).

## Art
Higgsfield was available: generated 6 of 8 pieces (gpt_image_2_5, 6 × 0.25 = 1.5 credits, 0 regenerations; 2 more were rate-limited-then-resubmitted and also billed ≈ 0.5, total ≈ 2 credits). The CDN (cloudfront) is blocked by this sandbox's egress policy, so none could be downloaded. Shipped fallback: 8 hand-built inline SVG paper cut-outs (torn edge, offset shadow edge, ink marks), 0.5–1.9 kB each, from `scripts/cursor-trail-art.ts`. Swapping in generated art later = replace files in `public/cursor/trail/` (manifest uses `.svg`).

## Decisions
- Dev-150: native cursor only after the first pointer move; hidden over non-zone content with `cursor:none !important`; zones (incl. `button`, `dialog[open]`) keep a native cursor, resolving cursor.md §42 vs EVAL-028. Tagged controls in zones (Ask launcher `WOOF 🐾`, carousel `EXPLORE →`) show a label chip beside the native cursor.
- Dev-151: while a trail is held, `dragstart` is cancelled (a press on an `<img>` otherwise becomes a native drag and cancels the stroke after one node — found on the hero). Trade-off: no native image/link drag mid-stroke.
- Dev-152: cursor CSS ships in `components/cursor/cursor.css`, imported only by the lazy module; tokens only (EVAL-020), no `globals.css` edit. Dark mode follows D13 role tokens (navy=ink flips), no extra variants.
- Dev-153: gate decides once after `load` + idle tick; node cap enforced synchronously (cancel+remove) so the DOM never exceeds 18; open modal `dialog` counts as a zone (cursor never above it, §44).
- Dev-154: themes via `data-cursor-theme` (featured cards → railcite / slag-city / campfire, Ask section → tushky) plus a `/about` route fallback (the About page has no single wrapper; the unit test pins its first child). Labels derived from hrefs, explicit `data-cursor` wins.

## Notes for the merge
- EVAL-027 cursor half lives in `tests/unit/eval-027-cursor.test.ts` and `bundle-budget.ts --forbid` (T3/TASK-143 will add 3D markers; expect a trivial conflict). TC rows use prefix `TC-T2b-` (appended to `test-cases.md`).
- Theme fixture not available: overflow checks set `documentElement.dataset.theme` directly.
- Sandbox needs: `PLAYWRIGHT_BROWSERS_PATH` override and `TMPDIR=/tmp` (`.env.tooling` points at the Mac's E drive); a stale `.next` caused one bogus font build error.
- Deferred: Safari/Firefox, trackpad and real-laptop profiling (TC-T2b-14, manual). Optional first-session hint (§48) and analytics (§47) not built.
