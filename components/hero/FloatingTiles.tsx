import { ClayTile } from "@/components/clay/ClayTile";
import { Parallax } from "@/components/interactions/Parallax";
import type { HeroTile } from "@/data/hero";

// Restrained-asymmetry cluster at ≥1024 (Design.md §3): vertical offsets -24 / 0 / +24 and
// parallax depths 0.5 / 1 / 1.5 (maxPx = 6×depth). <1024 collapses to a single 16px-gap column.
const OFFSET_CLASS = ["lg:-mt-6", "lg:mt-0", "lg:mt-6"] as const; // -24 / 0 / +24 px
const DEPTH = [0.5, 1, 1.5] as const;

export interface FloatingTilesProps {
  tiles: readonly HeroTile[];
}

/** The AI Products · People · Progress hero tiles — one `ClayTile` per sourced one-liner. */
export function FloatingTiles({ tiles }: FloatingTilesProps) {
  return (
    <ul className="flex list-none flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
      {tiles.map((tile, i) => (
        <li key={tile.label} className="lg:min-w-0 lg:flex-1">
          <Parallax depth={DEPTH[i] ?? 1} maxPx={6 * (DEPTH[i] ?? 1)} className={OFFSET_CLASS[i] ?? ""}>
            {/* ClayTile is nominally 180px wide; `!h-auto aspect-[9/7]` relaxes its square default
                to the ~180×140 hero-tile shape (Design.md §3) while letting the sourced copy grow
                the box rather than clip it. */}
            <ClayTile
              size={180}
              tone="lavender"
              tier="card"
              className="!h-auto w-full flex-col items-start gap-1.5 p-4 text-left lg:aspect-[9/7] lg:!w-full"
            >
              <span className="text-[length:var(--text-caption)] font-bold tracking-[var(--tracking-eyebrow)] uppercase text-navy">
                {tile.label}
              </span>
              {/* EXE-7 / EVAL-008: this is CONTENT copy, not a micro-label — it must clear the
                  14px `--text-caption` floor rather than take the data-micro-label exception. */}
              <span className="text-[length:var(--text-caption)] leading-snug text-navy-2">
                {tile.copy}
              </span>
            </ClayTile>
          </Parallax>
        </li>
      ))}
    </ul>
  );
}
