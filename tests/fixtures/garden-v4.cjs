// A saved v4 garden (living-garden ticket 02) built from the generated v1 fixture's plants, for
// the browser suites to seed under `bloom.garden4`. No personal data.
const G = require('../../garden-state.js');
const L = require('../../garden-layout.js');
const fixture = require('./garden-v1.json');
const KEY = G.KEY;
// `now` is when it was last seen, less `hoursAway`; `bed` plants and flowers the first bed.
function gardenV4({ now = Date.now(), hoursAway = 0, bed = null, growth = 0.8, visited = false } = {}) {
  const seen = now - hoursAway * 3600000;
  const g = G.fresh(seen, 1234);
  delete g.fresh;
  L.initialize(g, G.allocateId);
  for (const p of fixture.plants) g.plants.push({ id: G.allocateId(g), ...p });
  if (bed) { g.patches[0].flower = bed; g.patches[0].growth = growth; g.focus = g.patches[0].id; }
  if (bed && visited) g.discoveries.push({ id: G.allocateId(g, 'discovery'), type: 'bed-visit', bed: g.patches[0].id, kind: bed, at: seen });
  g.visits.checked = seen;
  return JSON.stringify(G.snapshot(g));
}
module.exports = { KEY, gardenV4, plants: fixture.plants };
