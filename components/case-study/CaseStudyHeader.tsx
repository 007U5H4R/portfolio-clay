import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/schema";
import { Annotation } from "@/components/paper/Annotation";
import { Sheet } from "@/components/paper/Sheet";
import { Tape } from "@/components/paper/Tape";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { DemoVideo } from "@/components/projects/DemoVideo";
import { Container } from "@/components/layout/Container";

export interface CaseStudyHeaderProps {
  /** The full schema-validated project — the header reads name, lead, meta and hero media. */
  project: Project;
}

/**
 * Case-study header on paper (TKT-81, Design.md §7.3 "Header", §3.3 row `/work/[slug]` header).
 *
 * The page scene already opens the route above this section as a full-bleed `SceneOpener`
 * (TKT-95, EXE-18 / Dev-24), which supersedes §7.3's taped `scene-casestudy` photo. So by default
 * this is a single copy column: crumb "Work / Case study", h1, lead ≤ 44ch, `Role:` / `Duration:`
 * meta, the `StatusBadge` ivory pill, and the kraft **"Hero media coming"** tag (`data-paper="tag"`,
 * navy Inter — Dev-13) with its sub-line annotation. When a project gains real media (`hero.image`
 * or `links.demoVideo`) the header becomes the `56fr 44fr` grid with that media in a taped photo
 * frame on the right (`DemoVideo` keeps its four states inside the frame) and the tag disappears.
 *
 * Decorations (EVAL-018): the media-tag sub-line annotation only → 1 (§3.3 planned 2; the photo
 * caption annotation left with the photo, Dev-24). The h1 carries the `project-{slug}`
 * view-transition name so the /work card still morphs into this page (EXE-5).
 */
export function CaseStudyHeader({ project }: CaseStudyHeaderProps) {
  const { slug, name, tagline, role, duration, status, statusLabel, hero, links } = project;
  const hasMedia = Boolean(hero.image ?? links.demoVideo);

  return (
    <section className="cs-head" aria-labelledby="cs-h" data-has-media={hasMedia ? "" : undefined}>
      <Container className="cs-head-grid">
        <div className="cs-copy">
          <p className="cs-crumb">
            {/* Running-text crumb link: WCAG 2.5.8 inline exception, like ExternalLink. */}
            <Link href="/work" className="focus-ring" data-inline-link="">
              Work
            </Link>
            <span aria-hidden="true">/</span>
            <span>Case study</span>
          </p>
          <h1 id="cs-h" className="cs-h1" style={{ viewTransitionName: `project-${slug}` }}>
            {name}
          </h1>
          <p className="cs-lead">{tagline}</p>
          <div className="cs-meta">
            <span>
              Role: <b>{role}</b>
            </span>
            <span>
              Duration: <b>{duration}</b>
            </span>
            <StatusBadge status={status} statusLabel={statusLabel} onPaper />
            {hasMedia ? null : (
              // Screen state "empty" for hero media (§7.9): an honest status tag, never a broken frame.
              <div className="cs-media-tag">
                <Sheet variant="tag" rotate={-2}>
                  <span data-micro-label="">Hero media coming</span>
                </Sheet>
                <Annotation size="sm" rotate={-2}>
                  the illustration stands in, for now
                </Annotation>
              </div>
            )}
          </div>
        </div>

        {hasMedia ? (
          <Sheet variant="photo" rotate={-1.6} className="cs-photo">
            <Tape side="l" />
            <Tape side="r" />
            <div className="cs-photo-media">
              {hero.image ? (
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : links.demoVideo ? (
                <DemoVideo
                  video={links.demoVideo}
                  posterFallback={hero.image}
                  liveUrl={links.live}
                  name={name}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              ) : null}
            </div>
          </Sheet>
        ) : null}
      </Container>
    </section>
  );
}
