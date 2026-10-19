import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, FileText, GitBranch, Globe, Handshake, Layers, PlayCircle, Repeat, ScrollText, ShieldCheck, Gavel } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { formatAsOf } from "@/lib/format";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { BadgeLegend, EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, legendKinds } from "@/components/case-study/system/case-context";
import { VelNav } from "./VelNav";
import { ART, EVIDENCE, HERO, LEARNINGS, NAV, NEXT, PIVOT, PRODUCT, PROBLEM, RESEARCH, SECTION, SOURCES, SUPPORTS_OVERRIDE } from "./copy";
import screens from "../../../public/media/case-studies/velora/art/hero-screen.json";
import footerFit from "../../../public/media/case-studies/velora/art/footer-fit.json";

const ART_DIR = "/media/case-studies/velora/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** A themed pair of paper-craft renditions: the inactive one is `display: none` (never fetched while lazy). */
function ThemedArt({ name, size, eager = false }: { name: "hero" | "footer"; size: Record<"light" | "dark", { w: number; h: number }>; eager?: boolean }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static transparent WebP from public/, sized, lazy below the fold
        <img
          key={theme}
          src={`${ART_DIR}/${name}-${theme}.webp`}
          data-theme-art={theme}
          alt=""
          aria-hidden="true"
          width={size[theme].w}
          height={size[theme].h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          {...(eager && theme === "light" ? { fetchPriority: "high" as const } : {})}
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="vlp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered story section: number badge on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`vlp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="vlp-num" aria-hidden="true">
        {n}
      </span>
      <div className="vlp-sec-in">
        <p className="vlp-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="vlp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const FLOW_ICONS = [Handshake, FileText, Gavel] as const; // Match, RFP, Bid
const LEARNING_ICONS = [ShieldCheck, Repeat, BadgeCheck] as const;

function Proof({ proof, label, className, note = true }: { proof: CaseProof; label: string; className: string; note?: boolean }) {
  return (
    <div className={className} data-kind={proof.kind}>
      <p className={`${className}-value`}>{proof.value}</p>
      <p className={`${className}-label`}>{label}</p>
      <p className="vlp-metric-foot">
        <EvidenceBadge kind={proof.kind} />
        {proof.asOf ? <span className="vlp-date">{formatAsOf(proof.asOf)}</span> : null}
      </p>
      {note && proof.note ? <p className="vlp-metric-note">{proof.note}</p> : null}
    </div>
  );
}

export interface VeloraViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Velora's origami paper-craft case study (TASK-273; Tushar's brief vel.md + mockup). A Velora-only layout, chosen by
 * `study.layout === "velora"` in app/work/[slug]/page.tsx, so no other case study changes (same architecture as the
 * RailCite layout, TASK-268). Facts come from the record; the real product screenshots are the record's own shots
 * (never redrawn); the Higgsfield art is decorative, two transparent renditions per scene swapped by `[data-theme]`,
 * and the hero diorama's blank device screen is filled in HTML/CSS with the real role-select screenshot.
 * The first product's name appears only in the next-project band (the brief's hard rule).
 */
export function VeloraView({ project, study, portfolio, next }: VeloraViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const research = sec("research");
  const pivot = sec("pivot");
  const product = sec("product");
  const learnings = sec("learnings");
  const outcome = sec("outcome");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const kinds = legendKinds(study);
  const rows = evidenceRows(project, study)
    .filter((row) => !/nuptis/i.test(`${row.title} ${row.supports}`) || row.title in SUPPORTS_OVERRIDE)
    .map((row) => (SUPPORTS_OVERRIDE[row.title] ? { ...row, supports: SUPPORTS_OVERRIDE[row.title]! } : row));
  const heroMedia = study.hero.media;
  const heroShot = heroMedia && "src" in heroMedia ? heroMedia : undefined;
  const timeline = research?.timeline;

  return (
    <>
      <article id={rootId} className="vlp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ─────────────────────────────────────────────────────────────────────────── */}
        <section id="vlp-overview" className="vlp-hero" aria-labelledby="cs-h">
          <Container className="vlp-hero-in">
            <div className="vlp-hero-copy">
              <p className="vlp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="vlp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="vlp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                {project.name}
              </h1>
              <p className="vlp-tagline">{study.hero.tagline}</p>
              <p className="vlp-lede">{study.hero.proposition}</p>
              <div className="vlp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="vlp-btn vlp-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="vlp-btn vlp-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div
              className="vlp-hero-art"
              style={
                {
                  "--sx-l": `${screens.light.left}%`, "--sy-l": `${screens.light.top}%`, "--sw-l": `${screens.light.width}%`, "--sh-l": `${screens.light.height}%`, "--ar-l": `${ART.hero.light.w} / ${ART.hero.light.h}`,
                  "--sx-d": `${screens.dark.left}%`, "--sy-d": `${screens.dark.top}%`, "--sw-d": `${screens.dark.width}%`, "--sh-d": `${screens.dark.height}%`, "--ar-d": `${ART.hero.dark.w} / ${ART.hero.dark.h}`,
                } as CSSProperties
              }
            >
              <div className="vlp-hero-scene">
                <ThemedArt name="hero" size={ART.hero} eager />
                {heroShot ? (
                  <figure className="vlp-hero-screen">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the real Velora screenshot, unmodified, composited into the blank device screen */}
                    <img src={heroShot.src} alt={heroShot.alt} width={heroShot.width} height={heroShot.height} loading="eager" decoding="async" />
                  </figure>
                ) : null}
              </div>
              <p className="vlp-sticky" aria-hidden="true">
                {HERO.stickyNote}
              </p>
            </div>
          </Container>
          <Container className="vlp-metrics-wrap">
            <ul className="vlp-metrics" aria-label="Velora in numbers">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label}>
                  <Proof proof={proof} label={HERO.proofLabels[index] ?? proof.label} className="vlp-metric" note={false} />
                </li>
              ))}
            </ul>
            <BadgeLegend kinds={kinds} />
          </Container>
        </section>

        <VelNav items={NAV} name={project.name} />

        <Container className="vlp-body">
          {/* 01 · The problem */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="vlp-p">{PROBLEM.lede}</p>
              <ol className="vlp-steps" aria-label="How a brand finds a factory today">
                {PROBLEM.steps.map((step, index) => (
                  <li key={step.label} className="vlp-step" data-i={index + 1}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative paper object, sized WebP */}
                    <img src={`${ART_DIR}/obj-${step.art}.webp`} alt="" aria-hidden="true" width={ART.obj[step.art].w} height={ART.obj[step.art].h} loading="lazy" decoding="async" />
                    <span className="vlp-step-label">{step.label}</span>
                  </li>
                ))}
              </ol>
              {problem.flow ? (
                <details className="vlp-more">
                  <summary className="focus-ring">{PROBLEM.fullFlow}</summary>
                  <p className="vlp-small">{problem.context}</p>
                  <ol className="vlp-loop">
                    {problem.flow.steps.map((step) => (
                      <li key={step.label}>{step.label}</li>
                    ))}
                  </ol>
                  <p className="vlp-small">{problem.flow.caption}</p>
                </details>
              ) : null}
            </Sec>
          ) : null}

          {/* 02 · The research insight */}
          {research ? (
            <Sec section={research} n="02">
              <p className="vlp-p">{RESEARCH.lede}</p>
              {timeline ? (
                <figure className="vlp-strip" aria-label={RESEARCH.stripLabel}>
                  <div className="vlp-strip-bar" aria-hidden="true">
                    <span className="vlp-strip-active" />
                    <span className="vlp-strip-wait" />
                  </div>
                  <ul className="vlp-strip-legend">
                    <li data-seg="active">{timeline.active}</li>
                    <li data-seg="wait">{timeline.waiting}</li>
                  </ul>
                  <figcaption className="vlp-qualifier">
                    <ScrollText aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                    {RESEARCH.qualifier}
                  </figcaption>
                </figure>
              ) : null}
            </Sec>
          ) : null}

          {/* 03 · The pivot */}
          {pivot ? (
            <Sec section={pivot} n="03">
              <div className="vlp-pivot">
                <div className="vlp-retired" aria-label={PIVOT.retired}>
                  <span className="vlp-retired-card" aria-hidden="true">
                    <i /> <i /> <i />
                  </span>
                  <span className="vlp-stamp">{pivot.stamp}</span>
                </div>
                <ol className="vlp-decide">
                  {PIVOT.steps.map((step, index) => (
                    <li key={step.k} className="vlp-decide-step" data-i={index + 1}>
                      <span className="vlp-decide-k">{step.k}</span>
                      <span className="vlp-decide-v">{step.v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Sec>
          ) : null}

          {/* 04 · The product bet: the record's real screenshots */}
          {product ? (
            <Sec section={product} n="04">
              <p className="vlp-p">{PRODUCT.lede}</p>
              <ol className="vlp-flow" aria-label="Brand and manufacturer: match, RFP, bid">
                {PRODUCT.flow.map((label, index) => {
                  const Icon = index === 0 ? Layers : FLOW_ICONS[index - 1]!;
                  return (
                    <li key={label} className="vlp-flow-step">
                      <Icon aria-hidden="true" focusable="false" size={18} strokeWidth={1.7} />
                      {label}
                    </li>
                  );
                })}
              </ol>
              <div className="vlp-shots">
                {product.shots.map((shot, index) => (
                  <figure key={shot.src} className="vlp-shot" data-i={index + 1}>
                    <div className="vlp-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="vlp-cap">
                      {index === 0 ? (
                        <span className="vlp-score" data-testid="score-caveat">
                          {PRODUCT.scoreCaveat}
                        </span>
                      ) : null}
                      <span>{PRODUCT.captions[index] ?? shot.caption}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Sec>
          ) : null}

          {/* 05 · Key learnings */}
          {learnings ? (
            <Sec section={learnings} n="05">
              <ol className="vlp-cards">
                {LEARNINGS.map((item, index) => {
                  const Icon = LEARNING_ICONS[index] ?? BadgeCheck;
                  return (
                    <li key={item.title} className="vlp-card" data-i={index + 1}>
                      <span className="vlp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <p className="vlp-card-n" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="vlp-h3">{item.title}</h3>
                      <p className="vlp-card-p">{item.body}</p>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 06 · Evidence */}
          {outcome ? (
            <Sec section={outcome} n="06" className="vlp-evidence">
              <div className="vlp-evidence-grid">
                <ul className="vlp-stats">
                  {outcome.proofs.map((proof) => (
                    <li key={proof.label}>
                      <Proof proof={proof} label={proof.label} className="vlp-stat" />
                    </li>
                  ))}
                </ul>
                {outcome.gaps.length > 0 ? (
                  <div className="vlp-gaps">
                    <h3 className="vlp-h3">{EVIDENCE.gaps}</h3>
                    <ul>
                      {outcome.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Sec>
          ) : null}

          {/* Sources and artifacts */}
          <section id="explore" className="vlp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="vlp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="vlp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="vlp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="vlp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="vlp-tile-icon" />
                      <span className="vlp-tile-text">
                        <span className="vlp-tile-label">{action.label}</span>
                        <span className="vlp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="vlp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="vlp-small vlp-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* ── Next project: the only place the first product is named; a wedding vendor-operations paper diorama ── */}
      <section className="vlp-next" aria-label="Next project">
        <div className="vlp-next-art" aria-hidden="true" style={{ "--fx-l": footerFit.light.x0, "--fx-d": footerFit.dark.x0 } as CSSProperties}>
          <ThemedArt name="footer" size={ART.footer} />
        </div>
        <Container className="vlp-next-in">
          <ViewTransitionLink
            href={`/work/${next.slug}`}
            transitionName={`project-${next.slug}`}
            aria-label={`Next project: ${next.name} ${NEW_TAB_HINT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vlp-next-link"
          >
            <span className="vlp-next-eyebrow">{NEXT.eyebrow}</span>
            <h2 className="vlp-next-h">
              {next.name} <span aria-hidden="true">→</span>
            </h2>
            {next.slug === "nuptis" ? <span className="vlp-next-line">{NEXT.line}</span> : null}
          </ViewTransitionLink>
        </Container>
      </section>
    </>
  );
}
