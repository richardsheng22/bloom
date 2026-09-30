/* Stable run checkpoints. Decode before touching live state; a bad run never hides the garden. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();else root.BloomRun=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const KEY='bloom.run3', RECOVERY='bloom.run3.recovery';
  const KINDS=['shape','orb','petal','mushroom','ring','dew','bee','sun','dandelion'];
  const RARE=['catnip','sunflower','moonflower','dandelion','bleeding-heart','strawberry'];
  const SPECIAL=['gust','lone','flutter'];
  const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const integer=(v,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const optional=(o,k,check)=>o[k]===undefined||check(o[k]);
  const bool=v=>typeof v==='boolean';
  const text=v=>typeof v==='string'&&v.length>0;
  function validItem(i){
    if(!record(i)||!KINDS.includes(i.kind)||!integer(i.sector,0,9)||!integer(i.ring,1,7))return false;
    if(!optional(i,'seed',v=>i.kind==='shape'&&RARE.includes(v))||!optional(i,'stubborn',v=>i.kind==='shape'&&bool(v)))return false;
    return i.kind!=='shape'||integer(i.hp,1)&&integer(i.maxHp,i.hp)&&optional(i,'sp',v=>integer(v,0,4))&&optional(i,'ci',v=>integer(v,0,3));
  }
  function valid(r){
    return record(r)&&r.v===3&&integer(r.turn,1)&&integer(r.ballCount,1)&&
      optional(r,'petalNext',bool)&&optional(r,'pawReady',bool)&&
      optional(r,'charges',v=>Array.isArray(v)&&v.length===10&&v.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1))&&
      Array.isArray(r.items)&&r.items.every(validItem)&&
      optional(r,'seed',v=>record(v)&&RARE.includes(v.kind)&&text(v.key)&&integer(v.turn,1)&&optional(v,'spawned',bool))&&
      optional(r,'special',v=>record(v)&&integer(v.next,1)&&(v.kind===null||SPECIAL.includes(v.kind))&&
        optional(v,'last',x=>x===null||SPECIAL.includes(x))&&optional(v,'bonus',x=>integer(x,0,5)))&&
      optional(r,'log',v=>record(v)&&record(v.beds)&&Object.values(v.beds).every(x=>typeof x==='string')&&
        Array.isArray(v.seeds)&&v.seeds.every(x=>RARE.includes(x)));
  }
  function decodeRun(raw){
    if(raw===null||raw===undefined)return {status:'missing'};
    let r;try{r=JSON.parse(raw)}catch{return {status:'invalid'}}
    if(record(r)&&integer(r.v,4))return {status:'future'};
    if(!valid(r))return {status:'invalid'};
    return {status:'valid',run:{...r,petalNext:r.petalNext??false,pawReady:r.pawReady??true,charges:r.charges??Array(10).fill(0)}};
  }
  function load(storage){
    try{const raw=storage.getItem(KEY);return {...decodeRun(raw),raw,writable:true,issue:null}}
    catch{return {status:'unavailable',raw:null,writable:false,issue:'unavailable'}}
  }
  // Called only when the player explicitly starts a replacement run. One recovery slot,
  // verified before replacement; unsupported future data is never overwritten.
  function prepare(storage,session){
    if(session.status==='future'||session.status==='unavailable'){session.writable=false;return false;}
    if(session.status==='invalid'){
      try{storage.setItem(RECOVERY,session.raw);if(storage.getItem(RECOVERY)!==session.raw)throw Error('Recovery write failed');}
      catch{session.writable=false;session.issue='recovery';return false;}
    }
    session.status='missing';session.writable=true;session.issue=null;return true;
  }
  function save(storage,session,run){
    if(!session.writable||['invalid','future','unavailable'].includes(session.status))return false;
    if(!valid(run)){session.issue='invalid-checkpoint';return false;}
    try{const raw=JSON.stringify(run);storage.setItem(KEY,raw);if(storage.getItem(KEY)!==raw)throw Error('Write failed');
      session.raw=raw;session.status='valid';session.issue=null;return true;
    }catch{session.issue='write';return false;}
  }
  function clear(storage,session){
    if(!session.writable||['invalid','future','unavailable'].includes(session.status))return false;
    try{storage.removeItem(KEY);if(storage.getItem(KEY)!==null)throw Error('Delete failed');session.status='missing';session.raw=null;return true;}
    catch{session.issue='write';return false;}
  }
  return {KEY,RECOVERY,valid,decodeRun,load,prepare,save,clear};
});
