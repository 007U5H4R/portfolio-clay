import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Cog,
  FileText,
  FileX2,
  Files,
  Filter,
  GitBranch,
  Globe,
  Hourglass,
  PlayCircle,
  Quote,
  RefreshCw,
  Scale,
  ScanText,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { CaseName } from "@/components/case-study/CaseName";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { formatAsOf } from "@/lib/format";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { BadgeLegend, EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, legendKinds } from "@/components/case-study/system/case-context";
import { RailNav } from "./RailNav";
import { ART, DECISION_TITLES, EVIDENCE, HERO, NAV, NEXT, PROBLEM, PRODUCT, SOURCES, SYSTEM } from "./copy";

const ART_DIR = "/media/case-studies/railcite/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** A themed pair of paper-craft renditions: the inactive one is `display: none` (never fetched while lazy). */
function ThemedArt({ name, size, eager = false }: { name: keyof typeof ART; size: { w: number; h: number }; eager?: boolean }) {
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
          width={size.w}
          height={size.h}
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
        <span key={id} id={id} className="rcp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered story section: copper number on the rail, label, the record's headline as the h2. */
function Sec({
  section,
  n,
  children,
  className = "",
}: {
  section: { id: string; eyebrow: string; headline: string; anchors: readonly string[] };
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={section.id} className={`rcp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="rcp-num" aria-hidden="true">
        {n}
      </span>
      <div className="rcp-sec-in">
        <p className="rcp-label">{section.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="rcp-h2">
          {section.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const METRIC_ICONS = [FileText, ShieldCheck, ScanText] as const;

function MetricTile({ proof, index }: { proof: CaseProof; index: number }) {
  const Icon = METRIC_ICONS[index] ?? FileText;
  return (
    <div className="rcp-metric" data-kind={proof.kind}>
      <span className="rcp-metric-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <div className="rcp-metric-text">
        <p className="rcp-metric-value">{proof.value}</p>
        <p className="rcp-metric-label">{proof.label}</p>
        <p className="rcp-metric-foot">
          <EvidenceBadge kind={proof.kind} />
          {proof.asOf ? <span className="rcp-date">{formatAsOf(proof.asOf)}</span> : null}
        </p>
        {proof.note ? <p className="rcp-metric-note">{proof.note}</p> : null}
      </div>
    </div>
  );
}

const PROBLEM_ICONS = { files: Files, scan: ScanText, superseded: FileX2, search: Search } as const;
const DECISION_ICONS = [Scale, Cog, Filter] as const;
const LEARNING_ICONS = [BadgeCheck, ShieldCheck, RefreshCw] as const;
const SYSTEM_ICONS = [Hourglass, Cog, Search, Scale, FileText, BadgeCheck, ShieldCheck] as const;

export interface RailciteViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * RailCite's paper-archive case study (TASK-268; Tushar's mockups + RCCS.md). A RailCite-only layout, chosen by
 * `study.layout === "railcite"` in app/work/[slug]/page.tsx, so no other case study changes. Facts come from the
 * record (same helpers the shared system uses: evidence rows, actions, badges); the real product screenshots are the
 * record's own shots; the art is two transparent WebP renditions per scene, swapped by `[data-theme]` in
 * railcite-paper.css.
 */
export function RailciteView({ project, study, portfolio, next }: RailciteViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const learnings = sec("learnings");
  const [answerShot, sourcesShot] = product?.shots ?? [];
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const kinds = legendKinds(study);
  const rows = evidenceRows(project, study);
  const artifactTypes = [...new Set(study.evidence.map((item) => item.type))];

  return (
    <>
      <article id={rootId} className="rcp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ─────────────────────────────────────────────────────────────────────────── */}
        <section id="rcp-overview" className="rcp-hero" aria-labelledby="cs-h">
          <Container className="rcp-hero-in">
            <div className="rcp-hero-copy">
              <p className="rcp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="rcp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="rcp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="rcp-tagline">{study.hero.tagline}</p>
              <p className="rcp-lede">{study.hero.proposition}</p>
              <div className="rcp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="rcp-btn rcp-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="rcp-btn rcp-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="rcp-hero-art">
              <div className="rcp-hero-scene" data-parallax="back">
                <ThemedArt name="hero" size={ART.hero} eager />
              </div>
              {answerShot ? (
                <figure className="rcp-hero-card" data-parallax="front">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the real RailCite Ask screenshot, sized */}
                  <img src={answerShot.src} alt={answerShot.alt} width={answerShot.width} height={answerShot.height} loading="eager" decoding="async" />
                  <figcaption className="sr-only">{answerShot.caption}</figcaption>
                </figure>
              ) : null}
              <p className="rcp-sticky" aria-hidden="true">
                {HERO.stickyNote}
              </p>
            </div>
          </Container>
          <Container className="rcp-metrics-wrap">
            <ul className="rcp-metrics" aria-label="RailCite in numbers">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label}>
                  <MetricTile proof={proof} index={index} />
                </li>
              ))}
            </ul>
            <BadgeLegend kinds={kinds} />
          </Container>
        </section>

        <RailNav items={NAV} name={project.name} />

        <Container className="rcp-body">
          {/* 01 · The problem */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="rcp-p">{PROBLEM.lede}</p>
              <ol className="rcp-steps" aria-label="How a justification is written today">
                {PROBLEM.steps.map((step, index) => {
                  const Icon = PROBLEM_ICONS[step.icon];
                  return (
                    <li key={step.label} className="rcp-step" data-i={index + 1}>
                      <span className="rcp-tile" aria-hidden="true">
                        <Icon size={24} strokeWidth={1.6} />
                      </span>
                      <span className="rcp-step-label">{step.label}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="rcp-outcome">
                <BadgeCheck aria-hidden="true" focusable="false" size={18} strokeWidth={1.8} />
                {PROBLEM.outcome}
              </p>
              {problem.quote ? (
                <figure className="rcp-quote">
                  <Quote className="rcp-quote-mark" aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                  <blockquote>{problem.quote.text}</blockquote>
                  <figcaption>{problem.quote.attribution}</figcaption>
                </figure>
              ) : null}
              {problem.flow ? (
                <details className="rcp-more">
                  <summary className="focus-ring">{PROBLEM.fullFlow}</summary>
                  <p className="rcp-small">{problem.context}</p>
                  <ol className="rcp-loop">
                    {problem.flow.steps.map((step) => (
                      <li key={step.label}>{step.label}</li>
                    ))}
                  </ol>
                  <p className="rcp-small">{problem.flow.caption}</p>
                </details>
              ) : null}
            </Sec>
          ) : null}

          {/* 02 · The product: the record's real screenshots */}
          {product ? (
            <Sec section={product} n="02">
              <p className="rcp-p">{PRODUCT.lede}</p>
              <div className="rcp-shots">
                {[answerShot, sourcesShot].map((shot, index) =>
                  shot ? (
                    <figure key={shot.src} className="rcp-shot" data-i={index + 1}>
                      <div className="rcp-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption className="rcp-cap">{shot.caption}</figcaption>
                    </figure>
                  ) : null,
                )}
                <p className="rcp-sticky rcp-sticky-b" aria-hidden="true">
                  {PRODUCT.note}
                </p>
              </div>
              <ul className="rcp-chips">
                {PRODUCT.chips.map((chip, index) => (
                  <li key={chip.title} className="rcp-chip" data-i={index + 1}>
                    <strong>{chip.title}</strong>
                    <span>{chip.hint}</span>
                  </li>
                ))}
              </ul>
              <div className="rcp-states">
                {product.states.map((state) => (
                  <div key={state.title} className="rcp-state" data-tone={state.tone}>
                    <h3 className="rcp-h3">{state.title}</h3>
                    <ul>
                      {state.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Sec>
          ) : null}

          {/* 03 · Product decisions */}
          {decisions ? (
            <Sec section={decisions} n="03">
              <ul className="rcp-cards">
                {decisions.items.map((item, index) => {
                  const Icon = DECISION_ICONS[index] ?? Scale;
                  return (
                    <li key={item.chose} className="rcp-card" data-i={index + 1}>
                      <span className="rcp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <p className="rcp-card-n" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="rcp-h3">{DECISION_TITLES[index] ?? item.chose}</h3>
                      <p className="rcp-card-p">{item.because}</p>
                    </li>
                  );
                })}
              </ul>
            </Sec>
          ) : null}

          {/* 04 · How trust works */}
          {system ? (
            <Sec section={system} n="04">
              <figure className="rcp-flow" aria-labelledby={`${system.id}-cap`}>
                <ol className="rcp-pipe">
                  {system.steps.map((step, index) => {
                    const Icon = SYSTEM_ICONS[index] ?? Cog;
                    const key = index === SYSTEM.validator;
                    return (
                      <li key={step.label} className="rcp-node" data-key={key ? "" : undefined}>
                        <span className="rcp-node-n" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="rcp-tile" aria-hidden="true">
                          <Icon size={22} strokeWidth={1.6} />
                        </span>
                        <span className="rcp-node-text">
                          <span className="rcp-node-label">{step.label}</span>
                          {step.note ? <span className="rcp-node-note">{step.note}</span> : null}
                          {key ? <span className="rcp-node-flag">{SYSTEM.checkpoint}</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <figcaption id={`${system.id}-cap`} className="rcp-small">
                  {system.caption}
                </figcaption>
              </figure>
              <div className="rcp-fail">
                <h3 className="rcp-h3">{SYSTEM.failure}</h3>
                <ul>
                  {system.rules.slice(0, 2).map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
              {system.rules.slice(2).map((rule) => (
                <p key={rule} className="rcp-small rcp-rule">
                  {rule}
                </p>
              ))}
            </Sec>
          ) : null}

          {/* 05 · Evidence */}
          {outcome ? (
            <Sec section={outcome} n="05" className="rcp-evidence">
              <p className="rcp-p">{outcome.intro}</p>
              <ul className="rcp-stats">
                {outcome.proofs.map((proof) => (
                  <li key={proof.label} className="rcp-stat" data-kind={proof.kind}>
                    <p className="rcp-stat-value">{proof.value}</p>
                    <p className="rcp-stat-label">{proof.label}</p>
                    <p className="rcp-metric-foot">
                      <EvidenceBadge kind={proof.kind} />
                      {proof.asOf ? <span className="rcp-date">{formatAsOf(proof.asOf)}</span> : null}
                    </p>
                    {proof.note ? <p className="rcp-metric-note">{proof.note}</p> : null}
                  </li>
                ))}
              </ul>
              {outcome.gaps.length > 0 ? (
                <div className="rcp-gaps">
                  <h3 className="rcp-h3">{EVIDENCE.gaps}</h3>
                  <ul>
                    {outcome.gaps.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Sec>
          ) : null}

          {/* 06 · Key learnings */}
          {learnings ? (
            <Sec section={learnings} n="06">
              <ol className="rcp-cards">
                {learnings.items.map((item, index) => {
                  const Icon = LEARNING_ICONS[index] ?? BadgeCheck;
                  return (
                    <li key={item.title} className="rcp-card" data-i={index + 1}>
                      <span className="rcp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <p className="rcp-card-n" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="rcp-h3">{item.title}</h3>
                      <p className="rcp-card-p">{item.body}</p>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* Sources and artifacts */}
          <section id="explore" className="rcp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="rcp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="rcp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="rcp-artifacts" aria-label="Artifact types in the evidence">
              {artifactTypes.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
            <ul className="rcp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="rcp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="rcp-tile-icon" />
                      <span className="rcp-tile-text">
                        <span className="rcp-tile-label">{action.label}</span>
                        <span className="rcp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="rcp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="rcp-small rcp-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* ── Next project: a fashion paper diorama (Velora is apparel); the whole band is one link ── */}
      <section className="rcp-next" aria-label="Next project">
        <div className="rcp-next-art" aria-hidden="true">
          <ThemedArt name="footer" size={ART.footer} />
        </div>
        <Container className="rcp-next-in">
          <ViewTransitionLink
            href={`/work/${next.slug}`}
            transitionName={`project-${next.slug}`}
            aria-label={`Next project: ${next.name} ${NEW_TAB_HINT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rcp-next-link"
          >
            <span className="rcp-next-eyebrow">{NEXT.eyebrow}</span>
            <h2 className="rcp-next-h">
              <CaseName slug={next.slug} name={next.name} /> <span aria-hidden="true">→</span>
            </h2>
            <span className="rcp-next-line">{NEXT.line}</span>
          </ViewTransitionLink>
        </Container>
      </section>
    </>
  );
}
