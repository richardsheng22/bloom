const {chromium}=require(process.env.BLOOM_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
// Serve the page, its root-level scripts, and install files; new modules need no allowlist edit.
const SERVED=/^(index\.html|manifest\.webmanifest|(?:icons|assets)\/[\w-]+\.png|[\w-]+\.js)$/;
const fixture=require('./fixtures/garden-v1.json');
const root=path.resolve(__dirname,'..'),out=process.env.BLOOM_EVIDENCE||'/tmp/bloom-ticket02';
const run={v:3,turn:8,ballCount:10,petalNext:true,pawReady:false,charges:[1,0,0,1,0,0,0,0,0,0],items:[
  {kind:'shape',sector:2,ring:5,hp:30,maxHp:30,sp:0,ci:0},{kind:'orb',sector:6,ring:7}]};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const file=req.url==='/'?'index.html':req.url.slice(1);
  if(!SERVED.test(file)){res.statusCode=404;res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.html')?'text/html':'application/json');res.end(fs.readFileSync(path.join(root,file)));
 }).listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));
 let browser;const errors=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM,args:['--no-sandbox']});
  async function setup(width=390,height=844,options={}){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:options.motion?'no-preference':'reduce'});
   page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.addInitScript(({fixture,run})=>{if(!sessionStorage.getItem('setup')){sessionStorage.setItem('setup','1');localStorage.setItem('bloom.garden1',JSON.stringify({...fixture,tended:Date.now()}));localStorage.setItem('bloom.run3',JSON.stringify(run));}},{fixture,run:options.run||run});
   await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'load'});await page.waitForTimeout(250);
   return page;
  }
  const snapshot=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('bloom.run3')));
  const plants=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('bloom.garden2')).plants);
  async function garden(p){await p.waitForFunction(()=>document.body.dataset.view==='garden');}
  async function play(p){await p.locator('#play').click();assert.equal(await p.evaluate(()=>document.body.dataset.view),'run');}
  async function shot(p){const box=await p.locator('#stage').boundingBox();const x=box.x+box.width/2,y=box.y+box.height*.7;
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+65,y,{steps:6});await p.waitForTimeout(80);await p.mouse.up();}
  async function assertBounds(p){
   const boxes=await p.evaluate(()=>['#play','#arrange','#erwu-touch','#garden-scene','#garden-inspection'].map(sel=>{
    const e=document.querySelector(sel),r=e.getBoundingClientRect();return {sel,hidden:e.hidden,x:r.x,y:r.y,w:r.width,h:r.height};}));
   const size=p.viewportSize();for(const b of boxes.filter(b=>!b.hidden)){assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.w<=size.width+1&&b.y+b.h<=size.height+1,JSON.stringify(b));}
   for(const b of boxes.filter(b=>['#play','#arrange','#erwu-touch'].includes(b.sel)))assert.ok(b.w>=44&&b.h>=44,JSON.stringify(b));
   const scene=boxes.find(b=>b.sel==='#garden-scene'),sheet=boxes.find(b=>b.sel==='#garden-inspection');
   if(!sheet.hidden)assert.ok(scene.y+scene.h<=sheet.y+1||scene.x+scene.w<=sheet.x+1,'inspection must not cover scene');
  }
  for(const [width,height]of [[320,568],[375,667],[390,844],[430,932],[568,320],[1024,768]]){
   const p=await setup(width,height);const before=await snapshot(p),owned=await plants(p);
   await assertBounds(p);await p.screenshot({path:path.join(out,`garden-${width}x${height}.png`)});
   await p.locator('#erwu-touch').tap();assert.equal(await p.locator('#inspection-name').innerText(),'Erwu');assert.deepEqual(await snapshot(p),before);
   // Only beds, the cushion and the stone open; a bed opens from the keyboard too.
   // Escape closes it and returns focus without touching the run.
   await p.locator('.anchor-target').first().focus();await p.keyboard.press('Enter');await assertBounds(p);
   assert.ok(await p.locator('#bed-actions').isVisible());assert.ok(await p.locator('.bed-chip').first().isVisible());
   await p.screenshot({path:path.join(out,`inspection-${width}x${height}.png`)});
   await p.keyboard.press('Escape');
   assert.ok(await p.locator('#garden-inspection').isHidden());assert.equal(await p.evaluate(()=>document.activeElement.id),'arrange');
   assert.equal(await p.locator('#explore, #plant-picker').count(),0);
   // A drag in garden space is not a slingshot or an inspection tap.
   const scene=await p.locator('#garden-scene').boundingBox();await p.mouse.move(scene.x+12,scene.y+25);await p.mouse.down();await p.mouse.move(scene.x+65,scene.y+85,{steps:5});await p.mouse.up();
   assert.deepEqual(await snapshot(p),before);
   await play(p);assert.deepEqual(await snapshot(p),before);
   await p.waitForTimeout(600);
   await p.screenshot({path:path.join(out,`run-${width}x${height}.png`)});
   await p.locator('#visit-garden').click();await garden(p);assert.deepEqual(await snapshot(p),before);assert.deepEqual(await plants(p),owned);
   await p.reload();await garden(p);assert.deepEqual(await snapshot(p),before);
   console.log(`PASS layout, inspection, keyboard, exact resume: ${width}x${height}`);await p.close();
  }
  const p=await setup(390,844,{motion:true});await p.waitForTimeout(1800);
  assert.ok(await p.locator('#title').evaluate(e=>e.classList.contains('settled')));
  // Simulated safe-area reservations, then resize; owned coordinates must not change.
  const owned=await plants(p);await p.addStyleTag({content:'#title{padding-top:44px;padding-bottom:34px;}'});await p.waitForTimeout(150);await assertBounds(p);
  await p.setViewportSize({width:568,height:320});await p.waitForTimeout(150);await assertBounds(p);assert.deepEqual(await plants(p),owned);
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);
  // Wild plants grow on their own: tapping one opens nothing. Tapping a bed does; the lawn closes it.
  const target=await p.evaluate(()=>{const r=document.querySelector('#garden-scene').getBoundingClientRect(),scene=BloomGardenView.layout(r),g=JSON.parse(localStorage.getItem('bloom.garden2'));
   const item=g.plants[0],at=BloomGardenLayout.projectPlant(item,scene);return {x:scene.cx+at.x,y:scene.cy+at.y-8};});
  await p.touchscreen.tap(target.x,target.y);assert.ok(await p.locator('#garden-inspection').isHidden());
  await p.locator('.anchor-target').nth(3).tap();assert.ok(await p.locator('#garden-inspection').isVisible());
  assert.equal(await p.locator('#inspection-name').innerText(),'Cushion');
  const rect=await p.locator('#garden-scene').boundingBox();await p.mouse.click(rect.x+2,rect.y+2);assert.ok(await p.locator('#garden-inspection').isHidden());
  await p.locator('#erwu-touch').tap();await play(p);assert.ok(await p.locator('#title').isHidden());
  // Cancel a pointer before leaving the run; its late release cannot launch in the garden.
  await p.dispatchEvent('#app','pointerdown',{pointerId:77,clientX:190,clientY:550,button:0});
  await p.dispatchEvent('#app','pointermove',{pointerId:77,clientX:240,clientY:550});
  await p.dispatchEvent('#app','pointercancel',{pointerId:77});
  const untouched=await snapshot(p);await p.locator('#visit-garden').click();await garden(p);
  await p.dispatchEvent('#app','pointerup',{pointerId:77,clientX:240,clientY:550});assert.deepEqual(await snapshot(p),untouched);
  await play(p);await shot(p);
  await p.locator('#visit-garden').click();assert.equal(await p.locator('#visit-garden').getAttribute('aria-pressed'),'true');
  assert.match(await p.locator('#hint').innerText(),/after this turn/);
  await p.locator('#visit-garden').click();assert.equal(await p.locator('#visit-garden').getAttribute('aria-pressed'),'false');
  await p.locator('#visit-garden').click();
  await p.screenshot({path:path.join(out,'queued-return.png')});
  await garden(p);const completed=await snapshot(p);assert.equal(completed.turn,9);
  await play(p);assert.deepEqual(await snapshot(p),completed);await p.waitForTimeout(900);assert.equal(await p.evaluate(()=>document.body.dataset.view),'run');
  await p.reload();await garden(p);assert.deepEqual(await snapshot(p),completed);
  console.log('PASS safe-area reservations, resize, wild plants stay untouchable, bed and cushion taps, dismissal, immediate play, pointer cancellation, queued return/cancel');await p.close();
  // A queued return also handles loss without silently creating a new run or a delayed dialog.
  const losing={...run,petalNext:false,items:[{kind:'shape',sector:0,ring:1,hp:999,maxHp:999,sp:0,ci:0}]};
  const lost=await setup(390,844,{run:losing});await play(lost);await shot(lost);await lost.locator('#visit-garden').click();await garden(lost);
  assert.equal(await snapshot(lost),null);assert.equal(await lost.locator('#play').innerText(),'Play again');await lost.waitForTimeout(1300);assert.ok(await lost.locator('#over').isHidden());
  await play(lost);assert.equal((await snapshot(lost)).turn,1);await lost.close();console.log('PASS queued game over and explicit new run');
  const normalLoss=await setup(320,568,{run:losing});await play(normalLoss);await shot(normalLoss);
  await normalLoss.locator('#to-garden').waitFor({state:'visible',timeout:30000});
  await normalLoss.locator('#to-garden').click();await garden(normalLoss);assert.equal(await snapshot(normalLoss),null);
  assert.equal(await normalLoss.locator('#play').innerText(),'Play again');await normalLoss.waitForTimeout(1000);assert.ok(await normalLoss.locator('#over').isHidden());
  await normalLoss.close();console.log('PASS ordinary game-over garden entry does not create a new run');
  // During Full bloom, the phase is advancing. Its completion still precedes garden entry.
  const full={...run,charges:Array(10).fill(1)};const bloom=await setup(390,844,{run:full,motion:true});await play(bloom);await shot(bloom);
  await bloom.waitForFunction(()=>document.querySelector('#banner').getAttribute('aria-label')?.startsWith('Full bloom'),{timeout:30000});
  await bloom.locator('#visit-garden').click();await garden(bloom);assert.equal((await snapshot(bloom)).turn,9);await bloom.close();console.log('PASS queued return during advancing/full bloom');
  assert.deepEqual(errors,[]);console.log(`PASS no page errors. Evidence: ${out}`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
