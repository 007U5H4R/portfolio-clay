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

const COMPACT_THRESHOLD = 24;

/**
 * Sticky header shell + rest→compact scroll compaction (technical-plan.md §B S04.03,
 * Design.md §3): 96px padded rest state collapses to 68px with a 12px backdrop blur + 80% `bg`
 * fill once the page scrolls past `COMPACT_THRESHOLD`. `data-compact` (not a class toggle on
 * the component) drives the transition so the CSS owns the timing curve in one place.
 */
export function Header() {
  const pathname = usePathname();
  const isCompact = useScrollY(COMPACT_THRESHOLD);

  return (
    <header
      data-compact={isCompact ? "" : undefined}
      className="sticky top-0 z-40 py-7 transition-[padding,background-color,backdrop-filter] duration-[250ms] ease-in-out motion-reduce:transition-none data-[compact]:bg-bg/80 data-[compact]:py-3.5 data-[compact]:backdrop-blur-[12px]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Container className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[var(--radius-utility)] focus-ring"
        >
          <ClayTile size={40} tier="utility">
            <span className="text-[13px] font-semibold text-ink" aria-hidden="true">
              TP
            </span>
          </ClayTile>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-ink">{site.name}</span>
            {/* Deviation 5 (Design.md): subtitle hides below 768px so the mobile header stays
                short enough for the Hero to pass its 5-second test without scrolling. */}
            <span className="hidden text-[12px] text-ink-3 md:block">{site.title}</span>
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
