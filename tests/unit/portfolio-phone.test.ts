import { describe, expect, it } from "vitest";
import { buildPortfolioProducts, detailHref, filterProducts, hasVideo, isListed, listHref, NO_FILTER, parseListFilter, statusOptions } from "@/lib/portfolio";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";

/**
 * TASK-210 — the phone listing's filters and URLs (lib/portfolio.ts). Everything derives from the project records:
 * statuses, videos, tags, metrics. The URL is the one source of truth for list vs detail.
 */
const resolveArt = (id: string) => ({ src: `/media/illustrations/covers/${id}.svg`, width: 1600, height: 900, alt: `Illustration of ${id}.` });
const products = buildPortfolioProducts(projects, portfolioEntries, resolveArt);
// TASK-249 (Tushar 2026-10-18): the listing shows listed builds only.
const personal = projects.filter(isListed);

describe("phone listing model (TASK-210)", () => {
  it("carries each project's own status, tags, role, build window and at most three metrics (verbatim, with their evidence kind)", () => {
    for (const product of products) {
      const project = personal.find((p) => p.slug === product.id)!;
      expect(product.status).toBe(project.status);
      expect(product.tags).toEqual(project.tags);
      expect(product.role).toBe(project.role);
      expect(product.duration).toBe(project.duration);
      expect(product.metrics).toEqual(project.metrics.slice(0, 3).map(({ value, label, kind }) => ({ value, label, kind })));
    }
  });

  it("offers one chip per status that some product has, in canonical order, with true counts", () => {
    const options = statusOptions(products);
    expect(options.map((o) => o.value)).toEqual(["live", "pilot", "prototype", "research"].filter((s) => personal.some((p) => p.status === s)));
    for (const option of options) expect(option.count).toBe(personal.filter((p) => p.status === option.value).length);
    expect(options.some((o) => (o.value as string) === "archived")).toBe(false); // enterprise-only status, never a product chip
  });

  it("filters without reordering: status, has-video, and both", () => {
    expect(filterProducts(products, NO_FILTER).map((p) => p.id)).toEqual(products.map((p) => p.id));
    const live = filterProducts(products, { status: "live", video: false });
    expect(live.map((p) => p.id)).toEqual(personal.filter((p) => p.status === "live").map((p) => p.slug));
    const video = filterProducts(products, { status: null, video: true });
    expect(video.every(hasVideo)).toBe(true);
    expect(video.map((p) => p.id)).toEqual(products.filter(hasVideo).map((p) => p.id));
    const both = filterProducts(products, { status: "prototype", video: true });
    expect(both.every((p) => p.status === "prototype" && hasVideo(p))).toBe(true);
  });

  it("a status with no video-bearing build yields an empty list (the page shows its empty state)", () => {
    // TASK-249 (Tushar 2026-10-18): the listed builds all carry a video per status, so strip one status's videos to reach the state.
    const stripped = products.map((p) => (p.status === "prototype" ? { ...p, pitchVideo: undefined, demoVideo: undefined } : p));
    const empty = statusOptions(stripped).find((o) => filterProducts(stripped, { status: o.value, video: true }).length === 0);
    expect(empty?.value).toBe("prototype");
  });

  it("round-trips filter and product through the URL; unknown values fall back to no filter", () => {
    const filter = { status: "pilot" as const, video: true };
    expect(listHref(filter)).toBe("/projects?filter=pilot&video=1");
    expect(listHref(NO_FILTER)).toBe("/projects");
    expect(detailHref("railcite", filter)).toBe("/projects?product=railcite&filter=pilot&video=1");
    expect(detailHref("railcite", NO_FILTER)).toBe("/projects?product=railcite");
    expect(parseListFilter(new URLSearchParams("filter=pilot&video=1"), products)).toEqual(filter);
    expect(parseListFilter(new URLSearchParams("filter=archived&video=0"), products)).toEqual(NO_FILTER);
    expect(parseListFilter(new URLSearchParams("filter=nonsense"), products)).toEqual(NO_FILTER);
  });
});
