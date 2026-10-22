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

/** A product cover (TASK-121/127): one text-free image used as the carousel cover AND the stage poster. */
export interface CoverArt {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** TASK-250 (Tushar 2026-10-18): a product's own logo — one file per theme (`dark` = light ink for the dark theme). */
export interface ProductLogo {
  dark: string;
  light: string;
  width: number;
  height: number;
}

/** The served logo file for a product slug and theme (files live in public/media/logos/products/). */
export function productLogoSrc(slug: string, theme: "dark" | "light"): string {
  return `/media/logos/products/logo-${slug}-${theme}.webp`;
}

export interface PortfolioProduct {
  id: string;
  name: string;
  /** Short cover line (spec §15). */
  tagline: string;
  /** The one-sentence proposition (spec §11: 2–4 lines). */
  description: string;
  /** TASK-303 r2: the desktop paper card's shorter wording of `description`, when the full one would be cut off. */
  cardLine?: string | undefined;
  /** TASK-354: the three-line wording of `description`, shown instead of `cardLine` where the card has room for a third line. */
  cardLineLong?: string | undefined;
  statusLabel: string;
  /** Tiny status metadata for the info sheet (TASK-121 §5.4) — a shortening of `statusLabel`. */
  meta: string;
  /** TASK-250: own logo, shown instead of the name text on the panel heading and the phone bar; absent = text name. */
  logo?: ProductLogo | undefined;
  /** The product's cover art (TASK-127: a hand-authored SVG for every product). */
  art: CoverArt;
  lettering: PortfolioEntry["lettering"];
  /** Lucide name for the cover plate's emblem. */
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
  /** TASK-210 (phone listing + detail): the project record's own status / tags / role / build dates / evidenced metrics. */
  status?: ProjectStatus | undefined;
  tags?: readonly string[] | undefined;
  role?: string | undefined;
  duration?: string | undefined;
  metrics?: readonly PortfolioMetric[] | undefined;
}

export type ProjectStatus = Project["status"];

/** A project metric as the phone detail shows it: the record's value + label, with its evidence kind (never reworded). */
export interface PortfolioMetric {
  value: string;
  label: string;
  kind: "measured" | "structural" | "self-reported";
}

/**
 * TASK-249 (Tushar 2026-10-18): the one test for "shows on a product list" — a personal build not marked
 * `listed: false`. Carousel, sitemap and the next-project band all use it; case-study pages are still built
 * for every personal build. Lives here (type-only imports) so client code can use it without pulling in data.
 */
export function isListed(project: Project): boolean {
  return project.category === "personal" && project.listed !== false;
}

/** The listed build after `slug` in data order, wrapping; for an unlisted page, the first listed build after it (TASK-249). */
export function nextListedProject(personal: readonly Project[], slug: string): Project {
  const start = personal.findIndex((entry) => entry.slug === slug);
  for (let step = 1; step <= personal.length; step++) {
    const candidate = personal[(start + step) % personal.length]!;
    if (isListed(candidate)) return candidate;
  }
  throw new Error("portfolio: no listed personal build to link to (TASK-249)");
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
  // TASK-249 (Tushar 2026-10-18): every personal build must still have an entry, but only listed ones become products.
  for (const project of projects) {
    if (project.category === "personal" && !bySlug.has(project.slug)) throw new Error(`portfolio: personal build "${project.slug}" has no data/portfolio.ts entry`);
  }
  return projects
    .filter(isListed)
    .map((project, index) => {
      const entry = bySlug.get(project.slug)!;
      return {
        id: project.slug,
        name: project.name,
        tagline: entry.coverLine,
        description: project.tagline,
        cardLine: entry.cardLine,
        cardLineLong: entry.cardLineLong,
        statusLabel: project.statusLabel,
        meta: entry.meta,
        logo: entry.logo ? { dark: productLogoSrc(project.slug, "dark"), light: productLogoSrc(project.slug, "light"), ...entry.logo } : undefined,
        art: resolveArtOrThrow(entry.coverArt, resolveArt),
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
        status: project.status,
        tags: project.tags,
        role: project.role,
        duration: project.duration,
        metrics: (project.metrics ?? []).slice(0, 3).map(({ value, label, kind }) => ({ value, label, kind })),
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

// ---------------------------------------------------------------------------------------------------------------------
// TASK-210 · the phone listing's filters + URLs. Everything derives from the project records (status, videos) — no
// invented categories. The URL is the one source of truth for the phone view:
//   /projects                              the listing (all products)
//   /projects?filter=live&video=1          the listing, filtered (status AND "has a video")
//   /projects?product=<id>[&filter=…]      that product's detail; the filter rides along so Back restores the listing
// ---------------------------------------------------------------------------------------------------------------------

/** Chip order + labels for the statuses a product can carry (a chip renders only if some product has it). */
export const STATUS_FILTERS: readonly { value: ProjectStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "pilot", label: "Pilot" },
  { value: "prototype", label: "Prototype" },
  { value: "research", label: "Research" },
];

export interface ListFilter {
  status: ProjectStatus | null;
  video: boolean;
}

export const NO_FILTER: ListFilter = { status: null, video: false };

export function hasVideo(product: PortfolioProduct): boolean {
  return Boolean(product.pitchVideo || product.demoVideo);
}

/** The status chips that have at least one product, in the canonical order. */
export function statusOptions(products: readonly PortfolioProduct[]): { value: ProjectStatus; label: string; count: number }[] {
  return STATUS_FILTERS.map((option) => ({ ...option, count: products.filter((p) => p.status === option.value).length })).filter((option) => option.count > 0);
}

/** Filters without reordering: the visible list is always a subsequence of `products`. */
export function filterProducts(products: readonly PortfolioProduct[], filter: ListFilter): PortfolioProduct[] {
  return products.filter((p) => (filter.status === null || p.status === filter.status) && (!filter.video || hasVideo(p)));
}

/** `filter=` / `video=` from a query string; unknown values fall back to "no filter" (never a blank list). */
export function parseListFilter(params: URLSearchParams, products: readonly PortfolioProduct[]): ListFilter {
  const raw = params.get("filter");
  const status = statusOptions(products).find((option) => option.value === raw)?.value ?? null;
  return { status, video: params.get("video") === "1" };
}

function filterQuery(filter: ListFilter): string[] {
  const parts: string[] = [];
  if (filter.status) parts.push(`filter=${filter.status}`);
  if (filter.video) parts.push("video=1");
  return parts;
}

export function listHref(filter: ListFilter): string {
  const parts = filterQuery(filter);
  return parts.length ? `/projects?${parts.join("&")}` : "/projects";
}

export function detailHref(id: string, filter: ListFilter): string {
  return `/projects?${[`product=${id}`, ...filterQuery(filter)].join("&")}`;
}
