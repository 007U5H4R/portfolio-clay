"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The accordion toggle of a How I think stage (M-012 P2, TASK-186). Touch screens, coarse pointers and phone widths
 * cannot hover, so below that the stage's example (quote, source and link) sits behind this button — a real
 * `<button aria-expanded>` with the stage title in its name — instead of behind the pointer. It owns one boolean
 * and mirrors it as `data-open` on its stage `<li>`, which the CSS reads; on a hover-capable desktop the CSS hides
 * the button (`display: none`, so it is never a focus stop) and the card reveals its example on hover and focus.
 */
export function HitStageToggle({ controls, label }: { controls: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const stage = ref.current?.closest("li");
    if (!stage) return;
    if (open) stage.setAttribute("data-open", "");
    else stage.removeAttribute("data-open");
  }, [open]);
  return (
    <button ref={ref} type="button" className="hit-toggle focus-ring" aria-expanded={open} aria-controls={controls} onClick={() => setOpen((v) => !v)}>
      <span className="hit-toggle-label">{`${label}: the example`}</span>
      <svg className="hit-toggle-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M2 8h12" />
        <path className="hit-toggle-v" d="M8 2v12" />
      </svg>
    </button>
  );
}
