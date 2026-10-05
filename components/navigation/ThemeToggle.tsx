"use client";

import { setTheme, useTheme } from "@/lib/use-theme";
import { parseTheme } from "@/lib/theme";

/**
 * ThemeToggle (TASK-141; toggle.md §25–§41, Design.md §13.2, EVAL-024) — the paper-cut Light / Dark switch
 * in the header's action cluster. ONE control: a `role="switch"` button whose name states the action
 * ("Use dark theme") and whose `aria-checked` is "dark is on". It reads and writes the one theme system
 * (`lib/use-theme`, the `<html data-theme>` attribute) — there is no second store.
 *
 * Art: the generated light + dark paper-cut scenes (`public/theme-toggle/*.webp`, two `<span>` background
 * layers — never a CSS filter, never one baked UI screenshot) cut into a paper capsule. The visual state is
 * driven purely by `[data-theme]` in CSS (so the first paint is already right, before React hydrates); the
 * `aria-checked` flips once hydrated. LIGHT / DARK are real text (visually hidden at this compact size).
 * Desktop shows both halves with the active half raised; below 640 it shows the active scene only.
 * Space/Enter toggle natively (a `<button>`); reduced motion removes the slide and the press.
 */
export function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";

  const onClick = () => {
    const current = theme ?? parseTheme(document.documentElement.dataset.theme) ?? "light";
    setTheme(current === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Use dark theme"
      title="Light / Dark"
      className="theme-toggle focus-ring"
      data-theme-toggle=""
      onClick={onClick}
    >
      <span className="tt-window" aria-hidden="true">
        <span className="tt-scene tt-scene-light" />
        <span className="tt-scene tt-scene-dark" />
        <span className="tt-veil tt-veil-light" />
        <span className="tt-veil tt-veil-dark" />
        <span className="tt-seam" />
      </span>
      <span className="tt-label tt-label-light sr-only">Light</span>
      <span className="tt-label tt-label-dark sr-only">Dark</span>
    </button>
  );
}
