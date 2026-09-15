/**
 * Capture high-quality README screenshots from the running PaperLoom dev server.
 * Usage: npm run dev (in another terminal), then npm run capture:readme
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.PAPERLOOM_URL ?? "http://localhost:3000";
const OUT = path.resolve(import.meta.dirname, "../docs/images");
const VIEWPORT = { width: 1440, height: 900 };

const shots = [
  { name: "home", url: "/", wait: 1200 },
  { name: "lab", url: "/?sample=1&mode=lab", wait: 2500 },
  { name: "lab-evidence", url: "/?sample=1&mode=lab#claim-claim-method-01", wait: 3000 },
  { name: "story", url: "/?sample=1&mode=story", wait: 2500 },
  { name: "preview", url: "/?sample=1&mode=preview", wait: 2500 },
  { name: "library", url: "/?library=1", wait: 1500 },
];

async function waitForApp(page) {
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
  await page.waitForFunction(
    () => document.fonts?.ready,
    undefined,
    { timeout: 15_000 },
  ).catch(() => undefined);
}

async function capture(page, { name, url, wait }) {
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForApp(page);
  await page.waitForTimeout(wait);

  const pngPath = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: pngPath, fullPage: false, type: "png" });
  console.log(`  ${name}.png`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  console.log(`Capturing from ${BASE} @ ${VIEWPORT.width}x${VIEWPORT.height} (2x)...`);
  for (const shot of shots) {
    await capture(page, shot);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
