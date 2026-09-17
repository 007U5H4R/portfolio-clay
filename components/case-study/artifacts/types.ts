import type { Artifact } from "@/data/schema";

/**
 * Per-variant artifact types, derived from the schema's discriminated `Artifact` union by its
 * `type` tag. Deriving (rather than re-declaring) means the card props stay locked to the schema:
 * add/rename a field in `data/schema.ts` and the matching card fails to typecheck. No variant is
 * invented here — these are exactly the members `z.discriminatedUnion('type', …)` defines.
 */
export type ArtifactOfType<T extends Artifact["type"]> = Extract<Artifact, { type: T }>;

export type InsightArtifact = ArtifactOfType<"insight">;
export type HypothesisArtifact = ArtifactOfType<"hypothesis">;
export type MetricArtifact = ArtifactOfType<"metric">;
export type DecisionArtifact = ArtifactOfType<"decision">;
export type EvaluationArtifact = ArtifactOfType<"evaluation">;
export type ExperimentArtifact = ArtifactOfType<"experiment">;
export type PrototypeArtifact = ArtifactOfType<"prototype">;
export type GenericArtifact = ArtifactOfType<"generic">;
