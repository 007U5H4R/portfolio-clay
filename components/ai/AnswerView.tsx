/**
 * AnswerView (technical-plan.md §B S10.03, Design.md §3, decision S7) — the body of the Ask surface
 * for every state, rendered purely from props so it can be driven by `useAsk` on either surface and
 * unit-tested state-by-state.
 *
 *   idle    → the honesty microcopy + SuggestedPrompts
 *   loading → a 2-line shimmer skeleton (role="status", aria-busy) that says it is searching
 *   answer  → an "Answer" heading (the focus target), the answer text (verbatim, ≤65ch), a DRAFT
 *             badge where the source entry is draft, resolving EvidenceLinks, the honesty microcopy,
 *             and a ghost "Ask another"
 *   empty   → the FALLBACK text + 3 fresh SuggestedPrompts (never a fabricated answer)
 *   error   → ink text on a blush flat surface + an alert icon + "Try again" (colour is never the
 *             only signal — Design.md §2)
 *
 * The answer text is the provider's `answer.text`, which is byte-identical to the knowledge entry
 * (the no-fabrication invariant). The user's query is never rendered anywhere (XSS: answers come
 * from data only).
 */
import { AlertTriangle } from "lucide-react";
import type { RefObject } from "react";
import type { Answer } from "@/lib/ask";
import { knowledge } from "@/data/knowledge";
import { ClayButton } from "@/components/clay/ClayButton";
import { Icon } from "@/components/common/Icon";
import { EvidenceLinks } from "./EvidenceLinks";
import { SuggestedPrompts } from "./SuggestedPrompts";
import type { AskStatus } from "./AskProvider";

/** S7 honesty line — shown in idle + answer, never in error (S10.03 gate). */
export const ASK_MICROCOPY = "Answers come from this portfolio's content — nothing generated.";
export const LOADING_LABEL = "Looking through the portfolio…";

/** Ids of knowledge entries still awaiting sign-off — answers from these carry a DRAFT badge. */
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
}

function DraftBadge() {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-utility)] bg-kraft/50 px-[var(--space-2)] py-[2px] text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy">
      Draft
    </span>
  );
}

function Microcopy() {
  return <p className="text-caption text-ink-soft">{ASK_MICROCOPY}</p>;
}

export function AnswerView({
  status,
  answer,
  prompts,
  onSelectPrompt,
  onAskAnother,
  onRetry,
  headingRef,
}: AnswerViewProps) {
  if (status === "loading") {
    return (
      <div role="status" aria-busy="true" className="flex flex-col gap-[var(--space-3)]">
        <span className="sr-only">{LOADING_LABEL}</span>
        <span aria-hidden className="h-4 w-full rounded-[var(--radius-utility)] bg-navy/10 animate-pulse motion-reduce:animate-none" />
        <span aria-hidden className="h-4 w-4/5 rounded-[var(--radius-utility)] bg-navy/10 animate-pulse motion-reduce:animate-none" />
      </div>
    );
  }

  if (status === "answer" && answer && answer.kind === "answer") {
    const isDraft = answer.matched.some((id) => DRAFT_IDS.has(id));
    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="text-h3 text-navy outline-none focus-ring rounded-[var(--radius-utility)]"
          >
            Answer
          </h3>
          {isDraft ? <DraftBadge /> : null}
        </div>
        <p className="max-w-[65ch] text-[length:var(--text-body)] text-navy">{answer.text}</p>
        <EvidenceLinks evidence={answer.evidence} />
        <Microcopy />
        <div>
          <ClayButton variant="ghost" onClick={onAskAnother}>
            Ask another
          </ClayButton>
        </div>
      </div>
    );
  }

  if (status === "empty" && answer && answer.kind === "empty") {
    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <p className="max-w-[65ch] text-[length:var(--text-body)] text-navy">{answer.text}</p>
        {answer.suggestions.length > 0 ? (
          <SuggestedPrompts prompts={answer.suggestions} onSelect={onSelectPrompt} />
        ) : null}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-clay-sm)] bg-steel/30 p-[var(--space-4)] text-navy">
          <Icon icon={AlertTriangle} size={24} className="shrink-0 text-navy" />
          <p className="max-w-[65ch] text-[length:var(--text-body)]">
            Something went wrong finding that answer. Please try again.
          </p>
        </div>
        <div>
          <ClayButton variant="secondary" onClick={onRetry}>
            Try again
          </ClayButton>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Microcopy />
      <SuggestedPrompts prompts={prompts} onSelect={onSelectPrompt} />
    </div>
  );
}
