/**
 * TASK-249 (Tushar 2026-10-18): five personal projects are unlisted (kept with their case studies, off every
 * product list, noindex) and `/playground` is retired into `/projects`.
 */
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { generateMetadata } from "@/app/work/[slug]/page";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { buildPortfolioProducts, isListed, nextListedProject, parseProductParam } from "@/lib/portfolio";
import { buildMetadata } from "@/lib/seo";
import nextConfig from "@/next.config";

const UNLISTED = ["cubicle", "token-toli", "tegaki", "dino-arcade-pwa", "cinematic-portfolio"];
const personal = projects.filter((p) => p.category === "personal");
const art = () => ({ src: "/x.webp", width: 10, height: 10, alt: "x" }) as never;

describe("unlisted builds (TASK-249)", () => {
  it("exactly the five slugs are unlisted; their records and portfolio entries still exist", () => {
    expect(personal.filter((p) => !isListed(p)).map((p) => p.slug).sort()).toEqual([...UNLISTED].sort());
    for (const slug of UNLISTED) expect(portfolioEntries.some((e) => e.slug === slug), slug).toBe(true);
  });

  it("they are absent from the carousel products, which renumber over the listed builds", () => {
    const products = buildPortfolioProducts(projects, portfolioEntries, art);
    expect(products.map((p) => p.id)).toEqual(personal.filter(isListed).map((p) => p.slug));
    expect(products.map((p) => p.position)).toEqual(products.map((_, i) => i + 1));
    for (const slug of UNLISTED) expect(products.some((p) => p.id === slug), slug).toBe(false);
  });

  it("a ?product=<unlisted> deep link behaves like an unknown product (falls back to the default)", () => {
    const products = buildPortfolioProducts(projects, portfolioEntries, art);
    for (const slug of UNLISTED) expect(parseProductParam(slug, products), slug).toBeNull();
    expect(parseProductParam("teachspark", products)).toBe("teachspark");
  });

  it("still requires a portfolio entry for every personal build, listed or not", () => {
    expect(() => buildPortfolioProducts(projects, portfolioEntries.filter((e) => e.slug !== "tegaki"), art)).toThrow(/tegaki/);
  });

  it("the sitemap lists no unlisted /work page, no /playground, and keeps the listed ones", () => {
    const urls = sitemap().map((e) => e.url);
    for (const slug of UNLISTED) expect(urls.some((u) => u.endsWith(`/work/${slug}`)), slug).toBe(false);
    expect(urls.some((u) => u.endsWith("/playground"))).toBe(false);
    for (const p of personal.filter(isListed)) expect(urls.some((u) => u.endsWith(`/work/${p.slug}`)), p.slug).toBe(true);
  });

  it("each unlisted case-study page is noindex,follow; a listed one is unchanged", async () => {
    for (const slug of UNLISTED) {
      const meta = await generateMetadata({ params: Promise.resolve({ slug }) });
      expect(meta.robots, slug).toEqual({ index: false, follow: true });
    }
    expect((await generateMetadata({ params: Promise.resolve({ slug: "teachspark" }) })).robots).toBeUndefined();
    expect(buildMetadata({ title: "t", description: "d", path: "/" })).not.toHaveProperty("robots");
  });

  it("the next-project band never points at an unlisted slug, from any page", () => {
    for (const p of personal) {
      const next = nextListedProject(personal, p.slug);
      expect(isListed(next), `${p.slug} -> ${next.slug}`).toBe(true);
    }
    // An unlisted page links to the first listed build after it in data order.
    expect(nextListedProject(personal, "tegaki").slug).toBe("campfire-board");
    expect(nextListedProject(personal, "velora").slug).toBe("nuptis");
  });
});

describe("/playground retirement (TASK-249)", () => {
  it("next.config redirects /playground to /projects permanently", async () => {
    const rules = await nextConfig.redirects!();
    expect(rules).toContainEqual({ source: "/playground", destination: "/projects", permanent: true });
  });
});
