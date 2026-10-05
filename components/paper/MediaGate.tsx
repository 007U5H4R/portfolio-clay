"use client";

import { useEffect, useState, type ReactNode } from "react";

export type MediaGateProps = {
  /** Render children only at viewport widths ≥ `min` px. */
  min?: number | undefined;
  /** Render children only at viewport widths ≤ `max` px. */
  max?: number | undefined;
  children: ReactNode;
};

/** Builds the `(min-width: …) and (max-width: …)` query; exported for the unit test. */
export function mediaGateQuery(min?: number, max?: number): string {
  const parts: string[] = [];
  if (min !== undefined) parts.push(`(min-width: ${min}px)`);
  if (max !== undefined) parts.push(`(max-width: ${max}px)`);
  return parts.join(" and ");
}

/**
 * Width-gated decoration wrapper (decision TP14, technical-plan E-16; Design.md §3.2 rule 3). Renders
 * `null` on the server and on the first client render, so the SSR HTML never contains a width-gated
 * decoration; one mount effect evaluates `matchMedia` **once** and mounts the children only while it
 * matches. No live subscription (same reasoning as TP13 — a mid-session resize never re-decides).
 * Decorations only: content that must be in the SSR HTML never goes through this gate.
 */
export function MediaGate({ min, max, children }: MediaGateProps) {
  const [matches, setMatches] = useState(false);
  const query = mediaGateQuery(min, max);

  useEffect(() => {
    if (!query || typeof window.matchMedia !== "function") return;
    // The one deliberate mount-time setState (TP14): the server cannot know the width, the first
    // client render must match the SSR HTML (nothing), and a subscription is what TP14 rejected.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(window.matchMedia(query).matches);
  }, [query]);

  return matches ? <>{children}</> : null;
}
