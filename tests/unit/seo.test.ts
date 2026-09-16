import { afterEach, describe, expect, it } from "vitest";
import { buildMetadata, siteUrl } from "@/lib/seo";

// A1/A8 env chain: NEXT_PUBLIC_SITE_URL (prod) -> VERCEL_PROJECT_PRODUCTION_URL ->
// VERCEL_URL (previews) -> http://localhost:3000. Every case clears all three first so results
// never depend on the ambient shell/CI environment.
const ENV_KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;

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

  it("prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL", () => {
    clearSiteEnv();
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "clay-portfolio.vercel.app";
    process.env.VERCEL_URL = "clay-portfolio-git-branch-example.vercel.app";
    expect(siteUrl()).toBe("https://clay-portfolio.vercel.app");
  });

  it("falls back to http://localhost:3000 when nothing is set", () => {
    clearSiteEnv();
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("buildMetadata()", () => {
  afterEach(clearSiteEnv);

  it("produces absolute https:// OG/Twitter/canonical URLs from NEXT_PUBLIC_SITE_URL", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

    const meta = buildMetadata({
      title: "Work · Tushar Pathak",
      description: "Every project.",
      path: "/work",
      ogFamily: "Selected Work",
    });

    expect(meta.alternates?.canonical).toBe("https://example.test/work");

    const og = meta.openGraph as { url?: string; images?: { url: string }[] };
    expect(og.url).toBe("https://example.test/work");
    expect(og.url).toMatch(/^https:\/\//);
    expect(og.images?.[0]?.url).toBe("https://example.test/work/opengraph-image");
    expect(og.images?.[0]?.url).toMatch(/^https:\/\//);

    const twitter = meta.twitter as { card?: string; images?: string[] };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images?.[0]).toBe("https://example.test/work/opengraph-image");
    expect(twitter.images?.[0]).toMatch(/^https:\/\//);
  });

  it("resolves the home path ('/') without a double slash", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

    const meta = buildMetadata({
      title: "Tushar Pathak · Senior Product Manager",
      description: "Home.",
      path: "/",
      ogFamily: "Home",
    });

    const og = meta.openGraph as { url?: string; images?: { url: string }[] };
    expect(og.url).toBe("https://example.test");
    expect(og.images?.[0]?.url).toBe("https://example.test/opengraph-image");
  });

  it("falls back to https://<VERCEL_URL> when NEXT_PUBLIC_SITE_URL is unset", () => {
    clearSiteEnv();
    process.env.VERCEL_URL = "clay-portfolio-preview.vercel.app";

    const meta = buildMetadata({
      title: "Contact · Tushar Pathak",
      description: "Reach out.",
      path: "/contact",
      ogFamily: "Contact",
    });

    const og = meta.openGraph as { url?: string; images?: { url: string }[] };
    expect(og.url).toBe("https://clay-portfolio-preview.vercel.app/contact");
    expect(og.url).toMatch(/^https:\/\//);
    expect(og.images?.[0]?.url).toBe(
      "https://clay-portfolio-preview.vercel.app/contact/opengraph-image",
    );
    expect(og.images?.[0]?.url).toMatch(/^https:\/\//);
  });

  it("accepts an explicit image override", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

    const meta = buildMetadata({
      title: "TeachSpark · Tushar Pathak",
      description: "A WhatsApp bot.",
      path: "/work/teachspark",
      ogFamily: "TeachSpark case study",
      image: "/work/teachspark/opengraph-image",
    });

    const og = meta.openGraph as { images?: { url: string }[] };
    expect(og.images?.[0]?.url).toBe("https://example.test/work/teachspark/opengraph-image");
  });
});
