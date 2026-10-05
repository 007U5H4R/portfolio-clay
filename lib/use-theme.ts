"use client";

import { useSyncExternalStore } from "react";
import { parseTheme, readSavedTheme, resolveTheme, saveTheme, type Theme } from "@/lib/theme";

/**
 * The client side of the one theme system (Design.md §13.2, S25). There is NO second store: the source of
 * truth is `<html data-theme>`, written first by the inline pre-paint script (lib/theme.ts) and afterwards
 * only by `setTheme` (the toggle's click) or — while no explicit choice is saved — the live system listener
 * below. React never writes the attribute during hydration. `useTheme()` reads the attribute through
 * `useSyncExternalStore`: the server snapshot is `null`, so hydration cannot mismatch.
 */
const listeners = new Set<() => void>();
const SWITCH_MS = 360;
let switchTimer: ReturnType<typeof setTimeout> | undefined;

function root(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.documentElement;
}

function readAttribute(): Theme | null {
  return parseTheme(root()?.dataset.theme);
}

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Apply a theme to the page. An explicit toggle (`animate`) cross-fades the whole page through the View
 * Transitions API when the browser has it (one 240 ms dissolve — this is what swaps the paired art without a
 * filter and without a layout jump, dark-mode.md §43); otherwise the root is marked `data-theme-switching` for
 * the short selective colour transition. Reduced motion: neither, the theme simply changes.
 */
function apply(theme: Theme, animate: boolean) {
  const el = root();
  if (!el || el.dataset.theme === theme) return;
  const commit = () => {
    el.dataset.theme = theme;
    emit();
  };
  const still = !animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) return commit();
  if (typeof document.startViewTransition === "function") {
    el.dataset.themeVt = "";
    const vt = document.startViewTransition(commit);
    void vt.finished.finally(() => delete el.dataset.themeVt);
    return;
  }
  el.dataset.themeSwitching = "";
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => delete el.dataset.themeSwitching, SWITCH_MS);
  commit();
}

/** The toggle's click handler: persist the explicit choice, then apply it. */
export function setTheme(theme: Theme) {
  saveTheme(theme, window.localStorage);
  apply(theme, true);
}

function systemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  // Following the system (no saved choice): a runtime OS flip updates the attribute live. An explicit
  // choice ignores it (dark-mode.md §48).
  const onSystem = () => {
    if (!readSavedTheme(window.localStorage)) apply(resolveTheme(null, mq.matches), false);
  };
  // Another tab toggled: follow its saved choice.
  const onStorage = (e: StorageEvent) => {
    if (e.key === "portfolio-theme" || e.key === null) apply(resolveTheme(readSavedTheme(window.localStorage), systemDark()), false);
  };
  mq.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    mq.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

/** The active theme, or `null` on the server / before hydration finishes (never a wrong guess). */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, readAttribute, () => null);
}
