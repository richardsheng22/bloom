const {test}=require('node:test');
const assert=require('node:assert/strict');
const V=require('../garden-view.js');
test('stable turns and game over enter immediately; in-flight and advancing requests are cancellable',()=>{
  for(const phase of ['ready','over'])assert.deepEqual(V.request(phase,false),{enter:true,pending:false});
  for(const phase of ['flying','advancing']){
    assert.deepEqual(V.request(phase,false),{enter:false,pending:true});
    assert.deepEqual(V.request(phase,true),{enter:false,pending:false});
  }
});
test('garden projection stays within the scene across portrait, short, and landscape rectangles',()=>{
  for(const [width,height] of [[288,230],[358,470],[400,590],[260,300],[660,380]]){
    const scene=V.layout({left:16,top:88,width,height});
    for(let i=0;i<100;i++){
      const plant={a:i*Math.PI/17,d:1.06+i%17/10,g:1};const before={...plant};
      const p=V.project(plant,scene);
      assert.ok(Math.abs(p.x)<=width/2-28+1e-8);
      assert.ok(Math.abs(p.y)<=height/2-28+1e-8);
      assert.deepEqual(plant,before);
    }
    assert.ok(scene.nest*2>=44);
  }
});
test('touch picking uses the nearest visible stem and ignores empty ground',()=>{
  const scene=V.layout({left:0,top:0,width:358,height:380});
  const plants=[{id:'plant-1',a:0,d:2,g:1},{id:'plant-2',a:Math.PI,d:2,g:.3}];
  const p=V.project(plants[0],scene);
  assert.equal(V.nearest(plants,scene,p.x,p.y-20).id,'plant-1');
  assert.equal(V.nearest(plants,scene,0,0),null);
});
