const fs=require('fs'),Module=require('module'),path=require('path');
const file='/home/developer/bloom/tests/garden-browser.cjs';
let code=fs.readFileSync(file,'utf8').replace('const days = Math.min(7, Math.floor(hours / 24));','const days = await page.evaluate(({NOW,hours}) => Math.min(7, BloomTime.dayIndex(NOW + hours * 3600000) - BloomTime.dayIndex(NOW)), {NOW,hours});');
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(code,file);
