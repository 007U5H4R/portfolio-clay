"use client";

import { useEffect, useRef } from "react";
import { paperMotion } from "@/lib/paper-world/motion";

/**
 * The scene's only client code (TASK-156.3): a hidden marker whose parent is the scene root, registered with
 * `paperMotion` while mounted. It renders nothing visible and owns no listeners itself.
 */
export function SceneMotion() {
  const marker = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = marker.current?.parentElement;
    return root ? paperMotion.register(root) : undefined;
  }, []);
  return <i ref={marker} hidden aria-hidden="true" />;
}
