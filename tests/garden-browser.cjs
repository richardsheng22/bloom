// Run with a locally available Playwright and Chromium; see tests/README.md.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
// Serve the page, its root-level scripts, and install files; new modules need no allowlist edit.
const SERVED = /^(index\.html|manifest\.webmanifest|(?:icons|assets)\/[\w-]+\.(?:png|webp)|fonts\/[\w-]+\.(?:css|woff2)|[\w-]+\.js)$/;
const { KEY, gardenV4, plants: fixturePlants } = require('./fixtures/garden-v4.cjs');
const legacy = require('./fixtures/garden-v1.json');
const root = path.resolve(__dirname, '..');
const output = process.env.BLOOM_EVIDENCE || '/tmp/bloom-ticket01';
const NOW = Date.parse('2026-09-29T16:00:00Z'); // noon in Toronto; both 0h and 12h stay in this garden day
const HOUR = 3600000;
const run = { v: 3, turn: 8, ballCount: 7, petalNext: true, pawReady: false, charges: [1,0,0,1,0,0,0,0,0,0],
  items: [{ kind: 'shape', sector: 2, ring: 5, hp: 3, maxHp: 3, sp: 0, ci: 0 }, { kind: 'orb', sector: 6, ring: 7 }] };
// What v0.9 left behind; 1.0 leaves it exactly as it is (living-garden ticket 02).
const oldSaves = { 'bloom.garden1': JSON.stringify(legacy), 'bloom.garden2': JSON.stringify({ v: 3, plants: legacy.plants.map((p, i) => ({ id: `plant-${i + 1}`, ...p })), rest: 0.5 }) };
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((req, res) => {
    const rel = req.url.split('?')[0];
    const file = rel === '/' ? 'index.html' : rel.slice(1);
    if (!SERVED.test(file)) { res.statusCode=404; res.end(); return; }
    res.setHeader('Content-Type', { js: 'application/javascript', html: 'text/html', png: 'image/png', webp: 'image/webp', css: 'text/css', woff2: 'font/woff2' }[file.split('.').pop()] || 'application/json');
    res.end(fs.readFileSync(path.join(root,file)));
  }).listen(0,'127.0.0.1');
  await new Promise(r => server.on('listening',r));
  let browser;
  const errors = [];
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
    // `hours` away from a garden last seen at NOW; `seed` is what's in storage beforehand.
    async function pageFor(hours, opts = {}) {
      const base = opts.now ?? NOW;
      const page = await browser.newPage({ viewport: opts.small ? {width:320,height:568} : {width:390,height:844}, deviceScaleFactor:1,
        timezoneId:opts.timezoneId || 'America/Toronto', isMobile:true, hasTouch:true, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
      page.on('pageerror', e => errors.push(e.message));
      // No network dependency: use the existing system font fallbacks for this suite.
      await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
      const seed = opts.seed || { ...oldSaves, [KEY]: gardenV4({ now: NOW, bed: 'daisy', growth: 0.6 }), 'bloom.run3': JSON.stringify(run) };
      await page.addInitScript(({seed,hours,NOW,opts}) => {
        Date.now = () => NOW + hours * 3600000;
        if (!sessionStorage.getItem('fixture')) {
          sessionStorage.setItem('fixture','1');
          for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
        }
        if (opts.failWrites) Storage.prototype.setItem = function() { throw new DOMException('Quota exceeded','QuotaExceededError'); };
      }, {seed,hours,NOW:base,opts});
      await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'load'});
      await page.waitForTimeout(1800);
      return page;
    }
    const data = page => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
    const stored = (page, k) => page.evaluate((k) => localStorage.getItem(k), k);

    // A first launch of 1.0: a new, bare garden; v0.9's saves and run are left alone or set aside.
    const first = await pageFor(0, { seed: { ...oldSaves, 'bloom.run3': JSON.stringify(run) } });
    const bare = await data(first);
    assert.equal(bare.v, 4);
    assert.ok(bare.plants.length <= 3 && bare.plants.every((p) => p.k === 'grass'), 'a bare garden: a few tufts of grass');
    for (const [k, v] of Object.entries(oldSaves)) assert.equal(await stored(first, k), v, `${k} untouched`);
    assert.equal(JSON.parse(await stored(first, 'bloom.run3')).turn, 1, 'the old run is set aside for a new one');
    assert.equal(await first.locator('#play').innerText(), 'Play');
    await first.screenshot({path:path.join(output,'bare-start.png')});
    await first.close();
    console.log('PASS 1.0 starts bare and leaves older saves untouched');

    for (const hours of [0,12,72,168,720]) {
      const page = await pageFor(hours);
      const g = await data(page);
      // everything owned is still there, undimmed, in the same place and order; it only grows
      const kept = g.plants.slice(0, fixturePlants.length);
      assert.deepEqual(kept.map(({ a, d, k, s }) => ({ a, d, k, s })), fixturePlants.map(({ a, d, k, s }) => ({ a, d, k, s })));
      assert.ok(kept.every((p, i) => p.g >= fixturePlants[i].g));
      assert.equal(g.rest, 0);
      for (const [k, v] of Object.entries(oldSaves)) assert.equal(await stored(page, k), v);
      assert.equal(await page.locator('#play').innerText(),'Continue · turn 8');
      // The run's own fields are unchanged; the garden log and special-turn schedule sit beside them.
      const {log,special,...saved}=await page.evaluate(()=>JSON.parse(localStorage.getItem('bloom.run3')));
      assert.deepEqual(saved,run); assert.deepEqual(log.seeds,[]);
      assert.deepEqual(special,{next:Math.max(12,run.turn+6),kind:null,last:null,bonus:0});
      assert.doesNotMatch(await page.locator('#t-note').innerText(),/missed|kept what|lost|resting/i);
      // growth on its own: one day's worth per garden day away, at most a week (ticket 01)
      const days = Math.min(7, Math.floor(hours / 24));
      const bed = g.patches.find((b) => b.flower === 'daisy');
      assert.ok(Math.abs(bed.growth - Math.min(1, 0.6 + 0.03 * days)) < 1e-9, `bed growth after ${hours}h: ${bed.growth}`);
      assert.ok(g.plants.length >= fixturePlants.length && g.plants.length <= fixturePlants.length + days);
      if (hours===0||hours===168) await page.screenshot({path:path.join(output,hours===0?'awake.png':'a-week-away.png')});
      if (hours===168) {
        await page.reload(); await page.waitForTimeout(1800);
        const again = await data(page);
        assert.equal(again.patches.find((b) => b.flower === 'daisy').growth, bed.growth, 'a reload never applies growth twice');
        assert.equal(again.plants.length, g.plants.length);
      }
      await page.close();
      console.log(`PASS ownership, growth on its own, resume, copy: ${hours}h`);
    }
    // Explicit local garden dates: less than 24 elapsed hours can cross 04:00.
    for (const timezoneId of ['UTC', 'America/Toronto']) {
      const offset = timezoneId === 'UTC' ? 'Z' : '-04:00';
      for (const [clock, hours, days, date] of [['12:00',12,0,29],['03:30',1,1,28]]) {
        const now = Date.parse(`2026-09-29T${clock}:00${offset}`);
        const g = JSON.parse(gardenV4({now,bed:'daisy',growth:0.6}));
        g.time.day = g.time.grown = Date.UTC(2026,8,date)/86400000;
        const p = await pageFor(hours,{now,timezoneId,seed:{[KEY]:JSON.stringify(g),'bloom.run3':JSON.stringify(run)}});
        const grown = (await data(p)).patches[0].growth;
        assert.ok(Math.abs(grown-(0.6+days*0.03))<1e-9,`${timezoneId} ${clock} + ${hours}h`);
        await p.reload();await p.waitForTimeout(300);
        assert.equal((await data(p)).patches[0].growth,grown,'reopening never repeats growth');
        await p.close();
      }
      console.log(`PASS explicit 04:00 boundary and no duplicate growth: ${timezoneId}`);
    }
    const small=await pageFor(168,{small:true,reduced:true});
    await small.screenshot({path:path.join(output,'week-away-small-reduced.png')});
    assert.ok(await small.locator('#play').isVisible());
    await small.locator('#play').click(); await small.waitForTimeout(600);
    const ids=(await data(small)).plants.map(p=>p.id);
    // Launch through the real pointer handlers, then background immediately.
    await small.mouse.move(160,450);await small.mouse.down();await small.mouse.move(160,515,{steps:8});await small.waitForTimeout(100);await small.mouse.up();
    await small.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const hiddenSave=await data(small);
    await small.waitForTimeout(800);
    assert.deepEqual(await data(small),hiddenSave);
    assert.ok(ids.every(id=>hiddenSave.plants.some(p=>p.id===id)));
    await small.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
    await small.waitForFunction(()=>document.querySelector('#turn').textContent==='9',{timeout:35000});
    const played=await data(small);
    assert.ok(ids.every(id=>played.plants.some(p=>p.id===id)));
    assert.equal(played.time.turns, hiddenSave.time.turns + 1, 'the turn counts toward the day');
    assert.equal(new Set(played.plants.map(p=>p.id)).size,played.plants.length);
    await small.reload();await small.waitForTimeout(800);
    assert.equal(await small.locator('#play').innerText(),'Continue · turn 9');
    console.log('PASS reduced motion, small phone, mid-shot background/resume, the day\'s turns');
    await small.close();
    const failed=await pageFor(72,{failWrites:true,seed:{...oldSaves}});
    assert.equal(await stored(failed, KEY),null);
    for (const [k, v] of Object.entries(oldSaves)) assert.equal(await stored(failed, k), v);
    assert.match(await failed.locator('#t-note').innerText(),/could not be saved/);
    await failed.close();
    const good = gardenV4({ now: NOW });
    const recovered=await pageFor(72,{seed:{[KEY]:'{broken',[KEY + '.backup']:good}});
    assert.deepEqual((await data(recovered)).plants.slice(0, fixturePlants.length).map(({ a, d, k, s }) => ({ a, d, k, s })), fixturePlants.map(({ a, d, k, s }) => ({ a, d, k, s })));
    await recovered.close();
    const unreadable=await pageFor(72,{seed:{[KEY]:'{broken'}});
    assert.equal(await stored(unreadable, KEY),'{broken');
    assert.match(await unreadable.locator('#t-note').innerText(),/untouched/);
    await unreadable.close();
    assert.deepEqual(errors,[]);
    console.log('PASS failed writes, recovery from the backup, unreadable saves untouched, no runtime errors');
    console.log(`Evidence: ${output}`);
  } finally { if(browser)await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1});
