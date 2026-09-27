// Visual pose review. Hooks exist only in HTML served by this test, never in the game.
// Optional BLOOM_BEFORE_REF renders a comparison from a local Git revision.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs'), http = require('node:http'), cp = require('node:child_process');
const path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), out = process.env.BLOOM_EVIDENCE || '/tmp/bloom-erwu-render';
const hook = "window.__art={drawCat,drawCatCurled,drawCatSeated,drawCatSide,draw,erwu,world:erwuWorld,paintPiece,drawCardCat,cardCat:()=>document.querySelector('#card-cat'),atlasReady:()=>!!(artImage('erwu')&&artImage('garden')&&artImage('lawn'))};";
const marker = '  window.claude?.hot?.snapshot?';
const fixture = require('./fixtures/garden-v1.json');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0], file = url === '/' || url === '/before' ? 'index.html' : url.slice(1);
    if (!/^(index\.html|[\w-]+\.js|manifest\.webmanifest|assets\/[\w-]+\.(?:png|webp))$/.test(file)) { res.statusCode = 404; res.end(); return; }
    if(/\.(png|webp)$/.test(file)){res.setHeader('Content-Type','image/'+file.split('.').pop());res.end(fs.readFileSync(path.join(root,file)));return;}
    let data = url === '/before' && process.env.BLOOM_BEFORE_REF
      ? cp.execFileSync('git', ['show', `${process.env.BLOOM_BEFORE_REF}:index.html`], { cwd: root, encoding: 'utf8' })
      : fs.readFileSync(path.join(root, file), 'utf8');
    if (file === 'index.html') { assert.ok(data.includes(marker)); data = data.replace(marker, hook + '\n' + marker); }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : 'text/html'); res.end(data);
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.on('listening', r));
  let browser;
  const errors = [];
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM, args: ['--no-sandbox'] });
    async function open(size, before = false) {
      const p = await browser.newPage({ viewport: size, deviceScaleFactor: 2 });
      p.on('pageerror', e => errors.push(e.message));
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.addInitScript(f => localStorage.setItem('bloom.garden1', JSON.stringify({ ...f, tended: Date.now() })), fixture);
      await p.goto(`http://127.0.0.1:${server.address().port}/${before ? 'before' : ''}`);
      return p;
    }
    for (const before of (process.env.BLOOM_BEFORE_REF ? [true, false] : [false])) {
      const p = await open({ width: 1000, height: 720 }, before);
      await p.evaluate(() => {
        const c = document.createElement('canvas'); c.width = 2000; c.height = 1440;
        c.style = 'position:fixed;inset:0;width:1000px;height:720px;z-index:999'; document.body.append(c);
        const g = c.getContext('2d'); g.scale(2, 2); g.fillStyle = '#FBF6EA'; g.fillRect(0, 0, 1000, 720);
        const poses = ['front', 'curl', 'walk', 'sniff', 'crouch', 'pounce', 'stretch', 'loaf', 'sit', 'run', 'watch', 'happy'];
        poses.forEach((pose, i) => {
          const x = (i % 4) * 250 + 125, y = Math.floor(i / 4) * 240 + 140;
          g.save(); g.translate(x, y);
          const o = { mood: pose === 'watch' ? 'watch' : 'idle', blink: 0, happy: pose === 'happy' ? 1 : 0,
            bounce: 0, bat: 0, earsBack: 0, look: pose === 'watch' ? 0.4 : null };
          if (pose === 'front') __art.drawCatSeated(g, 66, 1000, o);
          else if (pose === 'curl') __art.drawCatCurled(g, 70, 1000);
          else if (['run', 'watch', 'happy'].includes(pose)) __art.drawCat(g, 58, 1000, o);
          else __art.drawCatSide(g, 75, { ...o, pose, phase: .7, facing: 1, jump: pose === 'pounce' ? .45 : 0 }, 1000);
          g.restore(); g.fillStyle = '#6E6259'; g.font = '14px sans-serif'; g.textAlign = 'center';
          g.fillText(pose, x, Math.floor(i / 4) * 240 + 224);
        });
      });
      await p.screenshot({ path: path.join(out, `${before ? 'before' : 'after'}-poses.png`) });
      const result = await p.evaluate(() => {
        const o = { mood: 'idle', blink: 0, happy: 0, bounce: 0, bat: 0, earsBack: 0 };
        const c = document.createElement('canvas'); c.width = c.height = 300;
        const g = c.getContext('2d');
        const paint = () => {
          g.clearRect(0, 0, 300, 300); g.save(); g.translate(150, 150);
          __art.drawCatSide(g, 65, { ...o, pose: 'walk', phase: .7, facing: 1 }, 1000);
          g.restore(); return c.toDataURL();
        };
        const a = paint(), b = paint(), data = g.getImageData(0, 0, 300, 300).data;
        let painted = 0; for (let i = 3; i < data.length; i += 4) if (data[i]) painted++;
        const start = performance.now();
        for (let i = 0; i < 200; i++) {
          g.save(); g.translate(150, 150);
          __art.drawCatSide(g, 32, { ...o, pose: 'walk', phase: i / 10, facing: i % 2 ? 1 : -1 }, i * 16);
          g.restore();
        }
        return { stable: a === b, painted, msPerPose: (performance.now() - start) / 200 };
      });
      assert.equal(result.stable, true, 'identical pose has stable grain');
      assert.ok(result.painted > 1000, 'pose actually renders');
      console.log(before ? 'BEFORE' : 'AFTER', result); await p.close();
    }
    const painted = await open({width:960,height:800});
    await painted.waitForFunction(()=>__art.atlasReady());
    await painted.evaluate(()=>{
      const c=document.createElement('canvas');c.width=1920;c.height=1600;
      c.style='position:fixed;inset:0;width:960px;height:800px;z-index:999';document.body.append(c);
      const g=c.getContext('2d');g.scale(2,2);g.fillStyle='#FBF6EA';g.fillRect(0,0,960,800);
      // every painted frame, at the scale she walks in the garden, on her ground anchor
      const names=Object.keys(BloomArt.erwu.frames);
      names.forEach((name,i)=>{
        const x=(i%7)*137+68,y=Math.floor(i/7)*190+150,f=BloomArt.erwu.frames[name];
        __art.paintPiece(g,'erwu',name,x,y,f[2]*0.3);
        g.font='12px sans-serif';g.textAlign='center';g.fillStyle='#655A4F';g.fillText(name,x,y+18);
      });
    });
    await painted.screenshot({path:path.join(out,'painted-poses.png')});await painted.close();
    for (const width of [320, 390]) {
      const p = await open({ width, height: width === 320 ? 568 : 844 });
      await p.waitForFunction(()=>__art.atlasReady());
      await p.waitForTimeout(1800);
      await p.evaluate(() => {
        // Freeze only this test page for a repeatable full-game rendering at phone size.
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        Object.assign(__art.erwu, { at: { x: 0, y: 92 }, pose: 'walk', prevPose: 'walk', poseAge: 2, phase: .7, facing: 1 });
        __art.draw(performance.now());
      });
      await p.screenshot({ path: path.join(out, `garden-${width}.png`) });
      await p.locator('#garden-scene').screenshot({ path: path.join(out, `scene-${width}.png`) });
      await p.close();
    }
    // the end card: asleep in her basket, painted like the garden
    const card=await open({width:390,height:844});
    await card.waitForFunction(()=>__art.atlasReady());
    const cardPng=await card.evaluate(()=>{const c=__art.cardCat();__art.drawCardCat(1000);return c.toDataURL();});
    fs.writeFileSync(path.join(out,'card-cat.png'),Buffer.from(cardPng.split(',')[1],'base64'));await card.close();
    const moving=await open({width:390,height:844});
    await moving.waitForFunction(()=>__art.atlasReady());
    const video=await moving.evaluate(async()=>{
      const stream=document.querySelector('#c').captureStream(30),chunks=[];
      const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});
      const finished=new Promise(resolve=>recorder.onstop=resolve);
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      __art.erwu.at={x:0,y:90};
      // Use the existing behavior path to the log, including its walking cycle.
      BloomErwu.request(__art.erwu,'log',__art.world(),null,'motion review');
      recorder.start();await new Promise(r=>setTimeout(r,6000));recorder.stop();await finished;
      stream.getTracks().forEach(t=>t.stop());
      return Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer()));
    });
    fs.writeFileSync(path.join(out,'garden-motion.webm'),Buffer.from(video));await moving.close();
    assert.deepEqual(errors, []); console.log('PASS stable rendering and phone screenshots without page errors');
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
