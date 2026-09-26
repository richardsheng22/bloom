/* Presentation decisions and semantic garden projection; neither changes run data. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BloomGardenView = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function request(phase, pending) {
    if (phase === 'flying' || phase === 'advancing') return { enter: false, pending: !pending };
    return { enter: true, pending: false };
  }
  function layout(rect) {
    const radius = Math.max(20, Math.min(rect.width, rect.height) / 2 - 12);
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2,
      width: rect.width, height: rect.height, radius, nest: Math.min(64, radius * 0.34),
      rx: Math.max(18, rect.width / 2 - 28), ry: Math.max(18, rect.height / 2 - 46) };
  }
  function project(plant, scene) {
    const distance = Math.max(0, Math.min(1, (plant.d - 1) / 1.6));
    const innerX = Math.min(scene.rx, scene.nest + 30), innerY = Math.min(scene.ry, scene.nest + 30);
    return { x: Math.cos(plant.a) * (innerX + (scene.rx - innerX) * distance),
      y: Math.sin(plant.a) * (innerY + (scene.ry - innerY) * distance) };
  }
  function nearest(plants, scene, x, y, plantUnit = 12, projector = project) {
    let found = null, distance = 23;
    for (const plant of plants) {
      const p = projector(plant, scene);
      // Aim at the visible stem/head, not only the ground under it.
      const d = Math.hypot(p.x - x, p.y - plantUnit * (0.5 + 1.9 * plant.g) * 0.55 - y);
      if (d < distance) { found = plant; distance = d; }
    }
    return found;
  }
  return { request, layout, project, nearest };
});
