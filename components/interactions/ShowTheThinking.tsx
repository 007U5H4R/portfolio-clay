"use client";

import { useState, useSyncExternalStore } from "react";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Annotation, Sketch } from "@/components/paper";
import type { SourceRef, ThinkingChain } from "@/data/schema";
import { ThinkingNode } from "./ThinkingNode";

export interface ShowTheThinkingProps {
  /** The project's 8-node reasoning chain, or `[]` for a thin project (AC 1). */
  chain: ThinkingChain;
  /** Resolves each node's `source` id to its declared `SourceRef` (label rendered, never `ref`). */
  sources: readonly SourceRef[];
}

const PANEL_ID = "show-the-thinking-panel";
const HEADING_ID = "show-the-thinking-heading";

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
 * ShowTheThinking (TKT-83 re-skin of TKT-21; Design.md §7.3 "Show the thinking", §8 row, §3.3
 * planned count 2) — the portfolio's signature interaction: a user-triggered, never-auto-playing
 * reveal of the 8-node reasoning chain below the last chapter, now on paper: a nested
 * `section.thinking` (its own EVAL-018 unit) with an sr-only `h2`, the secondary paper button
 * "Show the thinking ↓" (`aria-expanded`), the `Annotation` "the chain, start to finish" and the
 * dashed chain `Sketch` — exactly the two counted decorations — beside 42 px ivory medallions,
 * pinned Inter label tags, Inter 15 px text and rust source links (`ThinkingNode`).
 *
 * Accessibility pattern (unchanged from TKT-21, documented there): the `<ol>` is **always in the
 * DOM**, in source order, before the toggle is ever opened — the Reveal pattern, not a
 * conditionally-rendered panel. The `.thinking-nodes` class that visually collapses the chain
 * (`visibility:hidden`, app/globals.css — removed from the accessibility tree and tab order) is
 * applied only **after mount** (`useMounted`), so with JavaScript disabled every node renders fully
 * visible. It now sits on the `.chain` wrapper so the sketch collapses with the nodes. Because the
 * collapsed nodes leave the accessibility tree, the toggle's name carries a `VisuallyHidden` summary
 * ("8-step reasoning chain, expand to read").
 *
 * Never auto-plays — `open` starts `false` and only a click/Enter/Space on the toggle changes it.
 * Focus stays on the toggle after opening (a disclosure, not a modal). The reveal itself is CSS:
 * 220 ms opacity, 120 ms/node stagger via `--i`; all at once, opacity only, under reduced motion.
 */
export function ShowTheThinking({ chain, sources }: ShowTheThinkingProps) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  // AC 1: a thin project (empty chain) hides the whole interaction — no empty toggle.
  if (chain.length === 0) return null;

  const sourceLabel = (id: string): string => sources.find((s) => s.id === id)?.label ?? id;

  const chainClasses = ["chain", mounted ? "thinking-nodes" : ""].filter(Boolean).join(" ");

  return (
    <section id="show-the-thinking" aria-labelledby={HEADING_ID} className="thinking">
      <h2 id={HEADING_ID} className="sr-only">
        Show the thinking
      </h2>
      <div className="thinking-head">
        <button
          type="button"
          className="think-btn focus-ring"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => setOpen((current) => !current)}
        >
          Show the thinking <span aria-hidden="true">{open ? "↑" : "↓"}</span>
          <VisuallyHidden>— 8-step reasoning chain, expand to read</VisuallyHidden>
        </button>
        <Annotation size="lg" rotate={-1.5}>
          the chain, start to finish
        </Annotation>
      </div>
      <div id={PANEL_ID} data-open={open ? "" : undefined} className={chainClasses}>
        <Sketch variant="chain" />
        <ol>
          {chain.map((node, index) => (
            <ThinkingNode key={node.stage} node={node} index={index} sourceLabel={sourceLabel(node.source)} />
          ))}
        </ol>
      </div>
    </section>
  );
}
