/**
 * theme.test.ts (EVAL-023 logic layer; Design.md §13.2, decision S25) — resolution order, persistence
 * and the pre-paint script, all against the one module the page and the toggle share.
 */
import { describe, it, expect } from "vitest";
import { THEME_KEY, parseTheme, resolveTheme, readSavedTheme, saveTheme, themeInitScript } from "@/lib/theme";

function storage(initial: Record<string, string> = {}, throwing = false): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    getItem: (k) => {
      if (throwing) throw new Error("denied");
      return data.get(k) ?? null;
    },
    setItem: (k, v) => {
      if (throwing) throw new Error("denied");
      data.set(k, String(v));
    },
    removeItem: (k) => void data.delete(k),
  };
}

describe("parseTheme", () => {
  it("accepts only light|dark", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    for (const bad of ["", "DARK", "system", "1", null, undefined, 3]) expect(parseTheme(bad)).toBeNull();
  });
});

describe("resolveTheme — saved > system > light", () => {
  it("saved choice beats the system, both ways", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("no saved choice follows the system", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
  it("unknown system preference falls back to light", () => {
    expect(resolveTheme(null, null)).toBe("light");
  });
});

describe("persistence", () => {
  it("round-trips an explicit choice under portfolio-theme", () => {
    const s = storage();
    saveTheme("dark", s);
    expect(s.getItem(THEME_KEY)).toBe("dark");
    expect(THEME_KEY).toBe("portfolio-theme");
    expect(readSavedTheme(s)).toBe("dark");
  });
  it("malformed or unreadable storage reads as no choice and never throws", () => {
    expect(readSavedTheme(storage({ [THEME_KEY]: "purple" }))).toBeNull();
    expect(readSavedTheme(storage({}, true))).toBeNull();
    expect(() => saveTheme("light", storage({}, true))).not.toThrow();
    expect(readSavedTheme(undefined)).toBeNull();
  });
});

describe("themeInitScript (the inline pre-paint script)", () => {
  function run(opts: { saved?: string; dark?: boolean; throwing?: boolean }) {
    const attrs: Record<string, string> = {};
    const doc = { documentElement: { dataset: attrs, style: {} as Record<string, string> } };
    const win = {
      localStorage: storage(opts.saved ? { [THEME_KEY]: opts.saved } : {}, opts.throwing),
      matchMedia: (q: string) => ({ matches: q.includes("dark") && !!opts.dark }),
    };
    new Function("document", "window", themeInitScript)(doc, win);
    return { attrs, style: doc.documentElement.style, win };
  }
  it("sets data-theme exactly once from saved > system > light", () => {
    expect(run({ saved: "dark", dark: false }).attrs.theme).toBe("dark");
    expect(run({ saved: "light", dark: true }).attrs.theme).toBe("light");
    expect(run({ dark: true }).attrs.theme).toBe("dark");
    expect(run({ dark: false }).attrs.theme).toBe("light");
  });
  it("survives blocked storage and a bad value", () => {
    expect(run({ throwing: true, dark: true }).attrs.theme).toBe("dark");
    expect(run({ saved: "nonsense", dark: false }).attrs.theme).toBe("light");
  });
  it("never writes storage (only an explicit toggle choice is persisted)", () => {
    const { win } = run({ dark: true });
    expect(win.localStorage.length).toBe(0);
  });
  it("is tiny", () => {
    expect(themeInitScript.length).toBeLessThan(600);
  });
});
