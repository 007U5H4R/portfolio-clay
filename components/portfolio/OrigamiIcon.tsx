import type { OrigamiKey } from "./action-icons";

const BASE = "/media/illustrations/origami-icons";

/**
 * TASK-301: one origami action icon. Decorative (the button's label names the action), so `alt=""` + `aria-hidden`. The `width` / `height`
 * attributes reserve the nominal box; CSS (`.pf-action-icon[data-origami] img`, `.pf-m-btn .pf-origami`) sizes it per layout and takes it
 * out of the flow so the button never grows. The primary action uses the 256 px file, the others the 128 px one.
 */
export function OrigamiIcon({ name, primary }: { name: OrigamiKey; primary: boolean }) {
  const size = primary ? 36 : 26;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP
    <img
      className="pf-origami"
      src={`${BASE}/origami-${name}${primary ? "" : "-128"}.webp`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
      data-origami={name}
    />
  );
}
