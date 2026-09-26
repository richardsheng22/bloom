/* Owned arrangements, reversible placement plans, and reserved garden geometry. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomGardenLayout = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const anchors = Object.freeze([
    { id: 'bed-left', name: 'the morning bed', type: 'patch' },
    { id: 'bed-top', name: 'the high bed', type: 'patch' },
    { id: 'bed-right', name: 'the evening bed', type: 'patch' },
    { id: 'nook-left', name: 'the shady nook', type: 'object' },
    { id: 'nook-right', name: 'the sunny nook', type: 'object' },
  ]);
  const kinds = { 'flower-patch': { name: 'Flower patch', type: 'patch', description: 'A little bed with room for flowers.' },
    cushion: { name: 'Cushion', type: 'object', description: 'A soft place for Erwu to settle.' },
    stone: { name: 'Sunny stone', type: 'object', description: 'A warm place for Erwu to nap.' } };
  const VERSION = 2;
  // Where each starter furnishing goes in a new garden.
  const homes = { cushion: 'nook-left', stone: 'nook-right' };
  const records = g => [...g.patches, ...g.objects];
  const find = (g, id) => records(g).find(r => r.id === id);
  const at = (g, anchor) => records(g).find(r => r.anchor === anchor);
  function valid(g) {
    if (g.layoutVersion === undefined) return true; // Before the arrangement system existed.
    if (g.layoutVersion !== VERSION) return false;
    const occupied = new Set();
    return [['patches', 'patch'], ['objects', 'object']].every(([field, type]) => Array.isArray(g[field]) && g[field].every(r => {
      if (!r || kinds[r.kind]?.type !== type) return false;
      if (type === 'patch' && (!Number.isFinite(r.growth) || r.growth < 0 || r.growth > 1 || (r.flower !== null && typeof r.flower !== 'string'))) return false;
      if (r.anchor === null) return true;
      if (!anchors.some(a => a.id === r.anchor && a.type === type) || occupied.has(r.anchor)) return false;
      occupied.add(r.anchor); return true;
    }));
  }
  // Put furnishings that have never been placed on their default nooks, if free.
  function settleHomes(g) {
    for (const o of g.objects) {
      const home = homes[o.kind];
      if (o.anchor === null && home && !at(g, home)) o.anchor = home;
    }
  }
  function initialize(g, allocate) {
    if (g.layoutVersion === 1) return upgrade(g);
    if (g.layoutVersion !== undefined) return valid(g);
    // Do not reinterpret unknown reserved records from another client.
    if (g.patches.length || g.objects.length) return false;
    g.patches = anchors.filter(a => a.type === 'patch').map(a => ({ id: allocate(g, 'patch'), kind: 'flower-patch', anchor: a.id, flower: null, growth: 0 }));
    g.objects = ['cushion', 'stone'].map(kind => ({ id: allocate(g, 'object'), kind, anchor: null }));
    settleHomes(g);
    g.layoutVersion = VERSION;
    return true;
  }
  // Version 1 beds were always empty and its furnishings started put away.
  function upgrade(g) {
    const draft = { ...g, layoutVersion: VERSION, patches: g.patches.map(p => ({ ...p, flower: null, growth: 0 })), objects: g.objects.map(o => ({ ...o })) };
    settleHomes(draft);
    if (!valid(draft)) return false;
    Object.assign(g, { layoutVersion: VERSION, patches: draft.patches, objects: draft.objects });
    return true;
  }
  const placeName = id => anchors.find(a => a.id === id)?.name || 'your collection';
  const capital = s => s.charAt(0).toUpperCase() + s.slice(1);
  // Things are named by where they are, not by number.
  function label(g, record) {
    if (record.kind === 'flower-patch') return record.anchor ? capital(placeName(record.anchor)) : 'A spare flower bed';
    return kinds[record.kind]?.name || 'Garden item';
  }
  function plan(g, id, destination) {
    if (!valid(g) || g.layoutVersion !== VERSION) return null;
    const item = find(g, id);
    if (!item || item.anchor === destination) return null;
    if (destination !== null && !anchors.some(a => a.id === destination && a.type === kinds[item.kind].type)) return null;
    const displaced = destination === null ? null : at(g, destination);
    const changes = [{ id, from: item.anchor, to: destination }];
    if (displaced) changes.push({ id: displaced.id, from: destination, to: item.anchor });
    return { action: displaced ? 'swap' : destination === null ? 'remove' : 'place', changes };
  }
  function reverse(plan) {
    return { action: 'undo', changes: plan.changes.map(({id,from,to}) => ({id,from:to,to:from})) };
  }
  function apply(g, plan) {
    if (!plan || !plan.changes.length || new Set(plan.changes.map(c => c.id)).size !== plan.changes.length) return false;
    if (!plan.changes.every(c => find(g,c.id)?.anchor === c.from)) return false;
    const candidate = preview(g, plan);
    if (!valid(candidate)) return false;
    for (const c of plan.changes) find(g,c.id).anchor = c.to;
    return true;
  }
  function preview(g, plan) {
    // A change to null means explicitly put away, so test for the change, not its value.
    const rows = list => list.map(r => {
      const change = plan?.changes.find(c => c.id === r.id);
      return change ? {...r, anchor: change.to} : {...r};
    });
    return {...g, patches:rows(g.patches), objects:rows(g.objects)};
  }
  function describe(g, plan) {
    if (!plan) return '';
    return plan.changes.map(c => {
      const item = find(g,c.id), name = item.kind === 'flower-patch' ? (c.from ? `The bed in ${placeName(c.from)}` : 'The spare bed') : `The ${kinds[item.kind].name.toLowerCase()}`;
      return c.to === null ? `${name} goes back to your collection.` : `${name} moves to ${placeName(c.to)}.`;
    }).join(' ');
  }
  function geometry(scene) {
    const x = Math.max(62, scene.width / 2 - 40), h = scene.height;
    const top = Math.max(scene.nest + 48, h * 0.30);
    const side = Math.max(scene.nest + 14, h * 0.24);
    const lower = Math.max(scene.nest * 0.65, Math.min(72, h * 0.18));
    const points = [[-x*.78,-side],[0,-top],[x*.78,-side],[-x*.83,lower],[x*.83,lower]];
    return anchors.map((a,i) => {
      const [px,py] = points[i], sign = px < 0 ? -1 : 1;
      return {...a, x:px,y:py,width:a.type==='patch'?64:58,height:a.type==='patch'?30:36,
        interaction: a.type==='patch' ? {x:px+sign*30,y:py+28} : {x:px-sign*24,y:py+28},
        rest: {x:px,y:py}, // Furniture contact pose; the adjacent interaction point is reserved for approach.
      };
    });
  }
  function projectPlant(plant, scene) {
    // Retain every legacy plant as a deterministic border. This is display-only.
    const rx=Math.max(20,scene.width/2-16), ry=Math.max(20,scene.height/2-42);
    const band=4+Math.max(0,Math.min(1,(plant.d-1)/1.6))*10;
    const slots=geometry(scene);
    for(let step=0;step<100;step++) {
      const angle=plant.a+(step%2?1:-1)*Math.ceil(step/2)*0.10;
      const x=Math.cos(angle)*(rx-band), y=Math.sin(angle)*(ry-band);
      const clashes=slots.some(a => Math.abs(x-a.x)<a.width/2+14 && y>a.y-a.height/2-8 && y-30<a.y+a.height/2+8);
      const route=y>0&&Math.abs(x)<26;
      const approach=slots.some(a=>Math.hypot(x-a.interaction.x,y-12-a.interaction.y)<25);
      if(!clashes&&!route&&!approach&&Math.hypot(x,y)>scene.nest+28)return {x,y};
    }
    return {x:Math.cos(plant.a)<0?-rx:rx,y:-ry};
  }
  return {VERSION,anchors,kinds,homes,records,find,at,valid,initialize,upgrade,label,placeName,plan,reverse,apply,preview,describe,geometry,projectPlant};
});
