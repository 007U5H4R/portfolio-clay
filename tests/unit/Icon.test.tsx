import { Sparkles } from "lucide-react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "@/components/common/Icon";

describe("Icon", () => {
  it("is aria-hidden when no label is given", () => {
    const { container } = render(<Icon icon={Sparkles} />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.hasAttribute("aria-label")).toBe(false);
  });

  it("becomes an accessible img when a label is given", () => {
    const { container } = render(<Icon icon={Sparkles} label="Highlight" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-label")).toBe("Highlight");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.hasAttribute("aria-hidden")).toBe(false);
  });
});
