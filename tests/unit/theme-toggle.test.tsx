/**
 * theme-toggle.test.tsx (EVAL-024 logic layer; toggle.md §39–§41) — the one switch, against the one theme system.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { THEME_KEY } from "@/lib/theme";

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}

beforeEach(() => {
  // Node 26 ships an experimental global `localStorage` that shadows jsdom's; pin a plain in-memory one.
  Object.defineProperty(window, "localStorage", { value: memoryStorage(), configurable: true });
  document.documentElement.dataset.theme = "light";
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("ThemeToggle", () => {
  it("is one switch named for its action, with LIGHT / DARK as real text", () => {
    render(<ThemeToggle />);
    const sw = screen.getByRole("switch", { name: "Use dark theme" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(sw.textContent).toMatch(/Light/);
    expect(sw.textContent).toMatch(/Dark/);
  });

  it("click applies dark, persists the explicit choice, and aria-checked follows data-theme", () => {
    render(<ThemeToggle />);
    const sw = screen.getByRole("switch");
    act(() => {
      fireEvent.click(sw);
    });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(sw).toHaveAttribute("aria-checked", "true");
    act(() => {
      fireEvent.click(sw);
    });
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("reflects a theme the pre-paint script already set (dark on mount)", () => {
    document.documentElement.dataset.theme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("renders no <img> and no filter (art is background layers; EVAL-026)", () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelectorAll("img").length).toBe(0);
  });
});
