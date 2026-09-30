// Real pointer/keyboard flows. Private simulation hooks are injected by this server only.
const {chromium}=require(process.env.BLOOM_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {gardenV4}=require('./fixtures/garden-v4.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.BLOOM_EVIDENCE||'/tmp/bloom-play';
const checkpoint=(extra={})=>({v:3,turn:8,ballCount:12,petalNext:false,pawReady:true,charges:Array(10).fill(0),items:[{kind:'shape',sector:5,ring:4,hp:18,maxHp:18,sp:0,ci:0},{kind:'orb',sector:1,ring:7}],...extra});
const hook=`window.__play={freeze:false,get state(){return state},get presentation(){return presentation},get shot(){return shot},get items(){return items},get balls(){return balls},get geometry(){return {R,coreR,ballR,CX,CY}},traceAim,itemPos,collideShape,bounceOff,snapshot:serialize,launch,update,draw,markReady,restore,newGame,afterAdvance,get labels(){return typeof healthLabels==='undefined'?[]:healthLabels},get target(){return typeof aimedItem==='undefined'?null:aimedItem},get timeScale(){return timeScale},set timeScale(v){timeScale=v}};`;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{
  const file=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);
  if(!/^(index\.html|[\w-]+\.js|manifest\.webmanifest|(?:assets|fonts|icons)\/[\w.-]+)$/.test(file)){res.writeHead(404).end();return;}
  try{let data=fs.readFileSync(path.join(root,file));if(file==='index.html')data=data.toString().replace('  window.claude?.hot?.snapshot?',hook+'\n  window.claude?.hot?.snapshot?').replace('  function frame(now) {','  function frame(now) { if(window.__play?.freeze){last=now;requestAnimationFrame(frame);return;}');
  res.setHeader('Content-Type',({html:'text/html',js:'application/javascript',css:'text/css',webp:'image/webp',png:'image/png',woff2:'font/woff2'})[file.split('.').pop()]||'application/json');res.end(data);}catch{res.writeHead(404).end();}
 }).listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM,args:['--no-sandbox']});
 const errors=[];
 async function open({run=checkpoint(),width=390,height=844,extra={},failRecovery=false,expectError=false,motion='reduce'}={}){
  const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,timezoneId:'America/Toronto',reducedMotion:motion});
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
  await modal.click('#play');await shot(modal);await modal.waitForFunction(()=>__play.state==='flying');await modal.click('#r-guide');
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
  for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[768,1024],[1024,768]]){
   const q=await open({width,height,run:checkpoint({items:dense})});await q.click('#play');await q.waitForTimeout(800);
   const labels=await q.evaluate(()=>__play.labels);assert.equal(labels.length,dense.length);
   for(let i=0;i<labels.length;i++){assert.equal(labels[i].h,18);for(let j=0;j<i;j++){const a=labels[i],b=labels[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`overlapping labels ${width}: ${i},${j}`);}}
   await q.screenshot({path:path.join(out,`health-${width}.png`)});await q.close();
  }
  const target=await open({run:checkpoint({items:[{kind:'mushroom',sector:0,ring:2},{kind:'shape',sector:9,ring:4,hp:18,maxHp:18,sp:1,ci:0}]})});await target.click('#play');
  const contact=await target.evaluate(()=>{const p=__play.itemPos(__play.items[0]),a=Math.atan2(p.y,p.x),t=__play.traceAim(a);return {kind:t.item?.kind,before:__play.snapshot()}});
  assert.equal(contact.kind,'mushroom');assert.deepEqual(await target.evaluate(()=>__play.snapshot()),contact.before);await target.close();
  console.log('PASS measured health labels at six sizes and mushroom occlusion without board mutation');
  // Additional interaction checks are added with their implementation slices below.
  assert.deepEqual(errors,[]);console.log('PASS no page errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
