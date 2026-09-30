const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../run-state.js');
const run=()=>({v:3,turn:8,ballCount:10,petalNext:false,pawReady:true,charges:Array(10).fill(0),items:[{kind:'shape',sector:0,ring:2,hp:7,maxHp:8,sp:0,ci:1}]});
const storage=(data={})=>({getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v},removeItem:k=>{delete data[k]}});
test('supported checkpoints round trip and missing old optional fields normalize',()=>{
  assert.deepEqual(R.decodeRun(JSON.stringify(run())),{status:'valid',run:run()});
  const old=run();delete old.charges;delete old.pawReady;delete old.petalNext;
  assert.deepEqual(R.decodeRun(JSON.stringify(old)).run,run());
  const long=run();long.turn=12000;long.ballCount=25000;long.items[0].hp=long.items[0].maxHp=100000;assert.ok(R.valid(long));
});
test('invalid item, scalar and optional metadata never reaches restore',()=>{
  for(const mutate of [r=>r.items=[null],r=>r.items='bad',r=>r.items[0].kind='dragon',r=>r.items[0].ring=0,r=>r.items[0].hp=9,r=>r.ballCount=0,r=>r.turn=1.2,r=>r.charges[0]=null,r=>r.log={beds:[],seeds:[]},r=>r.special={next:12,kind:'bad'},r=>r.seed={kind:'catnip',key:'x',turn:'3'}]){
    const r=run();mutate(r);assert.equal(R.decodeRun(JSON.stringify(r)).status,'invalid');
  }
  assert.equal(R.decodeRun('{broken').status,'invalid');assert.equal(R.decodeRun(null).status,'missing');
});
test('replacement preserves malformed bytes before writing; future data remains untouched',()=>{
  const s=storage({[R.KEY]:'{bad'}),session=R.load(s);
  assert.equal(R.save(s,session,run()),false);assert.equal(s.getItem(R.KEY),'{bad');
  assert.ok(R.prepare(s,session));assert.equal(s.getItem(R.RECOVERY),'{bad');assert.ok(R.save(s,session,run()));
  const future=JSON.stringify({v:9}),f=storage({[R.KEY]:future}),fs=R.load(f);
  assert.equal(R.prepare(f,fs),false);assert.equal(R.save(f,fs,run()),false);assert.equal(R.clear(f,fs),false);assert.equal(f.getItem(R.KEY),future);
});
test('failed quarantine and silent failed writes are detected without deleting the original',()=>{
  const s=storage({[R.KEY]:'{bad'});s.setItem=()=>{};const session=R.load(s);
  assert.equal(R.prepare(s,session),false);assert.equal(R.save(s,session,run()),false);assert.equal(s.getItem(R.KEY),'{bad');
  const good=storage({[R.KEY]:JSON.stringify(run())}),g=R.load(good);good.setItem=()=>{};
  const next=run();next.turn++;assert.equal(R.save(good,g,next),false);assert.equal(g.issue,'write');
});
