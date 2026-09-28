/* Erwu in the garden: where she can go, what she chooses to do, and how she responds.
   Pure state and geometry; no canvas or browser globals. Time is in seconds of real
   garden time (never scaled by Breeze), and every choice comes from a seeded source. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomErwu = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const TAU = Math.PI * 2;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ----- Where she can go -----
  // A small authored network around the rose bed: out of the basket to the gate at the
  // front, round the sides (never behind the roses), and short spurs to each place.
  function places(scene, anchors, marks) {
    const r = marks.roses, rx = r.rx + 20, ry = r.ry + 16;
    const ring = (deg) => ({ x: r.x + Math.cos(deg * Math.PI / 180) * rx, y: r.y + Math.sin(deg * Math.PI / 180) * ry });
    const nodes = {
      nest: { x: 0, y: 0 },
      gate: { x: 0, y: r.y + r.ry + 12 },
      'front-left': ring(128), 'front-right': ring(52),
      left: ring(180), right: ring(0),
      'back-left': ring(212), 'back-right': ring(328),
    };
    const edges = [['nest', 'gate'], ['gate', 'front-left'], ['gate', 'front-right'], ['front-left', 'left'], ['front-right', 'right'],
      ['left', 'back-left'], ['right', 'back-right']];
    const spots = {};
    const clampIn = (p) => ({ x: Math.max(-scene.width / 2 + 16, Math.min(scene.width / 2 - 16, p.x)), y: Math.max(-scene.height / 2 + 20, Math.min(scene.height / 2 - 10, p.y)) });
    for (const a of anchors) {
      const approach = clampIn(a.type === 'patch' ? { x: a.x + (a.x < -4 ? 26 : a.x > 4 ? -26 : 34), y: a.y + 22 } : { x: a.x + (a.x < 0 ? 30 : -30), y: a.y + 4 });
      spots[a.id] = { approach, rest: { x: a.x, y: a.y - 4 }, type: a.type };
    }
    spots.fountain = { approach: clampIn({ x: marks.fountain.x + marks.fountain.width * 0.7, y: marks.fountain.y + 8 }), look: { x: marks.fountain.x, y: marks.fountain.y - marks.fountain.height * 0.8 } };
    spots.log = { approach: clampIn({ x: marks.deadwood.x + marks.deadwood.width * 0.05, y: marks.deadwood.y + 16 }), look: { x: marks.deadwood.x, y: marks.deadwood.y - marks.deadwood.height * 0.5 } };
    const inRoses = (p, pad = 0) => ((p.x - r.x) / (r.rx + pad)) ** 2 + ((p.y - r.y) / (r.ry + pad)) ** 2 < 1;
    const clear = (a, b) => { for (let t = 0.08; t < 0.93; t += 0.06) if (inRoses({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, 2)) return false; return true; };
    // each spot joins the nearest ring nodes it can reach without crossing the roses
    for (const [id, sp] of Object.entries(spots)) {
      const name = 'spot:' + id;
      nodes[name] = sp.approach;
      const near = Object.keys(nodes).filter((k) => !k.startsWith('spot:') && k !== 'nest' && clear(sp.approach, nodes[k]))
        .sort((a, b) => dist(nodes[a], sp.approach) - dist(nodes[b], sp.approach)).slice(0, 2);
      for (const k of near) edges.push([name, k]);
    }
    return { nodes, edges, spots, roses: r, inRoses, clear, scene };
  }
  // Shortest path along the network from a free position to a named node.
  function route(pl, from, to) {
    const { nodes, edges } = pl;
    if (!nodes[to]) return [];
    const adj = {};
    const link = (a, b) => { const d = dist(nodes[a], nodes[b]); (adj[a] = adj[a] || []).push([b, d]); (adj[b] = adj[b] || []).push([a, d]); };
    for (const [a, b] of edges) link(a, b);
    // join the start to every node it can see (the nest only from the basket itself)
    const inNest = dist(from, nodes.nest) < 6;
    nodes.__start = from; adj.__start = [];
    for (const k of Object.keys(nodes)) {
      if (k === '__start') continue;
      if (inNest ? k === 'nest' : (k !== 'nest' && pl.clear(from, nodes[k]))) adj.__start.push([k, dist(from, nodes[k])]);
    }
    const best = { __start: 0 }, prev = {}, open = new Set(['__start']);
    while (open.size) {
      let u = null;
      for (const k of open) if (u === null || best[k] < best[u]) u = k;
      open.delete(u);
      if (u === to) break;
      for (const [v, d] of adj[u] || []) {
        if (best[u] + d < (best[v] ?? Infinity)) { best[v] = best[u] + d; prev[v] = u; open.add(v); }
      }
    }
    delete nodes.__start;
    if (best[to] === undefined) return [];
    const path = [];
    for (let k = to; k && k !== '__start'; k = prev[k]) path.unshift({ ...nodes[k] });
    return path;
  }

  // She is only ever drawn from the side, so a stretch straight up or down the lawn looked
  // like a moonwalk. Steep stretches become a lazy zigzag instead, each leg no steeper than
  // MAX_SLOPE (rise over run), never through the roses and never off the lawn.
  const MAX_SLOPE = 0.75;
  function meander(pl, from, path, facing = 1) {
    const out = [];
    let a = from, side = facing >= 0 ? 1 : -1;
    const sc = pl.scene, onLawn = (q) => Math.abs(q.x) < sc.width / 2 - 16 && q.y > -sc.height / 2 + 20 && q.y < sc.height / 2 - 10;
    for (const b of path) {
      const dx = b.x - a.x, dy = b.y - a.y, rise = Math.abs(dy);
      // stepping out of the basket she crosses her own rose bed, so that leg may bend inside it
      const fromNest = pl.nodes && pl.nodes.nest && dist(a, pl.nodes.nest) < 6;
      if (rise > 14 && rise > Math.abs(dx) * MAX_SLOPE && (fromNest || !pl.inRoses(a, 4) && !pl.inRoses(b, 4))) {
        const n = Math.max(1, Math.ceil(rise / 55)), off = rise / n / MAX_SLOPE * 0.55;
        if (Math.abs(dx) > 4) side = dx > 0 ? 1 : -1;
        // each turning point swings out to alternate sides; where the lawn is too narrow (beside
        // the roses, near its edge) it swings less, the other way, or not at all
        const ok = (q, prev) => onLawn(q) && (fromNest || !pl.inRoses(q, 6) && pl.clear(prev, q));
        let prev = a, sd = side;
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n, base = { x: a.x + dx * t, y: a.y + dy * t };
          const edge = sc.width / 2 - 17, clampX = (x) => Math.max(-edge, Math.min(edge, x));
          // of the turning points that fit, the one whose legs are least steep (the preferred
          // side wins ties, so the zigzag keeps alternating)
          const steep = (u, v) => Math.abs(v.y - u.y) / (Math.abs(v.x - u.x) + 1);
          const q = [sd, sd * 0.6, 'edge', -sd, -sd * 0.6, 0].map((k) => k === 'edge' ? { x: clampX(base.x + sd * off), y: base.y, k: sd }
            : { x: base.x + k * off, y: base.y, k }).filter((c) => ok(c, prev))
            .map((c) => ({ c, cost: Math.max(steep(prev, c), i === n - 1 ? steep(c, b) : 0) - (Math.sign(c.k) === sd ? 0.05 : 0) }))
            .sort((u, v) => u.cost - v.cost).map((u) => u.c)[0];
          if (!q) break;
          // the next turn swings back across from wherever this one went
          if (q.k) sd = q.k > 0 ? -1 : 1;
          delete q.k; out.push(q); prev = q;
        }
        // the last leg must not cut through the roses either
        while (!fromNest && out.length && out[out.length - 1] === prev && !pl.clear(prev, b)) { out.pop(); prev = out.length ? out[out.length - 1] : a; }
      }
      out.push(b); a = b;
    }
    return out;
  }

  // ----- What she does -----
  // Each action is a short list of steps. Weights, cooldowns and a short memory keep
  // her from repeating herself; doing nothing much is always an option.
  const ACTIONS = {
    nap: { weight: 1, cooldown: 40 },
    'sniff-bed': { weight: 3, cooldown: 14 },
    cushion: { weight: 2, cooldown: 30 },
    'sun-stone': { weight: 2, cooldown: 30 },
    fountain: { weight: 1.5, cooldown: 35 },
    log: { weight: 1, cooldown: 40 },
    wander: { weight: 1.5, cooldown: 10 },
    stretch: { weight: 1, cooldown: 45 },
    'sit-quietly': { weight: 2, cooldown: 6 },
    stalk: { weight: 5, cooldown: 25 },
  };
  function create(seed = 1) {
    let s = seed | 0;
    const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return { rnd, at: { x: 0, y: 0 }, facing: 1, pose: 'curl', poseAge: 0, prevPose: 'curl', phase: 0, action: null, steps: [], step: null, t: 0,
      cooldowns: {}, history: [], events: [], look: null, blink: 0, ackT: 0, lastTap: -99, clock: 0, reason: 'asleep in the basket', paused: false };
  }
  const setPose = (st, pose) => { if (st.pose !== pose) { st.prevPose = st.pose; st.pose = pose; st.poseAge = 0; } };
  // Build an action's steps from the current world, or null if it isn't possible now.
  function plan(st, name, w, arg) {
    const pl = w.places, rnd = st.rnd, sp = pl.spots;
    const walkTo = (node) => ({ do: 'walk', to: node });
    switch (name) {
      case 'nap': {
        const homes = ['nest', ...w.objects.filter((o) => o.anchor && sp[o.anchor]).map((o) => o.anchor)];
        const home = homes[Math.floor(rnd() * homes.length)];
        if (home === 'nest') return [walkTo('nest'), { do: 'pose', pose: 'curl', dur: 25 + rnd() * 35 }, { do: 'pose', pose: 'yawn', dur: 1.4 }];
        return [walkTo('spot:' + home), { do: 'hop', to: sp[home].rest }, { do: 'pose', pose: 'curl', dur: 20 + rnd() * 30 }, { do: 'pose', pose: 'yawn', dur: 1.4 }];
      }
      case 'sniff-bed': {
        const beds = w.beds.filter((b) => b.planted && sp[b.anchor] && !(st.cooldowns['bed:' + b.id] > st.clock));
        if (!beds.length) return null;
        const bed = arg ? beds.find((b) => b.id === arg) || beds[0] : beds[Math.floor(rnd() * beds.length)];
        st.cooldowns['bed:' + bed.id] = st.clock + 30;
        const look = { x: sp[bed.anchor].rest.x, y: sp[bed.anchor].rest.y - 14 };
        return [walkTo('spot:' + bed.anchor), { do: 'pose', pose: 'sniff', dur: 2.2 + rnd(), look }, { do: 'pose', pose: 'sit', dur: 3 + rnd() * 4, look }];
      }
      case 'cushion': case 'sun-stone': {
        // wherever that furnishing has been arranged; nowhere if it's put away
        const obj = w.objects.find((o) => o.kind === (name === 'cushion' ? 'cushion' : 'stone') && o.anchor);
        const k = obj && obj.anchor;
        if (!k || !sp[k]) return null;
        return [walkTo('spot:' + k), { do: 'hop', to: sp[k].rest }, { do: 'pose', pose: 'loaf', dur: 10 + rnd() * 14 }];
      }
      case 'fountain': return [walkTo('spot:fountain'), { do: 'pose', pose: 'sit', dur: 5 + rnd() * 4, look: sp.fountain.look }];
      case 'log': return [walkTo('spot:log'), { do: 'pose', pose: 'sniff', dur: 2 + rnd(), look: sp.log.look }, { do: 'pose', pose: 'sit', dur: 3 + rnd() * 3, look: sp.log.look }];
      case 'wander': {
        const opts = ['gate', 'front-left', 'front-right', 'left', 'right'];
        return [walkTo(opts[Math.floor(rnd() * opts.length)]), { do: 'pose', pose: 'sit', dur: 4 + rnd() * 5 }];
      }
      case 'stretch': return [{ do: 'pose', pose: 'stretch', dur: 1.8 }, { do: 'pose', pose: 'yawn', dur: 1.3 }];
      case 'sit-quietly': return [{ do: 'pose', pose: st.pose === 'curl' ? 'curl' : 'sit', dur: 4 + rnd() * 5 }];
      case 'stalk': {
        // a butterfly resting within reach: creep up, crouch and wiggle, pounce, watch it go.
        // Positions are read live when each step begins, so a moving butterfly is followed.
        const v = arg ? w.visitors.find((x) => x.id === arg) : w.visitors.filter((x) => x.landed && !pl.inRoses(x, 10)).sort((a, b) => dist(a, st.at) - dist(b, st.at))[0];
        if (!v || (!arg && pl.inRoses(v, 10))) return null;
        return [{ do: 'approach', visitor: v.id, gap: 34, slow: true }, { do: 'pose', pose: 'crouch', dur: 1.4 + rnd() * 1.4, visitor: v.id },
          { do: 'pounce', dur: 0.55, visitor: v.id }, { do: 'pose', pose: 'sit', dur: 2.2, lookUp: true }, { do: 'pose', pose: 'sit', dur: 1.8 }];
      }
      case 'visit-bloom': {
        // ticket 07: the first time a bed she hasn't seen is in flower
        const bed = w.beds.find((b) => b.id === arg);
        if (!bed || !sp[bed.anchor]) return null;
        const look = { x: sp[bed.anchor].rest.x, y: sp[bed.anchor].rest.y - 16 };
        return [{ do: 'pose', pose: 'sit', dur: 1.4, look }, walkTo('spot:' + bed.anchor), { do: 'pose', pose: 'sniff', dur: 2.6, look },
          { do: 'pose', pose: 'sit', dur: 2.5, look }];
      }
      case 'greet': // ticket 08: back from time away — wake, stretch, come to the front, say hello
        return [{ do: 'pose', pose: 'curl', dur: 1.6 }, { do: 'pose', pose: 'yawn', dur: 1.3 }, { do: 'pose', pose: 'stretch', dur: 1.6 },
          walkTo('gate'), { do: 'pose', pose: 'front', dur: 3.5, blink: true }];
      case 'home': return [walkTo('nest'), { do: 'pose', pose: 'curl', dur: 20 + rnd() * 20 }];
    }
    return null;
  }
  function choose(st, w) {
    const opts = [];
    for (const [name, a] of Object.entries(ACTIONS)) {
      if ((st.cooldowns[name] || 0) > st.clock) continue;
      let weight = a.weight;
      if (name === 'nap') weight *= (1 + w.rest * 6 + (st.clock - (st.lastNap ?? 0) > 120 ? 1.5 : 0)) *
        // just visited and the garden is awake: she's unlikely to go straight back to sleep
        (st.clock - (st.entered ?? -99) < 45 && w.rest < 0.4 ? 0.15 : 1);
      else if (w.rest > 0.4 && name !== 'sit-quietly') weight *= 0.4;
      if (name === 'stalk' && !w.visitors.some((v) => v.landed && !w.places.inRoses(v, 10))) continue;
      if (name === 'sniff-bed' && !w.beds.some((b) => b.planted)) continue;
      const recent = st.history.slice(-3).filter((h) => h === name).length;
      weight *= recent ? 0.25 ** recent : 1;
      opts.push([name, weight]);
    }
    let total = opts.reduce((t, [, x]) => t + x, 0), pick = st.rnd() * total;
    for (const [name, weight] of opts) {
      pick -= weight;
      if (pick <= 0) { const steps = plan(st, name, w); if (steps) return [name, steps]; }
    }
    return ['sit-quietly', plan(st, 'sit-quietly', w)];
  }
  function start(st, name, steps, reason) {
    st.action = name; st.steps = steps.slice(); st.step = null; st.reason = reason || name;
    st.history.push(name); if (st.history.length > 8) st.history.shift();
    if (ACTIONS[name]) st.cooldowns[name] = st.clock + ACTIONS[name].cooldown;
    if (name === 'nap') st.lastNap = st.clock;
  }
  // Scripted or developer-requested actions go straight to the front of the queue.
  function request(st, name, w, arg, reason) {
    const steps = plan(st, name, w, arg);
    if (!steps) return false;
    start(st, name, steps, reason || `asked: ${name}`);
    return true;
  }
  const SPEED = 34; // px per second at full size, an unhurried stroll; the walk cycle is driven by distance, so feet don't slide
  // Add an action after whatever she's doing now (for short scripted sequences).
  function queue(st, name, w, arg, reason) {
    const steps = plan(st, name, w, arg);
    if (!steps) return false;
    st.steps.push({ do: 'begin', name, reason: reason || name }, ...steps);
    return true;
  }
  function update(st, dt, w) {
    dt = Math.max(0, Math.min(dt, 0.1)); // never replay a backlog after the page was away
    st.clock += dt; st.poseAge += dt; st.blink = Math.max(0, st.blink - dt);
    if (st.paused) { if (st.pose === 'walk') setPose(st, 'sit'); return st; }
    if (st.ackT > 0) {
      // she's pausing to look at you; afterwards she goes back to what she was doing
      st.ackT = Math.max(0, st.ackT - dt);
      if (st.ackT === 0 && st.step && st.step.do === 'pose') setPose(st, st.step.pose);
      return st;
    }
    if (!st.step) {
      if (!st.steps.length) { const [name, steps] = choose(st, w); start(st, name, steps, 'chose ' + name); }
      st.step = { ...st.steps.shift(), t: 0 };
      const s = st.step;
      if (s.do === 'begin') { start(st, s.name, st.steps, s.reason); st.step = null; return st; }
      const v = s.visitor && w.visitors.find((x) => x.id === s.visitor);
      if (s.visitor && !v) { st.steps = st.steps.filter((x) => !x.visitor); st.step = null; st.reason = 'the butterfly left'; return st; }
      if (s.do === 'walk') s.path = meander(w.places, st.at, route(w.places, st.at, s.to), st.facing);
      if (s.do === 'walk-free') s.path = meander(w.places, st.at, [s.to], st.facing);
      if (s.do === 'approach') {
        const side = v.x >= st.at.x ? -1 : 1, near = { x: v.x + side * s.gap, y: v.y + 14 };
        s.path = w.places.inRoses(near, 6) ? route(w.places, st.at, 'gate').concat([near]) : [near];
        s.do = 'walk-free';
      }
      if (s.do === 'pounce') { s.to = { x: v.x + (v.x >= st.at.x ? -8 : 8), y: v.y + 12 }; st.facing = v.x >= st.at.x ? 1 : -1; }
      if (s.do === 'hop' || s.do === 'pounce') s.from = { ...st.at };
      if (s.do === 'pose') setPose(st, s.pose);
      if (s.blink) st.blink = 0.4;
    }
    const s = st.step;
    s.t += dt;
    if (s.do === 'walk' || s.do === 'walk-free') {
      if (!s.path.length) { st.step = null; return st; }
      setPose(st, 'walk');
      const target = s.path[0], d = dist(st.at, target), step = SPEED * (s.slow ? 0.45 : 1) * w.scaleAt(st.at.y) * dt;
      if (Math.abs(target.x - st.at.x) > 2) st.facing = target.x > st.at.x ? 1 : -1;
      if (d <= step) { st.phase += d / (w.stride * w.scaleAt(st.at.y)) * TAU; st.at = { ...target }; s.path.shift(); }
      else { st.at.x += (target.x - st.at.x) / d * step; st.at.y += (target.y - st.at.y) / d * step; st.phase += step / (w.stride * w.scaleAt(st.at.y)) * TAU; }
      st.look = null;
      if (s.t > 30) st.step = null; // never wander forever
      return st;
    }
    if (s.do === 'hop') {
      setPose(st, 'walk');
      const k = Math.min(1, s.t / 0.45);
      st.at = { x: s.from.x + (s.to.x - s.from.x) * k, y: s.from.y + (s.to.y - s.from.y) * k };
      if (k >= 1) st.step = null;
      return st;
    }
    if (s.do === 'pounce') {
      setPose(st, 'pounce');
      const k = Math.min(1, s.t / s.dur);
      st.at = { x: s.from.x + (s.to.x - s.from.x) * k, y: s.from.y + (s.to.y - s.from.y) * k };
      st.jump = Math.sin(k * Math.PI);
      if (!s.fired && k > 0.4) { s.fired = true; st.events.push({ type: 'scare', visitor: s.visitor }); }
      if (k >= 1) { st.jump = 0; st.step = null; }
      return st;
    }
    // holding a pose
    st.look = s.lookUp ? { up: true } : s.look ? { ...s.look } : null;
    if (s.visitor) {
      const v = w.visitors.find((x) => x.id === s.visitor);
      if (!v) { st.steps = st.steps.filter((x) => !x.visitor); st.step = null; st.reason = 'the butterfly left'; return st; }
      st.look = { x: v.x, y: v.y }; st.facing = v.x >= st.at.x ? 1 : -1;
    }
    if (st.look && st.look.x !== undefined && Math.abs(st.look.x - st.at.x) > 8) st.facing = st.look.x > st.at.x ? 1 : -1;
    if (s.t >= s.dur) st.step = null;
    return st;
  }
  // A tap: she stops, turns to you with a slow blink, then carries on. Sleeping, she
  // wakes and sits up. Taps close together don't stack.
  function tap(st) {
    if (st.clock - st.lastTap < 1.2) return null;
    st.lastTap = st.clock;
    st.events.push({ type: 'purr' });
    if (st.pose === 'curl') {
      st.steps = [{ do: 'pose', pose: 'front', dur: 4, blink: true }, { do: 'pose', pose: 'sit', dur: 3 }];
      st.step = null; st.action = 'greeted'; st.reason = 'woken by a hello';
      return 'wake';
    }
    setPose(st, 'front'); st.ackT = 2.2; st.blink = 0.5;
    // resume what she was doing afterwards; a walk re-routes from where she stopped
    if (st.step && (st.step.do === 'walk' || st.step.do === 'walk-free')) { st.steps.unshift({ do: st.step.do, to: st.step.to, slow: st.step.slow }); st.step = null; }
    return 'ack';
  }
  // Something she was heading for moved or went away: drop it and choose again.
  function invalidate(st, what) {
    const uses = (s) => s && (s.to === 'spot:' + what || s.visitor === what);
    if (uses(st.step) || st.steps.some(uses)) { st.steps = []; st.step = null; st.reason = `${what} changed`; setPose(st, st.pose === 'walk' ? 'sit' : st.pose); }
  }
  // Put her somewhere definite (entering the garden, leaving for play).
  function reset(st, how = 'asleep') {
    st.at = { x: 0, y: 0 }; st.facing = 1; st.steps = []; st.step = null; st.ackT = 0; st.jump = 0; st.paused = false; st.entered = st.clock;
    st.pose = st.prevPose = 'curl'; st.poseAge = 1;
    const doze = how === 'asleep' ? 6 + st.rnd() * 6 : 2;
    st.steps = [{ do: 'pose', pose: 'curl', dur: doze }];
    st.action = 'doze'; st.reason = how === 'asleep' ? 'asleep in the basket' : how;
  }
  function info(st) {
    const cds = Object.entries(st.cooldowns).filter(([, t]) => t > st.clock).map(([k, t]) => `${k} ${Math.ceil(t - st.clock)}s`);
    return { action: st.action, step: st.step ? (st.step.do === 'pose' ? st.step.pose : st.step.do) : '', pose: st.pose, reason: st.reason,
      at: `${Math.round(st.at.x)},${Math.round(st.at.y)}`, cooldowns: cds };
  }
  return { places, route, meander, MAX_SLOPE, create, update, tap, request, queue, invalidate, reset, info, ACTIONS, SPEED };
});
