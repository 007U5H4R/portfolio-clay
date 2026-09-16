/**
 * eval-011-dead-controls.spec.ts (technical-plan.md §B S10.02, `@EVAL-011`).
 *
 * The dead-control crawler gate. One worker (pinned to the w1440 project) drives its own 390 and
 * 1440 contexts so exactly one process writes the `.eval/dead-controls.json` report — the crawler
 * already sweeps both widths itself, so pinning avoids four parallel workers racing on one file.
 * For every public route it enumerates visible controls, opens the MobileMenu at 390, and asserts
 * ZERO dead controls (WARN — external bot-blocks, not-yet-built routes — is allowed and recorded).
 *
 * A second test is the crawler self-test the S10.01 gate requires: a fixture page with one live and
 * one dead button, asserting the crawler reports exactly the dead one.
 */
import { test, expect } from "./fixtures";
import { STATIC_ROUTES } from "./routes";
import {
  crawlControls,
  dedupeKey,
  loadAllowlist,
  observeButtonEffect,
  resetCache,
  type ControlResult,
} from "./crawler";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";

function table(results: ControlResult[]): string {
  const rows = results.map(
    (r) =>
      `  ${r.verdict.toUpperCase().padEnd(4)} ${String(r.route).padEnd(18)} ${String(r.width).padEnd(5)} ${r.kind.padEnd(15)} ${(r.name || "—").padEnd(24)} ${r.detail}`,
  );
  return ["  VERDICT ROUTE              WIDTH KIND            NAME                     DETAIL", ...rows].join("\n");
}

test("@EVAL-011 no dead controls on any public route (390 + 1440)", { tag: "@EVAL-011" }, async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "w1440",
    "the crawler drives its own 390/1440 contexts — pin to one project so one file is written",
  );
  test.setTimeout(180_000);
  resetCache();
  const allowlist = loadAllowlist();
  const widths = [390, 1440] as const;
  const all: ControlResult[] = [];

  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      isMobile: width === 390,
      hasTouch: width === 390,
    });
    const page = await context.newPage();
    for (const route of STATIC_ROUTES) {
      await page.goto(route, { waitUntil: "load" });
      const seen = new Set<string>();
      const push = (rs: ControlResult[]) => {
        for (const r of rs) {
          const key = dedupeKey(r);
          if (seen.has(key)) continue;
          seen.add(key);
          all.push(r);
        }
      };

      push(await crawlControls(page, { route, width, baseUrl: BASE_URL, allowlist }));

      // Open the MobileMenu at 390 and crawl the controls inside the dialog once. Links + disabled
      // controls are classified generically (buttonMode "skip"); the close button is verified
      // explicitly last, because clicking it closes the dialog and would detach the other handles.
      if (width === 390) {
        const hamburger = page.getByRole("button", { name: "Open menu" });
        if (await hamburger.isVisible().catch(() => false)) {
          await hamburger.click();
          await page.waitForSelector("dialog[open]", { timeout: 3000 }).catch(() => {});
          push(
            await crawlControls(page, {
              route,
              width,
              baseUrl: BASE_URL,
              allowlist,
              scope: "dialog[open]",
              buttonMode: "skip",
            }),
          );
          // Verify the dialog's close button by clicking it (this also closes the menu).
          const closeHandle = await page.$('dialog[open] button[aria-label="Close menu"]');
          if (closeHandle) {
            const eff = await observeButtonEffect(page, closeHandle);
            push([
              {
                route,
                width,
                kind: "button",
                name: "Close menu",
                target: 'dialog button[aria-label="Close menu"]',
                verdict: eff.changed ? "ok" : "dead",
                detail: eff.how,
              },
            ]);
            await closeHandle.dispose().catch(() => {});
          }
          // Ensure the menu is closed before the next route.
          if (await page.$("dialog[open]")) {
            await page.keyboard.press("Escape").catch(() => {});
            await page.waitForTimeout(150);
          }
        }
      }
    }
    await context.close();
  }

  const dead = all.filter((r) => r.verdict === "dead");
  const warn = all.filter((r) => r.verdict === "warn");
  const ok = all.filter((r) => r.verdict === "ok");

  mkdirSync(resolve(process.cwd(), ".eval"), { recursive: true });
  writeFileSync(
    resolve(process.cwd(), ".eval/dead-controls.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        routes: STATIC_ROUTES,
        widths,
        totals: { controls: all.length, ok: ok.length, warn: warn.length, dead: dead.length },
        dead,
        warn,
        controls: all,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.log(
    `\n[EVAL-011] ${all.length} controls · ${ok.length} ok · ${warn.length} warn · ${dead.length} dead`,
  );
  console.log(table([...dead, ...warn]));

  expect(dead, `dead controls found:\n${table(dead)}`).toEqual([]);
});

test("@EVAL-011 crawler self-test: a dead button is reported, a live one is not", { tag: "@EVAL-011" }, async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "w1440", "self-test runs once");
  await page.setContent(`
    <!doctype html><html><body>
      <button id="live" aria-expanded="false" onclick="this.setAttribute('aria-expanded','true')">Live toggle</button>
      <button id="dead" onclick="void 0">Dead button</button>
    </body></html>
  `);

  const live = await page.$("#live");
  const dead = await page.$("#dead");
  if (!live || !dead) throw new Error("fixture buttons not found");

  const liveEffect = await observeButtonEffect(page, live);
  const deadEffect = await observeButtonEffect(page, dead);

  expect(liveEffect.changed, `live button should register a change (${liveEffect.how})`).toBe(true);
  expect(deadEffect.changed, "dead button must be reported as no-change").toBe(false);
});
