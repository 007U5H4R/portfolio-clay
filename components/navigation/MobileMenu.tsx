"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ClayButton } from "@/components/clay/ClayButton";
import { Icon } from "@/components/common/Icon";
import { navItems } from "@/lib/nav";
import { resumeAction } from "@/lib/site";
import { AskAIButton } from "./AskAIButton";

/**
 * Full-screen `<dialog>` sheet (technical-plan.md §B S04.05, Design.md §3) — deliberately not a
 * small anchored dropdown, so the browser's native modal behaviour (focus trap, inert
 * background, Esc → `cancel` → `close`, and focus restored to the trigger on close) is correct
 * for free, and every row can be a full 56px/44px target without fighting a cramped popover.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const resume = resumeAction();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // `overflow:hidden` on <html> while open (S04.05) — the dialog itself scrolls its own content.
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
      <ClayButton
        variant="ghost"
        iconOnly
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls={dialogId}
        aria-expanded={open}
        className="md:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon icon={open ? X : Menu} size={24} />
      </ClayButton>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Site navigation"
        className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-paper p-0 backdrop:bg-navy/40"
        // Native `cancel` (Esc) closes the dialog itself, which then fires `close` — syncing
        // React state from `close` covers both Esc and the explicit close button below.
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click that lands on the `<dialog>` element itself (not a descendant) is a click on
          // its backdrop/padding — the standard native-dialog "click outside closes" pattern.
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div
          className="flex h-full flex-col overflow-y-auto px-[var(--gutter-mobile)] py-[var(--space-6)]"
          style={{ paddingTop: "calc(var(--space-6) + env(safe-area-inset-top))" }}
        >
          <div className="flex justify-end">
            <ClayButton variant="ghost" iconOnly aria-label="Close menu" onClick={() => setOpen(false)}>
              <Icon icon={X} size={24} />
            </ClayButton>
          </div>

          <nav aria-label="Primary" className="mt-[var(--space-6)] flex flex-1 flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center text-[18px] font-medium text-navy focus-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-navy/10 pt-[var(--space-5)]">
            <AskAIButton />
            <ClayButton
              variant="secondary"
              href={resume.href}
              download={resume.download}
              onClick={() => setOpen(false)}
            >
              {resume.label}
            </ClayButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
