/* Cultivation in the flower beds, rare seeds, and the seed tin. No canvas or browser globals here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomBeds = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const COMMON = Object.freeze(['lavender', 'daisy', 'cosmos']);
  const RARE = Object.freeze(['catnip', 'sunflower', 'moonflower', 'dandelion', 'bleeding-heart', 'strawberry']);
  const NAMES = Object.freeze({ lavender: 'Lavender', daisy: 'Daisies', cosmos: 'Cosmos', catnip: 'Catnip', sunflower: 'Sunflower',
    moonflower: 'Moonflower', dandelion: 'Dandelion', 'bleeding-heart': 'Bleeding heart', strawberry: 'Wild strawberry' });
  const ABOUT = Object.freeze({
    lavender: 'Soft purple spires that smell of summer.', daisy: 'Cheerful white daisies.', cosmos: 'Tall, airy pink cosmos.',
    catnip: 'Erwu is rather fond of this one.', sunflower: 'Turns its face to follow the sun through the day.',
    moonflower: 'Stays closed by day and opens in the evening.', dandelion: 'When it has gone to seed, tap it to blow.',
    'bleeding-heart': 'Arching stems of little heart-shaped flowers.', strawberry: 'White flowers that ripen into berries.',
  });
  // Tunable pacing, paced by days (living-garden ticket 01). The old values were tuned on
  // random-aim runs of 9–18 turns, but real runs last 80–90, so three beds finished in one
  // sitting. Now a common bed takes about five days of ordinary play (25–40 turns a day, the
  // turns past 25 counting a quarter; see BloomTime) plus a little growth on its own each day,
  // and a rare one about seven. Blooms from a single shot add at most `bloomPerShot`.
  const GROW = Object.freeze({ turn: 0.002, bloom: 0.002, bloomPerShot: 0.0055, miss: 0.0003, fullBloom: 0.015, rare: 0.75, idle: 0.25 });
  const LUCK = Object.freeze({ firstChance: 0.5, base: 0.3, perDryRun: 0.2, earliest: 3, latest: 8 });
  const STAGES = Object.freeze([[0.2, 'planted'], [0.55, 'growing'], [1, 'flowering']]);
  const STAGE_NAMES = Object.freeze({ empty: 'Ready for planting', planted: 'Just planted', growing: 'Growing', flowering: 'Flowering', established: 'Established' });
  const PUFF_TURNS = 3;
  const finite = (n) => typeof n === 'number' && Number.isFinite(n);
  const isKind = (k) => COMMON.includes(k) || RARE.includes(k);
  const isRare = (k) => RARE.includes(k);

  function stage(bed) {
    if (!bed || !bed.flower) return 'empty';
    if (bed.growth >= 1) return 'established';
    for (const [limit, name] of STAGES) if (bed.growth < limit) return name;
    return 'flowering';
  }
  const found = (g) => g.discoveries.filter((d) => d.type === 'seed-found').map((d) => d.kind);

  function fresh() { return { focus: null, seeds: [], luck: { dry: 0, last: null } }; }
  function valid(g) {
    if (!g || !Array.isArray(g.seeds) || !g.luck || !Number.isSafeInteger(g.luck.dry) || g.luck.dry < 0) return false;
    if (g.luck.last !== null && typeof g.luck.last !== 'string') return false;
    if (g.focus !== null && !g.patches.some((p) => p.id === g.focus)) return false;
    const ids = new Set();
    const seedsOk = g.seeds.every((s) => s && typeof s.id === 'string' && /^seed-[1-9][0-9]*$/.test(s.id) && !ids.has(s.id) && ids.add(s.id) &&
      isKind(s.kind) && finite(s.growth) && s.growth >= 0 && s.growth <= 1);
    // Beds carry plantings only once the arrangement system owns them.
    const bedsOk = g.layoutVersion === undefined || g.patches.every((p) => (p.flower === null ? p.growth === 0 : isKind(p.flower)) &&
      (p.puffed === undefined || (Number.isSafeInteger(p.puffed) && p.puffed >= 0 && p.puffed <= PUFF_TURNS)));
    return seedsOk && bedsOk;
  }

  // The bed that ordinary play grows: the chosen one if it still has growing to do,
  // otherwise the first planted bed that does. Placed beds only.
  function focusBed(g) {
    const open = (p) => p && p.anchor !== null && p.flower && p.growth < 1;
    const chosen = g.patches.find((p) => p.id === g.focus);
    return open(chosen) ? chosen : g.patches.find(open) || null;
  }
  // Grow the focus bed; other planted beds get a gentle share of turn growth.
  // Returns the stage change, if any, so the caller can celebrate it.
  function grow(g, amount, source = 'turn') {
    const bed = focusBed(g);
    let change = null;
    if (bed) {
      const before = stage(bed);
      bed.growth = Math.min(1, bed.growth + amount * (isRare(bed.flower) ? GROW.rare : 1));
      const after = stage(bed);
      if (after !== before) change = { bed, before, after };
    }
    if (source === 'turn') for (const p of g.patches) {
      if (p === bed || p.anchor === null || !p.flower || p.growth >= 1) continue;
      p.growth = Math.min(1, p.growth + amount * GROW.idle * (isRare(p.flower) ? GROW.rare : 1));
    }
    return change;
  }
  // `weight` is how much the turn counts toward the day's growth (BloomTime.turnWeight).
  function tendTurn(g, weight = 1) {
    for (const p of g.patches) if (p.puffed) p.puffed--;
    return grow(g, GROW.turn * weight, 'turn');
  }

  // A planting plan: what goes into a bed, and where the current planting goes.
  // Nothing is ever destroyed: an uprooted planting waits in the seed tin.
  function planPlanting(g, bedId, choice) {
    const bed = g.patches.find((p) => p.id === bedId);
    if (!bed || !choice) return null;
    let kind, growth = 0, seedId = null;
    if (choice.seed) {
      const seed = g.seeds.find((s) => s.id === choice.seed);
      if (!seed) return null;
      kind = seed.kind; growth = seed.growth; seedId = seed.id;
    } else if (COMMON.includes(choice.kind)) kind = choice.kind;
    else return null;
    if (bed.flower === kind && !seedId) return null;
    return { bed: bed.id, kind, growth, seed: seedId,
      uprooted: bed.flower ? { kind: bed.flower, growth: bed.growth } : null };
  }
  function applyPlanting(g, plan, allocate) {
    if (!plan) return false;
    const bed = g.patches.find((p) => p.id === plan.bed);
    if (!bed) return false;
    if (plan.seed) {
      const i = g.seeds.findIndex((s) => s.id === plan.seed);
      if (i < 0) return false;
      g.seeds.splice(i, 1);
    }
    // A barely started common planting has nothing worth keeping.
    if (bed.flower && (isRare(bed.flower) || bed.growth >= 0.05)) g.seeds.push({ id: allocate(g, 'seed'), kind: bed.flower, growth: bed.growth });
    bed.flower = plan.kind; bed.growth = plan.growth; delete bed.puffed;
    g.focus = bed.id;
    return true;
  }
  function setFocus(g, bedId) {
    const bed = g.patches.find((p) => p.id === bedId);
    if (!bed || !bed.flower) return false;
    g.focus = bed.id;
    return true;
  }
  function puff(g, bedId) {
    const bed = g.patches.find((p) => p.id === bedId);
    if (!bed || bed.flower !== 'dandelion' || stage(bed) === 'planted' || stage(bed) === 'growing' || bed.puffed) return false;
    bed.puffed = PUFF_TURNS;
    return true;
  }

  // Rare seeds. At most one seed bud per run; the first arrives within two runs,
  // and each run without one makes the next more likely.
  function seedChance(g) {
    const dry = g.luck.dry;
    if (!found(g).length) return dry >= 1 ? 1 : LUCK.firstChance;
    return Math.min(1, LUCK.base + LUCK.perDryRun * dry);
  }
  function nextKind(g, rnd) {
    const have = found(g), left = RARE.filter((k) => !have.includes(k));
    const pool = left.length ? left : RARE;
    return pool[Math.floor(rnd() * pool.length) % pool.length];
  }
  // Called once when a run starts. Returns the turn a seed bud appears on, or null.
  function planRun(g, rnd = Math.random) {
    const yes = rnd() < seedChance(g);
    g.luck.dry++;
    if (!yes) return null;
    return { turn: LUCK.earliest + Math.floor(rnd() * (LUCK.latest - LUCK.earliest + 1)), kind: nextKind(g, rnd),
      key: `run-${Math.floor(rnd() * 1e9).toString(36)}` };
  }
  // Collect a seed bud's seed. `key` identifies the run's seed bud, so a replayed
  // turn after a reload cannot collect the same seed twice.
  function collect(g, key, kind, allocate, now = Date.now()) {
    if (!isRare(kind) || !key || g.luck.last === key) return null;
    const firstOfKind = !found(g).includes(kind);
    const seed = { id: allocate(g, 'seed'), kind, growth: 0 };
    g.seeds.push(seed);
    g.luck.dry = 0; g.luck.last = key;
    if (firstOfKind) g.discoveries.push({ id: allocate(g, 'discovery'), type: 'seed-found', kind, at: now });
    return seed;
  }
  // Records the first time each rare kind flowers, once.
  function noteFlowering(g, allocate, now = Date.now()) {
    const out = [];
    for (const p of g.patches) {
      if (!isRare(p.flower) || p.growth < 0.55) continue;
      if (g.discoveries.some((d) => d.type === 'first-flower' && d.kind === p.flower)) continue;
      const d = { id: allocate(g, 'discovery'), type: 'first-flower', kind: p.flower, at: now };
      g.discoveries.push(d); out.push(d);
    }
    return out;
  }
  // Time-of-day traits, from the device's local clock.
  const isNight = (hour) => hour >= 19 || hour < 6;
  const sunAngle = (hour) => Math.max(-1, Math.min(1, (hour - 12.5) / 6)); // -1 morning … 1 evening

  return { COMMON, RARE, NAMES, ABOUT, GROW, LUCK, STAGE_NAMES, PUFF_TURNS, isKind, isRare, stage, found, fresh, valid,
    focusBed, grow, tendTurn, planPlanting, applyPlanting, setFocus, puff, seedChance, planRun, collect, noteFlowering, isNight, sunAngle };
});
