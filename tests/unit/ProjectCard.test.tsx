/**
 * TKT-75 (TC-147 step 1, S75.01 gate) — the featured `ProjectCard` + `FeaturedWork` render the
 * `data/projects.ts` records verbatim (D7): name, tagline, tags, statusLabel, and each chosen
 * metric's value / label / kind / asOf. Exactly one `a` per card, `aria-label` = name,
 * `href="/work/<slug>"`; ≤ 2 fasteners per card; section decorations = 4.
 */
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { FEATURED, FEATURED_METRICS, FeaturedWork, featuredMetrics } from "@/components/projects/FeaturedWork";
import { railcite, teachspark, velora } from "@/data/projects";
import { formatAsOf } from "@/lib/format";

const text = (el: Element | null | undefined) => el?.textContent ?? "";

describe("ProjectCard (featured)", () => {
  it("is exactly one link whose accessible name is the project name", () => {
    const { container } = render(<ProjectCard project={teachspark} metrics={featuredMetrics(teachspark)} size="large" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("aria-label")).toBe("TeachSpark");
    expect(links[0]?.getAttribute("href")).toBe("/work/teachspark");
    expect(container.querySelectorAll("a, button")).toHaveLength(1);
    // EXE-5 CSS-only VT name on the anchor.
    expect((links[0] as HTMLElement).style.viewTransitionName).toBe("project-teachspark");
  });

  it("renders kicker tags, status, name and tagline byte-equal to the record", () => {
    for (const project of [teachspark, railcite, velora]) {
      const { container, unmount } = render(<ProjectCard project={project} metrics={featuredMetrics(project)} />);
      expect(text(container.querySelector('[data-kicker="tags"]'))).toBe(project.tags.join(" · "));
      expect(text(container.querySelector('[data-kicker="status"]'))).toBe(project.statusLabel);
      expect(text(container.querySelector("h3"))).toBe(project.name);
      expect(text(container.querySelector(".work-card-tagline"))).toBe(project.tagline);
      unmount();
    }
  });

  it("renders each chosen metric's value, label, kind and asOf from the data", () => {
    for (const project of [teachspark, railcite, velora]) {
      const chosen = featuredMetrics(project);
      const { container, unmount } = render(<ProjectCard project={project} metrics={chosen} />);
      const rows = [...container.querySelectorAll(".work-metric")];
      expect(rows).toHaveLength(chosen.length);
      rows.forEach((row, i) => {
        const metric = chosen[i]!;
        expect(project.metrics).toContainEqual(metric);
        expect(text(row.querySelector("[data-metric-value]"))).toBe(metric.value);
        expect(text(row.querySelector("[data-metric-label]"))).toBe(metric.label);
        expect(row.getAttribute("data-metric")).toBe(metric.kind);
        // A non-measured row says so (honesty: 37.5 min is self-reported, "0" is structural).
        if (metric.kind !== "measured") expect(text(row)).toContain(metric.kind);
      });
      const asOf = text(container.querySelector("[data-metric-asof]"));
      for (const metric of chosen) expect(asOf).toContain(formatAsOf(metric.asOf));
      unmount();
    }
  });

  it("shows the Design §7.1 metric sets; Velora drops the 10/10 unit tests (Dev-01)", () => {
    expect(featuredMetrics(teachspark).map((m) => m.value)).toEqual(["17", "8 (47%)", "37.5 min"]);
    expect(featuredMetrics(railcite).map((m) => m.value)).toEqual(["5,760", "0"]);
    expect(featuredMetrics(velora).map((m) => m.value)).not.toContain("10/10");
    for (const [slug, labels] of Object.entries(FEATURED_METRICS)) {
      expect(FEATURED.map((p) => p.slug)).toContain(slug);
      expect(labels.length).toBeGreaterThan(0);
    }
  });

  it("omits the metrics row when no rows are chosen", () => {
    const { container } = render(<ProjectCard project={velora} metrics={[]} />);
    expect(container.querySelector(".work-metrics")).toBeNull();
  });

  it("carries ≤ 2 fasteners and a case-study cta inside the single link", () => {
    const { container } = render(<ProjectCard project={railcite} metrics={featuredMetrics(railcite)} />);
    expect(container.querySelectorAll("[data-fastener]").length).toBeLessThanOrEqual(2);
    const link = screen.getByRole("link");
    expect(within(link).getByText("Read the case study →").getAttribute("data-hand")).toBe("cta");
  });
});

describe("FeaturedWork", () => {
  it("renders 3 cards in rank order linking to their case studies", () => {
    const { container } = render(<FeaturedWork />);
    const section = container.querySelector("section#work-featured");
    expect(section).not.toBeNull();
    const links = [...section!.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/work/teachspark", "/work/railcite", "/work/velora"]);
    expect(links.map((a) => a.getAttribute("aria-label"))).toEqual(["TeachSpark", "RailCite", "Nuptis → Velora"]);
  });

  it("counts exactly 4 decorations (torn · annotation · flow sketch · sticky) and ≤ 2 fasteners per card", () => {
    const { container } = render(<FeaturedWork />);
    const section = container.querySelector("section#work-featured")!;
    const decor = [...section.querySelectorAll("[data-decor]")].map((el) => el.getAttribute("data-decor"));
    expect(decor.sort()).toEqual(["annotation", "sketch", "sticky", "torn"]);
    for (const card of section.querySelectorAll('[data-paper="card"]')) {
      expect(card.querySelectorAll("[data-fastener]").length).toBeLessThanOrEqual(2);
    }
  });

  it("quotes RailCite's insight verbatim in the annotation", () => {
    const { container } = render(<FeaturedWork />);
    const quote = container.querySelector('[data-decor="annotation"]');
    expect(text(quote)).toContain("The feature is a citation. The product is trust.");
    expect(quote?.getAttribute("aria-hidden")).toBe("true");
  });
});
