# M-009 OG/Twitter card verification — TKT-98 (EVAL-017 automated part, TKT-91 AC3)

Preview tested: `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app` (build `2bd4949`).
Fetched 2026-09-26 via `curl` (no Vercel login; preview sends `X-Robots-Tag: noindex` on every page — expected, not a failure) and verified locally with Python PIL. `www.opengraph.xyz` could not be reached by WebFetch (see report) — not exercised.

Vercel resolves the canonical/OG absolute URL to the **deployment-specific hostname** (`portfolio-clay-3fa65m8e9-tushar-49a6.vercel.app`, from `VERCEL_URL`) rather than the branch-alias hostname I requested (`lib/seo.ts` `siteUrl()`). Both hostnames serve byte-identical HTML (same `etag`) — this is expected Vercel/Next behavior, not a defect.

## Family tag matrix

All 7 `opengraph-image.tsx` families, one representative URL each. PASS unless noted.

| Family | URL | og:title | og:description | og:image (abs. https) | 1200×630 | og:image:alt | og:url (abs. https) | twitter:card | twitter:image |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Work index | `/work` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Case study | `/work/teachspark` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| About | `/about` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Thinking index | `/thinking` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Playground | `/playground` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Contact | `/contact` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Essay (`/thinking/[slug]`)** | `/thinking/green-tests-prove-it-runs` (+ 4 more, same result) | PASS | PASS | **FAIL — og:image URL 404s** | N/A (image doesn't load) | PASS (alt text present in tag) | PASS | PASS | **FAIL — same 404 image** |

See `docs/reports/TKT-98.md` for the essay `og:image` root cause (`lib/seo.ts:63`).

## All 11 personal-category case-study slugs (spot-checked, cheap)

All 200, all carry a family-correct `og:title` and their own `/work/<slug>/opengraph-image`:
teachspark, railcite, velora, cubicle, nuptis, bhakti-vilas, token-toli, pratyasa, tegaki, dino-arcade-pwa, cinematic-portfolio.

The 3 `professional`-category slugs (`mars-ar-modernization`, `cloud-modernization-programs`, `godrej-smartnet`) have no `/work/<slug>` page at all (404, `dynamicParams=false` — by design, not an OG defect); the 404 page's own `og:image` falls back correctly to the root card and resolves (200).

## Image files (downloaded from the preview, verified with PIL)

| File | Family | Format | Dimensions | Bytes | Under 5 MB | Visual check |
|---|---|---|---|---|---|---|
| `home.png` | Home | PNG | 1200×630 | 150,772 | PASS | Paper skin (Fraunces/Caveat, paper palette), poster clear, no clipped text |
| `work.png` | Work index | PNG | 1200×630 | 56,129 | PASS | Eyeballed — paper skin, no clipping |
| `case-teachspark.png` | Case study | PNG | 1200×630 | 160,300 | PASS | Paper skin, badge pill renders, no clipped text |
| `about.png` | About | PNG | 1200×630 | 62,029 | PASS | Eyeballed — paper skin, no clipping |
| `thinking.png` | Thinking index | PNG | 1200×630 | 48,657 | PASS | Eyeballed — paper skin, no clipping |
| `playground.png` | Playground | PNG | 1200×630 | 55,801 | PASS | Paper skin, Fraunces headline, Caveat caption, no clipped text |
| `contact.png` | Contact | PNG | 1200×630 | 45,647 | PASS | Eyeballed — paper skin, no clipping |

Note: `home.png` and `case-teachspark.png` are a few hundred bytes different from the PNGs TKT-78 committed, though `lib/og.tsx`, `app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx` and the source `hero-poster.webp` are byte-identical between TKT-78's commit and this preview's build (`2bd4949`). A pixel diff shows the difference is confined to the poster region (max channel delta 37/255) — almost certainly non-deterministic PNG palette quantization in `sharp` (`lib/og.tsx` `loadPoster()`, `colours: 64, dither: 0`) across renders of the same input, not a content or code regression. The other 5 families (no poster) are byte-identical to TKT-78's committed PNGs. Not a failure of any AC; flagged for awareness only.

## opengraph.xyz (WebFetch, no browser/login)

Tried 3 URLs (`/`, `/work/teachspark`, `/thinking/green-tests-prove-it-runs`) via `WebFetch` against `https://www.opengraph.xyz/url/<encoded-url>`. All three returned HTTP 403 or 429 from opengraph.xyz itself (not from the portfolio preview) — the site appears to block/rate-limit non-browser fetches. Could not verify through this tool; not faked. `opengraph.xyz` should be re-tried by hand in a real browser if a visual confirmation is wanted.

## LinkedIn Post Inspector (requires Tushar's login — manual)

Paste each of these into https://www.linkedin.com/post-inspector/ :
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/work`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/work/teachspark`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/about`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/thinking`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/playground`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/contact`
- `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/thinking/green-tests-prove-it-runs` — expect a broken/missing image (known bug, see `docs/reports/TKT-98.md`)
