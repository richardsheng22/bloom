const { test } = require('node:test');
const assert = require('node:assert/strict');
const G = require('../garden-state.js');
const L = require('../garden-layout.js');
const NOW = 1800000000000, HOUR = 3600000;
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
}
const KINDS = ['grass', 'clover', 'fern', 'mushroom', 'daisy', 'cosmos', 'lavender', 'forget', 'buttercup'];
const ownership = g => ({ plants: g.plants, patches: g.patches, objects: g.objects, discoveries: g.discoveries, nextIds: g.nextIds });
// A grown v4 garden, as the game would have it after some play.
function grown() {
  const disk = storage(), session = G.load(disk, NOW), g = session.garden;
  delete g.fresh;
  L.initialize(g, G.allocateId);
  KINDS.forEach((k, i) => g.plants.push({ id: G.allocateId(g), a: i * 0.31, d: 1.2 + i * 0.1, k, g: 0.2 + i * 0.1, s: 27 + i }));
  return { disk, session, g };
}
// What the v0.9 game left behind, which 1.0 must leave exactly as it is.
const oldSaves = () => ({
  'bloom.garden2': JSON.stringify({ v: 3, plants: [{ id: 'plant-1', a: 1, d: 1.4, k: 'daisy', g: 0.5, s: 9 }], rest: 0.4 }),
  'bloom.garden2.backup': JSON.stringify({ v: 2, plants: [] }),
  'bloom.garden1': JSON.stringify({ v: 1, tended: NOW, plants: [] }),
});

test('1.0 starts everyone with a new, bare garden and leaves older saves byte-for-byte untouched', () => {
  const before = oldSaves(), disk = storage(before);
  const session = G.load(disk, NOW);
  assert.equal(session.issue, null);
  assert.equal(session.writable, true);
  assert.equal(session.garden.v, 4);
  assert.equal(session.garden.fresh, true);
  assert.equal(session.garden.plants.length, 0);
  L.initialize(session.garden, G.allocateId);
  assert.ok(G.save(disk, session));
  for (const k of G.RETIRED) assert.equal(disk.getItem(k), before[k]);
  assert.deepEqual(G.RETIRED, Object.keys(before));
});
test('a v4 garden round-trips with its day, character and visits', () => {
  const { disk, session, g } = grown();
  g.time.turns = 7; g.character.dew = 2.5; g.visits.seen.bluejay = 3;
  assert.ok(G.save(disk, session));
  const back = G.load(disk, NOW).garden;
  assert.deepEqual(back, G.snapshot(g));
  assert.equal(back.time.turns, 7);
  assert.equal(back.character.dew, 2.5);
  assert.equal(back.visits.seen.bluejay, 3);
});
test('being away never dims, hides or removes anything, from an hour to a month', () => {
  for (const hours of [0, 12, 72, 168, 720]) {
    const { disk, session, g } = grown();
    g.discoveries.push({ id: G.allocateId(g, 'discovery'), type: 'visit-first', kind: 'fox', at: NOW });
    const before = structuredClone(ownership(g));
    G.arrive(g, NOW + hours * HOUR);
    assert.equal(g.rest, 0);
    assert.deepEqual(ownership(g), before);
    assert.ok(G.save(disk, session));
    assert.deepEqual(ownership(G.load(disk, NOW + hours * HOUR).garden), before);
  }
});
test('turns nurture owned growth by the amount given, without changing plant identity', () => {
  const { g } = grown();
  const ids = g.plants.map(p => p.id), start = g.plants.map(p => p.g);
  G.tend(g, NOW + 1000);
  G.tend(g, NOW + 2000, 0.0025);
  assert.deepEqual(g.plants.map(p => p.id), ids);
  g.plants.forEach((p, i) => assert.ok(Math.abs(p.g - Math.min(1, start[i] + G.TEND + 0.0025)) < 1e-12));
});
test('a clock moved backwards never moves lastSeen back', () => {
  const { g } = grown();
  G.arrive(g, NOW + 10 * HOUR);
  G.arrive(g, NOW - 300 * HOUR);
  assert.equal(g.lastSeen, NOW + 10 * HOUR);
});
test('malformed or newer saves are never overwritten or silently reset', () => {
  for (const raw of ['{bad', JSON.stringify({ v: 4 }), JSON.stringify({ v: 3, plants: [] })]) {
    const disk = storage({ [G.KEY]: raw }), session = G.load(disk, NOW);
    assert.equal(session.writable, false);
    assert.equal(G.save(disk, session), false);
    assert.equal(disk.getItem(G.KEY), raw);
  }
  const disk = storage({ [G.KEY]: JSON.stringify({ v: 5 }) });
  assert.equal(G.load(disk, NOW).issue, 'newer');
});
test('invalid plants and duplicate IDs recover from the last verified save', () => {
  const { disk, session } = grown();
  assert.ok(G.save(disk, session));
  assert.ok(G.save(disk, session));
  const baseline = structuredClone(G.snapshot(session.garden));
  for (const breakSave of [g => g.plants[0].g = -1, g => g.plants[1].id = g.plants[0].id, g => g.objects = null, g => g.time = null, g => g.visits.seen = { dragon: 1 }]) {
    const invalid = structuredClone(baseline); breakSave(invalid);
    disk.setItem(G.KEY, JSON.stringify(invalid));
    const restored = G.load(disk, NOW);
    assert.equal(restored.issue, 'recovered');
    assert.deepEqual(restored.garden, baseline);
    assert.ok(G.save(disk, restored));
  }
});
test('failure while replacing an existing save leaves the previous snapshot readable', () => {
  const { disk, session } = grown(); G.save(disk, session);
  const before = disk.getItem(G.KEY), write = disk.setItem;
  session.garden.plants[0].g += 0.1;
  disk.setItem = (key, value) => { if (key === G.KEY) throw new Error('quota'); return write(key, value); };
  assert.equal(G.save(disk, session), false);
  assert.equal(disk.getItem(G.KEY), before);
  assert.equal(disk.getItem(G.BACKUP), before);
});
test('silent write failures are detected by readback', () => {
  const { disk, session } = grown();
  disk.setItem = () => {};
  assert.equal(G.save(disk, session), false);
  assert.equal(disk.getItem(G.KEY), null);
});
test('unavailable storage permits temporary play but cannot overwrite unseen data', () => {
  const disk = { getItem() { throw new Error('blocked'); } };
  const session = G.load(disk, NOW);
  assert.equal(session.issue, 'unavailable');
  assert.equal(G.save(disk, session), false);
});
test('seed flights persist once as owned plants without animation fields', () => {
  const { disk, session } = grown();
  session.garden.plants[0].live = -1;
  G.save(disk, session);
  const restored = G.load(disk, NOW);
  assert.equal(restored.garden.plants.length, 9);
  assert.equal(restored.garden.plants[0].live, undefined);
  assert.equal(restored.garden.plants[0].id, session.garden.plants[0].id);
});
test('a full garden keeps all 170 plants', () => {
  const { disk, session, g } = grown();
  while (g.plants.length < 170) g.plants.push({ ...g.plants[g.plants.length % 9], id: G.allocateId(g) });
  assert.ok(G.save(disk, session));
  assert.equal(G.load(disk, NOW).garden.plants.length, 170);
  assert.equal(G.allocateId(G.load(disk, NOW).garden), 'plant-171');
});
test('wildflowers and the flowers buds grow into are valid saved plants', () => {
  const { disk, session } = grown();
  const kinds = ['foxglove', 'bluebell', 'sweetpea', 'cornflower', 'rose', 'wild', 'tulip', 'peony', 'poppy'];
  for (const k of kinds) session.garden.plants.push({ id: G.allocateId(session.garden), a: 1, d: 1.5, k, g: 0.5, s: 7 });
  assert.ok(G.save(disk, session));
  assert.equal(G.load(disk, NOW).issue, null);
  assert.deepEqual(G.load(disk, NOW).garden.plants.slice(-kinds.length).map(p => p.k), kinds);
});
