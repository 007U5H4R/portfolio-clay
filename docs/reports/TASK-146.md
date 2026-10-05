# TASK-146 report — `/card` paper-cut business card (branch `m010/t5-card`)

**State: 146.2, .3, .4, .5 done. Not deployed, no PR, `main` / `m-009-redesign` untouched.**

## Commits (one per subtask, plus fix-ups folded into the next)
- 146.3 `Add vCard builder, QR matrix and flip state with tests` (TDD: tests first for vcard, qr, flip)
- 146.2 `Build the /card route, paper-layer front and flip with QR back`
- 146.4 `Add tilt, parallax and reduced-motion crossfade with clear footer spacing`
- 146.5 `Add EVAL-029 spec, sitemap and OG entries, isolation test, T5 test cases and screenshots`
- later commits: 14 px text floor (EVAL-008) and this report. (146.1 art was already on the branch.)

## Gate (sandbox: Chromium r1194 via an uncommitted local config, `TMPDIR=/tmp`)
- `pnpm install --frozen-lockfile` OK after adding `qrcode-generator` (dep) and `jsqr`, `pngjs`, `@types/pngjs` (dev).
- `pnpm typecheck` clean · `pnpm lint` 0 errors · `pnpm test` 78 files passed / 1 skipped, 888 tests passed / 4 skipped.
- `eval-cases.ts --check-specs` OK: 31 cases, EVAL-029 removed from `DEFERRED_SPECS`, 12 Playwright ids tagged.
- `pnpm build` OK (19 static routes; `/card`, `/card/vcard`, `/card/opengraph-image` prerendered).
- Full `pnpm test:e2e` (3,072 = 1,377 passed, 1,683 skipped by design, 12 failed; 28.5 min, 2 workers). After the fixes below, re-run in isolation:
  - eval-029 spec: 38 passed / 2 skipped (tilt is ≥1024 only), all four widths. All `/card` sweeps (axe, overflow, targets, decoration, EVAL-008 text, EVAL-017 OG): 27 passed.
  - Mine, fixed: EVAL-008 text floor (13 px / 10 px type on `/card`; now ≥ 14 px).
  - Timeouts under 2 workers, pass alone: `home-ask-tushky` hero CTA, `eval-010` `/about`.
  - Outbound network (sandbox egress 403/blocked), unrelated to `/card`: `portfolio-video` Campfire and Slag City (×3 viewports, YouTube), `eval-011` dead controls (58 external links 403, Credly/Vercel/etc.), `playground` live-URL HEAD. Same cause on the base commit; not "fixed".
- Not run: iOS/Android phone scan (TC-T5-13, manual at the gate). The QR decodes from rendered pixels in jsQR in light and dark.

## Decisions (Dev-185…189)
- **Dev-185** Front art is code: seven independent clip-path paper layers + sun + boat (raster cut-out) + ripples, textured per layer, each with its own contact + ambient shadow sized from its §45 z; light from upper right. 2-D translate parallax inside one rigid 3-D card (§55); layers bleed 20 px so no gap shows.
- **Dev-186** Colours are role tokens + `color-mix` only (EVAL-020, no literals). Dark is a separate palette recipe in the module under `[data-theme="dark"]`, written against D13/§13.1 values (cream moon, navy ranges, dark green land). T2's token block has not landed, so dark screenshots/tests inject the §13.1 hexes; it follows the real tokens once T2 merges. QR is always dark-on-light (panel takes `navy`, modules `paper` in dark).
- **Dev-187** Flip control: one real `<button>` under the card, visible text "Flip card", `aria-label` names the action per side (§23), `aria-expanded` + `aria-controls`. Clicking the card also flips. Hidden face is `inert` (no tabbable links). Lift 150 ms → flip ≈ 850 ms → settle via CSS keyframes; back rests flat so the QR is never skewed.
- **Dev-188** Motion: pointer/touch write `--nx/--ny` (no React state); only transform/opacity animate. Touch uses a smaller envelope and no sheen; no DeviceOrientation (iOS needs a permission prompt) — touch-drag tilt is the sensor-free path (§60). Reduced motion: no listeners, `perspective:none`, `transform:none`, opacity crossfade, static stacked-shadow thickness kept.
- **Dev-189** Content: front title is `site.title` ("Senior Product Manager"), not the spec's "AI Product Manager" (not in `data/`; no new claims). vCard 3.0 from `lib/site` only: FN, N, TITLE, EMAIL, URL ×3 (site, LinkedIn, GitHub); no TEL/BDAY. Served by static `/card/vcard` (`text/vcard`, attachment). QR encodes `${siteUrl()}/card`; empty URL / encoder failure renders no QR panel.
- Layout finding: the band footer slides over the last 200 px (120 px < 768) of `main`'s last child, which covered the flip button at 1024×768 — the scene now keeps 180/270 px of clearance.
- Added `/card` to sitemap `STATIC_ROUTES`, `routes.json` (all route sweeps) and eval-017's OG list; OG image `app/card/opengraph-image.tsx`.

## Deferred / notes
- Analytics events (§31) skipped: no card-specific analytics hook exists; Vercel Analytics is page-level only.
- Not touched: `app/globals.css`, `app/layout.tsx`, header, theme module, `backlog/`. TC-T5- rows are in `test-cases.md` (permanent TC ids at merge).
- Screenshots (front/back × light/dark × 390/1440): `docs/screenshots/m-010/t5/` — style-gate compare against `card-reference-*.jpg` (references are portrait; the card is 420×680 portrait too).
- The e2e run rewrites tracked `docs/screenshots/*` images; I reverted those, nothing outside `m-010/t5` changed.
