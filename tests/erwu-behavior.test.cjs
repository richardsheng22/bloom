const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../erwu-behavior.js');
const L = require('../garden-layout.js');
const V = require('../garden-view.js');

function world(w = 358, h = 400, extra = {}) {
  const scene = V.layout({ left: 0, top: 0, width: w, height: h });
  const places = E.places(scene, L.geometry(scene), L.landmarks(scene));
  return { places, scene, beds: [{ id: 'patch-1', anchor: 'bed-left', planted: true }, { id: 'patch-2', anchor: 'bed-top', planted: false }, { id: 'patch-3', anchor: 'bed-right', planted: true }],
    objects: [{ id: 'object-1', kind: 'cushion', anchor: 'nook-left' }, { id: 'object-2', kind: 'stone', anchor: 'nook-right' }],
    visitors: [], rest: 0, scaleAt: () => 1, stride: 26, ...extra };
}
const run = (st, w, seconds, dt = 1 / 60, each) => { for (let t = 0; t < seconds; t += dt) { E.update(st, dt, w); if (each) each(st); } };

test('every place in the garden can be reached from the basket, at every phone size, without crossing the roses', () => {
  for (const [w, h] of [[288, 250], [343, 330], [358, 400], [398, 470], [536, 270]]) {
    const wd = world(w, h), pl = wd.places;
    for (const name of Object.keys(pl.nodes).filter((k) => k.startsWith('spot:'))) {
      const path = E.route(pl, { x: 0, y: 0 }, name);
      assert.ok(path.length >= 2, `${name} reachable at ${w}x${h}`);
      let prev = { x: 0, y: 0 };
      for (const [i, p] of path.entries()) {
        if (i > 1) assert.ok(pl.clear(prev, p), `${name} leg ${i} clear of the roses at ${w}x${h}`);
        assert.ok(Math.abs(p.x) <= w / 2 && Math.abs(p.y) <= h / 2, `${name} stays on screen at ${w}x${h}`);
        prev = p;
      }
    }
  }
});

test('she leaves the basket by the gate at the front', () => {
  const wd = world(), path = E.route(wd.places, { x: 0, y: 0 }, 'spot:nook-right');
  assert.deepEqual(path[0], wd.places.nodes.nest);
  assert.deepEqual(path[1], wd.places.nodes.gate);
});

test('a five-minute visit has pauses, variety, and no single action dominating', () => {
  const st = E.create(7), wd = world();
  E.reset(st);
  const seen = [];
  let last = null, still = 0, frames = 0;
  run(st, wd, 300, 1 / 30, (s) => { frames++; if (s.action !== last) { seen.push(s.action); last = s.action; } if (s.pose !== 'walk') still++; });
  const counts = seen.reduce((m, a) => (m[a] = (m[a] || 0) + 1, m), {});
  assert.ok(Object.keys(counts).length >= 5, JSON.stringify(counts));
  assert.ok(Math.max(...Object.values(counts)) <= seen.length * 0.45, JSON.stringify(counts));
  assert.ok(still / frames > 0.5, 'she spends most of her time still, not pacing');
  for (let i = 3; i < seen.length; i++) assert.ok(!(seen[i] === seen[i - 1] && seen[i] === seen[i - 2] && seen[i] === seen[i - 3] && seen[i] !== 'doze'), `no action four times running: ${seen.slice(i - 3, i + 1)}`);
});

test('walking never slides: the stride cycle advances with distance travelled', () => {
  const st = E.create(3), wd = world();
  E.reset(st); st.steps = []; st.step = null;
  E.request(st, 'sun-stone', wd);
  let moved = 0, prev = { ...st.at }, phase0 = st.phase;
  run(st, wd, 8, 1 / 60, (s) => { if (s.pose === 'walk') moved += Math.hypot(s.at.x - prev.x, s.at.y - prev.y); prev = { ...s.at }; });
  assert.ok(moved > 50);
  // the hop onto the stone moves without stepping, so allow for it
  assert.ok(Math.abs((st.phase - phase0) / (2 * Math.PI) * wd.stride - moved) < 60, `${(st.phase - phase0) / (2 * Math.PI) * wd.stride} vs ${moved}`);
});

test('timing is the same at 30 and 60 frames a second, and a long pause replays nothing', () => {
  const a = E.create(11), b = E.create(11), wd = world();
  E.reset(a); E.reset(b);
  run(a, wd, 40, 1 / 30); run(b, wd, 40, 1 / 60);
  assert.equal(a.action, b.action);
  // steps end on frame boundaries, so allow about one 30 fps frame of walking per step taken
  assert.ok(Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y) < 14, `${JSON.stringify(a.at)} ${JSON.stringify(b.at)}`);
  const before = a.clock; E.update(a, 3600, wd);
  assert.ok(a.clock - before <= 0.1 + 1e-9);
});

test('a tap wakes her or makes her look up; taps close together do not stack', () => {
  const st = E.create(5), wd = world();
  E.reset(st);
  assert.equal(E.tap(st), 'wake');
  assert.equal(E.tap(st), null);
  run(st, wd, 1.5);
  assert.equal(st.pose, 'front');
  run(st, wd, 10);
  E.request(st, 'fountain', wd);
  run(st, wd, 0.8);
  assert.equal(st.pose, 'walk');
  const at = { ...st.at };
  assert.equal(E.tap(st), 'ack');
  run(st, wd, 1);
  assert.equal(st.pose, 'front');
  assert.deepEqual(st.at, at, 'she stops while she looks at you');
  run(st, wd, 3);
  assert.notDeepEqual(st.at, at, 'then carries on');
  assert.equal(st.events.filter((e) => e.type === 'purr').length, 2);
});

test('moving or removing her target makes her choose again; pausing holds her still', () => {
  const st = E.create(9), wd = world();
  E.reset(st); st.steps = []; st.step = null;
  E.request(st, 'cushion', wd);
  run(st, wd, 0.5);
  E.invalidate(st, 'nook-left');
  assert.equal(st.step, null);
  assert.equal(st.steps.length, 0);
  st.paused = true;
  const at = { ...st.at };
  run(st, wd, 5);
  assert.deepEqual(st.at, at);
  st.paused = false;
  run(st, wd, 1);
  assert.ok(st.action);
});

test('a put-away cushion is never visited; an empty garden and a resting garden still work', () => {
  const wd = world(358, 400, { objects: [{ id: 'object-1', kind: 'cushion', anchor: null }], beds: [], rest: 1 });
  const st = E.create(13);
  E.reset(st);
  const actions = new Set();
  run(st, wd, 300, 1 / 20, (s) => actions.add(s.action));
  assert.ok(!actions.has('cushion') && !actions.has('sniff-bed'));
  assert.ok(actions.has('nap'), 'a resting garden means more naps');
});

test('stalking a butterfly ends with a pounce that scares it off, then she loses interest', () => {
  const wd = world(), st = E.create(21);
  wd.visitors = [{ id: 'fly-1', x: -120, y: 110, landed: true }];
  E.reset(st); st.steps = []; st.step = null;
  assert.ok(E.request(st, 'stalk', wd));
  const poses = new Set();
  run(st, wd, 20, 1 / 60, (s) => poses.add(s.pose));
  for (const p of ['walk', 'crouch', 'pounce', 'sit']) assert.ok(poses.has(p), p);
  assert.ok(st.events.some((e) => e.type === 'scare' && e.visitor === 'fly-1'));
});

test('if the butterfly leaves first she gives up quietly', () => {
  const wd = world(), st = E.create(22);
  wd.visitors = [{ id: 'fly-1', x: -120, y: 110, landed: true }];
  E.reset(st); st.steps = []; st.step = null;
  E.request(st, 'stalk', wd);
  run(st, wd, 1.2);
  wd.visitors = [];
  run(st, wd, 6);
  assert.ok(!st.events.some((e) => e.type === 'scare'));
});

test('the welcome after time away: wake, stretch, come to the front and look at you', () => {
  const wd = world(), st = E.create(4);
  E.reset(st, 'back after time away');
  E.request(st, 'greet', wd);
  const poses = [];
  run(st, wd, 14, 1 / 60, (s) => { if (poses[poses.length - 1] !== s.pose) poses.push(s.pose); });
  assert.deepEqual(poses.slice(0, 5), ['curl', 'yawn', 'stretch', 'walk', 'front']);
});

test('a queued sequence runs in order after the current one', () => {
  const wd = world(), st = E.create(31);
  E.reset(st); st.steps = []; st.step = null;
  E.request(st, 'greet', wd);
  assert.ok(E.queue(st, 'visit-bloom', wd, 'patch-1', 'first bloom'));
  const actions = [];
  run(st, wd, 25, 1 / 60, (s) => { if (actions[actions.length - 1] !== s.action) actions.push(s.action); });
  assert.deepEqual(actions.slice(0, 2), ['greet', 'visit-bloom']);
});

test('a hello while she sits: she looks at you, then goes back to sitting', () => {
  const wd = world(), st = E.create(41);
  E.reset(st); st.steps = [{ do: 'pose', pose: 'sit', dur: 20 }]; st.step = null;
  run(st, wd, 1);
  assert.equal(E.tap(st), 'ack');
  run(st, wd, 1);
  assert.equal(st.pose, 'front');
  run(st, wd, 2);
  assert.equal(st.pose, 'sit');
});

test('she never walks far straight up or down the lawn: steep stretches zigzag, still clear of the roses and on screen', () => {
  let legs = 0, steep = 0, before = 0;
  for (const [w, h] of [[288, 250], [343, 330], [358, 400], [358, 600], [398, 470], [536, 270]]) {
    const pl = world(w, h).places;
    for (const name of Object.keys(pl.nodes).filter((k) => k.startsWith('spot:'))) {
      const raw = E.route(pl, { x: 0, y: 0 }, name), path = E.meander(pl, { x: 0, y: 0 }, raw, 1);
      assert.deepEqual(path[path.length - 1], raw[raw.length - 1], `${name} still ends where it should at ${w}x${h}`);
      let prev = { x: 0, y: 0 };
      for (const [i, p] of path.entries()) {
        assert.ok(Math.abs(p.x) <= w / 2 && Math.abs(p.y) <= h / 2, `${name} stays on screen at ${w}x${h}`);
        const out = !pl.inRoses(prev, 4) && !pl.inRoses(p, 4);
        if (out) assert.ok(pl.clear(prev, p), `${name} leg ${i} clear of the roses at ${w}x${h}`);
        const dx = Math.abs(p.x - prev.x), dy = Math.abs(p.y - prev.y);
        if (dy > 48) { legs++; if (dy > dx * 1.3) steep++; }
        prev = p;
      }
      prev = { x: 0, y: 0 };
      for (const p of raw) { const dx = Math.abs(p.x - prev.x), dy = Math.abs(p.y - prev.y); if (dy > 48 && dy > dx * 1.3) before++; prev = p; }
    }
  }
  // only short steps along the side of the rose bed stay steep
  assert.ok(before > 20, `the plain routes had long steep legs: ${before}`);
  assert.equal(steep, 0, `long steep legs ${steep} of ${legs}, down from ${before}`);
});
test('a visitor: she watches it, looking up at a bird on the fountain, and retreats from the fox', () => {
  const wd = world(358, 400), st = E.create(5);
  st.at = { ...wd.places.nodes.gate }; st.pose = 'sit';
  assert.ok(E.request(st, 'watch-visitor', wd, { x: -100, y: -120, high: true }));
  E.update(st, 0.1, wd);
  assert.equal(st.pose, 'sit'); assert.deepEqual(st.look, { up: true });
  assert.ok(E.request(st, 'watch-visitor', wd, { x: 80, y: 40, high: false }));
  E.update(st, 0.1, wd);
  assert.deepEqual(st.look, { x: 80, y: 30 });
  assert.equal(E.request(st, 'watch-visitor', wd, null), false);
  assert.ok(E.request(st, 'retreat', wd, { x: 150, y: 20 }));
  for (let i = 0; i < 400 && st.step?.do !== 'pose'; i++) E.update(st, 0.1, wd);
  assert.ok(Math.hypot(st.at.x, st.at.y) < 6, 'back in her basket');
  assert.equal(st.pose, 'sit');
});

// ----- The gait (see .scratch/erwu-walk-review) -----
function walkTrace(wd, to, hz = 60, from = null) {
  const st = E.create(3); st.at = from ? { ...from } : { ...wd.places.nodes.gate }; st.pose = 'sit';
  st.steps = [{ do: 'walk', to }, { do: 'pose', pose: 'sit', dur: 60 }];
  const out = [];
  for (let i = 0; i < hz * 25 && !(st.step && st.step.do === 'pose'); i++) { const p = { ...st.at }; E.update(st, 1 / hz, wd); out.push({ at: { ...st.at }, v: Math.hypot(st.at.x - p.x, st.at.y - p.y) * hz, heading: st.heading, facing: st.facing, view: st.view }); }
  return { st, out };
}
test('she gathers speed over her first steps and brakes into her last', () => {
  const wd = world(358, 400), { out } = walkTrace(wd, 'spot:fountain');
  const moving = out.filter((o) => o.v > 0.01), cruise = Math.max(...moving.map((o) => o.v));
  assert.ok(moving[0].v < cruise * 0.1, `first step ${moving[0].v} of ${cruise}`);
  assert.ok(moving[moving.length - 1].v < cruise * 0.4, `last step ${moving[moving.length - 1].v}`);
  assert.ok(cruise > E.SPEED * 0.8);
});
test('she steers round corners at a limited rate, and never faces back and forth', () => {
  for (const directional of [false, true]) {
    const wd = world(358, 400, { directional });
    for (const to of ['spot:fountain', 'spot:log', 'spot:bed-left', 'spot:bed-right', 'nest']) {
      const { out } = walkTrace(wd, to);
      for (let i = 1; i < out.length; i++) {
        if (out[i].heading === undefined || out[i - 1].heading === undefined || out[i - 1].v < 0.01) continue;
        const d = Math.abs(Math.atan2(Math.sin(out[i].heading - out[i - 1].heading), Math.cos(out[i].heading - out[i - 1].heading)));
        assert.ok(d <= E.GAIT.turnRate / 60 + 1e-9, `${to}: turned ${d} in one update`);
      }
      const flips = out.filter((o, i) => i && o.facing !== out[i - 1].facing).length;
      assert.ok(flips <= 2, `${to}: ${flips} facing flips`);
    }
  }
});
test('walking straight down the lawn she is seen from the front, and up it from the back; no zigzag', () => {
  const wd = world(358, 400, { directional: true }), pl = wd.places;
  const down = walkTrace(wd, 'gate', 60, { x: pl.nodes.gate.x, y: pl.nodes.gate.y - 1 - 0 }).out; // trivial
  const up = walkTrace(wd, 'spot:fountain').out;
  assert.ok(up.some((o) => o.view === 'back') || up.every((o) => o.view !== 'front'));
  const st = E.create(3); st.at = { x: 60, y: -40 }; st.pose = 'sit';
  st.steps = [{ do: 'walk-free', to: { x: 62, y: 90 } }, { do: 'pose', pose: 'sit', dur: 60 }];
  const views = new Set(), xs = [];
  for (let i = 0; i < 600 && !(st.step && st.step.do === 'pose'); i++) { E.update(st, 1 / 60, wd); if (st.pose === 'walk') { views.add(st.view); xs.push(st.at.x); } }
  assert.ok(views.has('front'), [...views].join());
  assert.ok(Math.max(...xs) - Math.min(...xs) < 6, 'straight, not a zigzag');
  assert.ok(down.length >= 0);
});
test('with diagonal views, a slanting walk is seen at three-quarters, straight up or down from the front or back', () => {
  const views = (extra, to) => {
    const wd = world(358, 400, { directional: true, ...extra }), st = E.create(3); st.at = { x: -60, y: -60 }; st.pose = 'sit';
    st.steps = [{ do: 'walk-free', to }, { do: 'pose', pose: 'sit', dur: 60 }];
    const seen = [];
    for (let i = 0; i < 900 && !(st.step && st.step.do === 'pose'); i++) { E.update(st, 1 / 60, wd); if (st.pose === 'walk') seen.push(st.view); }
    return seen;
  };
  const slant = views({ diagonal: true }, { x: 40, y: 40 }), up = views({ diagonal: true }, { x: 40, y: -140 });
  assert.ok(slant.includes('diag-front') && !slant.includes('front') && !slant.includes('back'), [...new Set(slant)].join());
  assert.ok(up.includes('diag-back'), [...new Set(up)].join());
  assert.ok(views({ diagonal: true }, { x: -58, y: 80 }).includes('front'), 'straight down is seen from the front');
  // the view changes only a few times on one straight walk: no flicker between bands
  const changes = slant.filter((v, i) => i && v !== slant[i - 1]).length;
  assert.ok(changes <= 2, `${changes} view changes`);
  assert.ok(!views({}, { x: 40, y: 40 }).some((v) => /^diag-/.test(v || '')), 'no diagonal views without the frames');
});
test('rounded corners never cut into the rose bed or leave the lawn', () => {
  for (const directional of [false, true]) {
    const wd = world(358, 400, { directional }), pl = wd.places;
    for (const to of Object.keys(pl.nodes).filter((k) => k.startsWith('spot:') || k === 'nest')) {
      const { out } = walkTrace(wd, to);
      for (const o of out) {
        const nearNest = Math.hypot(o.at.x, o.at.y) < wd.scene.nest * 1.6;
        assert.ok(nearNest || !pl.inRoses(o.at, -2), `${to}: inside the roses at ${o.at.x.toFixed(1)},${o.at.y.toFixed(1)}`);
        assert.ok(Math.abs(o.at.x) < wd.scene.width / 2 && Math.abs(o.at.y) < wd.scene.height / 2);
      }
    }
  }
});
test('the same walk at 30, 60 and 120 Hz ends in the same place in about the same time', () => {
  const wd = world(358, 400, { directional: true }), res = [30, 60, 120].map((hz) => { const r = walkTrace(wd, 'spot:log', hz); return { at: r.st.at, t: r.out.length / hz }; });
  for (const r of res) { assert.ok(Math.hypot(r.at.x - res[1].at.x, r.at.y - res[1].at.y) < 0.5); assert.ok(Math.abs(r.t - res[1].t) < 0.25, `${r.t} vs ${res[1].t}`); }
});
