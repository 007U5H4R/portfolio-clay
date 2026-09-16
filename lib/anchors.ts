/**
 * Chapter-id ↔ anchor map and the single `routes()` builder (TP8, decision E-3).
 *
 * Chapter ids are *schema values* (`data/schema.ts` CHAPTER_IDS); the `NN-slug` anchors are a
 * *presentation* concern that lives here once (and mirrored for humans in `docs/anchors.md`), so
 * no component or content file re-derives them. `routes()` produces the set of every valid internal
 * href — bare routes, `/work/<slug>#<chapterAnchor>`, page anchors, `/work?filter=<f>` (E-2: the
 * only permitted query key is `filter`), and essay routes — so `validateAll()` (data/index.ts) and
 * the anchors unit test resolve internal links against one source of truth. A dangling internal
 * link is a build failure (EVAL-013), never a later crawler finding.
 */
import { CHAPTER_IDS } from '@/data/schema';

export type ChapterId = (typeof CHAPTER_IDS)[number];

/** chapter id → { anchor slug, human title } (technical-plan.md §B S03.03). */
export const CHAPTER_ANCHORS: Record<ChapterId, { anchor: string; title: string }> = {
  context:    { anchor: '01-context',       title: 'Context' },
  problem:    { anchor: '02-problem',       title: 'Problem' },
  discovery:  { anchor: '03-discovery',     title: 'Discovery' },
  bet:        { anchor: '04-product-bet',   title: 'Product bet' },
  built:      { anchor: '05-what-i-built',  title: 'What I built' },
  evaluation: { anchor: '06-evaluation',    title: 'Evaluation' },
  outcome:    { anchor: '07-outcome',       title: 'Outcome' },
  learned:    { anchor: '08-what-i-learned', title: 'What I learned' },
};

/** In-page anchors for the static content pages. */
export const PAGE_ANCHORS = {
  about: ['experience', 'impact', 'capabilities', 'research'],
  contact: ['resume'],
} as const;

/** The `?filter=` values `/work` accepts (mirrors the `Filter` enum in data/schema.ts). */
export const WORK_FILTERS = ['ai', 'enterprise', 'cloud', 'experiments'] as const;

/** Top-level routes that always exist. */
export const STATIC_ROUTES = ['/', '/work', '/about', '/thinking', '/contact', '/playground'] as const;

export interface RouteInputs {
  /** Project slugs that back `/work/<slug>` (and their chapter anchors). */
  projectSlugs: readonly string[];
  /** Essay slugs that back `/thinking/<slug>`. */
  essaySlugs?: readonly string[];
}

/**
 * Build the complete set of valid internal hrefs. Membership in the returned set IS resolution:
 * an href not in the set is dangling. Only `?filter=<f>` query hrefs are emitted, so any other
 * query key (e.g. a stray `?tab=`) cannot resolve — enforcing E-2 mechanically.
 */
export function routes({ projectSlugs, essaySlugs = [] }: RouteInputs): Set<string> {
  const set = new Set<string>();

  for (const r of STATIC_ROUTES) set.add(r);
  for (const f of WORK_FILTERS) set.add(`/work?filter=${f}`);

  const chapterAnchors = Object.values(CHAPTER_ANCHORS).map((c) => c.anchor);
  for (const slug of projectSlugs) {
    set.add(`/work/${slug}`);
    for (const anchor of chapterAnchors) set.add(`/work/${slug}#${anchor}`);
  }

  for (const anchor of PAGE_ANCHORS.about) set.add(`/about#${anchor}`);
  for (const anchor of PAGE_ANCHORS.contact) set.add(`/contact#${anchor}`);

  for (const slug of essaySlugs) set.add(`/thinking/${slug}`);

  return set;
}

/** True when `href` is an internal (site-relative) link that `routes()` should resolve. */
export function isInternalHref(href: string): boolean {
  return href.startsWith('/');
}

/** True when `href` resolves to a known route (or `route#anchor`) in `routeSet`. */
export function resolves(href: string, routeSet: Set<string>): boolean {
  return routeSet.has(href);
}
