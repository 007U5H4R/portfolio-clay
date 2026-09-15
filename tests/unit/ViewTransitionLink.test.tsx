import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";

describe("ViewTransitionLink (A14 fallback — EXE-5)", () => {
  it("renders a plain anchor and no React View-Transition element", () => {
    // jsdom has no document.startViewTransition; the fallback must never render a VT wrapper.
    expect("startViewTransition" in document).toBe(false);

    const { container } = render(
      <ViewTransitionLink href="/work/teachspark" transitionName="project-teachspark">
        TeachSpark
      </ViewTransitionLink>,
    );

    // S06.02 gate: nothing carries the VT marker in the fallback path.
    expect(container.querySelector("[data-vt]")).toBeNull();

    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBe("/work/teachspark");
    expect(anchor?.textContent).toBe("TeachSpark");
  });

  it("applies the shared-element name as a CSS view-transition-name hook", () => {
    const { container } = render(
      <ViewTransitionLink href="/work/teachspark" transitionName="project-teachspark">
        TeachSpark
      </ViewTransitionLink>,
    );
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    expect(anchor.style.viewTransitionName).toBe("project-teachspark");
  });

  it("omits the hook when no transitionName is given", () => {
    const { container } = render(
      <ViewTransitionLink href="/work/teachspark">TeachSpark</ViewTransitionLink>,
    );
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    expect(anchor.style.viewTransitionName).toBe("");
  });
});
