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
 * M-009 (TKT-77 S77.02, Design.md §7.1 Ask, decision S21 keep): the drawer / sheet body is a ruled
 * notebook page (`Sheet variant="notebook"`, unrotated — it is a fixed drawer, not a pinned sheet)
 * with the same paper controls as the inline notebook (underline Inter input, navy "Ask →" pill,
 * ivory chips / evidence pills). Geometry, the lazy chunk, focus trap, Lenis pause (via
 * `lockBackground`, TKT-94) and the `data-lenis-prevent` scroll region are unchanged.
 *
 * TKT-104 (Tushar direction 2026-09-26, Design.md §11 Dev-47–49): restyled to Tushar's reference —
 * torn notebook sheet + paperclip, "Ask AI" lettering / "Meet Tushky", an idle intro (honesty note,
 * the Tushky mascot, greeting, tape label; `PanelIntro`), the prompts as tinted cards, a rounded input
 * field with a torn "Ask →", quick-action chips and a footer doodle row. Presentation only: the
 * dialog, state machine, focus/Esc/close paths and geometry below are unchanged.
 *
 * Body reuses the shared `useAsk('panel')` state machine + `AnswerView` (idle → loading → answer →
 * empty → error) with the 6 `surface:'panel'` prompts (PB3, passed in as `panelPrompts`). The input
 * is pinned to the panel bottom. The user's query is never rendered as HTML — answers come from the
 * deterministic local provider only (S7).
 */
import { ChartNoAxesColumn, FolderOpen, Sparkle, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { durations, useReducedMotionSafe } from "@/lib/motion";
import { lockBackground } from "@/lib/focus";
import { Icon } from "@/components/common/Icon";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { AnswerView } from "./AnswerView";
import { useAsk, useAskContext } from "./AskProvider";
import { LeafDoodle, MountainDoodle, PanelIntro, Paperclip, Sparkles, panelCardStyle } from "./AskPanelDecor";

/**
 * TKT-104 quick-action chips that ASK (Design.md §11 Dev-49). Each `query` is one the deterministic
 * local index answers from sourced content (checked against `LocalKnowledgeProvider`; pinned by
 * `tests/unit/ask-panel-quick.test.ts`): "Summarize my skills" → the `skills` entry; the reference's
 * "Compare experiences" had no answer (empty fallback), so it is relabelled to what it returns — the
 * `impact` entry. "Browse my projects" is a link, not a question.
 */
export const QUICK_QUESTIONS: readonly { label: string; query: string; icon: LucideIcon }[] = [
  { label: "Show my impact", query: "What impact have you created?", icon: ChartNoAxesColumn },
  { label: "Summarize my skills", query: "Summarize my skills", icon: Sparkle },
];

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
  const cardStyle = useMemo(() => panelCardStyle(panelPrompts), [panelPrompts]);

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
      className="ask-panel m-0 max-h-none bg-transparent p-0 text-navy fixed left-auto right-4 inset-y-4 h-auto w-[400px] 2xl:w-[480px] max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[90vh] max-md:w-auto max-md:max-w-none"
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
      <Sheet variant="notebook" className="ask-panel-sheet">
        <Paperclip className="ask-clip" />
        <div
          className="ask-panel-body"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="ask-panel-head">
            <div className="ask-panel-titles">
              <h2 id="ask-panel-title" className="ask-panel-title">
                <Hand kind="label" className="ask-panel-lettering">
                  Ask AI
                </Hand>
              </h2>
              <Hand kind="label" as="p" className="ask-panel-meet">
                Meet Tushky
              </Hand>
            </div>
            <Sparkles className="ask-sparkles" />
            <button type="button" aria-label="Close Ask panel" onClick={closePanel} className="ask-panel-close focus-ring">
              <Icon icon={X} size={24} />
            </button>
          </div>

          <div data-lenis-prevent="" className="ask-panel-scroll">
            <AnswerView
              status={status}
              answer={answer}
              prompts={panelPrompts}
              onSelectPrompt={onSelectPrompt}
              onAskAnother={onAskAnother}
              onRetry={retry}
              headingRef={headingRef}
              idleIntro={<PanelIntro />}
              cardStyle={cardStyle}
            />
          </div>

          <div className="ask-panel-dock">
            <form onSubmit={onSubmit} className="ask-form ask-panel-form">
              <label htmlFor="ask-panel-input" className="sr-only">
                Ask about my work
              </label>
              <div className="ask-field">
                <Icon icon={Sparkle} size={20} className="ask-field-icon" />
                <input
                  id="ask-panel-input"
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Ask about my work…"
                  autoComplete="off"
                  aria-label="Ask about my work"
                  className="ask-input focus-ring"
                />
                <button type="submit" aria-label="Ask" className="ask-submit focus-ring">
                  <Hand kind="cta">Ask →</Hand>
                </button>
              </div>
            </form>

            <ul aria-label="Quick actions" className="ask-quick">
              <li>
                <Link href="/projects" prefetch={false} className="ask-quick-chip focus-ring" onClick={closePanel}>
                  <Icon icon={FolderOpen} size={20} className="ask-quick-icon" />
                  Browse my projects
                </Link>
              </li>
              {QUICK_QUESTIONS.map(({ label, query, icon }) => (
                <li key={label}>
                  <button type="button" className="ask-quick-chip focus-ring" onClick={() => onSelectPrompt(query)}>
                    <Icon icon={icon} size={20} className="ask-quick-icon" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div aria-hidden="true" className="ask-panel-foot">
              <MountainDoodle className="ask-mountain" />
              <span className="ask-foot-note font-hand">+ Turn curiosity into conversations.</span>
              <LeafDoodle className="ask-leaf" />
            </div>
          </div>
        </div>
      </Sheet>
    </dialog>
  );
}
