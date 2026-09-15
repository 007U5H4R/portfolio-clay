import { Sparkles } from "lucide-react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ClayTile } from "@/components/clay/ClayTile";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";

describe("ClayTile / ClayFrame / ClayIcon at default props", () => {
  it("ClayTile snapshot", () => {
    const { container } = render(<ClayTile>56</ClayTile>);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("ClayFrame snapshot", () => {
    const { container } = render(<ClayFrame>frame</ClayFrame>);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("ClayIcon snapshot", () => {
    const { container } = render(<ClayIcon icon={Sparkles} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("ClayFrame forwards style (for a later ViewTransition name)", () => {
    const { container } = render(<ClayFrame style={{ viewTransitionName: "project-teachspark" }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.viewTransitionName).toBe("project-teachspark");
  });

  it("ClayIcon renders a lucide svg inside a utility tile", () => {
    const { container } = render(<ClayIcon icon={Sparkles} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
