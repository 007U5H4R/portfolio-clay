/**
 * eval-017.spec.ts (technical-plan.md §B S06.06, `@EVAL-017`) — the automated tag-level half of
 * EVAL-017 ("link previews render correctly"): for every page family currently built, asserts the
 * full `<title>` / meta description / canonical / OG / Twitter tag set, that every URL-bearing tag
 * is absolute `https://`, and that the `og:image`/`twitter:image` target actually serves a
 * 1200x630 PNG. The human half (LinkedIn Post Inspector + opengraph.xyz screenshots, TC-118) is
 * TKT-51, once a public preview URL exists.
 *
 * `og:image`'s host reflects `NEXT_PUBLIC_SITE_URL` — a placeholder `https://portfolio-clay.example`
 * origin for local build+test (`.env.tooling`, wired into `pnpm build` via `dotenv`), not this
 * Playwright run's own server — so the image is re-fetched by its *pathname* against the page's
 * real origin rather than the (non-resolving) placeholder host. The real production domain is
 * wired at TKT-53 and re-validated by TKT-51.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { test, expect } from "./fixtures";

const ROUTES = ["/", "/work", "/work/teachspark", "/contact"] as const;

const ABSOLUTE_HTTPS = /^https:\/\//;

async function metaContent(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).getAttribute("content");
}

for (const route of ROUTES) {
  test(
    `${route || "home"} carries the full SEO + OG/Twitter tag set with absolute https URLs`,
    { tag: "@EVAL-017" },
    async ({ page }) => {
      test.skip(
        (page.viewportSize()?.width ?? 0) !== 1440,
        "tag content is viewport-independent; runs once at w1440",
      );
      await page.goto(route, { waitUntil: "load" });

      // <title>
      await expect(page).toHaveTitle(/.+/);

      // meta description
      const description = await metaContent(page, 'meta[name="description"]');
      expect(description, "meta description must be present").toBeTruthy();

      // canonical
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, "canonical link must be present").toBeTruthy();
      expect(canonical, `canonical "${canonical}" must be absolute https://`).toMatch(
        ABSOLUTE_HTTPS,
      );

      // og:title / og:description / og:type
      const ogTitle = await metaContent(page, 'meta[property="og:title"]');
      const ogDescription = await metaContent(page, 'meta[property="og:description"]');
      const ogType = await metaContent(page, 'meta[property="og:type"]');
      expect(ogTitle, "og:title must be present").toBeTruthy();
      expect(ogDescription, "og:description must be present").toBeTruthy();
      expect(ogType, "og:type must be present").toBeTruthy();

      // og:image / og:url
      const ogImage = await metaContent(page, 'meta[property="og:image"]');
      const ogUrl = await metaContent(page, 'meta[property="og:url"]');
      expect(ogImage, "og:image must be present").toBeTruthy();
      expect(ogUrl, "og:url must be present").toBeTruthy();
      expect(ogImage, `og:image "${ogImage}" must be absolute https://`).toMatch(ABSOLUTE_HTTPS);
      expect(ogUrl, `og:url "${ogUrl}" must be absolute https://`).toMatch(ABSOLUTE_HTTPS);

      // twitter:card / twitter:image
      const twitterCard = await metaContent(page, 'meta[name="twitter:card"]');
      const twitterImage = await metaContent(page, 'meta[name="twitter:image"]');
      expect(twitterCard).toBe("summary_large_image");
      expect(twitterImage, "twitter:image must be present").toBeTruthy();
      expect(twitterImage, `twitter:image "${twitterImage}" must be absolute https://`).toMatch(
        ABSOLUTE_HTTPS,
      );

      // og:image actually serves a 200 PNG at 1200x630 (fetched by pathname against this run's
      // real server — see file header re: the placeholder og:image host).
      const imagePath = new URL(ogImage!).pathname;
      const res = await page.request.get(imagePath);
      expect(res.status(), `${imagePath} must return 200`).toBe(200);
      expect(res.headers()["content-type"], `${imagePath} must be image/png`).toBe("image/png");

      const bytes = await res.body();
      const info = await sharp(bytes).metadata();
      expect(info.width, `${imagePath} width`).toBe(1200);
      expect(info.height, `${imagePath} height`).toBe(630);
      expect(bytes.length, `${imagePath} size (${bytes.length}B) must be <= 300kB`).toBeLessThanOrEqual(
        300 * 1024,
      );
    },
  );
}

// ---------------------------------------------------------------------------
// robots.txt / sitemap.xml — S06.05 gate, folded into the same tag-level suite.
// ---------------------------------------------------------------------------
test("robots.txt allows crawling, disallows /dev/, and points at an absolute sitemap URL", {
  tag: "@EVAL-017",
}, async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "runs once at w1440");
  const res = await page.request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/Disallow:\s*\/dev\//);
  expect(body).toMatch(/Sitemap:\s*https:\/\/.+\/sitemap\.xml/);
});

test("sitemap.xml lists every built static route + personal project slug, no /dev/*", {
  tag: "@EVAL-017",
}, async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "runs once at w1440");
  const res = await page.request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length, "sitemap must list every static route + 1 (teachspark)").toBe(4);
  for (const loc of locs) {
    expect(loc, `sitemap entry "${loc}" must be absolute https://`).toMatch(ABSOLUTE_HTTPS);
    expect(loc, `sitemap entry "${loc}" must not expose a /dev/* route`).not.toMatch(/\/dev\//);
  }
  expect(locs.some((l) => l?.endsWith("/work/teachspark"))).toBe(true);
});

// Sanity: the local OFL licence file for the OG card's Manrope fonts is present and unmodified
// (S06.02) — cheap regression guard against the asset silently disappearing.
test("Manrope OFL licence ships alongside the OG font assets", { tag: "@EVAL-017" }, async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "filesystem check; runs once at w1440");
  const licence = readFileSync("assets/fonts/OFL.txt", "utf8");
  expect(licence).toContain("SIL OPEN FONT LICENSE");
});
