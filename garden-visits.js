/* While you were away: visitors, the traces they leave, and Erwu's presents (living-garden
   tickets 05 and 06). The time since the garden was last opened is stepped through in
   three-hour slots, at most two days' worth, and every roll is seeded from the garden and the
   slot, so a reload can never reroll or duplicate anything. Pure; no canvas or browser globals. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./garden-time.js'));
  else root.BloomVisits = factory(root.BloomTime);
})(typeof globalThis === 'object' ? globalThis : this, function (Time) {
  'use strict';
  const HOUR = 3600000, DAY = 24 * HOUR, SLOT = 3 * HOUR;
  const MIN_AWAY = 2 * HOUR, MAX_AWAY = 2 * DAY;
  // Chance per matching slot, by class. Rare visitors come roughly every two to three weeks each
  // (owner decision 2026-09-29): none for 14 days after a visit, then likelier each day.
  const RATE = Object.freeze({ common: 0.22, occasional: 0.07 });
  const RARE = Object.freeze({ rest: 14 * DAY, base: 0.12, perDay: 0.14 });
  const PRESENT = 0.6;              // how often someone is still there when she opens the garden
  const TRACE_DAYS = 1.5;           // how long a trace stays
  const GIFT_EVERY = 3 * DAY;       // Erwu leaves a present about once every three days away
  const MAX_TRACES = 2;

  // The cast (ticket 06). Months are 1–12 and may wrap (December–February); parts are times of
  // day from BloomTime.dayPart; `needs` asks the garden world; `boost` names a character count.
  const CAST = Object.freeze({
    bluejay: { cls: 'common', parts: ['dawn', 'day'], place: 'fountain', trace: 'feather', name: 'A blue jay' },
    cottontail: { cls: 'occasional', parts: ['dawn', 'dusk'], place: 'beds', needs: (w, t) => Time.seasonOfMonth(new Date(t).getMonth()) === 'winter' || w.has('clover'),
      trace: (t) => Time.seasonOfMonth(new Date(t).getMonth()) === 'winter' ? 'rabbit-tracks' : 'nibbled-clover', name: 'A cottontail' },
    bumblebee: { cls: 'common', months: [5, 9], parts: ['day'], place: 'bed', needs: (w) => w.has('lavender') || w.has('cosmos') || w.has('clover'), boost: 'bee', name: 'A bumblebee' },
    chipmunk: { cls: 'occasional', months: [4, 10], parts: ['day'], place: 'log', trace: 'acorn-shells', name: 'A chipmunk' },
    squirrel: { cls: 'common', parts: ['day'], place: 'log', trace: (t) => Time.seasonOfMonth(new Date(t).getMonth()) === 'autumn' ? 'dug-earth' : null, name: 'A squirrel' },
    goldfinch: { cls: 'occasional', months: [7, 10], parts: ['day'], place: 'seedheads', needs: (w) => w.has('sunflower') || w.has('dandelion') || w.has('cornflower'), name: 'A goldfinch' },
    frog: { cls: 'occasional', months: [6, 8], parts: ['day', 'dusk'], place: 'fountain', trace: 'splash', boost: 'dew', name: 'A little frog' },
    cardinal: { cls: 'occasional', months: [12, 2], parts: ['dawn', 'day'], place: 'roses', trace: 'seed-husks', name: 'A cardinal' },
    junco: { cls: 'common', months: [11, 3], parts: ['day'], place: 'lawn', trace: 'bird-tracks', name: 'A junco' },
    hummingbird: { cls: 'rare', months: [6, 8], parts: ['day'], place: 'flowers', needs: (w) => w.has('foxglove') || w.has('sweetpea'), name: 'A hummingbird' },
    lunamoth: { cls: 'rare', months: [5, 7], parts: ['night'], place: 'fountain', name: 'A luna moth' },
    fox: { cls: 'rare', parts: ['dusk'], place: 'lawn-edge', trace: 'fox-tracks', name: 'A fox' },
  });
  // Erwu's keepsakes: every present she can bring, with its name. Tapping one in the garden puts
  // it on her shelf (`visits.shelf`, a count per kind; older saves have none and read as empty).
  const KEEPSAKES = Object.freeze({
    feather: 'A blue jay feather', pebble: 'A smooth pebble', 'daisy-head': 'A daisy', 'cosmos-head': 'A cosmos flower',
    'maple-leaf': 'A maple leaf', 'oak-leaf': 'An oak leaf', acorn: 'An acorn', 'pine-cone': 'A pine cone',
  });
  // Erwu's presents by season.
  const GIFTS = Object.freeze({
    spring: ['daisy-head', 'feather', 'pebble'], summer: ['cosmos-head', 'feather', 'pebble'],
    autumn: ['maple-leaf', 'oak-leaf', 'acorn', 'feather'], winter: ['pine-cone', 'pebble', 'feather'],
  });

  // A small, stable hash-based random source: the same inputs always give the same number.
  function roll(seed, a, b) {
    let h = (seed ^ 0x9e3779b9) >>> 0;
    for (const s of [String(a), String(b)]) for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 0x5bd1e995); h ^= h >>> 13; }
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h ^= h >>> 12;
    return (h >>> 0) / 4294967296;
  }
  const inMonths = (m, w) => (w[0] <= w[1] ? m >= w[0] && m <= w[1] : m >= w[0] || m <= w[1]);
  function eligible(c, t, world) {
    if (c.months && !inMonths(new Date(t).getMonth() + 1, c.months)) return false;
    if (!c.parts.includes(Time.dayPart(t))) return false;
    return !c.needs || c.needs(world, t);
  }
  function chance(kind, t, v, world) {
    const c = CAST[kind];
    if (c.cls === 'rare') {
      const since = t - (v.next[kind] ?? -Infinity);
      if (since < 0) return 0;
      return Math.min(0.95, RARE.base + RARE.perDay * Math.min(30, since / DAY));
    }
    const boost = c.boost ? Math.min(2, 1 + (world.character?.[c.boost] || 0) / 10) : 1;
    return RATE[c.cls] * boost;
  }
  const traceOf = (c, t) => (typeof c.trace === 'function' ? c.trace(t) : c.trace || null);

  function fresh(seed) { return { visits: { seed: seed >>> 0, checked: null, next: {}, seen: {}, traces: [], gift: null, present: null } }; }
  function valid(g) {
    const v = g && g.visits;
    const finiteOrNull = (n) => n === null || (typeof n === 'number' && Number.isFinite(n));
    return !!v && Number.isSafeInteger(v.seed) && finiteOrNull(v.checked) && v.next && typeof v.next === 'object' && v.seen && typeof v.seen === 'object' &&
      Object.keys(v.next).every((k) => CAST[k] && Number.isFinite(v.next[k])) && Object.keys(v.seen).every((k) => CAST[k] && Number.isSafeInteger(v.seen[k])) &&
      Array.isArray(v.traces) && v.traces.every((x) => x && CAST[x.kind] && typeof x.trace === 'string' && Number.isFinite(x.until)) &&
      (v.gift === null || (typeof v.gift.item === 'string' && Number.isFinite(v.gift.until))) &&
      (v.present === null || (CAST[v.present.kind] && Number.isFinite(v.present.until))) &&
      (v.shelf === undefined || (!!v.shelf && typeof v.shelf === 'object' && Object.keys(v.shelf).every((k) => KEEPSAKES[k] && Number.isSafeInteger(v.shelf[k]) && v.shelf[k] > 0)));
  }
  // Picking up Erwu's present: it goes onto her shelf. Returns the keepsake's kind, or null.
  function pickUp(g) {
    const v = g.visits, gift = v.gift;
    if (!gift || !KEEPSAKES[gift.item]) return null;
    v.shelf = v.shelf || {};
    v.shelf[gift.item] = (v.shelf[gift.item] || 0) + 1;
    v.gift = null;
    return gift.item;
  }
  // A visitor's trace that is a keepsake too (a blue jay's feather): tapped, it goes onto the
  // shelf as well, and the trace is gone. Returns the keepsake's kind, or null.
  function pickUpTrace(g, index) {
    const v = g.visits, x = v.traces[index];
    if (!x || !KEEPSAKES[x.trace]) return null;
    v.shelf = v.shelf || {};
    v.shelf[x.trace] = (v.shelf[x.trace] || 0) + 1;
    v.traces.splice(index, 1);
    return x.trace;
  }
  const shelfCount = (g) => Object.values((g.visits && g.visits.shelf) || {}).reduce((a, n) => a + n, 0);
  function note(v, kind, t, first, allocate, g) {
    v.seen[kind] = (v.seen[kind] || 0) + 1;
    if (CAST[kind].cls === 'rare') v.next[kind] = t + RARE.rest;
    if (first && allocate) g.discoveries.push({ id: allocate(g, 'discovery'), type: 'visit-first', kind, at: t });
  }
  // Opening the garden. `world` answers `has(kind)` for kinds flowering in the garden (plants or
  // beds) and carries the garden's `character`. Returns what's new, or null if it's too soon.
  function arrive(g, now, world, allocate) {
    const v = g.visits;
    v.traces = v.traces.filter((x) => x.until > now);
    if (v.gift && v.gift.until <= now) v.gift = null;
    if (v.present && v.present.until <= now) v.present = null;
    if (v.checked === null) {
      // a new garden: nothing yet, and no rare visitor in its first week
      v.checked = now;
      for (const k of Object.keys(CAST)) if (CAST[k].cls === 'rare') v.next[k] = now + RARE.rest / 2;
      return null;
    }
    if (now - v.checked < MIN_AWAY) { if (now < v.checked) v.checked = now; return null; }
    const from = Math.max(v.checked, now - MAX_AWAY), away = now - v.checked;
    const out = { present: null, traces: [], gift: null, firsts: [] };
    const visits = [];
    // earlier slots: visits that left traces
    for (let s = Math.floor(from / SLOT) + 1; s < Math.floor(now / SLOT); s++) {
      const t = s * SLOT + SLOT / 2;
      for (const kind of Object.keys(CAST)) {
        if (!eligible(CAST[kind], t, world) || roll(v.seed, s, kind) >= chance(kind, t, v, world)) continue;
        const first = !v.seen[kind];
        note(v, kind, t, first, allocate, g);
        if (first) out.firsts.push(kind);
        visits.push({ kind, t });
      }
    }
    for (const x of visits.slice().reverse()) {
      if (out.traces.length >= MAX_TRACES) break;
      const trace = traceOf(CAST[x.kind], x.t);
      if (trace && !out.traces.some((y) => y.trace === trace)) out.traces.push({ kind: x.kind, trace, place: CAST[x.kind].place, until: x.t + TRACE_DAYS * DAY });
    }
    // now: perhaps someone is still here
    const s = Math.floor(now / SLOT);
    if (roll(v.seed, s, 'present') < PRESENT) {
      const here = Object.keys(CAST).filter((k) => eligible(CAST[k], now, world) && chance(k, now, v, world) > 0);
      const weight = (k) => (CAST[k].cls === 'rare' ? chance(k, now, v, world) * 0.5 : chance(k, now, v, world));
      const total = here.reduce((a, k) => a + weight(k), 0);
      let r = roll(v.seed, s, 'who') * total;
      for (const k of here) {
        if ((r -= weight(k)) > 0) continue;
        const first = !v.seen[k];
        note(v, k, now, first, allocate, g);
        if (first) out.firsts.push(k);
        out.present = { kind: k, place: CAST[k].place, until: now + (20 + 40 * roll(v.seed, s, 'stay')) * 1000 };
        break;
      }
    }
    // a present from Erwu, about once every three days away
    if (away >= 12 * HOUR && roll(v.seed, s, 'gift') < 1 - Math.exp(-away / GIFT_EVERY)) {
      const list = GIFTS[Time.seasonOfMonth(new Date(now).getMonth())];
      out.gift = { item: list[Math.floor(roll(v.seed, s, 'gift-item') * list.length)], until: now + TRACE_DAYS * DAY };
    }
    v.traces = [...out.traces, ...v.traces].slice(0, MAX_TRACES);
    if (out.gift) v.gift = out.gift;
    v.present = out.present;
    v.checked = now;
    return out.present || out.traces.length || out.gift ? out : null;
  }
  return { CAST, GIFTS, RATE, RARE, SLOT, MAX_AWAY, KEEPSAKES, fresh, valid, arrive, roll, eligible, pickUp, pickUpTrace, shelfCount };
});
