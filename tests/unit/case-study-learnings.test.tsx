import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Learnings } from "@/components/case-study/Learnings";
import { getProject } from "@/data/projects";

/**
 * TC-157 — **S18 regression** (TKT-82 AC 1, AC 5; kept permanently): "What I learned" renders every
 * `learnings[]` string exactly once, verbatim and in data order, and an empty array renders no
 * section at all. Before M-009 this data was defined but never rendered.
 */

const FIXTURE = [
  "Green tests prove it runs; they don't prove it's right.",
  "Honest smaller numbers earn more trust than impressive fake ones.",
  "Distribution is a wedge, not the whole differentiation.",
] as const;

describe("Learnings — TC-157 (S18 regression)", () => {
  it("renders each learning exactly once, in data order, inside a region named 'What I learned'", () => {
    render(<Learnings learnings={FIXTURE} />);
    const region = screen.getByRole("region", { name: /what i learned/i });
    for (const learning of FIXTURE) expect(screen.getAllByText(learning)).toHaveLength(1);
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(FIXTURE.length);
    items.forEach((item, i) => expect(item).toHaveTextContent(FIXTURE[i]!));
  });

  it("negative control: a string one character off is not found", () => {
    render(<Learnings learnings={FIXTURE} />);
    expect(screen.queryByText(FIXTURE[0].replace("Green", "Gren"))).toBeNull();
  });

  it("renders nothing for [] — no region, no section.learned", () => {
    const { container } = render(<Learnings learnings={[]} />);
    expect(screen.queryByRole("region", { name: /what i learned/i })).toBeNull();
    expect(container.querySelector("section.learned")).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("owns exactly one decoration (the torn edge) and marks numerals as 2-digit data-hand labels (§3.3, §3.4)", () => {
    const { container } = render(<Learnings learnings={FIXTURE} />);
    const section = container.querySelector("section.learned")!;
    const decor = section.querySelectorAll("[data-decor]");
    expect(decor).toHaveLength(1);
    expect(decor[0]!.getAttribute("data-decor")).toBe("torn");
    expect(section.firstElementChild).toBe(decor[0]);
    const numerals = [...section.querySelectorAll('[data-hand="label"]')].map((el) => el.textContent);
    expect(numerals).toEqual(["01", "02", "03"]);
  });

  it("renders teachspark's real learnings verbatim", () => {
    const project = getProject("teachspark")!;
    expect(project.learnings.length).toBeGreaterThan(0);
    render(<Learnings learnings={project.learnings} />);
    for (const learning of project.learnings) expect(screen.getAllByText(learning)).toHaveLength(1);
  });
});
