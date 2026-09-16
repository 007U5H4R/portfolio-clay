import type { ReactNode } from "react";
import { ClayPill } from "@/components/clay/ClayPill";

export interface TagProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Static utility pill — `ink-2` text, deliberately no hover state, so it is never mistaken for
 * an interactive control (Law of Similarity note, Design.md §3 "Common primitives"). A thin
 * wrapper over `ClayPill variant="tag"` so tag styling lives in exactly one place; contrast with
 * `FilterTabs`' pills (`ClayPill variant="filter"`), which are interactive.
 */
export function Tag({ children, className }: TagProps) {
  return (
    <ClayPill variant="tag" className={className}>
      {children}
    </ClayPill>
  );
}
