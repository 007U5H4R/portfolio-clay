"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Icon } from "./Icon";

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

/** How long the `copied` confirmation shows before reverting to `idle` (Design.md §7.8: "2 s"). */
const COPIED_MS = 2000;

/**
 * Copy-to-clipboard control (TKT-14 behaviour; TSK-46 paper skin — Design.md §7.8 / §7.9).
 *
 * Skin (TSK-46): the paper secondary button — ivory, 1.5 px `--line` border, Inter 15 px, ≥ 44 px
 * tall (`.copy-btn` in the TSK-46 block of app/globals.css). `data-state` drives the state
 * borders: **copied** forest, **error** rust. The clay `ClayButton` is gone (S11 / TKT-89).
 *
 * Behaviour (unchanged): clicking writes `value` via `navigator.clipboard.writeText`, flips to
 * `copied` for 2 s (the icon morphs Copy → Check and a `role="status"` region announces
 * "Copied …"), then reverts to `idle`.
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
    <span className={["copy-control", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className="copy-btn focus-ring"
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
      </button>

      {/* Announce the state change without moving focus (sr-only live region). */}
      <span role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </span>

      {/* Never a dead end (A12): on failure the value is shown as selectable text. */}
      {state === "error" ? (
        <span className="copy-fallback" data-copy-fallback="">
          <output className="copy-fallback-value">{value}</output>
          <span className="copy-fallback-hint">Select to copy</span>
        </span>
      ) : null}
    </span>
  );
}
