// Stages exactly what the game needs to run offline into www/, the folder the iOS app bundles.
//   node tools/stage-web.cjs            (or: npm run stage)
// Everything shipped is on the list below. Anything else in the repo (.scratch, source art
// sheets, reference material, tests, tools) never reaches the app. Writes a payload inventory
// with sizes and SHA-256 hashes to build/payload-inventory.json, and fails if a listed file is
// missing or a staged page still reaches out to the network.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');

const FILES = [
  'index.html',
  'manifest.webmanifest',
  // game modules, in the order index.html loads them
  'garden-layout.js', 'garden-beds.js', 'garden-time.js', 'garden-visits.js', 'garden-sound.js', 'garden-state.js', 'run-state.js', 'garden-view.js', 'erwu-behavior.js', 'art-manifest.js',
  // packed runtime art (built from the source sheets by tools/build-art.cjs)
  'assets/erwu.webp', 'assets/garden.webp', 'assets/play.webp', 'assets/visitors.webp',
  'assets/garden-plate-spring.webp', 'assets/garden-plate-summer.webp', 'assets/garden-plate-autumn.webp', 'assets/garden-plate-winter.webp',
  // bundled fonts and their licences
  'fonts/fonts.css', 'fonts/fraunces.woff2', 'fonts/bricolage-grotesque.woff2', 'fonts/OFL-Fraunces.txt', 'fonts/OFL-Bricolage-Grotesque.txt',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

function stage() {
  const missing = FILES.filter((f) => !fs.existsSync(path.join(root, f)));
  if (missing.length) throw new Error(`missing from the package: ${missing.join(', ')}`);
  // every art file the manifest names must be on the list
  const art = require(path.join(root, 'art-manifest.js'));
  for (const k of ['erwu', 'garden', 'play', 'visitors', 'lawn']) {
    if (!FILES.includes(art[k].src)) throw new Error(`art-manifest names ${art[k].src}, which is not packaged`);
  }
  for (const src of Object.values(art.lawn.seasons || {})) if (!FILES.includes(src)) throw new Error(`art-manifest names ${src}, which is not packaged`);
  // no runtime network: pages and styles must not load anything from another origin
  for (const f of FILES.filter((f) => /\.(html|css|js|webmanifest)$/.test(f))) {
    const text = fs.readFileSync(path.join(root, f), 'utf8');
    const remote = text.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+|url\(\s*["']?https?:\/\/[^)"']+|@import\s+["']?https?:\/\/\S+/i);
    if (remote) throw new Error(`${f} loads from the network: ${remote[0]}`);
  }
  fs.rmSync(out, { recursive: true, force: true });
  const inventory = [];
  for (const f of [...FILES].sort()) {
    const from = path.join(root, f), to = path.join(out, f), data = fs.readFileSync(from);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, data);
    inventory.push({ path: f, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') });
  }
  const total = inventory.reduce((a, f) => a + f.bytes, 0);
  // the payload's own hash: the same files, bytes and paths give the same hash on any machine
  const payload = crypto.createHash('sha256').update(inventory.map((f) => `${f.path}\0${f.sha256}\n`).join('')).digest('hex');
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  fs.writeFileSync(path.join(root, 'build', 'payload-inventory.json'), JSON.stringify({ payload, files: inventory.length, bytes: total, inventory }, null, 2) + '\n');
  return { payload, files: inventory.length, bytes: total };
}

if (require.main === module) {
  const r = stage();
  console.log(`staged ${r.files} files, ${(r.bytes / 1024).toFixed(0)} KB into www/ · payload ${r.payload.slice(0, 16)}`);
}
module.exports = { FILES, stage };
