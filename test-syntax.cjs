// Zero-dependency syntax smoke test: node test-syntax.cjs
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const files=['assets.js','phase2-art.js','game.js','campaign.js','phase2-combat.js','phase2-ui.js','phase3-equipment-pre.js','phase3-reference.js','phase3-equipment.js','phase3-polish.js','phase3b-progression.js','phase5-combat.js','boot.js','mobile-app.js','sw.js'];
const checked=[];
for(const file of files){const source=fs.readFileSync(path.join(__dirname,file),'utf8');new vm.Script(source,{filename:file});checked.push(file)}
console.log(JSON.stringify({passed:checked.length,checked},null,2));
