// Renders the app icon from the painted art: Erwu peeking from her basket at the heart of the
// daisy, on the garden's lawn. Writes the iOS icon (1024², opaque, as App Store Connect requires),
// the web icons, and a plain cream launch image.
//   node tools/build-icon.cjs     (uses the BLOOM_PLAYWRIGHT / BLOOM_CHROMIUM overrides in tests/README.md)
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const ART = require(path.join(root, 'art-manifest.js'));
const data = (f) => `data:image/webp;base64,${fs.readFileSync(path.join(root, f)).toString('base64')}`;

// App Store icons must have no alpha channel, and canvas always encodes one: write a plain RGB PNG.
function rgbPng(S, rgba) {
  const raw = Buffer.alloc(S * (S * 3 + 1));
  for (let y = 0; y < S; y++) {
    raw[y * (S * 3 + 1)] = 0;
    for (let x = 0; x < S; x++) for (let k = 0; k < 3; k++) raw[y * (S * 3 + 1) + 1 + x * 3 + k] = rgba[(y * S + x) * 4 + k];
  }
  const crc = (buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (type, body) => { const len = Buffer.alloc(4), t = Buffer.from(type), sum = Buffer.alloc(4); len.writeUInt32BE(body.length); sum.writeUInt32BE(crc(Buffer.concat([t, body]))); return Buffer.concat([len, t, body, sum]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const out = await page.evaluate(async ({ ART, src }) => {
    const load = async (s) => { const i = new Image(); i.src = s; await i.decode(); return i; };
    const [plate, play, erwu] = await Promise.all([load(src.plate), load(src.play), load(src.erwu)]);
    const piece = (g, img, f, cx, bottom, w, rot = 0) => {
      const [sx, sy, fw, fh, ax, ay] = f, k = w / fw;
      g.save(); g.translate(cx, bottom); g.rotate(rot);
      g.drawImage(img, sx, sy, fw, fh, -ax * k, -ay * k, fw * k, fh * k); g.restore();
    };
    function icon(S) {
      const c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
      // the sunlit middle of the lawn
      const cw = plate.naturalWidth * 0.62, ch = cw;
      g.drawImage(plate, (plate.naturalWidth - cw) / 2, plate.naturalHeight * 0.44 - ch / 2, cw, ch, 0, 0, S, S);
      g.fillStyle = 'rgba(243,236,221,0.28)'; g.fillRect(0, 0, S, S);
      // the daisy: painted white petals around the middle
      const petal = ART.play.frames['petal-white'], [px, py, pw, ph] = petal;
      for (let i = 0; i < 12; i++) {
        g.save(); g.translate(S / 2, S / 2); g.rotate(i / 12 * Math.PI * 2 + 0.1); g.scale(-1, 1);
        const len = S * 0.44, wid = len * ph / pw * 1.25;
        g.drawImage(play, px, py, pw, ph, -S * 0.1 - len, -wid / 2, len, wid);
        g.restore();
      }
      // Erwu peeking from her basket, drawn as in a run: basket, Erwu, then the basket's front
      const b = ART.play.basket, bf = ART.play.frames.basket, k = S * 0.62 / bf[2];
      const bx = S / 2 - (b.cx - bf[6]) * k, by = S * 0.52 - (b.cy - bf[7]) * k;
      g.drawImage(play, bf[0], bf[1], bf[2], bf[3], bx, by, bf[2] * k, bf[3] * k);
      const peek = ART.erwu.frames.peek, pwid = b.rx * k * 2 * 0.82;
      piece(g, erwu, peek, S / 2, S * 0.52 + (b.bottom - b.cy) * k * 0.42, pwid);
      g.save(); g.beginPath();
      const rx = b.rx * k, ry = b.ry * k, ox = b.outerRx * k + 2, oy = b.outerRy * k, bot = (b.bottom - b.cy) * k;
      g.translate(S / 2, S * 0.52);
      g.moveTo(-ox, 0); g.lineTo(-rx, 0); g.ellipse(0, 0, rx, ry, 0, Math.PI, 0, true); g.lineTo(ox, 0);
      g.lineTo(ox * 0.95, bot - oy * 0.55); g.ellipse(0, bot - oy * 0.55, ox * 0.95, oy * 0.5, 0, 0, Math.PI); g.closePath(); g.clip();
      g.translate(-S / 2, -S * 0.52);
      g.drawImage(play, bf[0], bf[1], bf[2], bf[3], bx, by, bf[2] * k, bf[3] * k);
      g.restore();
      return S === 1024 ? { rgba: Array.from(g.getImageData(0, 0, S, S).data) } : c.toDataURL('image/png');
    }
    const splash = document.createElement('canvas'); splash.width = splash.height = 2732;
    const sg = splash.getContext('2d'); sg.fillStyle = '#F3ECDD'; sg.fillRect(0, 0, 2732, 2732);
    return { 1024: icon(1024), 512: icon(512), 192: icon(192), 180: icon(180), splash: splash.toDataURL('image/png') };
  }, { ART, src: { plate: data(ART.lawn.src), play: data(ART.play.src), erwu: data(ART.erwu.src) } });
  const write = (f, url) => fs.writeFileSync(path.join(root, f), Buffer.from(url.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'), rgbPng(1024, out[1024].rgba));
  write('icons/icon-512.png', out[512]); write('icons/icon-192.png', out[192]); write('icons/apple-touch-icon.png', out[180]);
  for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) write(`ios/App/App/Assets.xcassets/Splash.imageset/${f}`, out.splash);
  console.log('icons and launch image written');
  await browser.close();
})().catch((e) => { console.error(e); process.exitCode = 1; });
