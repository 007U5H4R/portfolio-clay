import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProgressBar } from "@/components/interactions/ProgressBar";

// TC-133 (TKT-71 AC 6): the bar is an `aria-hidden` position indicator, marked `[data-progress]`,
// with no `role="progressbar"` (a hidden element carries no role); `--p` starts at 0 and the visual
// is `transform: scaleX(var(--p))` in CSS (`.reading-progress`).
describe("ProgressBar (Design.md §4.1 reading progress, TKT-71)", () => {
  it("renders one aria-hidden [data-progress] element with the reading-progress class and no role", () => {
    const { container } = render(<ProgressBar />);
    const bar = container.querySelector("[data-progress]");
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute("aria-hidden")).toBe("true");
    expect(bar!.getAttribute("role")).toBeNull();
    expect(bar!.className).toBe("reading-progress");
    expect(container.querySelectorAll("[role=progressbar]")).toHaveLength(0);
  });

  it("writes --p as the scroll fraction on mount (0 when the document does not scroll)", () => {
    const { container } = render(<ProgressBar />);
    const bar = container.querySelector<HTMLElement>("[data-progress]")!;
    expect(bar.style.getPropertyValue("--p")).toBe("0.0000");
  });

  it("server-renders without a transform value baked in (CSS owns scaleX(var(--p)))", () => {
    const html = renderToStaticMarkup(<ProgressBar />);
    expect(html).toContain('data-progress=""');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("transform");
  });
});
