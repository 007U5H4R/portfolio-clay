import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenCheck, Boxes, Cloud, Compass, Cpu, Database, FileSpreadsheet, Gauge, GitBranch, Globe, HardDrive, Layers, MessagesSquare, PlayCircle, ShieldCheck, ShieldOff, Sparkles, TriangleAlert, UserX } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { BadgeLegend, EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, legendKinds } from "@/components/case-study/system/case-context";
import { NextProject, BHAKTI_NEXT_ART, BHAKTI_NEXT_LINE } from "@/components/case-study/NextProject";
import { CaseName } from "@/components/case-study/CaseName";
import { NupNav } from "./NupNav";
import { ART, DECISIONS, EVIDENCE, HERO, INSIGHT, LEARNINGS, NAV, PRODUCT, PROBLEM, SECTION, SOURCES, SYSTEM } from "./copy";

const ART_DIR = "/media/case-studies/nuptis/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** The hero diorama: two renditions painted on each theme's own page colour; the inactive one is display:none. */
function HeroArt() {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static pre-sized WebP from public/, one per theme
        <img
          key={theme}
          src={`${ART_DIR}/hero-${theme}.webp`}
          data-theme-art={theme}
          alt=""
          aria-hidden="true"
          width={ART.hero[theme].w}
          height={ART.hero[theme].h}
          loading="eager"
          decoding="async"
          {...(theme === "light" ? { fetchPriority: "high" as const } : {})}
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="nup-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`nup-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="nup-num" aria-hidden="true">
        {n}
      </span>
      <div className="nup-sec-in">
        <p className="nup-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="nup-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const PROBLEM_ICONS = [FileSpreadsheet, MessagesSquare, UserX, ShieldOff, TriangleAlert] as const;
const SYSTEM_ICONS = [Layers, Cpu, HardDrive, Cloud, Database] as const;
const DECISION_ICONS = [ShieldCheck, Gauge, Boxes] as const;
const LEARNING_ICONS = [BookOpenCheck, Compass, Sparkles] as const;

function Proof({ proof, label, className, note }: { proof: CaseProof; label: string; className: string; note?: string | undefined }) {
  return (
    <div className={className} data-kind={proof.kind}>
      <p className={`${className}-value`}>{proof.value}</p>
      <p className={`${className}-label`}>{label}</p>
      <p className="nup-metric-foot">
        <EvidenceBadge kind={proof.kind} />
      </p>
      {note ? <p className="nup-metric-note">{note}</p> : null}
    </div>
  );
}

export interface NuptisViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Nuptis's origami paper-craft case study (TASK-278; Tushar's brief Nuptis-full.md + mockup). A Nuptis-only layout, chosen by
 * `study.layout === "nuptis"` in app/work/[slug]/page.tsx (same architecture as Velora, TASK-273). Facts come from the record;
 * the real product screenshots are the record's own shots (never redrawn). The hero diorama is decorative, painted on each
 * theme's exact page colour. The next-project band is the shared NextProject with the Bhakti Vilas artwork (TASK-275).
 */
export function NuptisView({ project, study, portfolio, next }: NuptisViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const research = sec("research");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const learnings = sec("learnings");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const kinds = legendKinds(study);
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const heroShot = heroMedia && "src" in heroMedia ? heroMedia : undefined;
  const quote = research?.quotes[0];

  return (
    <>
      <article id={rootId} className="nup" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ── */}
        <section id="nup-overview" className="nup-hero" aria-labelledby="cs-h">
          <Container className="nup-hero-in">
            <div className="nup-hero-copy">
              <p className="nup-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="nup-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="nup-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="nup-tagline">{HERO.tagline}</p>
              <p className="nup-lede">{HERO.lede}</p>
              <div className="nup-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="nup-btn nup-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="nup-btn nup-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="nup-hero-side">
              <div className="nup-hero-art" style={{ "--ar-l": `${ART.hero.light.w} / ${ART.hero.light.h}`, "--ar-d": `${ART.hero.dark.w} / ${ART.hero.dark.h}` } as CSSProperties}>
                <HeroArt />
              </div>
              <ul className="nup-metrics" aria-label="Nuptis in numbers">
                {study.hero.proofs.map((proof, index) => (
                  <li key={proof.label}>
                    <Proof proof={proof} label={HERO.proofLabels[index] ?? proof.label} note={HERO.proofNotes[index]} className="nup-metric" />
                  </li>
                ))}
              </ul>
            </div>
          </Container>
          {heroShot ? (
            <Container className="nup-dash-wrap">
              <figure className="nup-dash">
                <div className="nup-frame nup-frame-wide">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the real Nuptis dashboard screenshot, unmodified */}
                  <img src={heroShot.src} alt={heroShot.alt} width={heroShot.width} height={heroShot.height} loading="eager" decoding="async" />
                </div>
                <figcaption className="nup-small">Vendor roster dashboard · mock agency data</figcaption>
              </figure>
              <BadgeLegend kinds={kinds} />
            </Container>
          ) : null}
        </section>

        <NupNav items={NAV} name={project.name} />

        <Container className="nup-body">
          {/* 01 · The problem */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="nup-p">{PROBLEM.lede}</p>
              <ol className="nup-steps" aria-label="How a no-show plays out today">
                {PROBLEM.steps.map((label, index) => {
                  const Icon = PROBLEM_ICONS[index]!;
                  return (
                    <li key={label} className="nup-step" data-i={index + 1}>
                      <span className="nup-tile" aria-hidden="true">
                        <Icon size={24} strokeWidth={1.6} />
                      </span>
                      <span className="nup-step-label">{label}</span>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 02 · The insight */}
          {research ? (
            <Sec section={research} n="02">
              <p className="nup-p">{INSIGHT.lede}</p>
              <div className="nup-insight">
                {quote ? (
                  <figure className="nup-quote">
                    <blockquote>
                      <p>“{quote.text}”</p>
                    </blockquote>
                    <figcaption>— {quote.attribution}</figcaption>
                  </figure>
                ) : null}
                <aside className="nup-star" aria-label="North Star">
                  <Compass aria-hidden="true" focusable="false" size={30} strokeWidth={1.5} className="nup-star-icon" />
                  <div>
                    <p className="nup-star-tag">{INSIGHT.northStarTag}</p>
                    <p className="nup-star-text">{INSIGHT.northStar}</p>
                  </div>
                </aside>
              </div>
            </Sec>
          ) : null}

          {/* 03 · The product: the record's real screenshots, large */}
          {product ? (
            <Sec section={product} n="03">
              <div className="nup-shots">
                {product.shots.map((shot, index) => (
                  <figure key={shot.src} className="nup-shot" data-i={index + 1}>
                    <div className="nup-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="nup-cap">
                      <span className="nup-cap-n" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="nup-cap-t">{PRODUCT.shots[index]?.title ?? shot.caption}</span>
                      <span className="nup-cap-d">{PRODUCT.shots[index]?.caption ?? ""}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Sec>
          ) : null}

          {/* 04 · Decisions */}
          {decisions ? (
            <Sec section={decisions} n="04">
              <ol className="nup-cards nup-decisions">
                {DECISIONS.map((item, index) => {
                  const Icon = DECISION_ICONS[index]!;
                  return (
                    <li key={item.title} className="nup-card" data-i={index + 1}>
                      <span className="nup-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h3 className="nup-h3">{item.title}</h3>
                      <dl className="nup-dl">
                        <div>
                          <dt>Could have</dt>
                          <dd>{item.could}</dd>
                        </div>
                        <div>
                          <dt>Chose</dt>
                          <dd>{item.chose}</dd>
                        </div>
                        <div>
                          <dt>Because</dt>
                          <dd>{item.because}</dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 05 · System */}
          {system ? (
            <Sec section={system} n="05">
              <div className="nup-system">
                <ol className="nup-flow" aria-label="Nuptis’s local-first data path">
                  {system.steps.map((step, index) => {
                    const Icon = SYSTEM_ICONS[index] ?? Boxes;
                    const copy = SYSTEM.steps[index];
                    return (
                      <li key={step.label} className="nup-flow-step" data-i={index + 1}>
                        <Icon aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                        <span className="nup-flow-k">{copy?.label ?? step.label}</span>
                        <span className="nup-flow-v">{copy?.note ?? step.note}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="nup-rules">
                  <h3 className="nup-h3">{SYSTEM.rules}</h3>
                  <ul>
                    {system.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Sec>
          ) : null}

          {/* 06 · Evidence */}
          {outcome ? (
            <Sec section={outcome} n="06" className="nup-evidence">
              <div className="nup-evidence-grid">
                <ul className="nup-stats">
                  {outcome.proofs.map((proof, index) => (
                    <li key={proof.label}>
                      <Proof proof={proof} label={EVIDENCE.proofLabels[index] ?? proof.label} className="nup-stat" note={proof.note} />
                    </li>
                  ))}
                </ul>
                {outcome.gaps.length > 0 ? (
                  <div className="nup-gaps">
                    <h3 className="nup-h3">{EVIDENCE.gaps}</h3>
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

          {/* 07 · Learnings */}
          {learnings ? (
            <Sec section={learnings} n="07">
              <ol className="nup-cards">
                {LEARNINGS.map((item, index) => {
                  const Icon = LEARNING_ICONS[index]!;
                  return (
                    <li key={item.title} className="nup-card" data-i={index + 1}>
                      <span className="nup-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h3 className="nup-h3">{item.title}</h3>
                      <p className="nup-card-p">{item.body}</p>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* Sources and links */}
          <section id="explore" className="nup-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="nup-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="nup-h2">
              {SOURCES.headline}
            </h2>
            <ul className="nup-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="nup-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="nup-tile-icon" />
                      <span className="nup-tile-text">
                        <span className="nup-tile-label">{action.label}</span>
                        <span className="nup-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="nup-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="nup-small nup-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with the Bhakti Vilas artwork (TASK-275) */}
      <NextProject
        project={next}
        art={next.slug === "bhakti-vilas" ? BHAKTI_NEXT_ART : undefined}
        line={next.slug === "bhakti-vilas" ? BHAKTI_NEXT_LINE : undefined}
        tone={next.slug === "bhakti-vilas" ? "cream" : undefined}
      />
    </>
  );
}
