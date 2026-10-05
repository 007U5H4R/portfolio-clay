import { Children, isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { devOnly } from "@/lib/dev-only";
import {
  Annotation,
  DraftTag,
  FlatZone,
  Hand,
  Illustration,
  Note,
  Pin,
  Sheet,
  Sketch,
  Sticky,
  Tape,
  TornEdge,
} from "@/components/paper";
import { Prose } from "@/components/common/Prose";
import { Tag } from "@/components/common/Tag";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/interactions/Reveal";
import { ViolateFixture } from "./ViolateFixture";

/**
 * /dev/primitives (S70.09, TKT-70 AC 6) — the paper primitive board. Every `components/paper/*`
 * primitive at its planned rotation (Design.md §3.1), in `<section>`s sized like the real pages and
 * budgeted like the §3.3 rows, so the board itself passes EVAL-018 at 390 and 1440. Each section
 * carries a count readout computed server-side from the same rules the spec applies (see
 * `countDecor`). `?violate=1` adds the raw-markup fixture section (`ViolateFixture`) that trips all
 * four rules — the positive control for `tests/e2e/eval-018.spec.ts`.
 *
 * QA-only: not linked from the nav, excluded from the sitemap, 404s in a production build unless
 * `ALLOW_DEV_ROUTES` is set at build time (`devOnly()`, lib/dev-only.ts).
 */

// ---------------------------------------------------------------------------- server-side readout

/** The counted primitives (Design.md §3.1 "Counts? yes"). `Tape` counts only when `free` (D6). */
const DECOR_KIND = new Map<unknown, string>([
  [TornEdge, "torn"],
  [Sticky, "sticky"],
  [Annotation, "annotation"],
  [Sketch, "sketch"],
  [Note, "note"],
  [Tape, "tape"],
]);

/** Element types that render their own `<section>` and therefore own their decorations (rule 1). */
const OWNS_UNIT = new Set<unknown>(["section", Section]);

/**
 * Count the decorations a section owns, from its element tree, by the §3.2 rules: every counted
 * primitive is one object regardless of size; a nested section owns its own (not descended into);
 * fasteners (`Tape` without `free`, `Pin`) and content paper never count. Walks `children` and the
 * `caption` slot (`Illustration`), the two places this board puts decorations.
 */
function countDecor(node: ReactNode, acc: string[] = []): string[] {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ children?: ReactNode; caption?: ReactNode; free?: boolean }>;
    const kind = DECOR_KIND.get(el.type);
    if (kind && (kind !== "tape" || el.props.free === true)) acc.push(kind);
    if (OWNS_UNIT.has(el.type)) return;
    countDecor(el.props.children, acc);
    if (el.props.caption !== undefined) countDecor(el.props.caption, acc);
  });
  return acc;
}

const BUDGET = 4;

function Readout({ kinds }: { kinds: string[] }) {
  const over = kinds.length > BUDGET;
  return (
    <p
      data-readout=""
      data-over={over ? "" : undefined}
      // Colour is inherited (navy on paper, ivory on the band) so the readout keeps AA contrast in every section.
      className={["font-body text-caption tabular-nums", over ? "font-semibold text-terracotta" : "opacity-80"].join(" ")}
    >
      {kinds.length} / {BUDGET} decorations{over ? " — over budget" : ""}
      {kinds.length > 0 ? ` · ${kinds.join(", ")}` : ""}
    </p>
  );
}

type BoardProps = {
  id: string;
  title: string;
  /** The §3.3 row this section mirrors. */
  mirrors: string;
  className?: string | undefined;
  children: ReactNode;
};

/** One counting unit: a `<section>` with its content, then the heading, the mirrored row and the readout. */
function Board({ id, title, mirrors, className, children }: BoardProps) {
  const kinds = countDecor(children);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={["relative", className].filter(Boolean).join(" ")}>
      {children}
      <div className="mt-[var(--space-6)] border-t border-dashed border-navy/20 pt-[var(--space-3)]">
        <h2 id={`${id}-title`} className="font-display text-h3">
          {title}
        </h2>
        <p className="text-caption opacity-80">mirrors {mirrors}</p>
        <Readout kinds={kinds} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------- the board

const FULL_BLEED =
  "-mx-[var(--gutter-mobile)] w-[calc(100%+2*var(--gutter-mobile))] md:-mx-[var(--gutter-tablet)] md:w-[calc(100%+2*var(--gutter-tablet))]";

const CARDS = [
  { slug: "teachspark", title: "TeachSpark", body: "Capability, not dependency — the 60-second constraint.", side: "l", status: "live", label: "Live" },
  { slug: "railcite", title: "RailCite", body: "Every claim cited or refused.", side: "c", status: "pilot", label: "Pilot" },
  { slug: "velora", title: "Nuptis → Velora", body: "Killed one product to find the other.", side: "r", status: "prototype", label: "Prototype" },
] as const;

const STAGES = ["Notice", "Frame", "Test", "Build", "Ship", "Learn"];
const PIN_TONES = ["rust", "forest", "steel"] as const;

export default function PrimitivesDevPage() {
  devOnly();

  return (
    <div className="bg-paper px-[var(--gutter-mobile)] pb-[var(--space-10)] text-navy md:px-[var(--gutter-tablet)]">
      {/* 1 · Hero — mirrors `/` hero (3): hand-sub annotation · h1 underline sketch · scene caption */}
      <Board id="board-hero" title="Hero" mirrors="`/` hero — 3 objects" className="min-h-[70vh] pt-[var(--space-8)]">
        <p className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">Dev board · QA only</p>
        <Annotation size="hero" rotate={-2}>
          Build · Learn · Solve · Grow
        </Annotation>
        <h1 className="font-display text-[length:var(--text-hero)] leading-[var(--leading-hero)] tracking-[var(--tracking-hero)] text-navy">
          Paper primitive{" "}
          <span className="relative inline-block">
            system
            <Sketch variant="underline" className="absolute inset-x-0 -bottom-2 h-[0.18em] w-full" />
          </span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[60ch] font-body text-lead text-navy-2">
          Every counted decoration, every piece of content paper, every fastener and every Caveat exemption — at its
          planned rotation, in sections sized like the real pages.
        </p>
        <a href="#board-featured" className="mt-[var(--space-4)] inline-flex min-h-11 items-center text-[22px] text-rust focus-ring">
          <Hand kind="cta">Start with the cards →</Hand>
        </a>
        <figure className="mt-[var(--space-6)] max-w-[420px]">
          <Illustration id="scene-work" placement="bleed" sizes="(min-width: 1024px) 40vw, 100vw" />
          <Annotation as="figcaption" size="sm" arrow="down" rotate={2}>
            the scene bleed sits behind the copy
          </Annotation>
        </figure>
      </Board>

      {/* 2 · Featured — mirrors `/` featured (4): torn · quote-card annotation · flow sketch · sticky */}
      <Board
        id="board-featured"
        title="Featured work"
        mirrors="`/` featured — 4 objects (at budget) · 3 taped cards (not counted)"
        className="mt-[var(--space-9)] min-h-[80vh] bg-paper-2 pb-[var(--space-6)]"
      >
        <TornEdge fill="paper-2" className={FULL_BLEED} />
        <div className="grid gap-[var(--space-6)] pt-[var(--space-6)] lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Sheet key={card.slug} as="article" variant="card" rotate={i === 1 ? -0.7 : 0.6} className="p-[var(--space-5)] pt-[var(--space-7)]">
              <Tape side={card.side} />
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <StatusBadge status={card.status} statusLabel={card.label} onPaper />
                <Tag>Product</Tag>
              </div>
              <h3 className="mt-[var(--space-3)] font-display text-h3 text-navy">{card.title}</h3>
              <p className="mt-[var(--space-2)] font-body text-body text-navy-2">{card.body}</p>
              {i === 0 ? (
                <div className="mt-[var(--space-4)]">
                  <Sketch variant="flow" />
                </div>
              ) : null}
              {i === 1 ? (
                <div className="mt-[var(--space-4)]">
                  <Hand kind="quote" cite="RailCite Solution-Space PRD" className="text-[22px] text-navy">
                    “trust is the product.”
                  </Hand>
                </div>
              ) : null}
              {i === 2 ? (
                <div className="mt-[var(--space-4)]">
                  <DraftTag rotate={-4} />
                </div>
              ) : null}
            </Sheet>
          ))}
        </div>
        <div className="mt-[var(--space-6)] flex flex-wrap items-start gap-[var(--space-6)]">
          <Annotation arrow="dashed" rotate={-1}>
            the quote card, with its arrow
          </Annotation>
          <Sticky rotate={4}>Capability, not dependency.</Sticky>
        </div>
      </Board>

      {/* 3 · Journey — mirrors `/` how I think (2): torn · path sketch; 6 pinned index cards */}
      <Board
        id="board-journey"
        title="How I think"
        mirrors="`/` how I think — 2 objects · 6 pinned index cards (not counted)"
        className="mt-[var(--space-9)] min-h-[80vh]"
      >
        <TornEdge fill="paper" className={FULL_BLEED} />
        <Sketch variant="path" className="mt-[var(--space-5)] h-[60px] w-full lg:h-[120px]" />
        <ol className="mt-[var(--space-5)] grid gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, i) => (
            <li key={stage}>
              <Sheet variant="index" rotate={i % 2 === 0 ? 0.8 : -0.9} className="p-[var(--space-4)] pt-[var(--space-6)]">
                <Pin tone={PIN_TONES[i % PIN_TONES.length]} />
                <div className="flex items-baseline gap-[var(--space-3)]">
                  <Hand kind="label" as="b" className="text-[22px] text-rust">
                    {String(i + 1).padStart(2, "0")}
                  </Hand>
                  <h3 className="font-display text-h3 text-navy">{stage}</h3>
                </div>
                <p className="mt-[var(--space-2)] font-body text-body text-navy-2">A stage card on an index sheet: Fraunces title, Inter body.</p>
                {i === 5 ? (
                  <Hand
                    kind="quote"
                    cite={<span className="sr-only">Source: Show the thinking, chapter 8</span>}
                    className="mt-[var(--space-3)] text-[20px] text-navy"
                  >
                    “Green tests prove it runs. They do not prove it is right.”
                  </Hand>
                ) : null}
              </Sheet>
            </li>
          ))}
        </ol>
      </Board>

      {/* 4 · Scraps — free tape + notes (4, at budget) */}
      <Board
        id="board-scraps"
        title="Free scraps"
        mirrors="`/about` awards (stamp note) · free-standing tape · notes — 4 objects (at budget)"
        className="mt-[var(--space-9)] min-h-[50vh]"
      >
        <div className="flex flex-wrap items-start gap-[var(--space-7)] pt-[var(--space-6)]">
          <Tape free rotate={-3} />
          <Note stamp rotate={6}>
            TP
          </Note>
          <Note tone="note" rotate={-4}>
            a scrap of note paper
          </Note>
          <Note tone="kraft" rotate={3}>
            kraft
          </Note>
        </div>
      </Board>

      {/* 5 · Sketches — the remaining line variants (4, at budget) */}
      <Board
        id="board-sketches"
        title="Sketch variants"
        mirrors="`/about` journey path · case-study chain · `/playground` tools · `/contact` arrow — 4 objects (at budget)"
        className="mt-[var(--space-9)] min-h-[60vh]"
      >
        <div className="grid gap-[var(--space-6)] pt-[var(--space-6)] sm:grid-cols-2">
          <div>
            <p className="text-caption text-ink-soft">spark</p>
            <Sketch variant="spark" className="h-[48px] w-[48px]" />
          </div>
          <div>
            <p className="text-caption text-ink-soft">chain (vertical)</p>
            <Sketch variant="chain" className="h-[240px] w-[28px]" />
          </div>
          <div>
            <p className="text-caption text-ink-soft">tools</p>
            <Sketch variant="tools" className="h-[70px] w-[220px] max-w-full" />
          </div>
          <div>
            <p className="text-caption text-ink-soft">arrow</p>
            <Sketch variant="arrow" className="h-[44px] w-[150px]" />
          </div>
        </div>
      </Board>

      {/* 6 · Annotations — sizes + the remaining arrows (4, at budget) */}
      <Board
        id="board-annotations"
        title="Annotation sizes and arrows"
        mirrors="`/work` index · `/thinking` essays · `/playground` opener — 4 objects (at budget)"
        className="mt-[var(--space-9)] min-h-[50vh]"
      >
        <div className="grid gap-[var(--space-6)] pt-[var(--space-6)] sm:grid-cols-2">
          <Annotation size="sm" arrow="up" rotate={-3}>
            sm · 17 px, arrow up
          </Annotation>
          <Annotation size="md" arrow="left" rotate={2}>
            md · 20 px, arrow left
          </Annotation>
          <Annotation size="lg" arrow="right" rotate={-1}>
            lg · 22 px, arrow right
          </Annotation>
          <Annotation size="md" rotate={4}>
            md, no arrow, at the ±4° cap
          </Annotation>
        </div>
      </Board>

      {/* 7 · Content paper — Sheet variants, fasteners, Illustration photo (1 object: the caption) */}
      <Board
        id="board-paper"
        title="Content paper and fasteners"
        mirrors="`/contact` details (postcard) · `/about` capabilities (notebook) · case-study header (taped photo) — 1 object"
        className="mt-[var(--space-9)] min-h-[90vh]"
      >
        <div className="grid gap-[var(--space-6)] pt-[var(--space-6)] lg:grid-cols-2">
          <Sheet variant="postcard" rotate={-0.6} stamp="TP" className="p-[var(--space-5)]">
            <dl className="grid grid-cols-[auto_1fr] gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
              <Hand kind="label" as="dt" className="text-[20px] text-rust">
                email
              </Hand>
              <dd className="font-body text-body text-navy-2">Tushar_Pathak@outlook.com</dd>
              <Hand kind="label" as="dt" className="text-[20px] text-rust">
                based in
              </Hand>
              <dd className="font-body text-body text-navy-2">Bengaluru · remote-friendly</dd>
            </dl>
          </Sheet>

          <Sheet variant="notebook" rotate={0.5} className="p-[var(--space-5)] pl-[var(--space-8)]">
            <h3 className="font-display text-h3 text-navy">Notebook page</h3>
            <p className="mt-[var(--space-2)] font-body text-body text-navy-2">
              Ruled, with a margin and five holes. Body copy is Inter; the only Caveat inside content paper is a{" "}
              <code>data-hand</code> exemption.
            </p>
            <Hand kind="quote" cite="Design.md §3.4" className="mt-[var(--space-3)] text-[20px] text-navy">
              “Everything else in Caveat is a violation.”
            </Hand>
          </Sheet>

          <Illustration
            id="scene-casestudy"
            placement="photo"
            sizes="(min-width: 1024px) 40vw, 100vw"
            rotate={-1.8}
            className="p-[var(--space-3)] pt-[var(--space-6)]"
            caption={
              <Annotation as="figcaption" size="sm" rotate={1}>
                a taped photograph — the caption is the section&apos;s one decoration
              </Annotation>
            }
          >
            <Tape side="l" />
            <Tape side="r" />
          </Illustration>

          <div className="grid content-start gap-[var(--space-5)]">
            <Sheet variant="photo" rotate={2.4} className="p-[var(--space-3)] pt-[var(--space-6)]">
              <Pin tone="steel" />
              <div className="aspect-[4/3] bg-paper-2" />
              <p className="mt-[var(--space-2)] font-body text-caption text-ink-soft">photo frame at the ±2.4° cap, pinned</p>
            </Sheet>
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              <Sheet variant="tag" rotate={0.9} className="px-[var(--space-4)] py-[var(--space-2)]">
                <span className="font-body text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy">kraft tag</span>
              </Sheet>
              <DraftTag />
              <StatusBadge status="research" statusLabel="Research" />
              <Tag>AI</Tag>
            </div>
          </div>
        </div>
      </Board>

      {/* 8 · Band — mirrors the band footer (1): terracotta torn; tagline as data-hand="quote" */}
      <Board id="board-band" title="Band" mirrors="band `<footer>` — 1 object" className="mt-[calc(var(--space-9)+46px)] min-h-[40vh] bg-terracotta text-ivory">
        <TornEdge fill="terracotta" className={`${FULL_BLEED} -mt-[46px]`} />
        <div className="pt-[var(--space-6)]">
          <Hand kind="quote" as="p" cite={<span className="sr-only">Source: hero.tagline</span>} className="text-[26px] text-ivory">
            Observing what others overlook.
          </Hand>
          <a href="#board-hero" className="mt-[var(--space-4)] inline-flex min-h-11 items-center text-[22px] text-ivory focus-ring">
            <Hand kind="cta">Back to the top ↑</Hand>
          </a>
        </div>
      </Board>

      {/* 9 · Deep dive — outer 0; nested chapter owns 1 (TC-127 step 3); quote inside a flat zone (step 4) */}
      <Board
        id="board-deepdive"
        title="Deep dive (outer section)"
        mirrors="case-study deep dive — 0 objects; the nested chapter owns its own"
        className="mt-[var(--space-9)] min-h-[70vh]"
      >
        <section id="board-chapter" aria-labelledby="board-chapter-title" className="pt-[var(--space-6)]">
          <h3 id="board-chapter-title" className="font-display text-h3 text-navy">
            Chapter (nested section) — 1 object
          </h3>
          <Annotation rotate={-2}>the chain, start to finish</Annotation>
          <Prose className="mt-[var(--space-4)]">
            <p>
              A chapter body is a flat zone (<code>data-flat</code>): no decoration may live here. A sourced quote may — it
              is content, not decoration.
            </p>
            <Hand kind="quote" cite="TeachSpark Solution-Space PRD">
              <p>Capability, not dependency.</p>
            </Hand>
            <p>The nearest-ancestor rule gives this chapter its own count; the enclosing section stays at zero.</p>
          </Prose>
          <FlatZone as="table" className="mt-[var(--space-4)] w-full max-w-[68ch] border-collapse font-body text-body text-navy-2">
            <thead>
              <tr>
                <th className="border-b border-navy/20 py-[var(--space-2)] text-left">Metric</th>
                <th className="border-b border-navy/20 py-[var(--space-2)] text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-[var(--space-2)]">Sections on this board</td>
                <td className="py-[var(--space-2)]">10</td>
              </tr>
              <tr>
                <td className="py-[var(--space-2)]">Budget per section</td>
                <td className="py-[var(--space-2)]">4</td>
              </tr>
            </tbody>
          </FlatZone>
        </section>
      </Board>

      {/* 10 · Layout system — Container / Section / SectionHeading / Reveal (TKT-05; `tests/e2e/layout.spec.ts`
          measures the two data-testid nodes and the Reveal demo). 0 objects. */}
      <Board id="board-layout" title="Layout system" mirrors="Container · Section · SectionHeading · Reveal — 0 objects" className="mt-[var(--space-9)]">
        <Container data-testid="layout-demo-container" className="border border-dashed border-navy/20 py-[var(--space-4)]">
          <p className="text-caption text-ink-soft">Container gutter/max-width demo</p>
        </Container>
        <Section data-testid="layout-demo-section" aria-labelledby="layout-demo-heading">
          <SectionHeading
            id="layout-demo-heading"
            eyebrow="Demo"
            title="Section rhythm"
            lead="Vertical padding follows the 72/96/128 token ladder."
          />
          <Reveal data-testid="reveal-demo" className="mt-[var(--space-5)]">
            <p className="text-caption text-navy-2">Reveal fires once via IntersectionObserver, then disconnects.</p>
          </Reveal>
        </Section>
      </Board>

      {/* `?violate=1` — the EVAL-018 positive-control fixture (raw markup, client-rendered off the query). */}
      <Suspense fallback={null}>
        <ViolateFixture />
      </Suspense>
    </div>
  );
}
