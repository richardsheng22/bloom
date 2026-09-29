/* The garden's soundscape (living-garden ticket 11): what plays, and how loudly, for the season,
   the time of day and the view. Pure; the sounds themselves are synthesised in index.html, so
   no recordings are needed. Levels are gains under the game's notes (which peak near 0.06). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomSound = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // At full level in the garden; a run plays the same garden more quietly beneath the notes.
  const LEVEL = Object.freeze({ fountain: 0.014, breeze: 0.011, crickets: 0.0045, drops: 0.006 });
  const RUN = 0.4;
  // `season`: spring|summer|autumn|winter; `part`: dawn|day|dusk|night (BloomTime.dayPart);
  // `view`: garden|run. Returns layer gains, drop rate (per second) and how gusty the breeze is.
  function mix({ season, part, view, on = true, hidden = false }) {
    const off = { fountain: 0, breeze: 0, crickets: 0, drops: 0, dropRate: 0, gust: 0 };
    if (!on || hidden) return off;
    const k = view === 'run' ? RUN : 1;
    const frozen = season === 'winter';                  // the winter fountain stands still, iced over
    const night = part === 'night' || part === 'dusk';
    const breeze = { spring: 0.7, summer: 0.5, autumn: 0.9, winter: 1 }[season] ?? 0.6;
    const crickets = season === 'summer' && night ? 1 : season === 'autumn' && night ? 0.45 : 0;
    return {
      fountain: frozen ? 0 : LEVEL.fountain * k * (night ? 0.8 : 1),
      breeze: LEVEL.breeze * k * breeze * (night && !frozen ? 0.7 : 1),
      crickets: LEVEL.crickets * k * crickets,
      drops: frozen ? 0 : LEVEL.drops * k,
      dropRate: frozen ? 0 : 2.5,
      // autumn and winter air comes in gusts; spring and summer air barely moves
      gust: { spring: 0.35, summer: 0.25, autumn: 0.7, winter: 0.8 }[season] ?? 0.4,
    };
  }
  return { LEVEL, RUN, mix };
});
