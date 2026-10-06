/**
 * Off-screen animation pause (TASK-155). One shared IntersectionObserver marks every animated container that is
 * outside the viewport (plus a margin, so it resumes just before it scrolls in) with `data-offscreen`; one CSS
 * rule (`app/globals.css`, "TASK-155 off-screen pause") pauses every animation inside a marked container. A
 * time-based infinite animation (the footer ocean) otherwise runs for the whole visit, off-screen, on the main
 * thread / compositor. Scroll-driven animations (`view()` timelines) are untouched — they only advance when scrolled.
 */
export const OFFSCREEN_TARGETS = "[data-pause-offscreen], [data-band-ocean]";
const MARGIN = "200px 0px";

export function observeOffscreen(root: ParentNode = document, IO: typeof IntersectionObserver = IntersectionObserver): () => void {
  const io = new IO(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.removeAttribute("data-offscreen");
        else entry.target.setAttribute("data-offscreen", "");
      }
    },
    { rootMargin: MARGIN },
  );
  root.querySelectorAll(OFFSCREEN_TARGETS).forEach((el) => io.observe(el));
  return () => io.disconnect();
}
