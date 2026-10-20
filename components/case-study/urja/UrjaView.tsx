import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Coins, Flag, Fuel, Gauge, GitBranch, Globe, ListChecks, MapPin, Milestone, Newspaper, PlayCircle, Route, ShieldCheck, Sparkles, Target, Ticket, TriangleAlert, UserCheck, CircleCheck, MessageCircleQuestion } from "lucide-react";
import type { CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, videoFor } from "@/components/case-study/system/case-context";
import { ProductMediaPlayer } from "@/components/portfolio/ProductMediaPlayer";
import { NextProject } from "@/components/case-study/NextProject";
import { CaseName } from "@/components/case-study/CaseName";
import { UrpNav } from "./UrpNav";
import { ART, DECISIONS, EVIDENCE, HERO, NAV, NEXT_LINE, PRODUCT, PROBLEM, SECTION, SOURCES, SYSTEM, TEACHSPARK_NEXT_ART } from "./copy";

const ART_DIR = "/media/case-studies/urja/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** The hero diorama: two renditions painted on each theme's own page colour; the inactive one is display:none. */
function HeroArt() {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static pre-sized WebP from public/, one per theme
        <img key={theme} src={`${ART_DIR}/hero-${theme}.webp`} data-theme-art={theme} alt="" aria-hidden="true" width={ART.hero.w} height={ART.hero.h} loading="lazy" decoding="async" />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="urp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`urp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="urp-num" aria-hidden="true">
        {n}
      </span>
      <div className="urp-sec-in">
        <p className="urp-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="urp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const ROAD_ICONS = [MapPin, Fuel, Ticket, Milestone, Coins, Flag] as const;
const SYSTEM_ICONS = [Route, ListChecks, Gauge, Newspaper, MessageCircleQuestion] as const;
const DECISION_ICONS = [Target, ShieldCheck, UserCheck] as const;

export interface UrjaViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Urja's paper-craft case study (TASK-284; Tushar's brief urja.md + mockup). An Urja-only layout, chosen by
 * `study.layout === "urja"` in app/work/[slug]/page.tsx (same architecture as Nuptis, TASK-278). Facts come from the record; the
 * Today, trip-evidence and Hindi morning-brief screenshots are the record's own files (never redrawn), and the hero keeps the
 * pitch video on the Today capture as its poster. The two dioramas are decorative, painted on each theme's exact page colour.
 * The next-project band is the shared NextProject with the TeachSpark artwork on the cream / lifted-navy band surface.
 */
export function UrjaView({ project, study, portfolio, next }: UrjaViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem")!;
  const product = sec("product")!;
  const decisions = sec("decisions")!;
  const system = sec("system")!;
  const outcome = sec("outcome")!;
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const rows = evidenceRows(project, study);
  const types = Array.from(new Set(study.evidence.map((item) => item.type)));
  const heroMedia = study.hero.media;
  const poster = "video" in heroMedia ? heroMedia.poster : undefined;
  const pitch = "video" in heroMedia ? videoFor(project, portfolio, heroMedia.video) : undefined;
  const shots = product.shots;

  return (
    <>
      <article id={rootId} className="urp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero: copy left, the real Today capture (the pitch video's poster) right, proofs and the diorama below ── */}
        <section id="urp-overview" className="urp-hero" aria-labelledby="cs-h">
          <Container className="urp-hero-in">
            <div className="urp-hero-copy">
              <p className="urp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="urp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="urp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="urp-tagline">{HERO.tagline}</p>
              <p className="urp-lede">{HERO.lede}</p>
              <div className="urp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="urp-btn urp-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="urp-btn urp-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <figure className="urp-dash">
              <div className="urp-frame urp-frame-dark">
                {pitch && poster ? (
                  <ProductMediaPlayer
                    media={pitch}
                    className="urp-player"
                    fallbackPoster={
                      // eslint-disable-next-line @next/next/no-img-element -- the real Today capture, unmodified
                      <img src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} decoding="async" fetchPriority="high" />
                    }
                  />
                ) : poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- the real Today capture, unmodified
                  <img src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} decoding="async" fetchPriority="high" />
                ) : null}
              </div>
              <figcaption className="urp-small">{HERO.dashCaption}</figcaption>
            </figure>
          </Container>
          <Container className="urp-hero-low">
            <ul className="urp-metrics" aria-label="Urja in numbers">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label} className="urp-metric" data-kind={proof.kind}>
                  <p className="urp-metric-value">{proof.value}</p>
                  <p className="urp-metric-label">{HERO.proofs[index]?.label ?? proof.label}</p>
                  <p className="urp-metric-foot">
                    <EvidenceBadge kind={proof.kind} />
                  </p>
                  {HERO.proofs[index] && "note" in HERO.proofs[index] ? <p className="urp-metric-note">{(HERO.proofs[index] as { note: string }).note}</p> : null}
                </li>
              ))}
              <li className="urp-metric" data-kind="simulated">
                <p className="urp-metric-value">{HERO.fleet.value}</p>
                <p className="urp-metric-label">{HERO.fleet.label}</p>
              </li>
            </ul>
            <div className="urp-hero-art" style={{ "--ar": `${ART.hero.w} / ${ART.hero.h}` } as CSSProperties}>
              <HeroArt />
            </div>
          </Container>
        </section>

        <UrpNav items={NAV} name={project.name} />

        <Container className="urp-body">
          {/* 01 · Why it exists: one continuous road, trip start to trip end */}
          <Sec section={problem} n="01">
            <p className="urp-p">{PROBLEM.body}</p>
            <ol className="urp-road" aria-label={PROBLEM.roadLabel}>
              {PROBLEM.road.map((label, index) => {
                const Icon = ROAD_ICONS[index]!;
                return (
                  <li key={label} className="urp-stop" data-i={index + 1}>
                    <span className="urp-tile" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="urp-stop-label">{label}</span>
                  </li>
                );
              })}
            </ol>
            {problem.quote ? (
              <figure className="urp-quote">
                <blockquote>
                  <p>“{problem.quote.text}”</p>
                </blockquote>
                <figcaption>{PROBLEM.quoteCaption}</figcaption>
              </figure>
            ) : null}
          </Sec>

          {/* 02 · The product: the two real screenshots */}
          <Sec section={product} n="02">
            <p className="urp-p">{PRODUCT.body}</p>
            <div className="urp-shots">
              {shots.map((shot, index) => (
                <figure key={shot.src} className="urp-shot" data-kind={shot.frame}>
                  <div className={`urp-frame urp-frame-dark ${shot.frame === "phone" ? "urp-frame-phone" : ""}`.trim()}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- the real captures, unmodified */}
                    <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                  </div>
                  <figcaption className="urp-small">{PRODUCT.captions[index] ?? shot.caption}</figcaption>
                </figure>
              ))}
            </div>
            <ul className="urp-notes" aria-label={PRODUCT.notesLabel}>
              {PRODUCT.notes.map((note, index) => (
                <li key={note}>
                  <span className="urp-note-n" aria-hidden="true">
                    {index + 1}
                  </span>
                  {note}
                </li>
              ))}
            </ul>
          </Sec>

          {/* 03 · The system: five paper tiles on one folded line */}
          <Sec section={system} n="03">
            <div className="urp-system">
              <ol className="urp-flow" aria-label={SYSTEM.flowLabel}>
                {system.steps.map((step, index) => {
                  const Icon = SYSTEM_ICONS[index] ?? Sparkles;
                  return (
                    <li key={step.label} className="urp-flow-step" data-i={index + 1}>
                      <Icon aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                      <span className="urp-flow-k">{step.label}</span>
                      <span className="urp-flow-v">{step.note}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="urp-rules">
                <h3 className="urp-h3">{SYSTEM.rules}</h3>
                <ul>
                  {SYSTEM.keyRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <p className="urp-small urp-split">{SYSTEM.split}</p>
                <p className="urp-small urp-stack">{SYSTEM.stack}</p>
              </div>
            </div>
          </Sec>

          {/* 04 · Decisions */}
          <Sec section={decisions} n="04">
            <ol className="urp-cards">
              {DECISIONS.map((item, index) => {
                const Icon = DECISION_ICONS[index]!;
                return (
                  <li key={item.title} className="urp-card" data-i={index + 1}>
                    <span className="urp-chosen">Chosen</span>
                    <span className="urp-tile" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <p className="urp-card-tag">{item.tag}</p>
                    <h3 className="urp-h3">{item.title}</h3>
                    <p className="urp-card-p">{item.body}</p>
                  </li>
                );
              })}
            </ol>
          </Sec>

          {/* 05 · Evidence and limits: the failed eval stays visible */}
          <Sec section={outcome} n="05" className="urp-evidence">
            <p className="urp-p">{EVIDENCE.body}</p>
            <div className="urp-evidence-grid">
              <ul className="urp-stats">
                {EVIDENCE.stats.map((stat) => (
                  <li key={stat.label} className="urp-stat" data-tone={stat.tone}>
                    <p className="urp-stat-value">
                      {stat.tone === "fail" ? <TriangleAlert aria-hidden="true" focusable="false" size={20} strokeWidth={1.8} /> : <CircleCheck aria-hidden="true" focusable="false" size={20} strokeWidth={1.8} />}
                      {stat.value}
                    </p>
                    <p className="urp-stat-label">{stat.label}</p>
                  </li>
                ))}
              </ul>
              <div className="urp-gaps">
                <h3 className="urp-h3">{EVIDENCE.gaps}</h3>
                <ul>
                  {EVIDENCE.gapLines.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="urp-types" aria-label={EVIDENCE.categories}>
              {types.map((type) => (
                <span key={type} className="urp-type">
                  {type}
                </span>
              ))}
            </p>
            {rows.length > 0 ? (
              <div className="urp-drawer">
                <EvidenceDrawer rows={rows} name={project.name} />
              </div>
            ) : null}
          </Sec>

          {/* Sources and links */}
          <section id="explore" className="urp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="urp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="urp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="urp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="urp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="urp-tile-icon" />
                      <span className="urp-tile-text">
                        <span className="urp-tile-label">{action.label}</span>
                        <span className="urp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="urp-small urp-meta">{[project.role, project.duration, "Live on a simulated fleet"].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with the TeachSpark artwork on the cream / lifted-navy surface */}
      <NextProject
        project={next}
        art={next.slug === "teachspark" ? TEACHSPARK_NEXT_ART : undefined}
        line={next.slug === "teachspark" ? NEXT_LINE : undefined}
        tone={next.slug === "teachspark" ? "cream" : undefined}
      />
    </>
  );
}
