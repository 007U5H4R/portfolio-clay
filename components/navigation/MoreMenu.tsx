"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, Menu, MessageCircle, X } from "lucide-react";
import { useAskContext } from "@/components/ai/AskProvider";
import { activeNavHref, navItems } from "@/lib/nav";
import { resumeAction, site } from "@/lib/site";

/**
 * MoreMenu (TASK-205, mobile redesign): the phone-only secondary-destinations sheet behind the header's "More" button (< 640 px; CSS hides the
 * button at every wider width, so desktop and tablet keep the TASK-112 tab-only header). Every row reuses an existing route or
 * link: the five primary tabs from `lib/nav`, the product-thinking page, Gummy Lab, the Ask Tushky panel (the same one the
 * header's Ask button opens), Contact, and the profile links from `lib/site`. Theme stays on the header's own switch — no second control.
 *
 * Built on a native `<dialog>` opened with `showModal()` (focus trap, Esc, inert page behind it) and mounted only while open, so it adds
 * nothing to the DOM or the first-load JS path until used. It closes on a destination tap, backdrop tap and Esc; focus returns to the button.
 */
const EXPLORE = [
  { label: "Product thinking", hint: "How I approach a problem", href: "/thinking" },
  { label: "Gummy Lab", hint: "A tiny game. A big distraction.", href: "/lab" },
] as const;

export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { openPanel, triggerRef } = useAskContext();
  const resume = resumeAction();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  // Return focus to the trigger once the sheet unmounts.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // A tap on the backdrop (the dialog box itself, outside the sheet) or on any destination link closes the sheet; a link still
  // navigates normally, so the sheet is gone when the new route renders.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget || (event.target as Element).closest("a")) close();
  };

  const askTushky = () => {
    triggerRef.current = buttonRef.current;
    setOpen(false);
    openPanel();
  };

  const current = activeNavHref(pathname);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="header-more focus-ring"
        aria-label="More"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "more-menu" : undefined}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
      </button>
      {open ? (
        <dialog
          ref={dialogRef}
          id="more-menu"
          className="more-menu"
          aria-label="More"
          onClick={onDialogClick}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div className="more-sheet">
            <div className="more-head">
              <p className="more-title">Menu</p>
              <button type="button" className="more-close focus-ring" aria-label="Close menu" onClick={close}>
                <X aria-hidden="true" size={20} strokeWidth={1.75} />
              </button>
            </div>

            <nav aria-label="Portfolio" className="more-group">
              <h2 className="more-label">Portfolio</h2>
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="more-row focus-ring"
                      aria-current={current === item.href ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Explore" className="more-group">
              <h2 className="more-label">Explore</h2>
              <ul>
                {EXPLORE.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="more-row focus-ring" aria-current={pathname === item.href ? "page" : undefined}>
                      <span>
                        {item.label}
                        <small>{item.hint}</small>
                      </span>
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} />
                    </Link>
                  </li>
                ))}
                <li>
                  <button type="button" className="more-row focus-ring" onClick={askTushky}>
                    <span>
                      Ask Tushky
                      <small>Questions about my work</small>
                    </span>
                    <MessageCircle aria-hidden="true" size={18} strokeWidth={1.75} />
                  </button>
                </li>
              </ul>
            </nav>

            <nav aria-label="Connect" className="more-group">
              <h2 className="more-label">Connect</h2>
              <ul>
                <li>
                  <Link href="/contact" className="more-row focus-ring" aria-current={pathname === "/contact" ? "page" : undefined}>
                    <span>Let&apos;s connect</span>
                    <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} />
                  </Link>
                </li>
                {[
                  { label: "LinkedIn", href: site.linkedin },
                  { label: "GitHub", href: site.github },
                  { label: "Resume", href: resume.href },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="more-row focus-ring" target="_blank" rel="noopener noreferrer">
                      <span>{link.label}</span>
                      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.75} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
