/**
 * eval-014.spec.ts (technical-plan.md §B S09.02, `@EVAL-014`) — DemoVideo state matrix (no-src,
 * valid, 404, throttled) plus the ≤4MB video / ≤120kB poster file-size assertions. The DemoVideo
 * component and its /dev/video fixtures do not exist yet (TKT-18), so every case is fixme'd here —
 * a real, tagged placeholder that appears in `--list` and flips to a live test when TKT-18 lands.
 * Never faked green.
 */
import { test } from "./fixtures";

test.fixme("@EVAL-014 DemoVideo: no-src → 'Demo coming' badge over poster (TKT-18)", {
  tag: "@EVAL-014",
}, async () => {});

test.fixme("@EVAL-014 DemoVideo: valid src plays, muted + playsInline, native controls (TKT-18)", {
  tag: "@EVAL-014",
}, async () => {});

test.fixme("@EVAL-014 DemoVideo: 404 / throttled src → 'View live →' fallback (TKT-18)", {
  tag: "@EVAL-014",
}, async () => {});

test.fixme("@EVAL-014 DemoVideo: no <video> before intent; preload=none after mount (TKT-18)", {
  tag: "@EVAL-014",
}, async () => {});

test.fixme("@EVAL-014 shipped videos ≤ 4MB and posters ≤ 120kB (TKT-22..27)", {
  tag: "@EVAL-014",
}, async () => {});
