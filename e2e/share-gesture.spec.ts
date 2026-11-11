import { createServer, type ViteDevServer } from "vite";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Loads the real shareHandoff module in Chromium.
 * navigator.share, Capacitor, and the native bridges are simulated.
 * This is not a run on an iPhone, Android, or Huawei device.
 */

let server: ViteDevServer;
let origin = "";

test.beforeAll(async () => {
  const root = path.resolve(__dirname, "share-harness");
  server = await createServer({
    configFile: false,
    root,
    server: { host: "127.0.0.1", port: 0, strictPort: false },
    resolve: { alias: { "@": path.resolve(__dirname, "../src") } },
    logLevel: "error",
  });
  await server.listen();
  const addr = server.httpServer?.address();
  const port = addr && typeof addr === "object" ? addr.port : 0;
  origin = `http://127.0.0.1:${port}/`;
});

test.afterAll(async () => {
  await server?.close();
});

async function openHarness(page: Page) {
  await page.goto(origin);
  await page.waitForFunction(() => (window as unknown as { __ready?: boolean }).__ready === true);
}

async function shareCalls(page: Page) {
  return page.evaluate(() => (window as unknown as { __shareCalls: { active: boolean; data: ShareData }[] }).__shareCalls);
}

test("calls Web Share during the tap on desktop and mobile web", async ({ page }) => {
  await openHarness(page);
  await page.click("#now");
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
  const calls = await shareCalls(page);
  expect(calls[0]?.data.text).toBe("Hello from Notho");
  expect(calls[0]?.data.title).toBe("Notho");
  expect(calls[0]?.active).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __pending: Promise<string> }).__pending)).toBe("shared");
  expect(await page.evaluate(() => (window as unknown as { __opened: number }).__opened)).toBe(0);
});

test("the Android shell does not call Web Share or window.open", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { androidBridge: object }).androidBridge = {};
  });
  await openHarness(page);
  await page.click("#now");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __pending: Promise<string> }).__pending)).toBe("needs-whatsapp");
  expect(await shareCalls(page)).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __opened: number }).__opened)).toBe(0);
});

test("the iPhone shell does not text-share the card", async ({ page }) => {
  await page.addInitScript(() => {
    const webkit = { messageHandlers: { bridge: {} } };
    (window as unknown as { webkit: typeof webkit }).webkit = webkit;
  });
  await openHarness(page);
  await page.click("#ios");
  const result = await page.evaluate(() => (window as unknown as { __pending: Promise<string> }).__pending);
  expect(["failed", "shared", "cancelled"]).toContain(result);
  expect(result).not.toBe("needs-whatsapp");
  expect(await shareCalls(page)).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __opened: number }).__opened)).toBe(0);
});
