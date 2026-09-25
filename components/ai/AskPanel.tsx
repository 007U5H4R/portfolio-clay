"use client";

/**
 * AskPanel (technical-plan.md §B S11.01–03, Design.md §3 + Deviation §5, E-8) — the global Ask
 * slide-over. A native `<dialog>` opened with `showModal()`, so the focus trap, top-layer stacking,
 * and `Esc` handling are the browser's (the same proven pattern as `MobileMenu`). It is a LAZY chunk
 * (`AskPanelLazy`), mounted by `AskProvider` only after the first `openPanel()`, so it never enters
 * the `/` first-load JS (EVAL-005 budget, decision on line 8 of the brief).
 *
 * Layout (Design.md §3):
 *   ≥1440  → right drawer, 480px wide, inset 16px top/bottom/right
 *   768–1439 → right drawer, 400px wide (E-8: 768–1023 is also the 400px drawer, D3)
 *   <768   → bottom sheet, 90vh, slides up from the bottom edge (Deviation §5)
 * The page behind stays visible and is dimmed 20% by the `::backdrop` scrim. The slide-in transform
 * and scrim fade are CSS off a `data-open` attribute flipped one frame after `showModal()` (so the
 * transition runs from the shown, not `display:none`, state); reduced motion collapses both to
 * ~instant via the global rule in globals.css.
 *
 * Body reuses the shared `useAsk('panel')` state machine + `AnswerView` (idle → loading → answer →
 * empty → error) with the 6 `surface:'panel'` prompts (PB3, passed in as `panelPrompts`). The input
 * is pinned to the panel bottom. The user's query is never rendered as HTML — answers come from the
 * deterministic local provider only (S7).
 */
import { ArrowUp, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { durations, useReducedMotionSafe } from "@/lib/motion";
import { lockBackground } from "@/lib/focus";
import { ClayButton } from "@/components/clay/ClayButton";
import { Icon } from "@/components/common/Icon";
import { AnswerView } from "./AnswerView";
import { useAsk, useAskContext } from "./AskProvider";

export interface AskPanelProps {
  /** The 6 `surface:'panel'` prompts, resolved server-side in app/layout.tsx (A1). */
  panelPrompts: string[];
}

export function AskPanel({ panelPrompts }: AskPanelProps) {
  const { panelOpen, closePanel, triggerRef } = useAskContext();
  const { status, answer, submit, retry, reset } = useAsk("panel");
  const reduced = useReducedMotionSafe();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [value, setValue] = useState("");

  // Open / close the native modal dialog in step with the context `panelOpen` flag. The `data-open`
  // attribute (which the CSS slide-in / scrim fade key off) is toggled IMPERATIVELY on the element —
  // never via React state — so the transition runs a frame after showModal() (from the shown, not
  // display:none, state) without a cascading re-render. React never declares `data-open` in the JSX,
  // so it leaves this attribute alone on re-render. On close: drop `data-open` (slide-out), then
  // close() once the transition has run (immediately under reduced motion); `close()` fires the
  // native `close` event handled below to return focus.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (panelOpen) {
      if (!dialog.open) dialog.showModal();
      const frame = requestAnimationFrame(() => {
        dialog.setAttribute("data-open", "");
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }

    dialog.removeAttribute("data-open");
    if (!dialog.open) return;
    if (reduced) {
      dialog.close();
      return;
    }
    const timer = setTimeout(() => dialog.close(), durations.panel);
    return () => clearTimeout(timer);
  }, [panelOpen, reduced]);

  // Lock the page behind (overflow:hidden + inert on #main/header/footer) while the panel is open.
  useEffect(() => {
    if (!panelOpen) return;
    return lockBackground();
  }, [panelOpen]);

  // A fresh open starts idle: reset the state machine whenever the panel is not open.
  useEffect(() => {
    if (!panelOpen) reset();
  }, [panelOpen, reset]);

  // Move focus to the answer heading once an answer renders (parity with AskPortfolio; focus stays
  // trapped inside the dialog either way). Done in an effect because the heading is not in the DOM
  // until the async resolve re-renders.
  useEffect(() => {
    if (status !== "answer") return;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // never navigate
    submit(value);
  };

  const onSelectPrompt = (prompt: string) => {
    setValue(prompt);
    submit(prompt);
  };

  const onAskAnother = () => {
    reset();
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="ask-panel-title"
      // No `display` utility on the <dialog> itself: the UA `dialog:not([open])` rule must keep it
      // hidden when closed (an author `display` here would win over the UA origin and leave the closed
      // dialog visible). The flex column lives on the inner wrapper below (the MobileMenu pattern).
      className="ask-panel m-0 max-h-none bg-paper p-0 text-navy shadow-[var(--shadow-clay-rest)] fixed left-auto right-4 inset-y-4 h-auto w-[400px] rounded-[var(--radius-clay)] 2xl:w-[480px] max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[90vh] max-md:w-auto max-md:max-w-none max-md:rounded-b-none max-md:rounded-t-[var(--radius-clay)]"
      // Esc → native `cancel`: route it through closePanel() so it takes the same animated close
      // path as the close button / scrim (preventDefault keeps the dialog open until the slide-out).
      onCancel={(event) => {
        event.preventDefault();
        closePanel();
      }}
      // A click that lands on the <dialog> element itself (its backdrop area) closes the panel.
      onClick={(event) => {
        if (event.target === dialogRef.current) closePanel();
      }}
      // Fires after close() (from Esc, the close button, or the scrim): return focus to the trigger.
      onClose={() => {
        closePanel();
        const trigger = triggerRef.current;
        if (trigger?.isConnected) trigger.focus();
      }}
    >
      <div
        className="flex h-full flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b border-navy/10 px-[var(--space-5)] py-[var(--space-4)]">
          <h2 id="ask-panel-title" className="text-h3 text-navy">
            Ask AI
          </h2>
          <ClayButton variant="ghost" iconOnly aria-label="Close Ask panel" onClick={closePanel}>
            <Icon icon={X} size={24} />
          </ClayButton>
        </div>

        <div data-lenis-prevent="" className="flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-5)]">
          <AnswerView
            status={status}
            answer={answer}
            prompts={panelPrompts}
            onSelectPrompt={onSelectPrompt}
            onAskAnother={onAskAnother}
            onRetry={retry}
            headingRef={headingRef}
          />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-[var(--space-3)] border-t border-navy/10 px-[var(--space-5)] py-[var(--space-4)]"
        >
          <label htmlFor="ask-panel-input" className="sr-only">
            Ask about my work
          </label>
          <input
            id="ask-panel-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ask about my work…"
            autoComplete="off"
            aria-label="Ask about my work"
            className="h-14 min-w-0 flex-1 rounded-[var(--radius-clay-sm)] border border-navy/10 bg-paper px-[var(--space-4)] text-[length:var(--text-body)] text-navy placeholder:text-ink-soft focus-ring"
          />
          <button
            type="submit"
            aria-label="Ask"
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-clay-sm)] bg-rust text-paper transition-transform duration-[180ms] ease-out hover:-translate-y-[3px] hover:bg-terracotta active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-ring"
          >
            <Icon icon={ArrowUp} size={24} />
          </button>
        </form>
      </div>
    </dialog>
  );
}
