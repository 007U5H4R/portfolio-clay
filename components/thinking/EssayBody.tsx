import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Essay } from "@/data/schema";
import { getProject } from "@/data/projects";
import { Prose } from "@/components/common/Prose";
import { DraftTag } from "@/components/paper/DraftTag";
import { Icon } from "@/components/common/Icon";

export interface EssayBodyProps {
  essay: Essay;
}

/**
 * `/thinking/[slug]` essay body (TKT-43, Design.md §3 "Thinking → EssayBody"; §3 "Common
 * primitives" `Prose`): flat text zone, `Prose`-wrapped (≤600px / 60ch measure, same convention as
 * a case-study `Chapter`). Title → reading-time caption + a "Draft — pending sign-off" `DraftTag` in
 * place of a publish date (no essay has shipped, so none carries `publishedOn`) → body → a
 * related-project link at the end.
 *
 * The body is deliberately NOT prose written for this ticket: it is the essay's sourced
 * `passages` (rendered as quote blocks, same `butter`-accent-bar treatment as a case study's
 * `InsightCard`, each captioned with its resolved `SourceRef.label` — never `.ref`, which is a
 * local inventory path) followed by exactly one clearly-labelled "Draft — pending sign-off"
 * framing paragraph. Nothing here claims the essay is finished (AC2/AC3).
 */
export function EssayBody({ essay }: EssayBodyProps) {
  const relatedProject = essay.relatedProject ? getProject(essay.relatedProject) : undefined;
  const sourceById = new Map(essay.sources.map((source) => [source.id, source]));

  return (
    <article className="flex flex-col gap-[var(--space-7)]">
      <header className="flex flex-col gap-[var(--space-3)]">
        <h1 className="max-w-[44ch] text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-navy">
          {essay.title}
        </h1>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <span className="text-caption text-ink-soft">
            {essay.readingMinutes} min read
          </span>
          {essay.draft ? <DraftTag /> : null}
        </div>
      </header>

      {/* `!max-w-[600px]` overrides Prose's default 60ch cap, same fix AboutHero applies: in this
          font 60ch renders ~676px, wider than the "≤600px measure" the brief/AC 3 asserts literally. */}
      <Prose as="div" className="!max-w-[600px] flex flex-col gap-[var(--space-6)]">
        {essay.passages.map((passage, index) => {
          const source = sourceById.get(passage.source);
          return (
            <figure key={index} className="flex flex-col gap-[var(--space-2)]">
              <blockquote className="border-l-[4px] border-kraft pl-[var(--space-4)] text-[length:var(--text-lead)] font-medium text-navy">
                “{passage.quote}”
              </blockquote>
              {source ? (
                <figcaption className="text-caption text-ink-soft">
                  <span className="font-semibold text-navy-2">Source: </span>
                  {source.label}
                </figcaption>
              ) : null}
            </figure>
          );
        })}

        <p>
          <span className="font-semibold text-navy">Draft — pending sign-off: </span>
          {essay.framing}
        </p>
      </Prose>

      {relatedProject ? (
        <Link
          href={`/work/${relatedProject.slug}`}
          className="group flex min-h-11 w-fit items-center gap-[var(--space-2)] text-[length:var(--text-body)] font-semibold text-rust underline underline-offset-2 focus-ring rounded-[2px]"
        >
          Related project: {relatedProject.name}
          <Icon
            icon={ArrowRight}
            size={20}
            className="transition-transform duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </article>
  );
}
