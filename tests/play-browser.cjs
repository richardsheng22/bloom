// Real pointer/keyboard flows. Private simulation hooks are injected by this server only.
const {chromium}=require(process.env.BLOOM_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {gardenV4}=require('./fixtures/garden-v4.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.BLOOM_EVIDENCE||'/tmp/bloom-play';
const checkpoint=(extra={})=>({v:3,turn:8,ballCount:12,petalNext:false,pawReady:true,charges:Array(10).fill(0),items:[{kind:'shape',sector:5,ring:4,hp:18,maxHp:18,sp:0,ci:0},{kind:'orb',sector:1,ring:7}],...extra});
const hook=`window.__play={freeze:false,get state(){return state},get presentation(){return presentation},get shot(){return shot},get items(){return items},get balls(){return balls},get geometry(){return {R,coreR,ballR,CX,CY}},snapshot:serialize,launch,update,draw,markReady,restore,newGame,afterAdvance,get labels(){return typeof healthLabels==='undefined'?[]:healthLabels},get target(){return typeof aimedItem==='undefined'?null:aimedItem},get timeScale(){return timeScale},set timeScale(v){timeScale=v}};`;
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
  // Additional interaction checks are added with their implementation slices below.
  assert.deepEqual(errors,[]);console.log('PASS no page errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
