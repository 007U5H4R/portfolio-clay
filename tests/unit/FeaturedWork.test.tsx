/**
 * TASK-133 — the home Featured Work showcase (Tushar's spec 2026-09-29 §2, §4–§8, §12–§15, §22–§24,
 * §26, §28). Exactly RailCite (anchor) · Slag City · Campfire Board, from the `featured` ranks; every
 * string read from the data (no invented copy); one real same-tab link per card to
 * `/projects?product=<slug>` with the spec's aria-label; RailCite's two proof points with their kind
 * stated honestly; the section carries one decoration (its torn edge).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { FEATURED, FeaturedWork, featuredCards, metricKindNote } from "@/components/projects/FeaturedWork";
import { featuredPresentation } from "@/data/featured";
import { portfolioEntries } from "@/data/portfolio";
import { projects, railcite } from "@/data/projects";
import { parseProductParam, productHref } from "@/lib/portfolio";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const text = (el: Element | null | undefined) => el?.textContent ?? "";
const SLUGS = ["railcite", "slag-city", "campfire-board"] as const;

describe("Featured Work data", () => {
  it("features exactly RailCite (rank 1, large), Slag City, Campfire Board", () => {
    expect(FEATURED.map((p) => p.slug)).toEqual([...SLUGS]);
    expect(FEATURED.map((p) => p.featured)).toEqual([1, 2, 3]);
    expect(projects.find((p) => p.gridSize === "large")?.slug).toBe("railcite");
    // TeachSpark and Nuptis → Velora stay in the collection (Portfolio + /work), just not featured.
    for (const slug of ["teachspark", "velora"]) {
      const project = projects.find((p) => p.slug === slug);
      expect(project, slug).toBeDefined();
      expect(project?.featured, slug).toBeUndefined();
    }
  });

  it("every featured product has a presentation entry and a manifest collage", () => {
    for (const slug of SLUGS) {
      const presentation = featuredPresentation[slug];
      expect(presentation, slug).toBeDefined();
      expect(ILLUSTRATIONS.some((e) => e.id === presentation!.art && e.usedOn.includes("/"))).toBe(true);
    }
  });

  it("only RailCite carries metrics — none are invented for Slag City / Campfire Board", () => {
    const cards = featuredCards();
    expect(cards.map((c) => c.metrics.length)).toEqual([2, 0, 0]);
    for (const metric of cards[0]!.metrics) expect(railcite.metrics).toContainEqual(metric);
    expect(cards[0]!.metrics.map((m) => [m.value, m.kind])).toEqual([
      ["5,760", "measured"],
      ["0", "structural"],
    ]);
    // the side cards carry no one-liner either (spec §6–§8)
    expect(featuredPresentation["slag-city"]?.line).toBeUndefined();
    expect(featuredPresentation["campfire-board"]?.line).toBeUndefined();
  });

  it("states each proof point's kind: the 5,760 is measured and dated, the 0 is structural", () => {
    const [docs, zero] = featuredCards()[0]!.metrics;
    expect(metricKindNote(docs!)).toBe("Measured · as of 15 Sep 2026");
    expect(metricKindNote(zero!)).toBe("Structural · by construction");
  });
});

describe("<FeaturedWork />", () => {
  // The one-shot `Reveal` entrance observes on mount; jsdom has no IntersectionObserver.
  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders the spec's head copy and no other paragraph", () => {
    const { container } = render(<FeaturedWork />);
    const section = container.querySelector("section#work-featured")!;
    expect(text(section.querySelector(".fw-eyebrow"))).toBe("Featured work");
    expect(text(section.querySelector("h2#work-featured-heading"))).toBe("Real problems. Real products.");
    expect(text(section.querySelector(".fw-sub"))).toBe(
      "Three products that show how I turn ambiguity into something people can actually use.",
    );
    expect(section.querySelectorAll(".fw-head p")).toHaveLength(2);
  });

  it("renders exactly three cards, in order, with names + verified cover lines — no TeachSpark / Velora", () => {
    const { container } = render(<FeaturedWork />);
    const section = container.querySelector("section#work-featured")!;
    const cards = [...section.querySelectorAll('article[data-paper="card"]')];
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => text(c.querySelector("h3")))).toEqual(["RailCite", "Slag City", "Campfire Board"]);
    expect(cards.map((c) => text(c.querySelector(".fw-tagline")))).toEqual(
      SLUGS.map((slug) => `${portfolioEntries.find((e) => e.slug === slug)!.coverLine}.`),
    );
    expect(text(cards[0]!.querySelector(".fw-line"))).toBe(featuredPresentation.railcite!.line);
    expect(text(section)).not.toMatch(/TeachSpark|Velora|Nuptis/);
    // the mockup's unsupported lines never appear
    expect(text(section)).not.toMatch(/Industrial intelligence|shared space for ideas|Better Ideas|Brighter People|Real Progress|Great Northern/);
  });

  it("each card has ONE link: same tab, /projects?product=<slug>, the spec's aria-label and CTA text", () => {
    const { container } = render(<FeaturedWork />);
    const cards = [...container.querySelectorAll('article[data-paper="card"]')];
    const want = [
      ["railcite", "Explore RailCite in Portfolio", "Explore case study"],
      ["slag-city", "Explore Slag City in Portfolio", "Explore"],
      ["campfire-board", "Explore Campfire Board in Portfolio", "Explore"],
    ] as const;
    cards.forEach((card, i) => {
      const links = card.querySelectorAll("a");
      expect(links).toHaveLength(1);
      const [slug, label, cta] = want[i]!;
      const link = links[0]!;
      expect(link.getAttribute("href")).toBe(productHref(slug));
      expect(link.getAttribute("href")).toBe(`/projects?product=${slug}`);
      expect(link.getAttribute("aria-label")).toBe(label);
      expect(link.hasAttribute("target")).toBe(false);
      expect(text(link).trim()).toBe(cta);
    });
    expect(container.querySelectorAll('a[href^="/work/"]')).toHaveLength(0);
  });

  it("every Explore target is a product id the Portfolio deep link accepts", () => {
    const ids = projects.filter((p) => p.category === "personal").map((p) => ({ id: p.slug }));
    for (const slug of SLUGS) expect(parseProductParam(slug, ids as never)).toBe(slug);
    expect(parseProductParam("not-a-product", ids as never)).toBeNull();
  });

  it("carries exactly one decoration (the torn edge) and ≤ 2 fasteners per card", () => {
    const { container } = render(<FeaturedWork />);
    const section = container.querySelector("section#work-featured")!;
    expect([...section.querySelectorAll("[data-decor]")].map((el) => el.getAttribute("data-decor"))).toEqual(["torn"]);
    for (const card of section.querySelectorAll('[data-paper="card"]')) {
      expect(card.querySelectorAll("[data-fastener]").length).toBeLessThanOrEqual(2);
    }
  });

  it("each card shows its own collage with its manifest alt", () => {
    const { container } = render(<FeaturedWork />);
    const imgs = [...container.querySelectorAll("img[data-illustration]")];
    expect(imgs.map((img) => img.getAttribute("data-illustration"))).toEqual(SLUGS.map((s) => `featured-${s}`));
    for (const img of imgs) {
      const entry = ILLUSTRATIONS.find((e) => e.id === img.getAttribute("data-illustration"))!;
      expect(img.getAttribute("alt")).toBe(entry.alt);
      expect(img.getAttribute("src")).toBe(entry.publicSrc);
    }
  });
});
