"use client";

import { Compass } from "lucide-react";
import { requestTour } from "@/lib/tour";

/**
 * TASK-170 — the header's replayable "Take a tour" entry (>= 640; phones get the row in the More menu). A 44 px ghost
 * icon button styled like the Ask button (its own class: e2e specs click `button.header-ask`); it starts the tour (or goes home and starts it there) and is where focus
 * returns when the tour closes.
 */
export function TourButton() {
  return (
    <button
      type="button"
      aria-label="Take a tour"
      title="Take a tour"
      className="header-tour focus-ring"
      onClick={(e) => requestTour("menu", e.currentTarget)}
    >
      <Compass aria-hidden="true" size={20} strokeWidth={1.75} />
    </button>
  );
}
