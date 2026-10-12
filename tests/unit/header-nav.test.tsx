/**
 * header-nav.test.tsx (TASK-192) — the origami header's logic layer: the active tab follows the real route, the five tabs are real
 * links to the existing routes, and the header carries exactly one theme switch that drives the one theme system.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { activeNavHref, allNavItems, navItems } from "@/lib/nav";
import { THEME_KEY } from "@/lib/theme";

const mockPath = { current: "/" };
vi.mock("next/navigation", () => ({ usePathname: () => mockPath.current }));

const FIVE = ["Home", "Experience", "Portfolio", "About", "Certifications"];

describe("activeNavHref (route → current tab)", () => {
  it("marks each of the five tabs for its own route", () => {
    for (const item of navItems) expect(activeNavHref(item.href)).toBe(item.href);
  });

  it("marks nothing on a route that is not a tab, a nested route, or a hidden tab's route", () => {
    expect(activeNavHref("/contact")).toBeUndefined();
    expect(activeNavHref("/work/some-case-study")).toBeUndefined();
    expect(activeNavHref(null)).toBeUndefined();
    for (const item of allNavItems.filter((i) => i.hidden)) expect(activeNavHref(item.href)).toBeUndefined();
  });
});

describe("PrimaryNav", () => {
  beforeEach(() => {
    // jsdom has no ResizeObserver; the strip only uses it to show the right-edge fade.
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  it("renders the five tabs as links to their routes, in order, with the label as real text", () => {
    mockPath.current = "/";
    render(<PrimaryNav />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(FIVE);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(navItems.map((i) => i.href));
  });

  it.each(navItems.map((i) => [i.label, i.href] as const))("%s is the only aria-current tab on %s", (label, href) => {
    mockPath.current = href;
    render(<PrimaryNav />);
    const current = screen.getAllByRole("link").filter((l) => l.getAttribute("aria-current") === "page");
    expect(current.map((l) => l.textContent)).toEqual([label]);
  });

  it("no tab is current on a route that is not a tab", () => {
    mockPath.current = "/contact";
    render(<PrimaryNav />);
    expect(screen.getAllByRole("link").some((l) => l.hasAttribute("aria-current"))).toBe(false);
  });
});

describe("the header's theme switch", () => {
  beforeEach(() => {
    const m = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (k: string) => m.get(k) ?? null,
        setItem: (k: string, v: string) => void m.set(k, String(v)),
        removeItem: (k: string) => void m.delete(k),
      },
    });
    document.documentElement.dataset.theme = "light";
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it("two mounted switches stay in step: one `data-theme`, one stored key (no second theme state)", () => {
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    );
    const [a, b] = screen.getAllByRole("switch");
    act(() => {
      fireEvent.click(a!);
    });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(a).toHaveAttribute("aria-checked", "true");
    expect(b).toHaveAttribute("aria-checked", "true");
  });
});
