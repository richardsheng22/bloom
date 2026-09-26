const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../garden-layout.js');
const G = require('../garden-state.js');

function garden() {
  const g = { v: 3, plants: [], patches: [], objects: [], discoveries: [], seeds: [], focus: null, luck: { dry: 0, last: null },
    nextIds: { plant: 1, patch: 1, object: 1, discovery: 1, seed: 1 } };
  assert.ok(L.initialize(g, G.allocateId));
  return g;
}
const where = (g) => Object.fromEntries(L.records(g).map((r) => [r.id, r.anchor]));

test('a new garden has three empty beds and its furnishings already out', () => {
  const g = garden();
  assert.equal(g.layoutVersion, L.VERSION);
  assert.deepEqual(g.patches.map((p) => [p.anchor, p.flower, p.growth]), [['bed-left', null, 0], ['bed-top', null, 0], ['bed-right', null, 0]]);
  assert.deepEqual(g.objects.map((o) => [o.kind, o.anchor]), [['cushion', 'nook-left'], ['stone', 'nook-right']]);
  assert.ok(L.valid(g));
});

test('version 1 layouts upgrade: beds gain an empty planting, unplaced furnishings go home only if free', () => {
  const v1 = { layoutVersion: 1, patches: [{ id: 'patch-1', kind: 'flower-patch', anchor: 'bed-left', growth: 0 }],
    objects: [{ id: 'object-1', kind: 'cushion', anchor: 'nook-right' }, { id: 'object-2', kind: 'stone', anchor: null }] };
  assert.ok(L.upgrade(v1));
  assert.equal(v1.layoutVersion, 2);
  assert.deepEqual(v1.patches[0], { id: 'patch-1', kind: 'flower-patch', anchor: 'bed-left', flower: null, growth: 0 });
  // The stone's home is taken by the cushion the player moved there, so it stays put away.
  assert.deepEqual(v1.objects.map((o) => o.anchor), ['nook-right', null]);
});

test('invalid layouts are rejected: wrong type at an anchor, duplicate anchors, bad growth', () => {
  const g = garden();
  assert.equal(L.valid({ ...g, objects: [{ ...g.objects[0], anchor: 'bed-left' }] }), false);
  assert.equal(L.valid({ ...g, objects: g.objects.map((o) => ({ ...o, anchor: 'nook-left' })) }), false);
  assert.equal(L.valid({ ...g, patches: [{ ...g.patches[0], growth: 2 }] }), false);
  assert.equal(L.valid({ ...g, layoutVersion: 9 }), false);
});

test('place, swap, put away and undo never lose or duplicate an item', () => {
  const g = garden(), start = where(g);
  const [cushion, stone] = g.objects;
  const swap = L.plan(g, cushion.id, 'nook-right');
  assert.equal(swap.action, 'swap');
  assert.ok(L.apply(g, swap));
  assert.deepEqual([cushion.anchor, stone.anchor], ['nook-right', 'nook-left']);
  const away = L.plan(g, stone.id, null);
  assert.equal(away.action, 'remove');
  assert.ok(L.apply(g, away));
  assert.equal(stone.anchor, null);
  assert.equal(L.records(g).length, 5);
  assert.ok(L.apply(g, L.reverse(away)));
  assert.ok(L.apply(g, L.reverse(swap)));
  assert.deepEqual(where(g), start);
});

test('a stale plan is refused, and a preview never changes the garden', () => {
  const g = garden(), [cushion] = g.objects;
  const move = L.plan(g, cushion.id, null);
  const seen = L.preview(g, move);
  assert.equal(L.find(seen, cushion.id).anchor, null);
  assert.equal(cushion.anchor, 'nook-left');
  assert.ok(L.apply(g, move));
  assert.equal(L.apply(g, move), false);
  assert.equal(L.plan(g, cushion.id, 'bed-top'), null);
});

test('beds move with their plantings, and everything is named by place', () => {
  const g = garden(), [left, top] = g.patches;
  left.flower = 'lavender'; left.growth = 0.6;
  assert.ok(L.apply(g, L.plan(g, left.id, 'bed-top')));
  assert.deepEqual([left.anchor, left.flower, left.growth, top.anchor], ['bed-top', 'lavender', 0.6, 'bed-left']);
  assert.equal(L.label(g, left), 'The high bed');
  assert.equal(L.label(g, g.objects[1]), 'Sunny stone');
  assert.match(L.describe(g, L.plan(g, g.objects[0].id, null)), /cushion goes back to your collection/);
});

test('the scenery, beds and furnishings keep clear of each other at every phone size', () => {
  const V = require('../garden-view.js');
  for (const [w, h] of [[288, 250], [343, 330], [358, 400], [398, 470], [536, 270]]) {
    const scene = V.layout({ left: 0, top: 0, width: w, height: h });
    const m = L.landmarks(scene), slots = L.geometry(scene);
    for (const a of slots) {
      for (const [name, f] of [['fountain', m.fountain], ['deadwood', m.deadwood]]) {
        const overlap = Math.abs(a.x - f.x) < a.width / 2 + f.width / 2 && a.y + a.height / 2 > f.y - f.height && a.y - a.height / 2 < f.y;
        assert.ok(!overlap, `${name} clear of ${a.id} at ${w}x${h}`);
      }
      // beds and furnishings sit outside the rose bed and off the path
      const r = m.roses, e = ((a.x - r.x) / (r.rx + a.width / 2)) ** 2 + ((a.y - r.y) / (r.ry + a.height / 2)) ** 2;
      assert.ok(e > 1 || a.id === 'bed-top', `${a.id} outside the rose bed at ${w}x${h}`);
      assert.ok(Math.abs(a.x) - a.width / 2 > m.path.width / 2 || a.y < m.path.top, `${a.id} off the path at ${w}x${h}`);
      assert.ok(Math.abs(a.x) + a.width / 2 <= w / 2 + 4, `${a.id} on screen at ${w}x${h}`);
    }
    // wild plants always land somewhere on the lawn, never on scenery
    for (let i = 0; i < 60; i++) {
      const q = L.projectPlant({ a: i * 0.7, d: 1.05 + (i % 7) * 0.22 }, scene);
      assert.ok(Math.abs(q.x) <= w / 2 && Math.abs(q.y) <= h / 2, `plant ${i} on screen at ${w}x${h}`);
    }
  }
});
