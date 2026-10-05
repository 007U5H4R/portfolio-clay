/** WebGL availability probe (gummy-bear.md §43; EVAL-030: headless swiftshader may have none). */
export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    const ok = gl !== null;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
