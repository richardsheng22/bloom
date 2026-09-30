const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
for (const tz of ['UTC', 'America/Toronto']) test(`local 04:00, DST, and backwards clock budget: ${tz}`, () => {
  const result = JSON.parse(execFileSync(process.execPath, ['-e', `
    const T = require(${JSON.stringify(path.resolve('garden-time.js'))});
    const at = (month, day, hour, minute=0) => new Date(2026,month-1,day,hour,minute).getTime();
    const cases = [[9,29],[3,8],[11,1]].map(([m,d]) => [
      T.dayIndex(at(m,d,3,59))-T.dayIndex(at(m,d-1,12)),
      T.dayIndex(at(m,d,4))-T.dayIndex(at(m,d-1,12)),
      T.dayIndex(at(m,d,4))-T.dayIndex(at(m,d,3,59))]);
    const g = {...T.fresh(at(9,29,12))};
    for(let i=0;i<30;i++)T.tendTurn(g); T.notePlanted(g);
    T.arrive(g,at(9,28,12));T.arrive(g,at(9,29,13));
    console.log(JSON.stringify({cases,turns:g.time.turns,planted:g.time.planted,weight:T.turnWeight(g)}));
  `], { env: { ...process.env, TZ: tz }, encoding: 'utf8' }));
  assert.deepEqual(result, {cases:[[0,1,1],[0,1,1],[0,1,1]],turns:30,planted:1,weight:.25});
});
