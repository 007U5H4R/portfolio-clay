"use client";

import { useEffect, useState } from "react";
import { Hand } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";

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

/** The nav mounts at this width and above (Design.md §7.3 / §11 Dev-09). */
export const CHAPTER_NAV_MIN_WIDTH = 1024;

/**
 * Case-study chapter navigation (TKT-83 / Design.md §7.3 deep dive, Dev-09): the sticky Fraunces rail
 * beside the chapters — Caveat numerals (`Hand label`), ink underline on the current chapter — rendered
 * **only at ≥ 1024 px**. Below that the mockup drops it, and per §3.2 rule 3 / TP14 it is removed from
 * the DOM through `MediaGate`, never hidden with CSS; the old sticky pill row is gone. SSR HTML therefore
 * never contains the nav; it mounts after hydration where the width allows (the page reserves its grid
 * column so nothing shifts).
 *
 * One `IntersectionObserver` tracks which chapter section is in the trigger band under the sticky
 * header and marks its link `aria-current="location"`. Links are plain in-page anchors: `SmoothScroll`
 * (TKT-94) intercepts same-document hash clicks site-wide and runs `scrollToTarget` (Lenis scroll clear
 * of the header + focus to the chapter); with native scroll the browser honours the chapter's
 * `scroll-margin-top`. With JS off there is no nav at all (a decoration-class element), and every chapter
 * is still reachable by reading order.
 */
export function ChapterNav({ items }: ChapterNavProps) {
  if (items.length === 0) return null;
  return (
    <MediaGate min={CHAPTER_NAV_MIN_WIDTH}>
      <ChapterNavRail items={items} />
    </MediaGate>
  );
}

function ChapterNavRail({ items }: ChapterNavProps) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const sections = items
      .map((item) => document.getElementById(item.anchor))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return undefined;

    // The set of chapters currently inside the trigger band; the topmost one is "current". Kept across
    // callbacks because an observer only reports the entries that CHANGED.
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const top = Array.from(visible).sort(
          (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
        )[0];
        if (top) setActiveAnchor(top.id);
      },
      // Trigger band sits just under the sticky header (7rem = 112px, the chapters' scroll-margin) so
      // "current" tracks the reading position, not the very top of the viewport.
      { rootMargin: "-112px 0px -55% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  const numberLabel = (n: number) => String(n).padStart(2, "0");

  return (
    <nav aria-label="Chapters" className="chapnav min-w-0 lg:col-start-1 lg:row-start-1">
      <p className="chapnav-eyebrow">Chapters</p>
      <ol>
        {items.map((item) => (
          <li key={item.anchor}>
            <a
              href={`#${item.anchor}`}
              aria-current={item.anchor === activeAnchor ? "location" : undefined}
              className="focus-ring rounded-[2px]"
            >
              <Hand kind="label" className="chapnav-num">
                {numberLabel(item.number)}
              </Hand>{" "}
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
