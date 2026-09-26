import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Annotation, Sheet, Tape, TornEdge } from "@/components/paper";
import { deckle } from "./deckle";
import { ENTRY_ART, type OrgLogo } from "./logos";

/**
 * CollageTimeline (TKT-101, Tushar direction 2026-09-26 — `docs/redesign-mockups/m-009/tushar-2026-09-26/
 * work-experience-target.png` + `education-target.png`; Design.md §7.2, §11 Dev-43). One component, two
 * sections on `/work`: "Work Experience" and "Education". Server component, no client JS.
 *
 * Per entry (an `<li>` of an ordered list, newest first): a tinted date blob with a hand arrow → a taped
 * logo card (the real logo, Dev-44, or the name set in type when no official file exists) → the rail pin
 * → a deckled torn-paper card (`data-paper="card"`) with the organisation (h3, Fraunces), the role
 * (Fraunces italic over a coloured stroke), the city chip (Dev-45) and the bullets. All card copy comes
 * verbatim from `data/*.ts` (the caller maps it); nothing here authors content.
 *
 * EVAL-018 (Design.md §3.2) — counted decorations per section: the torn top (Education only) · the
 * hand-lettered title strip (`note`) · the aside (`annotation`) · ONE collage object (`collage`, the
 * TKT-99 Dev-40 kind) that carries every doodle, sticky and the generated building / campus vignette
 * behind each logo (`ENTRY_ART`, `alt=""`) → 3 (Work) / 4 (Education).
 * The visible title is decoration; the real `<h2>` is sr-only with the same words, so the heading
 * outline and the a11y tree are unchanged and no Caveat heading exists (§3.4).
 *
 * The collage sits in the same grid as the list and borrows its rows through `subgrid`, so each row's
 * doodles line up with their card at any card height without JS; `data-wide` pieces are hidden < 1024
 * (the object stays in the DOM, so the count is the same at every width).
 */

/** Per-entry accent set (pin · date blob · role stroke · bullet dot) — resolved in CSS from paper tokens. */
export type TimelineTone = "rust" | "steel" | "green" | "rose" | "sage" | "blue";

export interface TimelineEntry {
  id: string;
  /** Visible date text ("Jun 2026 – Present", "2022") plus the machine-readable bounds. */
  when: { start: string; end?: string | undefined; startLabel: string; endLabel?: string | undefined };
  name: string;
  nameNote?: string | undefined;
  role: string;
  city?: string | undefined;
  bullets: string[];
  /** A trailing labelled list (Work: the résumé outcomes, all self-reported). */
  outcomes?: { label: string; items: string[] } | undefined;
  /** The real logo, or `undefined` → the name set in type (`labelText`) on the taped label. */
  logo?: OrgLogo | undefined;
  labelText: string;
  tone: TimelineTone;
}

export interface CollageTimelineProps {
  id: string;
  title: string;
  aside: string;
  entries: TimelineEntry[];
  /** Per-entry collage pieces (keyed by entry id) — rendered inside the one aria-hidden collage object. */
  doodles: Record<string, ReactNode>;
  /** Education: a torn top edge on the `paper-2` tone (the paper cut-out between the two sections). */
  torn?: boolean | undefined;
  className?: string | undefined;
}

const DECKLE_RIM = { across: 22, down: 12, depthX: 1.1, depthY: 2.2 };
const DECKLE_FACE = { across: 22, down: 12, depthX: 1.1, depthY: 2.2, insetX: 0.5, insetY: 1.1 };

function hashSeed(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 997;
}

/** Tiny hand-drawn curved arrow from the date blob toward the rail (decorative). */
function DateArrow() {
  return (
    <svg className="ct-date-arrow" viewBox="0 0 54 30" aria-hidden="true" focusable="false">
      <path d="M3 8 C 18 0, 38 2, 48 20" />
      <path d="M40 18 L 48 21 L 50 12" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg className="ct-city-pin" viewBox="0 0 12 16" aria-hidden="true" focusable="false">
      <path d="M6 15 C 6 15, 1 9, 1 5.6 A 5 5 0 0 1 11 5.6 C 11 9, 6 15, 6 15 Z M6 7.6 A 2 2 0 1 0 6 3.6 A 2 2 0 1 0 6 7.6 Z" />
    </svg>
  );
}

function Entry({ entry, index }: { entry: TimelineEntry; index: number }) {
  const seed = hashSeed(entry.id);
  const { when } = entry;
  return (
    <li className="ct-item" data-tone={entry.tone} style={{ gridRow: index + 1 } as CSSProperties}>
      <div className="ct-when">
        <p className="ct-date">
          <span className="ct-date-text">
            <time dateTime={when.start}>{when.startLabel}</time>
            {when.endLabel ? (
              <>
                {" – "}
                {when.end ? <time dateTime={when.end}>{when.endLabel}</time> : when.endLabel}
              </>
            ) : null}
          </span>
          <DateArrow />
        </p>
        <Sheet variant="photo" rotate={index % 2 === 0 ? -2 : 1.6} className="ct-logo">
          {entry.logo ? (
            // Plain <img>: a static SVG needs no optimiser; width/height reserve the box (no CLS).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="ct-logo-img"
              src={entry.logo.src}
              alt={entry.logo.alt}
              width={entry.logo.width}
              height={entry.logo.height}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="ct-logo-type" role="img" aria-label={entry.name}>
              {entry.labelText}
            </span>
          )}
          <Tape side="l" />
          <Tape side="r" />
        </Sheet>
      </div>

      <span className="ct-pin" aria-hidden="true" />

      <Sheet as="article" variant="card" className="ct-card">
        <span className="ct-paper" aria-hidden="true">
          <i className="ct-paper-rim" style={{ clipPath: deckle(seed, DECKLE_RIM) }} />
          <i className="ct-paper-face" style={{ clipPath: deckle(seed + 1, DECKLE_FACE) }} />
        </span>
        <div className="ct-card-head">
          <h3 className="ct-name">
            {entry.name}
            {entry.nameNote ? <span className="ct-name-note"> ({entry.nameNote})</span> : null}
          </h3>
          {entry.city ? (
            <p className="ct-city">
              <PinGlyph />
              <span className="sr-only">Location: </span>
              {entry.city}
            </p>
          ) : null}
        </div>
        <p className="ct-role">{entry.role}</p>
        {entry.bullets.length > 0 ? (
          <ul className="ct-bullets">
            {entry.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
        {entry.outcomes && entry.outcomes.items.length > 0 ? (
          <div className="ct-outcomes">
            <p className="ct-outcomes-label" data-micro-label="">
              {entry.outcomes.label}
            </p>
            <ul className="ct-outcomes-list">
              {entry.outcomes.items.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Sheet>
    </li>
  );
}

/** The spark ticks around the title strip (the target's "\ /" marker strokes). */
function TitleSparks() {
  return (
    <svg className="ct-title-sparks" viewBox="0 0 60 40" aria-hidden="true" focusable="false">
      <path d="M8 30 L 20 22 M14 38 L 24 34 M10 20 L 22 18" />
    </svg>
  );
}

export function CollageTimeline({ id, title, aside, entries, doodles, torn = false, className }: CollageTimelineProps) {
  const headingId = `${id}-heading`;
  const rows = { gridTemplateRows: `repeat(${entries.length}, auto)` } as CSSProperties;
  return (
    <section id={id} aria-labelledby={headingId} className={["ct", className].filter(Boolean).join(" ")}>
      {torn ? <TornEdge fill="paper-2" className="ct-torn" /> : null}
      <Container className="ct-wrap">
        <div className="ct-head">
          <h2 id={headingId} className="sr-only">
            {title}
          </h2>
          <p className="ct-title font-hand" data-decor="note" aria-hidden="true">
            <span className="ct-title-strip" style={{ clipPath: deckle(hashSeed(id), { across: 18, down: 6, depthX: 2.2, depthY: 5 }) }} />
            <span className="ct-title-text">{title}</span>
            <TitleSparks />
          </p>
          <Annotation arrow="down" size="lg" rotate={-3} className="ct-aside">
            {aside}
          </Annotation>
        </div>

        <div className="ct-grid" style={rows}>
          <div className="ct-collage" data-decor="collage" aria-hidden="true">
            {entries.map((entry, i) => (
              <div key={entry.id} className="ct-row" style={{ gridRow: i + 1 } as CSSProperties}>
                {ENTRY_ART[entry.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="ct-vignette"
                    src={ENTRY_ART[entry.id]!.src}
                    alt=""
                    width={ENTRY_ART[entry.id]!.width}
                    height={ENTRY_ART[entry.id]!.height}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                {doodles[entry.id]}
              </div>
            ))}
          </div>
          <ol className="ct-list">
            {entries.map((entry, i) => (
              <Entry key={entry.id} entry={entry} index={i} />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
