"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type View = "summary" | "deep";

export interface OverviewToggleProps {
  /** The 30-second summary view (rendered from `overview.thirtySecond`). Shown by default (AC 4). */
  summary: ReactNode;
  /** The deep-dive view (ChapterNav + chapters + ShowTheThinking). */
  deep: ReactNode;
}

const OPTIONS: { view: View; label: string }[] = [
  { view: "summary", label: "30-sec" },
  { view: "deep", label: "Deep dive" },
];

const PANEL_ID = "overview-panel";

/**
 * OverviewToggle (Design.md §3, TKT-19 AC 4): a 2-segment switch — "30-sec" (default) | "Deep dive"
 * — that swaps the 30-second summary for the full chapter list. The page renders this ONLY when a
 * project has a deep dive (`overview.deepDive` + ≥1 non-empty chapter); a thin project shows its
 * summary with no toggle, so an empty toggle never appears.
 *
 * The segments are a WAI-ARIA `radiogroup`: roving tabindex (only the checked radio is in the tab
 * order), arrow keys move and select, Space/Enter selects the focused segment, and the group as a
 * whole is one Tab stop. The active view fades in via the `.overview-panel` crossfade (globals.css),
 * which the reduced-motion rule collapses to instant. Only the active view is mounted, so the
 * panel's height tracks its content (the "layout animation absorbing the height change" reads as a
 * clean resize rather than a stacked overlay).
 */
export function OverviewToggle({ summary, deep }: OverviewToggleProps) {
  const [view, setView] = useState<View>("summary");
  const groupRef = useRef<HTMLDivElement>(null);

  const focusOption = (next: View) => {
    setView(next);
    const button = groupRef.current?.querySelector<HTMLButtonElement>(`button[data-view="${next}"]`);
    button?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusOption(view === "summary" ? "deep" : "summary");
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusOption(view === "deep" ? "summary" : "deep");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label="Case-study depth"
        onKeyDown={onKeyDown}
        className="inline-flex w-fit items-center gap-[var(--space-1)] rounded-[var(--radius-pill)] bg-ivory p-[var(--space-1)] shadow-[var(--shadow-utility)]"
      >
        {OPTIONS.map((option) => {
          const checked = option.view === view;
          return (
            <button
              key={option.view}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-controls={PANEL_ID}
              data-view={option.view}
              tabIndex={checked ? 0 : -1}
              onClick={() => setView(option.view)}
              className={[
                "min-h-11 rounded-[var(--radius-pill)] px-[var(--space-5)] text-caption font-semibold transition-[color,background-color] duration-200 ease-[var(--ease-hover)] focus-ring motion-reduce:transition-none",
                checked ? "bg-paper-2 text-navy shadow-[var(--shadow-utility)]" : "bg-transparent text-navy-2 hover:text-navy",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div id={PANEL_ID}>
        {/* `key` re-mounts the active view so the `.overview-panel` fade replays on every switch. */}
        <div key={view} className="overview-panel">
          {view === "summary" ? summary : deep}
        </div>
      </div>
    </div>
  );
}
