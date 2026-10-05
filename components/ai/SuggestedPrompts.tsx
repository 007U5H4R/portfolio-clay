/**
 * SuggestedPrompts (technical-plan.md §B S10.02 → §F TKT-77 S77.01, Design.md §7.1 Ask) — the
 * tappable prompt chips shown in the Ask idle and empty states: Inter 13 px ivory pills on the
 * notebook (M-009 paper restyle; previously `ClayPill variant="filter"`), each a 44 px target
 * (Fitts, EVAL-008), in a `<ul>` that wraps to more rows below 768 px. The list is labelled so screen
 * readers announce it as a group of suggested questions.
 */
export interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string | undefined;
}

export function SuggestedPrompts({ prompts, onSelect, className }: SuggestedPromptsProps) {
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
