"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, EllipsisVertical, ExternalLink, X } from "lucide-react";
import { useAskContext } from "@/components/ai/AskProvider";
import { activeMenuHref, menuGroups, type MenuItem } from "@/lib/mobile-menu";
import { requestTour } from "@/lib/tour";
import { Monogram } from "./Monogram";

/**
 * MoreMenu (TASK-205, redesigned TASK-232): the phone-only (< 640 px; CSS hides the kebab at every wider width, so desktop and tablet keep
 * the tab-only header) paper-craft drawer behind the header's kebab. It slides in from the LEFT and back out to the left. Destinations
 * are in `lib/mobile-menu` (Portfolio: Home, Experience, Portfolio, Ask Tushky, About, Certifications; Connect: Let's connect, LinkedIn, GitHub, Resume).
 * "Ask Tushky" opens the same global Ask drawer as the dock. Theme stays on the header's own switch — no second control.
 *
 * Built on a native `<dialog>` opened with `showModal()` (focus trap, Esc, inert page behind it) and mounted only while open or closing,
 * so it adds nothing to the DOM until used. It closes on ×, backdrop, Esc, a destination tap and a deliberate left swipe; focus returns
 * to the kebab. Closing plays the slide-out first (skipped under reduced motion). Nothing here focuses a text input.
 */
const EXIT_MS = 280;

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="3" y="9" width="3.8" height="11.5" fill="currentColor" />
      <circle cx="4.9" cy="4.9" r="2.2" fill="currentColor" />
      <path d="M10 9h3.6v1.7c.6-1.1 1.9-2 3.7-2 3.6 0 4.2 2.4 4.2 5.4v6.4h-3.8v-5.6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.7H10z" fill="currentColor" />
    </svg>
  );
}

// Same GitHub mark and document glyph the band footer's Social icons use.
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function ResumeMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M6 2h8l6 6v14H6V2zm7 1.5V9h5.5L13 3.5zM8 12h8v1.6H8V12zm0 3.4h8V17H8v-1.6zm0 3.4h5.5v1.6H8v-1.6z" />
    </svg>
  );
}

function RowIcon({ icon }: { icon: string }) {
  return (
    <span className="more-icon" aria-hidden="true">
      {icon === "linkedin" || icon === "github" || icon === "resume" ? (
        <span className={`more-in more-in-${icon}`}>
          {icon === "linkedin" ? <LinkedInMark /> : icon === "github" ? <GitHubMark /> : <ResumeMark />}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 120 px decorative webp, already optimised
        <img src={icon} alt="" width={40} height={40} loading="eager" decoding="async" draggable={false} />
      )}
    </span>
  );
}

export function MoreMenu() {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const { openPanel, triggerRef } = useAskContext();

  const finish = useCallback(() => {
    clearTimeout(timer.current);
    setClosing(false);
    setMounted(false);
  }, []);

  const close = useCallback(() => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    setClosing(true);
    timer.current = setTimeout(finish, EXIT_MS + 120); // fallback if animationend never fires
  }, [closing, finish]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!mounted || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [mounted]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Return focus to the kebab once the drawer unmounts.
  const wasMounted = useRef(false);
  useEffect(() => {
    if (wasMounted.current && !mounted) buttonRef.current?.focus({ preventScroll: true });
    wasMounted.current = mounted;
  }, [mounted]);

  // Backdrop tap (the dialog box itself, outside the sheet) or any destination link closes the drawer; a link still navigates.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget || (event.target as Element).closest("a")) close();
  };

  const askTushky = () => {
    triggerRef.current = buttonRef.current;
    finish(); // the Ask drawer takes over: no slide-out on top of its slide-in
    openPanel();
  };

  // TASK-170: close at once and start the tour; it hands focus back to the kebab when it ends.
  const takeTour = () => {
    finish();
    requestTour("menu", buttonRef.current);
  };

  // Deliberate leftward swipe (mostly horizontal, > 64 px) closes; vertical scrolling inside the drawer is untouched.
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) swipe.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = swipe.current;
    swipe.current = null;
    const t = e.changedTouches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (dx < -64 && Math.abs(dx) > Math.abs(dy) * 1.8) close();
  };

  const current = activeMenuHref(pathname);

  const renderItem = (item: MenuItem) => {
    if (item.kind === "ask" || item.kind === "tour") {
      return (
        <button type="button" className="more-row focus-ring" aria-haspopup="dialog" onClick={item.kind === "ask" ? askTushky : takeTour}>
          <RowIcon icon={item.icon} />
          <span className="more-text">
            <span className="more-name">{item.label}</span>
            <small>{item.hint}</small>
          </span>
          <ChevronRight className="more-end" aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      );
    }
    if (item.external) {
      return (
        <a href={item.href} className="more-row focus-ring" target="_blank" rel="noopener noreferrer">
          <RowIcon icon={item.icon} />
          <span className="more-text">
            <span className="more-name">{item.label}</span>
          </span>
          <ExternalLink className="more-end" aria-hidden="true" size={17} strokeWidth={2} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      );
    }
    return (
      <Link href={item.href} className="more-row focus-ring" aria-current={current === item.href ? "page" : undefined}>
        <RowIcon icon={item.icon} />
        <span className="more-text">
          <span className="more-name">{item.label}</span>
        </span>
        <ChevronRight className="more-end" aria-hidden="true" size={18} strokeWidth={2} />
      </Link>
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="header-more focus-ring"
        aria-label="More"
        aria-haspopup="dialog"
        aria-expanded={mounted && !closing}
        aria-controls={mounted ? "more-menu" : undefined}
        onClick={() => setMounted(true)}
      >
        <EllipsisVertical aria-hidden="true" size={22} strokeWidth={2.4} />
      </button>
      {mounted ? (
        <dialog
          ref={dialogRef}
          id="more-menu"
          className="more-menu"
          data-closing={closing ? "" : undefined}
          aria-label="Menu"
          onClick={onDialogClick}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div
            className="more-sheet"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onAnimationEnd={(e) => {
              if (closing && e.target === e.currentTarget) finish();
            }}
          >
            <div className="more-head">
              <div className="more-brand" aria-hidden="true">
                <span className="more-tile">
                  <Monogram />
                </span>
                <span className="more-wordmark">TUSHAR PATHAK</span>
              </div>
              <button type="button" className="more-close focus-ring" aria-label="Close menu" onClick={close}>
                <X aria-hidden="true" size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="more-scroll" data-lenis-prevent="">
              <div className="more-titlebar">
                <p className="more-title">Menu</p>
                <span className="more-deco" aria-hidden="true" />
              </div>

              {menuGroups.map((group) => (
                <nav key={group.label} aria-label={group.label} className="more-group">
                  <h2 className="more-label">{group.label}</h2>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.label}>{renderItem(item)}</li>
                    ))}
                  </ul>
                </nav>
              ))}
              <div className="more-land" aria-hidden="true" />
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
