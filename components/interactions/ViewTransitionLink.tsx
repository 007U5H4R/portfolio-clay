"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export type ViewTransitionLinkProps = ComponentProps<typeof Link> & {
  /**
   * The shared-element view-transition name for the destination morph, e.g. `project-teachspark`.
   */
  transitionName?: string | undefined;
};

/**
 * A14-row-1 fallback (decision EXE-5). The S06.01 breaker confirmed stable React 19.2.8 ships no
 * `<ViewTransition>` export, so this is a thin wrapper over `next/link` that renders **no** React
 * View-Transition element (nothing carries a `data-vt` marker — the S06.02 gate). Instead the
 * shared-element name is applied as a CSS `view-transition-name` on the anchor itself, so the
 * browser's native View Transitions API can still morph the card into the case-study media as a
 * free progressive enhancement wherever the App Router drives `startViewTransition`; where it does
 * not, navigation is plain with an identical end state (EVAL-015). `prefetch` keeps next/link's
 * default. If a stable React VT export later ships, re-introduce the element behind this one file.
 */
export function ViewTransitionLink({
  transitionName,
  style,
  children,
  ...linkProps
}: ViewTransitionLinkProps) {
  const mergedStyle = transitionName ? { viewTransitionName: transitionName, ...style } : style;

  return (
    <Link {...linkProps} style={mergedStyle}>
      {children}
    </Link>
  );
}
