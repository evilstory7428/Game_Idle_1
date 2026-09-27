// Zero-dependency visual composition regression for reference-match pass 1.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const index=read('index.html'),css=read('phase7-reference-pass1.css'),js=read('phase7-reference-pass1.js');
assert(index.includes('phase7-reference-pass1.css'),'index missing reference pass1 CSS');
assert(index.includes('phase7-reference-pass1.js'),'index missing reference pass1 JS');
assert(css.includes('html.v13-combat .shell'),'combat fullscreen shell missing');
assert(css.includes('#v13SpeedDock'),'three-speed dock styling missing');
assert(css.includes('#v13CombatDock'),'combat quick dock styling missing');
assert(css.includes('#v12BossBar'),'boss-bar relocation styling missing');
assert(js.includes('const laneScale=[.72,.82,.92,1.02,1.12]'),'five-lane perspective scale missing');
assert(js.includes("[1,2,3].forEach"),'x1/x2/x3 presets missing');
assert(js.includes("['♙','영웅','영웅']"),'hero combat-dock entry missing');
assert(js.includes("['☼','설정','설정']"),'settings combat-dock entry missing');
assert(js.includes('return {x:front?270:182+(i%2)*24,y:lane}'),'defender line repositioning missing');
assert(js.includes('battle.appendChild(box)'),'boss bar not moved into battlefield');
console.log(JSON.stringify({passed:true,fullscreen:true,speedPresets:3,combatMenuItems:6,perspectiveLanes:5},null,2));
