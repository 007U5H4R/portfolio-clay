import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * TASK-128 scar: every local Playwright run starts its own server on PW_BASE_URL's port and never
 * reuses one that is already listening. On 2026-09-28 `reuseExistingServer: true` let a full gate
 * test another worktree's `next-server` on :3000: about 30 false failures and 24 KB blank screenshots.
 */
type WebServer = { command: string; url: string; reuseExistingServer: boolean };

const saved = process.env.PW_BASE_URL;

async function loadConfig(baseURL?: string) {
  vi.resetModules();
  if (baseURL === undefined) delete process.env.PW_BASE_URL;
  else process.env.PW_BASE_URL = baseURL;
  return (await import("../../playwright.config")).default;
}

afterEach(() => {
  if (saved === undefined) delete process.env.PW_BASE_URL;
  else process.env.PW_BASE_URL = saved;
});

describe("playwright.config: each local run owns its server (TASK-128)", () => {
  it("defaults to its own server on :3000 and never reuses an existing one", async () => {
    const config = await loadConfig();
    const server = config.webServer as WebServer;
    expect(server.reuseExistingServer).toBe(false);
    expect(server.command).toBe("pnpm exec next start -p 3000");
    expect(server.url).toBe("http://127.0.0.1:3000");
  });

  it("follows PW_BASE_URL's port for a local base URL", async () => {
    const config = await loadConfig("http://127.0.0.1:3137");
    const server = config.webServer as WebServer;
    expect(server.reuseExistingServer).toBe(false);
    expect(server.command).toBe("pnpm exec next start -p 3137");
    expect(server.url).toBe("http://127.0.0.1:3137");
    expect(config.use?.baseURL).toBe("http://127.0.0.1:3137");
  });

  it("starts no local server when PW_BASE_URL is a deployed preview", async () => {
    const config = await loadConfig("https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app");
    expect(config.webServer).toBeUndefined();
  });
});
