const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('../garden-time.js');
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const garden = (now) => ({ ...T.fresh(now) });

test('a garden day runs from 4:00 to 4:00 local time', () => {
  assert.equal(T.dayIndex(at(2026, 9, 29, 23, 59)), T.dayIndex(at(2026, 9, 30, 3, 59)));
  assert.equal(T.dayIndex(at(2026, 9, 30, 4, 0)), T.dayIndex(at(2026, 9, 29, 12)) + 1);
});
test('the first 25 turns of a day count fully, later ones a quarter, and a new day starts afresh', () => {
  const now = at(2026, 9, 29, 10), g = garden(now);
  const weights = Array.from({ length: 30 }, () => T.tendTurn(g));
  assert.deepEqual(weights.slice(0, 25), Array(25).fill(1));
  assert.deepEqual(weights.slice(25), Array(5).fill(T.BUDGET.lateWeight));
  T.arrive(g, at(2026, 9, 29, 22));
  assert.equal(T.turnWeight(g), T.BUDGET.lateWeight, 'the same garden day keeps its budget');
  T.arrive(g, at(2026, 9, 30, 9));
  assert.equal(T.turnWeight(g), 1);
  assert.equal(g.time.turns, 0);
});
test('play adds at most a few wild plants a day', () => {
  const now = at(2026, 9, 29, 10), g = garden(now);
  let n = 0;
  while (T.mayPlant(g)) { T.notePlanted(g); n++; }
  assert.equal(n, T.BUDGET.plants);
  T.arrive(g, at(2026, 9, 30, 10));
  assert.ok(T.mayPlant(g));
});
test('growth on its own: one day per garden day passed, at most a week, never twice', () => {
  const g = garden(at(2026, 9, 1, 10));
  assert.equal(T.arrive(g, at(2026, 9, 1, 20)), 0);
  assert.equal(T.arrive(g, at(2026, 9, 3, 9)), 2);
  assert.equal(T.arrive(g, at(2026, 9, 3, 18)), 0, 'reopening the same day gives nothing more');
  assert.equal(T.arrive(g, at(2026, 10, 3, 9)), T.OWN.maxDays, 'a month away gives at most a week');
});
test('a clock moved backwards gives nothing, and moving it forward again gives nothing twice', () => {
  const g = garden(at(2026, 9, 10, 10));
  assert.equal(T.arrive(g, at(2026, 9, 12, 10)), 2);
  assert.equal(T.arrive(g, at(2026, 9, 5, 10)), 0);
  assert.equal(T.arrive(g, at(2026, 9, 12, 11)), 0);
  assert.equal(T.arrive(g, at(2026, 9, 13, 11)), 1);
});
test('the character of play fades by a tenth each garden day', () => {
  const g = garden(at(2026, 9, 1, 10));
  T.note(g, 'dew', 10);
  T.note(g, 'dragons', 5);
  assert.equal(g.character.dragons, undefined);
  T.arrive(g, at(2026, 9, 3, 10));
  assert.ok(Math.abs(g.character.dew - 10 * 0.81) < 1e-9);
  assert.ok(T.valid(g));
});
test('northern seasons change on the 1st of March, June, September and December', () => {
  const name = (y, m, d) => T.season(at(y, m, d)).name;
  assert.deepEqual([name(2026, 1, 15), name(2026, 3, 1), name(2026, 6, 1), name(2026, 9, 29), name(2026, 12, 1), name(2027, 2, 28)],
    ['winter', 'spring', 'summer', 'autumn', 'winter', 'winter']);
  assert.equal(T.season(at(2026, 11, 15)).blend, 0);
  assert.ok(T.season(at(2026, 11, 28)).blend > 0.4, 'the last week blends toward winter');
  assert.equal(T.season(at(2026, 11, 28)).next, 'winter');
  assert.ok(T.season(at(2027, 2, 27)).blend > 0.5, 'winter blends toward spring across the new year');
});
test('what flowers when: flowers, then leaves, then rest over winter; beds rest over winter', () => {
  assert.equal(T.plantPhase('cosmos', at(2026, 9, 29)), 'flower');
  assert.equal(T.plantPhase('bluebell', at(2026, 9, 29)), 'leaves');
  assert.equal(T.plantPhase('bluebell', at(2026, 4, 20)), 'flower');
  assert.equal(T.plantPhase('daisy', at(2026, 1, 10)), 'rest');
  assert.equal(T.plantPhase('grass', at(2026, 1, 10)), 'leaves');
  assert.equal(T.plantPhase('fern', at(2026, 7, 10)), 'leaves');
  assert.deepEqual([1, 3, 7, 11, 12].map((m) => T.bedsFlowering(at(2026, m, 10))), [false, true, true, true, false]);
});
test('times of day follow the local clock', () => {
  assert.deepEqual([6, 12, 18, 23, 2].map((h) => T.dayPart(at(2026, 9, 29, h))), ['dawn', 'day', 'dusk', 'night', 'night']);
});

test('her way of playing grows its own wild flowers; older saves have no style and stay valid', () => {
  const G = require('../garden-state.js');
  const g = G.fresh(Date.UTC(2026, 9, 1), 3); delete g.fresh;
  assert.ok(G.valid(G.snapshot(g)));
  assert.equal(T.styleFlower(g, 0.5), null);
  assert.equal(T.styleShare(g), 0);
  for (let i = 0; i < 9; i++) T.noteStyle(g, 'trick');
  T.noteStyle(g, 'chain');
  assert.equal(T.styleFlower(g, 0.1), 'foxglove');
  assert.equal(T.styleFlower(g, 0.95), 'poppy');
  assert.ok(T.styleShare(g) > 0.3 && T.styleShare(g) <= 0.45);
  assert.equal(T.mainStyle(g).flower, 'foxglove');
  for (const f of Object.values(T.STYLE_FLOWERS)) assert.ok(G.KINDS ? G.KINDS.has(f) : true, f);
  const snap = G.snapshot(g);
  assert.deepEqual(snap.style, { trick: 9, chain: 1 });
  assert.ok(G.valid(snap));
  assert.ok(!G.valid({ ...snap, style: { trick: -1 } }), 'a broken style is rejected');
  T.noteStyle(g, 'nonsense'); assert.equal(g.style.nonsense, undefined);
});
