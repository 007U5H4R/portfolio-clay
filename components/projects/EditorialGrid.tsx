"use client";

import { AnimatePresence, m } from "motion/react";
import type { Project } from "@/data/schema";
import { LazyMotionRoot, useReducedMotionSafe } from "@/lib/motion";
import { ProjectCard } from "./ProjectCard";

/**
 * Editorial project grid (TKT-16, Design.md §3 "Work page → EditorialGrid"). Never nine identical
 * rectangles: a 12-col grid ≥1024 where the FIRST card is the hero (8 cols × 2 rows), the next two
 * are the right-rail mediums (4 cols each, stacked beside the hero), and the rest flow 3-up (4 cols).
 * 768–1023 the hero goes full width and the rest are 2-up; < 768 everything is a single column. The
 * hierarchy is positional, not tied to a card's `gridSize`, so every filtered subset still reads as
 * an edited set with one lead card rather than a uniform matrix.
 *
 * Filter changes crossfade (Design.md §4 "Filter change": fade-out 150 / fade-in 200) via
 * `AnimatePresence` keyed by slug — opacity only (no `layout`, which needs `domMax`; the shared
 * `LazyMotionRoot` loads `domAnimation`), so cards reflow instantly while fading. `initial={false}`
 * means the first paint renders cards at full opacity (present in the prerendered/fallback HTML for
 * SEO + the crawler), with no entrance animation. Under reduced motion every transition is instant.
 */

const ENTER_SEC = 0.2; // Design.md §4 fade-in 200ms
const EXIT_SEC = 0.15; // Design.md §4 fade-out 150ms

/** Positional span classes: [0] hero, [1..2] rail mediums, rest 3-up smalls. */
function spanClass(index: number): string {
  if (index === 0) return "md:col-span-2 lg:col-span-8 lg:row-span-2";
  return "md:col-span-1 lg:col-span-4";
}

export interface EditorialGridProps {
  projects: Project[];
}

export function EditorialGrid({ projects }: EditorialGridProps) {
  const reduced = useReducedMotionSafe();
  const enter = reduced ? { duration: 0 } : { duration: ENTER_SEC };
  const exit = reduced ? { duration: 0 } : { duration: EXIT_SEC };

  return (
    <LazyMotionRoot>
      <ul className="grid list-none grid-cols-1 gap-[var(--space-6)] md:grid-cols-2 lg:grid-cols-12 lg:gap-[var(--space-8)]">
        <AnimatePresence initial={false}>
          {projects.map((project, index) => (
            <m.li
              key={project.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: enter }}
              exit={{ opacity: 0, transition: exit }}
              className={spanClass(index)}
            >
              <ProjectCard project={project} mode="grid" />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </LazyMotionRoot>
  );
}
