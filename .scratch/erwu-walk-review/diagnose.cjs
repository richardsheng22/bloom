// Diagnostic, not a passing regression gate: --assert deliberately exposes the
// current abrupt-start symptom. Run from any directory with Node.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const behaviorPath = path.resolve(__dirname, '../../erwu-behavior.js');
let E = require(behaviorPath);
if (process.argv.includes('--direct-route')) {
  // Controlled comparison only: remove the presentation-driven zigzag while
  // preserving the route graph and the production update function.
  const source = fs.readFileSync(behaviorPath, 'utf8')
    .replace('meander(w.places, st.at, route(w.places, st.at, s.to), st.facing)', 'route(w.places, st.at, s.to)')
    .replace('meander(w.places, st.at, [s.to], st.facing)', '[s.to]');
  const comparison = new Module(behaviorPath, module); comparison.filename = behaviorPath;
  comparison._compile(source, behaviorPath); E = comparison.exports;
}
const L = require('../../garden-layout.js');
const V = require('../../garden-view.js');
const assert = require('node:assert/strict');
const scene = V.layout({ left: 0, top: 0, width: 358, height: 400 });
const places = E.places(scene, L.geometry(scene), L.landmarks(scene));
const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
const strideFactor = Number(html.match(/stride: gardenScene \? gardenScene\.nest \* \(artImage\('erwu'\) \? ([\d.]+)/)[1]);
const world = { places, scene, beds: [], objects: [], visitors: [], rest: 0, scaleAt: () => 1, stride: scene.nest * strideFactor };
const st = E.create(7);
Object.assign(st, { at: { x: -80, y: 100 }, pose: 'sit', step: { do: 'walk-free', path: [{ x: 80, y: 100 }], t: 0 }, steps: [{ do: 'pose', pose: 'sit', dur: 10 }] });
const speeds = [];
for (let i = 0; i < 310; i++) {
  const before = { ...st.at };
  E.update(st, 1 / 60, world);
  speeds.push(Math.hypot(st.at.x - before.x, st.at.y - before.y) * 60);
}
const peak = Math.max(...speeds), first = speeds.find(v => v > 0), last = speeds.filter(v => v > 0).at(-1);
const route = E.create(7); E.request(route, 'log', world);
let previousDirection = null, maxTurn = 0, turns = 0, walked = 0, flips = 0;
for (let i = 0; i < 1800; i++) {
  const p = { ...route.at }, facing = route.facing;
  E.update(route, 1 / 60, world);
  if (route.pose !== 'walk') { if (walked > 0) break; else continue; }
  const dx = route.at.x - p.x, dy = route.at.y - p.y, d = Math.hypot(dx, dy);
  if (d < 0.001) continue;
  walked += d;
  const direction = Math.atan2(dy, dx);
  if (previousDirection != null) {
    const a = Math.abs(Math.atan2(Math.sin(direction - previousDirection), Math.cos(direction - previousDirection))) * 180 / Math.PI;
    maxTurn = Math.max(maxTurn, a); if (a > 30) turns++;
  }
  if (route.facing !== facing) flips++;
  previousDirection = direction;
  if (route.step && !['walk', 'walk-free'].includes(route.step.do)) break;
}
const result = { firstFrameSpeed: first, cruiseSpeed: peak, lastMovingFrameSpeed: last,
  firstFrameFractionOfCruise: first / peak, strideAtThisSize: world.stride,
  cycleSeconds: world.stride / peak, distinctFramesPerSecond: 8 * peak / world.stride,
  route: { maxDirectionChangeDegreesInOneFrame: maxTurn, turnsOver30Degrees: turns, instantaneousFacingFlips: flips, distance: walked } };
console.log(JSON.stringify(result, null, 2));
if (process.argv.includes('--assert')) assert.ok(first / peak < 0.5, 'First walking frame should build speed rather than instantly reaching cruise speed');
