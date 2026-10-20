/**
 * hover-stability.spec.ts — TASK-308: on /projects (desktop vertical carousel) the video stage + card pair shook 1 px while the
 * pointer moved over it (paper-world pointer parallax re-translating overlapping layers). Guard: the pair keeps its own compositor
 * layer across pointer moves and its rect never changes. Chromium LayerTree; runs once (w1440 project).
 */
import { test, expect } from "./fixtures";

test.beforeEach(({ browserName }) => {
  test.skip(test.info().project.name !== "w1440" || browserName !== "chromium", "w1440 chromium only");
});

test("the stage + card pair keeps its own layer and rect while the pointer moves over it", async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 860 });
  await page.goto("/projects?product=campfire", { waitUntil: "load" });
  const feature = page.locator(".pf-showcase.pf-vcar .pf-feature");
  await feature.scrollIntoViewIfNeeded();
  await expect(feature).toHaveCSS("will-change", "transform");

  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: ".pf-showcase.pf-vcar .pf-feature" });
  const backendNodeId = (await cdp.send("DOM.describeNode", { nodeId })).node.backendNodeId;
  let layers: Array<{ backendNodeId?: number }> = [];
  cdp.on("LayerTree.layerTreeDidChange", (e) => {
    if (e.layers) layers = e.layers;
  });
  await cdp.send("LayerTree.enable");

  const rect = () => feature.evaluate((el) => JSON.stringify(el.getBoundingClientRect()));
  const before = await rect();
  const box = (await page.locator(".pf-showcase.pf-vcar .pf-stage").boundingBox())!;
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(box.x + 20 + i * 12, box.y + box.height * (0.2 + 0.6 * ((i * 7) % 10) / 10));
    expect(await rect()).toBe(before);
  }
  await expect.poll(() => layers.some((l) => l.backendNodeId === backendNodeId)).toBe(true);
});
