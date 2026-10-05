"use client";

/**
 * AskPortfolio (technical-plan.md §B S10.04 → §F TKT-77 S77.01, Design.md §7.1 Ask, decision S21) —
 * the home inline Ask surface, restyled in M-009 as a ruled **notebook** page (`Sheet
 * variant="notebook"`, +0.5°): the prompt `Annotation` ("What would you like to know?" — the one
 * counted decoration inside the sheet), the sr-only label, an Inter 18 px underline input, the navy
 * "Ask →" pill (`data-hand="cta"`), and beneath it the shared idle → loading → answer | empty | error
 * body (`AnswerView`). On submit the field NEVER navigates (brief §13, hard requirement): the same
 * sheet grows in place and focus moves to the answer heading, without trapping focus (the page stays
 * scrollable — unlike the panel, TKT-11).
 *
 * Motion (Design.md §8 "Ask inline expand"): the sheet height eases to its expanded min-height via a
 * CSS `min-height` transition, and the body fades up through the `ask-reveal` keyframe, replayed on
 * each state change through React's `key={status}` remount. Pure CSS keeps AskPortfolio off the
 * `motion` feature bundle and `/` first-load JS (TKT-49, EVAL-005). Reduced motion: the height is
 * instant and the body is a 150 ms opacity fade (the TKT-77 block in globals.css).
 *
 * Logic (`useAsk`, the provider, the synonym table) is untouched (TP3).
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Annotation } from "@/components/paper/Annotation";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { AnswerView } from "./AnswerView";
import { useAsk } from "./AskProvider";

export interface AskPortfolioProps {
  /** The 5 `surface:'home'` prompts, resolved server-side and passed in (A1: never the data module). */
  prompts: string[];
  /**
   * Dev/QA-only seam (the `/dev/ask` fixture, S10.05): submit this query once on mount so a state
   * can be captured deterministically. Never set on the production home surface.
   */
  autoSubmit?: string | undefined;
}

export function AskPortfolio({ prompts, autoSubmit }: AskPortfolioProps) {
  const { status, answer, submit, retry, reset } = useAsk("home");

  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const autoSubmitted = useRef(false);

  const expanded = status !== "idle";

  // Dev/QA fixture only: fire the initial query exactly once (S10.05). Guarded so React's
  // dev double-invoke of effects cannot submit twice.
  useEffect(() => {
    if (!autoSubmit || autoSubmitted.current) return;
    autoSubmitted.current = true;
    submit(autoSubmit);
  }, [autoSubmit, submit]);

  // Move focus to the answer heading once an answer renders (Design.md §3: focus moves to the
  // heading without trapping). Done in an effect — not synchronously after submit() — because the
  // answer is not in the DOM until the async resolve re-renders.
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
    <div data-testid="ask-card" data-expanded={expanded ? "" : undefined} className="ask-notebook-wrap">
      <Sheet variant="notebook" rotate={0.5} className="ask-notebook">
        <Annotation size="lg" className="ask-prompt">
          What would you like to know?
        </Annotation>
        <form onSubmit={onSubmit} className="ask-form">
          <label htmlFor="ask-portfolio-input" className="sr-only">
            Ask about my work
          </label>
          <input
            id="ask-portfolio-input"
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
        </form>

        <div key={status} className="ask-reveal ask-body">
          <AnswerView
            status={status}
            answer={answer}
            prompts={prompts}
            onSelectPrompt={onSelectPrompt}
            onAskAnother={onAskAnother}
            onRetry={retry}
            headingRef={headingRef}
          />
        </div>
      </Sheet>
    </div>
  );
}
