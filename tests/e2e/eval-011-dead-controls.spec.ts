/**
 * eval-011-dead-controls.spec.ts (technical-plan.md §B S10.02, `@EVAL-011`).
 *
 * The dead-control crawler gate. One worker (pinned to the w1440 project) drives its own 390 and
 * 1440 contexts so exactly one process writes the `.eval/dead-controls.json` report — the crawler
 * already sweeps both widths itself, so pinning avoids four parallel workers racing on one file.
 * For every public route it enumerates visible controls (the header tabs included at 390), and asserts
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
  // TASK-116: the Portfolio carousel adds 14 live controls per width on /projects (12 tabs + 2 arrows; TASK-124),
  // each clicked and observed for 500 ms — ≈ 12 s more per width; the old 180 s budget ran out at w1440.
  test.setTimeout(300_000);
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
      // No menu pass since TASK-112: every nav tab is a header link at every width, so the page crawl
      // above already covers them.
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

test(
  "@EVAL-011 crawler regression: hash-only replaceState is not mistaken for a navigation",
  { tag: "@EVAL-011" },
  async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "w1440", "self-test runs once");
    // A genuine prior navigation must exist in history — this mirrors the crawler visiting a route
    // via page.goto() before clicking any control. Without it, a wrongly-triggered goBack() has
    // nowhere real to pop to; WITH it, an errant goBack() pops back to this navigation, exactly the
    // /about corruption EVAL-011 hit: TimelineNode's `history.replaceState`-driven hash sync
    // (components/timeline/ExperienceTimeline.tsx) was misread as a navigation, goBack() popped the
    // crawler's own prior real navigation, and every ElementHandle still queued on the page died.
    await page.goto("/");
    await page.evaluate(() => {
      const hashBtn = document.createElement("button");
      hashBtn.id = "hash-sync";
      hashBtn.setAttribute("aria-expanded", "false");
      hashBtn.textContent = "Hash sync";
      hashBtn.onclick = () => {
        hashBtn.setAttribute("aria-expanded", "true");
        history.replaceState(null, "", location.pathname + location.search + "#deep-link");
      };
      document.body.appendChild(hashBtn);

      const liveBtn = document.createElement("button");
      liveBtn.id = "live-after";
      liveBtn.textContent = "Live after";
      liveBtn.onclick = () => liveBtn.setAttribute("aria-pressed", "true");
      document.body.appendChild(liveBtn);
    });

    const pathBefore = new URL(page.url()).pathname;
    const hashHandle = await page.$("#hash-sync");
    if (!hashHandle) throw new Error("fixture hash button not found");

    const hashEffect = await observeButtonEffect(page, hashHandle);
    expect(
      hashEffect.changed,
      `a hash-only replaceState should still register as an observable change (${hashEffect.how})`,
    ).toBe(true);

    // The bug: observeButtonEffect used to call page.goBack() whenever location.href changed at
    // all, including a hash-only replaceState — popping the crawler's own prior real navigation.
    expect(
      new URL(page.url()).pathname,
      "a hash-only replaceState must not trigger a goBack() navigation",
    ).toBe(pathBefore);

    // A control queried after the hash-sync click must still be evaluable — if goBack() had fired,
    // the execution context would be destroyed and this would throw ("classify threw: Execution
    // context was destroyed"), exactly the fabricated dead control EVAL-011 reported on /about.
    const liveHandle = await page.$("#live-after");
    if (!liveHandle) throw new Error("fixture live button not found — execution context was likely destroyed");
    const liveEffect = await observeButtonEffect(page, liveHandle);
    expect(liveEffect.changed, `a control queried after a hash-sync click must still work (${liveEffect.how})`).toBe(
      true,
    );
  },
);
