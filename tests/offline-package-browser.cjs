// iOS ticket 02: the staged package plays with no network at all. Serves only www/ (as the app
// bundles it), aborts every request to any other origin, and checks the bundled fonts and art
// load, a run can be played, and a bed can be planted. See tests/README.md for running.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { FILES, stage } = require('../tools/stage-web.cjs');
const root = path.resolve(__dirname, '..'), www = path.join(root, 'www');
const out = process.env.BLOOM_EVIDENCE || '/tmp/bloom-offline-package';
const TYPES = { html: 'text/html', js: 'application/javascript', css: 'text/css', webmanifest: 'application/manifest+json',
  webp: 'image/webp', png: 'image/png', woff2: 'font/woff2', txt: 'text/plain' };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const staged = stage();
  // the package holds the listed files and nothing else
  const shipped = [];
  (function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) e.isDirectory() ? walk(path.join(dir, e.name)) : shipped.push(path.relative(www, path.join(dir, e.name))); })(www);
  assert.deepEqual(shipped.sort(), [...FILES].sort());
  assert.ok(!shipped.some((f) => /^(\.scratch|tests|tools|build)\/|-v2\.png$|sprite\.png$/.test(f)), 'no scratch, sources, tests or tools');
  console.log(`PASS package holds exactly the ${staged.files} listed files (${(staged.bytes / 1024).toFixed(0)} KB)`);

  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]), file = rel === '/' ? 'index.html' : rel.slice(1);
    const full = path.join(www, file);
    if (!full.startsWith(www) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.statusCode = 404; res.end(); return; }
    res.setHeader('Content-Type', TYPES[file.split('.').pop()] || 'application/octet-stream');
    res.end(fs.readFileSync(full));
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.on('listening', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
  const errors = [], outside = [], missing = [];
  try {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('response', (r) => { if (r.status() >= 400) missing.push(r.url()); });
    // no network: anything not served by the package is refused
    await p.route('**/*', (r) => r.request().url().startsWith(origin) ? r.continue() : (outside.push(r.request().url()), r.abort()));
    await p.goto(origin + '/', { waitUntil: 'load' });
    await p.waitForFunction(() => document.body.classList.contains('painted'), null, { timeout: 10000 });
    await p.evaluate(() => document.fonts.ready);
    const fonts = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    for (const family of ['Fraunces', 'Bricolage Grotesque']) assert.ok(fonts.includes(family), `${family} loaded from the package: ${fonts}`);
    assert.deepEqual(outside, [], 'no request leaves the package');
    await p.screenshot({ path: path.join(out, 'garden-offline.png') });
    console.log('PASS offline: bundled fonts and painted art load, nothing leaves the package');

    // plant the first bed
    await p.locator('.anchor-target:not([hidden])').first().click();
    await p.locator('.bed-chip').first().click();
    await p.locator('#bed-plant').click();
    const planted = await p.evaluate(() => JSON.parse(localStorage.getItem('bloom.garden2')).patches.filter((b) => b.flower).length);
    assert.ok(planted >= 1, 'a bed is planted');
    await p.locator('#inspection-close').click();
    console.log('PASS offline: a bed is planted and saved');

    // a run: play, take three shots
    await p.locator('#play').click();
    assert.equal(await p.evaluate(() => document.body.dataset.view), 'run');
    const box = await p.locator('#stage').boundingBox(), x = box.x + box.width / 2, y = box.y + box.height * 0.7;
    for (let i = 0; i < 3; i++) {
      await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 60 - i * 50, y + 20, { steps: 6 }); await p.mouse.up();
      await p.waitForFunction(() => JSON.parse(localStorage.getItem('bloom.run3') || '{}').turn > 0, null, { timeout: 15000 });
      await p.waitForTimeout(4500);
    }
    const run = await p.evaluate(() => JSON.parse(localStorage.getItem('bloom.run3')));
    assert.ok(run && run.turn >= 2, `turns advance offline: ${run && run.turn}`);
    await p.screenshot({ path: path.join(out, 'run-offline.png') });
    console.log(`PASS offline: a run plays (turn ${run.turn})`);
    assert.deepEqual(outside, []);
    assert.deepEqual(missing, [], 'every requested file is in the package');
    assert.deepEqual(errors, []);
    console.log(`PASS no page errors. Evidence: ${out}`);
  } finally { await browser.close(); server.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
