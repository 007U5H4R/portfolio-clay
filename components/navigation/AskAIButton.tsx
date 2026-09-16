"use client";

import { Sparkles } from "lucide-react";
import type { MouseEvent } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { Icon } from "@/components/common/Icon";
import { useAskContext } from "@/components/ai/AskProvider";

/**
 * AskAIButton (technical-plan.md §B S11.01, Design.md §3) — the live control that opens the global
 * AskPanel slide-over. TKT-11 removed the M-001 tracer's `aria-disabled` "coming in this build"
 * state (the panel now exists). Rendered in two places (the desktop header and the MobileMenu row),
 * so on click it records the exact element pressed as the panel's focus-return target — whichever
 * trigger opened the panel is the one focus returns to when it closes (EVAL-007).
 */
export function AskAIButton() {
  const { openPanel, panelOpen, triggerRef } = useAskContext();

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    openPanel();
  };

  return (
    <ClayButton
      variant="secondary"
      aria-haspopup="dialog"
      aria-expanded={panelOpen}
      onClick={onClick}
    >
      <Icon icon={Sparkles} size={20} />
      Ask AI
    </ClayButton>
  );
}
