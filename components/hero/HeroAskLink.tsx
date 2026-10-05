"use client";

/**
 * HeroAskLink (TKT-113, Home Ask Tushky spec §24 "Input submit, suggested question, and Ask Tushky CTA
 * all open the RIGHT drawer") — the hero's secondary "✦ Ask Tushky" CTA (TKT-108). A click opens the
 * drawer the way `AskAIButton` does (`openPanel`, focus returns to this link on close, EVAL-007). It
 * stays a real `<a href="#ask">`: with JavaScript off, or before hydration, it still scrolls to the
 * Home Ask Tushky section, and a modified click (new tab / window) keeps the browser's behaviour.
 */
import type { MouseEvent, ReactNode } from "react";
import { useAskContext } from "@/components/ai/AskProvider";

export function HeroAskLink({ className, describedBy, children }: { className?: string; describedBy?: string; children: ReactNode }) {
  const { openPanel, panelOpen } = useAskContext();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openPanel({ trigger: event.currentTarget });
  };

  return (
    <a
      href="#ask"
      className={className}
      aria-describedby={describedBy}
      aria-haspopup="dialog"
      data-cursor="WOOF 🐾"
      aria-expanded={panelOpen}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
