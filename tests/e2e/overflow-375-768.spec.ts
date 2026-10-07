/**
 * overflow-375-768.spec.ts (`@EVAL-008`) — no horizontal page scroll at 375 and 768 in both themes.
 * This was the mobile half of the retired EVAL-028 (Paper Trail cursor, removed by TASK-174); EVAL-008 keeps
 * 390/768/1024/1440, this adds the 375 width and the theme sweep.
 */
import { test } from "./fixtures";

test.describe("@EVAL-008 no horizontal scroll at 375 and 768, both themes", () => {
  for (const width of [375, 768]) {
    for (const theme of ["light", "dark"]) {
      test(`@EVAL-008 ${width}px · ${theme}`, async ({ page, noOverflow }, info) => {
        test.skip(info.project.name === "w390", "viewport is set per test; run in a fine-pointer project");
        await page.setViewportSize({ width, height: 900 });
        for (const route of ["/", "/about", "/work", "/projects", "/contact"]) {
          await page.goto(route);
          await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
          await page.locator("main").waitFor();
          await noOverflow(page);
        }
      });
    }
  }
});
