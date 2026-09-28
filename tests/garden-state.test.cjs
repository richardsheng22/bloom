const { test } = require('node:test');
const assert = require('node:assert/strict');
const G = require('../garden-state.js');
const NOW = 1800000000000, HOUR = 3600000;
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
}
const legacy = () => ({ v: 1, tended: NOW, decayed: NOW, plants:
  ['grass', 'clover', 'fern', 'mushroom', 'daisy', 'cosmos', 'lavender', 'forget', 'buttercup']
    .map((k, i) => ({ a: i * 0.31, d: 1.2 + i * 0.1, k, g: 0.2 + i * 0.1, s: 27 + i })) });
const ownership = g => ({ plants: g.plants, patches: g.patches, objects: g.objects, discoveries: g.discoveries, nextIds: g.nextIds });
function fixture() {
  const old = JSON.stringify(legacy()), disk = storage({ [G.LEGACY]: old });
  return { disk, old, session: G.load(disk, NOW) };
}
test('migration preserves every plant property exactly and retains the original snapshot', () => {
  const { disk, old, session } = fixture();
  assert.equal(session.garden.fresh, undefined);
  assert.deepEqual(session.garden.plants.map(({ id, ...p }) => p), legacy().plants);
  assert.equal(new Set(session.garden.plants.map(p => p.id)).size, 9);
  assert.ok(G.save(disk, session));
  assert.equal(disk.getItem(G.LEGACY), old);
  assert.deepEqual(G.load(disk, NOW).garden, session.garden);
});
test('0h through 30d absences preserve all ownership including future placed objects and discoveries', () => {
  for (const hours of [0, 12, 72, 168, 720]) {
    const { disk, session } = fixture();
    const g = session.garden;
    for (const [field, domain] of [['patches', 'patch'], ['objects', 'object'], ['discoveries', 'discovery']]) {
      g[field].push({ id: G.allocateId(g, domain), name: domain, a: 1.2, d: 1.8 });
    }
    const before = structuredClone(ownership(g));
    G.arrive(g, NOW + hours * HOUR);
    assert.deepEqual(ownership(g), before);
    assert.equal(g.rest, Math.min(1, Math.max(0, hours - G.REST.graceHours) / G.REST.settleHours));
    assert.ok(G.save(disk, session));
    assert.deepEqual(ownership(G.load(disk, NOW + hours * HOUR).garden), before);
  }
});
test('reload during waking neither resets rest nor grants growth; IDs remain unique', () => {
  const { disk, session } = fixture();
  G.arrive(session.garden, NOW + 168 * HOUR);
  const before = structuredClone(session.garden.plants);
  for (let i = 0; i < 15; i++) G.wake(session.garden, 1);
  assert.ok(G.save(disk, session));
  const restored = G.load(disk, session.garden.lastSeen);
  G.arrive(restored.garden, restored.garden.lastSeen);
  assert.ok(Math.abs(restored.garden.rest - 5 / 6) < 1e-10);
  assert.deepEqual(restored.garden.plants, before);
  assert.equal(G.allocateId(restored.garden), 'plant-10');
});
test('visiting wakes the garden only part way; play brings the rest back; growth untouched', () => {
  const { session } = fixture(), g = session.garden;
  const before = structuredClone(g.plants);
  G.arrive(g, NOW + 720 * HOUR);
  const floor = g.rest * (1 - G.REST.visitWake);
  for (let i = 0; i < 200; i++) G.wake(g, 1, floor);
  assert.ok(Math.abs(g.rest - floor) < 1e-10);
  assert.deepEqual(g.plants, before);
  for (let i = 0; i < 2; i++) G.tend(g, NOW + 720 * HOUR);
  assert.ok(Math.abs(g.rest - (floor - 2 * G.REST.turnRecovery)) < 1e-10);
  G.wake(g, 1, floor);
  assert.ok(g.rest < floor, 'waking never pushes rest back up to the floor');
  // with no floor, visiting still wakes completely
  G.arrive(g, NOW + 1440 * HOUR);
  for (let i = 0; i < 91; i++) G.wake(g, 1);
  assert.equal(g.rest, 0);
});
test('turns nurture owned growth and accelerate wake-up without changing plant identity', () => {
  const { session } = fixture(), g = session.garden;
  G.arrive(g, NOW + 168 * HOUR);
  const ids = g.plants.map(p => p.id);
  G.tend(g, NOW + 168 * HOUR + 1000);
  assert.ok(Math.abs(g.rest - 0.82) < 1e-10);
  assert.deepEqual(g.plants.map(p => p.id), ids);
  g.plants.forEach((p, i) => assert.equal(p.g, Math.min(1, legacy().plants[i].g + 0.035)));
});
test('clock rollback and extreme forward time are bounded, deterministic and non-destructive', () => {
  const { session } = fixture(), g = session.garden;
  const before = structuredClone(g.plants);
  g.rest = 0.4;
  G.arrive(g, NOW - HOUR * 300);
  assert.equal(g.rest, 0.4);
  assert.equal(G.restAt(g, NOW - HOUR * 300), 0.4);
  G.arrive(g, Number.MAX_SAFE_INTEGER);
  assert.equal(g.rest, 1);
  assert.deepEqual(g.plants, before);
});
test('malformed or unsupported saves are never overwritten or silently reset', () => {
  for (const raw of ['{bad', JSON.stringify({ v: 3 }), JSON.stringify({ v: 2, plants: [] })]) {
    const disk = storage({ [G.KEY]: raw }), session = G.load(disk, NOW);
    assert.equal(session.writable, false);
    assert.equal(G.save(disk, session), false);
    assert.equal(disk.getItem(G.KEY), raw);
  }
});
test('invalid plants and duplicate IDs recover from the last verified save', () => {
  const { disk, session } = fixture();
  assert.ok(G.save(disk, session));
  assert.ok(G.save(disk, session));
  const baseline = structuredClone(session.garden);
  for (const breakSave of [g => g.plants[0].g = -1, g => g.plants[1].id = g.plants[0].id, g => g.objects = null]) {
    const invalid = structuredClone(baseline); breakSave(invalid);
    disk.setItem(G.KEY, JSON.stringify(invalid));
    const restored = G.load(disk, NOW);
    assert.equal(restored.issue, 'recovered');
    assert.deepEqual(restored.garden, baseline);
    assert.ok(G.save(disk, restored));
  }
});
test('a failed migration write keeps legacy data and retries with the same IDs', () => {
  const { disk, old, session } = fixture();
  const write = disk.setItem; disk.setItem = () => { throw new Error('quota'); };
  assert.equal(G.save(disk, session), false);
  assert.equal(disk.getItem(G.LEGACY), old);
  assert.deepEqual(G.load(disk, NOW).garden.plants, session.garden.plants);
  disk.setItem = write;
  assert.ok(G.save(disk, session));
});
test('failure while replacing an existing save leaves the previous snapshot readable', () => {
  const { disk, session } = fixture(); G.save(disk, session);
  const before = disk.getItem(G.KEY), write = disk.setItem;
  session.garden.plants[0].g += 0.1;
  disk.setItem = (key, value) => { if (key === G.KEY) throw new Error('quota'); return write(key, value); };
  assert.equal(G.save(disk, session), false);
  assert.equal(disk.getItem(G.KEY), before);
  assert.equal(disk.getItem(G.BACKUP), before);
});
test('silent write failures are detected by readback', () => {
  const { disk, session } = fixture();
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
  const { disk, session } = fixture();
  session.garden.plants[0].live = -1;
  G.save(disk, session);
  const restored = G.load(disk, NOW);
  assert.equal(restored.garden.plants.length, 9);
  assert.equal(restored.garden.plants[0].live, undefined);
  assert.equal(restored.garden.plants[0].id, session.garden.plants[0].id);
});
test('an existing intentionally empty garden is not seeded again', () => {
  const disk = storage({ [G.LEGACY]: JSON.stringify({ ...legacy(), plants: [] }) });
  const session = G.load(disk, NOW);
  assert.equal(session.garden.fresh, undefined);
  assert.equal(session.garden.plants.length, 0);
});
test('a crowded legacy garden keeps all 170 plants, including duplicate visual seeds', () => {
  const old = legacy();
  old.plants = Array.from({ length: 170 }, (_, i) => ({ ...old.plants[i % old.plants.length] }));
  const disk = storage({ [G.LEGACY]: JSON.stringify(old) });
  const session = G.load(disk, NOW);
  G.arrive(session.garden, NOW + 720 * HOUR);
  assert.equal(session.garden.plants.length, 170);
  assert.equal(new Set(session.garden.plants.map(p => p.id)).size, 170);
  assert.deepEqual(session.garden.plants.map(({id,...p})=>p), old.plants);
  assert.ok(G.save(disk, session));
  assert.equal(G.allocateId(G.load(disk, NOW).garden), 'plant-171');
});
test('a full garden matures: the wildflowers it grows into are valid saved plants', () => {
  const { disk, session } = fixture();
  for (const k of ['foxglove', 'bluebell', 'sweetpea', 'cornflower', 'rose', 'wild']) session.garden.plants.push({ id: G.allocateId(session.garden), a: 1, d: 1.5, k, g: 0.5, s: 7 });
  assert.ok(G.save(disk, session));
  assert.equal(G.load(disk, NOW).issue, null);
  assert.deepEqual(G.load(disk, NOW).garden.plants.slice(-6).map(p => p.k), ['foxglove', 'bluebell', 'sweetpea', 'cornflower', 'rose', 'wild']);
});
