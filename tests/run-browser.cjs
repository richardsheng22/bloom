// Keep suites separate: each gets its own log, screenshots, traces and browser metadata.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.BLOOM_EVIDENCE||'build/browser-evidence');
const suites=process.argv[2]==='art'?['erwu-browser','erwu-render-browser']:['garden-browser','garden-view-browser','play-browser'];
let failed=false;
for(const name of suites){
  const file=path.join(__dirname,name+'.cjs'); if(!fs.existsSync(file))continue;
  const out=path.join(root,name);fs.mkdirSync(out,{recursive:true});
  const r=spawnSync(process.execPath,['--require',path.join(__dirname,'browser-evidence.cjs'),file],{
    env:{...process.env,BLOOM_EVIDENCE:out},encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024});
  const log=(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.stack:'');
  fs.writeFileSync(path.join(out,'suite.log'),log);process.stdout.write(log);
  if(r.status!==0)failed=true;
}
process.exitCode=failed?1:0;
