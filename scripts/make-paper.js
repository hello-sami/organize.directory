/**
 * make-paper.js
 *
 * Generates the "thin paper" show-through: a faint, mirrored, slightly blurred
 * page of listings that sits behind every page, the way the back of a phone
 * book page bleeds through. Drawn from real listings in data/locations so it
 * reads as directory text, not lorem ipsum.
 *
 * Writes:  assets/paper/ghost-yellow.svg  (yellow pages, a touch stronger)
 *          assets/paper/ghost-white.svg   (white pages, fainter on the lighter paper)
 *
 * Run once after changing the look; the output is committed, not rebuilt on
 * every `npm run build`.
 *   node scripts/make-paper.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TILE_W = 1200;
const TILE_H = 1800;
const COLS = 4;
const COL_W = 270;
const GUTTER = (TILE_W - COLS * COL_W) / (COLS + 1);
const LINE = 20;
const INK = '#1d1c18';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Roughly fit a description into a column: condensed 14px ≈ 6.4px per char.
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function loadEntries() {
  const dir = path.join(ROOT, 'data', 'locations');
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json')).sort();
  const blocks = [];
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8'));
    for (const s of data.sections || []) {
      const items = (s.initiatives || []).filter(i => i.name);
      if (!items.length) continue;
      blocks.push({ heading: (s.title || data.title).toUpperCase(), items });
    }
  }
  return blocks;
}

function renderTile(blocks, opacity) {
  const lines = [];
  let b = 0;
  for (let c = 0; c < COLS; c++) {
    const x = GUTTER + c * (COL_W + GUTTER);
    let y = 40 + c * 37; // stagger columns so the tile doesn't read as a grid
    while (y < TILE_H - LINE) {
      const block = blocks[(b++ * 7) % blocks.length];
      lines.push(`<rect x="${x}" y="${y - 3}" width="${COL_W}" height="4"/>`);
      y += LINE;
      lines.push(`<text x="${x}" y="${y}" font-weight="700">${esc(block.heading.slice(0, 34))}</text>`);
      y += LINE + 4;
      for (const item of block.items.slice(0, 5)) {
        if (y > TILE_H - LINE) break;
        lines.push(`<text x="${x}" y="${y}" font-weight="700">${esc(item.name.slice(0, 40))}</text>`);
        y += LINE;
        for (const l of wrap(item.description || '', 40).slice(0, 2)) {
          if (y > TILE_H - LINE) break;
          lines.push(`<text x="${x + 12}" y="${y}">${esc(l)}</text>`);
          y += LINE;
        }
        y += 6;
      }
      y += 14;
    }
  }
  // Mirrored, because it's the back of the sheet.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">
<filter id="b"><feGaussianBlur stdDeviation=".6"/></filter>
<g transform="translate(${TILE_W} 0) scale(-1 1)" filter="url(#b)" fill="${INK}" fill-opacity="${opacity}" font-family="'IBM Plex Sans Condensed','Arial Narrow','Helvetica Neue',sans-serif" font-stretch="condensed" font-size="15">
${lines.join('\n')}
</g>
</svg>
`;
}

async function run() {
  const blocks = await loadEntries();
  const out = path.join(ROOT, 'assets', 'paper');
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, 'ghost-yellow.svg'), renderTile(blocks, 0.035));
  await fs.writeFile(path.join(out, 'ghost-white.svg'), renderTile(blocks, 0.025));
  console.log(`Wrote assets/paper/ghost-{yellow,white}.svg from ${blocks.length} sections`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
