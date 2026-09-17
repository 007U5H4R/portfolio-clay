import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { teachspark } from "@/data/projects";

describe("ProjectCard (featured)", () => {
  it("is exactly one link whose single accessible name is the project name", () => {
    render(<ProjectCard project={teachspark} mode="featured" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    // aria-label makes the project name the anchor's whole accessible name (not the card text).
    expect(links[0]?.getAttribute("aria-label")).toBe("TeachSpark");
    expect(links[0]?.getAttribute("href")).toBe("/work/teachspark");
  });

  it("renders the tagline, the status label, and up to three tags", () => {
    render(<ProjectCard project={teachspark} mode="featured" />);
    expect(screen.getByText(teachspark.tagline)).toBeTruthy();
    expect(screen.getByText(teachspark.statusLabel)).toBeTruthy();
    for (const tag of teachspark.tags.slice(0, 3)) {
      expect(screen.getByText(tag)).toBeTruthy();
    }
  });

  it("renders the arrow as presentational (aria-hidden), never a nested control", () => {
    const { container } = render(<ProjectCard project={teachspark} mode="featured" />);
    // Only the single card link is interactive; the arrow lives inside an aria-hidden wrapper.
    expect(container.querySelectorAll("a, button")).toHaveLength(1);
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("renders the same single-link anatomy in grid mode (TKT-16)", () => {
    render(<ProjectCard project={teachspark} mode="grid" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("aria-label")).toBe("TeachSpark");
    expect(links[0]?.getAttribute("href")).toBe("/work/teachspark");
    expect(links[0]?.getAttribute("data-card-mode")).toBe("grid");
    expect(screen.getByText(teachspark.tagline)).toBeTruthy();
  });
});
