// Real pointer/keyboard flows. Private simulation hooks are injected by this server only.
const {chromium}=require(process.env.BLOOM_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {gardenV4}=require('./fixtures/garden-v4.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.BLOOM_EVIDENCE||'/tmp/bloom-play';
const checkpoint=(extra={})=>({v:3,turn:8,ballCount:12,petalNext:false,pawReady:true,charges:Array(10).fill(0),items:[{kind:'shape',sector:5,ring:4,hp:18,maxHp:18,sp:0,ci:0},{kind:'orb',sector:1,ring:7}],...extra});
const hook=`window.__play={freeze:false,get state(){return state},get presentation(){return presentation},get shot(){return shot},get items(){return items},get balls(){return balls},get geometry(){return {R,coreR,ballR,CX,CY}},get aim(){return aim},set aim(v){aim=v},traceAim,itemPos,collideShape,bounceOff,set randomSeed(v){shotRandom=seeded(v)},snapshot:serialize,launch,update,draw,markReady,restore,newGame,afterAdvance,get labels(){return typeof healthLabels==='undefined'?[]:healthLabels},get target(){return typeof aimedItem==='undefined'?null:aimedItem},get timeScale(){return timeScale},set timeScale(v){timeScale=v}};`;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{
  const file=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);
  if(!/^(index\.html|[\w-]+\.js|manifest\.webmanifest|(?:assets|fonts|icons)\/[\w.-]+)$/.test(file)){res.writeHead(404).end();return;}
  try{let data=fs.readFileSync(path.join(root,file));if(file==='index.html')data=data.toString().replace('  window.claude?.hot?.snapshot?',hook+'\n  window.claude?.hot?.snapshot?').replace('    const hits = shot.hits;', '    window.__lastShot={t:shot.t,hits:shot.hits,banks:shot.banks,blooms:shot.blooms,scatter:clocks.reduce((n,c)=>n+c.hits,0)};\n    const hits = shot.hits;').replace('  function frame(now) {','  function frame(now) { if(window.__play?.freeze){last=now;requestAnimationFrame(frame);return;}');
  res.setHeader('Content-Type',({html:'text/html',js:'application/javascript',css:'text/css',webp:'image/webp',png:'image/png',woff2:'font/woff2'})[file.split('.').pop()]||'application/json');res.end(data);}catch{res.writeHead(404).end();}
 }).listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM,args:['--no-sandbox']});
 const errors=[];
 async function open({run=checkpoint(),width=390,height=844,extra={},failRecovery=false,expectError=false,motion='reduce',now=null}={}){
  const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,timezoneId:'America/Toronto',reducedMotion:motion});
  if(now)await p.clock.setFixedTime(new Date(now));
  p.on('pageerror',e=>{if(!expectError)errors.push(e.message)});
  await p.addInitScript(({run,garden,extra,failRecovery})=>{
   if(!sessionStorage.getItem('fixture')){sessionStorage.setItem('fixture','1');localStorage.setItem('bloom.garden4',garden);if(run!==null)localStorage.setItem('bloom.run3',typeof run==='string'?run:JSON.stringify(run));for(const[k,v]of Object.entries(extra))localStorage.setItem(k,JSON.stringify(v));}
   if(failRecovery){const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='bloom.run3.recovery')throw Error('full');return set.call(this,k,v)}}
  },{run,garden:gardenV4({bed:'daisy',growth:.3}),extra,failRecovery});
  await p.goto(`http://127.0.0.1:${server.address().port}`);await p.waitForFunction(()=>!document.body.classList.contains('loading'));return p;
 }
 const shot=async(p)=>{await p.mouse.move(195,650);await p.mouse.down();await p.mouse.move(130,700,{steps:8});await p.waitForTimeout(150);await p.mouse.up()};
 try{
  for(const [raw,failRecovery]of [[JSON.stringify(checkpoint({items:[null]})),false],['{broken',true],[JSON.stringify({v:99}),false]]){
   const p=await open({run:raw,failRecovery});assert.ok(await p.locator('#play').isVisible());assert.equal(await p.locator('#play').innerText(),'Start a new run');
   assert.equal(await p.evaluate(()=>localStorage.getItem('bloom.run3')),raw);
   const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('bloom.garden4')).patches);
   await p.click('#play');assert.equal(await p.evaluate(()=>__play.state),'ready');
   if(raw.includes('99')||failRecovery){assert.equal(await p.evaluate(()=>localStorage.getItem('bloom.run3')),raw);assert.match(await p.locator('#hint').innerText(),/temporary/);}
   else{assert.equal(await p.evaluate(()=>localStorage.getItem('bloom.run3.recovery')),raw);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('bloom.run3')).turn),1);}
   assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('bloom.garden4')).patches),before);
   await p.reload();await p.waitForFunction(()=>!document.body.classList.contains('loading'));await p.close();
  }
  const p=await open();const saved=await p.evaluate(()=>__play.snapshot());await p.click('#play');await p.click('#visit-garden');await p.reload();await p.waitForFunction(()=>!document.body.classList.contains('loading'));
  assert.deepEqual(await p.evaluate(()=>__play.snapshot()),saved);await p.close();
  console.log('PASS run recovery, quarantine failure, future saves, ownership, and exact resume');
  const modal=await open();
  for(let cycle=0;cycle<2;cycle++){
   await modal.click('#t-guide');
   for(let n=0;n<12;n++){await modal.keyboard.press(n%2?'Shift+Tab':'Tab');assert.ok(await modal.evaluate(()=>!!document.activeElement.closest('#guide')));}
   await modal.keyboard.press('Escape');assert.equal(await modal.evaluate(()=>document.querySelector('#app').inert),true);
   assert.equal(await modal.evaluate(()=>document.activeElement.id),'t-guide');
  }
  await modal.click('#play');
  await modal.mouse.move(195,650);await modal.mouse.down();await modal.mouse.move(140,690);
  await modal.evaluate(()=>document.querySelector('#r-guide').click());await modal.keyboard.press('Escape');await modal.mouse.up();
  assert.equal(await modal.evaluate(()=>__play.state),'ready');
  await shot(modal);await modal.waitForFunction(()=>__play.state==='flying');await modal.click('#r-guide');
  const paused=await modal.evaluate(()=>({shot:__play.shot,balls:__play.balls,items:__play.items}));
  await modal.waitForTimeout(1200);assert.deepEqual(await modal.evaluate(()=>({shot:__play.shot,balls:__play.balls,items:__play.items})),paused);
  await modal.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await modal.waitForTimeout(100);await modal.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
  assert.deepEqual(await modal.evaluate(()=>({shot:__play.shot,balls:__play.balls,items:__play.items})),paused);
  await modal.keyboard.press('Escape');await modal.waitForFunction(()=>__play.state==='ready'&&__play.snapshot().turn===9,null,{timeout:35000});
  await modal.click('#r-guide');await modal.keyboard.press('Escape');await modal.waitForTimeout(100);
  assert.equal(await modal.evaluate(()=>__play.snapshot().turn),9);await modal.close();
  // Help opened during the game-over delay postpones the end card until dismissal.
  const ending=await open({run:checkpoint({pawReady:false,items:[{kind:'shape',sector:0,ring:1,hp:99,maxHp:99,sp:0,ci:0}]})});
  await ending.click('#play');await ending.evaluate(()=>{__play.items[0].ring=0;__play.afterAdvance()});await ending.click('#r-guide');
  await ending.waitForTimeout(500);assert.ok(await ending.locator('#over').isHidden());await ending.keyboard.press('Escape');await ending.locator('#over').waitFor({state:'visible'});await ending.close();
  console.log('PASS modal focus, inert restoration, shot/background pause and deferred game over');
  const dense=Array.from({length:20},(_,i)=>({kind:'shape',sector:i%10,ring:i<10?1:4,hp:[1,2,3,4,18,99,100,999,1000,1234][i%10],maxHp:1234,sp:i%5,ci:i%4,...(i===14?{seed:'moonflower',stubborn:true}:{})}));
  // Stable measured labels at normal CSS scale, including all low-health values.
  for(const [width,height] of [[320,568],[360,640],[375,667],[390,844],[430,932],[568,320],[768,1024],[1024,768]]){
   const q=await open({width,height,run:checkpoint({items:dense})});await q.click('#play');await q.waitForTimeout(800);
   const labels=await q.evaluate(()=>__play.labels);assert.equal(labels.length,dense.length);
   for(let i=0;i<labels.length;i++){assert.equal(labels[i].h,18);for(let j=0;j<i;j++){const a=labels[i],b=labels[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`overlapping labels ${width}: ${i},${j}`);}}
   await q.screenshot({path:path.join(out,`health-${width}.png`)});await q.close();
  }
  const target=await open({run:checkpoint({items:[{kind:'mushroom',sector:0,ring:2},{kind:'shape',sector:9,ring:4,hp:18,maxHp:18,sp:1,ci:0}]})});await target.click('#play');
  const contact=await target.evaluate(()=>{const p=__play.itemPos(__play.items[0]),a=Math.atan2(p.y,p.x),t=__play.traceAim(a);return {kind:t.item?.kind,before:__play.snapshot()}});
  assert.equal(contact.kind,'mushroom');assert.deepEqual(await target.evaluate(()=>__play.snapshot()),contact.before);
  const aimed=await target.evaluate(()=>{const p=__play.itemPos(__play.items[0]),a=Math.atan2(p.y,p.x);__play.items[0].dead=true;__play.aim={angle:a,target:a};__play.update(.01);return __play.target?.hp;});
  assert.equal(aimed,18);assert.match(await target.locator('#hint').innerText(),/18/);await target.close();
  console.log('PASS measured health labels at eight sizes and mushroom occlusion without board mutation');
  for(const [turn,month,motion] of [[1,3,'reduce'],[10,6,'no-preference'],[30,9,'reduce'],[60,12,'no-preference'],[100,3,'no-preference']]){
   const seasonal=await open({now:`2026-${String(month).padStart(2,'0')}-15T16:00:00Z`,motion,run:checkpoint({turn,charges:Array(10).fill(1),items:turn===1?dense.slice(0,3).map(i=>({...i,ring:7,hp:2,maxHp:2})):dense}),extra:{'bloom.hinted3':true,'bloom.speedSeen':true}});
   await seasonal.click('#play');await seasonal.waitForTimeout(800);assert.equal(await seasonal.evaluate(()=>__play.labels.length),turn===1?3:20);
   await seasonal.screenshot({path:path.join(out,`turn-${turn}-month-${month}.png`)});await seasonal.close();
  }
  const lesson=await open({run:checkpoint({turn:1,items:[{kind:'dew',sector:0,ring:7}]}),extra:{'bloom.hinted3':true}});
  // Merely creating the board or reading help never acknowledges a lesson.
  assert.equal(await lesson.evaluate(()=>localStorage.getItem('bloom.hints1')),null);
  await lesson.click('#play');await lesson.waitForFunction(()=>document.querySelector('#hint').textContent.includes('dewdrop'));
  await lesson.click('#r-guide');await lesson.waitForTimeout(2300);
  assert.equal(await lesson.evaluate(()=>JSON.parse(localStorage.getItem('bloom.hints1')||'{}').seen?.dew),undefined);
  await lesson.keyboard.press('Escape');await lesson.waitForTimeout(2200);
  assert.equal(await lesson.evaluate(()=>JSON.parse(localStorage.getItem('bloom.hints1')).seen.dew),true);
  await lesson.reload();await lesson.waitForFunction(()=>!document.body.classList.contains('loading'));await lesson.click('#play');await lesson.waitForTimeout(100);
  assert.doesNotMatch(await lesson.locator('#hint').innerText(),/dewdrop|Pull back/);await lesson.close();
  const skipped=await open({run:checkpoint({turn:1,items:[{kind:'bee',sector:0,ring:7}]}),extra:{'bloom.hinted3':true}});await skipped.click('#play');
  await skipped.waitForFunction(()=>document.querySelector('#hint').textContent.includes('bee'));await skipped.click('#visit-garden');
  await skipped.waitForTimeout(2200);assert.equal(await skipped.evaluate(()=>JSON.parse(localStorage.getItem('bloom.hints1')||'{}').seen?.bee),undefined);
  await skipped.click('#play');await skipped.waitForFunction(()=>document.querySelector('#hint').textContent.includes('bee'));await skipped.close();
  console.log('PASS contextual hints acknowledge visible time, pause in help, survive interruption and stay quiet after reload');
  const speedPage=await open({width:320,height:568,extra:{'bloom.speedSeen':true,'bloom.hinted3':true}});await speedPage.click('#play');
  assert.match(await speedPage.locator('#ff').innerText(),/1×/);await speedPage.click('#ff');assert.equal(await speedPage.evaluate(()=>__play.state),'ready');
  await speedPage.reload();await speedPage.waitForFunction(()=>!document.body.classList.contains('loading'));await speedPage.click('#play');assert.match(await speedPage.locator('#ff').innerText(),/3×/);
  const boxes=await speedPage.evaluate(()=>['#ff','#r-guide','#hint','#paw'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
  for(const b of boxes)assert.ok(b.x>=0&&b.x+b.w<=320);assert.ok(boxes[0].h>=44);assert.ok(boxes[1].x+boxes[1].w<=boxes[0].x);assert.ok(boxes[3].x+boxes[3].w<=boxes[1].x);
  await speedPage.waitForTimeout(800);await speedPage.screenshot({path:path.join(out,'speed-320.png')});await speedPage.close();
  for(const motion of ['reduce','no-preference'])for(const power of ['dew','bee','sun','dandelion','timeout']){
   const results=[];
   for(const speed of [1,3]){
    const objects=[{kind:power==='timeout'?'mushroom':power,sector:0,ring:2},...Array.from({length:4},(_,i)=>({kind:'shape',sector:[0,3,6,9][i],ring:4,hp:200,maxHp:200,sp:i,ci:i}))];
    const sim=await open({motion,run:checkpoint({ballCount:24,items:objects}),extra:{'bloom.hinted3':true,'bloom.speedSeen':true}});await sim.click('#play');
    const result=await sim.evaluate(({speed,power})=>{
      __play.freeze=true;__play.timeScale=speed;
      const p=__play.itemPos(__play.items[0]);__play.launch(Math.atan2(p.y,p.x));__play.randomSeed=77;
      if(power==='timeout'){__play.shot.launched=__play.shot.toLaunch;__play.balls.push({x:__play.geometry.R*.8,y:0,vx:0,vy:0,out:true,rim:0,homing:false});}
      let frames=0;
      while(__play.state==='flying'&&frames<6000){__play.update(1/60);frames++;}
      return {frames,state:__play.state,shot:window.__lastShot,board:__play.items.map(i=>({kind:i.kind,hp:i.hp,ring:i.ring,rf:i.rf,dead:!!i.dead})),checkpoint:__play.snapshot()};
    },{speed,power});
    assert.equal(result.state,'advancing');assert.ok(result.shot);
    if(power==='timeout')assert.ok(result.shot.t>=22);else assert.ok(!result.board.some(i=>i.kind===power),'power was collected');
    if(power==='dandelion')assert.ok(result.shot.scatter>0);
    results.push(result);await sim.close();
   }
   const [normal,fast]=results;assert.deepEqual(fast.shot,normal.shot,`${power} ${motion} shot`);assert.deepEqual(fast.board,normal.board,`${power} ${motion} board`);
   assert.equal(fast.checkpoint.ballCount,normal.checkpoint.ballCount);assert.deepEqual(fast.checkpoint.charges,normal.checkpoint.charges);
   assert.ok(Math.abs(normal.frames-fast.frames*3)<=2);
  }
  console.log('PASS saved speed, 320px controls, equivalent 1x/3x powers, scatter and 22s timeout in both motion modes');
  // Additional interaction checks are added with their implementation slices below.
  assert.deepEqual(errors,[]);console.log('PASS no page errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
