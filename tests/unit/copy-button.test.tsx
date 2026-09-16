/**
 * copy-button.test.tsx (TKT-14 / technical-plan.md §B S14.01) — the CopyButton clipboard machine.
 *
 * Covers the two branches the in-page control relies on: a resolved `writeText` flips it to
 * `copied`; a rejected/absent Clipboard API flips it to `error`, warns `[copy]` to the console
 * (A12: never silent), and renders the value as selectable text so the user is never stuck. The
 * controlled `state` prop (used by the /dev/primitives board) still pins a fixed visual.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopyButton } from "@/components/common/CopyButton";

const EMAIL = "Tushar_Pathak@outlook.com";

function setClipboard(writeText: (v: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

describe("CopyButton — clipboard behaviour (S14.01)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Remove the stubbed clipboard so suites don't leak into each other.
    delete (navigator as { clipboard?: unknown }).clipboard;
  });

  it("writes the value and flips to `copied` when the clipboard resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    render(<CopyButton value={EMAIL} />);
    const button = screen.getByRole("button", { name: `Copy ${EMAIL}` });
    expect(button).toHaveAttribute("data-state", "idle");

    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute("data-state", "copied"));
    expect(writeText).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole("status")).toHaveTextContent(`Copied ${EMAIL}`);
  });

  it("falls back to selectable text and warns `[copy]` when the clipboard rejects", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setClipboard(vi.fn().mockRejectedValue(new Error("blocked")));

    render(<CopyButton value={EMAIL} />);
    const button = screen.getByRole("button", { name: `Copy ${EMAIL}` });
    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute("data-state", "error"));
    // Selectable-text fallback carries the value (A12: no dead end).
    const output = screen.getByText(EMAIL, { selector: "output" });
    expect(output).toBeInTheDocument();
    expect(screen.getByText("Select to copy")).toBeInTheDocument();
    // Failure surfaced, never swallowed.
    expect(warn).toHaveBeenCalledWith("[copy]", expect.any(Error));
  });

  it("flips to `error` (no throw) when the Clipboard API is entirely absent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // No clipboard defined on navigator (afterEach deleted it).
    render(<CopyButton value={EMAIL} />);
    const button = screen.getByRole("button", { name: `Copy ${EMAIL}` });
    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute("data-state", "error"));
    expect(warn).toHaveBeenCalledWith("[copy]", expect.any(Error));
  });

  it("honours a controlled `state` prop and stays inert on click (showcase board)", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    render(<CopyButton value={EMAIL} state="copied" />);
    const button = screen.getByRole("button", { name: `Copied ${EMAIL}` });
    expect(button).toHaveAttribute("data-state", "copied");

    fireEvent.click(button);
    expect(writeText).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("data-state", "copied");
  });
});
