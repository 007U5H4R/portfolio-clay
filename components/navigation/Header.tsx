"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ClayTile } from "@/components/clay/ClayTile";
import { useScrollY } from "@/lib/motion";
import { site } from "@/lib/site";
import { navItems } from "@/lib/nav";
import { NavPill } from "./NavPill";
import { AskAIButton } from "./AskAIButton";
import { MobileMenu } from "./MobileMenu";

// Hysteresis (Schmitt-trigger) thresholds for the rest→compact toggle. The band between them
// (COMPACT_ENTER − COMPACT_EXIT = 32px) MUST stay ≥ the 28px header height delta (96px rest −
// 68px compact); a narrower band lets the compaction's own layout change re-trigger the toggle in
// an infinite loop on short pages whose scroll range straddles the threshold (F6 — React #185;
// see lib/motion.ts useScrollY and docs/reports/F6-debug.md).
const COMPACT_ENTER = 40;
const COMPACT_EXIT = 8;

/**
 * Sticky header shell + rest→compact scroll compaction (technical-plan.md §B S04.03,
 * Design.md §3): 96px padded rest state collapses to 68px with a 12px backdrop blur + 80% `bg`
 * fill once the page scrolls past `COMPACT_ENTER`. `data-compact` (not a class toggle on
 * the component) drives the transition so the CSS owns the timing curve in one place.
 */
export function Header() {
  const pathname = usePathname();
  const isCompact = useScrollY(COMPACT_ENTER, COMPACT_EXIT);

  return (
    <header
      data-compact={isCompact ? "" : undefined}
      // 26px/12px (not the Tailwind py-7/py-3.5 tokens) are the vertical paddings that actually
      // land on the Design.md-specified 96px/68px header heights: the row's real content height
      // is 44px — set by the nav links' `min-h-11` Fitts's-Law target (Design.md §3 "≥44×44 hit
      // area"), which is taller than the 40px logo mark the 28px/14px paddings were sized against
      // (F4, docs/reports/TSK-07.md) — so 44 + 2×26 = 96 and 44 + 2×12 = 68 exactly. `--header-py`
      // is a CSS custom property (not a JS-computed inline style keyed off `isCompact`) so the
      // React-owned `data-compact` attribute only ever flips a class — see docs/reports/TKT-01-fix.md
      // (F6) for why a JS-computed value here is best avoided on this element.
      className="sticky top-0 z-40 py-[26px] [--header-py:26px] transition-[padding,background-color,backdrop-filter] duration-[250ms] ease-in-out motion-reduce:transition-none data-[compact]:bg-bg/80 data-[compact]:py-3 data-[compact]:[--header-py:12px] data-[compact]:backdrop-blur-[12px]"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + var(--header-py))" }}
    >
      <Container className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-[var(--radius-utility)] focus-ring"
        >
          <ClayTile size={40} tier="utility">
            {/* EXE-7 micro-label exception: decorative brand monogram, not content — ink on the
                utility tile clears AA contrast by a wide margin at 13px. */}
            <span className="text-[13px] font-semibold text-ink" aria-hidden="true" data-micro-label="">
              TP
            </span>
          </ClayTile>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-ink">{site.name}</span>
            {/* Deviation 5 (Design.md): subtitle hides below 768px so the mobile header stays
                short enough for the Hero to pass its 5-second test without scrolling.
                EXE-7 micro-label exception: decorative brand label, ink-3 on bg ≈ 4.8:1 (AA-safe
                at 12px) — exempt from the 14px content floor, not exempt from contrast. */}
            <span className="hidden text-[12px] text-ink-3 md:block" data-micro-label="">
              {site.title}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active || undefined}
                className="relative flex min-h-11 items-center px-4 text-[14px] font-medium text-ink-2 focus-ring data-[active]:text-ink"
              >
                {active ? <NavPill /> : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <AskAIButton />
        </div>

        <MobileMenu />
      </Container>
    </header>
  );
}
