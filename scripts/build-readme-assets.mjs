/**
 * Build GitHub-ready README assets: animated GIFs from SVG sources.
 * GitHub README blocks SVG in img tags — GIF embeds reliably.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "images");

function stripSmil(svg) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<animateTransform[\s\S]*?\/>/g, "")
    .replace(/<animate[\s\S]*?\/>/g, "")
    .replace(/<animateTransform[\s\S]*?<\/animateTransform>/g, "")
    .replace(/<animate[\s\S]*?<\/animate>/g, "");
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wave(t, phase = 0) {
  return (Math.sin((t + phase) * Math.PI * 2) + 1) / 2;
}

function logoFrame(t) {
  const dash = Math.round(lerp(0, 420, t < 0.75 ? t / 0.75 : 1));
  const thread1 = Math.round(lerp(120, 0, wave(t, 0)));
  const thread2 = Math.round(lerp(120, 0, wave(t, 0.13)));
  const thread3 = Math.round(lerp(120, 0, wave(t, 0.26)));
  const pulse = lerp(7, 9, wave(t, 0.5));
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "logo-banner.svg"), "utf8"));
  svg = svg.replace('width="0" height="3"', `width="${dash}" height="3"`);
  svg = svg.replace('M24 52 H124" stroke="url(#threadA)" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="120" stroke-dashoffset="120"', `M24 52 H124" stroke="url(#threadA)" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="120" stroke-dashoffset="${thread1}"`);
  svg = svg.replace('M24 74 H124" stroke="url(#threadB)" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="120" stroke-dashoffset="120"', `M24 74 H124" stroke="url(#threadB)" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="120" stroke-dashoffset="${thread2}"`);
  svg = svg.replace('M24 96 H124" stroke="#f2efe7" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7" stroke-dasharray="120" stroke-dashoffset="120"', `M24 96 H124" stroke="#f2efe7" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7" stroke-dasharray="120" stroke-dashoffset="${thread3}"`);
  svg = svg.replace('<circle cx="124" cy="36" r="8" fill="#e75b37">', `<circle cx="124" cy="36" r="${pulse.toFixed(1)}" fill="#e75b37">`);
  return svg;
}

function architectureFrame(t) {
  const progress = Math.round(816 * (t < 0.8 ? t / 0.8 : 1));
  const dotY1 = Math.round(lerp(168, 200, wave(t, 0)));
  const dotY2 = Math.round(lerp(280, 300, wave(t, 0.2)));
  const dotY3 = Math.round(lerp(400, 420, wave(t, 0.4)));
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "architecture.svg"), "utf8"));
  svg = svg.replace('width="0" height="3"', `width="${progress}" height="3"`);
  svg = svg.replace('<circle cx="480" cy="200" r="4" fill="#e75b37">', `<circle cx="480" cy="${dotY1}" r="4" fill="#e75b37">`);
  svg = svg.replace('<circle cx="480" cy="290" r="4" fill="#2e7254">', `<circle cx="480" cy="${dotY2}" r="4" fill="#2e7254">`);
  svg = svg.replace('<circle cx="480" cy="410" r="4" fill="#e75b37">', `<circle cx="480" cy="${dotY3}" r="4" fill="#e75b37">`);
  return svg;
}

function pipelineFlowFrame(t) {
  const phase = t < 0.75 ? t / 0.75 : (1 - t) / 0.25;
  const progress = Math.round(896 * phase);
  const stops = [32, 190, 350, 510, 670, 830];
  const idx = Math.min(stops.length - 1, Math.floor(t * stops.length));
  const cx = stops[idx];
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "pipeline-flow.svg"), "utf8"));
  svg = svg.replace('width="0" height="6"', `width="${progress}" height="6"`);
  svg = svg.replace(/<circle r="9"[\s\S]*?<\/circle>/, `<circle cx="${cx}" cy="108" r="9" fill="#171a22" stroke="#fbfaf6" stroke-width="2"/>`);
  return svg;
}

function evidenceHubFrame(t) {
  const glow = Math.round(lerp(110, 130, wave(t, 0)));
  const stroke = lerp(2, 4, wave(t, 0.3)).toFixed(1);
  const dash = Math.round(-28 * ((t * 2) % 1));
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "evidence-hub.svg"), "utf8"));
  svg = svg.replace(/<circle cx="480" cy="200" r="120"/, `<circle cx="480" cy="200" r="${glow}"`);
  svg = svg.replace('stroke-width="3"', `stroke-width="${stroke}"`);
  svg = svg.replace(/stroke-dashoffset" values="0;-28"/g, `stroke-dashoffset="${dash}"`);
  return svg;
}

function workspaceOrbitFrame(t) {
  const offsets = [0, 0.25, 0.5, 0.75].map((p) => Math.round(8 * wave(t, p)));
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "workspace-orbit.svg"), "utf8"));
  svg = svg.replace(/transform="translate\(410,62\)"/, `transform="translate(410,${62 - offsets[0]})"`);
  svg = svg.replace(/transform="translate\(650,162\)"/, `transform="translate(${650 + offsets[1]},162)"`);
  svg = svg.replace(/transform="translate\(410,262\)"/, `transform="translate(410,${262 + offsets[2]})"`);
  svg = svg.replace(/transform="translate\(170,162\)"/, `transform="translate(${170 - offsets[3]},162)"`);
  return svg;
}

async function svgToRaw(svg, width) {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(width)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

async function framesToGif(frames, width, outPath, delay = 90) {
  const raws = await Promise.all(frames.map((f) => svgToRaw(f, width)));
  const encoder = GIFEncoder();
  const { width: w, height: h } = raws[0].info;
  for (const { data } of raws) {
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    encoder.writeFrame(index, w, h, { palette, delay });
  }
  encoder.finish();
  fs.writeFileSync(outPath, Buffer.from(encoder.bytes()));
}

async function buildSvgGif(name, frameFn, width, frames = 28) {
  const list = Array.from({ length: frames }, (_, i) => frameFn(i / frames));
  const gifPath = path.join(OUT, `${name}.gif`);
  await framesToGif(list, width, gifPath);
  const still = await sharp(Buffer.from(list[Math.floor(frames / 3)]))
    .resize(width)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `${name}.png`), still);
  console.log(`  ${name}.gif + ${name}.png`);
}

async function main() {
  console.log("Building animated diagram GIFs...");
  await buildSvgGif("logo-banner", logoFrame, 920, 32);
  await buildSvgGif("architecture", architectureFrame, 920, 32);
  await buildSvgGif("pipeline-flow", pipelineFlowFrame, 920, 28);
  await buildSvgGif("evidence-hub", evidenceHubFrame, 920, 24);
  await buildSvgGif("workspace-orbit", workspaceOrbitFrame, 920, 24);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
