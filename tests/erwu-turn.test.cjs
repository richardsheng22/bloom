const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
// Exercise the production walking render branch with canvas/image I/O replaced.
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const state=html.slice(html.indexOf('  let walkCanvas ='),html.indexOf('  function paintWalk('));
const draw=html.slice(html.indexOf('  function drawPaintedErwu('),html.indexOf('\n    let name = paintedErwuPose',html.indexOf('  function drawPaintedErwu(')))+'\n  }';
for(const view of ['side','diag-front','diag-back'])for(const reduced of [false,true])test(`${view} reversal preserves volume (reduced=${reduced})`,()=>{
 const scales=[],paints=[];
 const c={ART:{erwu:{frames:new Proxy({},{get:()=>[0,0,200,150,100]})}},erwu:{at:{x:100,y:100},view,facing:1,phase:0},reduced,TAU:Math.PI*2,ERWU_LENGTH:2,artImage:()=>true,paintedGarden:()=>true,inBasket:()=>false,depthAt:()=>1,groundShadow:()=>{},paintWalk:(layers)=>paints.push(layers),ctx:{globalAlpha:1,save(){},restore(){},translate(){},scale(x,y){scales.push([x,y])}}};
 vm.createContext(c);vm.runInContext(state+draw+';globalThis.render=drawPaintedErwu',c);
 c.render('walk',1000,40,1);c.erwu.facing=-1;
 for(const t of [1100,1150,1200,1250,1300,1400])c.render('walk',t,40,1);
 assert.ok(scales.every(([x,y])=>Math.abs(x)===1&&Math.abs(y)===1),`turn compressed geometry: ${JSON.stringify(scales)}`);
 assert.ok(paints.at(-1).filter(l=>l.weight>0).every(l=>l.flip),'finishes facing left');
 for(const layers of paints)assert.ok(Math.abs(layers.reduce((s,l)=>s+l.weight,0)-1)<1e-6,'opacity stays normalized');
});
