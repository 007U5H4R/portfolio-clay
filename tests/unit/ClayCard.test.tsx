import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ClayCard } from "@/components/clay/ClayCard";

describe("ClayCard", () => {
  it.each(["hero", "card", "utility"] as const)("renders %s tier with a shadow class", (tier) => {
    const { container } = render(<ClayCard tier={tier}>content</ClayCard>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/shadow/);
  });

  it("renders flat tier with no shadow/gradient class", () => {
    const { container } = render(<ClayCard tier="flat">content</ClayCard>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toMatch(/shadow/);
    expect(el.className).not.toMatch(/gradient/);
  });

  it("adds hover/press/focus classes only when interactive", () => {
    const { container: withInteractive } = render(
      <ClayCard tier="card" interactive>
        x
      </ClayCard>,
    );
    const interactiveEl = withInteractive.firstElementChild as HTMLElement;
    expect(interactiveEl.className).toMatch(/hover:-translate-y-\[5px\]/);
    expect(interactiveEl.className).toMatch(/active:scale-\[\.98\]/);
    expect(interactiveEl.className).toMatch(/motion-reduce:hover:translate-y-0/);
    expect(interactiveEl.className).toMatch(/focus-ring/);

    const { container: withoutInteractive } = render(<ClayCard tier="card">x</ClayCard>);
    const plainEl = withoutInteractive.firstElementChild as HTMLElement;
    expect(plainEl.className).not.toMatch(/hover:-translate-y-\[5px\]/);
    expect(plainEl.className).not.toMatch(/focus-ring/);
  });

  it("renders as a polymorphic element via the 'as' prop (default div)", () => {
    const { container: defaultRender } = render(<ClayCard tier="card">x</ClayCard>);
    expect(defaultRender.firstElementChild?.tagName).toBe("DIV");

    const { container: sectionRender } = render(
      <ClayCard tier="card" as="section">
        x
      </ClayCard>,
    );
    expect(sectionRender.firstElementChild?.tagName).toBe("SECTION");
  });

  it("applies padding tokens", () => {
    const { container } = render(
      <ClayCard tier="hero" padding="hero">
        x
      </ClayCard>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/p-\[var\(--card-padding-hero\)\]/);
  });
});
