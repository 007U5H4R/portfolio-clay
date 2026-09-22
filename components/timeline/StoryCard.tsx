"use client";

import { Gauge, UserRound, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Experience } from "@/data/schema";
import { ClayCard } from "@/components/clay/ClayCard";
import { tierClass, toneClass, type Tone } from "@/components/clay/tiers";
import { Icon } from "@/components/common/Icon";
import { storyCardId, textStatesKind } from "./timeline-logic";

export interface StoryCardProps {
  role: Experience;
  isOpen: boolean;
  /** Close the card and return focus to the owning node (Esc / the 44×44 close button). */
  onClose: () => void;
}

/** `Outcome` is not exported as a type from the schema, so derive it from the Experience shape. */
type Kind = Experience["outcomes"][number]["kind"];

/**
 * kind → {tone, icon, label} — the SAME measured/self-reported badge vocabulary as
 * `MetricCard`'s `kindMap` (Design.md §3), replicated here (not imported: MetricCard's map is
 * module-private and out of this ticket's edit scope) so the badge language stays consistent
 * site-wide. Only `measured`/`self-reported` exist on an `Outcome`.
 */
const kindMap: Record<Kind, { tone: Tone; icon: LucideIcon; label: string }> = {
  measured: { tone: "mint", icon: Gauge, label: "Measured" },
  "self-reported": { tone: "peach", icon: UserRound, label: "Self-reported" },
};

function OutcomeBadge({ kind }: { kind: Kind }) {
  const { tone, icon, label } = kindMap[kind];
  return (
    <span
      className={[
        tierClass.utility,
        toneClass[tone],
        "inline-flex shrink-0 items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold",
      ].join(" ")}
    >
      <Icon icon={icon} size={20} />
      {label}
    </span>
  );
}

/** One `<dt>`/`<dd>` pair. `Outcomes` spans both columns of the 2-col grid (it holds a list). */
function DefEntry({ term, wide, children }: { term: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={["flex flex-col gap-[var(--space-1)]", wide ? "md:col-span-2" : ""].filter(Boolean).join(" ")}>
      <dt className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-2">
        {term}
      </dt>
      <dd className="text-[length:var(--text-body)] text-ink">{children}</dd>
    </div>
  );
}

/**
 * StoryCard (TKT-41, Design.md §3) — the expandable panel for one role: a lavender card-tier
 * `ClayCard` opened above/below the timeline (desktop, full container width) or inline beneath its
 * node (mobile accordion). The disclosure is a `grid-template-rows` collapse (the proven
 * `ExperienceStrip`/`HowIThink` technique — `motion` `layout` needs the `domMax` bundle the shared
 * `LazyMotionRoot` deliberately omits, A6); the global `prefers-reduced-motion` rule forces the
 * transition to ~instant, so the height "snaps" under reduced motion (EVAL-010) with no bespoke
 * branch. Content is only mounted while open, so the collapsed card exposes nothing focusable (the
 * close button) or readable to a screen reader, and the outer wrapper carries no unnamed landmark.
 *
 * Honesty (AC 1): `Scale` renders `role.scale` verbatim — including the literal `"not recorded"`
 * marker — never hidden. Each outcome renders its text verbatim; the `kind` badge is suppressed only
 * when the text already spells the kind out (AmEx's "(self-reported)"), so the qualifier is never
 * printed twice.
 */
export function StoryCard({ role, isOpen, onClose }: StoryCardProps) {
  const cardId = storyCardId(role.id);
  const headingId = `${cardId}-heading`;
  const title = role.companyNote ? `${role.company} (${role.companyNote})` : role.company;

  return (
    <div
      id={cardId}
      className="grid grid-rows-[0fr] pl-[var(--space-8)] transition-[grid-template-rows] duration-[300ms] ease-[var(--ease-reveal)] motion-reduce:transition-none data-[open=true]:grid-rows-[1fr] lg:pl-0 lg:[grid-row:2] lg:[grid-column:1/-1]"
      data-open={isOpen ? "true" : "false"}
    >
      <div className="overflow-hidden">
        {isOpen ? (
          <ClayCard
            as="section"
            tier="card"
            tone="lavender"
            padding="card"
            role="region"
            aria-labelledby={headingId}
            tabIndex={-1}
            data-story-card=""
            className="mt-[var(--space-4)] scroll-mt-[var(--space-10)] focus:outline-none lg:mt-[var(--space-6)]"
          >
            <div className="flex items-start justify-between gap-[var(--space-4)]">
              <h3 id={headingId} className="text-[length:var(--text-h3)] font-extrabold text-ink">
                {title} — {role.title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${role.company} details`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-clay-sm)] text-ink transition-transform duration-[180ms] ease-out hover:-translate-y-[3px] active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-ring"
              >
                <Icon icon={X} size={24} />
              </button>
            </div>

            <dl className="mt-[var(--space-5)] grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2">
              <DefEntry term="Context">{role.context}</DefEntry>
              <DefEntry term="Role">{role.responsibility}</DefEntry>
              <DefEntry term="Scale">{role.scale}</DefEntry>
              <DefEntry term="What changed">{role.whatChanged}</DefEntry>
              <DefEntry term="Outcomes" wide>
                <ul className="flex flex-col gap-[var(--space-3)]">
                  {role.outcomes.map((outcome) => (
                    <li
                      key={outcome.text}
                      className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)]"
                    >
                      <span className="min-w-0">{outcome.text}</span>
                      {textStatesKind(outcome.text, kindMap[outcome.kind].label) ? null : (
                        <OutcomeBadge kind={outcome.kind} />
                      )}
                    </li>
                  ))}
                </ul>
              </DefEntry>
            </dl>
          </ClayCard>
        ) : null}
      </div>
    </div>
  );
}
