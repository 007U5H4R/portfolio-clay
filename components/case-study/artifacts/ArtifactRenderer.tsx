import type { Artifact, SourceRef } from "@/data/schema";
import { InsightCard } from "./InsightCard";
import { HypothesisCard } from "./HypothesisCard";
import { MetricCard } from "./MetricCard";
import { DecisionCard } from "./DecisionCard";
import { EvaluationCard } from "./EvaluationCard";
import { ExperimentCard } from "./ExperimentCard";
import { PrototypeFrame } from "./PrototypeFrame";
import { ArtifactCard } from "./ArtifactCard";

export interface ArtifactRendererProps {
  artifact: Artifact;
  /** The owning entity's declared sources — the renderer resolves the artifact's `source` id to a
   *  `SourceRef` so the label can be shown (schema guarantees the id is declared). */
  sources: readonly SourceRef[];
}

/**
 * The single entry point for rendering one artifact (TKT-20). It resolves the artifact's source id
 * to its `SourceRef` and dispatches on the discriminated `type` to the matching card. The switch is
 * **exhaustive**: the `default` branch assigns the artifact to `never`, so adding a new member to
 * the schema's `Artifact` union without a case here is a compile-time error, not a silent gap.
 *
 * Source resolution fails loud: an artifact whose `source` id is not in `sources` throws rather
 * than rendering an artifact with no provenance (the schema's superRefine already forbids this for
 * real project data — this is the render-time backstop, EVAL-013).
 */
export function ArtifactRenderer({ artifact, sources }: ArtifactRendererProps) {
  const byId = new Map(sources.map((s) => [s.id, s]));
  const requireSource = (id: string): SourceRef => {
    const found = byId.get(id);
    if (!found) {
      throw new Error(
        `ArtifactRenderer: artifact "${artifact.id}" references source "${id}" not declared in sources[] (EVAL-013).`,
      );
    }
    return found;
  };

  switch (artifact.type) {
    case "insight":
      return <InsightCard artifact={artifact} source={requireSource(artifact.source)} />;
    case "hypothesis":
      return <HypothesisCard artifact={artifact} source={requireSource(artifact.source)} />;
    case "metric":
      // The metric carries its own provenance (`metric.source`) — resolve that, not the wrapper's.
      return (
        <MetricCard
          metric={artifact.metric}
          source={requireSource(artifact.metric.source)}
          caption={artifact.caption}
        />
      );
    case "decision":
      return <DecisionCard artifact={artifact} source={requireSource(artifact.source)} />;
    case "evaluation":
      return <EvaluationCard artifact={artifact} source={requireSource(artifact.source)} />;
    case "experiment":
      return <ExperimentCard artifact={artifact} source={requireSource(artifact.source)} />;
    case "prototype":
      return <PrototypeFrame artifact={artifact} source={requireSource(artifact.source)} />;
    case "generic":
      return <ArtifactCard artifact={artifact} source={requireSource(artifact.source)} />;
    default: {
      const _exhaustive: never = artifact;
      throw new Error(`ArtifactRenderer: unhandled artifact type ${JSON.stringify(_exhaustive)}`);
    }
  }
}
