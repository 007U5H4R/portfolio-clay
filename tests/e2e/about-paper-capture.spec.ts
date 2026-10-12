/**
 * TASK-196 — one-off baseline capture. Skipped unless ABOUT_BASELINE_OUT is set; it runs against the
 * pre-redesign build (main at ef4c36c) and writes the fingerprint per viewport width.
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { test } from "./fixtures";
import { fingerprint } from "./about-paper-lib";

test("capture the hero/footer baseline", async ({ page }) => {
  const out = process.env.ABOUT_BASELINE_OUT;
  test.skip(!out, "baseline capture only");
  const width = page.viewportSize()?.width ?? 0;
  const current = existsSync(out!) ? (JSON.parse(readFileSync(out!, "utf8")) as Record<string, unknown>) : {};
  current[String(width)] = await fingerprint(page);
  writeFileSync(out!, JSON.stringify(current, null, 2) + "\n");
});
