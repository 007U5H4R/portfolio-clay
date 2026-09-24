"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { resumeAction } from "@/lib/site";
import { AskAIButton } from "./AskAIButton";

/**
 * The mobile paper sheet (Design.md §4.1; TKT-71 restyle of the S04.05 `<dialog>`). Still a native
 * modal `<dialog aria-label="Site navigation">` — the browser's focus trap, inert background, `Esc`
 * → `cancel` → `close`, and focus restored to the trigger on close are correct for free — but it now
 * drops from the header's bottom edge as a full-width paper sheet (`--shadow-paper`) instead of a
 * full-screen page: the five nav rows (56 px, Fraunces 18), a hairline, then the "Let's connect →"
 * pill, the `resumeAction()` row and the Ask row (S21). A click on the backdrop (the `<dialog>`
 * element itself) closes it; `overflow:hidden` on `<html>` while open is unchanged.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const pathname = usePathname();
  const resume = resumeAction();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // `overflow:hidden` on <html> while open (S04.05) — the sheet scrolls its own content.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls={dialogId}
        aria-expanded={open}
        className="header-menu-btn focus-ring"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 18 14" width={18} height={14} aria-hidden="true" focusable="false">
          <path d="M1 2 C 6 1, 12 3, 17 2 M1 7 C 6 6, 12 8, 17 7 M1 12 C 6 11, 12 13, 17 12" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Site navigation"
        className="menu-sheet"
        // Native `cancel` (Esc) closes the dialog itself, which then fires `close` — syncing React
        // state from `close` covers Esc and every explicit close path below.
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click that lands on the `<dialog>` element itself (not a descendant) is a click on its
          // backdrop — the standard native-dialog "click outside closes" pattern.
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="menu-sheet-body">
          <nav aria-label="Primary" className="sheet-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="sheet-row sheet-row-nav focus-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sheet-actions">
            <Link
              href="/contact"
              data-hand="cta"
              onClick={() => setOpen(false)}
              className="header-pill sheet-pill font-hand focus-ring"
            >
              Let&apos;s connect <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={resume.href}
              download={resume.download ? true : undefined}
              onClick={() => setOpen(false)}
              className="sheet-row sheet-row-resume focus-ring"
            >
              {resume.label}
            </Link>
            <AskAIButton variant="row" />
          </div>
        </div>
      </dialog>
    </>
  );
}
