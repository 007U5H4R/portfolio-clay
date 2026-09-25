import type { CSSProperties } from "react";
import type { ThinkingNode as ThinkingNodeData } from "@/data/schema";

/**
 * ThinkingNode (TKT-83 re-skin of TKT-21; Design.md §7.3 "Show the thinking") — one node of the
 * 8-node reasoning chain on paper: a 42 px ivory medallion with the Caveat numeral (decorative —
 * the `<ol>` already numbers the list for assistive tech), a pinned paper-2 label tag in **Inter 11 px
 * uppercase** (the pin is tag chrome, a CSS pseudo-element, not a `Pin` fastener), the text in Inter
 * 15 px ≤ 60ch and the source as a rust link into the case study (or plain text without an `href`).
 *
 * Purely presentational — `ShowTheThinking` owns the open/closed state; the `.thinking-node` class
 * carries the TKT-21 opacity reveal (app/globals.css) fed by this node's `--i` stagger index
 * (`transition-delay: calc(var(--i) * 120ms)`, Design.md §8). The connector between nodes is the
 * chain `Sketch` in the parent, not a per-node line.
 */

const STAGE_LABEL: Record<ThinkingNodeData["stage"], string> = {
  observation: "Observation",
  "user-problem": "User problem",
  insight: "Insight",
  hypothesis: "Hypothesis",
  "product-decision": "Product decision",
  prototype: "Prototype",
  evaluation: "Evaluation",
  outcome: "Outcome",
};

export interface ThinkingNodeProps {
  node: ThinkingNodeData;
  /** Position in the chain (0-7) — feeds the `--i` stagger custom property and the medallion numeral. */
  index: number;
  /** Resolved `SourceRef.label` for `node.source` (never the raw path — same rule as `SourceCaption`). */
  sourceLabel: string;
}

export function ThinkingNode({ node, index, sourceLabel }: ThinkingNodeProps) {
  return (
    <li className="thinking-node node" style={{ "--i": index } as CSSProperties}>
      <span className="node-med font-hand" aria-hidden="true">
        {index + 1}
      </span>
      <span className="node-lab font-body">{STAGE_LABEL[node.stage]}</span>
      <p className="node-text font-body">{node.text}</p>
      {node.href ? (
        <a href={node.href} data-inline-link="" className="node-src focus-ring rounded-[2px]">
          {sourceLabel}
        </a>
      ) : (
        <span className="node-src-plain">{sourceLabel}</span>
      )}
    </li>
  );
}
