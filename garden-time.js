/* Garden time: garden days and their tending budget, growth on its own, the real (northern)
   seasons, what flowers when, and the slowly fading character of how the garden is played.
   Pure; no canvas or browser globals. Times are epoch milliseconds read in local time. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomTime = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // A garden day runs from 4:00 to 4:00, so late-evening play counts toward the day it began in.
  const DAY_START_HOUR = 4;
  // The first turns of a garden day count fully; after that each turn counts a quarter. Play
  // grows the garden faster, but no single sitting can finish it (living-garden ticket 01).
  const BUDGET = Object.freeze({ fullTurns: 25, lateWeight: 0.25, plants: 25 });
  // Growth on its own, per garden day that passed (at most a week's worth at once).
  const OWN = Object.freeze({ maxDays: 7, bed: 0.03, plants: 2, growth: 0.05 });
  const CHARACTER_KEYS = Object.freeze(['blooms', 'misses', 'dew', 'bee', 'sun', 'morning', 'evening']);
  const CHARACTER_DECAY = 0.9;   // per garden day
  const finite = (n) => typeof n === 'number' && Number.isFinite(n);

  function dayIndex(t) {
    const d = new Date(t - DAY_START_HOUR * 3600000);
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function fresh(now) {
    return { time: { day: dayIndex(now), turns: 0, planted: 0, grown: dayIndex(now) },
      character: Object.fromEntries(CHARACTER_KEYS.map((k) => [k, 0])) };
  }
  // ----- How she plays, in flowers. Each way of playing well has a wild flower of its own, and
  // the more of it she does, the more of that flower comes up in her garden, so two players'
  // gardens grow apart. Kept as a count per style (`g.style`; older saves have none). -----
  const STYLE_FLOWERS = Object.freeze({
    trick: 'foxglove',     // trick shots off a mushroom
    chain: 'poppy',        // long chains of blooms in one launch
    stubborn: 'rose',      // stubborn buds coaxed open
    fullBloom: 'peony',    // full blooms of the big flower
    closeCall: 'sweetpea', // buds cleared right next to Erwu
    long: 'bluebell',      // long games
    dandelion: 'cornflower', // dandelion clocks
  });
  const STYLE_NAMES = Object.freeze({ trick: 'trick shots', chain: 'chains', stubborn: 'stubborn buds', fullBloom: 'full blooms',
    closeCall: 'close calls', long: 'long games', dandelion: 'dandelion clocks' });
  const validStyle = (s) => s === undefined || (!!s && typeof s === 'object' && Object.keys(s).every((k) => STYLE_FLOWERS[k] && finite(s[k]) && s[k] >= 0));
  function noteStyle(g, key, amount = 1) {
    if (!STYLE_FLOWERS[key]) return;
    g.style = g.style || {};
    g.style[key] = (g.style[key] || 0) + amount;
  }
  // The share of new wild flowers that follow her style: none at first, up to `max` once she has
  // a dozen or so moments of style behind her.
  const styleShare = (g, max = 0.45) => { const n = Object.values(g.style || {}).reduce((a, v) => a + v, 0); return Math.min(max, n / 25); };
  // A wild flower in her style, chosen in proportion to how often she plays each way (`r` in 0–1).
  function styleFlower(g, r) {
    const entries = Object.entries(g.style || {}).filter(([, v]) => v > 0), total = entries.reduce((a, [, v]) => a + v, 0);
    if (!total) return null;
    let x = r * total;
    for (const [k, v] of entries) { if ((x -= v) < 0) return STYLE_FLOWERS[k]; }
    return STYLE_FLOWERS[entries[entries.length - 1][0]];
  }
  // Her strongest style, for the garden to mention.
  function mainStyle(g) {
    const e = Object.entries(g.style || {}).sort((a, b) => b[1] - a[1])[0];
    return e && e[1] >= 3 ? { key: e[0], flower: STYLE_FLOWERS[e[0]], name: STYLE_NAMES[e[0]] } : null;
  }
  // ----- The turn of the seasons. The first time the garden opens in a new season, half of the
  // annual wild flowers have gone to seed and are gone, leaving room for what comes next; style
  // flowers and perennials stay. A garden too young to have filled in keeps everything.
  // `seasonSeen` is the season it last opened in; `flourished` the season it last filled. -----
  const ANNUALS = Object.freeze(['daisy', 'cosmos', 'forget', 'buttercup', 'clover', 'grass', 'wild']);
  const TURNOVER = Object.freeze({ share: 0.5, keepAtLeast: 40 });
  const validSeasonMark = (s) => s === undefined || SEASONS.includes(s);
  // Returns { season, from, removed: [plants] } when the season has turned, else null.
  function turnover(g, now, rnd = Math.random) {
    const season = seasonOfMonth(new Date(now).getMonth());
    if (g.seasonSeen === undefined) { g.seasonSeen = season; return null; }
    if (g.seasonSeen === season) return null;
    const from = g.seasonSeen;
    g.seasonSeen = season;
    const annuals = g.plants.filter((p) => ANNUALS.includes(p.k));
    const n = Math.min(Math.floor(annuals.length * TURNOVER.share), Math.max(0, g.plants.length - TURNOVER.keepAtLeast));
    const removed = annuals.map((p) => [rnd(), p]).sort((a, b) => a[0] - b[0]).slice(0, Math.max(0, n)).map(([, p]) => p);
    const gone = new Set(removed);
    g.plants = g.plants.filter((p) => !gone.has(p));
    return { season, from, removed };
  }
  // ----- Between days the wild flowers recede: annuals go to seed and grasses die back, most of
  // all along the lawn's inner edge, where it meets the play ring, so each new day has room to
  // grow into and play visibly fills it again (a day's play plants up to 25). 15% goes overnight,
  // a fifth more for each further day away (up to five), annuals first; never below `keepAtLeast` plants. The beds,
  // the rose bed and everything else in the garden are untouched. (Owner, 2026-10-07: after a
  // couple of days away the garden hadn't changed at all.) -----
  const RECEDE = Object.freeze({ firstDay: 0.15, perDay: 0.2, maxDays: 5, keepAtLeast: 40, nearPlay: 1.6, nearWeight: 4, keepWeight: 0.3 });
  const recedeShare = (days) => {
    let kept = 1;
    for (let d = 0; d < Math.min(days, RECEDE.maxDays); d++) kept *= 1 - (d === 0 ? RECEDE.firstDay : RECEDE.perDay);
    return 1 - kept;
  };
  // Removes and returns the plants that receded over `days` garden days.
  function recede(g, days, rnd = Math.random) {
    if (!(days > 0)) return [];
    const n = Math.min(Math.round(g.plants.length * recedeShare(days)), Math.max(0, g.plants.length - RECEDE.keepAtLeast));
    if (n <= 0) return [];
    // weighted draw without replacement (keys: rnd^(1/weight), largest first)
    const weight = (p) => (ANNUALS.includes(p.k) ? 1 : RECEDE.keepWeight) * (p.d < RECEDE.nearPlay ? RECEDE.nearWeight : 1);
    const removed = g.plants.map((p) => [Math.pow(rnd() || 1e-9, 1 / weight(p)), p]).sort((a, b) => b[0] - a[0]).slice(0, n).map(([, p]) => p);
    const gone = new Set(removed);
    g.plants = g.plants.filter((p) => !gone.has(p));
    return removed;
  }
  // How many garden days have passed since the garden was last opened (0 the same day).
  const daysAway = (g, now) => Math.max(0, Math.min(30, dayIndex(now) - g.time.day));
  // A garden that has filled again this season: true once, the first time it gets there.
  function flourish(g, now, full) {
    const season = seasonOfMonth(new Date(now).getMonth());
    if (!full || g.flourished === season) return false;
    g.flourished = season;
    return true;
  }
  function valid(g) {
    const t = g && g.time, c = g && g.character;
    if (g && (!validStyle(g.style) || !validSeasonMark(g.seasonSeen) || !validSeasonMark(g.flourished))) return false;
    return !!t && Number.isSafeInteger(t.day) && Number.isSafeInteger(t.grown) && Number.isSafeInteger(t.turns) && t.turns >= 0 &&
      Number.isSafeInteger(t.planted) && t.planted >= 0 && !!c && CHARACTER_KEYS.every((k) => finite(c[k]) && c[k] >= 0);
  }
  // Opening the garden. Starts a new day's budget when the garden day has changed, and returns
  // how many whole garden days of growth on its own are due (0–7). A clock moved backwards gives
  // nothing and moves nothing back, so no day's growth can ever be applied twice.
  function arrive(g, now) {
    const today = dayIndex(now), t = g.time;
    if (today !== t.day) {
      const passed = Math.max(0, Math.min(30, today - t.day));
      for (const k of CHARACTER_KEYS) g.character[k] *= Math.pow(CHARACTER_DECAY, passed);
      t.day = today; t.turns = 0; t.planted = 0;
    }
    const due = Math.max(0, Math.min(OWN.maxDays, today - t.grown));
    if (today > t.grown) t.grown = today;
    return due;
  }
  // How much the next turn counts toward growth.
  const turnWeight = (g) => (g.time.turns < BUDGET.fullTurns ? 1 : BUDGET.lateWeight);
  // Count a tended turn; returns the weight it earned.
  function tendTurn(g) {
    const w = turnWeight(g);
    g.time.turns++;
    return w;
  }
  // Whether play may add another wild plant today, and noting that it did.
  const mayPlant = (g) => g.time.planted < BUDGET.plants;
  function notePlanted(g) { g.time.planted++; }
  function note(g, key, amount = 1) { if (key in g.character) g.character[key] += amount; }

  // ----- Seasons (northern hemisphere, owner decision 2026-09-29) -----
  const SEASONS = Object.freeze(['winter', 'spring', 'summer', 'autumn']);
  const seasonOfMonth = (m) => SEASONS[Math.floor(((m + 1) % 12) / 3)];   // m: 0 = January
  const BLEND_DAYS = 7;
  // The season now, the next one, and how far (0–1) the last week has blended toward it.
  function season(t) {
    const d = new Date(t), m = d.getMonth(), name = seasonOfMonth(m);
    const next = SEASONS[(SEASONS.indexOf(name) + 1) % 4];
    // seasons change on the 1st of March, June, September and December
    const edgeMonth = [2, 5, 8, 11].find((x) => x > m) ?? 14;
    const edge = new Date(d.getFullYear(), edgeMonth, 1);
    const daysLeft = (edge - d) / 86400000;
    const blend = Math.max(0, Math.min(1, (BLEND_DAYS - daysLeft) / BLEND_DAYS));
    return { name, next, blend };
  }
  // When each kind flowers, by month (1 = January), inclusive. Outside it a plant shows leaves;
  // in winter flowering kinds rest out of sight. Grass, clover leaves, fern and mushrooms
  // don't flower and stay all year.
  const FLOWERING = Object.freeze({
    daisy: [5, 10], cosmos: [7, 10], lavender: [6, 9], forget: [4, 6], buttercup: [5, 7], clover: [5, 9],
    foxglove: [6, 7], bluebell: [4, 5], sweetpea: [6, 9], cornflower: [6, 9], rose: [6, 10], wild: [5, 9],
    tulip: [4, 5], peony: [5, 6], poppy: [6, 8],
  });
  const EVERGREEN = new Set(['grass', 'fern', 'mushroom']);
  const month = (t) => new Date(t).getMonth() + 1;
  function flowering(kind, t) {
    const w = FLOWERING[kind];
    if (!w) return false;
    const m = month(t);
    return m >= w[0] && m <= w[1];
  }
  // A plant's look this month: 'flower', 'leaves', or 'rest' (winter, out of sight).
  function plantPhase(kind, t) {
    if (EVERGREEN.has(kind)) return 'leaves';
    if (flowering(kind, t)) return 'flower';
    return seasonOfMonth(new Date(t).getMonth()) === 'winter' ? 'rest' : 'leaves';
  }
  // Beds flower from March to November and rest over winter; their growth never changes.
  const bedsFlowering = (t) => { const m = month(t); return m >= 3 && m <= 11; };
  // The time of day, by the local clock.
  function dayPart(t) {
    const h = new Date(t).getHours();
    return h >= 5 && h < 8 ? 'dawn' : h >= 8 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night';
  }

  return { ANNUALS, TURNOVER, turnover, flourish, RECEDE, recedeShare, recede, daysAway, STYLE_FLOWERS, STYLE_NAMES, noteStyle, styleShare, styleFlower, mainStyle, DAY_START_HOUR, BUDGET, OWN, CHARACTER_KEYS, SEASONS, FLOWERING, dayIndex, fresh, valid, arrive, turnWeight, tendTurn,
    mayPlant, notePlanted, note, season, seasonOfMonth, flowering, plantPhase, bedsFlowering, dayPart };
});
