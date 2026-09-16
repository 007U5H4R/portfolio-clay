# TKT-06 — SEO metadata builders · OG image generator · sitemap · robots

**Milestone:** M-002 · **Branch:** `m-002-foundations` · **Stage:** 7 (Execution)
**Status:** Complete. All step gates pass; `pnpm typecheck && lint && test && build` green (all 5 route groups static, including the four `opengraph-image` routes); `eval-017.spec.ts` green for `/`, `/work`, `/work/teachspark`, `/contact`; regression eval shows no regression vs baseline.

## Per-step gates

| Step | What shipped | Gate | Result |
|---|---|---|---|
| S06.01 | `lib/seo.ts` (`siteUrl()` — `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost`; `buildMetadata()` — title/description/canonical/OG/Twitter, every URL built absolute); wired into `app/layout.tsx` (`metadataBase`), `app/page.tsx`, `app/work/page.tsx`, `app/work/[slug]/page.tsx`, `app/contact/page.tsx` | `tests/unit/seo.test.ts`: absolute `https://` OG/Twitter/canonical URLs for `NEXT_PUBLIC_SITE_URL=https://example.test`; `VERCEL_URL`/`VERCEL_PROJECT_PRODUCTION_URL` fallback chain; home-path double-slash guard; explicit `image` override | **PASS** — 9 new tests, `tests/unit/seo.test.ts` |
| S06.02 | `assets/fonts/{Manrope-Bold.ttf, Manrope-ExtraBold.ttf, OFL.txt}` — fetched from `googlefonts/manrope` (the active upstream fork; `google/fonts`'s own `ofl/manrope/` now ships only a variable font, no static weights) at commit `6f81ebe`, OFL-licensed | `ls -la assets/fonts` → 3 files; `OFL.txt` present, contains "SIL OPEN FONT LICENSE" | **PASS** |
| S06.03 | `lib/og.tsx` (`renderOgCard()` — hex palette per DESIGN_DIRECTION §2, Manrope 700/800 via `fs.readFile`, avatar poster embedded base64); `app/opengraph-image.tsx` (home family: tagline eyebrow, hero headline, avatar) | `BUILD` → `assert-static` reports `all routes static (5)` incl. `/opengraph-image`; `curl … | file` → `PNG image data, 1200 x 630`; 202,942 B ≤ 300 kB; eyeballed legible (`docs/screenshots/og/home.png`) | **PASS** |
| S06.04 | `app/work/opengraph-image.tsx` (Selected Work family); `app/work/[slug]/opengraph-image.tsx` (`generateStaticParams` reused; name + tagline + `statusLabel` badge, tone by status via a local `STATUS_TONE` map) | `BUILD` → all routes static incl. `/work/opengraph-image` and `/work/teachspark/opengraph-image`; both PNG 1200×630 ≤300 kB | **PASS** — 54,936 B / 54,774 B |
| S06.05 | `app/sitemap.ts` (3 built static routes + personal project slugs; essays picked up automatically once `data/writing.ts` lands, TKT-43); `app/robots.ts` (`Disallow: /dev/`, `Sitemap:` absolute) | `curl …/sitemap.xml \| grep -c '<loc>'` = 4 (3 static + teachspark); `robots.txt` has `Sitemap: https://…` + `Disallow: /dev/` | **PASS** |
| S06.06 | `tests/e2e/eval-017.spec.ts` (`@EVAL-017`: title/description/canonical/OG/Twitter tag set, absolute-https assertion, `og:image` fetched-and-decoded 1200×630 PNG ≤300 kB, sitemap/robots checks, OFL licence sanity) | green for `/`, `/work`, `/work/teachspark`, `/contact` | **PASS** — 7/7 (4 route tests + robots + sitemap + licence) |
| S06.07 | Regression + wrap | `pnpm eval --skip-build --only EVAL-017,EVAL-004` no regression vs `baseline-v1.json` | **PASS** — see below |

## Two real problems found and fixed while wiring the gates

1. **`ImageResponse` throws `"… is not iterable"` on a WebP `<img>` source.** The home OG card embeds the avatar poster (`public/avatar/avatar-poster.webp`) as a base64 data URL; Satori's bundled image-size sniffer (inside `next/og`'s `ImageResponse`) can only read PNG/JPEG/GIF headers, not WebP, and throws deep inside its renderer rather than failing gracefully. Isolated with a standalone Satori repro (bypassing Next's minified stack) before finding the root cause. Fixed by re-encoding the poster to PNG in-memory via `sharp` (already a project dependency) before embedding — `lib/og.tsx`'s `loadAvatarDataUrl()`.
2. **Font `Buffer`s passed to `ImageResponse` intermittently failed the same "not iterable" way** — `readFile()`'s `Buffer` can be a view over Node's shared memory pool, which the font parser doesn't handle; converted to a real `ArrayBuffer` via `buf.buffer.slice(...)` (`lib/og.tsx`'s `toArrayBuffer()`).

## Regression (S06.07) — `evals/results/tkt06-regression.json`

Generated from real execution (`pnpm eval --skip-build --only EVAL-017,EVAL-004`, plain build, no `ALLOW_DEV_ROUTES`):

| EVAL | Baseline (`baseline-v1`) | TKT-06 | Δ |
|---|---|---|---|
| EVAL-004 (Lighthouse, informational on tracer) | PASS · mobile [96,100,100,100] · desktop [100,100,96,100] | **PASS** · mobile [95,100,100,100] · desktop [99,100,96,100] | ±1 pt run-to-run noise, both well above the 90/95/95/95 threshold — no regression |
| EVAL-017 (link previews) | MANUAL (human inspector step is TKT-51) | **MANUAL** (unchanged — the automated tag-level half now has its own green Playwright suite, `eval-017.spec.ts`, feeding this same case) | none |

`criticalFailures: []`, `regressions: []`. `pnpm tokens:check` → 13/13 (no colour `DEFINITIONS` added/changed).

## Final gate chain

`pnpm typecheck` ✓ · `pnpm lint` ✓ (one `jsx-a11y/alt-text` warning on the OG avatar `<img>` found and fixed with `alt=""`, decorative) · `pnpm test` ✓ (98 tests, 20 files) · `pnpm build` ✓ (`all routes static (5)`, includes `/opengraph-image`, `/work/opengraph-image`, `/work/teachspark/opengraph-image`, `/contact/opengraph-image`) · `pnpm test:e2e` (`eval-017.spec.ts` + `tracer.spec.ts`) ✓ 42 passed, 0 failed · `ALLOW_DEV_ROUTES=1` full suite (`tracer`+`primitives`+`layout`) ✓ 55 passed, 0 failed (confirms the primitives/layout suite is unaffected by this ticket) · `pnpm eval --skip-build --only EVAL-017,EVAL-004` ✓ no regression.

## Deviations from the strict per-step file list (all gate-driven, documented here)

1. **`app/contact/opengraph-image.tsx` added now, not deferred to TKT-45.** `technical-plan.md` line 580's parenthetical assigns "About/thinking/playground/**contact** OG images" to TKT-42/43/44/**45**, but S06.06's own gate text ("Gate: green for `/`, `/work`, `/work/teachspark`, `/contact`") and the brief's exclusion list ("About/Thinking/Playground OG images are LATER tickets — not here") both require `/contact` to have a working `og:image` *today*. Built it as the one-line `renderOgCard()` call the plan itself says every later family needs — no new design/copy invented beyond the existing "Still curious?" contact copy already approved for TKT-45's `ContactCard`.
2. **`.env.tooling` gained one line (`NEXT_PUBLIC_SITE_URL=https://portfolio-clay.example`) and `package.json`'s `build` script now wraps `next build` in `dotenv -e .env.tooling --`.** Metadata is baked in at *build* time (SSG), so proving "`og:image`/canonical/Twitter URLs are absolute `https://`" — S06.01's and S06.06's explicit gate text — requires `NEXT_PUBLIC_SITE_URL` to be set *during the build*, not just the test run. `.env.tooling` is already this repo's designated "committed, secret-free, test-time config" file (A9); a real `NEXT_PUBLIC_SITE_URL` set on Vercel (TKT-50/53) always wins, because `dotenv` never overrides a variable already present in the environment (verified directly: `NEXT_PUBLIC_SITE_URL=https://real-prod.example dotenv -e .env.tooling -- node -e "console.log(process.env.NEXT_PUBLIC_SITE_URL)"` → `https://real-prod.example`). Without this, `eval-017.spec.ts`'s absolute-https assertions would be permanently red under the standard `pnpm build`/`pnpm test:e2e` commands.
3. **`data/writing.ts` essay slugs are not yet wired into `app/sitemap.ts`.** `data/writing.ts` doesn't exist until TKT-43; importing `@/data`'s `collections.writing` today (always empty) pulled `scripts/forbidden-strings.ts`'s filesystem walk into the sitemap route and tripped Next's "tracing the whole project" build warning. Left a one-line comment for TKT-43 to add its own `essays.map(...)` block instead.
4. **`app/sitemap.ts`'s static-route list (`/`, `/work`, `/contact`) is a new, narrower constant, not `lib/anchors.ts`'s `STATIC_ROUTES`.** That existing export is a *link-validation* set (every route content is allowed to reference, including pages that don't exist yet) — reusing it in the sitemap would list `/about`, `/thinking`, `/playground` as indexable URLs before they're built, i.e. submit 404s to crawlers. New page tickets (TKT-40/43/44) append their route to `app/sitemap.ts`'s own list once the page ships.

## `git diff --stat` (files to be staged)

```
 .env.tooling             |  6 ++++++
 app/contact/page.tsx     | 10 +++++++---
 app/layout.tsx           |  8 +++++---
 app/page.tsx             | 10 ++++++++++
 app/work/[slug]/page.tsx | 10 +++++++++-
 app/work/page.tsx        | 11 ++++++++---
 package.json             |  2 +-
 app/contact/opengraph-image.tsx       | new
 app/opengraph-image.tsx               | new
 app/robots.ts                         | new
 app/sitemap.ts                        | new
 app/work/[slug]/opengraph-image.tsx   | new
 app/work/opengraph-image.tsx          | new
 assets/fonts/Manrope-Bold.ttf         | new
 assets/fonts/Manrope-ExtraBold.ttf    | new
 assets/fonts/OFL.txt                  | new
 lib/og.tsx                            | new
 lib/seo.ts                            | new
 tests/e2e/eval-017.spec.ts            | new
 tests/unit/seo.test.ts                | new
 evals/results/tkt06-regression.json   | new
 docs/screenshots/og/{home,work,case-teachspark,contact}.png | new (evidence, S06.03 eyeball gate)
```
