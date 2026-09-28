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
    // The high bed stays at the back; the morning and evening beds come forward to flank
    // the path, and the cushion and stone sit on the lawn at the front.
    const front = Math.max(scene.nest * 0.9, h * 0.24), near = Math.max(front + 38, h * 0.4);
    const points = [[-x*.84,front],[0,-top],[x*.84,front],[-x*.58,near],[x*.58,near]];
    return anchors.map((a,i) => {
      const [px,py] = points[i], sign = px < 0 ? -1 : 1;
      return {...a, x:px,y:py,width:a.type==='patch'?64:58,height:a.type==='patch'?30:36,
        interaction: a.type==='patch' ? {x:px+sign*30,y:py+28} : {x:px-sign*24,y:py+28},
        rest: {x:px,y:py}, // Furniture contact pose; the adjacent interaction point is reserved for approach.
      };
    });
  }
  // Fixed scenery from the real garden: the rose bed Erwu naps in, the stone fountain
  // at the back left and the deadwood at the back right. Display geometry only; never saved.
  function landmarks(scene) {
    const x = Math.max(62, scene.width / 2 - 40), h = scene.height, n = scene.nest;
    const rx = Math.min(n * 1.9, scene.width * 0.3), ry = rx * 0.62;
    const fh = Math.max(44, Math.min(n * 1.4, h * 0.2));
    // A painted backdrop can carry the fountain and the log itself; `scene.scenery` then says
    // where they stand (scene coordinates, base centre), and everything keeps clear of them there.
    const painted = scene.scenery || {};
    return {
      roses: { x: 0, y: n * 0.35, rx, ry },
      fountain: painted.fountain ? { ...painted.fountain } : { x: -Math.min(x * 0.82, scene.width / 2 - fh * 0.42), y: -h * 0.19, width: fh * 0.72, height: fh },
      // a fallen log, lying a little lower and further in than the fountain opposite
      deadwood: painted.deadwood ? { ...painted.deadwood } : { x: Math.min(scene.width / 2 - fh * 0.55 - 6, Math.max(x * 0.76, rx * 0.74 + fh * 0.55)), y: Math.min(-h * 0.05, n * 0.35 - ry * 0.75), width: fh * 1.1, height: fh * 0.42 },
      // the stepping-stone path from the front of the lawn up to the rose bed
      path: { top: n * 0.35 + ry + 6, width: 24 },
    };
  }
  // Wild plants from play spread across the whole lawn: a plant's saved distance chooses
  // how far out it grows, from just beside the rose bed to the soft edge of the garden.
  // Display only; the saved position never changes.
  function projectPlant(plant, scene) {
    const slots = geometry(scene), m = landmarks(scene), r = m.roses;
    const ox = Math.max(20, scene.width / 2 - 14), oy = Math.max(20, scene.height / 2 - 16);
    const ix = Math.min(ox - 8, r.rx + 16), iy = Math.min(oy - 8, r.ry + 16);
    const t0 = Math.max(0, Math.min(1, (plant.d - 1.04) / 1.56));
    // painted pieces stand taller and wider than their places: `scene.scenery.clear` widens the
    // room kept around beds (side, above) and the rose bed (above), so no plant grows over them
    const c = (scene.scenery && scene.scenery.clear) || {}, side = c.side || 0, up = c.up || 0, roseUp = c.roseUp || 0;
    const free = (x, y) => {
      if (slots.some(a => Math.abs(x - a.x) < a.width / 2 + 10 + side && y > a.y - a.height / 2 - 6 - up && y - 26 < a.y + a.height / 2 + 6)) return false;
      if (slots.some(a => Math.hypot(x - a.interaction.x, y - 12 - a.interaction.y) < 22)) return false;
      if ([m.fountain, m.deadwood].some(f => Math.abs(x - f.x) < f.width / 2 + 10 && y > f.y - f.height - 6 && y - 22 < f.y + 8)) return false;
      if (((x - r.x) / (r.rx + 10 + side)) ** 2 + ((y - r.y) / (r.ry + 10 + (y < r.y ? roseUp : 0))) ** 2 < 1) return false;
      if (y > m.path.top - 6 && Math.abs(x) < m.path.width) return false;
      return Math.abs(x) < scene.width / 2 - 8 && y > -scene.height / 2 + 26 && y < scene.height / 2 - 4;
    };
    for (let step = 0; step < 160; step++) {
      const ring = Math.floor(step / 16), turn = step % 16;
      const angle = plant.a + (turn % 2 ? 1 : -1) * Math.ceil(turn / 2) * 0.13;
      const t = Math.max(0, Math.min(1, t0 + (ring % 2 ? 1 : -1) * Math.ceil(ring / 2) * 0.12));
      const x = r.x + Math.cos(angle) * (ix + (ox - ix) * t), y = r.y * 0.5 + Math.sin(angle) * (iy + (oy - iy) * t);
      if (free(x, y)) return { x, y };
    }
    return { x: Math.cos(plant.a) < 0 ? -ox : ox, y: oy * 0.9 };
  }
  return {VERSION,anchors,kinds,homes,records,find,at,valid,initialize,upgrade,label,placeName,plan,reverse,apply,preview,describe,geometry,landmarks,projectPlant};
});
