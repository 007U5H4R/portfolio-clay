import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { applyFilter, filterHref, FILTERS, parseFilter } from "@/lib/filters";
import { projects } from "@/data/projects";
import { EmptyState } from "@/components/projects/EmptyState";

const personal = projects.filter((p) => p.category === "personal");
const slugs = (list: typeof projects) => list.map((p) => p.slug).sort();

describe("lib/filters", () => {
  it("exposes the five tabs in All → schema-enum order", () => {
    expect(FILTERS.map((f) => f.value)).toEqual(["all", "ai", "enterprise", "cloud", "experiments"]);
  });

  it("parseFilter accepts the four real values and collapses everything else to 'all'", () => {
    for (const value of ["ai", "enterprise", "cloud", "experiments"] as const) {
      expect(parseFilter(value)).toBe(value);
    }
    expect(parseFilter("all")).toBe("all");
    expect(parseFilter(null)).toBe("all");
    expect(parseFilter(undefined)).toBe("all");
    expect(parseFilter("")).toBe("all");
    expect(parseFilter("tab")).toBe("all"); // stray key value → 'all' (E-2)
    expect(parseFilter("AI")).toBe("all"); // case-sensitive
  });

  it("filterHref emits `/projects` for all and `/projects?filter=<f>` otherwise (E-2, never ?filter=all; TKT-101)", () => {
    expect(filterHref("all")).toBe("/projects");
    expect(filterHref("ai")).toBe("/projects?filter=ai");
    expect(filterHref("experiments")).toBe("/projects?filter=experiments");
  });

  it("applyFilter('all') returns the list unchanged", () => {
    expect(applyFilter(personal, "all")).toHaveLength(personal.length);
  });

  it("each filter yields exactly the data-derived personal-build set", () => {
    expect(slugs(applyFilter(personal, "ai"))).toEqual(["cubicle", "railcite", "teachspark"]);
    expect(slugs(applyFilter(personal, "enterprise"))).toEqual(["nuptis", "velora"]);
    expect(slugs(applyFilter(personal, "cloud"))).toEqual(["railcite"]);
    expect(slugs(applyFilter(personal, "experiments"))).toEqual([
      "bhakti-vilas",
      "cinematic-portfolio",
      "dino-arcade-pwa",
      "pratyasa",
      "tegaki",
      "token-toli",
      "velora",
    ]);
  });

  it("applyFilter can yield an empty set (an injected dataset with no match)", () => {
    // Injected empty datasets: an empty list, and a list whose only project matches no other bucket.
    expect(applyFilter([], "ai")).toEqual([]);
    const onlyAi = personal.filter((p) => p.filters.includes("ai"));
    expect(applyFilter(onlyAi, "cloud").filter((p) => !p.filters.includes("cloud")).length).toBe(0);
  });
});

describe("EmptyState (four-states empty case, TKT-16 AC5 → TKT-80 Dev-05)", () => {
  it("renders honest copy and a live 'Show all' link to /projects", () => {
    render(<EmptyState />);
    expect(screen.getByText("No projects match this filter")).toBeTruthy();
    const showAll = screen.getByRole("link", { name: /Show all/ });
    expect(showAll.getAttribute("href")).toBe("/projects");
  });

  it("is the pinned index card (content paper, not a decoration) with a Caveat cta label", () => {
    const { container } = render(<EmptyState />);
    const card = container.querySelector('[data-paper="index"]');
    expect(card).not.toBeNull();
    expect(card!.querySelector('[data-fastener="pin"]')).not.toBeNull();
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(0);
    const cta = screen.getByRole("link", { name: /Show all/ }).querySelector('[data-hand="cta"]');
    expect(cta?.textContent).toBe("Show all →");
  });
});
