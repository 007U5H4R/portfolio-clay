"use client";

import { Sparkles } from "lucide-react";
import { ClayButton } from "@/components/clay/ClayButton";
import { Icon } from "@/components/common/Icon";

/** The only place this tracer copy lives — TKT-11 removes the disabled state, not this string. */
export const ASK_AI_TRACER_NOTE = "Ask AI — coming in this build";

/**
 * Tracer state (technical-plan.md §B S04.06, TKT-01 AC 3): the real Ask panel ships in TKT-11,
 * but this control must never be a *dead* one in the meantime — `aria-disabled` (not the native
 * `disabled` attribute) keeps it focusable and in the tab order, `title` + the visible tooltip
 * give it an accessible description, and `onClick` is an explicit no-op rather than absent, so
 * intent reads clearly at the call site.
 */
export function AskAIButton() {
  return (
    <span className="group/tooltip relative inline-flex">
      <ClayButton
        variant="secondary"
        aria-disabled="true"
        aria-describedby="ask-ai-tooltip"
        title={ASK_AI_TRACER_NOTE}
        onClick={(event) => event.preventDefault()}
        className="cursor-not-allowed opacity-70"
      >
        <Icon icon={Sparkles} size={20} />
        Ask AI
      </ClayButton>
      <span
        id="ask-ai-tooltip"
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-utility)] bg-ink px-3 py-1.5 text-[12px] text-bg opacity-0 shadow-[var(--shadow-utility)] transition-opacity duration-200 ease-[var(--ease-hover)] group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 motion-reduce:transition-none"
      >
        {ASK_AI_TRACER_NOTE}
      </span>
    </span>
  );
}
