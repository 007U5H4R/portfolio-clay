"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAskContext } from "@/components/ai/AskProvider";
import { activeDockHref, dockItems } from "@/lib/mobile-dock";

/**
 * MobileDock (TASK-224) — the phone-only (< 640 px) floating bottom navigation: six equal columns, one row, frosted glass
 * over the paper page. Desktop and tablet never see it (`display: none` from 640 up) and keep the header tabs. Links reuse
 * `next/link` and the site's routes; "Ask Tushky" opens the global Ask drawer exactly as the header's Ask button does, with
 * focus returning to this button on close. The current page carries `aria-current="page"` plus a visible navy tile and a
 * gold bar, so selection is never colour alone. Icons are decorative (the visible label is the accessible name).
 */
export function MobileDock() {
  const pathname = usePathname();
  const { openPanel, panelOpen, triggerRef } = useAskContext();
  const current = activeDockHref(pathname);

  const onAsk = (event: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    openPanel();
  };

  return (
    <nav aria-label="Primary mobile" className="mobile-dock" data-mobile-dock="">
      <ul className="md-list">
        {dockItems.map((item) => {
          const inner = (
            <>
              <span className="md-icon" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- 120 px decorative webp, already optimised */}
                <img src={item.icon} alt="" width={26} height={26} decoding="async" draggable={false} />
              </span>
              <span className="md-label">{item.label}</span>
            </>
          );
          return (
            <li key={item.label} className="md-cell">
              {item.kind === "link" ? (
                <Link
                  href={item.href}
                  className="md-item focus-ring"
                  aria-current={current === item.href ? "page" : undefined}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  className="md-item focus-ring"
                  aria-label={item.ariaLabel}
                  aria-haspopup="dialog"
                  aria-expanded={panelOpen}
                  onClick={onAsk}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
