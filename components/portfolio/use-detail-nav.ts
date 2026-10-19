"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

/** A drag past this many px, mostly sideways, steps one product (Tushar's brief: 40–60 px). */
export const SWIPE_THRESHOLD = 60;

const INTERACTIVE = "a[href], button, input, textarea, select, iframe, video, audio, [contenteditable], [role='slider'], [role='tab'], [data-no-swipe]";

/**
 * TASK-274: keyboard ←/→ and a horizontal drag on the product card (`.pf-info`) step to the previous / next product. Desktop only —
 * the caller passes `enabled = false` below 1024 px, so no handler is attached (no swipe on a phone). Never hijacks ←/→ while the
 * user is in a field, on a control that owns the key (a button group, a slider, the video) or has text selected, and a drag that
 * starts on a link, button or media control is left alone. The drag is read on release (no `preventDefault`, so text selection and
 * vertical scrolling keep working); `touch-action: pan-y` on the card lets a touch-screen laptop deliver the gesture.
 */
export function useDetailNav(enabled: boolean, step: (delta: number) => void) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  /** The last press was inside the card, so a focused-by-click panel (focus on the tabpanel itself) counts as "the card". */
  const context = useRef(false);

  if (!enabled) return {};

  const inCard = (target: EventTarget | null) => target instanceof Element && target.closest(".pf-info") !== null;

  return {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as Element;
      if (!(inCard(target) || (target === event.currentTarget && context.current)) || target.closest("input, textarea, select, iframe, video, audio, [contenteditable], [role='slider'], [role='tab']")) return;
      if (window.getSelection()?.toString()) return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      start.current = null;
      context.current = inCard(event.target);
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (!inCard(event.target) || (event.target as Element).closest(INTERACTIVE)) return;
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      // keep the release even when it lands on the video iframe beside the card (an iframe swallows its own pointer events)
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* a synthetic pointer: the release is simply read where it lands */
      }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const from = start.current;
      start.current = null;
      if (!from || from.id !== event.pointerId) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      window.getSelection()?.removeAllRanges();
      step(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}
