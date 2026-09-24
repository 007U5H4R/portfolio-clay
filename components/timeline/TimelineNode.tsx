"use client";

import { forwardRef, type CSSProperties } from "react";
import type { Experience } from "@/data/schema";
import { formatRange } from "@/lib/format";
import { storyCardId } from "./timeline-logic";

export interface TimelineNodeProps {
  role: Experience;
  /** Ordinal (0-based) — drives desktop grid-column placement and arrow-key navigation. */
  index: number;
  /** Whether this node's `StoryCard` is currently open (sets `aria-expanded`). */
  isOpen: boolean;
  /** Toggle this node's card (Enter/Space fire the native button click → this). */
  onToggle: () => void;
}

/**
 * TimelineNode (TKT-41, Design.md §3) — one interactive node on the `ExperienceTimeline`: a real
 * `<button>` (so Enter/Space open it for free) carrying `aria-expanded` + `aria-controls` to its
 * `StoryCard`. It is the single focusable control per role.
 *
 * Layout is CSS-only across breakpoints so the static HTML is already correct (no hydration flash):
 *   - <1024 (vertical): a full-width row; the dot is absolutely positioned onto the rail's 24px
 *     left-inset connecting line, company label above its date range.
 *   - ≥1024 (horizontal): a centered column (label above the line, dot on the line, date below);
 *     each node paints its own full-width line SEGMENT behind the dot, so the four segments join
 *     into one continuous line and the hovered node's adjoining segment brightens to `ink-2`.
 *
 * Reduced motion (EVAL-010): the hover/focus dot-scale is disabled (`motion-reduce:*:scale-100`) so
 * nothing transforms; the visible affordance falls back to the segment/colour change + focus ring.
 * `data-node-index` lets the parent delegate arrow-key roving focus without per-node handlers.
 */
export const TimelineNode = forwardRef<HTMLButtonElement, TimelineNodeProps>(function TimelineNode(
  { role, index, isOpen, onToggle },
  ref,
) {
  // `formatRange` takes `end?: string | null`; under exactOptionalPropertyTypes an explicit
  // `undefined` isn't assignable, so only include `end` when the role actually has one.
  const dateRange = formatRange(
    role.dates.end ? { start: role.dates.start, end: role.dates.end } : { start: role.dates.start },
  );
  const label = role.companyNote ? `${role.company} (${role.companyNote})` : role.company;

  return (
    <button
      ref={ref}
      type="button"
      data-node-index={index}
      aria-expanded={isOpen}
      aria-controls={storyCardId(role.id)}
      onClick={onToggle}
      style={{ "--col": index + 1 } as CSSProperties}
      className={[
        "group relative flex w-full min-h-11 items-center gap-[var(--space-4)] rounded-[var(--radius-utility)] py-[var(--space-3)] pl-[var(--space-8)] text-left focus-ring",
        // Desktop: a centered column in its own grid track (row 1), no left inset.
        "lg:w-auto lg:flex-col lg:items-center lg:gap-[var(--space-2)] lg:py-[var(--space-3)] lg:pl-0 lg:px-[var(--space-2)] lg:text-center lg:[grid-row:1] lg:[grid-column:var(--col)]",
      ].join(" ")}
    >
      {/* Text block: a stacked label/date column on mobile; flattened into the button's own column
          flow at desktop (`lg:contents`) so label → dot → date order via the `order` utilities. */}
      <span className="flex min-w-0 flex-col lg:contents">
        <span className="font-bold text-navy lg:order-1">{label}</span>
        <span className="text-caption text-ink-soft lg:order-3">{dateRange}</span>
      </span>

      {/* Dot band: absolutely pinned onto the vertical rail line on mobile; a normal, centered
          flex child carrying the horizontal line segment on desktop. */}
      <span
        aria-hidden="true"
        className="absolute left-[var(--space-5)] top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:order-2 lg:flex lg:w-full lg:translate-x-0 lg:translate-y-0 lg:items-center lg:justify-center"
      >
        <span className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-ink-soft transition-colors duration-200 ease-[var(--ease-hover)] group-hover:bg-navy-2 group-focus-visible:bg-navy-2 lg:block" />
        <span
          data-timeline-dot
          className="relative size-3 rounded-full bg-ink-soft ring-4 ring-paper transition-transform duration-200 ease-[var(--ease-hover)] group-hover:scale-125 group-focus-visible:scale-125 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
        />
      </span>
    </button>
  );
});
