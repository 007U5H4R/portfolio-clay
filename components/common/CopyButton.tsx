"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Icon } from "./Icon";
import { ClayButton } from "@/components/clay/ClayButton";

export type CopyButtonState = "idle" | "copied" | "error";

export interface CopyButtonProps {
  /** The text written to the clipboard on click (e.g. the contact email). */
  value: string;
  /**
   * Forces a fixed visual state. Used by the `/dev/primitives` showcase board and the unit tests
   * to render idle/copied/error side by side. When omitted the control runs its own live
   * idle→copied→error machine (the normal in-page behaviour).
   */
  state?: CopyButtonState | undefined;
  className?: string | undefined;
}

const STATE_LABEL: Record<CopyButtonState, string> = {
  idle: "Copy",
  copied: "Copied",
  error: "Copy failed",
};

/** How long the `copied` confirmation shows before reverting to `idle` (Design.md §3: "2s"). */
const COPIED_MS = 2000;

/**
 * Copy-to-clipboard control (TKT-14; technical-plan.md §B S14.01, Design.md §3 ContactCard).
 *
 * Uncontrolled by default: clicking writes `value` via `navigator.clipboard.writeText`, flips to
 * `copied` for 2s (the icon morphs Copy → Check and a `role="status"` region announces "Copied"),
 * then reverts to `idle`.
 *
 * It NEVER fails silently (A12): if the Clipboard API is missing (insecure context / old browser)
 * or the write rejects (permission blocked), it flips to `error`, logs `console.warn('[copy]', err)`,
 * and renders `value` as selectable text inside an `<output>` with a "Select to copy" hint — so the
 * user can always get the address by hand, and any failure is visible in the console.
 *
 * Controlled mode: pass an explicit `state` to pin a fixed visual (the `/dev/primitives` board and
 * `clay.test.tsx` render all three states this way); the click machine is inert in that mode.
 */
export function CopyButton({ value, state: forcedState, className }: CopyButtonProps) {
  const [liveState, setLiveState] = useState<CopyButtonState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlled = forcedState !== undefined;
  const state = controlled ? forcedState : liveState;

  // Clear any pending revert timer on unmount (no setState after teardown).
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = useCallback(async () => {
    if (controlled) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(value);
      setLiveState("copied");
      timer.current = setTimeout(() => setLiveState("idle"), COPIED_MS);
    } catch (err) {
      // A12 — surfaced, never swallowed: log it and drop to the selectable-text fallback below.
      console.warn("[copy]", err);
      setLiveState("error");
    }
  }, [controlled, value]);

  const icon = state === "copied" ? Check : state === "error" ? TriangleAlert : Copy;

  const statusMessage =
    state === "copied"
      ? `Copied ${value}`
      : state === "error"
        ? "Copy failed — select the address to copy it"
        : "";

  return (
    <span className={["inline-flex flex-col items-start gap-[var(--space-2)]", className].filter(Boolean).join(" ")}>
      <ClayButton
        variant="secondary"
        aria-label={`${STATE_LABEL[state]} ${value}`}
        // Stable hook: `aria-label` and `data-state` both change with the state machine, so a
        // consumer/test that needs to target the control across a state flip keys off this instead.
        data-copy-button=""
        data-state={state}
        onClick={controlled ? undefined : onCopy}
      >
        <Icon
          icon={icon}
          size={20}
          className="transition-[opacity,transform] duration-[160ms] ease-out motion-reduce:transition-none"
        />
        {STATE_LABEL[state]}
      </ClayButton>

      {/* Announce the state change without moving focus (Design.md §3 "toast"). */}
      <span role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </span>

      {/* Never a dead end (A12): on failure the value is shown as selectable text. */}
      {state === "error" ? (
        <span className="flex flex-col gap-[2px] text-caption text-ink-2" data-copy-fallback>
          <output className="select-all font-medium text-ink">{value}</output>
          <span className="text-ink-3">Select to copy</span>
        </span>
      ) : null}
    </span>
  );
}
