# Implementer brief — TKT-06 · SEO metadata builders + OG generator + sitemap + robots (M-002)

Fresh implementer. Execute **TKT-06 only** (steps S06.01–S06.07). Model tier: standard, EXCEPT S06.03 (OG `ImageResponse` under SSG) which is most-capable-tier care. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-002-foundations`. Standard guardrails (E-Drive only; don't touch main/backlog/docs ledger+briefs/sibling portfolio; explicit-path staging, never `git add -A`).

## Read first
- `technical-plan.md` §B M-002 → **TKT-06 steps S06.01–S06.07** (lines ~577–583) — authoritative.
- `technical-plan.md` §A8 (SEO/OG — `siteUrl()`, `buildMetadata()`, `OgCard`), §A11 (env: `NEXT_PUBLIC_SITE_URL` prod, `VERCEL_URL` fallback). `lib/site.ts` (name/title/links), `data/projects.ts` (for per-project metadata + OG), `Design.md` §2 (palette for OG cards).
- Global web-deliverables rule: **Open Graph + Twitter Card + a 1200×630 image with absolute HTTPS URLs** are mandatory for a deployed site — this ticket implements them.

## Steps (each has a hard Gate)
- **S06.01** `lib/seo.ts` (`siteUrl()`, `buildMetadata()`) + wire `generateMetadata`/metadata into `app/layout.tsx` (metadataBase, defaults), `app/page.tsx`, `app/work/page.tsx`, `app/work/[slug]/page.tsx` (from project), `app/contact/page.tsx`. Gate: `tests/unit/seo.test.ts` — absolute `https://` OG/Twitter URLs for `NEXT_PUBLIC_SITE_URL=https://example.test`, and `VERCEL_URL` fallback.
- **S06.02** OG font assets: `assets/fonts/Manrope-Bold.ttf`, `Manrope-ExtraBold.ttf`, `OFL.txt` (from the Manrope repo, OFL licence — these are OFL-licensed, redistribution allowed; include the licence file). Gate: `ls -la assets/fonts` → 3 files; licence present.
- **S06.03** `lib/og.tsx` (`OgCard` per A8; hex palette map — OG runs in the edge/node ImageResponse runtime which can't read the oklch CSS vars, so use the authoritative HEX from DESIGN_DIRECTION §2; fonts via `fs.readFile(path.join(process.cwd(),'assets/fonts/…'))`; avatar poster base64 for the home card) + `app/opengraph-image.tsx` (size 1200×630, contentType, alt, default async). Gate: BUILD → `assert-static` lists `/opengraph-image` prerendered; `curl -s localhost:3000/opengraph-image -o /tmp/og.png && file /tmp/og.png` → PNG 1200×630 ≤300 kB; eyeball text legible (SHOT og/home).
- **S06.04** `app/work/opengraph-image.tsx` + `app/work/[slug]/opengraph-image.tsx` (generateStaticParams reused; name+tagline+statusLabel, tone by status). Gate: BUILD → all routes static includes `/work/teachspark/opengraph-image`; PNG 1200×630 ≤300 kB.
- **S06.05** `app/sitemap.ts` (static routes + personal project slugs + essays; `/dev/*` excluded) + `app/robots.ts`. Gate: `curl -s localhost:3000/sitemap.xml | grep -c '<loc>'` = static routes + 1 (teachspark); robots.txt has `Sitemap: https://…` and `Disallow: /dev/`.
- **S06.06** `tests/e2e/eval-017.spec.ts` (`@EVAL-017`: for every built page family route assert `<title>`, `meta description`, canonical, `og:title/description/image/url/type`, `twitter:card=summary_large_image`, `twitter:image`, all URLs `^https://`; fetch each `og:image` → 200 PNG 1200×630 via sharp). Gate: green for `/`, `/work`, `/work/teachspark`, `/contact`.
- **S06.07** Regression + wrap: `pnpm eval --only EVAL-017,EVAL-004` no regression vs baseline-v1.

## Rules
- Everything on E Drive; colour DEFINITIONS stay 13 (`pnpm tokens:check`). Do NOT install Chromium (on E-Drive already). Follow the plan; no routes/features beyond the S06 list. About/Thinking/Playground OG images are LATER tickets (TKT-42/43/44) — not here.
- OG images must be statically prerendered (TP1/SSG) — verify `assert-static` still says all routes static. If `ImageResponse` forces a route dynamic, STOP and report the breaker (do not disable assert-static).
- Commit: `feat(m002): TKT-06 SEO metadata + OG images + sitemap + robots` + Co-Authored-By trailer. Explicit paths only.

## Finish
`pnpm typecheck && lint && test && build` green; eval-017 green; OG PNGs verified 1200×630. Write `docs/reports/TKT-06.md` (per-step gates, OG byte sizes, sitemap loc count, `git diff --stat`). Final 5-line summary: steps, gates, OG image sizes, blockers, deviations, SHA.
