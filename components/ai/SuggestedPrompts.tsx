import type { ReactNode } from "react";

/**
 * SuggestedPrompts (technical-plan.md §B S10.02 → §F TKT-77 S77.01, Design.md §7.1 Ask) — the
 * tappable prompt chips shown in the Ask idle and empty states: Inter 13 px ivory pills on the
 * notebook (M-009 paper restyle; previously `ClayPill variant="filter"`), each a 44 px target
 * (Fitts, EVAL-008), in a `<ul>` that wraps to more rows below 768 px. The list is labelled so screen
 * readers announce it as a group of suggested questions.
 *
 * TKT-104 (Tushar direction 2026-09-26, Design.md §11 Dev-47): when `cardStyle` is given (the AskPanel
 * only) each prompt renders as a tinted question card — a round tinted icon, the prompt, a → — in a
 * grid (`data-variant="cards"`). The icon is supplied by the caller so its lucide glyphs stay in the
 * lazy panel chunk, never in the home first-load JS (EVAL-005). The icon and arrow are `aria-hidden`,
 * so each button's accessible name is still exactly the prompt, and it submits exactly as before.
 */
export interface PromptCardStyle {
  icon: ReactNode;
  tone: number;
}

export interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string | undefined;
  /** Panel-only card variant: the decorative icon + tint (0–5) for a prompt. */
  cardStyle?: ((prompt: string, index: number) => PromptCardStyle) | undefined;
}

export function SuggestedPrompts({ prompts, onSelect, className, cardStyle }: SuggestedPromptsProps) {
  if (cardStyle) {
    const classes = ["ask-cards", className].filter(Boolean).join(" ");
    return (
      <ul aria-label="Suggested questions" data-variant="cards" className={classes}>
        {prompts.map((prompt, index) => {
          const { icon, tone } = cardStyle(prompt, index);
          return (
            <li key={prompt}>
              <button
                type="button"
                data-tone={tone % 6}
                className="ask-card focus-ring"
                onClick={() => onSelect(prompt)}
              >
                <span aria-hidden="true" className="ask-card-icon">
                  {icon}
                </span>
                <span className="ask-card-text">{prompt}</span>
                <span aria-hidden="true" className="ask-card-arrow">
                  →
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  const classes = ["ask-pills", className].filter(Boolean).join(" ");
  return (
    <ul aria-label="Suggested questions" className={classes}>
      {prompts.map((prompt) => (
        <li key={prompt}>
          <button type="button" className="ask-pill ask-chip focus-ring" onClick={() => onSelect(prompt)}>
            {prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
