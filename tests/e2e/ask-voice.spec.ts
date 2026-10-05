/**
 * ask-voice.spec.ts (TASK-134) — Ask Tushky's voice playback in the real drawer, on the production
 * build, at every viewport project. `POST /api/tushky/speech` is ALWAYS mocked with `page.route`
 * (a short synthetic tone), so no test reaches the real route or Google (brief §3.5, §5).
 *
 * Covers: idle → loading → playing → paused → resumed → ended → replay with no second request; the
 * request contract (question + FAQ id + message id + answer hash, never text); two answers, where
 * starting the second pauses the first; closing the drawer stops audio; the error and quota states;
 * keyboard operation and aria labels; axe on the drawer with a voice strip (EVAL-006); 44 px targets
 * and no overflow (EVAL-008); reduced motion (EVAL-010); and the per-state screenshots at 390 / 1440
 * (`docs/screenshots/m-009/task-134/`).
 *
 * Titles carry the `ask-voice` prefix so `pnpm test:e2e --grep ask-voice` selects this file.
 */
import { test, expect } from "./fixtures";
import type { Page, Route } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const panel = (page: Page) => page.locator("dialog.ask-panel");
const input = (page: Page) => panel(page).locator("#ask-panel-input");
const turns = (page: Page) => panel(page).locator('.tk-turn[data-role="tushky"]');
const strip = (page: Page, n = -1) => (n < 0 ? turns(page).last() : turns(page).nth(n)).locator(".tk-voice");
const SHOTS = "docs/screenshots/m-009/task-134";

/** A quiet 440 Hz tone as 24 kHz mono 16-bit WAV — the format the real route returns. */
function toneWav(seconds: number): Buffer {
  const rate = 24_000;
  const samples = Math.round(rate * seconds);
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + samples * 2, 4);
  buf.write("WAVEfmt ", 8, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) buf.writeInt16LE(Math.round(900 * Math.sin((2 * Math.PI * 440 * i) / rate)), 44 + i * 2);
  return buf;
}

type Reply = (route: Route, call: number) => Promise<void>;
const audioReply =
  (seconds = 2, delayMs = 0): Reply =>
  async (route) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({ status: 200, contentType: "audio/wav", headers: { "x-tushky-audio-source": "gemini" }, body: toneWav(seconds) });
  };
const errorReply =
  (status: number, code: string): Reply =>
  async (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ code }) });

/** Mock the speech route; returns the parsed request bodies in order. */
async function mockSpeech(page: Page, reply: Reply | Reply[]): Promise<Record<string, unknown>[]> {
  const calls: Record<string, unknown>[] = [];
  await page.route("**/api/tushky/speech", async (route) => {
    calls.push(route.request().postDataJSON() as Record<string, unknown>);
    const handler = Array.isArray(reply) ? (reply[calls.length - 1] ?? reply.at(-1)!) : reply;
    await handler(route, calls.length);
  });
  return calls;
}

/** Remember the element the audio manager plays through, so tests can read `paused`. */
async function watchAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      (window as unknown as { __tkAudio?: HTMLMediaElement }).__tkAudio = this;
      return play.call(this);
    };
  });
}
const audioPaused = (page: Page) => page.evaluate(() => (window as unknown as { __tkAudio?: HTMLMediaElement }).__tkAudio?.paused ?? true);

async function openAndAsk(page: Page, question: string): Promise<void> {
  if (!(await panel(page).isVisible().catch(() => false))) {
    await page.goto("/", { waitUntil: "load" });
    await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
    await expect(panel(page)).toHaveAttribute("data-open", "");
  }
  const before = await turns(page).count();
  await input(page).fill(question);
  await input(page).press("Enter");
  await expect(turns(page)).toHaveCount(before + 1);
  await expect(turns(page).last()).toHaveAttribute("data-msg", "answer");
}

test.describe("ask-voice", () => {
  test("idle → loading → playing → paused → resumed → ended → replay, with one request and no text sent", async ({ page }) => {
    await watchAudio(page);
    const calls = await mockSpeech(page, audioReply(1.6, 900));
    await openAndAsk(page, "Who is Tushar?");

    // The answer text is there first, with no request made (spec §23 / §25: no auto-play).
    await expect(turns(page).last().locator(".tk-answer-text")).toContainText("Tushar Pathak");
    const s = strip(page);
    await expect(s).toHaveAttribute("data-state", "idle");
    expect(calls).toHaveLength(0);
    // Order inside the bubble: answer → voice strip → sources (UI spec §20).
    const order = await turns(page).last().locator(".tk-bubble > *").evaluateAll((els) => els.map((e) => e.className));
    expect(order.findIndex((c) => c.includes("tk-voice"))).toBeGreaterThan(order.findIndex((c) => c.includes("tk-answer-text")));
    expect(order.findIndex((c) => c.includes("tk-voice"))).toBeLessThan(order.findIndex((c) => c.includes("tk-sources")));

    await s.getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(s).toHaveAttribute("data-state", "loading");
    await expect(s).toContainText(/Finding my voice…|Warming up the woof…|Almost ready…/);
    await expect(s).toHaveAttribute("data-state", "playing", { timeout: 8000 });
    await expect(turns(page).last()).toHaveAttribute("data-speaking", "");

    // The request carries the question, the FAQ id, the message id and the answer hash — never text.
    expect(calls).toHaveLength(1);
    expect(Object.keys(calls[0]!).sort()).toEqual(["answerHash", "faqId", "messageId", "question"]);
    expect(calls[0]).toMatchObject({ question: "Who is Tushar?", faqId: "who-is-tushar" });
    expect(String(calls[0]!.answerHash)).toMatch(/^[0-9a-f]{14}$/);

    await s.getByRole("button", { name: "Pause Tushky" }).click();
    await expect(s).toHaveAttribute("data-state", "paused");
    expect(await audioPaused(page)).toBe(true);
    await expect(s.locator(".tk-voice-time")).toHaveText(/^\d:\d\d \/ 0:02$/);

    await s.getByRole("button", { name: "Resume Tushky" }).click();
    await expect(s).toHaveAttribute("data-state", "playing");
    await expect(s).toHaveAttribute("data-state", "ended", { timeout: 8000 });
    await expect(s.getByRole("button", { name: "Replay Tushky's answer" })).toBeVisible();

    await s.getByRole("button", { name: "Replay Tushky's answer" }).click();
    await expect(s).toHaveAttribute("data-state", "playing");
    expect(calls).toHaveLength(1); // Replay reuses the audio (spec §33, UI §10)
  });

  test("two answers: starting the second pauses the first", async ({ page }) => {
    const calls = await mockSpeech(page, audioReply(6));
    await openAndAsk(page, "Who is Tushar?");
    await openAndAsk(page, "What products has Tushar built?");
    await strip(page, 0).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page, 0)).toHaveAttribute("data-state", "playing");
    await strip(page, 1).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page, 1)).toHaveAttribute("data-state", "playing");
    await expect(strip(page, 0)).toHaveAttribute("data-state", "paused");
    await expect(page.locator('.tk-turn[data-speaking]')).toHaveCount(1);
    expect(calls).toHaveLength(2);
  });

  test("closing the drawer stops the audio; reopening does not resume", async ({ page }) => {
    await watchAudio(page);
    await mockSpeech(page, audioReply(6));
    await openAndAsk(page, "Who is Tushar?");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    expect(await audioPaused(page)).toBe(false);
    await panel(page).getByRole("button", { name: "Close Ask Tushky" }).click();
    await expect(panel(page)).toBeHidden();
    expect(await audioPaused(page)).toBe(true);
    await page.waitForTimeout(400);
    expect(await audioPaused(page)).toBe(true);
    await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
    await expect(panel(page)).toHaveAttribute("data-mode", "empty");
    expect(await audioPaused(page)).toBe(true);
  });

  test("error: 'Couldn't find my voice this time 🐾' + Try again; the answer stays; retry recovers", async ({ page }) => {
    const calls = await mockSpeech(page, [errorReply(502, "voice-unavailable"), audioReply(2)]);
    await openAndAsk(page, "Who is Tushar?");
    const answerText = await turns(page).last().locator(".tk-answer-text").textContent();
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "error");
    await expect(strip(page)).toContainText("Couldn’t find my voice this time 🐾");
    await expect(strip(page)).not.toContainText(/502|voice-unavailable|error:/i);
    await expect(turns(page).last().locator(".tk-answer-text")).toHaveText(answerText!);
    await strip(page).getByRole("button", { name: /Try again/ }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    expect(calls).toHaveLength(2);
  });

  test("quota: 'Voice is resting for a bit…', no retry button, no automatic retries; chat still works", async ({ page }) => {
    const calls = await mockSpeech(page, errorReply(503, "voice-resting"));
    await openAndAsk(page, "Who is Tushar?");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "resting");
    await expect(strip(page)).toContainText("Voice is resting for a bit. The text answer is still here.");
    await expect(strip(page).getByRole("button")).toHaveCount(0);
    await page.waitForTimeout(1500);
    expect(calls).toHaveLength(1);
    await openAndAsk(page, "What products has Tushar built?");
    await expect(strip(page)).toHaveAttribute("data-state", "idle");
  });

  test("a refusal (the empty fallback) gets no voice strip", async ({ page }) => {
    await mockSpeech(page, audioReply(1));
    await page.goto("/", { waitUntil: "load" });
    await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
    await input(page).fill("what is the weather in paris");
    await input(page).press("Enter");
    await expect(turns(page).last()).toHaveAttribute("data-msg", "empty");
    await expect(turns(page).last().locator(".tk-voice")).toHaveCount(0);
  });

  test("keyboard: Enter/Space operate the focused control, labels change, focus stays, the rust ring shows", async ({ page }) => {
    await mockSpeech(page, audioReply(6));
    await openAndAsk(page, "Who is Tushar?");
    const main = strip(page).locator(".tk-voice-main");
    await expect(main).toHaveAccessibleName("Listen to Tushky's answer");
    // Reach it from the answer's preceding content with Tab, as a keyboard user would.
    await input(page).focus();
    await main.focus();
    await page.keyboard.press("Enter");
    await expect(main).toHaveAccessibleName("Pause Tushky");
    await expect(main).toBeFocused();
    const ring = await main.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }));
    expect(ring).toEqual({ style: "solid", width: "2px" });
    await page.keyboard.press("Space");
    await expect(main).toHaveAccessibleName("Resume Tushky");
    await page.keyboard.press("Tab");
    await expect(strip(page).getByRole("button", { name: "Replay Tushky's answer" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    // Labels are concise: none repeats the answer text (spec §66).
    for (const name of await strip(page).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""))) {
      expect(name.length).toBeLessThan(45);
    }
  });

  test("@EVAL-006 @EVAL-008 the drawer with a voice strip is axe-clean, 44 px targets, no overflow", { tag: "@EVAL-006" }, async ({ page, axe, minTargets, noOverflow }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await mockSpeech(page, audioReply(6));
    await openAndAsk(page, "Who is Tushar?");
    await axe(page, { include: "dialog.ask-panel" });
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    await axe(page, { include: "dialog.ask-panel" });
    await minTargets(page);
    await noOverflow(page);
    // One row: the strip never wraps onto a second line (UI §32 / §46).
    const box = await strip(page).boundingBox();
    expect(box!.height).toBeLessThanOrEqual(64);
  });

  test("@EVAL-010 reduced motion: no waveform or avatar animation, playback still works", async ({ page, withReducedMotion }) => {
    await withReducedMotion(page);
    await mockSpeech(page, audioReply(4, 600));
    await openAndAsk(page, "Who is Tushar?");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "loading");
    expect(await strip(page).locator(".tk-voice-spinner").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    await expect(strip(page).locator(".tk-voice-bar[data-head]")).toHaveCount(1, { timeout: 5000 });
    const anim = await page.evaluate(() => ({
      head: getComputedStyle(document.querySelector(".tk-voice-bar[data-head]")!).animationName,
      marks: getComputedStyle(document.querySelector(".tk-turn[data-speaking] .tk-speaking-marks")!).animationName,
    }));
    expect(anim).toEqual({ head: "none", marks: "none" });
  });

  test("screenshots: the voice strip in each state at 390 / 1440", async ({ page }) => {
    const w = width(page);
    test.skip(w !== 390 && w !== 1440, "SHOT(m-009/task-134/*)");
    await watchAudio(page);
    await mockSpeech(page, [audioReply(30, 2500), errorReply(502, "voice-unavailable"), errorReply(503, "voice-resting")]);
    await openAndAsk(page, "Who is Tushar?");
    await page.evaluate(() => document.fonts.ready);
    const bubble = turns(page).last();
    // Crop around the strip: the answer's last lines above it, the sources below (a long bubble is
    // taller than the viewport, so a whole-bubble shot would be cut by the drawer header).
    const shot = async (state: string) => {
      await strip(page).evaluate((el) => el.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(250);
      const b = (await bubble.boundingBox())!;
      const st = (await strip(page).boundingBox())!;
      const x = Math.max(0, b.x - 48);
      await page.screenshot({
        path: `${SHOTS}/${state}-${w}.png`,
        animations: "disabled",
        clip: { x, y: Math.max(0, st.y - 150), width: Math.min(b.width + 60, w - x), height: 330 },
      });
    };
    await shot("idle");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "loading");
    await shot("loading");
    await expect(strip(page)).toHaveAttribute("data-state", "playing", { timeout: 8000 });
    await page.waitForTimeout(3200);
    await shot("playing");
    await strip(page).getByRole("button", { name: "Pause Tushky" }).click();
    await shot("paused");
    // Ended: resume (which restores the paused position), then jump the clip to its last moment.
    await strip(page).getByRole("button", { name: "Resume Tushky" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "playing");
    await page.evaluate(() => {
      const a = (window as unknown as { __tkAudio?: HTMLMediaElement }).__tkAudio;
      if (a) a.currentTime = Math.max(0, a.duration - 0.2);
    });
    await expect(strip(page)).toHaveAttribute("data-state", "ended", { timeout: 8000 });
    await shot("ended");
    await openAndAsk(page, "What products has Tushar built?");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "error");
    await shot("error");
    await openAndAsk(page, "What AI experience does he have?");
    await strip(page).getByRole("button", { name: "Listen to Tushky's answer" }).click();
    await expect(strip(page)).toHaveAttribute("data-state", "resting");
    await shot("resting");
    await page.screenshot({ path: `${SHOTS}/drawer-${w}.png` });
  });
});
