import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Boxes, CircleCheck, FileJson, FolderClosed, GitFork, Globe, GitBranch, LayoutDashboard, LayoutPanelTop, Layers, Info, PlayCircle, Terminal } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows } from "@/components/case-study/system/case-context";
import { NextProject } from "@/components/case-study/NextProject";
import { CfpNav } from "./CfpNav";
import { ART, DECISIONS, EVIDENCE, HERO, NAV, PRODUCT, PROBLEM, SECTION, NEXT_LINE, SLAG_NEXT_ART, SOURCES, SYSTEM } from "./copy";

const ART_DIR = "/media/case-studies/campfire-board/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
type Shot = { src: string; alt: string; width: number; height: number };

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
        <span key={id} id={id} className="cfp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`cfp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="cfp-num" aria-hidden="true">
        {n}
      </span>
      <div className="cfp-sec-in">
        <p className="cfp-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="cfp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const SYSTEM_ICONS = [FileJson, FolderClosed, Terminal, LayoutPanelTop, Layers] as const;
const DECISION_ICONS = [GitFork, Terminal] as const;
const tidy = (value: string) => value.replace(/\s*\/\s*/g, "/");

function Metric({ value, label, note, proof }: { value: string; label: string; note: string; proof?: CaseProof | undefined }) {
  return (
    <div className="cfp-metric" data-kind={proof?.kind ?? "structural"}>
      <p className="cfp-metric-value">{tidy(value)}</p>
      <p className="cfp-metric-label">{label}</p>
      <p className="cfp-metric-note">{note}</p>
      {proof ? (
        <p className="cfp-metric-foot">
          <EvidenceBadge kind={proof.kind} />
        </p>
      ) : null}
    </div>
  );
}

export interface CampfireViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Campfire Board's origami paper-craft case study (TASK-281; Tushar's brief cf.md + mockups). A Campfire-only layout,
 * chosen by `study.layout === "campfire"` in app/work/[slug]/page.tsx (same architecture as Nuptis, TASK-278). Facts come
 * from the record; the real product screenshots are the record's own files (never redrawn). The hero diorama and the next
 * band's Slag City arcade are decorative, painted on each theme's exact page / band colour. The flow tiles are CSS and icons.
 */
export function CampfireView({ project, study, portfolio, next }: CampfireViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const kanban: Shot | undefined = "poster" in heroMedia ? heroMedia.poster : heroMedia;
  const gantt: Shot | undefined = product?.poster;
  const workflow: Shot | undefined = product?.shots[0];
  const pilot = outcome?.proofs[0];
  const metrics = [
    { proof: study.hero.proofs[0], ...HERO.metrics[0] },
    { proof: study.hero.proofs[1], ...HERO.metrics[1] },
    { proof: pilot, ...HERO.metrics[2] },
  ];
  const gallery = [gantt, kanban, workflow];

  return (
    <>
      <article id={rootId} className="cfp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ── */}
        <section id="cfp-overview" className="cfp-hero" aria-labelledby="cs-h">
          <Container className="cfp-hero-in">
            <div className="cfp-hero-copy">
              <p className="cfp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="cfp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="cfp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                {project.name}
              </h1>
              <p className="cfp-tagline">{HERO.tagline}</p>
              <p className="cfp-lede">{HERO.lede}</p>
              <div className="cfp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="cfp-btn cfp-btn-primary focus-ring" data-action="live">
                    {live.label}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="cfp-btn cfp-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="cfp-hero-art" style={{ "--ar-l": `${ART.hero.light.w} / ${ART.hero.light.h}`, "--ar-d": `${ART.hero.dark.w} / ${ART.hero.dark.h}` } as CSSProperties}>
              <HeroArt />
            </div>
          </Container>
          <Container className="cfp-hero-low">
            <ul className="cfp-metrics" aria-label="Campfire Board in numbers">
              {metrics.map((m) =>
                m.proof ? (
                  <li key={m.label}>
                    <Metric value={m.proof.value} label={m.label} note={m.note} proof={m.proof.kind === "structural" ? undefined : m.proof} />
                  </li>
                ) : null,
              )}
            </ul>
            <ul className="cfp-chips" aria-label="Capabilities">
              {HERO.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </Container>
          {kanban ? (
            <Container className="cfp-dash-wrap">
              <figure className="cfp-dash">
                <div className="cfp-frame cfp-frame-wide">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the real Kanban screenshot, unmodified */}
                  <img src={kanban.src} alt={kanban.alt} width={kanban.width} height={kanban.height} loading="eager" decoding="async" />
                </div>
                <figcaption className="cfp-small">{HERO.shotCaption}</figcaption>
              </figure>
            </Container>
          ) : null}
        </section>

        <CfpNav items={NAV} name={project.name} />

        <Container className="cfp-body">
          {/* 01 · The problem: separate folders feeding one shared view, drawn in paper tiles */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="cfp-p">{PROBLEM.lede}</p>
              <div className="cfp-fan" role="group" aria-label="Separate project folders feeding one shared view">
                <ul className="cfp-fan-folders">
                  {PROBLEM.folders.map((label, index) => (
                    <li key={index} className="cfp-fan-folder" data-i={index + 1}>
                      <FolderClosed aria-hidden="true" focusable="false" size={26} strokeWidth={1.5} />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <span className="cfp-fan-arrow" aria-hidden="true" />
                <div className="cfp-fan-hub">
                  <LayoutDashboard aria-hidden="true" focusable="false" size={30} strokeWidth={1.5} />
                  <span>{PROBLEM.hub}</span>
                </div>
              </div>
              <ul className="cfp-notes" aria-label="What went wrong">
                {PROBLEM.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Sec>
          ) : null}

          {/* 02 · The product: the record's real screenshots, large */}
          {product ? (
            <Sec section={product} n="02">
              <p className="cfp-p">{PRODUCT.lede}</p>
              <div className="cfp-shots">
                {gallery.map((shot, index) =>
                  shot ? (
                    <figure key={shot.src} className="cfp-shot" data-i={index + 1}>
                      <div className="cfp-frame">
                        <span className="cfp-tab" aria-hidden="true">
                          {PRODUCT.tabs[index]!.tab}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption className="cfp-cap">
                        <span className="cfp-cap-t">{PRODUCT.tabs[index]!.tab}</span>
                        <span className="cfp-cap-d">{PRODUCT.tabs[index]!.caption}</span>
                      </figcaption>
                    </figure>
                  ) : null,
                )}
              </div>
            </Sec>
          ) : null}

          {/* 03 · Decisions */}
          {decisions ? (
            <Sec section={decisions} n="03">
              <ol className="cfp-cards cfp-decisions">
                {DECISIONS.map((item, index) => {
                  const Icon = DECISION_ICONS[index]!;
                  return (
                    <li key={item.title} className="cfp-card" data-i={index + 1}>
                      <span className="cfp-chosen">
                        <span aria-hidden="true">✓</span> Chosen
                      </span>
                      <span className="cfp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h3 className="cfp-h3">{item.title}</h3>
                      <p className="cfp-card-p">{item.copy}</p>
                      {item.note ? <p className="cfp-card-note">{item.note}</p> : null}
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 04 · System: five paper tiles */}
          {system ? (
            <Sec section={system} n="04">
              <p className="cfp-p">{SYSTEM.lede}</p>
              <ol className="cfp-flow" aria-label="How Campfire Board reads your projects">
                {SYSTEM.steps.map((step, index) => {
                  const Icon = SYSTEM_ICONS[index] ?? Boxes;
                  return (
                    <li key={step.label} className="cfp-flow-step" data-i={index + 1}>
                      <span className="cfp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <span className="cfp-flow-k">{step.label}</span>
                      <span className="cfp-flow-v">{step.note}</span>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 05 · Evidence: the pilot checks and the caveat, plainly */}
          {outcome ? (
            <Sec section={outcome} n="05" className="cfp-evidence">
              <p className="cfp-p">{EVIDENCE.lede}</p>
              <div className="cfp-evidence-grid">
                <ul className="cfp-checks">
                  {EVIDENCE.checks.map((check) => (
                    <li key={check.title} className="cfp-check">
                      <CircleCheck aria-hidden="true" focusable="false" size={22} strokeWidth={1.8} className="cfp-check-icon" />
                      <h3 className="cfp-h3">{check.title}</h3>
                      <p className="cfp-card-p">{check.copy}</p>
                    </li>
                  ))}
                </ul>
                <aside className="cfp-caveat" aria-label="Limitation">
                  <Info aria-hidden="true" focusable="false" size={22} strokeWidth={1.8} className="cfp-caveat-icon" />
                  <div>
                    <p className="cfp-caveat-text">{EVIDENCE.caveat}</p>
                    {pilot ? (
                      <p className="cfp-metric-foot">
                        <EvidenceBadge kind={pilot.kind} />
                      </p>
                    ) : null}
                    {outcome.gaps.length > 0 ? (
                      <ul className="cfp-gaps">
                        {outcome.gaps.map((gap) => (
                          <li key={gap}>{gap}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </aside>
              </div>
            </Sec>
          ) : null}

          {/* Sources and links */}
          <section id="explore" className="cfp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="cfp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="cfp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="cfp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="cfp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="cfp-tile-icon" />
                      <span className="cfp-tile-text">
                        <span className="cfp-tile-label">{action.label}</span>
                        <span className="cfp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="cfp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="cfp-small cfp-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with the Slag City arcade artwork (TASK-281) */}
      <NextProject project={next} art={next.slug === "slag-city" ? SLAG_NEXT_ART : undefined} line={next.slug === "slag-city" ? NEXT_LINE : undefined} />
    </>
  );
}
