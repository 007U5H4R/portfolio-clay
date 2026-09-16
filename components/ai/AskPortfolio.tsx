"use client";

/**
 * AskPortfolio (technical-plan.md §B S10.04, Design.md §3) — the home inline Ask surface: a single
 * `ClayCard` holding the input field and, beneath it, the shared idle → loading → answer | empty |
 * error body (`AnswerView`). On submit the field NEVER navigates (brief §13, hard requirement): the
 * same card expands in place (tone shifts neutral → lavender so it reads as "the same object, now
 * open" — Law of Continuity) and focus moves to the answer heading, without trapping focus (the page
 * stays scrollable — unlike the panel, TKT-11).
 *
 * Motion (A6 / Design.md §4): content reveals via `m.*` under the shared `LazyMotionRoot`
 * (`domAnimation`), with the answer body springing in (opacity + y, `springs.askExpand`) and the
 * card height easing to its expanded min-height. Deviation (documented in docs/reports/TKT-10.md):
 * the plan named `m.div layout`, but `layout` is only in `domMax`, not the shared `domAnimation`
 * root — pulling `domMax` onto the home page would grow the first-load JS the whole A6 budget guards.
 * The height is therefore eased with a cheap CSS `min-height` transition (same in-place-expand UX,
 * zero extra bundle) while the content keeps the specified spring. Everything collapses to instant
 * under `prefers-reduced-motion` (height snaps, content opacity only).
 */
import { ArrowUp } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/common/Icon";
import { LazyMotionRoot, springs, useReducedMotionSafe } from "@/lib/motion";
import { ClayCard } from "@/components/clay/ClayCard";
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
  const reduced = useReducedMotionSafe();

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
    <LazyMotionRoot>
      <div className="mx-auto w-full max-w-[720px]">
        <ClayCard
          tier="card"
          tone={expanded ? "lavender" : "neutral"}
          padding="card"
          data-testid="ask-card"
          className={[
            "transition-[min-height] duration-[280ms] ease-[var(--ease-panel)] motion-reduce:transition-none",
            expanded ? "min-h-[240px]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <form onSubmit={onSubmit} className="flex items-center gap-[var(--space-3)]">
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
              className="h-14 min-w-0 flex-1 rounded-[var(--radius-clay-sm)] border border-ink/10 bg-bg px-[var(--space-4)] text-[length:var(--text-body)] text-ink placeholder:text-ink-3 focus-ring"
            />
            <button
              type="submit"
              aria-label="Ask"
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-clay-sm)] bg-accent text-bg transition-transform duration-[180ms] ease-out hover:-translate-y-[3px] hover:bg-accent-deep active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-ring"
            >
              <Icon icon={ArrowUp} size={24} />
            </button>
          </form>

          <m.div
            key={status}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : springs.askExpand}
            className="mt-[var(--space-5)]"
          >
            <AnswerView
              status={status}
              answer={answer}
              prompts={prompts}
              onSelectPrompt={onSelectPrompt}
              onAskAnother={onAskAnother}
              onRetry={retry}
              headingRef={headingRef}
            />
          </m.div>
        </ClayCard>
      </div>
    </LazyMotionRoot>
  );
}
