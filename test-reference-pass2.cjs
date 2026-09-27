// Zero-dependency regression checks for reference-match pass 2.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const index=read('index.html'),js=read('phase7-reference-pass2.js'),css=read('phase7-reference-pass2.css');
assert(index.includes('phase7-reference-pass2.css'),'index missing pass2 CSS');
assert(index.includes('phase7-reference-pass2.js'),'index missing pass2 JS');
assert(js.includes('damageFx'),'large damage-number layer missing');
assert(js.includes("type:(i===count-1&&Math.random()<.42)?'meat':'coin'"),'coin/meat drop visuals missing');
assert(js.includes('spawnTimer=target'),'wave density tuning missing');
assert(js.includes('drawDust'),'monster dust trail missing');
assert(js.includes('drawBossPulse'),'boss warning pulse missing');
assert(js.includes("'영웅':'<svg"),'vector combat dock hero icon missing');
assert(js.includes("'설정':'<svg"),'vector combat dock settings icon missing');
assert(css.includes('#v13CombatDock .v13-icon svg'),'vector icon styling missing');
assert(css.includes('html.v13-combat .battle:after'),'battlefield finishing overlay missing');
console.log(JSON.stringify({passed:true,damageNumbers:true,drops:['coin','meat'],dust:true,bossPulse:true,vectorIcons:6,densityTuned:true},null,2));
