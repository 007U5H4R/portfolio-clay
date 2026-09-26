/**
 * AskTushky (TKT-104 r2, Tushar's Ask Tushky drawer spec §8–§19 / §25, Design.md §11 Dev-60–63) — the
 * pieces of the right-side "Ask Tushky" drawer: `TushkyHeader`, `TushkyEmptyState` (mascot, the one
 * grounding note, the intro and `SuggestedQuestions`), `ChatConversation` and `ChatComposer`.
 * `AskPanel` composes them. They are imported only by `AskPanel`, so they live in the lazy panel
 * chunk and never in `/` first-load JS (EVAL-005). The mascot and avatar images load only when the
 * drawer renders.
 *
 * Colours come from the paper tokens and `color-mix()` in the TKT-104 CSS block (EVAL-020). Caveat
 * text is either a `Hand` label within §3.4 limits or `aria-hidden` with an sr-only Inter twin, so
 * the grounding note is still announced (EVAL-018 rule 5).
 */
import Image from "next/image";
import {
  AlertTriangle,
  Briefcase,
  ChartNoAxesColumn,
  Cpu,
  FileText,
  GraduationCap,
  Lightbulb,
  SendHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import type { FormEvent, Ref, RefObject } from "react";
import type { Answer } from "@/lib/ask";
import { isInternalHref } from "@/lib/anchors";
import { illustration } from "@/lib/illustrations";
import { knowledge } from "@/data/knowledge";
import { Icon } from "@/components/common/Icon";
import { DraftTag } from "@/components/paper/DraftTag";
import { Hand } from "@/components/paper/Hand";
import type { ChatTurn } from "./AskProvider";
import {
  TUSHKY_SUGGESTIONS,
  followUpsFor,
  followUpsForPrompts,
  type FollowUp,
  type SuggestionCategory,
} from "./ask-tushky-data";

const MASCOT = illustration("tushky");
const AVATAR = illustration("tushky-avatar");

export const GROUNDING_NOTE = "Ask anything about Tushar — answers are grounded only in this portfolio.";
export const COMPOSER_PLACEHOLDER = "Ask Tushky anything about Tushar...";
const LOADING_LABEL = "Tushky is looking through the portfolio…";

const CATEGORY_ICONS: Record<SuggestionCategory, LucideIcon> = {
  products: Briefcase,
  impact: ChartNoAxesColumn,
  thinking: Lightbulb,
  ai: Cpu,
  skills: GraduationCap,
  project: FileText,
};

/** Draft knowledge entries: answers from these carry a `DraftTag`, same as the home notebook. */
const DRAFT_IDS = new Set(knowledge.filter((entry) => entry.draft).map((entry) => entry.id));

/** A small paw print (spec: "Ask Tushky 🐾"), drawn so it takes a paper token, not emoji colour. */
export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} fill="currentColor">
      <ellipse cx="6" cy="10" rx="2.3" ry="3" />
      <ellipse cx="10.2" cy="5.6" rx="2.3" ry="3" />
      <ellipse cx="15.4" cy="5.8" rx="2.3" ry="3" />
      <ellipse cx="19.2" cy="10.4" rx="2.2" ry="2.9" />
      <path d="M12.6 11.2c3.2 0 6.2 4.6 6.2 7 0 2-1.6 2.8-3.2 2.8-1.3 0-2-.8-3-.8s-1.8.8-3.2.8c-1.6 0-3-.9-3-2.8 0-2.5 3-7 6.2-7Z" />
    </svg>
  );
}

/** The round Tushky avatar for chat bubbles and the chat-mode header (decorative: alt=""). */
export function TushkyAvatar({ size, className }: { size: number; className?: string }) {
  return (
    <span aria-hidden="true" className={["tk-avatar", className].filter(Boolean).join(" ")} style={{ width: size, height: size }}>
      <Image src={AVATAR.publicSrc!} alt="" width={size} height={size} unoptimized />
    </span>
  );
}

export function TushkyHeader({
  compact,
  generating,
  onClose,
}: {
  compact: boolean;
  generating: boolean;
  onClose: () => void;
}) {
  return (
    // A <div>, not <header>: lockBackground() inerts every `header` on the page (lib/focus.ts).
    <div className="tk-head" data-compact={compact ? "" : undefined} data-generating={generating ? "" : undefined}>
      {compact ? <TushkyAvatar size={40} className="tk-head-avatar" /> : null}
      <div className="tk-head-titles">
        <h2 id="ask-tushky-title" className="tk-title">
          Ask <span className="tk-title-accent">Tushky</span>
          <Paw className="tk-title-paw" />
        </h2>
        <Hand kind="label" as="p" className="tk-subtitle">
          Tushar’s Portfolio Assistant
        </Hand>
        <svg viewBox="0 0 220 12" aria-hidden="true" focusable="false" className="tk-underline" preserveAspectRatio="none">
          <path d="M2 8c40-5 90-7 140-5 28 1 52 2 76-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <button type="button" aria-label="Close Ask Tushky" onClick={onClose} className="tk-close focus-ring">
        <Icon icon={X} size={24} />
      </button>
    </div>
  );
}

export function SuggestedQuestions({ onAsk }: { onAsk: (label: string, query: string) => void }) {
  return (
    <div className="tk-suggest">
      <Hand kind="label" as="p" className="tk-suggest-label">
        Try asking…
      </Hand>
      <ul aria-label="Suggested questions" className="tk-cards">
        {TUSHKY_SUGGESTIONS.map(({ label, query, category }) => (
          <li key={label}>
            <button type="button" data-category={category} className="tk-card focus-ring" onClick={() => onAsk(label, query)}>
              <span aria-hidden="true" className="tk-card-icon">
                <Icon icon={CATEGORY_ICONS[category]} size={20} />
              </span>
              <span className="tk-card-text">{label}</span>
              <span aria-hidden="true" className="tk-card-arrow">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TushkyEmptyState({ onAsk }: { onAsk: (label: string, query: string) => void }) {
  return (
    <div className="tk-empty" data-ask-state="idle">
      <div className="tk-hero">
        <p aria-hidden="true" className="tk-sniff font-hand">
          I sniff through Tushar’s work so you don’t have to.
        </p>
        <Image
          src={MASCOT.publicSrc!}
          alt={MASCOT.alt}
          width={MASCOT.width}
          height={MASCOT.height}
          unoptimized
          className="tk-mascot"
        />
        <div className="tk-note">
          <span aria-hidden="true" className="tk-note-tape" />
          <p aria-hidden="true" className="tk-note-text font-hand">
            {GROUNDING_NOTE}
          </p>
          <p className="sr-only">{GROUNDING_NOTE}</p>
        </div>
      </div>
      <div className="tk-intro">
        <p className="tk-intro-title">
          <Paw className="tk-intro-paw" />
          Hi! I’m Tushky.
        </p>
        <p className="tk-intro-body">
          I can help you explore Tushar’s work, projects, experience, skills, product thinking, and learnings.{" "}
          <strong>What would you like to know?</strong>
        </p>
      </div>
      <SuggestedQuestions onAsk={onAsk} />
    </div>
  );
}

function Sources({ answer }: { answer: Extract<Answer, { kind: "answer" }> }) {
  return (
    <div className="tk-sources">
      <p className="tk-sources-label">Sources from portfolio:</p>
      <ul aria-label="Sources" className="tk-chips">
        {answer.evidence.map((item) => {
          const external = !isInternalHref(item.href);
          return (
            <li key={`${item.href}::${item.label}`}>
              <a
                href={item.href}
                className="tk-source focus-ring"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
                {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FollowUps({ items, onAsk }: { items: FollowUp[]; onAsk: (label: string, query: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="tk-followups">
      <p aria-hidden="true" className="tk-sources-label">
        Ask next:
      </p>
      <ul aria-label="Follow-up questions" className="tk-chips">
        {items.map(({ label, query }) => (
          <li key={label}>
            <button type="button" className="tk-followup focus-ring" onClick={() => onAsk(label, query)}>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TushkyTurn({
  turn,
  isLast,
  answered,
  onAsk,
  onRetry,
}: {
  turn: Extract<ChatTurn, { role: "tushky" }>;
  isLast: boolean;
  answered: ReadonlySet<string>;
  onAsk: (label: string, query: string) => void;
  onRetry: (turnId: number) => void;
}) {
  const { status, answer } = turn;
  let body;
  if (status === "loading") {
    body = (
      <div role="status" aria-busy="true" className="tk-typing">
        <span className="sr-only">{LOADING_LABEL}</span>
        <span aria-hidden="true" className="tk-dot" />
        <span aria-hidden="true" className="tk-dot" />
        <span aria-hidden="true" className="tk-dot" />
      </div>
    );
  } else if (status === "error") {
    body = (
      <div className="tk-error">
        <p>
          <Icon icon={AlertTriangle} size={20} className="tk-error-glyph" />
          Something went wrong finding that answer. Please try again.
        </p>
        <button type="button" className="tk-followup focus-ring" onClick={() => onRetry(turn.id)}>
          Try again
        </button>
      </div>
    );
  } else if (answer?.kind === "answer") {
    const matched = answer.matched[0] ?? "";
    body = (
      <>
        {answer.matched.some((id) => DRAFT_IDS.has(id)) ? <DraftTag /> : null}
        <p className="tk-answer-text">{answer.text}</p>
        <Sources answer={answer} />
        {isLast ? <FollowUps items={followUpsFor(matched, answered)} onAsk={onAsk} /> : null}
      </>
    );
  } else if (answer?.kind === "empty") {
    body = (
      <>
        <p className="tk-answer-text">{answer.text}</p>
        {isLast ? <FollowUps items={followUpsForPrompts(answer.suggestions)} onAsk={onAsk} /> : null}
      </>
    );
  }
  return (
    <li className="tk-turn" data-role="tushky" data-msg={status}>
      <TushkyAvatar size={32} className="tk-turn-avatar" />
      <div className="tk-bubble">
        <span className="sr-only">Tushky: </span>
        {body}
      </div>
    </li>
  );
}

export function ChatConversation({
  messages,
  onAsk,
  onRetry,
}: {
  messages: ChatTurn[];
  onAsk: (label: string, query: string) => void;
  onRetry: (turnId: number) => void;
}) {
  const answered = new Set(
    messages.flatMap((m) => (m.role === "tushky" && m.answer?.kind === "answer" ? m.answer.matched : [])),
  );
  const lastId = messages.at(-1)?.id;
  return (
    <div role="log" aria-live="polite" aria-label="Conversation with Tushky">
      <ol className="tk-log">
      {messages.map((m) =>
        m.role === "user" ? (
          <li key={m.id} className="tk-turn" data-role="user" data-turn-id={m.id}>
            <div className="tk-bubble">
              <span className="sr-only">You: </span>
              {m.text}
            </div>
          </li>
        ) : (
          <TushkyTurn
            key={m.id}
            turn={m}
            isLast={m.id === lastId}
            answered={answered}
            onAsk={onAsk}
            onRetry={onRetry}
          />
        ),
      )}
      </ol>
    </div>
  );
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  inputRef: RefObject<HTMLInputElement | null> | Ref<HTMLInputElement>;
}) {
  // No attachment control (Design.md §11 Dev-61): Tushky can't read files, and a paperclip that
  // does nothing would promise something false.
  return (
    <form onSubmit={onSubmit} className="tk-composer" style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}>
      <label htmlFor="ask-panel-input" className="sr-only">
        Ask Tushky about Tushar
      </label>
      <div className="tk-field">
        <input
          id="ask-panel-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={COMPOSER_PLACEHOLDER}
          autoComplete="off"
          enterKeyHint="send"
          className="tk-input"
        />
        <button type="submit" aria-label="Send" className="tk-send focus-ring">
          <Icon icon={SendHorizontal} size={20} />
        </button>
      </div>
    </form>
  );
}
