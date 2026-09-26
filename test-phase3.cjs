// Focused Phase 3 smoke test. Run after installing Playwright: node test-phase3.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'index.html'));await page.waitForFunction(()=>window.HeroV3&&window.EquipmentV3&&window.Phase3B&&window.AppBoot?.ready,{timeout:30000});
 const checks=[];const ok=(name,value)=>{assert(value,name);checks.push(name)};
 ok('v3 seven hero roster',await page.evaluate(()=>Game.state.version===3&&HeroV3.roster.length===7&&HeroV3.roster.some(h=>h.name==='줄리')));
 ok('eight equipment slots registered',await page.evaluate(()=>Object.keys(EquipmentV3.slots).length===8&&Object.keys(EquipmentV3.slots).includes('ring2')));
 ok('v3 state validates',await page.evaluate(()=>Game.validate(Game.state)));
 await page.click('#bootStart');await page.waitForFunction(()=>document.getElementById('bootGate').hidden);
 await page.click('#menuToggle');await page.click('[data-menu="영웅"]');await page.click('[data-hero="su"]');await page.click('[data-hero-tab="장비"]');
 ok('paperdoll renders eight slots',await page.locator('.paperdoll [data-v3-gear-slot]').count()===8);
 await page.click('#close');await page.click('#settings');ok('long progression record visible',await page.locator('.phase3-progress').count()===1);ok('phase3B economy visible',await page.locator('.phase3b-economy').count()===1);await page.click('#close');
 const result=await page.evaluate(()=>{
  const r={};Game.test(500);r.julie=Game.state.owned.includes('julie');Game.heroV3.autoFormation();r.formation=Game.state.slots.filter(Boolean).length===5&&new Set(Game.state.slots.filter(Boolean)).size===5&&Game.state.slots.includes('buck');
  Game.phase3b.setHeroAmount(10);let before=Game.state.levels.su[0];Game.state.gold=1e9;Game.select('su');Game.upgrade(0);r.bulk=Game.state.levels.su[0]===before+10;Game.phase3b.setHeroAmount(1);Game.action('exitTest');
  Game.save();let v3=JSON.parse(localStorage.getItem('sunset-guard-v3-seven')),v2=JSON.parse(localStorage.getItem('sunset-guard-v2'));r.dualSave=v3.version===3&&v2.version===2&&!v2.owned.includes('julie');
  let legacy=JSON.parse(JSON.stringify(v2));legacy.gear.su={armor:'vest',charm:'star'};legacy.inventory=[...new Set([...legacy.inventory,'vest','star'])];let migrated=Game.migrate(legacy);r.gearMigration=migrated.version===3&&migrated.gear.su.outfit==='vest'&&migrated.gear.su.badge==='star'&&!migrated.gear.su.armor&&!migrated.gear.su.charm&&Game.validate(migrated);return r;
 });
 for(const [k,v]of Object.entries(result))ok(k,v);ok('no browser errors',errors.length===0);
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
