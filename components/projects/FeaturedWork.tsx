import type { Metric, Project } from "@/data/schema";
import { projects } from "@/data/projects";
import { Container } from "@/components/layout/Container";
import { Annotation, Sketch, Sticky, TornEdge, type TapeSide } from "@/components/paper";
import { ProjectCard } from "@/components/projects/ProjectCard";

/**
 * Which `project.metrics` rows each featured card shows, by label (Design.md §7.1): TeachSpark all
 * three, RailCite "5,760 documents indexed · 0 invented citations", Nuptis → Velora the one row the
 * approved mockup keeps — its "10/10 unit tests" is a build-quality signal, not a proof metric, and
 * is dropped (Dev-01). Rows are looked up in the data, never retyped; a missing label throws at
 * build time rather than silently rendering an empty metrics row.
 */
export const FEATURED_METRICS: Readonly<Record<string, readonly string[]>> = {
  teachspark: ["Teachers joined", "Activated", "Median time saved"],
  railcite: ["Documents indexed", "Invented citations"],
  velora: ["Products in nine days"],
};

/** Per-card paper placement (mockup `.work-card.large` −0.6°, `.tilt` +0.7°, tapes l / c / r). */
const PLACEMENT: Readonly<Record<string, { tape: TapeSide; rotate: number }>> = {
  teachspark: { tape: "l", rotate: -0.6 },
  railcite: { tape: "c", rotate: 0.7 },
  velora: { tape: "r", rotate: 0 },
};

export function featuredMetrics(project: Project): Metric[] {
  return (FEATURED_METRICS[project.slug] ?? []).map((label) => {
    const metric = project.metrics.find((m) => m.label === label);
    if (!metric) throw new Error(`FeaturedWork: ${project.slug} has no metric labelled "${label}"`);
    return metric;
  });
}

/** The featured trio, rank 1/2/3 (the content gate guarantees exactly three, one `large`). */
export const FEATURED: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

/** RailCite's quote-card line, read from its `insight` artifact (D7 — never retyped). */
function railciteQuote(): { quote: string; name: string } {
  const railcite = projects.find((p) => p.slug === "railcite");
  const artifact = railcite?.chapters
    .flatMap((chapter) => chapter.artifacts)
    .find((a) => a.id === "rc-a-trust");
  if (!railcite || !artifact || artifact.type !== "insight") {
    throw new Error("FeaturedWork: RailCite insight rc-a-trust is missing");
  }
  return { quote: artifact.quote, name: railcite.name };
}

/**
 * Featured work (home, Design.md §7.1; TKT-75 S75.02). `section#work-featured` on `paper-2` under a
 * torn edge: head grid (eyebrow + h2 + lead · the RailCite quote-card annotation with its dashed
 * arrow), then the `1.35fr 1fr` grid — TeachSpark large (row-span 2, flow sketch + sticky), RailCite,
 * Nuptis → Velora. Decorations = 4 (torn · annotation · flow sketch · sticky — §3.3, Dev-03); the
 * tapes are fasteners (not counted). Server component.
 */
export function FeaturedWork() {
  const { quote, name } = railciteQuote();

  return (
    <section id="work-featured" aria-labelledby="work-featured-heading" className="featured">
      <TornEdge fill="paper-2" />
      <div className="featured-body">
        <Container className="featured-wrap">
          <div className="featured-head">
            <div className="featured-head-copy">
              <p className="featured-eyebrow">Featured work</p>
              <h2 id="work-featured-heading" className="featured-h2">
                Real problems.
                <br />
                Real products.
              </h2>
              <p className="featured-lead">
                Three products I designed and built end-to-end — from the problem to the shipped thing.
              </p>
            </div>
            <Annotation arrow="dashed" rotate={-1} size="lg" className="featured-quote">
              “{quote}”<small>— {name}</small>
            </Annotation>
          </div>

          <div className="work-grid">
            {FEATURED.map((project) => {
              const large = project.gridSize === "large";
              const place = PLACEMENT[project.slug] ?? { tape: "c", rotate: 0 };
              return (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  metrics={featuredMetrics(project)}
                  size={large ? "large" : "medium"}
                  tape={place.tape}
                  rotate={place.rotate}
                  aside={
                    large ? (
                      <Sticky rotate={-5} className="work-card-sticky">
                        “Capability, not dependency.”
                      </Sticky>
                    ) : undefined
                  }
                >
                  {large ? <Sketch variant="flow" className="work-card-sketch" /> : null}
                </ProjectCard>
              );
            })}
          </div>
        </Container>
      </div>
    </section>
  );
}
