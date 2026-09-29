import type { CaseSection } from "@/data/schema";

type Learning = Extract<CaseSection, { kind: "learnings" }>["items"][number];

/** Spec §21: a short title and one sentence — 2 to 4 per page, never a retrospective essay. */
export function LearningCard({ learning, index }: { learning: Learning; index: number }) {
  return (
    <article className="csx-learning" data-paper="card" data-i={index + 1}>
      <p className="csx-learning-n" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="csx-h3">{learning.title}</h3>
      <p>{learning.body}</p>
    </article>
  );
}
