"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LAB_PATH } from "@/lib/lab/session";

/**
 * TASK-143 — renders nothing on `/lab`. The Gummy Lab is an opaque full-viewport overlay, so the
 * band footer under it is never seen, yet its infinite animations (T4 ocean, band verb) kept
 * compositing and starved the lab's WebGL boot (EXE-55). Route-level, so the server HTML for `/lab`
 * omits the footer too; it comes back on exit.
 */
export function HideOnLab({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === LAB_PATH || pathname?.startsWith(`${LAB_PATH}/`) ? null : children;
}
