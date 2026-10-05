"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enteredFromPortfolio, LAB_PATH, readReturnRoute } from "@/lib/lab/session";
import { stopSmoothScroll } from "@/lib/smooth-scroll";
import { playExit, settleOverlay } from "@/components/easter-egg/transition";
import Link from "next/link";
import styles from "./lab.module.css";

/** Elements of the portfolio chrome that must not be reachable while the lab covers the page. */
const CHROME_SELECTOR = "header[data-site-header], footer, a[href='#main']";

export default function LabApp() {
  const router = useRouter();

  const exit = useCallback(() => {
    const monogram = document.querySelector("[data-site-header] .header-monogram");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    playExit({
      targetRect: monogram?.getBoundingClientRect() ?? null,
      reducedMotion: reduced,
      navigate: () => (enteredFromPortfolio() && window.history.length > 1 ? router.back() : router.push(readReturnRoute())),
    });
  }, [router]);

  // Cover and silence the portfolio underneath; restore everything on unmount.
  useEffect(() => {
    const chrome = Array.from(document.querySelectorAll<HTMLElement>(CHROME_SELECTOR));
    chrome.forEach((el) => el.setAttribute("inert", ""));
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const releaseScroll = stopSmoothScroll();
    // The entry overlay has carried us here; let it go once the lab has painted.
    const raf = requestAnimationFrame(() => settleOverlay());
    return () => {
      cancelAnimationFrame(raf);
      chrome.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = prevOverflow;
      releaseScroll();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  return (
    <div className={styles.root} data-lab="shell" data-lab-path={LAB_PATH} data-lenis-prevent="">
      <div className={styles.chrome}>
        <Link
          className={styles.back}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            exit();
          }}
        >
          <span aria-hidden="true">←</span> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
