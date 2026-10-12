/**
 * The one delegated click listener (TASK-194). Runs in the capture phase, passive, and only does work
 * when something is clicked: it never calls preventDefault, never stops propagation and never waits for
 * the network, so links, downloads, the theme switch and the drawer behave exactly as before.
 */
import { classifyClick, describeAnchor, type Emit } from "./clicks";
import { pageNameFor } from "./pages";
import { canonicalPath } from "./sanitize";
import type { Tracker } from "./tracker";
import { site } from "@/lib/site";

const KNOWN = {
  linkedinPrefix: site.linkedin,
  resumePrefix: site.resumeUrl.split("?")[0] ?? site.resumeUrl,
};

export function emitAll(tracker: Tracker, events: Emit[]): void {
  for (const e of events) tracker.track(e.name, e.props as never);
}

export function installClickDelegation(tracker: Tracker): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.button > 1) return; // primary and middle (open in new tab); not context-menu
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    // The theme switch: record the visitor's own press (never the initial theme or a system flip).
    if (target.closest("[data-theme-toggle]")) {
      const from = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      tracker.track("theme_changed", { theme_from: from, theme_to: from === "dark" ? "light" : "dark" });
      return;
    }

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.getAttribute("href")?.startsWith("#")) return;
    const page = pageNameFor(canonicalPath(location.pathname));
    emitAll(tracker, classifyClick(describeAnchor(anchor, page, location.origin), KNOWN));
  };
  document.addEventListener("click", onClick, { capture: true, passive: true });
  document.addEventListener("auxclick", onClick, { capture: true, passive: true });
  return () => {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("auxclick", onClick, true);
  };
}
