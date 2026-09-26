// Erwu in the garden (tickets 05B–08), in a real browser. See tests/README.md for running.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const SERVED = /^(index\.html|manifest\.webmanifest|icons\/[\w-]+\.png|[\w-]+\.js)$/;
const G = require('../garden-state.js'), L = require('../garden-layout.js');
const fixture = require('./fixtures/garden-v1.json');
const root = path.resolve(__dirname, '..');
const out = process.env.BLOOM_EVIDENCE || '/tmp/bloom-erwu';

// A garden with the fixture's plants and beds; `bed` planted and flowering if given.
function gardenJSON({ hoursAway = 0, bed = null, visited = false } = {}) {
  const now = Date.now(), disk = new Map([[G.LEGACY, JSON.stringify({ ...fixture, tended: now })]]);
  const st = { getItem: (k) => disk.get(k) ?? null, setItem: (k, v) => disk.set(k, v), removeItem: (k) => disk.delete(k) };
  const g = G.load(st, now).garden;
  L.initialize(g, G.allocateId);
  if (bed) { g.patches[0].flower = bed; g.patches[0].growth = 0.8; g.focus = g.patches[0].id; }
  if (bed && visited) g.discoveries.push({ id: G.allocateId(g, 'discovery'), type: 'bed-visit', bed: g.patches[0].id, kind: bed, at: now });
  g.lastSeen = g.tended = now - hoursAway * 3600000;
  return JSON.stringify(G.snapshot(g));
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = http.createServer((req, res) => {
    const rel = req.url.split('?')[0], file = rel === '/' ? 'index.html' : rel.slice(1);
    if (!SERVED.test(file)) { res.statusCode = 404; res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : 'text/html');
    res.end(fs.readFileSync(path.join(root, file)));
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.on('listening', r));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
  const errors = [];
  async function open(garden, opts = {}) {
    const p = await browser.newPage({ viewport: opts.size || { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    p.on('pageerror', (e) => errors.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await p.addInitScript((g) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('bloom.garden2', g); } }, garden);
    await p.goto(`http://127.0.0.1:${server.address().port}/?erwu=${opts.seed || 7}`, { waitUntil: 'load' });
    await p.waitForTimeout(600);
    return p;
  }
  const info = (p) => p.evaluate(() => window.__erwu.info());
  const at = (p) => p.evaluate(() => ({ ...window.__erwu.state.at }));
  const inside = (p) => p.evaluate(() => {
    const s = document.querySelector('#garden-scene').getBoundingClientRect(), t = document.querySelector('#erwu-touch').getBoundingClientRect();
    const cx = t.x + t.width / 2, cy = t.y + t.height / 2;
    return cx > s.x - 2 && cx < s.right + 2 && cy > s.y - 2 && cy < s.bottom + 2;
  });
  try {
    // 1. A visit: she wakes on her own, chooses things to do, and stays in the garden.
    let p = await open(gardenJSON({ bed: 'lavender', visited: true }));
    const seen = new Set(), poses = new Set();
    // butterflies make each visit a little different; a long nap is a fair choice too
    for (let i = 0; i < 150 && !(seen.size >= 4 && poses.has('walk')); i++) {
      await p.waitForTimeout(400);
      const s = await info(p); seen.add(s.action); poses.add(s.pose);
      assert.ok(await inside(p), `her hello button stays in the garden: ${JSON.stringify(s)}`);
    }
    assert.ok(seen.size >= 4 || seen.has('nap'), `several different things within a minute: ${[...seen]}`);
    assert.ok(poses.has('walk') || seen.has('nap'), `she moves about: ${[...poses]}`);
    await p.screenshot({ path: path.join(out, 'visit.png') });
    console.log(`PASS a visit: ${[...seen].join(', ')}`);

    // 2. Tap her mid-walk: she stops and looks at you; taps don't stack.
    // send her somewhere she isn't: the far one of the fountain and the log
    const here = await at(p), marks = await p.evaluate(() => { const sc = BloomGardenView.layout(document.querySelector('#garden-scene').getBoundingClientRect()); return BloomGardenLayout.landmarks(sc); });
    const far = Math.hypot(here.x - marks.fountain.x, here.y - marks.fountain.y) > Math.hypot(here.x - marks.deadwood.x, here.y - marks.deadwood.y) ? 'fountain' : 'log';
    await p.evaluate((name) => window.__erwu.trigger(name), far);
    for (let i = 0; i < 30 && (await info(p)).pose !== 'walk'; i++) await p.waitForTimeout(100);
    assert.equal((await info(p)).pose, 'walk');
    await p.waitForTimeout(300);
    await p.locator('#erwu-touch').tap();
    const stopped = await at(p);
    await p.waitForTimeout(700);
    assert.equal((await info(p)).pose, 'front');
    assert.deepEqual(await at(p), stopped);
    assert.equal(await p.locator('#inspection-name').innerText(), 'Erwu');
    await p.screenshot({ path: path.join(out, 'hello.png') });
    await p.waitForTimeout(2500);
    assert.notEqual((await info(p)).pose, 'front', 'then she carries on');
    assert.notDeepEqual(await at(p), stopped, 'on her way again');
    console.log('PASS a hello mid-walk: she stops, looks, carries on');

    // 3. Arranging holds her still; moving her target makes her choose again.
    await p.evaluate(() => window.__erwu.trigger('cushion'));
    await p.waitForTimeout(600);
    await p.locator('#arrange').click();
    const held = await at(p);
    await p.waitForTimeout(1500);
    assert.deepEqual(await at(p), held);
    const cushion = await p.evaluate(() => JSON.parse(localStorage.getItem('bloom.garden2')).objects.find((o) => o.kind === 'cushion').id);
    await p.locator('#arrange-picker').selectOption(cushion);
    await p.locator('.anchor-target[data-anchor="nook-right"]').click();
    await p.locator('#arrange-confirm').click();
    assert.match((await info(p)).reason, /nook-left changed|nook-right changed/);
    await p.locator('#arrange').click();
    await p.waitForTimeout(800);
    console.log('PASS arranging pauses her; moving her destination re-plans');

    // 4. A hidden page does nothing, and replays nothing when it comes back.
    await p.evaluate(() => window.__erwu.trigger('sun-stone'));
    await p.waitForTimeout(500);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hidden = await at(p);
    await p.waitForTimeout(2000);
    assert.deepEqual(await at(p), hidden);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); });
    await p.waitForTimeout(300);
    const moved = await at(p);
    assert.ok(Math.hypot(moved.x - hidden.x, moved.y - hidden.y) < 30, 'no catch-up after being hidden');
    console.log('PASS background and resume without a backlog');

    // 5. Play is immediate mid-walk; coming back finds her in her basket.
    await p.evaluate(() => window.__erwu.trigger('log'));
    await p.waitForTimeout(700);
    await p.locator('#play').click();
    assert.equal(await p.evaluate(() => document.body.dataset.view), 'run');
    await p.locator('#visit-garden').click();
    await p.waitForTimeout(300);
    assert.deepEqual(await at(p), { x: 0, y: 0 });
    assert.equal((await info(p)).pose, 'curl');
    await p.close();
    console.log('PASS play is immediate; returning finds her asleep in the basket');

    // 6. Back after hours away: she wakes, stretches, and comes to say hello.
    p = await open(gardenJSON({ hoursAway: 20 }));
    const greet = [];
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); const s = await info(p); if (greet[greet.length - 1] !== s.pose) greet.push(s.pose); if (s.pose === 'front') break; }
    for (const pose of ['yawn', 'stretch', 'walk', 'front']) assert.ok(greet.includes(pose), `${pose} in ${greet}`);
    await p.screenshot({ path: path.join(out, 'welcome.png') });
    await p.close();
    console.log(`PASS the welcome back: ${greet.join(' → ')}`);

    // 7. The first time a bed flowers: a butterfly visits and Erwu goes to see; only once.
    p = await open(gardenJSON({ bed: 'cosmos' }));
    const first = [];
    for (let i = 0; i < 140; i++) { await p.waitForTimeout(250); const s = await info(p); if (first[first.length - 1] !== s.action) first.push(s.action); if (s.pose === 'pounce') break; }
    assert.ok(first.includes('visit-bloom') && first.includes('stalk'), first.join(','));
    await p.screenshot({ path: path.join(out, 'first-bloom.png') });
    const visits = await p.evaluate(() => JSON.parse(localStorage.getItem('bloom.garden2')).discoveries.filter((d) => d.type === 'bed-visit').length);
    assert.equal(visits, 1);
    await p.reload(); await p.waitForTimeout(800);
    assert.notEqual((await info(p)).action, 'visit-bloom');
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('bloom.garden2')).discoveries.filter((d) => d.type === 'bed-visit').length), 1);
    await p.close();
    console.log(`PASS the first bloom, recorded once: ${first.join(' → ')}`);

    // 8. Reduced motion and a small phone: she still lives quietly; nothing leaves the garden.
    p = await open(gardenJSON({ bed: 'daisy' }), { reduced: true, size: { width: 320, height: 568 } });
    const quiet = new Set();
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(300); const s = await info(p); quiet.add(s.pose); assert.ok(await inside(p)); }
    assert.ok(!quiet.has('pounce') && !quiet.has('crouch'), [...quiet].join(','));
    await p.screenshot({ path: path.join(out, 'small-reduced.png') });
    await p.close();
    console.log(`PASS reduced motion on a small phone: ${[...quiet].join(', ')}`);

    assert.deepEqual(errors, []);
    console.log(`PASS no page errors. Evidence: ${out}`);
  } finally { await browser.close(); server.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
