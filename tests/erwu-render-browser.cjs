// Visual pose review. Hooks exist only in HTML served by this test, never in the game.
// Optional BLOOM_BEFORE_REF renders a comparison from a local Git revision.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs'), http = require('node:http'), cp = require('node:child_process');
const path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), out = process.env.BLOOM_EVIDENCE || '/tmp/bloom-erwu-render';
const hook = "window.__art={drawPaintedErwu,ctx,drawCat,drawCatCurled,drawCatSeated,drawCatSide,draw,erwu,get cat(){return cat},catPose,basketPose,paintedErwuPose,bedArtVariant,drawBed,world:erwuWorld,paintPiece,drawCardCat,cardCat:()=>document.querySelector('#card-cat'),atlasReady:()=>!!(artImage('erwu')&&artImage('garden')&&artImage('lawn'))};";
const marker = '  window.claude?.hot?.snapshot?';
const { KEY, gardenV4 } = require('./fixtures/garden-v4.cjs');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0], file = url === '/' || url === '/before' ? 'index.html' : url.slice(1);
    if (!/^(index\.html|[\w-]+\.js|manifest\.webmanifest|assets\/[\w-]+\.(?:png|webp)|fonts\/[\w-]+\.(?:css|woff2))$/.test(file)) { res.statusCode = 404; res.end(); return; }
    if(/\.(png|webp|css|woff2)$/.test(file)){res.setHeader('Content-Type',{png:'image/png',webp:'image/webp',css:'text/css',woff2:'font/woff2'}[file.split('.').pop()]);res.end(fs.readFileSync(path.join(root,file)));return;}
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
      await p.addInitScript(([k, g]) => localStorage.setItem(k, g), [KEY, gardenV4()]);
      await p.goto(`http://127.0.0.1:${server.address().port}/${before ? 'before' : ''}`);
      return p;
    }
    const turnPage = await open({ width: 1000, height: 720 });
    await turnPage.waitForFunction(() => __art.atlasReady());
    const turns = await turnPage.evaluate(() => {
      const a=__art, samples=[];
      const board=document.createElement('canvas'); board.width=1500; board.height=720;
      const g=board.getContext('2d'); g.fillStyle='#FBF6EA'; g.fillRect(0,0,1500,720);
      let row=0;
      a.ctx.save(); a.ctx.setTransform(1,0,0,1,0,0);
      for (const view of ['side','diag-front','diag-back']) {
        Object.assign(a.erwu,{view,facing:1,phase:0,at:{x:150,y:190}});
        a.drawPaintedErwu('walk',10000,65,1);
        a.drawPaintedErwu('walk',10500,65,1);
        a.erwu.facing=-1;
        for(const t of [11000,11050,11100,11150,11200]) {
          const scales=[], original=a.ctx.scale;
          a.ctx.scale=function(x,y){scales.push([x,y]);return original.call(this,x,y)};
          a.ctx.clearRect(0,0,300,240);
          a.drawPaintedErwu('walk',t,65,1);a.ctx.scale=original;
          const column=(t-11000)/50;
          g.drawImage(a.ctx.canvas,0,0,300,240,column*300,row*240,300,240);
          g.fillStyle='#514943';g.font='16px sans-serif';g.fillText(view+' '+(t-11000)+'ms',column*300+25,row*240+225);
          samples.push({view,t,scales});
        }
        row++;
      }
      a.ctx.restore();
      board.style='position:fixed;inset:0;width:1000px;height:480px;z-index:99999'; document.body.append(board);
      return samples;
    });
    assert.ok(turns.every(s=>s.scales.every(([x])=>Math.abs(x)===1)), 'production turns never squash');
    await turnPage.screenshot({path:path.join(out,'turn-volume.png')});
    console.log('TURN volume checks', turns.length);
    await turnPage.close();
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
    // Check the production painted path, not only its procedural fallback.
    for (const reduced of [false, true]) {
      const p = await open({ width: 900, height: 480 });
      await p.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
      await p.waitForFunction(() => __art.atlasReady());
      const result = await p.evaluate(() => {
        const a = __art;
        a.cat.blink = 0.14; a.cat.mood = 'idle'; a.cat.happy = 0; a.cat.bat = 0; a.cat.yawn = 0;
        const runBlink = a.basketPose({ ...a.catPose(), look: null })[0];
        a.cat.blink = 0; a.erwu.blink = 0.4;
        const hello = a.paintedErwuPose('front', false), nestHello = a.paintedErwuPose('front', true);
        a.erwu.blink = 0;
        const awake = a.paintedErwuPose('front', false), yawn = a.paintedErwuPose('yawn', false);
        const pixels = v => Array.from(v.image.getContext('2d').getImageData(0, 0, v.image.width, v.image.height).data);
        const morning = a.bedArtVariant('sunflower', 1, 8), evening = a.bedArtVariant('sunflower', 1, 18);
        const m = pixels(morning), e = pixels(evening), rim = Math.ceil(morning.image.height * 0.75) * morning.image.width * 4;
        const red = v => pixels(v).reduce((sum, x, i, p) => i % 4 === 0 && p[i + 3] > 100 ? sum + Math.max(0, x - p[i + 1] * 1.2) : sum, 0);
        const reds = [0.55, 0.85, 1].map(g => red(a.bedArtVariant('strawberry', g, 12)));
        const c = document.createElement('canvas'); c.width = 1800; c.height = 960;
        c.style = 'position:fixed;inset:0;width:900px;height:480px;z-index:999'; document.body.append(c);
        const g = c.getContext('2d'); g.scale(2, 2); g.fillStyle = '#FBF6EA'; g.fillRect(0, 0, 900, 480);
        const RealDate = Date;
        try {
          [8, 12, 18, 0.55, 0.85, 1].forEach((value, i) => {
            window.Date = class extends RealDate { getHours() { return i < 3 ? value : 12; } getMinutes() { return 0; } };
            g.save(); g.translate(i % 3 * 300 + 150, i < 3 ? 155 : 395); g.scale(2, 2);
            a.drawBed(g, { id: 'bed-1', flower: i < 3 ? 'sunflower' : 'strawberry', growth: i < 3 ? 1 : value }); g.restore();
            g.fillStyle = '#655A4F'; g.font = '16px sans-serif'; g.textAlign = 'center';
            g.fillText(i < 3 ? `${value}:00` : `growth ${value}`, i % 3 * 300 + 150, i < 3 ? 215 : 455);
          });
        } finally { window.Date = RealDate; }
        return { runBlink, hello, nestHello, awake, yawn, reds,
          followsLight: m.some((x, i) => x !== e[i]), rimStable: m.slice(rim).every((x, i) => x === e[rim + i]),
          reversible: a.bedArtVariant('sunflower', 1, 8) === morning };
      });
      assert.equal(result.runBlink, 'peek-sleepy');
      assert.equal(result.hello, 'sit-drowsy'); assert.equal(result.nestHello, 'peek-sleepy');
      assert.equal(result.awake, 'sit-front'); assert.equal(result.yawn, 'stretch');
      assert.ok(result.followsLight && result.rimStable && result.reversible, 'sunflower follows reversible clock changes with its bed fixed');
      assert.ok(result.reds[0] < result.reds[1] && result.reds[1] < result.reds[2], 'fruit visibly ripens over growth stages');
      await p.screenshot({ path: path.join(out, `plant-traits${reduced ? '-reduced' : ''}.png`) });
      console.log('PASS painted expressions and plant traits', { reduced, ...result }); await p.close();
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
