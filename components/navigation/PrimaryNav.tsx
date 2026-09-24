"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { InkUnderline } from "./InkUnderline";

/**
 * The desktop primary nav (Design.md §4.1; TKT-71): Fraunces 18, ≥ 44 px hit areas, the ink-stroke
 * underline drawn on `aria-current="page"` and hover. Client only for `usePathname()` — the one
 * per-route value the server shell cannot know on a static build (TP1); it still server-renders,
 * so the links are in the static HTML (EVAL-015 no-JS check). Hidden below `lg` by CSS; the
 * `MobileMenu` sheet carries the same `navItems` there.
 */
export function PrimaryNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="header-nav">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="header-nav-link focus-ring"
          >
            {item.label}
            <InkUnderline />
          </Link>
        );
      })}
    </nav>
  );
}
