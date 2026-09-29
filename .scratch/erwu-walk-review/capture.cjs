// Production renderer contact sheet; no hooks are shipped in the game.
const { chromium } = require(process.env.BLOOM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs'), http = require('node:http'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const { KEY, gardenV4 } = require(path.join(root, 'tests/fixtures/garden-v4.cjs'));
const hook = `
  let walkTrace = [];
  const originalPaintPiece = paintPiece;
  paintPiece = function(...args) { if (args[1] === 'erwu') walkTrace.push({ frame: args[2], opacity: args[7] ?? 1 }); return originalPaintPiece(...args); };
  window.__walk = {
    ready: () => !!(artImage('erwu') && artImage('garden') && artImage('lawn')),
    render: (fraction) => {
      Object.assign(erwu, { at: {x:0,y:100}, phase: fraction / 8 * TAU, pose:'walk', prevPose:'walk', poseAge:2, facing:1 });
      ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
      ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2-60); walkTrace=[];
      drawPaintedErwu('walk',1000,125,1); ctx.restore();
      return { trace: walkTrace, source: ctx.canvas };
    }
  };
`;
(async () => {
  const server = http.createServer((req,res) => {
    const name = req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0].slice(1);
    if (!/^(index\.html|[\w-]+\.js|manifest\.webmanifest|(?:assets|fonts)\/[\w.-]+)$/.test(name)) { res.writeHead(404).end(); return; }
    const file = path.join(root,name); if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'}[path.extname(name)] || 'application/octet-stream');
    res.end(name === 'index.html' ? fs.readFileSync(file,'utf8').replace('  window.claude?.hot?.snapshot?',hook+'\n  window.claude?.hot?.snapshot?') : fs.readFileSync(file));
  }).listen(0,'127.0.0.1');
  await new Promise(r=>server.on('listening',r)); let browser;
  try {
    browser = await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM,args:['--no-sandbox']});
    const page = await browser.newPage({viewport:{width:1000,height:720}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(([key,data])=>localStorage.setItem(key,data),[KEY,gardenV4()]);
    await page.goto(`http://127.0.0.1:${server.address().port}`); await page.waitForFunction(()=>__walk.ready());
    const result = await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{value:true,configurable:true});
      const c=document.createElement('canvas'); c.width=1200;c.height=640;
      const g=c.getContext('2d');g.fillStyle='#fbf6ea';g.fillRect(0,0,c.width,c.height);
      const traces=[];
      [0,0.35,0.675,0.95,1,2,4,7.95].forEach((phase,i)=>{
        const {trace,source}=__walk.render(phase);traces.push({phase,trace});
        g.drawImage(source,source.width/2-170,source.height/2-150,340,240,i%4*300,Math.floor(i/4)*320,300,240);
        g.fillStyle='#53483d';g.font='16px sans-serif';g.fillText(`frame phase ${phase}`,i%4*300+35,Math.floor(i/4)*320+274);
      });
      return {png:c.toDataURL(),traces};
    });
    fs.writeFileSync(path.join(__dirname,'production-crossfade.png'),Buffer.from(result.png.split(',')[1],'base64'));
    fs.writeFileSync(path.join(__dirname,'render-trace.json'),JSON.stringify(result.traces,null,2)+'\n');
    if(errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify(result.traces,null,2));
  } finally { if(browser) await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1});
