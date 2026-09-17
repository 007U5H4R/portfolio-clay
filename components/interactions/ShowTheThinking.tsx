"use client";

import { useState, useSyncExternalStore } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import type { SourceRef, ThinkingChain } from "@/data/schema";
import { ThinkingNode } from "./ThinkingNode";

export interface ShowTheThinkingProps {
  /** The project's 8-node reasoning chain, or `[]` for a thin project (AC 1). */
  chain: ThinkingChain;
  /** Resolves each node's `source` id to its declared `SourceRef` (label rendered, never `ref`). */
  sources: SourceRef[];
}

const PANEL_ID = "show-the-thinking-panel";

// Same SSR-safe "mounted yet?" read Reveal.tsx uses (components/interactions/Reveal.tsx) — the
// server/first-paint snapshot is false and never changes again after the first client commit, so
// there is nothing to subscribe to.
const noopSubscribe = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;
function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, getMountedSnapshot, getMountedServerSnapshot);
}

/**
 * ShowTheThinking (TKT-21; technical-plan.md §B M-004, Design.md §3 "ShowTheThinking" + §4
 * "Show-the-thinking node reveal", tickets.md TKT-21) — the portfolio's signature interaction: a
 * user-triggered, never-auto-playing reveal of the 8-node reasoning chain below chapter 08.
 *
 * Accessibility pattern chosen (technical-plan.md §B M-004 TKT-21, documented here per that
 * ticket's instruction to pick one and document it): the `<ol>` is **always in the DOM**, in
 * source order, before the toggle is ever opened — this is the Reveal pattern (animation is an
 * enhancement layered on top of real content, never a JS-off content-hider), not a
 * conditionally-rendered panel. The `.thinking-nodes` class that visually collapses it
 * (`visibility:hidden` in app/globals.css — removed from the accessibility tree and tab order,
 * same technique `.reveal` uses) is applied only **after mount** (`useMounted`, mirroring
 * Reveal.tsx), so with JavaScript disabled the class is never added and every node renders fully
 * visible immediately — nothing is ever permanently hidden from a no-JS reader.
 *
 * Because the collapsed nodes are removed from the accessibility tree while JS is controlling
 * them, the toggle's accessible name carries a `VisuallyHidden` summary ("8-step reasoning chain,
 * expand to read") so a screen-reader user still knows the chain exists before opening it — the
 * "VisuallyHidden summary keeps AT discoverability" option named in the ticket, rather than an
 * `aria-describedby` region (kept inside the button's own label; no extra id wiring needed).
 *
 * Never auto-plays (AC: "never auto-plays") — `open` starts `false` and only a click/Enter/Space
 * on the toggle changes it. Focus is never moved: it stays on the toggle after opening (AC 4),
 * matching the ticket's explicit "focus remains on the toggle after open" — unlike AskPanel/
 * MobileMenu, this is not a modal, so there is nothing to trap or return focus from.
 */
export function ShowTheThinking({ chain, sources }: ShowTheThinkingProps) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  // AC 1: a thin project (empty chain) hides the whole interaction — no empty toggle.
  if (chain.length === 0) return null;

  const sourceLabel = (id: string): string => sources.find((s) => s.id === id)?.label ?? id;

  const listClasses = ["mt-[var(--space-6)] flex flex-col", mounted ? "thinking-nodes" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-[var(--space-8)]">
      <ClayButton
        variant="secondary"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((current) => !current)}
      >
        Show the thinking ↓ <VisuallyHidden>— 8-step reasoning chain, expand to read</VisuallyHidden>
      </ClayButton>
      <ol id={PANEL_ID} data-open={open ? "" : undefined} className={listClasses}>
        {chain.map((node, index) => (
          <ThinkingNode key={node.stage} node={node} index={index} sourceLabel={sourceLabel(node.source)} />
        ))}
      </ol>
    </div>
  );
}
