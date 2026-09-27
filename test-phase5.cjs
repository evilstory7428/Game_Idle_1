// Phase 5 combat presentation regression. Run after installing Playwright: node test-phase5.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'index.html'));await page.waitForFunction(()=>window.Phase5&&window.Phase3B&&window.AppBoot?.ready,{timeout:30000});
 const checks=[];const ok=(name,value)=>{assert(value,name);checks.push(name)};
 ok('shake defaults off',await page.evaluate(()=>Game.phase5.settings().shake===false));
 await page.click('#bootStart');await page.waitForFunction(()=>document.getElementById('bootGate').hidden);
 await page.click('#settings');ok('combat settings panel renders',await page.locator('.phase5-settings').count()===1);ok('four quality choices',await page.locator('[data-quality]').count()===4);await page.click('[data-quality="low"]');ok('manual low quality applies',await page.evaluate(()=>Game.phase5.quality==='low'&&Game.state.settings.quality==='low'));await page.click('#close');
 const result=await page.evaluate(()=>{const r={};Game.test(100);Game.resetWave();for(let i=0;i<40&&!Game.enemies.some(e=>e.boss);i++)Game.spawn();r.bossIntro=!!Game.phase5.bossIntro();const e=Game.enemies.find(x=>x.hp>0);const before=Game.phase5.effects.length;if(e)Game.fire('su',e,true);r.ultimateFx=Game.phase5.effects.length>before;Game.phase5.forceQuality('medium');r.quality=Game.phase5.quality==='medium'&&Game.state.settings.quality==='medium';Game.action('exitTest');Game.save();const saved=JSON.parse(localStorage.getItem('sunset-guard-v3-seven'));r.persisted=saved.settings.quality==='medium'&&saved.settings.shake===false;return r});
 for(const [name,value]of Object.entries(result))ok(name,value);await page.waitForTimeout(250);ok('no browser errors',errors.length===0);
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
