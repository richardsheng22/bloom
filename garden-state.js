/* Persistent ownership and temporary rest. No canvas or browser globals here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./garden-layout.js'), require('./garden-beds.js'));
  else root.BloomGarden = factory(root.BloomGardenLayout, root.BloomBeds);
})(typeof globalThis === 'object' ? globalThis : this, function (Layout, Beds) {
  'use strict';
  const KEY = 'bloom.garden2', BACKUP = 'bloom.garden2.backup', LEGACY = 'bloom.garden1';
  const REST = Object.freeze({ graceHours: 12, settleHours: 72, wakeSeconds: 90, turnRecovery: 0.18 });
  const VERSION = 3;
  const KINDS = new Set(['grass', 'clover', 'fern', 'mushroom', 'daisy', 'cosmos', 'lavender', 'forget', 'buttercup']);
  const domains = ['plant', 'patch', 'object', 'discovery', 'seed'];
  const collections = ['plants', 'patches', 'objects', 'discoveries', 'seeds'];
  const finite = (n) => typeof n === 'number' && Number.isFinite(n);
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const timestamp = (n) => finite(n) && n >= 0;
  const parse = (raw) => { try { return JSON.parse(raw); } catch { return null; } };
  function validPlants(plants) {
    return Array.isArray(plants) && plants.every((p) => p && finite(p.a) && finite(p.d) && p.d >= 0 && p.d <= 10 &&
      KINDS.has(p.k) && finite(p.g) && p.g >= 0 && p.g <= 1 && finite(p.s));
  }
  function hasIds(records, domain) {
    return Array.isArray(records) && records.every((r) => r && typeof r.id === 'string' &&
      new RegExp('^' + domain + '-[1-9][0-9]*$').test(r.id) && Number.isSafeInteger(Number(r.id.split('-')[1]))) &&
      new Set(records.map((r) => r.id)).size === records.length;
  }
  function valid(g) {
    if (!g || g.v !== VERSION || !validPlants(g.plants) || !timestamp(g.lastSeen) || !timestamp(g.tended) ||
      !finite(g.rest) || g.rest < 0 || g.rest > 1 || !g.nextIds || !Array.isArray(g.patches) || !Array.isArray(g.discoveries) ||
      !Layout.valid(g) || !Beds.valid(g)) return false;
    return domains.every((domain, i) => {
      const records = g[collections[i]];
      return hasIds(records, domain) && Number.isSafeInteger(g.nextIds[domain]) && g.nextIds[domain] > 0 &&
        records.every((r) => Number(r.id.split('-')[1]) < g.nextIds[domain]);
    });
  }
  function fresh(now) {
    return { v: VERSION, tended: now, lastSeen: now, rest: 0, nextIds: { plant: 1, patch: 1, object: 1, discovery: 1, seed: 1 },
      plants: [], patches: [], objects: [], discoveries: [], ...Beds.fresh(), fresh: true };
  }
  // v2 → v3 adds the seed tin, seed pacing, and a planting in each bed. Returns a new object.
  function upgrade(g) {
    if (!g || g.v !== 2 || !g.nextIds) return null;
    const out = JSON.parse(JSON.stringify(g));
    out.v = VERSION;
    out.nextIds.seed = 1;
    Object.assign(out, Beds.fresh());
    if (out.layoutVersion === 1 && !Layout.upgrade(out)) return null;
    return valid(out) ? out : null;
  }
  function migrate(g, now) {
    if (!g || g.v !== 1 || !validPlants(g.plants) || !timestamp(g.tended)) return null;
    const out = fresh(now);
    delete out.fresh;
    out.tended = g.tended;
    out.lastSeen = g.tended;
    out.plants = g.plants.map(({ a, d, k, g: growth, s }, i) => ({ id: `plant-${i + 1}`, a, d, k, g: growth, s }));
    out.nextIds.plant = out.plants.length + 1;
    return out;
  }
  function load(storage, now = Date.now()) {
    let raw, backup, legacy;
    try { raw = storage.getItem(KEY); backup = storage.getItem(BACKUP); legacy = storage.getItem(LEGACY); }
    catch { return { garden: fresh(now), writable: false, issue: 'unavailable' }; }
    const current = parse(raw);
    // A newer format must never be overwritten by an older client.
    if (current && Number.isInteger(current.v) && current.v > VERSION) return { garden: fresh(now), writable: false, issue: 'newer' };
    if (valid(current)) return { garden: current, writable: true, issue: null };
    // The previous format is kept as the backup until the upgraded garden has been written.
    const upgraded = upgrade(current);
    if (upgraded) return { garden: upgraded, writable: true, issue: null };
    const recovered = parse(backup);
    if (valid(recovered)) return { garden: recovered, writable: true, issue: 'recovered' };
    const recoveredOld = upgrade(recovered);
    if (recoveredOld) return { garden: recoveredOld, writable: true, issue: 'recovered' };
    const migrated = migrate(parse(legacy), now);
    if (migrated) return { garden: migrated, writable: true, issue: null };
    // Leave unrecognized data untouched. A temporary garden remains playable.
    const unreadable = raw !== null || backup !== null || legacy !== null;
    return { garden: fresh(now), writable: !unreadable, issue: unreadable ? 'unreadable' : null };
  }
  function snapshot(g) {
    // In-flight/sprouting plants are already owned; animation fields are transient.
    return { v: VERSION, ...(g.layoutVersion === undefined ? {} : { layoutVersion: g.layoutVersion }), tended: g.tended, lastSeen: g.lastSeen, rest: g.rest, nextIds: { ...g.nextIds },
      plants: g.plants.map(({ id, a, d, k, g: growth, s }) => ({ id, a, d, k, g: growth, s })),
      patches: g.patches, objects: g.objects, discoveries: g.discoveries, focus: g.focus, seeds: g.seeds, luck: { ...g.luck } };
  }
  function save(storage, session) {
    if (!session.writable) return false;
    const data = snapshot(session.garden);
    if (!valid(data)) return false;
    try {
      const previous = storage.getItem(KEY);
      const prior = parse(previous);
      if (valid(prior) || (prior && prior.v === 2)) {
        storage.setItem(BACKUP, previous);
        if (storage.getItem(BACKUP) !== previous) return false;
      }
      const raw = JSON.stringify(data);
      storage.setItem(KEY, raw);
      // Keep the legacy snapshot untouched, even after verified migration.
      if (storage.getItem(KEY) !== raw) {
        if (previous !== null) storage.setItem(KEY, previous);
        else storage.removeItem(KEY);
        return false;
      }
      return true;
    } catch { return false; }
  }
  function restAt(g, now = Date.now()) {
    const awayHours = Math.max(0, now - g.lastSeen) / 3600000;
    return clamp(g.rest + Math.max(0, awayHours - REST.graceHours) / REST.settleHours);
  }
  function arrive(g, now = Date.now()) {
    g.rest = restAt(g, now);
    g.lastSeen = now;
    return g.rest;
  }
  function wake(g, seconds) {
    if (!finite(seconds) || seconds <= 0) return false;
    const before = g.rest;
    g.rest = clamp(g.rest - Math.min(seconds, 1) / REST.wakeSeconds);
    return before !== g.rest;
  }
  function tend(g, now = Date.now()) {
    g.tended = now; g.lastSeen = now;
    g.rest = clamp(g.rest - REST.turnRecovery);
    for (const p of g.plants) p.g = Math.min(1, p.g + 0.035);
  }
  function allocateId(g, domain = 'plant') {
    if (!domains.includes(domain)) throw new Error('Unknown garden identity domain');
    return `${domain}-${g.nextIds[domain]++}`;
  }
  return { KEY, BACKUP, LEGACY, VERSION, REST, load, save, snapshot, valid, upgrade, restAt, arrive, wake, tend, allocateId };
});
