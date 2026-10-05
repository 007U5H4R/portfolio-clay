"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

/** One drawer row, already resolved server-side (the source label and public URL, never the `ref`). */
export interface EvidenceRow {
  title: string;
  type: string;
  date?: string | undefined;
  supports: string;
  /** Present only when the source is public (e.g. a live stats endpoint); private docs are listed, never linked. */
  url?: string | undefined;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Spec §22–§23: the evidence behind the page stays collapsed — the section shows the artifact types
 * as chips and one "View all evidence" button; the drawer lists every artifact with its type,
 * date and the claim it supports. A native modal `<dialog>` (the rest of the page goes inert), plus an
 * explicit Tab/Shift+Tab trap inside it, Esc to close (the dialog's own `cancel`), and focus back on
 * the button that opened it.
 */
export function EvidenceDrawer({ rows, name }: { rows: readonly EvidenceRow[]; name: string }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const show = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    setOpen(true);
    dialog.querySelector<HTMLElement>(".csx-drawer-close")?.focus();
  };

  const trap = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="csx-drawer-open focus-ring"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="evidence-drawer"
        onClick={show}
      >
        View all evidence <span aria-hidden="true">→</span>
      </button>
      <dialog
        ref={dialogRef}
        id="evidence-drawer"
        className="csx-drawer"
        aria-labelledby="evidence-drawer-h"
        onKeyDown={trap}
        onClick={(event) => {
          // A press on the backdrop (the dialog element itself, outside its panel) closes it.
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="csx-drawer-panel">
          <div className="csx-drawer-head">
            <h2 id="evidence-drawer-h" className="csx-drawer-h">
              Evidence behind the {name} case study
            </h2>
            <button type="button" className="csx-drawer-close focus-ring" onClick={close} aria-label="Close evidence">
              <X aria-hidden="true" focusable="false" size={20} strokeWidth={1.8} />
            </button>
          </div>
          <p className="csx-drawer-note">
            Private working documents are listed with what they support; only public sources link out.
          </p>
          <ol className="csx-drawer-list">
            {rows.map((row) => (
              <li key={`${row.title}-${row.type}`} className="csx-drawer-row">
                <p className="csx-drawer-title">
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noopener noreferrer" className="focus-ring" data-inline-link="">
                      {row.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    row.title
                  )}
                </p>
                <p className="csx-drawer-meta">
                  <span className="csx-drawer-type" data-micro-label="">{row.type}</span>
                  {row.date ? <span>{row.date}</span> : null}
                </p>
                <p className="csx-drawer-supports">
                  <span className="csx-drawer-label">Supports:</span> {row.supports}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </dialog>
    </>
  );
}
