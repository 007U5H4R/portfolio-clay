import "./cursor.css";
import { isExcludedTarget, isPrimaryMouseDown } from "@/lib/cursor/gate";
import { labelFor } from "@/lib/cursor/labels";
import { FOLLOW, LIFETIME, MAX_ACTIVE } from "@/lib/cursor/trail-config";
import { allTrailSrcs, pieceAt, themeFor, type TrailTheme } from "@/lib/cursor/trail-assets";
import { capActive, planSpawns, styleForSpeed, type Point } from "@/lib/cursor/trail-math";

/**
 * Paper Trail cursor controller (cursor.md, TASK-142.2–142.4). Imperative on purpose: one set of
 * global listeners, one rAF loop for the visible cursor (no React state per pointermove, §66), a
 * handful of DOM nodes. Lives in the lazily imported chunk — `PaperCursorGate` decides whether it is
 * ever fetched. Returns the teardown that removes every listener, node and class.
 */

const PAW_MASK =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 11c-3 0-5.5 3.2-5.5 5.6 0 1.8 1.5 2.3 3 2 1-.2 1.5-.4 2.5-.4s1.5.2 2.5.4c1.5.3 3-.2 3-2C17.5 14.2 15 11 12 11z'/><ellipse cx='5.5' cy='10' rx='2' ry='2.7'/><ellipse cx='9.5' cy='5.8' rx='2' ry='2.8'/><ellipse cx='14.5' cy='5.8' rx='2' ry='2.8'/><ellipse cx='18.5' cy='10' rx='2' ry='2.7'/></svg>\")";

type Mode = "hidden" | "default" | "link" | "tag";

export function mountPaperCursor(): () => void {
  if (document.querySelector("[data-paper-cursor]")) return () => {}; // single instance (§69)

  const html = document.documentElement;
  const body = document.body;

  const root = document.createElement("div");
  root.id = "portfolio-cursor";
  root.dataset.paperCursor = "cursor";
  root.dataset.mode = "hidden";
  root.setAttribute("aria-hidden", "true");
  root.style.setProperty("--pc-paw", PAW_MASK);
  const ring = document.createElement("span");
  ring.className = "pc-ring";
  const dot = document.createElement("span");
  dot.className = "pc-dot";
  const label = document.createElement("span");
  label.className = "pc-label";
  root.append(ring, dot, label);

  const layer = document.createElement("div");
  layer.id = "trail";
  layer.dataset.paperCursor = "trail";
  layer.setAttribute("aria-hidden", "true");

  body.append(layer, root);

  // ---- visible cursor: refs + one rAF loop ------------------------------------------------------
  const target: Point = { x: -100, y: -100 };
  const current: Point = { x: -100, y: -100 };
  let seen = false;
  let raf = 0;
  let mode: Mode = "hidden";
  let labelText = "";

  const render = () => {
    raf = 0;
    current.x += (target.x - current.x) * FOLLOW;
    current.y += (target.y - current.y) * FOLLOW;
    if (Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1) {
      current.x = target.x;
      current.y = target.y;
    } else {
      raf = requestAnimationFrame(render);
    }
    root.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  const setMode = (next: Mode, text: string) => {
    if (next !== mode) {
      mode = next;
      root.dataset.mode = next;
    }
    if (text !== labelText) {
      labelText = text;
      label.textContent = text;
      root.dataset.label = text ? "true" : "false";
      root.dataset.paw = text.startsWith("WOOF") ? "true" : "false";
    }
  };

  const hide = () => setMode("hidden", "");

  const classify = (el: EventTarget | null) => {
    const node = el instanceof Element ? el : null;
    const text = labelFor(node) ?? "";
    const excluded = isExcludedTarget(el);
    if (excluded) {
      // Native cursor owns the zone; a tagged control (the Tushky launcher) still gets its chip.
      setMode(text ? "tag" : "hidden", text);
    } else if (text || (node && node.closest("a[href]"))) {
      setMode("link", text);
    } else {
      setMode("default", "");
    }
  };

  // ---- paper trail ------------------------------------------------------------------------------
  const active: { el: HTMLImageElement; anim: Animation }[] = [];
  let pressed = false;
  let last: Point = { x: 0, y: 0 };
  let lastT = 0;
  let spawnIndex = 0;
  let theme: TrailTheme = "default";

  const spawn = (p: Point, dir: Point, speed: number) => {
    const style = styleForSpeed(speed);
    const rot = (Math.random() * 2 - 1) * style.maxTilt;
    const nudge = style.nudge * (0.7 + Math.random() * 0.6);
    const fx = dir.x * nudge;
    const fy = dir.y * nudge;
    const img = document.createElement("img");
    img.className = "cursor-trail-item";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.draggable = false;
    img.src = pieceAt(theme, spawnIndex++);
    img.style.width = `${style.width}px`;
    layer.append(img);
    const at = (dx: number, dy: number, r: number, s: number) =>
      `translate(${p.x + dx}px, ${p.y + dy}px) translate(-50%, -50%) rotate(${r}deg) scale(${s})`;
    const drop = 28 + Math.random() * 12;
    const anim = img.animate(
      [
        { transform: at(-fx * 1.5, -fy * 1.5, rot - 14, 0.2), opacity: 0, easing: "cubic-bezier(.2,.9,.25,1.35)" },
        { transform: at(fx, fy, rot, 1.08), opacity: 1, offset: 0.18, easing: "cubic-bezier(.22,1,.36,1)" },
        { transform: at(fx, fy, rot, 1), opacity: 1, offset: 0.62, easing: "linear" },
        { transform: at(fx, fy + drop, rot + (rot < 0 ? -12 : 12), 0.72), opacity: 0, offset: 1, easing: "cubic-bezier(.4,0,1,1)" },
      ],
      { duration: LIFETIME, fill: "forwards" },
    );
    const item = { el: img, anim };
    active.push(item);
    const release = () => {
      img.remove();
      const i = active.indexOf(item);
      if (i !== -1) active.splice(i, 1);
    };
    anim.onfinish = release;
    anim.oncancel = release;
    for (const old of capActive(active, MAX_ACTIVE)) old.anim.cancel();
  };

  const endPress = () => {
    pressed = false;
    body.classList.remove("cursor-dragging");
    root.dataset.pressed = "false";
  };

  const onDown = (e: PointerEvent) => {
    if (!isPrimaryMouseDown(e) || isExcludedTarget(e.target)) return;
    pressed = true;
    theme = themeFor((e.target as Element | null)?.closest<HTMLElement>("[data-cursor-theme]")?.dataset.cursorTheme);
    body.classList.add("cursor-dragging");
    root.dataset.pressed = "true";
    last = { x: e.clientX, y: e.clientY };
    lastT = e.timeStamp;
    spawn(last, { x: 0, y: 0 }, 0);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    target.x = e.clientX;
    target.y = e.clientY;
    if (!seen) {
      seen = true;
      current.x = target.x;
      current.y = target.y;
      html.classList.add("has-custom-cursor"); // hide the native cursor only once we are drawing ours
    }
    root.dataset.flip = String(e.clientX > window.innerWidth - 220);
    classify(e.target);
    schedule();

    if (!pressed) return;
    if (e.buttons === 0) return endPress(); // released outside the window
    const cur = { x: e.clientX, y: e.clientY };
    if (isExcludedTarget(e.target)) {
      last = cur; // no nodes over a zone, and no burst when leaving it
      lastT = e.timeStamp;
      return;
    }
    const plan = planSpawns(last, cur);
    if (plan.points.length === 0) return;
    const dt = Math.max(1, e.timeStamp - lastT);
    const speed = Math.hypot(cur.x - last.x, cur.y - last.y) / dt;
    theme = themeFor((e.target as Element | null)?.closest<HTMLElement>("[data-cursor-theme]")?.dataset.cursorTheme);
    for (const p of plan.points) spawn(p, plan.dir, speed);
    last = plan.anchor;
    lastT = e.timeStamp;
  };

  const onLeave = (e: MouseEvent) => {
    if (e.relatedTarget === null) hide();
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") endPress();
  };

  document.addEventListener("pointermove", onMove, { passive: true, capture: true });
  document.addEventListener("pointerdown", onDown, { passive: true, capture: true });
  document.addEventListener("pointerup", endPress, { passive: true, capture: true });
  document.addEventListener("pointercancel", endPress, { passive: true, capture: true });
  document.addEventListener("mouseout", onLeave, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("blur", endPress);

  // Idle preload (§16): never at critical priority, never before the page is idle.
  const preload = () => allTrailSrcs().forEach((src) => Object.assign(new Image(), { src }));
  const idle: number =
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(preload)
      : window.setTimeout(preload, 1000);

  return () => {
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    window.clearTimeout(idle);
    cancelAnimationFrame(raf);
    document.removeEventListener("pointermove", onMove, true);
    document.removeEventListener("pointerdown", onDown, true);
    document.removeEventListener("pointerup", endPress, true);
    document.removeEventListener("pointercancel", endPress, true);
    document.removeEventListener("mouseout", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("blur", endPress);
    endPress();
    for (const item of active.splice(0)) item.anim.cancel();
    html.classList.remove("has-custom-cursor");
    root.remove();
    layer.remove();
  };
}
