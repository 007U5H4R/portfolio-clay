# TKT-98 (TASK-93) · Link-preview verification on the M-009 Vercel preview — implementer report

Branch `m009/tkt-98` from `f121e25` · scope: verify (not fix) the OG/Twitter link previews for EVAL-017's
automated part / TKT-91 AC3, on preview `https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app`
(build `2bd4949`). No push, no deploy, no logins. Full tag matrix and downloaded images in
`docs/og/m-009/README.md`.

## Result

6 of 7 OG families PASS every checked tag. The **essay family (`/thinking/[slug]`) fails**: its
`og:image`/`twitter:image` URL 404s on all 5 essay slugs, so link previews on Slack/LinkedIn/Twitter/iMessage
for any `/thinking/<slug>` URL will render with no image.

## What passed

- **Home, Work index, Case study (all 11 personal slugs), About, Thinking index, Playground, Contact** — `og:title`, `og:description`, `og:image` (absolute https), `og:image:width=1200`, `og:image:height=630`, `og:image:alt`, `og:url` (absolute https), `twitter:card=summary_large_image`, `twitter:image` all present and correct.
- All 7 downloaded PNGs: exactly 1200×630, `image/png`, well under the 5 MB cap (45.6–160.3 KB), and visually the paper skin (Fraunces headline, Caveat hand caption, paper/ivory/rust palette, no clay) with no clipped text — matches TKT-78's re-skin.
- The 3 `professional`-category project slugs (`mars-ar-modernization`, `cloud-modernization-programs`, `godrej-smartnet`) have no dedicated `/work/<slug>` page at all (`dynamicParams=false`, by design) — their 404 page correctly falls back to the root OG card, which resolves fine. Not an OG defect.
- `X-Robots-Tag: noindex` is present on every page on this preview host — expected preview behavior, recorded per instructions, not a failure.

## Failure — essay pages advertise a 404'ing `og:image`

**Reproduction:** `curl -s https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app/thinking/green-tests-prove-it-runs` → `og:image` = `https://portfolio-clay-3fa65m8e9-tushar-49a6.vercel.app/thinking/green-tests-prove-it-runs/opengraph-image`. Fetching that URL directly returns **HTTP 404** (Next's not-found page). Reproduced identically on all 5 essay slugs (`green-tests-prove-it-runs`, `worse-numbers-before-submitting`, `refusal-is-a-feature`, `killing-nuptis`, `staleness-is-a-correctness-bug`).

**Root cause:** `app/thinking/[slug]/page.tsx:32-38` calls `buildMetadata()` for each essay without an `image` override:
```ts
return buildMetadata({
  title: `${essay.title} · ${site.name}`,
  description: essay.dek,
  path: `/thinking/${essay.slug}`,
  ogFamily: "Product Thinking",
  type: "article",
});
```
`lib/seo.ts:63` defaults the image path whenever no `image` is passed:
```ts
const imagePath = image ?? (path === "/" ? "/opengraph-image" : `${path}/opengraph-image`);
```
This assumes every route has its own co-located `opengraph-image.tsx` (true for `/work/[slug]`, which does have `app/work/[slug]/opengraph-image.tsx`). But `/thinking/[slug]` has **no** per-essay OG route — only the family-level `app/thinking/opengraph-image.tsx` exists — so the default builds `/thinking/<slug>/opengraph-image`, which was never generated and 404s.

**Fix belongs in product code** (not made here, per scope): either (a) pass `image: "/thinking/opengraph-image"` explicitly in the `buildMetadata()` call at `app/thinking/[slug]/page.tsx:32-38`, so essays reuse the family card (mirrors how the family's `og:image:alt` is already `"Product Thinking"` for all essays), or (b) add a real `app/thinking/[slug]/opengraph-image.tsx` route (like `/work/[slug]` has) if per-essay cards are wanted. Option (a) is the smaller, more consistent fix given essays don't have per-essay art elsewhere.

## Not exercised / needs a human

- **opengraph.xyz** — tried via `WebFetch` for `/`, `/work/teachspark`, `/thinking/green-tests-prove-it-runs`; opengraph.xyz itself returned HTTP 403 / 429 to all three (not the portfolio preview) — it appears to block or rate-limit non-browser fetches. Not verified through this tool; not faked.
- **LinkedIn Post Inspector** requires Tushar's login. URLs to paste are listed in `docs/og/m-009/README.md` — includes the broken essay URL so the failure is visible there too.

## Minor observation (not a failure)

`home.png` and `case-teachspark.png` downloaded from this preview differ byte-for-byte from the PNGs TKT-78 committed, even though `lib/og.tsx`, the two routes, and the source `hero-poster.webp` are unchanged between TKT-78's commit and `2bd4949` (`git diff --stat 2bd4949 f121e25` touches neither). A pixel diff localizes the difference to the poster region only (max channel delta 37/255) — consistent with non-deterministic PNG palette quantization in `sharp` (`lib/og.tsx` `loadPoster()`) across renders, not a content change. Dimensions/format/budget are all still within spec. Worth a look if OG image byte-determinism ever matters (e.g. CDN cache-busting by hash), but out of scope here.

## Files referenced

- `lib/og.tsx` (`renderOgCard`, all 7 families' shared template)
- `lib/seo.ts:63` (`buildMetadata`, the default `og:image` path bug)
- `app/thinking/[slug]/page.tsx:28-39` (`generateMetadata`, the call site missing the `image` override)
- `docs/reports/TKT-78.md` (prior OG re-skin report, referenced for expected sizes/design)
- `docs/og/m-009/README.md`, `docs/og/m-009/*.png` (this ticket's evidence)
