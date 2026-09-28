import type { PortfolioAccent, PortfolioEntry, Project, VideoMediaEntry } from "@/data/schema";
import type { VideoMedia } from "@/lib/video-providers";

/**
 * The Portfolio product model (TASK-116, spec §21) — the one shape the `/projects` showcase renders,
 * built from `data/projects.ts` (the facts) + `data/portfolio.ts` (the presentation extras). The
 * client showcase receives plain serialisable objects, so no client bundle pulls in zod or the full
 * project records. Type-only schema imports on purpose.
 *
 * Derivations (one fact, one place):
 *   name / description ← project.name / project.tagline
 *   productUrl         ← project.links.live
 *   githubUrl          ← project.links.github, only when `repoPublic` (a private repo is a dead link)
 *   pitchVideo / demoVideo ← entry.pitchVideo / entry.demoVideo (YouTube/Vimeo, TASK-122). A local
 *                        `links.demoVideo` MP4 is NOT used here: the portfolio's videos live on the
 *                        provider (video-embed spec, intro) — the /work case study still plays it.
 *   caseStudyHref      ← `/work/<slug>` (every personal build has a case-study page)
 */
export type MediaMode = "pitch" | "demo";

/** A painted cover (TASK-121): one text-free image used as the carousel cover AND the stage poster. */
export interface CoverArt {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface PortfolioProduct {
  id: string;
  name: string;
  /** Short cover line (spec §15). */
  tagline: string;
  /** The one-sentence proposition (spec §11: 2–4 lines). */
  description: string;
  statusLabel: string;
  /** Tiny status metadata for the info sheet (TASK-121 §5.4) — a shortening of `statusLabel`. */
  meta: string;
  /** The painted cover, when one exists; else the designed CSS cover (`scene` / `lettering`). */
  art?: CoverArt | undefined;
  scene: PortfolioEntry["scene"];
  lettering: PortfolioEntry["lettering"];
  /** Lucide name for the cover plate / CSS scene hero. */
  coverGlyph: string;
  /** Lucide icon name — the cover's symbolic hero glyph. */
  glyph: string;
  code: string;
  accent: PortfolioAccent;
  /** 1-based position in the carousel ("No. 03"). */
  position: number;
  pitchVideo?: VideoMedia | undefined;
  demoVideo?: VideoMedia | undefined;
  productUrl?: string | undefined;
  githubUrl?: string | undefined;
  prdUrl?: string | undefined;
  caseStudyHref: string;
}

/**
 * `resolveArt` maps an entry's `coverArt` manifest id to its served image (the page passes the
 * illustration manifest lookup; kept as a parameter so the client bundle never imports the manifest).
 * An id it cannot resolve throws — a missing painted cover fails the build, never ships blank.
 */
export function buildPortfolioProducts(
  projects: readonly Project[],
  entries: readonly PortfolioEntry[],
  resolveArt?: (id: string) => CoverArt,
): PortfolioProduct[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  return projects
    .filter((project) => project.category === "personal")
    .map((project, index) => {
      const entry = bySlug.get(project.slug);
      if (!entry) throw new Error(`portfolio: personal build "${project.slug}" has no data/portfolio.ts entry`);
      return {
        id: project.slug,
        name: project.name,
        tagline: entry.coverLine,
        description: project.tagline,
        statusLabel: project.statusLabel,
        meta: entry.meta,
        art: entry.coverArt ? resolveArtOrThrow(entry.coverArt, resolveArt) : undefined,
        scene: entry.scene,
        lettering: entry.lettering,
        coverGlyph: entry.coverGlyph,
        glyph: project.icon,
        code: entry.code,
        accent: entry.accent,
        position: index + 1,
        pitchVideo: entry.pitchVideo ? resolveVideoMedia(entry.pitchVideo, project.name, "pitch") : undefined,
        demoVideo: entry.demoVideo ? resolveVideoMedia(entry.demoVideo, project.name, "demo") : undefined,
        productUrl: project.links.live,
        githubUrl: project.links.repoPublic ? project.links.github : undefined,
        prdUrl: entry.prdUrl,
        caseStudyHref: `/work/${project.slug}`,
      };
    });
}

function resolveArtOrThrow(id: string, resolveArt: ((id: string) => CoverArt) | undefined): CoverArt {
  if (!resolveArt) throw new Error(`portfolio: cover art "${id}" needs a resolver`);
  return resolveArt(id);
}

/** The media a product carries for a mode, if any. */
export function mediaFor(product: PortfolioProduct, mode: MediaMode): VideoMedia | undefined {
  return mode === "pitch" ? product.pitchVideo : product.demoVideo;
}

/** A deep-link value resolves to a product id, or null (unknown ids fall back to the default). */
export function parseProductParam(value: string | null | undefined, products: readonly PortfolioProduct[]): string | null {
  if (!value) return null;
  return products.some((product) => product.id === value) ? value : null;
}

/** The canonical deep link for a product (spec §50): `/projects?product=<id>`. */
export function productHref(id: string): string {
  return `/projects?product=${id}`;
}

/** Wrap-around index step for the looping carousel (spec §17). */
export function stepIndex(index: number, delta: number, length: number): number {
  return (((index + delta) % length) + length) % length;
}

/** The default accessible titles (video-embed spec §15): "TeachSpark pitch video", "TeachSpark product demonstration". */
export const DEFAULT_MEDIA_TITLE: Record<MediaMode, (name: string) => string> = {
  pitch: (name) => `${name} pitch video`,
  demo: (name) => `${name} product demonstration`,
};

/** A data entry's pitch/demo as the player's `VideoMedia` — the title defaults per spec §15. */
export function resolveVideoMedia(entry: VideoMediaEntry, productName: string, mode: MediaMode): VideoMedia {
  return {
    provider: entry.provider,
    videoId: entry.videoId,
    title: entry.title ?? DEFAULT_MEDIA_TITLE[mode](productName),
    poster: entry.poster,
  };
}
