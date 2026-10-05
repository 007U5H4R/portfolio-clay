import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardBack } from "@/components/card/CardBack";

describe("CardBack (TASK-146.5, §32)", () => {
  it("renders the QR panel with a QR when the URL encodes", () => {
    const { container } = render(<CardBack url="https://example.com/card" hidden={false} />);
    expect(container.querySelector("[data-qr-panel] [data-qr] path")).not.toBeNull();
  });

  it("renders no QR frame at all when generation yields nothing", () => {
    const { container } = render(<CardBack url="" hidden={false} />);
    expect(container.querySelector("[data-qr-panel]")).toBeNull();
    expect(container.querySelector("[data-qr]")).toBeNull();
    // the rest of the card stays functional
    expect(container.querySelector("[data-save-contact]")).not.toBeNull();
  });

  it("is inert while hidden and has no Wallet anything", () => {
    const { container } = render(<CardBack url="https://example.com/card" hidden />);
    expect(container.querySelector("[data-face=back]")?.hasAttribute("inert")).toBe(true);
    expect(container.textContent ?? "").not.toMatch(/wallet|pkpass/i);
  });
});
