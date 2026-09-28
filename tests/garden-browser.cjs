// Run with a locally available Playwright and Chromium; see tests/README.md.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
// Serve the page, its root-level scripts, and install files; new modules need no allowlist edit.
const SERVED = /^(index\.html|manifest\.webmanifest|(?:icons|assets)\/[\w-]+\.(?:png|webp)|[\w-]+\.js)$/;
const fixture = require('./fixtures/garden-v1.json');
const G = require('../garden-state.js');
const root = path.resolve(__dirname, '..');
const output = process.env.BLOOM_EVIDENCE || '/tmp/bloom-ticket01';
const NOW = fixture.tended;
const run = { v: 3, turn: 8, ballCount: 7, petalNext: true, pawReady: false, charges: [1,0,0,1,0,0,0,0,0,0],
  items: [{ kind: 'shape', sector: 2, ring: 5, hp: 3, maxHp: 3, sp: 0, ci: 0 }, { kind: 'orb', sector: 6, ring: 7 }] };
const clone = x => JSON.parse(JSON.stringify(x));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((req, res) => {
    const rel = req.url.split('?')[0];
    const file = rel === '/' ? 'index.html' : rel.slice(1);
    if (!SERVED.test(file)) { res.statusCode=404; res.end(); return; }
    res.setHeader('Content-Type', { js: 'application/javascript', html: 'text/html', png: 'image/png', webp: 'image/webp' }[file.split('.').pop()] || 'application/json');
    res.end(fs.readFileSync(path.join(root,file)));
  }).listen(0,'127.0.0.1');
  await new Promise(r => server.on('listening',r));
  let browser;
  const errors = [];
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
    async function pageFor(hours, opts = {}) {
      const page = await browser.newPage({ viewport: opts.small ? {width:320,height:568} : {width:390,height:844}, deviceScaleFactor:1,
        isMobile:true, hasTouch:true, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
      page.on('pageerror', e => errors.push(e.message));
      // No network dependency: use the existing system font fallbacks for this suite.
      await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
      await page.addInitScript(({fixture,run,hours,NOW,opts}) => {
        Date.now = () => NOW + hours * 3600000;
        if (!sessionStorage.getItem('fixture')) {
          sessionStorage.setItem('fixture','1');
          localStorage.setItem('bloom.garden1',JSON.stringify(fixture));
          localStorage.setItem('bloom.run3',JSON.stringify(run));
          if (opts.malformed) localStorage.setItem('bloom.garden2','{broken');
        }
        if (opts.failWrites) Storage.prototype.setItem = function() { throw new DOMException('Quota exceeded','QuotaExceededError'); };
      }, {fixture,run,hours,NOW,opts});
      await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'load'});
      await page.waitForTimeout(1800);
      return page;
    }
    const data = page => page.evaluate(() => JSON.parse(localStorage.getItem('bloom.garden2')));
    const strip = plants => plants.map(({id,...p})=>p);
    for (const hours of [0,12,72,168,720]) {
      const page = await pageFor(hours);
      const g = await data(page);
      assert.deepEqual(strip(g.plants),fixture.plants);
      assert.equal(g.rest,Math.min(1,Math.max(0,hours-G.REST.graceHours)/G.REST.settleHours));
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('bloom.garden1'))),fixture);
      assert.equal(await page.locator('#play').innerText(),'Continue · turn 8');
      // The run's own fields are unchanged; v0.8 adds a garden log alongside them.
      const {log,...saved}=await page.evaluate(()=>JSON.parse(localStorage.getItem('bloom.run3')));
      assert.deepEqual(saved,run); assert.deepEqual(log.seeds,[]);
      assert.doesNotMatch(await page.locator('#t-note').innerText(),/missed|kept what|lost/i);
      if (hours===0||hours===168) await page.screenshot({path:path.join(output,hours===0?'awake.png':'resting.png')});
      if (hours===168) {
        await page.waitForTimeout(16000);
        const waking = await data(page);
        assert.ok(waking.rest<1 && waking.rest>0.5);
        assert.deepEqual(waking.plants,g.plants);
        await page.screenshot({path:path.join(output,'returning.png')});
        await page.reload(); await page.waitForTimeout(1800);
        const afterReload = (await data(page)).rest;
        // pagehide saves the additional visible wake-up time since the heartbeat.
        assert.ok(afterReload <= waking.rest && afterReload > waking.rest - 0.1);
        assert.deepEqual((await data(page)).plants,g.plants);
      }
      await page.close();
      console.log(`PASS migration, ownership, resume, copy: ${hours}h`);
    }
    const small=await pageFor(168,{small:true,reduced:true});
    await small.screenshot({path:path.join(output,'resting-small-reduced.png')});
    assert.ok(await small.locator('#play').isVisible());
    assert.equal((await data(small)).plants.length,fixture.plants.length);
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
    assert.ok(played.rest<hiddenSave.rest);
    assert.equal(new Set(played.plants.map(p=>p.id)).size,played.plants.length);
    await small.reload();await small.waitForTimeout(800);
    assert.equal(await small.locator('#play').innerText(),'Continue · turn 9');
    console.log('PASS reduced motion, small phone, mid-shot background/resume, turn recovery');
    await small.close();
    const failed=await pageFor(72,{failWrites:true});
    assert.equal(await failed.evaluate(()=>localStorage.getItem('bloom.garden2')),null);
    assert.deepEqual(await failed.evaluate(()=>JSON.parse(localStorage.getItem('bloom.garden1'))),fixture);
    assert.match(await failed.locator('#t-note').innerText(),/could not be saved/);
    await failed.close();
    const recovered=await pageFor(72,{malformed:true});
    assert.deepEqual(strip((await data(recovered)).plants),fixture.plants);
    await recovered.close();
    assert.deepEqual(errors,[]);
    console.log('PASS failed writes, legacy recovery, no runtime errors');
    console.log(`Evidence: ${output}`);
  } finally { if(browser)await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1});
