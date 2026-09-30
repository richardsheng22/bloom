/* Contextual guidance owns no garden or run state. Acknowledgement follows visible time. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BloomHints=factory();})(globalThis,function(){
  const mechanics={
    mushroom:'Mushrooms bounce pollen back. Try aiming at one.',
    ring:'Pollen through a flower ring turns golden and hits twice.',
    dew:'Hit the dewdrop with pollen to wash nearby buds back.',
    bee:'Hit the bee with pollen. Its swarm helps the buds nearest Erwu.',
    sun:'Hit the sunbeam with pollen to sweep half the flower.',
    dandelion:'Hit the dandelion. Passing pollen scatters for the rest of this shot.',
    petal:'Catch the loose petal. Your next shot splits in three.',
    orb:'Catch golden pollen for one more pollen next shot.'
  };
  function preferences(raw,legacy={},returning=false){
    const seen={};
    if(raw?.v===1&&raw.seen&&typeof raw.seen==='object')for(const [k,v]of Object.entries(raw.seen))if(v===true)seen[k]=true;
    for(const k of Object.keys(mechanics))if(legacy?.[k]===true)seen[k]=true;
    if(legacy?.seedbud===true)seen.seed=true;
    if(returning){seen.launch=true;seen.movement=true;}
    return {v:1,seen};
  }
  function select(s,seen={}){
    const live=s.items.filter(i=>!i.dead), bud=live.find(i=>i.kind==='shape');
    const make=(id,text,item)=>seen[id]?null:{id,text,itemId:item?.id??null};
    if(s.state==='flying')return s.elapsed>=2.5?make('speed','Long flight? Speed · 3× brings the pollen home sooner.'):null;
    if(s.state!=='ready')return null;
    if(s.target){if(s.target.kind==='shape')return make('health',`The number is hits left · ${s.target.hp} to open this bud.`,s.target);return null;}
    if(s.aiming)return null;
    if(!seen.launch)return make('launch','Pull back anywhere and let go to launch');
    const danger=live.find(i=>i.kind==='shape'&&i.ring<=1);
    if(danger&&!seen.danger)return make('danger',s.pawReady?'If this bud reaches Erwu, she’ll use her swat.':'Clear or push this bud back to keep Erwu here.',danger);
    if(!s.pawReady&&!seen.swat)return make('swat','Swat used · fill every petal for Full bloom to restore it.');
    const moved=live.find(i=>i.kind==='shape'&&i.ring<7);
    if(s.turn>1&&moved&&!seen.movement)return make('movement','After each shot, the buds spiral one step closer.',moved);
    const seed=live.find(i=>i.seed);
    if(seed&&!seen.seed)return make('seed','Open this seed bud. Its rare seed waits in the garden tin.',seed);
    for(const i of live)if(mechanics[i.kind]&&!seen[i.kind])return make(i.kind,mechanics[i.kind],i);
    return null;
  }
  return {preferences,select};
});
