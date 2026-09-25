import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

/**
 * WorkGrid / WorkIndex / ExperienceStrip read the active filter from `useSearchParams`. Mock it so
 * every filter — and the empty branch (Dev-05), which the real data never produces — can be
 * exercised by INJECTING the param / an empty dataset.
 */
const searchMock = vi.fn(() => new URLSearchParams(""));
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchMock(),
}));

import { ExperienceStrip } from "@/components/projects/ExperienceStrip";
import { WorkGrid } from "@/components/projects/WorkGrid";
import { WorkIndex } from "@/components/projects/WorkIndex";
import { projects } from "@/data/projects";
import { applyFilter } from "@/lib/filters";

const personal = projects.filter((p) => p.category === "personal");
const professional = projects.filter((p) => p.category === "professional");

const numerals = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("ol > li")).map((li) => li.querySelector("[data-numeral]")?.textContent);

afterEach(() => {
  cleanup();
  searchMock.mockReturnValue(new URLSearchParams(""));
});

describe("WorkGrid", () => {
  it("renders EmptyState (and no list) when an injected dataset yields no matches", () => {
    const { container } = render(<WorkGrid projects={[]} />);
    expect(screen.getByText("No projects match this filter")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Show all/ }).getAttribute("href")).toBe("/work");
    expect(container.querySelector("ol")).toBeNull();
    // The region is the tabpanel labelled by the (default) All tab.
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("filter-tab-all");
  });

  it("renders the numbered index for the default (all) filter — no EmptyState in the DOM (Dev-05)", () => {
    const { container } = render(<WorkGrid projects={personal} />);
    expect(screen.getByRole("link", { name: "TeachSpark" }).getAttribute("href")).toBe("/work/teachspark");
    expect(screen.getAllByRole("listitem")).toHaveLength(personal.length);
    expect(screen.queryByText("No projects match this filter")).toBeNull();
    expect(container.querySelector('[data-paper="index"]')).toBeNull();
  });

  it("narrows to the matching subset when the filter param is set", () => {
    searchMock.mockReturnValue(new URLSearchParams("filter=cloud"));
    render(<WorkGrid projects={personal} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "RailCite" })).toBeTruthy();
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("filter-tab-cloud");
  });
});

describe("WorkIndex (TKT-80 · TC-152)", () => {
  it("numbers the 11 personal builds 01–11 in data order", () => {
    const { container } = render(<WorkIndex projects={personal} />);
    expect(personal).toHaveLength(11);
    expect(numerals(container)).toEqual(personal.map((_, i) => String(i + 1).padStart(2, "0")));
    const slugs = Array.from(container.querySelectorAll("ol > li")).map((li) => li.getAttribute("data-slug"));
    expect(slugs).toEqual(personal.map((p) => p.slug));
  });

  it("re-sequences numerals from 01 for a filtered subset", () => {
    const subset = applyFilter(personal, "enterprise");
    const { container } = render(<WorkIndex projects={subset} />);
    expect(numerals(container)).toEqual(subset.map((_, i) => String(i + 1).padStart(2, "0")));
  });

  it("ranks: flagship (taped card) → second opener → slim rows", () => {
    const { container } = render(<WorkIndex projects={personal} />);
    const items = Array.from(container.querySelectorAll("ol > li"));
    expect(items.map((li) => li.getAttribute("data-rank"))).toEqual([
      "flagship",
      "second",
      ...Array.from({ length: personal.length - 2 }, () => "row"),
    ]);
    const flagship = items[0]!.querySelector('[data-paper="card"]');
    expect(flagship?.querySelectorAll('[data-fastener="tape"]')).toHaveLength(1);
  });

  it("every item holds exactly one link, to its case study", () => {
    const { container } = render(<WorkIndex projects={personal} />);
    for (const li of Array.from(container.querySelectorAll("ol > li"))) {
      const links = li.querySelectorAll("a");
      expect(links).toHaveLength(1);
      expect(links[0]!.getAttribute("href")).toBe(`/work/${li.getAttribute("data-slug")}`);
    }
  });

  it("the 'trust is the product.' sticky rides on RailCite only when it is the second opener", () => {
    const all = render(<WorkIndex projects={personal} />);
    const stickies = all.container.querySelectorAll('[data-decor="sticky"]');
    expect(stickies).toHaveLength(1);
    expect(stickies[0]!.closest("li")?.getAttribute("data-slug")).toBe("railcite");
    cleanup();
    // Cloud: RailCite is the flagship → no sticky (index unit stays ≤ 3).
    const cloud = render(<WorkIndex projects={applyFilter(personal, "cloud")} />);
    expect(cloud.container.querySelectorAll("[data-decor]")).toHaveLength(0);
  });

  it("shows status text (never colour alone) with the as-of date", () => {
    render(<WorkIndex projects={personal} />);
    const teachspark = personal.find((p) => p.slug === "teachspark")!;
    expect(screen.getByText(teachspark.statusLabel)).toBeTruthy();
    expect(screen.getAllByText("as of 9 Sep 2026").length).toBeGreaterThan(0);
  });
});

describe("ExperienceStrip (TKT-80 · TSK-41 · TC-153)", () => {
  it("renders three <details name=job> rows with verbatim role / name / duration", () => {
    const { container } = render(<ExperienceStrip projects={professional} />);
    const rows = container.querySelectorAll('details[name="job"]');
    expect(rows).toHaveLength(3);
    for (const project of professional) {
      const row = container.querySelector(`details[data-slug="${project.slug}"]`)!;
      expect(row.querySelector("summary")?.textContent).toContain(project.role);
      expect(row.textContent).toContain(project.name);
      expect(row.textContent).toContain(project.duration);
    }
  });

  it("has no link inside any row; the only link is 'See my experience →' → /about#experience", () => {
    const { container } = render(<ExperienceStrip projects={professional} />);
    expect(container.querySelectorAll("details a")).toHaveLength(0);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toBe("/about#experience");
  });

  it("the whole section (incl. its torn edge) is absent under Experiments", () => {
    searchMock.mockReturnValue(new URLSearchParams("filter=experiments"));
    const { container } = render(<ExperienceStrip projects={professional} />);
    expect(container.innerHTML).toBe("");
  });

  it("the section carries exactly one decoration (torn) — EVAL-018 strip = 1", () => {
    const { container } = render(<ExperienceStrip projects={professional} />);
    const decor = container.querySelectorAll("section [data-decor]");
    expect(Array.from(decor).map((d) => d.getAttribute("data-decor"))).toEqual(["torn"]);
  });
});
