// Builds the painted art the game loads from the generated source sheets in assets/.
//   node tools/build-art.cjs
// Each sheet has a flat grey background. Pieces are cut out by colour distance from it,
// with the grey un-mixed from soft edges, trimmed, and packed into one WebP per sheet group.
// Writes assets/erwu.webp, assets/garden.webp and art-manifest.js. Uses the same
// Playwright/Chromium overrides as the browser tests (see tests/README.md).
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// Source regions [x, y, w, h] on each sheet. The generated sheets are not exact grids,
// and a few neighbours touch, so every region is set by hand.
const ERWU = {
  'erwu-sprite.png': {
    'sit-front': [56, 48, 224, 256], 'sit-drowsy': [324, 52, 224, 252], 'sit-content': [592, 48, 228, 256], curl: [836, 132, 256, 172],
    sniff: [12, 392, 276, 156], stalk: [296, 344, 284, 208], pounce: [584, 344, 252, 208], stretch: [864, 328, 244, 240],
    loaf: [36, 644, 228, 188], 'sit-side': [304, 576, 180, 264], 'belly-up': [500, 624, 346, 216], yawn: [849, 624, 247, 216],
    peek: [36, 912, 220, 128], 'peek-left': [304, 900, 220, 140], 'peek-right': [580, 900, 228, 140], 'peek-sleepy': [848, 916, 240, 124],
    'look-up': [636, 1072, 184, 256], 'sit-grumpy': [872, 1084, 232, 244], 'lie-side': [16, 1132, 346, 188], 'loaf-side': [369, 1132, 231, 188],
  },
  // two rows of four; each frame is anchored on its nose so the body holds still
  'erwu-walk.png': Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [`walk-${i}`, [8 + (i % 4) * 443, i < 4 ? 150 : 482, 436, 260]])),
};
const GARDEN = {
  'garden-pieces.png': {
    'rose-bed': [20, 40, 428, 368], fountain: [480, 36, 284, 372], log: [800, 112, 436, 312], cushion: [36, 456, 332, 204],
    stone: [480, 492, 272, 132], steps: [824, 440, 396, 220],
    'bed-empty': [20, 692, 388, 229], 'bed-seedlings': [444, 696, 364, 228], 'bed-young': [832, 676, 404, 244],
    'bed-full': [20, 922, 388, 282], grass: [424, 936, 404, 268], meadow: [832, 929, 404, 275],
  },
};
// The basket inside the rose bed, in garden-pieces.png pixels: its opening and outer rim.
const BASKET = { cx: 246, cy: 230, rx: 84, ry: 35, outerRx: 97, bottom: 322 };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const sheets = (group) => Object.entries(group).map(([file, regions]) => ({
    src: 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'assets', file)).toString('base64'), regions,
  }));
  const pack = (group, split) => page.evaluate(async ({ sheets, split }) => {
    const pieces = [];
    for (const sheet of sheets) {
      const img = new Image(); img.src = sheet.src; await img.decode();
      const W = img.naturalWidth, H = img.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, W, H), px = d.data;
      const border = [];
      for (let x = 0; x < W; x += 3) for (const y of [1, H - 2]) border.push((y * W + x) * 4);
      for (let y = 0; y < H; y += 3) for (const x of [1, W - 2]) border.push((y * W + x) * 4);
      const bg = [0, 1, 2].map((k) => border.map((i) => px[i + k]).sort((a, b) => a - b)[border.length >> 1]);
      // alpha from colour distance to the background, then un-mix the grey from soft edges
      for (let i = 0; i < px.length; i += 4) {
        const a = Math.max(0, Math.min(1, (Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]) - 10) / 28));
        if (a > 0 && a < 1) for (let k = 0; k < 3; k++) px[i + k] = Math.max(0, Math.min(255, (px[i + k] - bg[k] * (1 - a)) / a));
        px[i + 3] = Math.round(a * 255);
      }
      g.putImageData(d, 0, 0);
      // Connected parts of a region (8-neighbour, any visible alpha). A piece keeps only its
      // own parts, so a neighbour's tail tip or a stray speck never widens its box.
      const parts = (x0, y0, w, h) => {
        const lab = new Int32Array(w * h).fill(-1), out = [];
        const on = (x, y) => px[((y0 + y) * W + x0 + x) * 4 + 3] > 8;
        for (let s = 0; s < w * h; s++) {
          if (lab[s] >= 0 || !on(s % w, (s / w) | 0)) continue;
          const id = out.length, st = [s], bx = [1e9, 1e9, -1, -1, 0]; lab[s] = id;
          while (st.length) {
            const j = st.pop(), x = j % w, y = (j / w) | 0;
            bx[0] = Math.min(bx[0], x); bx[1] = Math.min(bx[1], y); bx[2] = Math.max(bx[2], x); bx[3] = Math.max(bx[3], y); bx[4]++;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy, k = ny * w + nx;
              if (nx >= 0 && ny >= 0 && nx < w && ny < h && lab[k] < 0 && on(nx, ny)) { lab[k] = id; st.push(k); }
            }
          }
          out.push({ id, box: bx });
        }
        return { lab, out, x0, y0, w, h };
      };
      const cut = (P, ids) => {
        const keep = P.out.filter((p) => ids.includes(p.id)), l = Math.min(...keep.map((p) => p.box[0])), t = Math.min(...keep.map((p) => p.box[1]));
        const w = Math.max(...keep.map((p) => p.box[2])) - l + 1, h = Math.max(...keep.map((p) => p.box[3])) - t + 1;
        const pc = document.createElement('canvas'); pc.width = w; pc.height = h;
        const pg = pc.getContext('2d'), id = pg.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const k = (t + y) * P.w + l + x;
          if (!ids.includes(P.lab[k])) continue;
          const si = ((P.y0 + t + y) * W + P.x0 + l + x) * 4, di = (y * w + x) * 4;
          for (let q = 0; q < 4; q++) id.data[di + q] = px[si + q];
        }
        pg.putImageData(id, 0, 0);
        return { canvas: pc, sx: P.x0 + l, sy: P.y0 + t, w, h };
      };
      for (const [name, r] of Object.entries(sheet.regions)) {
        const P = parts(...r), big = P.out.filter((p) => p.box[4] >= 80).sort((a, b) => b.box[4] - a.box[4]);
        const groups = split.includes(name)
          ? big.filter((p) => p.box[4] > 400).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]).map((p, i) => [`${name.replace(/s$/, '')}-${i}`, [p.id]])
          : [[name, big.map((p) => p.id)]];
        for (const [n, ids] of groups) {
          const c = cut(P, ids), walk = /^walk-/.test(n);
          // anchor: where the piece meets the ground. Walk frames anchor on the nose.
          pieces.push({ name: n, ...c, ax: walk ? c.w - 200 : c.w / 2, ay: c.h });
        }
      }
    }
    // shelf packing, tallest first, with a transparent gutter against bleeding
    const PAD = 3, MAXW = 2048;
    const order = [...pieces].sort((a, b) => b.h - a.h);
    let x = PAD, y = PAD, shelf = 0, width = 0;
    for (const p of order) {
      if (x + p.w + PAD > MAXW) { x = PAD; y += shelf + PAD; shelf = 0; }
      p.x = x; p.y = y; x += p.w + PAD; shelf = Math.max(shelf, p.h); width = Math.max(width, x);
    }
    const out = document.createElement('canvas'); out.width = width; out.height = y + shelf + PAD;
    const o = out.getContext('2d');
    for (const p of pieces) o.drawImage(p.canvas, p.x, p.y);
    const frames = Object.fromEntries(pieces.map((p) => [p.name, [p.x, p.y, p.w, p.h, Math.round(p.ax), p.ay, p.sx, p.sy]]));
    return { url: out.toDataURL('image/webp', 0.9), frames, size: [out.width, out.height] };
  }, { sheets: sheets(group), split });

  const erwu = await pack(ERWU, []);
  const garden = await pack(GARDEN, ['steps']);
  const write = (file, url) => { const buf = Buffer.from(url.split(',')[1], 'base64'); fs.writeFileSync(path.join(root, 'assets', file), buf); return buf.length; };
  const sizes = { erwu: write('erwu.webp', erwu.url), garden: write('garden.webp', garden.url) };
  const manifest = {
    note: 'frame: [x, y, w, h, anchorX, anchorY, sourceX, sourceY]; anchors are where a piece meets the ground',
    erwu: { src: 'assets/erwu.webp', size: erwu.size, frames: erwu.frames },
    garden: { src: 'assets/garden.webp', size: garden.size, frames: garden.frames, basket: BASKET },
    lawn: { src: 'assets/garden-lawn.webp' },
  };
  fs.writeFileSync(path.join(root, 'art-manifest.js'),
    '/* Generated by tools/build-art.cjs from the painted source sheets in assets/. Do not edit by hand. */\n' +
    "(function (root) { 'use strict';\n  const ART = " + JSON.stringify(manifest) + ";\n" +
    "  if (typeof module === 'object' && module.exports) module.exports = ART; else root.BloomArt = ART;\n})(typeof globalThis === 'object' ? globalThis : this);\n");
  console.log(`erwu.webp ${erwu.size.join('x')} ${(sizes.erwu / 1024).toFixed(0)} KB, ${Object.keys(erwu.frames).length} frames`);
  console.log(`garden.webp ${garden.size.join('x')} ${(sizes.garden / 1024).toFixed(0)} KB, ${Object.keys(garden.frames).length} pieces`);
  await browser.close();
})().catch((e) => { console.error(e); process.exitCode = 1; });
