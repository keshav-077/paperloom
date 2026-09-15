/**
 * Record a scrolling website tour GIF for the README.
 * Requires dev server at localhost:3000.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const BASE = process.env.PAPERLOOM_URL ?? "http://localhost:3000";
const OUT = path.resolve(import.meta.dirname, "../docs/images/demo.gif");
const VIEWPORT = { width: 1280, height: 720 };

const tour = [
  { url: "/", wait: 2000, scroll: 0, frames: 5 },
  { url: "/?sample=1&mode=lab", wait: 2500, scroll: 180, frames: 5 },
  { url: "/?sample=1&mode=lab#claim-claim-method-01", wait: 2800, scroll: 0, frames: 6 },
  { url: "/?sample=1&mode=story", wait: 2500, scroll: 120, frames: 5 },
  { url: "/?sample=1&mode=preview", wait: 2500, scroll: 280, frames: 5 },
  { url: "/?library=1", wait: 2000, scroll: 0, frames: 4 },
];

async function captureFrame(page) {
  const buf = await page.screenshot({ type: "png" });
  return sharp(buf).resize(920).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1.5 });
  const frames = [];

  console.log(`Recording website demo from ${BASE}...`);

  for (const step of tour) {
    await page.goto(`${BASE}${step.url}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(step.wait);
    if (step.scroll) await page.evaluate((y) => window.scrollTo(0, y), step.scroll);
    await page.waitForTimeout(400);

    const count = step.frames ?? 4;
    for (let i = 0; i < count; i++) {
      frames.push(await captureFrame(page));
    }
    console.log(`  captured ${step.url}`);
  }

  await browser.close();

  const encoder = GIFEncoder();
  const { width, height } = frames[0].info;
  for (const { data } of frames) {
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    encoder.writeFrame(index, width, height, { palette, delay: 140 });
  }
  encoder.finish();
  fs.writeFileSync(OUT, Buffer.from(encoder.bytes()));
  console.log(`Wrote ${OUT} (${frames.length} frames)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
