import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, GitBranch, Globe, Play, PlayCircle, UserCheck, Users } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { ProductMediaPlayer } from "@/components/portfolio/ProductMediaPlayer";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { formatAsOf } from "@/lib/format";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { BadgeLegend, EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, legendKinds, videoFor } from "@/components/case-study/system/case-context";
import { PaperNav } from "./PaperNav";
import { CaseName } from "@/components/case-study/CaseName";
import { NEXT_EYEBROW, nextLineFor } from "@/components/case-study/NextProject";
import { ARCH, ART, CHIPS, HERO, NAV, WORKFLOW } from "./copy";

const ART_DIR = "/media/case-studies/teachspark/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** A themed pair of paper-craft renditions: the inactive one is `display: none` (never fetched while lazy). */
function ThemedArt({ name, size, alt = "", eager = false }: { name: keyof typeof ART; size: { w: number; h: number }; alt?: string; eager?: boolean }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static transparent WebP from public/, sized, lazy below the fold
        <img
          key={theme}
          src={`${ART_DIR}/${name}-${theme}.webp`}
          data-theme-art={theme}
          alt={alt}
          width={size.w}
          height={size.h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          {...(eager && theme === "light" ? { fetchPriority: "high" as const } : {})}
          aria-hidden={alt === "" ? true : undefined}
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="tsp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

function Panel({
  id,
  n,
  chip,
  headline,
  anchors = [],
  wide = false,
  children,
}: {
  id: string;
  n: number;
  chip: string;
  headline: string;
  anchors?: readonly string[];
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="tsp-panel" data-wide={wide ? "" : undefined} aria-labelledby={`${id}-h`} data-cs-reveal="">
      <Anchors ids={anchors} />
      <p className="tsp-chip">
        <span className="tsp-chip-n" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        <span className="tsp-chip-t">{chip}</span>
      </p>
      <h2 id={`${id}-h`} className="tsp-h2">
        {headline}
      </h2>
      <div className="tsp-panel-body">{children}</div>
    </section>
  );
}

const METRIC_ICONS = [Users, UserCheck, Clock] as const;

function MetricTile({ proof, index }: { proof: CaseProof; index: number }) {
  const Icon = METRIC_ICONS[index] ?? Users;
  return (
    <div className="tsp-metric" data-kind={proof.kind}>
      <span className="tsp-metric-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <div className="tsp-metric-text">
        <p className="tsp-metric-value">{proof.value}</p>
        <p className="tsp-metric-label">{proof.label}</p>
        <p className="tsp-metric-foot">
          <EvidenceBadge kind={proof.kind} />
          {proof.asOf ? <span className="tsp-metric-date">{formatAsOf(proof.asOf)}</span> : null}
        </p>
        {proof.note ? <p className="tsp-metric-note">{proof.note}</p> : null}
      </div>
    </div>
  );
}

export interface PaperViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * TeachSpark's paper-classroom case study (TASK-263; Tushar's mockup + tics.md). A TeachSpark-only layout, chosen by
 * `study.layout === "paper"` in app/work/[slug]/page.tsx, so no other case study changes. Facts come from the record
 * (same helpers the shared system uses: evidence rows, actions, videos, badges); the art is two transparent WebP
 * renditions per scene, swapped by `[data-theme]` in teachspark-paper.css.
 */
export function PaperView({ project, study, portfolio, next }: PaperViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const learnings = sec("learnings");
  const heroImage = "video" in study.hero.media ? undefined : study.hero.media;
  const chat = product?.shots[0];
  const demo = videoFor(project, portfolio, "demo");
  const actions = caseActions(project, portfolio);
  const kinds = legendKinds(study);
  const rows = evidenceRows(project, study);
  const nextLine = nextLineFor(next.slug);
  let n = 0;

  return (
    <>
      <article id={rootId} className="tsp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ─────────────────────────────────────────────────────────────────────────── */}
        <section id="tsp-overview" className="tsp-hero" aria-labelledby="cs-h">
          <Container className="tsp-hero-in">
            <div className="tsp-hero-copy">
              <p className="tsp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>{project.name}</span>
              </p>
              <p className="tsp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="tsp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} fallback={<span className="sr-only">{project.name}</span>} />
                <span className="sr-only">: </span>
                {HERO.headline.map((line) => (
                  <span key={line} className="tsp-h1-line">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="tsp-lede">{HERO.description}</p>
            </div>
            <div className="tsp-cta">
              <a href="#product-demo" className="tsp-btn tsp-btn-primary focus-ring" data-action="watch-demo">
                <Play aria-hidden="true" focusable="false" size={16} strokeWidth={2} fill="currentColor" />
                {HERO.demo}
              </a>
              <a href="#activation" className="tsp-btn tsp-btn-ghost focus-ring">
                {HERO.pilot}
                <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
              </a>
            </div>
            <div className="tsp-hero-art">
              <div className="tsp-hero-scene" style={{ aspectRatio: `${ART.hero.w} / ${ART.hero.h}` }}>
                <ThemedArt name="hero" size={ART.hero} eager />
              </div>
              {chat ? (
                <figure className="tsp-hero-phone">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the real PRD chat screenshot, sized */}
                  <img src={chat.src} alt={chat.alt} width={chat.width} height={chat.height} loading="eager" decoding="async" />
                  <figcaption className="sr-only">{chat.caption}</figcaption>
                </figure>
              ) : null}
            </div>
          </Container>
          <Container className="tsp-metrics-wrap">
            <ul className="tsp-metrics" aria-label="Pilot numbers">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label}>
                  <MetricTile proof={proof} index={index} />
                </li>
              ))}
            </ul>
            <BadgeLegend kinds={kinds} />
          </Container>
        </section>

        <PaperNav items={NAV} name={project.name} />

        <div className="tsp-body">
          {/* ── The problem: one compact strip, evidence kept ─────────────────────────────── */}
          {problem ? (
            <section id={problem.id} className="tsp-problem" aria-labelledby={`${problem.id}-h`} data-cs-reveal="">
              <Anchors ids={problem.anchors} />
              <Container className="tsp-problem-in">
                <h2 id={`${problem.id}-h`} className="tsp-problem-h">
                  {problem.headline}
                </h2>
                <p className="tsp-problem-p">{problem.context}</p>
                {problem.quote ? (
                  <figure className="tsp-quote">
                    <blockquote>{problem.quote.text}</blockquote>
                    <figcaption>{problem.quote.attribution}</figcaption>
                  </figure>
                ) : null}
              </Container>
            </section>
          ) : null}

          <Container className="tsp-grid">
            {/* 01 · How it works */}
            {product ? (
              <Panel id={product.id} n={++n} chip={CHIPS.workflow} headline={product.headline}>
                <figure className="tsp-flow" aria-label="How a worksheet is made">
                  <div className="tsp-flow-art" style={{ aspectRatio: `${ART.workflow.w} / ${ART.workflow.h}` }}>
                    <ThemedArt name="workflow" size={ART.workflow} />
                  </div>
                  <ol className="tsp-flow-steps">
                    {WORKFLOW.map((step, index) => (
                      <li key={step.title} className="tsp-flow-step" style={{ "--x": step.x } as CSSProperties}>
                        <span className="tsp-flow-n" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="tsp-flow-title">{step.title}</span>
                        <span className="tsp-flow-cap">{step.caption}</span>
                      </li>
                    ))}
                  </ol>
                </figure>
                <p className="tsp-p">{product.summary}</p>
                {product.flow ? (
                  <details className="tsp-more">
                    <summary className="focus-ring">The full {product.flow.steps.length}-step loop</summary>
                    <ol className="tsp-loop">
                      {product.flow.steps.map((step) => (
                        <li key={step.label}>{step.label}</li>
                      ))}
                    </ol>
                    <p className="tsp-small">{product.flow.caption}</p>
                  </details>
                ) : null}
              </Panel>
            ) : null}

            {/* 02 · Product demo: the real screenshots on a poster; the iframe only mounts on a press */}
            <Panel id="product-demo" n={++n} chip={CHIPS.demo} headline="See it work.">
              {demo ? (
                <div className="tsp-video">
                  <ProductMediaPlayer
                    media={demo}
                    className="tsp-video-player"
                    analytics={{ projectId: project.slug, videoType: "demo" }}
                    fallbackPoster={
                      <span className="tsp-poster">
                        {chat ? (
                          // eslint-disable-next-line @next/next/no-img-element -- the real PRD chat screenshot
                          <img className="tsp-poster-a" src={chat.src} alt={chat.alt} width={chat.width} height={chat.height} loading="lazy" decoding="async" />
                        ) : null}
                        {heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- the real landing-page screenshot
                          <img className="tsp-poster-b" src={heroImage.src} alt={heroImage.alt} width={heroImage.width} height={heroImage.height} loading="lazy" decoding="async" />
                        ) : null}
                      </span>
                    }
                  />
                  <span className="tsp-video-chip" aria-hidden="true">
                    <PlayCircle size={16} strokeWidth={1.8} /> {HERO.demo}
                  </span>
                </div>
              ) : null}
              <p className="tsp-small tsp-cap">
                {chat?.caption ? `${chat.caption}; ` : ""}the landing page is the live product on a phone.
              </p>
            </Panel>

            {/* 03 · Key product decisions */}
            {decisions ? (
              <Panel id={decisions.id} n={++n} chip={CHIPS.decisions} headline={decisions.headline} anchors={decisions.anchors}>
                <ul className="tsp-decisions">
                  {decisions.items.map((item, index) => (
                    <li key={item.chose} className="tsp-decision" data-i={index + 1}>
                      <h3 className="tsp-h3">{item.chose}</h3>
                      <p>
                        <span className="tsp-lab">Considered</span> {item.could}
                      </p>
                      <p>
                        <span className="tsp-lab">Why</span> {item.because}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            {/* 04 · System architecture */}
            {system ? (
              <Panel id={system.id} n={++n} chip={CHIPS.system} headline={system.headline} anchors={system.anchors}>
                <figure className="tsp-arch" aria-labelledby={`${system.id}-cap`}>
                  <div className="tsp-arch-scroll" role="region" aria-label="Architecture diagram, scrolls sideways" tabIndex={0}>
                    <div className="tsp-arch-inner">
                      <div className="tsp-arch-art" style={{ aspectRatio: `${ART.arch.w} / ${ART.arch.h}` }}>
                        <ThemedArt name="arch" size={ART.arch} />
                      </div>
                      <ol className="tsp-arch-nodes">
                        {ARCH.map((node) => {
                          const step = system.steps[node.step];
                          const via = "sub" in node ? system.steps[node.sub] : undefined;
                          if (!step) return null;
                          return (
                            <li key={step.label} className="tsp-arch-node" style={{ "--x": node.x } as CSSProperties}>
                              <span className="tsp-arch-label">{step.label}</span>
                              {via ? <span className="tsp-arch-note">via {via.label}</span> : step.note ? <span className="tsp-arch-note">{step.note}</span> : null}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                  <figcaption id={`${system.id}-cap`} className="tsp-small">
                    {system.caption}. {system.steps[system.steps.length - 1]?.label}: the PDF comes back to the teacher.
                  </figcaption>
                </figure>
                <details className="tsp-more" open>
                  <summary className="focus-ring">Technical notes</summary>
                  <ul className="tsp-notes">
                    {system.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </details>
              </Panel>
            ) : null}

            {/* 05 · Pilot impact */}
            {outcome ? (
              <Panel id={outcome.id} n={++n} chip={CHIPS.impact} headline={outcome.headline} anchors={outcome.anchors}>
                {outcome.funnel ? (
                  <figure className="tsp-funnel" aria-labelledby="tsp-funnel-cap">
                    <ol className="tsp-funnel-steps">
                      {outcome.funnel.steps.map((step, index) => {
                        const top = Math.max(...outcome.funnel!.steps.map((s) => s.value), 1);
                        const key = step.label === "Activated";
                        return (
                          <li key={step.label} className="tsp-funnel-step" data-key={key ? "" : undefined} style={{ "--w": `${Math.max((step.value / top) * 100, 5)}%`, "--i": index } as CSSProperties}>
                            <span className="tsp-funnel-label">{step.label}</span>
                            {/* TASK-294: the conversion % labels its bar; the count stays in the right column */}
                            <span className="tsp-funnel-track">
                              <span className="tsp-funnel-bar" aria-hidden="true" />
                              {step.note ? <span className="tsp-funnel-note">{step.note}</span> : null}
                            </span>
                            <span className="tsp-funnel-value">{step.value}</span>
                          </li>
                        );
                      })}
                    </ol>
                    <figcaption id="tsp-funnel-cap" className="tsp-small">
                      {outcome.funnel.caption} <EvidenceBadge kind={outcome.funnel.kind} /> <span className="tsp-metric-date">{formatAsOf(outcome.funnel.asOf)}</span>
                    </figcaption>
                  </figure>
                ) : null}
                {outcome.proofs.length > 0 ? (
                  <ul className="tsp-callouts">
                    {outcome.proofs.map((proof) => (
                      <li key={proof.label}>
                        <strong>{proof.value}</strong> {proof.label} <EvidenceBadge kind={proof.kind} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {outcome.gaps.length > 0 ? (
                  <div className="tsp-gaps">
                    <h3 className="tsp-h3">What this does not tell us</h3>
                    <ul>
                      {outcome.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Panel>
            ) : null}

            {/* 06 · Key learnings */}
            {learnings ? (
              <Panel id={learnings.id} n={++n} chip={CHIPS.learnings} headline={learnings.headline} anchors={learnings.anchors}>
                <ol className="tsp-learnings">
                  {learnings.items.map((item, index) => (
                    <li key={item.title} className="tsp-learning">
                      <span className="tsp-learning-n" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="tsp-h3">{item.title}</h3>
                        <p>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            ) : null}

            {/* 07 · Explore the full story */}
            <Panel id="explore" n={++n} chip={CHIPS.explore} headline="Every claim has a source." wide>
              <ul className="tsp-tiles">
                {actions.map((action) => {
                  const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                  return (
                    <li key={action.kind}>
                      <a href={action.href} target="_blank" rel="noopener noreferrer" className="tsp-tile focus-ring" data-action={action.kind}>
                        <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="tsp-tile-icon" />
                        <span className="tsp-tile-text">
                          <span className="tsp-tile-label">{action.label}</span>
                          <span className="tsp-tile-hint">{action.hint}</span>
                        </span>
                        <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                        <span className="sr-only"> {NEW_TAB_HINT}</span>
                      </a>
                    </li>
                  );
                })}
                {rows.length > 0 ? (
                  <li className="tsp-tile-drawer">
                    <EvidenceDrawer rows={rows} name={project.name} />
                  </li>
                ) : null}
              </ul>
              <p className="tsp-small tsp-meta">
                {[project.role, project.duration, portfolio.meta].join(" · ")}
              </p>
            </Panel>
          </Container>
        </div>
      </article>

      {/* ── Next project: a paper landscape band; the whole band is one link (same contract as NextProject) ── */}
      <section className="tsp-next next-band" aria-label="Next project">
        <div className="tsp-next-art next-band-art" data-fit="bleed" aria-hidden="true">
          <ThemedArt name="footer" size={ART.footer} />
        </div>
        <Container className="tsp-next-in next-band-in">
          <ViewTransitionLink
            href={`/work/${next.slug}`}
            transitionName={`project-${next.slug}`}
            aria-label={`Next project: ${next.name} ${NEW_TAB_HINT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tsp-next-link next-band-link"
          >
            <span className="tsp-next-eyebrow next-band-eyebrow">{NEXT_EYEBROW}</span>
            <h2 className="tsp-next-h next-band-h">
              <CaseName slug={next.slug} name={next.name} /> <span aria-hidden="true">→</span>
            </h2>
            {nextLine ? <span className="tsp-next-line next-band-line">{nextLine}</span> : null}
          </ViewTransitionLink>
        </Container>
      </section>
    </>
  );
}
