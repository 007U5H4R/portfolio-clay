import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ClayButton } from "@/components/clay/ClayButton";
import { CopyButton } from "@/components/common/CopyButton";
import { ExternalLink } from "@/components/common/ExternalLink";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Prose } from "@/components/common/Prose";
describe("ClayButton — S04.03 full", () => {
  it("loading sets aria-busy, disables the button and renders a spinner", () => {
    const { container } = render(<ClayButton loading>Save</ClayButton>);
    const el = container.firstElementChild as HTMLButtonElement;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.disabled).toBe(true);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("external link gets target/rel and a VisuallyHidden 'opens in new tab' note", () => {
    const { container } = render(
      <ClayButton href="https://example.test" external>
        Visit
      </ClayButton>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toContain("noopener");
    expect(container.textContent).toContain("(opens in new tab)");
  });

  it("size lg applies the larger token classes", () => {
    const { container } = render(<ClayButton size="lg">Big</ClayButton>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/min-h-12/);
    expect(el.className).toMatch(/px-8/);
  });
});

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
