/**
 * Build GitHub-compatible README images (PNG + animated GIF).
 * GitHub README blocks/sanitizes SVG in <img> tags — GIF/PNG render reliably.
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

function heroFrame(t) {
  const float = Math.sin(t * Math.PI * 2);
  const paperY = Math.round(88 - 5 * float);
  const cardY = Math.round(64 - 5 * Math.sin(t * Math.PI * 2 + 1));
  const hubR = (42 + 2 * float).toFixed(1);
  const dash = Math.round(-28 * ((t * 3) % 1));
  const sliderX = Math.round(120 + 100 * ((Math.sin(t * Math.PI * 2) + 1) / 2));
  const highlightOpacity = (0.15 + 0.2 * ((Math.sin(t * Math.PI * 2) + 1) / 2)).toFixed(2);

  let svg = stripSmil(fs.readFileSync(path.join(OUT, "hero.svg"), "utf8"));
  svg = svg.replace('transform="translate(56,88)"', `transform="translate(56,${paperY})"`);
  svg = svg.replace('transform="translate(540,64)"', `transform="translate(540,${cardY})"`);
  svg = svg.replace('<circle cx="88" cy="88" r="44" fill="#171a22">', `<circle cx="88" cy="88" r="${hubR}" fill="#171a22">`);
  svg = svg.replace(/opacity="0\.2"/, `opacity="${highlightOpacity}"`);
  svg = svg.replace(/stroke-dashoffset" values="0;-28"/, `stroke-dashoffset="${dash}"`);
  svg = svg.replace(/<circle cx="176" cy="176" r="11" fill="#e75b37" filter="url\(#glow\)">/, `<circle cx="${sliderX}" cy="176" r="11" fill="#e75b37" filter="url(#glow)">`);
  return svg;
}

function pipelineFrame(t) {
  const phase = t < 0.55 ? t / 0.55 : t < 0.8 ? 1 : (1 - t) / 0.2;
  const progress = Math.round(680 * Math.max(0, Math.min(1, phase)));
  const dotX = Math.round(116 + 680 * Math.max(0, Math.min(1, phase)));

  let svg = stripSmil(fs.readFileSync(path.join(OUT, "pipeline.svg"), "utf8"));
  svg = svg.replace('width="0" height="4"', `width="${progress}" height="4"`);
  svg = svg.replace("<circle r=\"6\" fill=\"#e75b37\">", `<circle cx="${dotX}" cy="78" r="6" fill="#e75b37">`);
  return svg;
}

function scrollJourneyFrame(t) {
  const fill = Math.round(720 * Math.min(1, t * 1.1));
  const steps = 5;
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "scroll-journey.svg"), "utf8"));
  svg = svg.replace('height="0" rx="4" fill="url(#track)"', `height="${fill}" rx="4" fill="url(#track)"`);
  for (let i = 0; i < steps; i++) {
    const active = t * steps >= i;
    const opacity = active ? "1" : "0.35";
    svg = svg.replace(
      new RegExp(`(<circle cx="160" cy="0" r="14" fill="[^"]+">)(?=[\\s\\S]*?0${i + 1})`),
      `$1`.replace(">", ` opacity="${opacity}">`)
    );
  }
  // simpler: pulse scroll indicator
  const scrollY = Math.round(10 + 12 * ((Math.sin(t * Math.PI * 2) + 1) / 2));
  svg = svg.replace(/<circle cx="12" cy="12" r="4" fill="#e75b37">/, `<circle cx="12" cy="${scrollY}" r="4" fill="#e75b37">`);
  return svg;
}

function workspacesFrame(t) {
  const offsets = [0, 1, 2, 3].map((i) => Math.round(4 * Math.sin(t * Math.PI * 2 + i * 1.2)));
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "workspaces.svg"), "utf8"));
  const transforms = [
    `translate(20,${40 + offsets[0]})`,
    `translate(240,${40 + offsets[1]})`,
    `translate(460,${40 + offsets[2]})`,
    `translate(680,${40 + offsets[3]})`,
  ];
  svg = svg.replace(/transform="translate\(20,40\)"/, `transform="${transforms[0]}"`);
  svg = svg.replace(/transform="translate\(240,40\)"/, `transform="${transforms[1]}"`);
  svg = svg.replace(/transform="translate\(460,40\)"/, `transform="${transforms[2]}"`);
  svg = svg.replace(/transform="translate\(680,40\)"/, `transform="${transforms[3]}"`);
  return svg;
}

function evidenceFrame(t) {
  const dash = Math.round(-24 * ((t * 2) % 1));
  const hubR = (48 + 2 * Math.sin(t * Math.PI * 2)).toFixed(1);
  let svg = stripSmil(fs.readFileSync(path.join(OUT, "evidence-chain.svg"), "utf8"));
  svg = svg.replace('<circle cx="80" cy="60" r="50" fill="url(#hub)">', `<circle cx="80" cy="60" r="${hubR}" fill="url(#hub)">`);
  svg = svg.replace(/stroke-dashoffset" values="0;-24"/g, `stroke-dashoffset="${dash}"`);
  return svg;
}

async function svgToPng(svg, width) {
  return sharp(Buffer.from(svg)).resize(width).png().toBuffer();
}

async function framesToGif(frames, width, outPath, delay = 90) {
  const pngBuffers = await Promise.all(frames.map((svg) => svgToPng(svg, width)));
  const raws = await Promise.all(
    pngBuffers.map((buf) =>
      sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    )
  );

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

async function buildOne(name, frameFn, width, frameCount = 24) {
  const frames = Array.from({ length: frameCount }, (_, i) => frameFn(i / frameCount));
  const still = frames[Math.floor(frameCount / 4)];

  await svgToPng(still, width).then((buf) =>
    fs.writeFileSync(path.join(OUT, `${name}.png`), buf)
  );
  await framesToGif(frames, width, path.join(OUT, `${name}.gif`));
  console.log(`  ${name}.png + ${name}.gif`);
}

async function main() {
  console.log("Building README images...");
  await buildOne("hero", heroFrame, 920, 30);
  await buildOne("pipeline", pipelineFrame, 920, 24);
  await buildOne("workspaces", workspacesFrame, 880, 20);
  await buildOne("evidence-chain", evidenceFrame, 720, 20);
  await buildOne("scroll-journey", scrollJourneyFrame, 280, 24);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
