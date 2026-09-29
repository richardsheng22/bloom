const { test } = require('node:test');
const assert = require('node:assert/strict');
const B = require('../garden-beds.js');
const L = require('../garden-layout.js');
const G = require('../garden-state.js');
const NOW = 1800000000000;

function garden() {
  const g = G.fresh(NOW);
  delete g.fresh;
  L.initialize(g, G.allocateId);
  return g;
}
// A tiny deterministic source of randomness for the pacing rules.
const rng = (...values) => { let i = 0; return () => values[i++ % values.length]; };
const plant = (g, i, kind) => { assert.ok(B.applyPlanting(g, B.planPlanting(g, g.patches[i].id, { kind }), G.allocateId)); return g.patches[i]; };

test('stages follow growth', () => {
  assert.deepEqual([0, 0.1, 0.3, 0.7, 1].map((growth) => B.stage({ flower: 'daisy', growth })), ['planted', 'planted', 'growing', 'flowering', 'established']);
  assert.equal(B.stage({ flower: null, growth: 0 }), 'empty');
});

test('planting a bed makes it the focus; play grows it and other beds only a little', () => {
  const g = garden();
  const a = plant(g, 0, 'lavender'), b = plant(g, 1, 'daisy');
  assert.equal(g.focus, b.id);
  B.tendTurn(g);
  assert.equal(b.growth, B.GROW.turn);
  assert.equal(a.growth, B.GROW.turn * B.GROW.idle);
  B.grow(g, B.GROW.bloom, 'bloom');
  assert.equal(a.growth, B.GROW.turn * B.GROW.idle);
  assert.ok(G.valid(g));
});

test('a stage change is reported once; established beds hand the focus on', () => {
  const g = garden();
  const a = plant(g, 0, 'cosmos'), b = plant(g, 1, 'daisy');
  B.setFocus(g, a.id);
  a.growth = 0.99;
  const change = B.grow(g, 0.05);
  assert.deepEqual([change.before, change.after], ['flowering', 'established']);
  assert.equal(B.focusBed(g), b);
  assert.equal(B.grow(g, 0.05, 'bloom'), null);
  assert.equal(b.growth, 0.05 * B.GROW.idle + 0.05); // its idle share from the first (turn) grow, then the bloom
  assert.equal(a.growth, 1);
});

test('rare plantings establish more slowly with the same rewards', () => {
  const g = garden(), bed = g.patches[0];
  g.seeds.push({ id: G.allocateId(g, 'seed'), kind: 'catnip', growth: 0 });
  assert.ok(B.applyPlanting(g, B.planPlanting(g, bed.id, { seed: g.seeds[0].id }), G.allocateId));
  B.grow(g, 0.1, 'bloom');
  assert.equal(bed.growth, 0.1 * B.GROW.rare);
  assert.equal(g.seeds.length, 0);
});

test('replanting never destroys: the old planting waits in the tin with its growth', () => {
  const g = garden(), bed = plant(g, 0, 'lavender');
  bed.growth = 0.7;
  const plan = B.planPlanting(g, bed.id, { kind: 'daisy' });
  assert.deepEqual(plan.uprooted, { kind: 'lavender', growth: 0.7 });
  assert.ok(B.applyPlanting(g, plan, G.allocateId));
  assert.deepEqual(g.seeds.map((s) => [s.kind, s.growth]), [['lavender', 0.7]]);
  // and it can go back in, exactly as grown
  assert.ok(B.applyPlanting(g, B.planPlanting(g, bed.id, { seed: g.seeds[0].id }), G.allocateId));
  assert.deepEqual([bed.flower, bed.growth], ['lavender', 0.7]);
  // a just-planted common flower has nothing worth keeping, so the tin is empty again
  assert.deepEqual(g.seeds, []);
  assert.equal(B.planPlanting(g, bed.id, { kind: 'lavender' }), null);
});

test('the first seed bud arrives within two runs', () => {
  const g = garden();
  assert.equal(B.planRun(g, rng(0.99)), null);
  const plan = B.planRun(g, rng(0.99, 0.5, 0.2, 0.3));
  assert.ok(plan);
  assert.ok(plan.turn >= B.LUCK.earliest && plan.turn <= B.LUCK.latest);
  assert.ok(B.RARE.includes(plan.kind));
});

test('each dry run makes a seed more likely, and collecting resets the count', () => {
  const g = garden();
  g.discoveries.push({ id: G.allocateId(g, 'discovery'), type: 'seed-found', kind: 'catnip', at: NOW });
  const chances = [];
  for (let i = 0; i < 5; i++) { chances.push(B.seedChance(g)); B.planRun(g, rng(0.999)); }
  assert.deepEqual(chances.map((c) => Math.round(c * 100)), [30, 50, 70, 90, 100]);
  assert.ok(B.collect(g, 'run-a', 'sunflower', G.allocateId));
  assert.equal(g.luck.dry, 0);
});

test('no repeats until every rare kind has been found', () => {
  const g = garden();
  const kinds = [];
  for (let i = 0; i < B.RARE.length; i++) {
    const plan = B.planRun(g, rng(0, 0, 0.5, 0.5));
    kinds.push(plan.kind);
    assert.ok(B.collect(g, `run-${i}`, plan.kind, G.allocateId));
  }
  assert.deepEqual([...kinds].sort(), [...B.RARE].sort());
  assert.ok(B.RARE.includes(B.planRun(g, rng(0, 0, 0.5, 0.5)).kind));
  assert.equal(g.discoveries.filter((d) => d.type === 'seed-found').length, B.RARE.length);
});

test('a replayed seed bud after a reload is not collected twice', () => {
  const g = garden();
  assert.ok(B.collect(g, 'run-x', 'moonflower', G.allocateId));
  assert.equal(B.collect(g, 'run-x', 'moonflower', G.allocateId), null);
  assert.equal(g.seeds.length, 1);
  assert.equal(B.collect(g, 'run-y', 'not-a-plant', G.allocateId), null);
});

test('first flowering of a rare plant is recorded once', () => {
  const g = garden();
  g.seeds.push({ id: G.allocateId(g, 'seed'), kind: 'moonflower', growth: 0.6 });
  B.applyPlanting(g, B.planPlanting(g, g.patches[2].id, { seed: g.seeds[0].id }), G.allocateId);
  assert.equal(B.noteFlowering(g, G.allocateId).length, 1);
  assert.equal(B.noteFlowering(g, G.allocateId).length, 0);
});

test('dandelions can be blown once they have gone to seed, and re-form over turns', () => {
  const g = garden(), bed = plant(g, 0, 'daisy');
  assert.equal(B.puff(g, bed.id), false);
  bed.flower = 'dandelion'; bed.growth = 1;
  assert.ok(B.puff(g, bed.id));
  assert.equal(B.puff(g, bed.id), false);
  for (let i = 0; i < B.PUFF_TURNS; i++) B.tendTurn(g);
  assert.equal(bed.puffed, 0);
  assert.ok(B.puff(g, bed.id));
});

test('time of day: moonflowers open at night, sunflowers turn from morning to evening', () => {
  assert.deepEqual([5, 6, 12, 18, 19, 23].map(B.isNight), [true, false, false, false, true, true]);
  assert.ok(B.sunAngle(7) < 0 && B.sunAngle(18) > 0 && B.sunAngle(3) === -1);
});

test('a new garden has three empty beds, an empty seed tin and fresh seed pacing, and saves', () => {
  const disk = new Map();
  const st = { getItem: (k) => disk.get(k) ?? null, setItem: (k, v) => disk.set(k, v), removeItem: (k) => disk.delete(k) };
  const session = G.load(st, NOW), g = session.garden;
  L.initialize(g, G.allocateId);
  assert.equal(g.patches.length, 3);
  assert.ok(g.patches.every((p) => p.flower === null && p.growth === 0));
  assert.deepEqual([g.seeds, g.focus, g.luck], [[], null, { dry: 0, last: null }]);
  assert.ok(G.save(st, session));
  assert.deepEqual(G.load(st, NOW).garden, G.snapshot(g));
});

test('saves from a newer version are left untouched', () => {
  const disk = new Map([[G.KEY, JSON.stringify({ v: 5 })]]);
  const st = { getItem: (k) => disk.get(k) ?? null, setItem: () => { throw new Error('should not write'); }, removeItem: () => {} };
  const session = G.load(st, NOW);
  assert.equal(session.writable, false);
  assert.equal(session.issue, 'newer');
});
