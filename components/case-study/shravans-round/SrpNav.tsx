"use client";

import { useEffect, useState } from "react";

/**
 * The compact sticky in-page navigator for the Shravan's Round layout: plain anchors that work without JS, plus a
 * scroll-spy that marks the section nearest the top as current (`aria-current="location"`). On a narrow screen the pill row scrolls sideways inside its own box. Targets carry
 * `scroll-margin-top` in the stylesheet so a jump never lands a heading under the sticky header or this bar.
 */
export function SrpNav({ items, name }: { items: readonly { id: string; n: string; label: string }[]; name: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current = targets[0]!.id;
      for (const el of targets) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <nav className="srp-nav" aria-label={`${name} case study sections`}>
      <ol className="srp-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="srp-nav-link focus-ring" {...(active === item.id ? { "aria-current": "location" as const } : {})}>
              <span className="srp-nav-n" aria-hidden="true">
                {item.n}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
