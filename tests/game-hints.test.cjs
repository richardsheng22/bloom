const test=require('node:test'),assert=require('node:assert/strict'),H=require('../game-hints');
const bud={id:1,kind:'shape',ring:1,hp:18};
const state={state:'ready',items:[bud],turn:2,pawReady:true};
test('guidance follows live objects and swat state',()=>{
 assert.equal(H.select(state,{}).id,'launch');
 assert.match(H.select(state,{launch:true}).text,/swat/);
 assert.match(H.select({...state,pawReady:false},{launch:true}).text,/push/);
 assert.equal(H.select({...state,target:bud},{}).id,'health');
 assert.equal(H.select({...state,items:[{...bud,dead:true}]},{launch:true}),null);
 assert.equal(H.select({...state,state:'flying',elapsed:2},{}),null);
 assert.equal(H.select({...state,state:'flying',elapsed:3},{}).id,'speed');
});
test('preferences preserve acknowledged mechanics without owning game progress',()=>{
 const p=H.preferences({v:1,seen:{health:true,dew:false}},{bee:true},true);
 assert.deepEqual(p,{v:1,seen:{health:true,bee:true,launch:true,movement:true}});
 assert.deepEqual(H.preferences(null,null).seen,{});
 assert.equal(H.select({...state,items:[{id:2,kind:'dew'}]},p.seen).id,'dew');
 assert.equal(H.select({...state,items:[{id:2,kind:'dew',dead:true}]},p.seen),null);
});
