"use client";

import { useEffect, useState } from "react";

export interface ChapterNavItem {
  /** Presentation anchor (`CHAPTER_ANCHORS[id].anchor`) — the `#hash` this link targets (E-3). */
  anchor: string;
  /** Human chapter title. */
  title: string;
  /** 1-based position among the rendered chapters (the "01".."08" label). */
  number: number;
}

export interface ChapterNavProps {
  /** ONLY the chapters that actually exist on the page — a nav link whose target id is absent would
   *  be a dead control (EVAL-011), so the page passes the rendered subset, never all eight. */
  items: ChapterNavItem[];
}

/**
 * Case-study chapter navigation (Design.md §3, Deviation §4): a sticky flat left rail ≥1024
 * (numbered 01–NN, active chapter bold + `accent` underline — Law of Continuity marking the active
 * point on the path) and a sticky horizontal scrollable pill row <1024 (a fixed rail at tablet
 * width would eat into the 600px prose measure). Both variants render the SAME links and share one
 * active-chapter state driven by a single `IntersectionObserver`; only one is ever visible at a
 * time (`display:none` on the other), so no link is double-counted or double-crawled.
 *
 * The observer tracks which chapter section is in view and marks it `aria-current="location"`;
 * `rootMargin` biases the trigger line below the sticky header so the "current" chapter matches
 * what the reader actually sees. With JS off there is no active state — every link is still a real
 * anchor that resolves (EVAL-015): the nav degrades to a plain list of in-page links.
 */
export function ChapterNav({ items }: ChapterNavProps) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const sections = items
      .map((item) => document.getElementById(item.anchor))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost section currently intersecting the trigger band is the active chapter.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActiveAnchor(top.target.id);
      },
      // Trigger band sits just under the sticky header (top ~112px) so "current" tracks the reading
      // position, not the very top of the viewport.
      { rootMargin: "-112px 0px -55% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const numberLabel = (n: number) => String(n).padStart(2, "0");

  // `min-w-0` on the nav: as a grid item it must be allowed to shrink below its content width, or
  // the <1024 pill row's `overflow-x-auto` can't clip — the row would blow out the page (TKT-28 was
  // the first study to render chapters, surfacing this horizontal overflow at 390px).
  return (
    <nav aria-label="Chapters" className="min-w-0 lg:sticky lg:top-[7rem] lg:self-start">
      {/* ≥1024: vertical flat rail. */}
      <ul className="hidden flex-col gap-[var(--space-1)] lg:flex">
        {items.map((item) => {
          const active = item.anchor === activeAnchor;
          return (
            <li key={item.anchor}>
              <a
                href={`#${item.anchor}`}
                aria-current={active ? "location" : undefined}
                className={[
                  "flex min-h-11 items-center gap-[var(--space-3)] rounded-[var(--radius-utility)] px-[var(--space-3)] text-[length:var(--text-caption)] focus-ring",
                  active
                    ? "font-bold text-ink underline decoration-accent decoration-2 underline-offset-4"
                    : "text-ink-2 hover:text-ink",
                ].join(" ")}
              >
                <span className="tabular-nums text-ink-3">{numberLabel(item.number)}</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>

      {/* <1024: sticky horizontal scrollable pill row. */}
      <ul className="sticky top-[5rem] z-20 -mx-[var(--gutter-mobile)] flex gap-[var(--space-2)] overflow-x-auto bg-bg/90 px-[var(--gutter-mobile)] py-[var(--space-2)] backdrop-blur md:-mx-[var(--gutter-tablet)] md:px-[var(--gutter-tablet)] lg:hidden">
        {items.map((item) => {
          const active = item.anchor === activeAnchor;
          return (
            <li key={item.anchor} className="shrink-0">
              <a
                href={`#${item.anchor}`}
                aria-current={active ? "location" : undefined}
                className={[
                  "inline-flex min-h-11 items-center gap-[var(--space-2)] rounded-[var(--radius-pill)] px-[var(--space-4)] text-[length:var(--text-caption)] font-semibold focus-ring",
                  active ? "bg-lavender text-ink shadow-[var(--shadow-utility)]" : "bg-surface text-ink-2",
                ].join(" ")}
              >
                <span className="tabular-nums">{numberLabel(item.number)}</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
