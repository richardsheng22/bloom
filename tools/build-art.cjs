// Builds the painted art the game loads from the generated source sheets in assets/.
//   node tools/build-art.cjs
// Each sheet has a flat grey background. Pieces are cut out by colour distance from it,
// with the grey un-mixed from soft edges, trimmed, and packed into one WebP per sheet group.
// Writes assets/erwu.webp, garden.webp, play.webp, garden-plate-<season>.webp and art-manifest.js. Uses the same
// Playwright/Chromium overrides as the browser tests (see tests/README.md).
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// The storybook sheets (the "-v2" sources, generated from .scratch/art-direction/PROMPTS.md).
// Source regions [x, y, w, h] on each sheet. The generated sheets are not exact grids, and a
// few neighbours touch, so every region is set by hand; split lines sit in the gaps between.
// Options: `split` cuts a region into its separate parts (the stepping stones); `scale`
// shrinks pieces drawn small in the game; `ref` is a bed's rim width in source pixels, so
// beds from different sheets are drawn at one size; `collect`/`match` recolour a sheet to the
// colour of another (the walk was generated paler than the poses).
const ERWU = [
  { file: 'erwu-sprite-v2.png', collect: 'erwu', regions: {
    'sit-front': [34, 42, 256, 272], 'sit-drowsy': [318, 42, 240, 272], 'sit-content': [578, 42, 240, 272], curl: [830, 126, 280, 188],
    sniff: [6, 378, 284, 176], stalk: [291, 378, 295, 176], pounce: [578, 342, 264, 208], stretch: [850, 318, 268, 256],
    loaf: [22, 634, 248, 200], 'sit-side': [298, 566, 196, 280], 'belly-up': [490, 618, 360, 228], yawn: [851, 618, 263, 228],
    peek: [22, 898, 240, 144], 'peek-glance': [294, 890, 236, 148], 'peek-turn': [566, 890, 240, 152], 'peek-sleepy': [838, 910, 256, 132],
    'look-up': [630, 1054, 192, 272], 'sit-grumpy': [866, 1074, 244, 256], 'lie-side': [6, 1114, 353, 204], 'loaf-side': [360, 1114, 250, 204],
  } },
  // two rows of four; each frame is anchored on its nose so the body holds still
  { file: 'erwu-walk-v2.png', match: 'erwu', walk: true, regions: Object.fromEntries([
    [16, 156, 412, 236], [444, 152, 412, 240], [884, 152, 408, 240], [1320, 152, 420, 240],
    [20, 500, 412, 228], [448, 500, 412, 228], [884, 504, 412, 228], [1316, 500, 424, 232]].map((r, i) => [`walk-${i}`, r])) },
  // her swat and her delight, chest-high, from the play-pieces sheet; cropped above the painted
  // rim there, since her own basket's front is drawn over her
  { file: 'play-pieces.png', regions: { swat: [756, 818, 345, 206], delighted: [1102, 824, 296, 200] } },
];
const GARDEN = [
  { file: 'garden-pieces-v2.png', split: ['steps'], regions: {
    'rose-bed': [14, 14, 448, 408], fountain: [478, 26, 292, 392], log: [790, 94, 452, 344], cushion: [30, 454, 348, 208],
    stone: [466, 490, 300, 152], steps: [800, 436, 444, 230],
    'bed-empty': [18, 670, 387, 248], 'bed-seedlings': [435, 670, 377, 253], 'bed-young': [836, 670, 408, 256],
    'bed-full': [18, 919, 402, 318], grass: [421, 924, 406, 310], meadow: [828, 927, 414, 310],
  }, ref: { 'bed-empty': 385, 'bed-seedlings': 385, 'bed-young': 385, 'bed-full': 385 } },
  // a bed in flower for each kind that has one of its own (daisies flower in 'bed-full')
  { file: 'garden-beds.png', scale: 0.75, ref: 345, regions: {
    'bloom-cosmos': [6, 150, 352, 344], 'bloom-catnip': [366, 150, 356, 348], 'bloom-sunflower': [726, 118, 356, 380], 'bloom-moonflower': [1090, 146, 352, 352],
    'bloom-dandelion': [10, 598, 348, 332], 'bloom-bleeding-heart': [366, 566, 352, 364], 'bloom-strawberry': [726, 622, 356, 308], 'bloom-lavender': [1090, 578, 352, 352],
  } },
  // separate clumps: what play grows, and the flowers at the lawn's edges; they sway in the wind
  { file: 'garden-clumps.png', scale: 0.6, regions: {
    'clump-daisy': [26, 46, 276, 268], 'clump-forget': [346, 38, 276, 276], 'clump-cosmos': [658, 34, 256, 280], 'clump-lavender': [962, 18, 260, 296],
    'clump-clover': [30, 354, 268, 268], 'clump-buttercup': [346, 338, 268, 292], 'clump-foxglove': [658, 318, 260, 312], 'clump-bluebell': [962, 342, 268, 288],
    'clump-rose': [22, 638, 288, 284], 'clump-fern': [326, 650, 308, 268], 'clump-grass': [646, 646, 296, 272], 'clump-mushroom': [974, 710, 248, 216],
    'clump-wild': [22, 942, 296, 284], 'clump-sweetpea': [354, 930, 264, 292], 'clump-cornflower': [658, 946, 264, 276], 'clump-leafy': [954, 978, 284, 240],
  } },
];
const PLAY = [
  { file: 'play-pieces.png', regions: {
    'petal-white': [46, 74, 220, 140], 'petal-pink': [326, 66, 216, 148], centre: [622, 74, 160, 152], pollen: [926, 98, 104, 112], sun: [1142, 38, 212, 208],
    'bud-tulip': [62, 290, 196, 216], 'bud-rose': [322, 294, 208, 216], 'bud-peony': [590, 290, 208, 220], 'bud-poppy': [874, 290, 200, 220], 'bud-bell': [1138, 298, 196, 212],
    'open-tulip': [34, 534, 236, 252], 'open-rose': [294, 546, 244, 236], 'open-peony': [566, 542, 252, 244], 'open-poppy': [842, 546, 256, 244], 'open-bell': [1130, 530, 236, 260],
    basket: [18, 818, 313, 252], 'seed-pod': [386, 834, 120, 224], dandelion: [558, 818, 196, 244],
  } },
];
// Her basket's opening and outer rim, in source pixels: in the rose bed, and on its own.
const BASKET = { cx: 255, cy: 237, rx: 85, ry: 40, outerRx: 93, outerRy: 49, bottom: 318 };
const PLAY_BASKET = { cx: 178, cy: 925, rx: 125, ry: 50, outerRx: 153, outerRy: 80, bottom: 1062 };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const sheets = (group) => group.map((sheet) => ({
    ...sheet, src: 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'assets', sheet.file)).toString('base64'),
  }));
  const pack = (group) => page.evaluate(async ({ sheets }) => {
    const pieces = [], stats = {};
    // mean and spread of each colour channel over a piece's solid pixels
    const measure = (cv) => {
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, sum = [0, 0, 0], sq = [0, 0, 0];
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { n++; for (let k = 0; k < 3; k++) { sum[k] += d[i + k]; sq[k] += d[i + k] ** 2; } }
      return { n, sum, sq };
    };
    for (const sheet of sheets) {
      const split = sheet.split || [];
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
      const made = [];
      for (const [name, r] of Object.entries(sheet.regions)) {
        const P = parts(...r), big = P.out.filter((p) => p.box[4] >= 80).sort((a, b) => b.box[4] - a.box[4]);
        const groups = split.includes(name)
          ? big.filter((p) => p.box[4] > 400).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]).map((p, i) => [`${name.replace(/s$/, '')}-${i}`, [p.id]])
          : [[name, big.map((p) => p.id)]];
        for (const [n, ids] of groups) {
          const c = cut(P, ids);
          // anchor: where the piece meets the ground (walk frames are re-anchored below)
          made.push({ name: n, ...c, ax: c.w / 2, ay: c.h,
            ref: typeof sheet.ref === 'number' ? sheet.ref : sheet.ref && sheet.ref[n] });
        }
      }
      if (sheet.collect) {
        const t = stats[sheet.collect] = { n: 0, sum: [0, 0, 0], sq: [0, 0, 0] };
        for (const m of made.map((p) => measure(p.canvas))) { t.n += m.n; for (let k = 0; k < 3; k++) { t.sum[k] += m.sum[k]; t.sq[k] += m.sq[k]; } }
      }
      if (sheet.match) {
        // move this sheet's colours onto the collected sheet's: same mean, same spread, per channel
        const from = { n: 0, sum: [0, 0, 0], sq: [0, 0, 0] }, to = stats[sheet.match];
        for (const m of made.map((p) => measure(p.canvas))) { from.n += m.n; for (let k = 0; k < 3; k++) { from.sum[k] += m.sum[k]; from.sq[k] += m.sq[k]; } }
        const ms = (t, k) => { const m = t.sum[k] / t.n; return [m, Math.sqrt(Math.max(1, t.sq[k] / t.n - m * m))]; };
        for (const p of made) {
          const cg = p.canvas.getContext('2d'), d = cg.getImageData(0, 0, p.w, p.h);
          for (let i = 0; i < d.data.length; i += 4) for (let k = 0; k < 3; k++) {
            const [m0, s0] = ms(from, k), [m1, s1] = ms(to, k);
            d.data[i + k] = Math.max(0, Math.min(255, (d.data[i + k] - m0) / s0 * s1 + m1));
          }
          cg.putImageData(d, 0, 0);
        }
      }
      if (sheet.walk) {
        // A walk must hold still: the generated frames differ a little in size (the second row
        // is drawn ~4% smaller) and drift sideways. Scale every frame to the tallest, and anchor
        // each on its torso (the centroid of its upper body) with the feet on the ground line.
        const H = Math.max(...made.map((p) => p.h));
        for (const p of made) {
          const k = H / p.h, w = Math.round(p.w * k), sc = document.createElement('canvas'); sc.width = w; sc.height = H;
          const sg = sc.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(p.canvas, 0, 0, w, H);
          const d = sg.getImageData(0, 0, w, H).data; let cx = 0, n = 0;
          for (let y = 0; y < H * 0.6; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 128) { cx += x; n++; }
          Object.assign(p, { canvas: sc, w, h: H, ax: cx / n, ay: H });
        }
      }
      for (const p of made) {
        const k = sheet.scale || 1;
        if (k !== 1) {
          const w = Math.round(p.w * k), h = Math.round(p.h * k), sc = document.createElement('canvas'); sc.width = w; sc.height = h;
          const sg = sc.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(p.canvas, 0, 0, w, h);
          Object.assign(p, { canvas: sc, w, h, ax: p.ax * k, ay: h, ref: p.ref && p.ref * k });
        }
        pieces.push(p);
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
    const frames = Object.fromEntries(pieces.map((p) => [p.name, [p.x, p.y, p.w, p.h, Math.round(p.ax), p.ay, p.sx, p.sy, ...(p.ref ? [Math.round(p.ref)] : [])]]));
    return { url: out.toDataURL('image/webp', 0.9), frames, size: [out.width, out.height] };
  }, { sheets: sheets(group) });

  const erwu = await pack(ERWU), garden = await pack(GARDEN), play = await pack(PLAY);
  // the garden backdrop, one per season (living-garden ticket 08): bare borders that play fills
  // in, painted from the same composition so the fountain and log stand in the same places
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const reencode = (file, type) => page.evaluate(async (src) => {
    const i = new Image(); i.src = src; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0);
    return c.toDataURL('image/webp', 0.86);
  }, `data:${type};base64,` + fs.readFileSync(path.join(root, 'assets', file)).toString('base64'));
  const plates = {};
  for (const season of SEASONS) plates[season] = await reencode(`garden-bare-${season}.webp`, 'image/webp');
  const write = (file, url) => { const buf = Buffer.from(url.split(',')[1], 'base64'); fs.writeFileSync(path.join(root, 'assets', file), buf); return buf.length; };
  const sizes = { erwu: write('erwu.webp', erwu.url), garden: write('garden.webp', garden.url), play: write('play.webp', play.url) };
  for (const season of SEASONS) sizes[season] = write(`garden-plate-${season}.webp`, plates[season]);
  const manifest = {
    note: 'frame: [x, y, w, h, anchorX, anchorY, sourceX, sourceY, bedRimWidth?]; anchors are where a piece meets the ground',
    erwu: { src: 'assets/erwu.webp', size: erwu.size, frames: erwu.frames },
    garden: { src: 'assets/garden.webp', size: garden.size, frames: garden.frames, basket: BASKET },
    play: { src: 'assets/play.webp', size: play.size, frames: play.frames, basket: PLAY_BASKET },
    // the backdrop for each season (summer is the default), and where its fountain and log
    // stand (fractions of its width and height; the same in every season)
    lawn: { src: 'assets/garden-plate-summer.webp', seasons: Object.fromEntries(SEASONS.map((s) => [s, `assets/garden-plate-${s}.webp`])),
      fountain: { x: 0.205, y: 0.268, width: 0.27 }, log: { x: 0.835, y: 0.262, width: 0.29 } },
  };
  fs.writeFileSync(path.join(root, 'art-manifest.js'),
    '/* Generated by tools/build-art.cjs from the painted source sheets in assets/. Do not edit by hand. */\n' +
    "(function (root) { 'use strict';\n  const ART = " + JSON.stringify(manifest) + ";\n" +
    "  if (typeof module === 'object' && module.exports) module.exports = ART; else root.BloomArt = ART;\n})(typeof globalThis === 'object' ? globalThis : this);\n");
  for (const [k, v] of Object.entries({ erwu, garden, play })) console.log(`${k}.webp ${v.size.join('x')} ${(sizes[k] / 1024).toFixed(0)} KB, ${Object.keys(v.frames).length} pieces`);
  for (const season of SEASONS) console.log(`garden-plate-${season}.webp ${(sizes[season] / 1024).toFixed(0)} KB`);
  await browser.close();
})().catch((e) => { console.error(e); process.exitCode = 1; });
