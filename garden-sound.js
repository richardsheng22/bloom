/* The garden's soundscape (living-garden ticket 11): what plays, and how loudly, for the season,
   the time of day and the view. Pure; the sounds themselves are synthesised in index.html, so
   no recordings are needed. Levels are gains under the game's notes (which peak near 0.06). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomSound = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // At full level in the garden; a run plays the same garden more quietly beneath the notes.
  // The fountain is heard only as a droplet now and then: a steady band of hiss, pulsing to
  // sound like bubbling, read as a constant shuffle (owner feedback, 2026-09-30), so it's gone.
  const LEVEL = Object.freeze({ breeze: 0.009, crickets: 0.0045, drops: 0.006 });
  // droplets a second, in the garden and during a run
  const DROPS = Object.freeze({ garden: 0.5, run: 0.25 });
  const RUN = 0.4;
  // The breeze isn't a constant rustle: it comes as an occasional gust through the grass, with
  // quiet between (seconds between one gust and the next, and how long one lasts). During a run
  // gusts are rarer and softer still, so they never sit under the play.
  const GUSTS = Object.freeze({ garden: { every: [14, 30], lasts: [3, 6] }, run: { every: [35, 70], lasts: [2.5, 4.5], level: 0.5 } });
  // `season`: spring|summer|autumn|winter; `part`: dawn|day|dusk|night (BloomTime.dayPart);
  // `view`: garden|run. Returns layer gains, drop rate (per second), how strong a gust gets, and
  // the gusts' spacing and length.
  function mix({ season, part, view, on = true, hidden = false }) {
    const off = { breeze: 0, crickets: 0, drops: 0, dropRate: 0, gust: 0, every: GUSTS.garden.every, lasts: GUSTS.garden.lasts };
    if (!on || hidden) return off;
    const k = view === 'run' ? RUN : 1, gusts = view === 'run' ? GUSTS.run : GUSTS.garden;
    const frozen = season === 'winter';                  // the winter fountain stands still, iced over
    const night = part === 'night' || part === 'dusk';
    const breeze = { spring: 0.7, summer: 0.5, autumn: 0.9, winter: 1 }[season] ?? 0.6;
    const crickets = season === 'summer' && night ? 1 : season === 'autumn' && night ? 0.45 : 0;
    return {
      breeze: LEVEL.breeze * k * (gusts.level || 1) * breeze * (night && !frozen ? 0.7 : 1),
      crickets: LEVEL.crickets * k * crickets,
      drops: frozen ? 0 : LEVEL.drops * k,
      dropRate: frozen ? 0 : view === 'run' ? DROPS.run : DROPS.garden,
      // autumn and winter air comes in gusts; spring and summer air barely moves
      gust: { spring: 0.35, summer: 0.25, autumn: 0.7, winter: 0.8 }[season] ?? 0.4,
      every: gusts.every, lasts: gusts.lasts,
    };
  }
  return { LEVEL, RUN, GUSTS, DROPS, mix };
});
