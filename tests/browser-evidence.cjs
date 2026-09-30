// Preloaded by the runner so legacy and new suites retain the same failure evidence.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BLOOM_PLAYWRIGHT||'playwright');
const out=path.resolve(process.env.BLOOM_EVIDENCE);let sequence=0;
const launch=chromium.launch.bind(chromium);
chromium.launch=async(...args)=>{
  const browser=await launch(...args);
  fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify({node:process.version,chromium:browser.version()},null,2));
  const open=browser.newPage.bind(browser);
  const finishers=new Set();
  browser.newPage=async(...options)=>{
    const page=await open(...options),id=++sequence,context=page.context();let done=false;
    await context.tracing.start({screenshots:true,snapshots:true,sources:true});
    const log=(type,text)=>fs.appendFileSync(path.join(out,'console.jsonl'),JSON.stringify({page:id,type,text})+'\n');
    page.on('pageerror',e=>log('pageerror',e.stack));page.on('console',m=>log(m.type(),m.text()));
    const finish=async()=>{if(done)return;done=true;
      await page.screenshot({path:path.join(out,`page-${id}-last.png`)}).catch(()=>{});
      await context.tracing.stop({path:path.join(out,`page-${id}.zip`)}).catch(()=>{});finishers.delete(finish);};
    finishers.add(finish);const close=page.close.bind(page);
    page.close=async(...a)=>{await finish();return close(...a)};return page;
  };
  const close=browser.close.bind(browser);
  browser.close=async(...a)=>{await Promise.all([...finishers].map(f=>f()));return close(...a)};return browser;
};
