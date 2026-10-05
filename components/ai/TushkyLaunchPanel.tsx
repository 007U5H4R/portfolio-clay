"use client";

/**
 * TushkyLaunchPanel (TKT-113, spec §8–§14 / §24) — the Home notebook that LAUNCHES the Ask Tushky
 * drawer. It never answers inline. Sending typed text opens the right-side drawer with that text asked
 * as its first turn; sending an empty field just opens the drawer. A suggestion card opens it and asks
 * that card's question. Focus returns to the control that opened it (the field or the card) when the
 * drawer closes (`openPanel({ trigger })`, EVAL-007).
 *
 * Focusing the field does NOT open the drawer (Design.md §11 Dev-64): opening a modal on focus is a
 * change of context on focus (WCAG 3.2.1) and would trap keyboard users tabbing down the page. There is
 * no paperclip (Dev-65, as in the drawer, Dev-61): Tushky can't read files.
 *
 * The questions and icons come from the one shared list, `tushky-questions.ts` (Dev-66), which does not
 * import the knowledge index, so `/` first-load JS stays lean (EVAL-005).
 */
import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ChevronRight, Send } from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { Tape } from "@/components/paper/Tape";
import { useAskContext } from "./AskProvider";
import { CATEGORY_ICONS, TUSHKY_SUGGESTIONS } from "./tushky-questions";

export const LAUNCHER_PLACEHOLDER = "Ask Tushky anything about Tushar...";
export const LAUNCHER_INPUT_LABEL = "Ask Tushky anything about Tushar";

export function TushkyLaunchPanel() {
  const { openPanel, panelOpen } = useAskContext();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // never navigate, never answer here
    openPanel({ query: value, trigger: inputRef.current });
    setValue("");
  };

  return (
    <div className="hat-panel hat-in-panel" data-testid="ask-card">
      <Sheet variant="notebook" className="hat-notebook">
        <Tape side="c" rotate={-2} />
        <p aria-hidden="true" className="hat-notebook-title font-hand">
          What would you like to know?
        </p>
        <h3 className="sr-only">What would you like to know?</h3>
        <form onSubmit={onSubmit} className="hat-composer">
          <label htmlFor="ask-portfolio-input" className="sr-only">
            {LAUNCHER_INPUT_LABEL}
          </label>
          <input
            id="ask-portfolio-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={LAUNCHER_PLACEHOLDER}
            aria-label={LAUNCHER_INPUT_LABEL}
            autoComplete="off"
            enterKeyHint="send"
            className="hat-input"
          />
          <button
            type="submit"
            aria-label="Ask Tushky"
            aria-haspopup="dialog"
            aria-expanded={panelOpen}
            className="hat-send focus-ring"
          >
            <Icon icon={Send} size={20} />
          </button>
        </form>
        <Hand kind="label" as="p" className="hat-try">
          Try asking…
        </Hand>
        <ul aria-label="Suggested questions" className="hat-cards">
          {TUSHKY_SUGGESTIONS.map(({ label, query, category }, index) => (
            <li key={label} className="hat-in-card" style={{ "--hat-i": index } as CSSProperties}>
              <button
                type="button"
                data-category={category}
                aria-haspopup="dialog"
                className="hat-card focus-ring"
                onClick={(event) => openPanel({ label, query, trigger: event.currentTarget })}
              >
                <span aria-hidden="true" className="hat-card-icon">
                  <Icon icon={CATEGORY_ICONS[category]} size={20} />
                </span>
                <span className="hat-card-text">{label}</span>
                <Icon icon={ChevronRight} size={20} className="hat-card-arrow" />
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
