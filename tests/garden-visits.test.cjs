const { test } = require('node:test');
const assert = require('node:assert/strict');
const V = require('../garden-visits.js');
const T = require('../garden-time.js');
const HOUR = 3600000, DAY = 24 * HOUR;
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
const allocate = (g, domain) => `${domain}-${g.nextIds[domain]++}`;
function garden(seed = 7) { return { discoveries: [], nextIds: { discovery: 1 }, ...V.fresh(seed) }; }
// A garden with everything any visitor might need.
const lush = { has: () => true, character: { dew: 0, bee: 0 } };
const bare = { has: () => false, character: {} };

test('a new garden gets nothing on its first opening, and nothing again within two hours', () => {
  const g = garden();
  assert.equal(V.arrive(g, at(2026, 9, 29, 9), lush, allocate), null);
  assert.equal(V.arrive(g, at(2026, 9, 29, 10), lush, allocate), null);
  assert.ok(V.valid(g));
});
test('the same absence always gives the same result, and a reload never repeats it', () => {
  const run = () => { const g = garden(42); V.arrive(g, at(2026, 9, 20, 9), lush, allocate); const out = V.arrive(g, at(2026, 9, 21, 19), lush, allocate); return { g, out }; };
  const a = run(), b = run();
  assert.deepEqual(a.out, b.out);
  assert.deepEqual(a.g, b.g);
  const seen = structuredClone(a.g.visits.seen), found = a.g.discoveries.length;
  assert.equal(V.arrive(a.g, at(2026, 9, 21, 19) + 1000, lush, allocate), null);
  assert.deepEqual(a.g.visits.seen, seen);
  assert.equal(a.g.discoveries.length, found);
});
test('at most two days of absence are stepped through, and first visits are recorded once', () => {
  const g = garden(3);
  V.arrive(g, at(2026, 7, 1, 9), lush, allocate);
  V.arrive(g, at(2026, 7, 20, 9), lush, allocate);
  const visits = Object.values(g.visits.seen).reduce((a, b) => a + b, 0);
  assert.ok(visits > 0 && visits <= 16 * Object.keys(V.CAST).length);
  const firsts = g.discoveries.filter((d) => d.type === 'visit-first').map((d) => d.kind);
  assert.equal(new Set(firsts).size, firsts.length);
  assert.deepEqual(firsts.sort(), Object.keys(g.visits.seen).sort());
});
test('visitors keep to their seasons, times of day and needs', () => {
  const Js = V.CAST;
  assert.equal(V.eligible(Js.cardinal, at(2026, 7, 10, 10), lush), false);
  assert.equal(V.eligible(Js.cardinal, at(2026, 1, 10, 10), lush), true);
  assert.equal(V.eligible(Js.frog, at(2026, 1, 10, 10), lush), false);
  assert.equal(V.eligible(Js.fox, at(2026, 7, 10, 12), lush), false);
  assert.equal(V.eligible(Js.fox, at(2026, 7, 10, 18), lush), true);
  assert.equal(V.eligible(Js.bumblebee, at(2026, 7, 10, 12), bare), false);
  assert.equal(V.eligible(Js.cottontail, at(2026, 1, 10, 6), bare), true, 'tracks in winter snow need no clover');
  assert.equal(V.eligible(Js.lunamoth, at(2026, 6, 10, 23), lush), true);
});
test('each rare visitor comes roughly every two to three weeks, never twice within 14 days', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const g = garden(seed);
    let t = at(2026, 6, 1, 21);
    V.arrive(g, t, lush, allocate);
    const seen = {};
    for (let day = 0; day < 365; day++) {
      t += DAY;
      const before = { ...g.visits.seen };
      V.arrive(g, t, lush, allocate);
      for (const k of ['fox', 'hummingbird', 'lunamoth']) if ((g.visits.seen[k] || 0) > (before[k] || 0)) (seen[k] = seen[k] || []).push(day);
    }
    const gaps = seen.fox.slice(1).map((d, i) => d - seen.fox[i]);
    assert.ok(gaps.every((d) => d >= 14), `fox gaps ${gaps}`);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    assert.ok(mean >= 14 && mean <= 22, `mean fox gap ${mean}`);
    assert.ok(seen.hummingbird && seen.lunamoth, 'the summer rarities come in their season');
  }
});
test('most openings after a day away have something new, and traces fade', () => {
  const g = garden(11);
  let t = at(2026, 5, 1, 8), news = 0, gifts = 0;
  V.arrive(g, t, lush, allocate);
  for (let day = 0; day < 60; day++) {
    t += DAY;
    const out = V.arrive(g, t, lush, allocate);
    if (out) news++;
    if (out && out.gift) gifts++;
    assert.ok(g.visits.traces.length <= 2);
    assert.ok(g.visits.traces.every((x) => x.until > t));
  }
  assert.ok(news >= 42, `${news} of 60 openings had something new`);
  assert.ok(gifts >= 10 && gifts <= 32, `${gifts} presents in 60 days`);
  assert.ok(V.valid(g));
});
test('Erwu\'s presents follow the season', () => {
  for (const [season, items] of Object.entries(V.GIFTS)) assert.ok(items.length && T.SEASONS.includes(season));
});

test("Erwu's present goes onto her shelf when picked up; old saves have an empty shelf", () => {
  const G = require('../garden-state.js');
  const g = G.fresh(Date.UTC(2026, 9, 1), 5);
  delete g.fresh;
  assert.ok(V.valid(g), 'a garden without a shelf is valid');
  assert.equal(V.pickUp(g), null, 'nothing to pick up');
  for (const items of Object.values(V.GIFTS)) for (const item of items) assert.ok(V.KEEPSAKES[item], `${item} has a name`);
  g.visits.gift = { item: 'acorn', until: Date.UTC(2026, 9, 5) };
  assert.equal(V.pickUp(g), 'acorn');
  assert.equal(g.visits.gift, null);
  g.visits.gift = { item: 'acorn', until: Date.UTC(2026, 9, 9) };
  V.pickUp(g);
  assert.deepEqual(g.visits.shelf, { acorn: 2 });
  assert.equal(V.shelfCount(g), 2);
  assert.ok(V.valid(g) && G.valid(G.snapshot(g)), 'a shelf saves and reads back');
  g.visits.shelf = { acorn: 0 };
  assert.ok(!V.valid(g), 'a broken shelf is rejected');
});

test("a visitor's trace that is a keepsake (a feather) can be picked up for the shelf; tracks can't", () => {
  const G = require('../garden-state.js');
  const g = G.fresh(Date.UTC(2026, 9, 1), 5); delete g.fresh;
  g.visits.traces = [{ kind: 'fox', trace: 'fox-tracks', until: 9e15 }, { kind: 'bluejay', trace: 'feather', until: 9e15 }];
  assert.equal(V.pickUpTrace(g, 0), null, 'tracks stay where they are');
  assert.equal(V.pickUpTrace(g, 1), 'feather');
  assert.deepEqual(g.visits.shelf, { feather: 1 });
  assert.equal(g.visits.traces.length, 1);
  assert.ok(V.valid(g));
});
