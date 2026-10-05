import { afterEach, describe, expect, it } from "vitest";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { OG_FONT_FILES, OG_POSTER_PATH } from "@/lib/og";
import HomeOg from "@/app/opengraph-image";
import WorkOg from "@/app/work/opengraph-image";
import ProjectsOg from "@/app/projects/opengraph-image";
import CaseStudyOg from "@/app/work/[slug]/opengraph-image";
import AboutOg from "@/app/about/opengraph-image";
import ThinkingOg from "@/app/thinking/opengraph-image";
import PlaygroundOg from "@/app/playground/opengraph-image";
import ContactOg from "@/app/contact/opengraph-image";

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

// ---------------------------------------------------------------------------------------------
// TKT-78 / TC-150 — OG paper re-skin (Design.md §9, D11). Renders every page family's
// `opengraph-image.tsx` through the real `lib/og.tsx` template and checks the PNG it produces.
// ---------------------------------------------------------------------------------------------

const OG_FAMILIES: [string, () => Promise<Response>][] = [
  ["home", () => HomeOg()],
  ["work (Experience, TKT-101)", () => WorkOg()],
  ["projects", () => ProjectsOg()],
  ["case-teachspark", () => CaseStudyOg({ params: Promise.resolve({ slug: "teachspark" }) })],
  ["about", () => AboutOg()],
  ["thinking", () => ThinkingOg()],
  ["playground", () => PlaygroundOg()],
  ["contact", () => ContactOg()],
];

/** Design.md §2.1 — the 13 paper hexes, the only colour literals `lib/og.tsx` may hold (EVAL-020). */
const PAPER_HEXES = [
  "#F7F1E7", "#FBF7EF", "#EFE7D8", "#0D1735", "#2E3854", "#5A6178", "#B64927",
  "#92381F", "#214F43", "#496D58", "#63799E", "#EEDCA9", "#D7BE93",
];

describe("OG cards (TC-150)", () => {
  for (const [family, render] of OG_FAMILIES) {
    it(`${family}: renders a 1200x630 PNG <= 300 kB`, async () => {
      const res = await render();
      const bytes = Buffer.from(await res.arrayBuffer());
      const info = await sharp(bytes).metadata();
      expect(info.format).toBe("png");
      expect(info.width).toBe(1200);
      expect(info.height).toBe(630);
      expect(bytes.length, `${family} is ${bytes.length} B`).toBeLessThanOrEqual(300 * 1024);
    }, 30_000);
  }

  it("lib/og.tsx holds exactly the 13 paper hexes and no other colour literal", () => {
    const src = readFileSync("lib/og.tsx", "utf8");
    const hexes = [...src.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((m) => m[0].toUpperCase());
    expect(new Set(hexes)).toEqual(new Set(PAPER_HEXES));
    expect(src).not.toMatch(/\b(?:oklch|oklab|hsla?)\(/);
  });

  it("no route reads the avatar poster or the clay tiers; the hero poster is the image", () => {
    const src = readFileSync("lib/og.tsx", "utf8");
    expect(src).not.toMatch(/avatar|components\/clay/);
    expect(OG_POSTER_PATH).toBe("public/media/illustrations/hero-poster.webp");
  });

  it("assets/fonts holds exactly the 4 static TTFs + OFL.txt naming all three families", () => {
    const files = readdirSync("assets/fonts").sort();
    expect(files).toEqual([...Object.values(OG_FONT_FILES), "OFL.txt"].sort());
    const licence = readFileSync("assets/fonts/OFL.txt", "utf8");
    for (const family of ["Fraunces", "Inter", "Caveat"]) expect(licence).toContain(family);
    expect(licence).toContain("SIL Open Font License");
  });

  // The retired OG font's name is assembled at runtime so this guard itself doesn't show up in
  // TC-150 step 3's `grep -rni <name> lib app assets tests`.
  const RETIRED_FONT = new RegExp(["man", "rope"].join(""), "i");
  it("no file or reference to the retired clay OG font remains in lib/, app/, assets/", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (RETIRED_FONT.test(entry.name)) hits.push(p);
        else if (/\.(tsx?|css|txt)$/.test(entry.name) && RETIRED_FONT.test(readFileSync(p, "utf8")))
          hits.push(p);
      }
    };
    for (const dir of ["lib", "app", "assets"]) walk(dir);
    expect(hits).toEqual([]);
  });
});
