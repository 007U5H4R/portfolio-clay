"use client";

import { useEffect, useState } from "react";

/**
 * The compact sticky in-page navigator (tics.md "Suggested content architecture"): plain anchors that work
 * without JS, plus a scroll-spy that marks the section nearest the top as current (`aria-current="location"`).
 * On a narrow screen the pill row scrolls sideways inside its own focusable box. Targets carry
 * `scroll-margin-top` in the stylesheet so a jump never lands a heading under the sticky header or this bar.
 */
export function PaperNav({ items, name }: { items: readonly { id: string; label: string }[]; name: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      () => {
        // The current section is the last one whose top has passed the reading line (~35 % down the viewport).
        const line = window.innerHeight * 0.35;
        let current = targets[0]!.id;
        for (const el of targets) if (el.getBoundingClientRect().top <= line) current = el.id;
        setActive(current);
      },
      { rootMargin: "-35% 0px -60% 0px", threshold: [0, 1] },
    );
    for (const el of targets) io.observe(el);
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = targets[0]!.id;
      for (const el of targets) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav className="tsp-nav" aria-label={`${name} case study sections`}>
      <ol className="tsp-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="tsp-nav-link focus-ring" {...(active === item.id ? { "aria-current": "location" as const } : {})}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
