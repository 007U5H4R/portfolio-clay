import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

/**
 * WorkGrid reads the active filter from `useSearchParams`. Mock it so the empty branch (AC5) can be
 * exercised by INJECTING an empty dataset — the current real data never narrows a filter to zero, so
 * this is the only honest way to prove the EmptyState path renders.
 */
const searchMock = vi.fn(() => new URLSearchParams(""));
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchMock(),
}));

import { WorkGrid } from "@/components/projects/WorkGrid";
import { projects } from "@/data/projects";

const personal = projects.filter((p) => p.category === "personal");

afterEach(() => {
  cleanup();
  searchMock.mockReturnValue(new URLSearchParams(""));
});

describe("WorkGrid", () => {
  it("renders EmptyState when an injected dataset yields no matches", () => {
    render(<WorkGrid projects={[]} />);
    expect(screen.getByText("No projects match this filter")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Show all/ }).getAttribute("href")).toBe("/work");
    // The region is the tabpanel labelled by the (default) All tab.
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("filter-tab-all");
  });

  it("renders the editorial grid of cards for the default (all) filter", () => {
    render(<WorkGrid projects={personal} />);
    expect(screen.getByRole("link", { name: "TeachSpark" }).getAttribute("href")).toBe(
      "/work/teachspark",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(personal.length);
  });

  it("narrows to the matching subset when the filter param is set", () => {
    searchMock.mockReturnValue(new URLSearchParams("filter=cloud"));
    render(<WorkGrid projects={personal} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "RailCite" })).toBeTruthy();
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("filter-tab-cloud");
  });
});
