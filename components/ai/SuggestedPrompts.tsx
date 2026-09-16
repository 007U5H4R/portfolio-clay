/**
 * SuggestedPrompts (technical-plan.md §B S10.02, Design.md §3) — the tappable prompt chips shown in
 * the Ask idle and empty states. `ClayPill variant="filter"` buttons (44px targets, Fitts) in a
 * `<ul>` that wraps to two rows below 768px. The list is labelled so screen readers announce it as a
 * group of suggested questions.
 */
import { ClayPill } from "@/components/clay/ClayPill";

export interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string | undefined;
}

export function SuggestedPrompts({ prompts, onSelect, className }: SuggestedPromptsProps) {
  const classes = ["flex flex-wrap gap-[var(--space-3)]", className].filter(Boolean).join(" ");
  return (
    <ul aria-label="Suggested questions" className={classes}>
      {prompts.map((prompt) => (
        <li key={prompt}>
          <ClayPill variant="filter" onClick={() => onSelect(prompt)}>
            {prompt}
          </ClayPill>
        </li>
      ))}
    </ul>
  );
}
