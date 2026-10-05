/**
 * Theme contract (Design.md §13.2, decision S25) — the ONE module behind the pre-paint script, the
 * header toggle and the live system listener. Resolution order: saved explicit choice → the system's
 * `prefers-color-scheme` → light. Only an explicit toggle choice is persisted, under `portfolio-theme`.
 * The attribute lives on `<html data-theme>`; React never writes it during hydration.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "portfolio-theme";
export const THEMES: readonly Theme[] = ["light", "dark"];

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

/** saved > system > light. `systemDark` is null when the platform cannot say. */
export function resolveTheme(saved: Theme | null, systemDark: boolean | null): Theme {
  if (saved) return saved;
  return systemDark ? "dark" : "light";
}

export function readSavedTheme(store: Pick<Storage, "getItem"> | undefined | null): Theme | null {
  try {
    return parseTheme(store?.getItem(THEME_KEY));
  } catch {
    return null; // private mode / blocked storage: fall through to the system preference
  }
}

export function saveTheme(theme: Theme, store: Pick<Storage, "setItem"> | undefined | null): void {
  try {
    store?.setItem(THEME_KEY, theme);
  } catch {
    /* unwritable storage: the choice still applies for this page view */
  }
}

/**
 * The inline script, as a string, for the first child of `<head>` (before any stylesheet, so there is no
 * wrong-theme first paint). It mirrors `resolveTheme` and writes the attribute once; it never writes
 * storage. Kept tiny and dependency-free; tests/unit/theme.test.ts runs it against fakes.
 */
export const themeInitScript =
  `try{var d=document.documentElement,s=null;try{s=window.localStorage.getItem("${THEME_KEY}")}catch(e){}` +
  `if(s!=="light"&&s!=="dark")s=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";` +
  `d.dataset.theme=s}catch(e){document.documentElement.dataset.theme="light"}`;
