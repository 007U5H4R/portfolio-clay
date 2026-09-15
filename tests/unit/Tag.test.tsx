import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Tag } from "@/components/common/Tag";

describe("Tag", () => {
  it("has no hover state (static, unlike FilterTabs)", () => {
    const { container } = render(<Tag>AI</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toMatch(/hover:/);
  });

  it("renders its label", () => {
    const { container } = render(<Tag>Product</Tag>);
    expect(container.textContent).toBe("Product");
  });
});
