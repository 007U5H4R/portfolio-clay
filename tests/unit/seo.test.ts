import { afterEach, describe, expect, it } from "vitest";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { OG_HOME_ALT, OG_IMAGE_PATH } from "@/lib/og-home";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// A1/A8 env chain: NEXT_PUBLIC_SITE_URL (prod) -> VERCEL_PROJECT_PRODUCTION_URL ->
// VERCEL_URL (previews) -> http://localhost:3000. Every case clears all three first so results
// never depend on the ambient shell/CI environment.
const ENV_KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL", "VERCEL_ENV"] as const;

function clearSiteEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("siteUrl()", () => {
  afterEach(clearSiteEnv);

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    expect(siteUrl()).toBe("https://example.test");
  });

  it("strips a trailing slash from NEXT_PUBLIC_SITE_URL", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test/";
    expect(siteUrl()).toBe("https://example.test");
  });

  it("falls back to https://<VERCEL_URL> when NEXT_PUBLIC_SITE_URL is unset", () => {
    clearSiteEnv();
    process.env.VERCEL_URL = "clay-portfolio-preview.vercel.app";
    expect(siteUrl()).toBe("https://clay-portfolio-preview.vercel.app");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL only on a PRODUCTION build (VERCEL_ENV=production)", () => {
    clearSiteEnv();
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "clay-portfolio.vercel.app";
    process.env.VERCEL_URL = "clay-portfolio-abc123.vercel.app";
    expect(siteUrl()).toBe("https://clay-portfolio.vercel.app");
  });

  // CR-002 / QA-006 (Stage 9): Vercel sets VERCEL_PROJECT_PRODUCTION_URL on preview builds too. A
  // preview must self-reference via VERCEL_URL — otherwise its og:image/canonical point at a
  // production host that 404s until the first production deploy exists (observed live).
  it("on a PREVIEW build ignores the production host and uses VERCEL_URL", () => {
    clearSiteEnv();
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "clay-portfolio.vercel.app";
    process.env.VERCEL_URL = "clay-portfolio-git-branch-example.vercel.app";
    expect(siteUrl()).toBe("https://clay-portfolio-git-branch-example.vercel.app");
  });

  it("falls back to http://localhost:3000 when nothing is set", () => {
    clearSiteEnv();
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("buildMetadata()", () => {
  afterEach(clearSiteEnv);

  it("produces absolute https:// canonical and og:url from NEXT_PUBLIC_SITE_URL", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    const meta = buildMetadata({ title: "Work · Tushar Pathak", description: "Every project.", path: "/work" });
    expect(meta.alternates?.canonical).toBe("https://example.test/work");
    const og = meta.openGraph as { url?: string };
    expect(og.url).toBe("https://example.test/work");
  });

  it("resolves the home path ('/') without a double slash", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    const meta = buildMetadata({ title: "Tushar Pathak · Senior Product Manager", description: "Home.", path: "/" });
    const og = meta.openGraph as { url?: string };
    expect(og.url).toBe("https://example.test");
  });

  // TASK-227 (Tushar 2026-10-16): "the OG tag image of tusharpathak.com should be consistent for all links".
  it("every page shares the one og.jpg card (og:image + twitter:image, size and alt), whatever the path or type", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    const paths = ["/", "/work", "/projects", "/about", "/certifications", "/contact", "/card", "/playground", "/thinking", "/work/teachspark", "/thinking/some-essay"];
    for (const path of paths) {
      const meta = buildMetadata({ title: "t", description: "d", path, type: path.split("/").length > 2 ? "article" : "website" });
      const og = meta.openGraph as { images?: { url: string; width: number; height: number; alt: string }[] };
      expect(og.images, path).toEqual([{ url: `https://example.test${OG_IMAGE_PATH}`, width: 1200, height: 630, alt: OG_HOME_ALT }]);
      const tw = meta.twitter as { card?: string; images?: string[] };
      expect(tw.card).toBe("summary_large_image");
      expect(tw.images, path).toEqual([`https://example.test${OG_IMAGE_PATH}`]);
    }
  });

  it("the shared card URL follows the preview host (https://<VERCEL_URL>) when NEXT_PUBLIC_SITE_URL is unset", () => {
    clearSiteEnv();
    process.env.VERCEL_URL = "clay-portfolio-preview.vercel.app";
    const meta = buildMetadata({ title: "Contact · Tushar Pathak", description: "Reach out.", path: "/contact" });
    const og = meta.openGraph as { url?: string; images?: { url: string }[] };
    expect(og.url).toBe("https://clay-portfolio-preview.vercel.app/contact");
    expect(og.images?.[0]?.url).toBe("https://clay-portfolio-preview.vercel.app/og.jpg");
  });
});

// TASK-227: a per-route opengraph-image / twitter-image file would silently override the shared card for that route
// (file-based metadata wins over buildMetadata). None may exist anywhere under app/.
describe("one share card (TASK-227)", () => {
  it("no opengraph-image or twitter-image file exists under app/", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/^(opengraph-image|twitter-image)\./.test(entry.name)) hits.push(p);
      }
    };
    walk("app");
    expect(hits).toEqual([]);
  });
});
