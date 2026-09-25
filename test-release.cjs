// Release validation runner. Usage: node test-release.cjs
// Runs zero-dependency checks first, then Playwright suites when Playwright is installed.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,results=[];
function run(name,cmd,args){const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',stdio:'pipe'});results.push({name,ok:r.status===0,status:r.status,stdout:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()});if(r.status!==0){console.error(`\n[FAIL] ${name}\n${r.stdout||''}${r.stderr||''}`);process.exitCode=1}else console.log(`[PASS] ${name}`);return r.status===0}
run('JavaScript syntax','node',['test-syntax.cjs']);
const build=spawnSync('python3',['build.py','sunset-guard-release-test.html'],{cwd:root,encoding:'utf8',stdio:'pipe'});results.push({name:'Standalone build',ok:build.status===0,status:build.status,stdout:(build.stdout||'').trim(),stderr:(build.stderr||'').trim()});
if(build.status===0){const out=path.join(root,'sunset-guard-release-test.html'),html=fs.readFileSync(out,'utf8');assert(html.includes('phase3b')&&html.includes('Phase5')&&html.includes('MobileGame'),'standalone build missing latest layers');assert(!/<script\s+src=/i.test(html),'standalone build still contains external script tags');assert(!/<link[^>]+stylesheet/i.test(html),'standalone build still contains external stylesheets');fs.unlinkSync(out);console.log('[PASS] Standalone build')}else{console.error('[FAIL] Standalone build\n'+(build.stdout||'')+(build.stderr||''));process.exitCode=1}
let playwright=false;try{require.resolve('playwright');playwright=true}catch{}
const suites=['test.cjs','test-phase3.cjs','test-phase3b.cjs','test-mobile.cjs','test-phase5.cjs'];
if(playwright){for(const file of suites)run(file,'node',[file])}else{console.warn('[SKIP] Playwright suites — install with: npm install playwright && npx playwright install chromium');results.push({name:'Playwright browser suites',ok:null,status:'skipped',reason:'playwright not installed',suites})}
const required=['index.html','manifest.webmanifest','sw.js','sunset-icon.svg','phase3b-progression.js','phase5-combat.js','mobile-app.js'];for(const f of required)assert(fs.existsSync(path.join(root,f)),`missing release file: ${f}`);console.log('[PASS] Required release files');
console.log('\n'+JSON.stringify({ok:process.exitCode!==1,results},null,2));
