import {
  CircleAlert,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Hammer,
  Lightbulb,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Icon } from "@/components/common/Icon";
import type { ThinkingNode as ThinkingNodeData } from "@/data/schema";

/**
 * ThinkingNode (TKT-21; technical-plan.md §B M-004, Design.md §3 "ShowTheThinking") — one row of
 * the 8-node reasoning chain: stage label + text + an optional source link into the case study.
 *
 * Purely presentational — `ShowTheThinking` owns the open/closed state and applies the
 * `.thinking-node` reveal class (app/globals.css) that this component's `--i` custom property
 * (the stagger index) feeds into (`transition-delay: calc(var(--i) * 120ms)`, Design.md §4).
 *
 * The connector line between nodes is a `::before` pseudo-element on `.thinking-node` itself
 * (app/globals.css) rather than a separate DOM node — one less element, and its `clip-path`
 * draw-in shares the same `--i` stagger the opacity fade uses.
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

const STAGE_ICON: Record<ThinkingNodeData["stage"], LucideIcon> = {
  observation: Eye,
  "user-problem": CircleAlert,
  insight: Lightbulb,
  hypothesis: FlaskConical,
  "product-decision": Hammer,
  prototype: Wrench,
  evaluation: ClipboardCheck,
  outcome: TrendingUp,
};

export interface ThinkingNodeProps {
  node: ThinkingNodeData;
  /** Position in the chain (0-7) — feeds the `--i` stagger custom property. */
  index: number;
  /** Resolved `SourceRef.label` for `node.source` (never the raw path — same rule as `SourceCaption`). */
  sourceLabel: string;
}

export function ThinkingNode({ node, index, sourceLabel }: ThinkingNodeProps) {
  const StageIcon = STAGE_ICON[node.stage];

  return (
    <li
      className="thinking-node relative flex gap-[var(--space-4)] pb-[var(--space-6)] last:pb-0"
      style={{ "--i": index } as CSSProperties}
    >
      <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-navy shadow-[var(--shadow-utility)]">
        <Icon icon={StageIcon} size={20} />
      </span>
      <div className="flex flex-col gap-[var(--space-1)] pt-[var(--space-1)]">
        <p className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">
          {STAGE_LABEL[node.stage]}
        </p>
        <p className="max-w-[60ch] text-[length:var(--text-body)] text-navy-2">{node.text}</p>
        {node.href ? (
          <a
            href={node.href}
            data-inline-link=""
            className="w-fit text-caption font-semibold text-rust underline underline-offset-2 focus-ring rounded-[2px]"
          >
            {sourceLabel}
          </a>
        ) : (
          <span className="text-caption text-ink-soft">{sourceLabel}</span>
        )}
      </div>
    </li>
  );
}
