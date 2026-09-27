// Focused Phase 3B regression test. Run after installing Playwright: node test-phase3b.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}) ,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'index.html'));await page.waitForFunction(()=>window.Phase3B&&window.HeroV3&&window.EquipmentV3&&window.AppBoot?.ready,{timeout:30000});
 const result=await page.evaluate(()=>{
  const r={},p=Game.phase3b,b1=p.balanceAt(1),b500=p.balanceAt(500),b5000=p.balanceAt(5000);
  r.balanceCurve=b1.hp<b500.hp&&b500.hp<b5000.hp&&b1.damage<b500.damage&&b500.damage<b5000.damage;
  const e=p.economy();r.missionState=!!e.daily?.key&&!!e.weekly?.key&&Number.isInteger(e.scrap);
  Game.state.gold=1e9;e.scrap=10000;const before=p.economy().gearMeta.iron?.level||0;r.enhance=p.enhanceGear('iron')===true&&p.economy().gearMeta.iron.level===before+1&&p.economy().counters.enhance>=1;
  const rarity=p.rollRarity(5000);r.rarity=p.RARITIES.some(x=>x.id===rarity.id);
  e.daily.progress.wave=20;const gold=Game.state.gold;r.dailyClaim=p.claimMission('daily','waves')===true&&e.daily.claimed.waves&&Game.state.gold>gold;
  const old={wave:Game.state.wave,best:Game.state.best,cleared:!!Game.state.campaignCleared};Game.state.wave=501;Game.state.best=501;Game.state.campaignCleared=false;Game.state.progression.checkpoints=[1,101,201,301,401,501];
  r.farmStart=p.startFarm(500)===true&&Game.state.wave===500;Game.save();const saved=JSON.parse(localStorage.getItem('sunset-guard-v3-seven'));r.farmSavePreservesFront=saved.wave===501&&saved.best===501;p.exitFarm(false);r.farmExit=Game.state.wave===501&&Game.state.best===501;
  Game.state.wave=old.wave;Game.state.best=Math.max(old.best,old.wave);Game.state.campaignCleared=old.cleared;Game.resetWave();Game.save();const v3=JSON.parse(localStorage.getItem('sunset-guard-v3-seven'));r.economyPersisted=!!v3.progression?.economy?.gearMeta?.iron&&Number.isFinite(v3.progression.economy.scrap);
  return r;
 });
 const checks=[];for(const [name,value]of Object.entries(result)){assert(value,name);checks.push(name)}assert.equal(errors.length,0,'browser page errors');checks.push('no browser errors');
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
