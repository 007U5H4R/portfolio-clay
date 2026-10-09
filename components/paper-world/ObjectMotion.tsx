"use client";

import { useEffect, useRef } from "react";
import { paperMotion } from "@/lib/paper-world/motion";

/**
 * Object marker (M-012, TASK-181, Design.md §14.10): a hidden `<i>` whose parent is an interactive paper object,
 * registered with `paperMotion` while mounted so the shared pointer listener and spring loop can write `--hx` /
 * `--hy` on it while it is hovered. The parent gets `data-pm-obj`. Same shape as `SceneMotion`; it owns no
 * listeners, and server components that render it stay server components.
 */
export function ObjectMotion() {
  const marker = useRef<HTMLElement>(null);
  useEffect(() => {
    const object = marker.current?.parentElement;
    if (!object) return undefined;
    object.setAttribute("data-pm-obj", "");
    const unregister = paperMotion.registerObject(object);
    return () => {
      unregister();
      object.removeAttribute("data-pm-obj");
    };
  }, []);
  return <i ref={marker} hidden aria-hidden="true" />;
}
