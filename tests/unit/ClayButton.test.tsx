import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ClayButton, type ClayButtonProps } from "@/components/clay/ClayButton";

describe("ClayButton", () => {
  it("renders a native button by default, type='button'", () => {
    const { container } = render(<ClayButton>Go</ClayButton>);
    const el = container.firstElementChild as HTMLButtonElement;
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
  });

  it("renders an anchor when href is present and passes 'download' through", () => {
    const { container } = render(
      <ClayButton href="/resume.pdf" download>
        Download
      </ClayButton>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/resume.pdf");
    expect(el.hasAttribute("download")).toBe(true);
  });

  it("E-7: primary is 'paper' text on 'rust', 'terracotta' on hover — never 'navy' on 'rust'", () => {
    const { container } = render(<ClayButton variant="primary">Primary</ClayButton>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/\bbg-rust\b/);
    expect(el.className).toMatch(/\btext-paper\b/);
    expect(el.className).toMatch(/hover:bg-terracotta/);
    expect(el.className).not.toMatch(/\btext-navy\b/);
  });

  it("meets the 44x44 minimum target classes", () => {
    const { container } = render(<ClayButton>Tap</ClayButton>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/min-h-11/);
    expect(el.className).toMatch(/min-w-11/);
  });

  it("renders an aria-label when iconOnly", () => {
    const { container } = render(
      <ClayButton variant="ghost" iconOnly aria-label="Open">
        icon
      </ClayButton>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("aria-label")).toBe("Open");
  });

  it("D1-style type gate: iconOnly without aria-label is a compile-time type error", () => {
    // @ts-expect-error — iconOnly:true requires 'aria-label' at the type level
    const invalid: ClayButtonProps = { iconOnly: true, children: "x" };
    expect(invalid).toBeTruthy();
  });
});
