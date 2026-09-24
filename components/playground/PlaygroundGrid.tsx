import type { Project } from "@/data/schema";
import type { Tone } from "@/components/clay/tiers";
import { ClayTile } from "@/components/clay/ClayTile";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { cinematicPortfolio, dinoArcadePwa, pratyasa, tegaki } from "@/data/projects";

interface PlaygroundEntry {
  project: Project;
  tone: Tone;
}

/**
 * The 4 sanctioned experiments, fixed order + tone (tickets.md TKT-44, Design.md §3 Playground):
 * Pratyasa=butter, Tegaki=peach, dino-arcade-pwa=blush, cinematic-portfolio=mint. Imported by
 * name (not looked up by slug string) so a typo can't silently resolve to `undefined` — and so
 * Slag City / Mock Interview / Game (CONTENT_INVENTORY §6's exclusion note: no remote / team
 * draft / contains ROM-BIOS files that must never be published) have no path onto this page at
 * all, not even an accidental one — those three have no export from `data/projects.ts` to import.
 */
const ENTRIES: PlaygroundEntry[] = [
  { project: pratyasa, tone: "butter" },
  { project: tegaki, tone: "peach" },
  { project: dinoArcadePwa, tone: "blush" },
  { project: cinematicPortfolio, tone: "mint" },
];

export function PlaygroundGrid() {
  return (
    <ul className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-2">
      {ENTRIES.map((entry) => (
        <li key={entry.project.slug}>
          <PlaygroundTile {...entry} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One tile = the whole card is the external link (Law of Figure-Ground, same convention
 * `ProjectCard`/`ThinkingList` already use). `ClayTile tier="card" interactive` supplies the
 * "stronger clay" hover physics Design.md §3 explicitly permits here (rise + `--shadow-clay-hover`
 * — the deepest hover shadow token the design system defines); its own doc comment ("a wrapping
 * <a> owns focus") is written for exactly this use. `live` is read straight off the project record
 * (data/schema.ts `links.live`) rather than hard-coded, so the href can never drift from `/work`'s
 * own copy of the same URL.
 *
 * a11y (post-TKT-43 scar): the title is a real `<h2>` — not a styled `<span>` — so it is reachable
 * by screen-reader heading navigation; the page's own `<h1>` (`PlaygroundHero`) makes h1→h2 the
 * correct next level with no skip. The link's accessible name is its full visible content (name +
 * tagline) plus a trailing `VisuallyHidden` "(opens in new tab)" note — the same mechanism
 * `ExternalLink` uses, so the tile's computed accessible name always includes that phrase without
 * a manual `aria-label` fighting the heading's own name.
 */
function PlaygroundTile({ project, tone }: PlaygroundEntry) {
  const { name, tagline, links } = project;
  if (!links.live) return null; // defensive: every sanctioned entry above carries a live URL (schema `links.live`)

  return (
    <a
      href={links.live}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring block rounded-[var(--radius-clay)]"
    >
      <ClayTile
        tier="card"
        interactive
        tone={tone}
        size={180}
        className="!h-auto !w-full flex-col items-start gap-[var(--space-3)] p-[var(--card-padding)] text-left"
      >
        <h2 className="text-[length:var(--text-h3)] font-bold text-navy">{name}</h2>
        <p className="text-[length:var(--text-body)] text-navy-2">{tagline}</p>
        <VisuallyHidden>(opens in new tab)</VisuallyHidden>
      </ClayTile>
    </a>
  );
}
