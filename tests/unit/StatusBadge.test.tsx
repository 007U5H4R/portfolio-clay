import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StatusBadge, type ProjectStatus } from "@/components/projects/StatusBadge";

const statuses: { status: ProjectStatus; label: string }[] = [
  { status: "live", label: "Live" },
  { status: "pilot", label: "Pilot" },
  { status: "prototype", label: "Prototype" },
  { status: "research", label: "Research" },
  { status: "archived", label: "Archived" },
];

describe("StatusBadge", () => {
  it.each(statuses)("renders an svg and the label for $status", ({ status, label }) => {
    const { container } = render(<StatusBadge status={status} statusLabel={label} />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toContain(label);
  });
});
