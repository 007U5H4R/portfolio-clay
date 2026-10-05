import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CopyButton } from "@/components/common/CopyButton";
import { ExternalLink } from "@/components/common/ExternalLink";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Prose } from "@/components/common/Prose";

// TKT-90a: moved verbatim from the retired tests/unit/clay.test.tsx (its clay blocks were deleted with the clay tree).
describe("Common primitives — S04.06", () => {
  it("VisuallyHidden renders sr-only text", () => {
    const { container } = render(<VisuallyHidden>note</VisuallyHidden>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bsr-only\b/);
  });

  it("Prose is a flat 68ch measure (no tier prop, no clay classes)", () => {
    const { container } = render(
      <Prose>
        <p>body</p>
      </Prose>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/max-w-\[68ch\]/);
    expect(el.className).not.toMatch(/shadow/);
  });

  it("ExternalLink opens a new tab, is marked inline, and announces it", () => {
    const { container } = render(
      <ExternalLink href="https://example.test">docs</ExternalLink>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toContain("noopener");
    expect(el.hasAttribute("data-inline-link")).toBe(true);
    expect(container.textContent).toContain("(opens in new tab)");
  });

  it("CopyButton renders each designed state label", () => {
    expect(render(<CopyButton value="x" state="idle" />).container.textContent).toContain("Copy");
    expect(render(<CopyButton value="x" state="copied" />).container.textContent).toContain("Copied");
    expect(render(<CopyButton value="x" state="error" />).container.textContent).toContain(
      "Copy failed",
    );
  });
});
