# M-010 Track 5 / TASK-146 — `/card` paper-cut digital business card. Cloud-session brief (2026-10-05)

You are a cloud session working on Tushar Pathak's portfolio (`007U5H4R/portfolio-clay`). Tushar delegated M-010 decisions to Claude (EXE-26 in `decisions.md`): don't stop to ask; take decisions and list them in your report.

## Hard rules
- **Branch `m010/t5-card` only.** Commit and push to it. Never touch `main` or `m-009-redesign`, never open a PR into `main`, never deploy. Production is frozen.
- Commits: one per subtask, imperative subject ending `(TASK-146.N)`. No AI attribution lines.
- No secrets; no new personal data. **The vCard has no phone number and no date of birth** (EXE-27, EVAL-013 PII rule): name, title, email and public links only, sourced from `data/`.
- **No Apple Wallet anything** (S27): no button, badge, text or `.pkpass` route. Spec §11–14 are out of scope.
- Stay in your lane: other tracks run in parallel (T2 rewrites `app/globals.css` tokens and the theme system; T3 integrates scene art). Put card styles in the route's own stylesheet/module; **don't edit `app/globals.css`, `app/layout.tsx`, the header, or the theme module**. Use the role tokens only (Design.md §13, D13: same 13 token names, values swap under `[data-theme="dark"]`), so the card follows the theme the moment T2 lands. Until then test dark by setting `document.documentElement.dataset.theme = "dark"`.
- Don't edit `backlog/` files; Claude updates the board from your report.
- Higgsfield output can't be downloaded from this sandbox (CDN egress blocked). The raster art is already on the branch — don't generate more.

## Art already on the branch (TASK-146.1, done locally)
`public/card/paper-light.webp`, `public/card/paper-dark.webp` (tileable paper-fiber textures), `public/card/sailboat.webp` (transparent cut-out); provenance and the style-gate references in `docs/briefs/TASK-146-art.md`. **Dev-185:** the front landscape is built in code as independent SVG paper layers (sun/moon, three mountain ranges, shoreline, water, foreground) with the paper texture over them and real per-layer shadows, so the §45 z-stack and parallax are genuine. Match the reference renders: `docs/specs/m-010/card-reference-light.jpg` and `card-reference-dark.jpg` (the style-gate target; Claude compares your screenshots against them).

## Read (targeted)
- `docs/specs/m-010/card-updated.md` — whole file is ≈1,800 lines; read by section: §1–10 (lines 1–395), §15–35 (547–1171), §37–39 (1184–1259), §43–64 (1260–1757), §40–41 (1758–1818). Skip §11–14 (Wallet).
- `evaluation-plan.md` §9: the EVAL-029 and EVAL-027 rows. `decisions.md`: S27, D13, EXE-26..30. `Design.md` §13 (T5 owns **Dev-185 … Dev-189**).
- `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `tests/e2e/fixtures.ts`, `playwright.config.ts`, `lib/` for `siteUrl()`, sitemap and OG helpers, `data/` for contact facts.

## Subtasks
- **146.2** Route `/card` + card front: stacked paper landscape in light and dark, physical thickness and edges (§3–6, §15–20, §24, §43–48, §58).
- **146.3** Flip + back: the flip is a real `<button>` with an accessible name, Enter/Space, aria state; back links tabbable only when shown; raised QR paper panel whose QR **decodes from the rendered pixels to `${siteUrl()}/card`**; "Save contact" → `text/vcard` attachment with `BEGIN:VCARD, VERSION, FN, N, TITLE, EMAIL, URL, END:VCARD` and no phone/DOB (§7–10, §16–17, §23, §27, §55–57).
- **146.4** Depth motion: tilt, parallax, dynamic light; transform/opacity only; mobile; reduced motion → crossfade, no 3D transform, tilt off (§21–22, §34, §49–53, §59–61).
- **146.5** Fallbacks (no empty QR frame on failure, §32), `/card` in the sitemap and OG set, performance (EVAL-027: no card bytes in the home first-load set), `tests/e2e/eval-029.spec.ts` per the EVAL-029 row, remove EVAL-029 from `DEFERRED_SPECS`, "M-010 T5" section in `test-cases.md` (TC-T5- rows → EVAL ids), screenshots front/back × light/dark at 390 and 1440 into `docs/screenshots/m-010/t5/`.
Use test-driven development for the vCard builder, QR target and the flip state.

## Gate (exact counts in the report)
`pnpm install --frozen-lockfile` · `pnpm typecheck` · `pnpm lint` (0 errors) · `pnpm test` · `pnpm tsx scripts/eval-cases.ts --check-specs` · `pnpm build` · full `pnpm test:e2e`. Sandbox notes from the T2b session: set `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR=/tmp` (`.env.tooling` points at a Mac path); clear a stale `.next` if fonts fail to build. Tests that need outbound internet (YouTube/external hosts) fail the same on the base commit — record them with that evidence, don't "fix" them. Re-run any timeout failures in isolation before reporting.

## Report
Commit `docs/reports/TASK-146.md` (≤ 45 lines): commits, subtask states, gate counts (with isolation re-runs), decisions (Dev-185…189), anything deferred. Push it to `m010/t5-card` as your **last** commit — that file is how Claude learns you're done.
