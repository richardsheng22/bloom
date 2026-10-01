/* Persistent ownership. No canvas or browser globals here.
   Version 4 (living-garden ticket 02) starts every player with a new, bare garden under its own
   key. Older saves (`bloom.garden2`, its backup and `bloom.garden1`) are never read, written or
   removed: they stay in storage exactly as they were. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./garden-layout.js'), require('./garden-beds.js'), require('./garden-time.js'), require('./garden-visits.js'));
  else root.BloomGarden = factory(root.BloomGardenLayout, root.BloomBeds, root.BloomTime, root.BloomVisits);
})(typeof globalThis === 'object' ? globalThis : this, function (Layout, Beds, Time, Visits) {
  'use strict';
  const KEY = 'bloom.garden4', BACKUP = 'bloom.garden4.backup';
  const RETIRED = Object.freeze(['bloom.garden2', 'bloom.garden2.backup', 'bloom.garden1']);
  const VERSION = 4;
  // Growth a tended turn gives every plant, at full weight (see BloomTime.turnWeight).
  const TEND = 0.01;
  // the last six are the wildflowers a full garden matures into; tulip, peony and poppy grow
  // from the buds of the same name (living-garden ticket 04)
  const KINDS = new Set(['grass', 'clover', 'fern', 'mushroom', 'daisy', 'cosmos', 'lavender', 'forget', 'buttercup',
    'foxglove', 'bluebell', 'sweetpea', 'cornflower', 'rose', 'wild', 'tulip', 'peony', 'poppy']);
  const domains = ['plant', 'patch', 'object', 'discovery', 'seed'];
  const collections = ['plants', 'patches', 'objects', 'discoveries', 'seeds'];
  const finite = (n) => typeof n === 'number' && Number.isFinite(n);
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
      g.rest !== 0 || !g.nextIds || !Array.isArray(g.patches) || !Array.isArray(g.discoveries) ||
      !Layout.valid(g) || !Beds.valid(g) || !Time.valid(g) || !Visits.valid(g)) return false;
    return domains.every((domain, i) => {
      const records = g[collections[i]];
      return hasIds(records, domain) && Number.isSafeInteger(g.nextIds[domain]) && g.nextIds[domain] > 0 &&
        records.every((r) => Number(r.id.split('-')[1]) < g.nextIds[domain]);
    });
  }
  // `rest` is retired (absence no longer dims the garden) and always 0; it stays in the format
  // so every reader finds a valid value.
  function fresh(now, seed = Math.floor(Math.random() * 2 ** 31)) {
    return { v: VERSION, tended: now, lastSeen: now, rest: 0, nextIds: { plant: 1, patch: 1, object: 1, discovery: 1, seed: 1 },
      plants: [], patches: [], objects: [], discoveries: [], ...Beds.fresh(), ...Time.fresh(now), ...Visits.fresh(seed), fresh: true };
  }
  function load(storage, now = Date.now()) {
    let raw, backup;
    try { raw = storage.getItem(KEY); backup = storage.getItem(BACKUP); }
    catch { return { garden: fresh(now), writable: false, issue: 'unavailable' }; }
    const current = parse(raw);
    // A newer format must never be overwritten by an older client.
    if (current && Number.isInteger(current.v) && current.v > VERSION) return { garden: fresh(now), writable: false, issue: 'newer' };
    if (valid(current)) return { garden: current, writable: true, issue: null };
    const recovered = parse(backup);
    if (valid(recovered)) return { garden: recovered, writable: true, issue: 'recovered' };
    // Leave unrecognized data untouched. A temporary garden remains playable.
    const unreadable = raw !== null || backup !== null;
    return { garden: fresh(now), writable: !unreadable, issue: unreadable ? 'unreadable' : null };
  }
  function snapshot(g) {
    // In-flight/sprouting plants are already owned; animation fields are transient.
    return { v: VERSION, ...(g.layoutVersion === undefined ? {} : { layoutVersion: g.layoutVersion }), tended: g.tended, lastSeen: g.lastSeen, rest: 0, nextIds: { ...g.nextIds },
      plants: g.plants.map(({ id, a, d, k, g: growth, s }) => ({ id, a, d, k, g: growth, s })),
      patches: g.patches, objects: g.objects, discoveries: g.discoveries, focus: g.focus, seeds: g.seeds, luck: { ...g.luck },
      time: { ...g.time }, character: { ...g.character }, visits: g.visits, ...(g.style ? { style: { ...g.style } } : {}),
      ...(g.seasonSeen ? { seasonSeen: g.seasonSeen } : {}), ...(g.flourished ? { flourished: g.flourished } : {}) };
  }
  function save(storage, session) {
    if (!session.writable) return false;
    const data = snapshot(session.garden);
    if (!valid(data)) return false;
    try {
      const previous = storage.getItem(KEY);
      if (valid(parse(previous))) {
        storage.setItem(BACKUP, previous);
        if (storage.getItem(BACKUP) !== previous) return false;
      }
      const raw = JSON.stringify(data);
      storage.setItem(KEY, raw);
      if (storage.getItem(KEY) !== raw) {
        if (previous !== null) storage.setItem(KEY, previous);
        else storage.removeItem(KEY);
        return false;
      }
      return true;
    } catch { return false; }
  }
  // Opening the garden. Being away never takes anything away.
  function arrive(g, now = Date.now()) {
    if (now > g.lastSeen) g.lastSeen = now;
    g.rest = 0;
  }
  function tend(g, now = Date.now(), amount = TEND) {
    g.tended = now; if (now > g.lastSeen) g.lastSeen = now;
    for (const p of g.plants) p.g = Math.min(1, p.g + amount);
  }
  function allocateId(g, domain = 'plant') {
    if (!domains.includes(domain)) throw new Error('Unknown garden identity domain');
    return `${domain}-${g.nextIds[domain]++}`;
  }
  return { KEY, BACKUP, RETIRED, VERSION, TEND, KINDS, load, save, snapshot, valid, fresh, arrive, tend, allocateId };
});
