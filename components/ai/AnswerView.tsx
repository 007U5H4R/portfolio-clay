/**
 * AnswerView (technical-plan.md §B S10.03 → §F TKT-77 S77.01, Design.md §7.1 Ask + §7.9, decisions
 * S7 / S21) — the body of the Ask surface for every state, rendered purely from props so it can be
 * driven by `useAsk` on either surface (the inline notebook and the `AskPanel` sheet) and
 * unit-tested state-by-state. M-009 restyles it onto the ruled notebook paper; the states, copy and
 * logic are unchanged (TP3 — `tests/unit/ask-ui.test.tsx` is untouched).
 *
 *   idle    → the honesty microcopy + SuggestedPrompts
 *   loading → two shimmer lines on the ruled paper (role="status", aria-busy) + sr-only status
 *   answer  → h3 "Answer" (the focus target) + `DraftTag` where the source entry is draft, the answer
 *             text (verbatim, Inter 15 px navy-2), EvidenceLinks as small ivory pills, the honesty
 *             microcopy, and "Ask another"
 *   empty   → the FALLBACK text + 3 fresh SuggestedPrompts (never a fabricated answer)
 *   error   → an ivory panel with a rust 1.5 px border + alert glyph + text, and a secondary
 *             "Try again" (colour is never the only signal — Design.md §2)
 *
 * The answer text is the provider's `answer.text`, which is byte-identical to the knowledge entry
 * (the no-fabrication invariant). The user's query is never rendered anywhere (XSS: answers come
 * from data only).
 */
import { AlertTriangle } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import type { Answer } from "@/lib/ask";
import { knowledge } from "@/data/knowledge";
import { Icon } from "@/components/common/Icon";
import { DraftTag } from "@/components/paper/DraftTag";
import { EvidenceLinks } from "./EvidenceLinks";
import { SuggestedPrompts, type SuggestedPromptsProps } from "./SuggestedPrompts";
import type { AskStatus } from "./AskProvider";

/** S7 honesty line — shown in idle + answer, never in error (S10.03 gate). */
export const ASK_MICROCOPY = "Answers come from this portfolio's content — nothing generated.";
export const LOADING_LABEL = "Looking through the portfolio…";

/** Ids of knowledge entries still awaiting sign-off — answers from these carry a `DraftTag`. */
const DRAFT_IDS = new Set(knowledge.filter((entry) => entry.draft).map((entry) => entry.id));

export interface AnswerViewProps {
  status: AskStatus;
  answer: Answer | null;
  /** Idle-state suggestions (home = 5). */
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
  onAskAnother: () => void;
  onRetry: () => void;
  /** Attached to the answer heading so the parent can move focus there once an answer lands. */
  headingRef?: RefObject<HTMLHeadingElement | null> | undefined;
  /**
   * TKT-104 (AskPanel only): replaces the idle-state microcopy line with the panel's intro (the torn
   * honesty note, Tushky and the greeting). The intro MUST render `<Microcopy />` itself — the S7
   * honesty line is shown in idle on every surface.
   */
  idleIntro?: ReactNode | undefined;
  /** TKT-104 (AskPanel only): render the idle / empty prompts as tinted question cards. */
  cardStyle?: SuggestedPromptsProps["cardStyle"];
}

export function Microcopy({ className }: { className?: string | undefined }) {
  return <p className={["ask-microcopy", className].filter(Boolean).join(" ")}>{ASK_MICROCOPY}</p>;
}

export function AnswerView({
  status,
  answer,
  prompts,
  onSelectPrompt,
  onAskAnother,
  onRetry,
  headingRef,
  idleIntro,
  cardStyle,
}: AnswerViewProps) {
  if (status === "loading") {
    return (
      <div role="status" aria-busy="true" className="ask-loading">
        <span className="sr-only">{LOADING_LABEL}</span>
        <span aria-hidden="true" className="ask-shimmer" />
        <span aria-hidden="true" className="ask-shimmer ask-shimmer-short" />
      </div>
    );
  }

  if (status === "answer" && answer && answer.kind === "answer") {
    const isDraft = answer.matched.some((id) => DRAFT_IDS.has(id));
    return (
      <div className="ask-state" data-ask-state="answer">
        <div className="ask-answer-head">
          <h3 ref={headingRef} tabIndex={-1} className="ask-answer-heading focus-ring">
            Answer
          </h3>
          {isDraft ? <DraftTag /> : null}
        </div>
        <p className="ask-answer-text">{answer.text}</p>
        <EvidenceLinks evidence={answer.evidence} />
        <Microcopy />
        <div>
          <button type="button" className="ask-btn ask-btn-ghost focus-ring" onClick={onAskAnother}>
            Ask another
          </button>
        </div>
      </div>
    );
  }

  if (status === "empty" && answer && answer.kind === "empty") {
    return (
      <div className="ask-state" data-ask-state="empty">
        <p className="ask-answer-text">{answer.text}</p>
        {answer.suggestions.length > 0 ? (
          <SuggestedPrompts prompts={answer.suggestions} onSelect={onSelectPrompt} cardStyle={cardStyle} />
        ) : null}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="ask-state" data-ask-state="error">
        <div className="ask-error">
          <Icon icon={AlertTriangle} size={24} className="ask-error-glyph" />
          <p>Something went wrong finding that answer. Please try again.</p>
        </div>
        <div>
          <button type="button" className="ask-btn ask-btn-secondary focus-ring" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="ask-state" data-ask-state="idle">
      {idleIntro ?? <Microcopy />}
      <SuggestedPrompts prompts={prompts} onSelect={onSelectPrompt} cardStyle={cardStyle} />
    </div>
  );
}
