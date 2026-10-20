import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Citrus, Cpu, Droplet, FileBadge, FileCode, FileQuestion, FileText, Globe, GitBranch, ListChecks, Milk, PlayCircle, Scale, SearchCheck, ShieldAlert, Users, FlaskConical } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows } from "@/components/case-study/system/case-context";
import { NextProject } from "@/components/case-study/NextProject";
import { papers } from "@/data/credentials";
import { CaseName } from "@/components/case-study/CaseName";
import { PraNav } from "./PraNav";
import { ART, DECISIONS, EVIDENCE, HERO, NAV, PRODUCT, PROBLEM, SECTION, SOURCES, SYSTEM } from "./copy";

const ART_DIR = "/media/case-studies/pratyasa/art";

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
        <span key={id} id={id} className="pra-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`pra-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="pra-num" aria-hidden="true">
        {n}
      </span>
      <div className="pra-sec-in">
        <p className="pra-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="pra-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const PROBLEM_ICONS = [FileBadge, Cpu, BookOpen, FileQuestion, Globe] as const;
const SYSTEM_ICONS = [FileText, ListChecks, SearchCheck, FileCode, Globe] as const;
const DECISION_ICONS = [Users, Scale, ShieldAlert] as const;
const SAMPLE_ICONS = [Droplet, Milk, Citrus] as const;

function Fact({ value, label, kind, note }: { value: string; label: string; kind: CaseProof["kind"]; note?: string | undefined }) {
  return (
    <div className="pra-metric" data-kind={kind}>
      <p className="pra-metric-value">{value}</p>
      <p className="pra-metric-label">{label}</p>
      <p className="pra-metric-foot">
        <EvidenceBadge kind={kind} />
      </p>
      {note ? <p className="pra-metric-note">{note}</p> : null}
    </div>
  );
}

export interface PratyasaViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Pratyasa's origami paper-craft case study (TASK-280; Tushar's brief pratyasa-full-page-redesign.md + mockup). A Pratyasa-only
 * layout, chosen by `study.layout === "pratyasa"` in app/work/[slug]/page.tsx (same architecture as Nuptis, TASK-278). Facts come
 * from the record; the real photos and screenshots are the record's own files (never redrawn). The hero diorama is decorative,
 * painted on each theme's exact page colour, with the real device photo framed over its empty paper stage.
 */
export function PratyasaView({ project, study, portfolio, next }: PratyasaViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const paper = papers.find((p) => p.id === "langmuir-2025");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const heroShot = heroMedia && "src" in heroMedia ? heroMedia : undefined;
  const ownerKind = study.hero.proofs[0]?.kind ?? "structural";

  return (
    <>
      <article id={rootId} className="pra" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ── */}
        <section id="pra-overview" className="pra-hero" aria-labelledby="cs-h">
          <Container className="pra-hero-in">
            <div className="pra-hero-copy">
              <p className="pra-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="pra-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="pra-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="pra-tagline">{HERO.tagline}</p>
              <p className="pra-lede">{HERO.lede}</p>
              <div className="pra-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="pra-btn pra-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="pra-btn pra-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="pra-hero-side">
              <figure className="pra-stage-fig">
                <div className="pra-stage" style={{ "--ar-l": `${ART.hero.light.w} / ${ART.hero.light.h}`, "--ar-d": `${ART.hero.dark.w} / ${ART.hero.dark.h}` } as CSSProperties}>
                  <HeroArt />
                  {heroShot ? (
                    <div className="pra-photo">
                      <div className="pra-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element -- the real prototype photo, unmodified */}
                        <img src={heroShot.src} alt={heroShot.alt} width={heroShot.width} height={heroShot.height} loading="eager" decoding="async" />
                      </div>
                    </div>
                  ) : null}
                </div>
                <figcaption className="pra-small pra-stage-cap">{HERO.photoCaption}</figcaption>
              </figure>
            </div>
          </Container>
          <Container className="pra-facts-wrap">
            <ul className="pra-metrics" aria-label="Pratyasa at a glance">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label}>
                  <Fact value={proof.value} label={HERO.proofLabels[index] ?? proof.label} kind={proof.kind} />
                </li>
              ))}
              <li>
                <Fact value={HERO.owner.value} label={HERO.owner.label} kind={ownerKind} />
              </li>
            </ul>
            <p className="pra-status">
              <ShieldAlert aria-hidden="true" focusable="false" size={18} strokeWidth={1.8} />
              {HERO.status}
            </p>
          </Container>
        </section>

        <PraNav items={NAV} name={project.name} />

        <Container className="pra-body">
          {/* 01 · The problem: three artifacts, one missing record */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="pra-p">{PROBLEM.lede}</p>
              <ol className="pra-steps" aria-label="What existed, and what was missing">
                {PROBLEM.steps.map((label, index) => {
                  const Icon = PROBLEM_ICONS[index]!;
                  return (
                    <li key={label} className="pra-step" data-i={index + 1} data-missing={index === 3 ? "" : undefined}>
                      <span className="pra-tile" aria-hidden="true">
                        <Icon size={24} strokeWidth={1.6} />
                      </span>
                      <span className="pra-step-label">{label}</span>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 02 · The page: the record's real screenshots and photo, large */}
          {product ? (
            <Sec section={product} n="02">
              <p className="pra-p">{PRODUCT.lede}</p>
              <div className="pra-shots">
                {product.shots.map((shot, index) => (
                  <figure key={shot.src} className="pra-shot" data-i={index + 1}>
                    <div className="pra-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the real screenshot / photo, unmodified, sized */}
                      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="pra-cap">
                      <span className="pra-cap-t">{PRODUCT.shots[index]?.title ?? shot.caption}</span>
                      <span className="pra-cap-d">{PRODUCT.shots[index]?.caption ?? ""}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="pra-contrib">
                <p className="pra-contrib-label">{PRODUCT.contributionLabel}</p>
                <ul className="pra-chips">
                  {PRODUCT.contribution.map((item) => (
                    <li key={item} className="pra-chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Sec>
          ) : null}

          {/* 03 · Decisions */}
          {decisions ? (
            <Sec section={decisions} n="03">
              <ol className="pra-cards pra-decisions">
                {DECISIONS.map((item, index) => {
                  const Icon = DECISION_ICONS[index]!;
                  return (
                    <li key={item.title} className="pra-card" data-i={index + 1}>
                      <span className="pra-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h3 className="pra-h3">{item.title}</h3>
                      <dl className="pra-dl">
                        <div>
                          <dt>Chose</dt>
                          <dd>{item.chose}</dd>
                        </div>
                        <div>
                          <dt>Why</dt>
                          <dd>{item.because}</dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 04 · System */}
          {system ? (
            <Sec section={system} n="04">
              <p className="pra-p">{SYSTEM.lede}</p>
              <div className="pra-system">
                <ol className="pra-flow" aria-label="How a claim reaches the live page">
                  {system.steps.map((step, index) => {
                    const Icon = SYSTEM_ICONS[index] ?? FileText;
                    const copy = SYSTEM.steps[index];
                    return (
                      <li key={step.label} className="pra-flow-step" data-i={index + 1}>
                        <Icon aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                        <span className="pra-flow-k">{copy?.label ?? step.label}</span>
                        <span className="pra-flow-v">{copy?.note ?? step.note}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="pra-rules">
                  <h3 className="pra-h3">{SYSTEM.rules}</h3>
                  <ul>
                    {system.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                  <p className="pra-small">{SYSTEM.rulesNote}</p>
                </div>
              </div>
            </Sec>
          ) : null}

          {/* 05 · Evidence */}
          {outcome ? (
            <Sec section={outcome} n="05" className="pra-evidence">
              <p className="pra-p">{EVIDENCE.lede}</p>
              <div className="pra-evidence-grid">
                <div>
                  <ul className="pra-samples">
                    {EVIDENCE.samples.map((sample, index) => {
                      const Icon = SAMPLE_ICONS[index] ?? FlaskConical;
                      return (
                        <li key={sample.label} className="pra-sample" data-i={index + 1}>
                          <span className="pra-tile" aria-hidden="true">
                            <Icon size={26} strokeWidth={1.6} />
                          </span>
                          <span className="pra-sample-k">{sample.label}</span>
                          <span className="pra-sample-v">{sample.note}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="pra-small pra-sample-note">{EVIDENCE.illustrationNote}</p>
                </div>
                {outcome.gaps.length > 0 ? (
                  <div className="pra-gaps">
                    <h3 className="pra-h3">{EVIDENCE.gaps}</h3>
                    <ul>
                      {outcome.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                      {/* TASK-299: the paper the device's results come from, read from the credentials record */}
                      {paper?.doiHref ? (
                        <li className="pra-paper">
                          <span className="pra-paper-head">
                            <span className="pra-paper-badge" aria-hidden="true">
                              <FileText size={16} strokeWidth={1.8} />
                            </span>
                            <span className="pra-paper-cite">
                              {paper.journal} {paper.year}
                            </span>
                          </span>
                          <span className="pra-paper-title">{paper.title}</span>
                          <a href={paper.doiHref} target="_blank" rel="noopener noreferrer" className="pra-paper-doi focus-ring">
                            DOI {paper.doi}
                            <ArrowUpRight aria-hidden="true" focusable="false" size={14} strokeWidth={2} />
                            <span className="sr-only"> {NEW_TAB_HINT}</span>
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Sec>
          ) : null}

          {/* Sources and links */}
          <section id="explore" className="pra-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="pra-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="pra-h2">
              {SOURCES.headline}
            </h2>
            <p className="pra-p">{SOURCES.lede}</p>
            <ul className="pra-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="pra-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="pra-tile-icon" />
                      <span className="pra-tile-text">
                        <span className="pra-tile-label">{action.label}</span>
                        <span className="pra-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="pra-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="pra-small pra-meta">The Pratyasa page: a solo build, {project.duration}. The invention it documents is a five-inventor patent.</p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with the Campfire Board artwork (TASK-280) */}
      <NextProject project={next} />
    </>
  );
}
