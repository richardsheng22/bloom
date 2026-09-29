const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../garden-sound.js');

test('silent when sound is off or the game is hidden', () => {
  for (const o of [{ on: false }, { hidden: true }]) {
    const m = S.mix({ season: 'summer', part: 'day', view: 'garden', ...o });
    assert.ok(Object.values(m).every((v) => v === 0));
  }
});
test('the fountain trickles except in winter, when it is iced over', () => {
  assert.ok(S.mix({ season: 'summer', part: 'day', view: 'garden' }).fountain > 0);
  const w = S.mix({ season: 'winter', part: 'day', view: 'garden' });
  assert.equal(w.fountain, 0); assert.equal(w.drops, 0); assert.ok(w.breeze > 0);
});
test('crickets on summer evenings and nights, fewer in autumn, none by day or in spring', () => {
  const c = (season, part) => S.mix({ season, part, view: 'garden' }).crickets;
  assert.ok(c('summer', 'night') > c('autumn', 'night'));
  assert.ok(c('autumn', 'dusk') > 0);
  assert.equal(c('summer', 'day'), 0); assert.equal(c('spring', 'night'), 0);
});
test('a run plays the garden more quietly, and nothing is ever louder than the notes', () => {
  const g = S.mix({ season: 'summer', part: 'night', view: 'garden' }), r = S.mix({ season: 'summer', part: 'night', view: 'run' });
  for (const k of ['fountain', 'breeze', 'crickets', 'drops']) { assert.ok(r[k] < g[k]); assert.ok(g[k] < 0.03); }
});
