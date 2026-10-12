/**
 * analytics.spec.ts (TASK-194) — Mixpanel analytics in a real browser.
 *
 * Two builds are exercised:
 *   1. The normal build (no token, the baseURL server): analytics must be a complete no-op — zero requests
 *      to any Mixpanel host, no analytics code shipped — and the CSP must still block every other
 *      third-party host.
 *   2. The fixture build (`pnpm build:analytics-fixture` → `.next-analytics`, a STUB token inlined): the key
 *      conversions fire once with the right properties. Every request to Mixpanel is intercepted with
 *      `page.route`; nothing leaves the machine. This spec starts that build's server itself on a free port.
 *      Part 2 SKIPs (loudly) if the fixture build has not been made.
 */
import { existsSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import type { Page, Request, Route } from "@playwright/test";
import { test, expect } from "./fixtures";

const MIXPANEL = /(^|\.)(mixpanel\.com|mxpnl\.com)$/i;
const MIXPANEL_ROUTE = /^https:\/\/api(-eu|-in)?(-js)?\.mixpanel\.com\//;
const FIXTURE_DIR = ".next-analytics";
const HAS_FIXTURE = existsSync(`${FIXTURE_DIR}/BUILD_ID`);

interface MpEvent {
  event: string;
  properties: Record<string, unknown>;
}

function isMixpanelUrl(url: string): boolean {
  try {
    return MIXPANEL.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Decode a Mixpanel /track request (form field `data`: JSON, or base64 JSON, array or object) into events. */
function decode(req: Request): MpEvent[] {
  const body = req.postData() ?? "";
  const data = new URLSearchParams(body).get("data") ?? new URL(req.url()).searchParams.get("data");
  if (!data) return [];
  try {
    const text = /^\s*[[{]/.test(data) ? data : Buffer.from(data, "base64").toString("utf8");
    const parsed = JSON.parse(text) as MpEvent | MpEvent[];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

/** Intercept Mixpanel for a page: fulfil every call and collect decoded events plus the raw requests. */
async function captureMixpanel(page: Page) {
  const events: MpEvent[] = [];
  const raw: Array<{ url: string; body: string }> = [];
  await page.route(MIXPANEL_ROUTE, async (route: Route) => {
    const req = route.request();
    // The SDK posts with credentials, so the response must echo the origin (not "*") like Mixpanel's does.
    const cors = { "access-control-allow-origin": req.headers()["origin"] ?? "*", "access-control-allow-credentials": "true", "access-control-allow-headers": "*" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    raw.push({ url: req.url(), body: req.postData() ?? "" });
    events.push(...decode(req));
    return route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "1" });
  });
  return {
    events,
    raw,
    named: (name: string) => events.filter((e) => e.event === name),
    names: () => events.map((e) => e.event),
  };
}
type Capture = Awaited<ReturnType<typeof captureMixpanel>>;

/** Wait until at least `n` events called `name` have arrived (batches flush every 2 s). */
async function expectEvents(cap: Capture, name: string, n = 1, timeout = 12_000) {
  await expect.poll(() => cap.named(name).length, { timeout, message: `waiting for ${name}` }).toBeGreaterThanOrEqual(n);
}
/** Give a batch time to flush, then assert exactly `n`. */
async function expectExactly(cap: Capture, name: string, n: number) {
  await expectEvents(cap, name, n);
  await new Promise((r) => setTimeout(r, 2600)); // one more flush interval: a duplicate would arrive in it
  expect(cap.named(name), `${name} count`).toHaveLength(n);
}

// ===================================================================================================
// 1. No token → complete no-op, and the CSP still holds
// ===================================================================================================
test.describe("analytics without a token (TASK-194)", () => {
  test("zero requests to Mixpanel, no analytics code, no console errors, across pages and interactions", async ({ page, consoleErrors }) => {
    void consoleErrors;
    const mixpanelRequests: string[] = [];
    const scripts: string[] = [];
    page.on("request", (req) => {
      if (isMixpanelUrl(req.url())) mixpanelRequests.push(req.url());
    });
    page.on("response", (res) => {
      if (res.request().resourceType() === "script") scripts.push(res.url());
    });

    for (const path of ["/", "/projects", "/contact"]) {
      await page.goto(path, { waitUntil: "load" });
      await page.mouse.wheel(0, 1600);
      await page.waitForTimeout(700);
    }
    await page.locator("[data-theme-toggle]").first().click();
    await page.locator("button.header-ask").click();
    await expect(page.locator("dialog.ask-panel[open]")).toBeVisible();
    await page.waitForTimeout(5000); // longer than the idle-load timeout: it must still not have loaded anything

    expect(mixpanelRequests).toEqual([]);
    // No script on any page carries the SDK or its endpoint (the lazy chunk is not even emitted without a
    // token). Case-study copy may say "Mixpanel" in prose, so match the SDK's own markers, not the word.
    const offenders: string[] = [];
    for (const url of new Set(scripts)) {
      const body = await (await page.request.get(url)).text();
      if (/api-js\.mixpanel\.com|api-eu\.mixpanel\.com|mp_lib|\$device_id|__ptMixpanel/.test(body)) offenders.push(url);
    }
    expect(offenders).toEqual([]);
    await expect(page.locator("[data-analytics-sentinels]")).toHaveCount(0);
  });

  test("the CSP header adds no Mixpanel host and the browser blocks every other third party", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "load" });
    const csp = response!.headers()["content-security-policy"]!;
    expect(csp).not.toMatch(/mixpanel|mxpnl/i);
    expect(csp).toContain("connect-src 'self';");

    const violations = await page.evaluate(async () => {
      const seen: string[] = [];
      document.addEventListener("securitypolicyviolation", (e) => seen.push(`${e.violatedDirective}|${e.blockedURI}`));
      const attempts: Array<Promise<unknown>> = [];
      for (const host of ["https://api-js.mixpanel.com/track", "https://example.com/x", "https://www.google-analytics.com/collect", "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"]) {
        attempts.push(fetch(host, { mode: "no-cors" }).catch(() => "blocked"));
      }
      const script = document.createElement("script");
      script.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
      document.head.appendChild(script);
      const img = new Image();
      img.src = "https://example.com/pixel.gif";
      await Promise.all(attempts);
      await new Promise((r) => setTimeout(r, 400));
      return seen;
    });
    const directives = new Set(violations.map((v) => v.split("|")[0]));
    expect(violations.some((v) => v.includes("api-js.mixpanel.com"))).toBe(true);
    expect(violations.some((v) => v.includes("example.com/x"))).toBe(true);
    expect(violations.some((v) => v.includes("google-analytics.com"))).toBe(true);
    expect(violations.some((v) => v.includes("cdn.mxpnl.com"))).toBe(true);
    expect([...directives].every((d) => d === "connect-src" || d === "script-src-elem" || d === "script-src" || d === "img-src")).toBe(true);
  });
});

// ===================================================================================================
// 2. Stub token → events fire once with the right properties
// ===================================================================================================
test.describe("analytics with a stub token (TASK-194)", () => {
  test.skip(!HAS_FIXTURE, `${FIXTURE_DIR} is missing — run \`pnpm build:analytics-fixture\` first`);
  test.describe.configure({ mode: "serial" });

  let server: ChildProcess | undefined;
  let origin = "";

  test.beforeAll(async () => {
    if (!HAS_FIXTURE) return;
    const port = await new Promise<number>((resolve, reject) => {
      const probe = createServer();
      probe.listen(0, "127.0.0.1", () => {
        const { port: p } = probe.address() as { port: number };
        probe.close(() => resolve(p));
      });
      probe.on("error", reject);
    });
    origin = `http://127.0.0.1:${port}`;
    server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
      env: { ...process.env, NEXT_DIST_DIR: FIXTURE_DIR },
      stdio: "ignore",
    });
    const deadline = Date.now() + 60_000;
    for (;;) {
      try {
        if ((await fetch(origin)).ok) break;
      } catch {
        /* not up yet */
      }
      if (Date.now() > deadline) throw new Error("analytics fixture server did not start");
      await new Promise((r) => setTimeout(r, 400));
    }
  });
  test.afterAll(() => {
    server?.kill();
  });

  /** The page uses Lenis smooth scrolling: wait until the element has stopped moving inside the viewport before a real click. */
  async function settled(page: Page, selector: string) {
    const el = page.locator(selector).first();
    await el.scrollIntoViewIfNeeded();
    let last = "";
    await expect
      .poll(async () => {
        const box = await el.boundingBox();
        const now = box ? `${Math.round(box.x)},${Math.round(box.y)}` : "";
        const stable = now === last && box !== null && box.y >= 0 && box.y < page.viewportSize()!.height;
        last = now;
        return stable;
      }, { intervals: [200, 200, 300, 300, 400, 400, 500], timeout: 10_000 })
      .toBe(true);
    return el;
  }

  const go = (page: Page, path: string) => page.goto(`${origin}${path}`, { waitUntil: "load" });
  const widthOf = (page: Page) => page.viewportSize()!.width;

  /** External destinations must never be reached; fulfil them blank so a click can complete. */
  async function blockExternal(page: Page) {
    await page.context().route(/^https:\/\/(drive\.google\.com|www\.linkedin\.com|github\.com)\//, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>external</title>" }));
  }

  test("a page view carries the canonical page, the visitor/session type and only privacy-safe context", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/projects?product=nuptis#details");
    await expectExactly(cap, "page_viewed", 1);
    const [view] = cap.named("page_viewed");
    expect(view!.properties).toMatchObject({
      page_name: "portfolio",
      page_path: "/projects",
      navigation_type: "direct",
      is_landing: true,
      session_type: "new",
      environment: "development",
      schema_version: 1,
      device_type: widthOf(page) < 768 ? "mobile" : widthOf(page) < 1024 ? "tablet" : "desktop",
    });
    // The SDK's own capture of the full URL / referrer is switched off; no query, fragment or IP leaves.
    const all = JSON.stringify(cap.events) + cap.raw.map((r) => r.url).join(" ");
    expect(all).not.toMatch(/nuptis|details|\$current_url|\$referrer|product=/);
    for (const e of cap.events) {
      expect(e.properties).not.toHaveProperty("$current_url");
      expect(e.properties).not.toHaveProperty("$referrer");
    }
    expect(cap.raw.every((r) => /[?&]ip=0\b/.test(r.url))).toBe(true);
    expect(cap.raw.every((r) => r.url.startsWith("https://api-js.mixpanel.com/"))).toBe(true);
  });

  test("campaign tags are attributed after sanitising; every other query value is dropped", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/?utm_source=LinkedIn&utm_medium=social&utm_campaign=launch&token=SECRET123&email=a@b.co&code=OAUTHCODE#frag");
    await expectEvents(cap, "page_viewed");
    await expect.poll(() => cap.events.some((e) => e.properties.utm_source === "linkedin")).toBe(true);
    const view = cap.named("page_viewed")[0]!;
    expect(view.properties).toMatchObject({ utm_source: "linkedin", utm_medium: "social", utm_campaign: "launch" });
    const everything = JSON.stringify(cap.events) + cap.raw.map((r) => r.url + r.body).join(" ");
    expect(everything).not.toMatch(/SECRET123|OAUTHCODE|a@b\.co|frag/);
  });

  test("a client-side navigation is exactly one more page_viewed", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/");
    await expectEvents(cap, "page_viewed");
    const link = page.locator('[data-site-header] a[href="/about"]').first();
    await link.click();
    await page.waitForURL("**/about");
    await expectEvents(cap, "page_viewed", 2);
    await new Promise((r) => setTimeout(r, 2600));
    const views = cap.named("page_viewed");
    expect(views).toHaveLength(2);
    expect(views[1]!.properties).toMatchObject({ page_name: "about", page_path: "/about", navigation_type: "client_navigation", is_landing: false });
    expect(cap.named("navigation_clicked")).toHaveLength(1);
    expect(cap.named("navigation_clicked")[0]!.properties).toMatchObject({ destination: "/about", navigation_location: "header" });
  });

  test("scroll depth and sections: each milestone and each section once per page view", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/about");
    await page.waitForTimeout(1200); // sentinels are placed ~0.6 s after the page view
    for (let i = 0; i < 12; i += 1) {
      await page.mouse.wheel(0, 1400);
      await page.waitForTimeout(250);
    }
    await expectEvents(cap, "scroll_depth_reached", 4);
    await new Promise((r) => setTimeout(r, 2600));
    const depths = cap.named("scroll_depth_reached").map((e) => e.properties.depth_percent);
    expect(depths.sort((a, b) => Number(a) - Number(b))).toEqual([25, 50, 75, 90]);
    const sections = cap.named("section_viewed").map((e) => e.properties.section_name);
    expect(sections.length).toBeGreaterThan(0);
    expect(new Set(sections).size).toBe(sections.length);
    expect(cap.named("section_viewed")[0]!.properties).toMatchObject({ page_name: "about" });
  });

  test("conversions on /contact: résumé, LinkedIn and email each fire once with the right properties, and links still work", async ({ page }) => {
    await blockExternal(page);
    const cap = await captureMixpanel(page);
    await go(page, "/contact");
    await expectEvents(cap, "page_viewed");

    const resume = page.locator("#resume");
    await expect(resume).toHaveAttribute("href", /drive\.google\.com/);
    const [resumePopup] = await Promise.all([page.waitForEvent("popup"), resume.click()]);
    await resumePopup.close();
    const [linkedinPopup] = await Promise.all([page.waitForEvent("popup"), page.locator('[data-link="linkedin"]').click()]);
    await linkedinPopup.close();
    // A mailto link: the browser has nothing to open in headless mode; the click is still delivered.
    await page.locator('a[href^="mailto:"]').first().click({ noWaitAfter: true });

    await expectExactly(cap, "resume_opened", 1);
    await expectExactly(cap, "linkedin_profile_clicked", 1);
    await expectExactly(cap, "email_contact_clicked", 1);
    expect(cap.named("resume_opened")[0]!.properties).toMatchObject({ cta_location: "contact_page", open_method: "external_viewer" });
    expect(cap.named("linkedin_profile_clicked")[0]!.properties).toMatchObject({ cta_location: "contact_page" });
    expect(cap.named("email_contact_clicked")[0]!.properties).toMatchObject({ cta_location: "contact_page" });
    const cta = cap.named("professional_cta_clicked").map((e) => `${e.properties.cta_type}:${e.properties.destination_type}`).sort();
    expect(cta).toEqual(["email:email_client", "linkedin:external_profile", "resume:external_document"]);
    const outbound = cap.named("outbound_link_clicked").map((e) => `${e.properties.link_type}@${e.properties.destination_domain}`).sort();
    expect(outbound).toEqual(["linkedin@linkedin.com", "resume@drive.google.com"]);
    // No address, file id or profile path anywhere.
    const everything = JSON.stringify(cap.events);
    expect(everything).not.toMatch(/@outlook|1hqDF4|pathaktushar|mailto/i);
  });

  test("footer résumé and LinkedIn on the home page are placed in the footer", async ({ page }) => {
    await blockExternal(page);
    const cap = await captureMixpanel(page);
    await go(page, "/");
    await expectEvents(cap, "page_viewed");
    const footer = page.locator("footer.band");
    await footer.scrollIntoViewIfNeeded();
    const [popup] = await Promise.all([page.waitForEvent("popup"), footer.locator('a[aria-label="LinkedIn"]').click()]);
    await popup.close();
    await expectExactly(cap, "linkedin_profile_clicked", 1);
    expect(cap.named("linkedin_profile_clicked")[0]!.properties).toMatchObject({ cta_location: "footer" });
  });

  test("project selection: arrows, keyboard and a direct tap are tracked; init and re-selecting the active project are not", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/projects");
    await expectEvents(cap, "page_viewed");
    await page.waitForSelector("html[data-gummy-trigger='ready']");
    expect(cap.named("project_selected")).toHaveLength(0);

    const active = () => page.locator(".pf-feature").getAttribute("data-active-product");
    const first = await active();
    await page.locator('button.pf-arrow[data-dir="next"]').click();
    const second = await active();
    expect(second).not.toBe(first);

    await page.locator(`.pf-thumb[aria-selected="true"]`).focus();
    await page.keyboard.press("ArrowRight");
    const third = await active();
    expect(third).not.toBe(second);

    const target = await settled(page, `.pf-thumb[data-product]:not([aria-selected="true"])`);
    const targetId = await target.getAttribute("data-product");
    await target.click();
    await expect(page.locator(".pf-feature")).toHaveAttribute("data-active-product", targetId!);

    // Re-selecting the project that is already active is not a selection.
    await page.locator(`.pf-thumb[aria-selected="true"]`).click();

    await expectEvents(cap, "project_selected", 3);
    await new Promise((r) => setTimeout(r, 2600));
    const selected = cap.named("project_selected").map((e) => e.properties);
    expect(selected).toEqual([
      { project_id: second, selection_method: "arrow" },
      { project_id: third, selection_method: "keyboard" },
      { project_id: targetId, selection_method: "direct_selection" },
    ].map((p) => expect.objectContaining(p)));
    expect(selected).toHaveLength(3);
    expect(cap.named("project_carousel_viewed")).toHaveLength(1);
    expect(cap.named("project_carousel_viewed")[0]!.properties).toMatchObject({ page_name: "portfolio" });
  });

  test("the product sheet: pitch/demo switches and the case-study link are project assets, with stable ids", async ({ page }) => {
    await blockExternal(page);
    const cap = await captureMixpanel(page);
    await go(page, "/projects");
    await expectEvents(cap, "page_viewed");
    const id = (await page.locator(".pf-feature").getAttribute("data-active-product"))!;
    const demo = page.locator('.pf-info [data-action="demo"]');
    if (await demo.count()) {
      await demo.click();
      await expectExactly(cap, "project_asset_opened", 1);
      expect(cap.named("project_asset_opened")[0]!.properties).toEqual(expect.objectContaining({ project_id: id, asset_type: "demo_video" }));
    }
    const github = page.locator('.pf-info a[data-action="github"], .pf-info a[data-action="product"]').first();
    if (await github.count()) {
      const [popup] = await Promise.all([page.waitForEvent("popup"), github.click()]);
      await popup.close();
      await expectEvents(cap, "product_link_clicked");
      expect(cap.named("product_link_clicked")[0]!.properties).toEqual(expect.objectContaining({ project_id: id }));
      expect(String(cap.named("product_link_clicked")[0]!.properties.destination_domain)).not.toContain("/");
    }
  });

  test.describe("project video (a stubbed YouTube player speaks the real postMessage protocol)", () => {
    /** Serves a fake privacy-enhanced embed that answers the parent's handshake and plays on a script. */
    async function stubPlayer(page: Page, script: string) {
      await page.route(/^https:\/\/www\.youtube-nocookie\.com\/embed\//, (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: `<!doctype html><title>stub</title><script>
            const send = (event, info) => parent.postMessage(JSON.stringify({ event, info }), "*");
            let started = false;
            addEventListener("message", (e) => {
              let m; try { m = JSON.parse(e.data); } catch { return; }
              if (m.event === "listening" && !started) { started = true; send("onReady"); send("initialDelivery", { playerState: -1, duration: 20 }); (${script})(send); }
            });
          </script>`,
        }),
      );
    }
    const pressPlay = async (page: Page) => {
      await go(page, "/projects");
      await page.waitForSelector("html[data-gummy-trigger='ready']");
      await page.locator("button.pf-play").click();
      await expect(page.locator(".pf-stage-screen")).toHaveAttribute("data-player-state", "ready", { timeout: 15_000 });
    };

    test("started + 25/50/75/100 once each, only after the player reports playback", async ({ page }) => {
      await stubPlayer(page, `(send) => {
        // Playback is only reported 1.5 s after the viewer pressed Play (a slow start).
        setTimeout(() => {
          send("infoDelivery", { playerState: 1, currentTime: 0, duration: 20 });
          let t = 0;
          const timer = setInterval(() => {
            t += 0.5; // 5x time-lapse: 0.5 s of video per 100 ms
            send("infoDelivery", { currentTime: t });
            if (t >= 20) { clearInterval(timer); send("infoDelivery", { playerState: 0, currentTime: 20 }); }
          }, 100);
        }, 1500);
      }`);
      const cap = await captureMixpanel(page);
      await pressPlay(page);
      const id = (await page.locator(".pf-feature").getAttribute("data-active-product"))!;
      await expectEvents(cap, "project_video_progressed", 4, 25_000);
      await new Promise((r) => setTimeout(r, 2600));
      expect(cap.named("project_video_started")).toHaveLength(1);
      expect(cap.named("project_video_started")[0]!.properties).toEqual(expect.objectContaining({ project_id: id, video_type: "pitch" }));
      expect(cap.named("project_video_progressed").map((e) => e.properties.progress_percent)).toEqual([25, 50, 75, 100]);
      // Ordering: the start precedes every milestone.
      expect(cap.names().indexOf("project_video_started")).toBeLessThan(cap.names().indexOf("project_video_progressed"));
    });

    test("pressing Play alone is not a start: a player that never plays reports nothing", async ({ page }) => {
      await stubPlayer(page, `() => {}`);
      const cap = await captureMixpanel(page);
      await pressPlay(page);
      await page.waitForTimeout(5000);
      expect(cap.named("project_video_started")).toHaveLength(0);
      expect(cap.named("project_video_progressed")).toHaveLength(0);
    });

    test("a seek to the end is not a completion", async ({ page }) => {
      await stubPlayer(page, `(send) => {
        send("infoDelivery", { playerState: 1, currentTime: 0, duration: 20 });
        setTimeout(() => send("infoDelivery", { currentTime: 19.9 }), 500);
        setTimeout(() => send("infoDelivery", { playerState: 0, currentTime: 20 }), 900);
      }`);
      const cap = await captureMixpanel(page);
      await pressPlay(page);
      await expectEvents(cap, "project_video_started");
      await new Promise((r) => setTimeout(r, 3000));
      expect(cap.named("project_video_progressed")).toHaveLength(0);
    });
  });

  test("Ask Tushky: open, prompt, typed message, response, source link and close — and never a word of the conversation", async ({ page }) => {
    await blockExternal(page);
    const cap = await captureMixpanel(page);
    await go(page, "/");
    await expectEvents(cap, "page_viewed");

    await page.locator("button.header-ask").click();
    await expect(page.locator("dialog.ask-panel[open]")).toBeVisible();
    await expectEvents(cap, "chatbot_opened");
    expect(cap.named("chatbot_opened")[0]!.properties).toMatchObject({ entry_point: "header_button" });

    const suggestion = page.locator(".tk-card").first();
    const suggestionText = (await suggestion.innerText()).trim();
    await suggestion.click();
    await expect(page.locator('[data-role="tushky"][data-msg="answer"], [data-role="tushky"][data-msg="empty"]').first()).toBeVisible({ timeout: 15_000 });

    const secret = "my salary expectations for jane.doe@example.com are confidential";
    await page.locator("#ask-panel-input").fill(secret);
    await page.locator("button.tk-send").click();
    await expect(page.locator('[data-role="tushky"]:not([data-msg="loading"])')).toHaveCount(2, { timeout: 15_000 });

    const source = page.locator(".tk-source").first();
    if (await source.count()) {
      const [popup] = await Promise.all([page.waitForEvent("popup"), source.click()]);
      await popup.close();
    }
    await page.locator("button.tk-close").click();
    await expectEvents(cap, "chatbot_closed");
    await new Promise((r) => setTimeout(r, 2600));

    expect(cap.named("chatbot_prompt_selected")).toHaveLength(1);
    expect(["projects", "experience", "ai_product_management", "cloud_architecture", "contact", "other"]).toContain(cap.named("chatbot_prompt_selected")[0]!.properties.prompt_category);
    expect(cap.named("chatbot_message_sent")).toHaveLength(1);
    expect(cap.named("chatbot_message_sent")[0]!.properties.message_category).toBeDefined();
    const responses = cap.named("chatbot_response_received");
    expect(responses).toHaveLength(2);
    for (const r of responses) {
      expect(["answered_faq", "answered_index", "no_match"]).toContain(r.properties.response_status);
      expect(typeof r.properties.latency_ms).toBe("number");
    }
    expect(cap.named("chatbot_closed")[0]!.properties).toMatchObject({ session_message_count: 2 });
    if (cap.named("chatbot_cta_clicked").length) expect(cap.named("chatbot_cta_clicked")).toHaveLength(1);

    // The privacy line: neither the typed message, the suggestion text nor any answer is in anything sent.
    const everything = JSON.stringify(cap.events) + cap.raw.map((r) => decodeURIComponent(r.url + r.body)).join(" ");
    expect(everything).not.toMatch(/salary|jane\.doe|example\.com|confidential/i);
    expect(everything).not.toContain(suggestionText);
  });

  test("the theme switch is tracked once per press; the initial theme and a system flip are not", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await go(page, "/");
    await expectEvents(cap, "page_viewed");
    await page.emulateMedia({ colorScheme: "light" }); // a system flip while following the system
    await page.waitForTimeout(500);
    expect(cap.named("theme_changed")).toHaveLength(0);

    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator("[data-theme-toggle]").first().click();
    await expectExactly(cap, "theme_changed", 1);
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(after).not.toBe(before);
    expect(cap.named("theme_changed")[0]!.properties).toMatchObject({ theme_from: before, theme_to: after });
  });

  test("Gummy Lab: the five-click trigger is tracked as discovery, then the Lab's own page and intro", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/");
    await expectEvents(cap, "page_viewed");
    await page.waitForSelector("html[data-gummy-trigger='ready']");
    for (let i = 0; i < 5; i += 1) {
      const box = (await page.locator("[data-site-header] .header-brand").first().boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 10 });
      if (i < 4) await page.waitForTimeout(70);
    }
    await page.waitForURL("**/lab", { timeout: 20_000 });
    await expectEvents(cap, "easter_egg_discovered");
    expect(cap.named("easter_egg_discovered")[0]!.properties).toEqual(expect.objectContaining({ trigger_type: "brand_click_sequence" }));
    await expect.poll(() => cap.named("page_viewed").some((e) => e.properties.page_name === "gummy_lab"), { timeout: 20_000 }).toBe(true);
    await page.waitForSelector("[data-lab]:not([data-lab='loading'])", { timeout: 30_000 });
    // The intro appears once the canvas (or fallback) is up; WebGL availability varies by host.
    await page.waitForTimeout(1500);
    const lab = await page.locator("[data-lab]").getAttribute("data-lab");
    if (lab === "canvas") {
      await expectEvents(cap, "game_intro_viewed", 1, 20_000);
      expect(cap.named("game_intro_viewed")[0]!.properties).toMatchObject({ game_version: "pinball_v1" });
    }
    await page.keyboard.press("Escape");
    await expectEvents(cap, "game_exited_to_portfolio", 1, 20_000);
    expect(cap.named("game_exited_to_portfolio")).toHaveLength(1);
    expect(cap.named("easter_egg_discovered")).toHaveLength(1);
  });

  test.describe("privacy switches: nothing is requested at all", () => {
    for (const [label, init, path] of [
      ["Do Not Track", `Object.defineProperty(navigator, "doNotTrack", { get: () => "1" })`, "/"],
      ["Global Privacy Control", `Object.defineProperty(navigator, "globalPrivacyControl", { get: () => true })`, "/"],
      ["?analytics=off", `void 0`, "/?analytics=off"],
    ] as const) {
      test(label, async ({ page }) => {
        const requests: string[] = [];
        page.on("request", (req) => {
          if (isMixpanelUrl(req.url())) requests.push(req.url());
        });
        const cap = await captureMixpanel(page);
        await page.addInitScript(init);
        await go(page, path);
        await page.locator("[data-theme-toggle]").first().click();
        await page.waitForTimeout(6500);
        expect(requests).toEqual([]);
        expect(cap.events).toEqual([]);
        if (label === "?analytics=off") {
          // The opt-out persists: a later visit without the parameter is still silent.
          await go(page, "/about");
          await page.waitForTimeout(5500);
          expect(requests).toEqual([]);
        }
      });
    }
  });

  test("the SDK loads after the page has loaded, never on the critical path", async ({ page }) => {
    const cap = await captureMixpanel(page);
    let loaded = false;
    page.on("load", () => {
      loaded = true;
    });
    const early: string[] = [];
    page.on("response", (res) => {
      if (res.request().resourceType() === "script" && !loaded) early.push(res.url());
    });
    await go(page, "/");
    await expectEvents(cap, "page_viewed");
    const bodies = await Promise.all(early.map(async (url) => ((await (await page.request.get(url)).text()).includes("api-js.mixpanel.com") ? url : null)));
    expect(bodies.filter(Boolean)).toEqual([]); // no script that carries the Mixpanel endpoint was fetched before `load`
  });

  test("blocked or failing Mixpanel requests never break the site", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route(MIXPANEL_ROUTE, (route) => route.abort("blockedbyclient"));
    await go(page, "/");
    await page.waitForTimeout(3000);
    await page.locator('[data-site-header] a[href="/about"]').first().click();
    await page.waitForURL("**/about");
    await page.locator("button.header-ask").click();
    await expect(page.locator("dialog.ask-panel[open]")).toBeVisible();
    await page.locator("#ask-panel-input").fill("what has he built");
    await page.locator("button.tk-send").click();
    await expect(page.locator('[data-role="tushky"]:not([data-msg="loading"])').first()).toBeVisible({ timeout: 15_000 });
    expect(errors).toEqual([]);
  });

  test("a case-study page view also reports case_study_viewed with an honest entry point", async ({ page }) => {
    const cap = await captureMixpanel(page);
    await go(page, "/work/teachspark");
    await expectEvents(cap, "case_study_viewed");
    expect(cap.named("case_study_viewed")[0]!.properties).toMatchObject({ project_id: "teachspark", entry_point: "external_or_direct" });
    await expectExactly(cap, "case_study_viewed", 1);
  });
});
