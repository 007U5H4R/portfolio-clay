"use client";

import type { MouseEvent } from "react";
import { useAskContext } from "@/components/ai/AskProvider";

export type AskAIButtonProps = {
  /**
   * `icon` (default) — the 44 px icon-only ghost after the desktop nav (Design.md §4.1, S21);
   * `row` — the labelled 56 px row inside the `MobileMenu` sheet. Both carry the accessible name
   * "Ask AI" (the icon variant via `aria-label`), so the panel's keyboard scripts address one name.
   */
  variant?: "icon" | "row" | undefined;
};

/**
 * AskAIButton (Design.md §4.1, decision S21; TKT-71 restyle of the TKT-11 control) — opens the
 * global `AskPanel`. Rendered in two places (desktop header ghost, MobileMenu row), so on click it
 * records the exact element pressed as the panel's focus-return target — whichever trigger opened
 * the panel is the one focus returns to when it closes (EVAL-007).
 */
export function AskAIButton({ variant = "icon" }: AskAIButtonProps) {
  const { openPanel, panelOpen, triggerRef } = useAskContext();

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    openPanel();
  };

  const glyph = (
    <svg className="ask-glyph" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 2.5 C 10.6 6.2, 13.8 9.4, 17.5 10 C 13.8 10.6, 10.6 13.8, 10 17.5 C 9.4 13.8, 6.2 10.6, 2.5 10 C 6.2 9.4, 9.4 6.2, 10 2.5 Z" />
      <path d="M15.5 2.5 C 15.7 3.7, 16.3 4.3, 17.5 4.5 C 16.3 4.7, 15.7 5.3, 15.5 6.5 C 15.3 5.3, 14.7 4.7, 13.5 4.5 C 14.7 4.3, 15.3 3.7, 15.5 2.5 Z" />
    </svg>
  );

  if (variant === "row") {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={panelOpen}
        className="sheet-row sheet-row-ask focus-ring"
        onClick={onClick}
      >
        {glyph}
        Ask AI
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Ask AI"
      aria-haspopup="dialog"
      aria-expanded={panelOpen}
      className="header-ask focus-ring"
      onClick={onClick}
    >
      {glyph}
    </button>
  );
}
