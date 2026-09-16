import { Check, Copy, TriangleAlert } from "lucide-react";
import { Icon } from "./Icon";
import { ClayButton } from "@/components/clay/ClayButton";

export type CopyButtonState = "idle" | "copied" | "error";

export interface CopyButtonProps {
  /** The text that will be copied (wired to the clipboard in TKT-14). */
  value: string;
  /** Visual state. The clipboard behaviour + state transitions land in TKT-14. */
  state?: CopyButtonState | undefined;
  className?: string | undefined;
}

const STATE_LABEL: Record<CopyButtonState, string> = {
  idle: "Copy",
  copied: "Copied",
  error: "Copy failed",
};

/**
 * Skeleton copy control (S04.06). Renders the three designed states (idle → copied → error,
 * Design.md §3 ContactCard) driven by an explicit `state` prop; the clipboard write, the 2s
 * revert, and the selectable-text error fallback are implemented in TKT-14. Kept dependency-free
 * (no `"use client"`) until then so it can render on the server board.
 */
export function CopyButton({ value, state = "idle", className }: CopyButtonProps) {
  const icon = state === "copied" ? Check : state === "error" ? TriangleAlert : Copy;
  return (
    <ClayButton
      variant="secondary"
      aria-label={`${STATE_LABEL[state]} ${value}`}
      data-state={state}
      className={className}
    >
      <Icon icon={icon} size={20} />
      {STATE_LABEL[state]}
    </ClayButton>
  );
}
