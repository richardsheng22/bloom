const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../garden-sound.js');

test('silent when sound is off or the game is hidden', () => {
  for (const o of [{ on: false }, { hidden: true }]) {
    const m = S.mix({ season: 'summer', part: 'day', view: 'garden', ...o });
    assert.ok(['breeze', 'crickets', 'drops', 'dropRate', 'gust'].every((k) => m[k] === 0));
  }
});
test('the fountain is only an occasional droplet, and still in winter, when it is iced over', () => {
  const s = S.mix({ season: 'summer', part: 'day', view: 'garden' });
  assert.ok(s.drops > 0 && s.dropRate > 0 && s.dropRate <= 1, 'a droplet now and then, not a steady stream');
  assert.equal(s.fountain, undefined, 'no steady fountain hiss');
  assert.ok(S.mix({ season: 'summer', part: 'day', view: 'run' }).dropRate < s.dropRate, 'fewer during a run');
  const w = S.mix({ season: 'winter', part: 'day', view: 'garden' });
  assert.equal(w.drops, 0); assert.ok(w.breeze > 0);
});
test('crickets on summer evenings and nights, fewer in autumn, none by day or in spring', () => {
  const c = (season, part) => S.mix({ season, part, view: 'garden' }).crickets;
  assert.ok(c('summer', 'night') > c('autumn', 'night'));
  assert.ok(c('autumn', 'dusk') > 0);
  assert.equal(c('summer', 'day'), 0); assert.equal(c('spring', 'night'), 0);
});
test('a run plays the garden more quietly, and nothing is ever louder than the notes', () => {
  const g = S.mix({ season: 'summer', part: 'night', view: 'garden' }), r = S.mix({ season: 'summer', part: 'night', view: 'run' });
  for (const k of ['breeze', 'crickets', 'drops']) { assert.ok(r[k] < g[k]); assert.ok(g[k] < 0.03); }
});
test('the breeze comes in occasional gusts with quiet between, rarer during a run', () => {
  const g = S.mix({ season: 'autumn', part: 'day', view: 'garden' }), r = S.mix({ season: 'autumn', part: 'day', view: 'run' });
  assert.ok(g.every[0] > g.lasts[1], 'more quiet than gust in the garden');
  assert.ok(r.every[0] > g.every[1], 'a run waits longer between gusts than the garden');
  assert.ok(r.breeze < g.breeze * S.RUN, 'and its gusts are softer than the rest of the run mix');
});
