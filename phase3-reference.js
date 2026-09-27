'use strict';
/* Phase 3 reference integration.
   Uses the uploaded seven-hero/formation build as the design reference while keeping
   the current modular 5,000-wave campaign and a v2 compatibility shadow save. */
(()=>{
 if(!window.Game||typeof Campaign==='undefined')return;
 const V3_KEY='sunset-guard-v3-seven',LEGACY_KEY='sunset-guard-v2';
 const LEGACY_HERO_IDS=['su','chel','buck','rose','june','ash'];
 const LEGACY_ITEM_IDS=['iron','fire','ice','vest','coat','star','herb','mace','saber'];
 const HERO_V3=[
  {id:'su',name:'낸시',role:'원거리',weapon:'revolver',icon:'♠',color:'#b76749',atk:17,hp:150,rate:.7,range:1050,height:174,desc:'리볼버 6발 · 쌍 리볼버 속사 / 10초 전장 난사',ultimate:'쌍 리볼버',area:'황혼의 난사'},
  {id:'ash',name:'루나',role:'원거리',weapon:'dynamite',icon:'✹',color:'#ca7652',atk:34,hp:130,rate:1.5,range:475,height:167,desc:'다이너마이트 투하 · 7연속 투척 / 30초 불바다',ultimate:'다이너마이트 7연투',area:'불타는 개척지'},
  {id:'buck',name:'엘로나',role:'탱커',weapon:'whip',icon:'◈',color:'#b59970',atk:13,hp:650,rate:1.3,range:190,height:187,desc:'채찍 근접 타격 · 도발과 보호막 / 양손 채찍 난무',ultimate:'수호자의 도발',area:'쌍채찍 폭풍'},
  {id:'june',name:'제시',role:'지원',weapon:'guitar',icon:'♫',color:'#bf8b8a',atk:9,hp:190,rate:1.1,range:850,height:177,desc:'기타 연주와 아군 회복 · 전체 회복 / 부활·마을 방벽',ultimate:'치유의 선율',area:'다시 피는 노래'},
  {id:'julie',name:'줄리',role:'지원',weapon:'staff',icon:'✧',color:'#e7c977',atk:12,hp:170,rate:1.2,range:1000,height:179,desc:'황금 빛 레이저 · 위급한 아군 보호 / 전체 회복·부활',ultimate:'빛의 보호',area:'새벽의 축복'},
  {id:'chel',name:'첼리',role:'원거리',weapon:'rifle',icon:'⌖',color:'#d8ae53',atk:25,hp:120,rate:.8,range:1080,height:178,desc:'레버액션 소총 · 집중 관통 사격 / 세 방향 일제사격',ultimate:'개척자의 조준',area:'황금 탄막'},
  {id:'rose',name:'티나',role:'원거리',weapon:'sniper',icon:'❖',color:'#8fb6d0',atk:32,hp:125,rate:1.15,range:1180,height:170,desc:'스코프 소총 · 연막탄 / 인접 적 3연발·보스 추가 피해',ultimate:'푸른 연막',area:'침묵의 세 발'}
 ];
 const oldMigrate=migrate,oldValidate=validate,oldSave=save,oldRenderPanel=renderPanel,oldUpdate=update,oldTest=test;
 const oldCanEquip=canEquip,oldHeroArt=PixelArt.hero,oldPaint=PixelArt.paint;
 // Keep the six legacy internal IDs so hard-coded combat traits remain compatible,
 // and add Julie as the seventh hero. Display identity follows the uploaded build.
 heroes.splice(0,heroes.length,...HERO_V3.map(x=>({...x})));
 const mace=items.find(x=>x.id==='mace');if(mace){mace.name='수호자의 채찍';mace.desc='엘로나 전용 · 공격력 +25%';}
 const saber=items.find(x=>x.id==='saber');if(saber){saber.name='정찰대 스코프 소총';saber.desc='티나 전용 · 공격력 +25%';}
 if(!items.some(x=>x.id==='dynamite'))items.push({id:'dynamite',name:'개척자의 다이너마이트',slot:'weapon',desc:'루나 전용 · 공격력 +25% · 폭발 공격',atk:.25,fire:.08});
 if(!items.some(x=>x.id==='guitar'))items.push({id:'guitar',name:'살롱의 기타',slot:'weapon',desc:'제시 전용 · 공격력·회복 지원 +25%',atk:.25,regen:1.2});
 if(!items.some(x=>x.id==='staff'))items.push({id:'staff',name:'황금빛 지팡이',slot:'weapon',desc:'줄리 전용 · 공격력·회복 지원 +25%',atk:.25,regen:1.2});
 function ensureProgression(s=state){
  s.progression??={};const p=s.progression;
  p.checkpoints=Array.isArray(p.checkpoints)?p.checkpoints:[1];
  p.firstBossRewards=p.firstBossRewards&&typeof p.firstBossRewards==='object'?p.firstBossRewards:{};
  p.totalWaveClears=Number.isInteger(p.totalWaveClears)?p.totalWaveClears:0;
  p.totalBossClears=Number.isInteger(p.totalBossClears)?p.totalBossClears:0;
  return p;
 }
 function migrateV3(input){
  let p=JSON.parse(JSON.stringify(input||{}));
  if(p.version===1)p=oldMigrate(p);
  if(p.version===2)p.version=3;
  if(p.version!==3)return p;
  p.owned=Array.isArray(p.owned)?p.owned:['su'];if(!p.owned.includes('su'))p.owned.unshift('su');
  p.slots=Array.isArray(p.slots)&&p.slots.length===5?p.slots:['su',null,null,null,null];
  p.levels=p.levels||{};p.gear=p.gear||{};
  for(const id of p.owned){p.levels[id]??=Array(24).fill(0);p.gear[id]??={};}
  ensureProgression(p);return p;
 }
 function validateV3(p){try{
  const vi=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;
  if(p?.version!==3||!vi(p.wave,5000)||p.wave<1||!vi(p.best,5000)||p.best<p.wave)return false;
  if(![p.gold,p.gems].every(n=>Number.isFinite(n)&&n>=0&&n<=1e50))return false;
  if(!Array.isArray(p.owned)||!p.owned.includes('su')||new Set(p.owned).size!==p.owned.length)return false;
  if(!p.owned.every(id=>heroes.some(h=>h.id===id)&&Array.isArray(p.levels?.[id])&&p.levels[id].length===24&&p.levels[id].every(n=>vi(n,10000))))return false;
  if(!Array.isArray(p.slots)||p.slots.length!==5||!p.slots.some(Boolean)||!p.slots.every(id=>id===null||p.owned.includes(id))||new Set(p.slots.filter(Boolean)).size!==p.slots.filter(Boolean).length)return false;
  if(!Array.isArray(p.inventory)||new Set(p.inventory).size!==p.inventory.length||!p.inventory.every(i=>items.some(x=>x.id===i))||!p.gear)return false;
  const equipped=[];for(const [id,eq] of Object.entries(p.gear)){if(!p.owned.includes(id)||!eq||typeof eq!=='object')return false;for(const [slot,it]of Object.entries(eq)){if(!p.inventory.includes(it)||!items.some(x=>x.id===it&&x.slot===slot)||equipped.includes(it))return false;equipped.push(it)}}
  return Array.isArray(p.town)&&p.town.length===4&&p.town.every(n=>vi(n,60000))&&p.settings&&['bgm','sfx'].every(k=>Number.isFinite(p.settings[k])&&p.settings[k]>=0&&p.settings[k]<=1)&&vi(p.pity,9)&&vi(p.draws,10000000)&&typeof p.session==='boolean';
 }catch{return false}}
 function shadowV2(){
  const s=JSON.parse(JSON.stringify(state));s.version=2;delete s.progression;delete s.campaignCleared;
  s.owned=s.owned.filter(id=>LEGACY_HERO_IDS.includes(id));if(!s.owned.includes('su'))s.owned.unshift('su');
  s.slots=s.slots.map(id=>LEGACY_HERO_IDS.includes(id)?id:null);if(!s.slots.some(Boolean))s.slots[0]='su';
  s.levels=Object.fromEntries(Object.entries(s.levels||{}).filter(([id])=>LEGACY_HERO_IDS.includes(id)));
  s.gear=Object.fromEntries(Object.entries(s.gear||{}).filter(([id])=>LEGACY_HERO_IDS.includes(id)).map(([id,eq])=>[id,Object.fromEntries(Object.entries(eq).filter(([,it])=>LEGACY_ITEM_IDS.includes(it))) ]));
  s.inventory=(s.inventory||[]).filter(id=>LEGACY_ITEM_IDS.includes(id));
  return s;
 }
 migrate=function(p){return migrateV3(p)};
 validate=function(p){return validateV3(p)};
 try{
  const raw=localStorage.getItem(V3_KEY);if(raw){const p=migrateV3(JSON.parse(raw));if(validateV3(p)){state=p;saveRecovery=false}else throw Error('invalid v3 save')}
  else{state=migrateV3(state);saveRecovery=false;}
 }catch{state=migrateV3(state);ensureProgression(state);}
 save=function(){
  if(testMode||saveRecovery)return;state.version=3;state.saved=Date.now();ensureProgression();
  try{
   const previous=localStorage.getItem(V3_KEY);if(previous){try{const p=JSON.parse(previous);if(validateV3(p))localStorage.setItem(V3_KEY+'-backup',previous)}catch{}}
   localStorage.setItem(V3_KEY,JSON.stringify(state));localStorage.setItem(LEGACY_KEY,JSON.stringify(shadowV2()));
   $('saveStatus').textContent='● v3 자동 저장됨';
  }catch{storageOK=false;$('saveStatus').textContent='저장 불가 · 설정에서 저장파일 내보내기';}
 };
 canEquip=function(id,it){
  if(!it||it.slot!=='weapon')return !!it;
  const allowed={su:['iron','fire'],ash:['dynamite'],buck:['mace'],june:['guitar'],julie:['staff'],chel:['ice'],rose:['saber']};
  return (allowed[id]||[]).includes(it.id);
 };
 normalizeGear();ensureProgression();
 // Distinct Julie canvas art without changing the original asset module.
 PixelArt.hero=function(g,id,attack=0,t=0){
  if(id!=='julie')return oldHeroArt(g,id,attack,t);oldHeroArt(g,'chel',attack,t);
  g.save();g.fillStyle='#e7c977';g.fillRect(30,9,3,24);g.fillStyle='#fff1a8';g.fillRect(28,7,7,5);if(attack)g.fillRect(35,8,5,3);g.restore();
 };
 function drawCustomThumb(canvas,id){const g=canvas.getContext('2d');if(!g)return;g.imageSmoothingEnabled=false;g.clearRect(0,0,canvas.width,canvas.height);g.save();g.scale(canvas.width/48,canvas.height/42);
  if(id==='julie')PixelArt.hero(g,'julie');
  else{g.fillStyle='#d7bb78';if(id==='dynamite'){g.fillRect(13,11,17,17);g.fillStyle='#6c4331';g.fillRect(20,5,3,8);g.fillStyle='#ffb04c';g.fillRect(22,3,4,4)}if(id==='guitar'){g.fillRect(13,18,17,12);g.fillRect(21,5,4,18);g.fillStyle='#6d4631';g.fillRect(17,21,9,5)}if(id==='staff'){g.fillRect(22,7,3,27);g.fillStyle='#fff0a0';g.fillRect(18,4,11,8)}}g.restore();canvas.dataset.v3Painted='1';}
 PixelArt.paint=function(){oldPaint();document.querySelectorAll('canvas[data-pixel="julie"],canvas[data-pixel="dynamite"],canvas[data-pixel="guitar"],canvas[data-pixel="staff"]').forEach(c=>{if(c.dataset.v3Painted!=='1')drawCustomThumb(c,c.dataset.pixel)})};
 let heroUpgradeAmount=1,townUpgradeAmount=1,juliePulse=1.2;
 const heroUnitCost=i=>Math.ceil((22+i*4)*Math.pow(1.16,Math.min(500,level(selected)[i])));
 const townUnitCost=i=>Math.ceil((80+i*60)*Math.pow(1.18,Math.min(500,state.town[i])));
 upgrade=function(i){if(!Number.isInteger(i)||i<0||i>23||i===18||i===19)return;const amount=Math.min(heroUpgradeAmount,500-level(selected)[i]);if(amount<=0)return;const c=heroUnitCost(i)*amount;if(state.gold<c){toast('골드가 부족합니다.');return}state.gold-=c;state.levels[selected][i]+=amount;changed();playSfx('upgrade')};
 upgradeTown=function(i){if(!Number.isInteger(i)||i<0||i>3)return;const limit=i===2?30:500,amount=Math.min(townUpgradeAmount,limit-state.town[i]);if(amount<=0)return;const c=townUnitCost(i)*amount;if(state.gold<c){toast('골드가 부족합니다.');return}state.gold-=c;state.town[i]+=amount;if(i===0)baseHP+=35*amount;changed();playSfx('upgrade')};
 function rewardFirstBoss(w){const p=ensureProgression();if(p.firstBossRewards[w])return;const info=Campaign.at(w),actBoss=w%500===0,regionBoss=w%100===0;const gold=Math.round((actBoss?1800:regionBoss?650:220)*info.act*(1+info.index*.08)),gems=actBoss?80:regionBoss?25:6;p.firstBossRewards[w]={gold,gems,claimedAt:Date.now()};p.totalBossClears++;state.gold+=gold;state.gems+=gems;toast(`최초 보스 클리어 · ◈ ${money(gold)} / ✧ ${gems}`)}
 function onWaveClear(w){const p=ensureProgression();p.totalWaveClears++;if(w%10===0)rewardFirstBoss(w);if(w%100===0){const cp=Math.min(Campaign.maxWave,w+1);if(!p.checkpoints.includes(cp))p.checkpoints.push(cp)}save();}
 update=function(dt){const before=state.wave,wasClear=!!state.campaignCleared;oldUpdate(dt);
  if(state.wave>before)onWaveClear(before);if(!wasClear&&state.campaignCleared)rewardFirstBoss(Campaign.maxWave);
  juliePulse-=dt;if(juliePulse<=0){juliePulse=2.5;if(state.slots.includes('julie')){const a=actor('julie');if(a.hp>0){const living=state.slots.filter(Boolean).map(id=>({id,a:actor(id),s:stats(id)})).filter(x=>x.a.hp>0);if(living.length){const target=living.sort((x,y)=>x.a.hp/x.s.hp-y.a.hp/y.s.hp)[0];target.a.hp=Math.min(target.s.hp,target.a.hp+stats('julie').atk*2.5);baseHP=Math.min(baseMax(),baseHP+stats('julie').atk*.45);effects.push({type:'text',x:position(target.id).x,y:position(target.id).y-55,t:.75,text:'빛의 보호',color:'#ffe8a0'})}}}}
 };
 function autoFormation(){const owned=sortedHeroes().filter(h=>state.owned.includes(h.id)),pick=[],used=new Set();const add=h=>{if(h&&!used.has(h.id)&&pick.length<5){pick.push(h.id);used.add(h.id)}};add(owned.find(h=>h.role==='탱커'));add(owned.find(h=>h.role==='지원'));owned.forEach(add);state.slots=[...pick,...Array(5-pick.length).fill(null)];runtime={};changed();toast('역할과 전투력 기준 추천 배치를 적용했습니다.')}
 function bulkBar(type,value){return `<div class="phase3-bulk"><span>${type==='hero'?'강화 횟수':'마을 강화 횟수'}</span>${[1,10,100].map(n=>`<button data-phase3-${type}="${n}" class="${value===n?'active':''}">${n}회</button>`).join('')}</div>`}
 function patchPanel(){
  if($('drawer').hidden)return;const content=$('content');
  if(tab==='영웅'&&detail){const notice=content.querySelector('.notice');if(notice&&!content.querySelector('.phase3-bulk'))notice.insertAdjacentHTML('beforebegin',bulkBar('hero',heroUpgradeAmount));content.querySelectorAll('[data-up]').forEach(b=>{const i=+b.dataset.up,amount=Math.min(heroUpgradeAmount,500-level(selected)[i]),c=heroUnitCost(i)*amount;b.dataset.cost=c;b.disabled=amount<=0||state.gold<c;b.textContent=amount>0?`${amount}회 · ◈ ${money(c)}`:'최대 강화'});const profile=content.querySelector('.hero-profile');const h=hero(selected);if(profile&&h?.ultimate&&!profile.querySelector('.phase3-signature'))profile.insertAdjacentHTML('beforeend',`<div class="phase3-signature"><small>필살기</small><b>${h.ultimate}</b><small>광역기</small><b>${h.area}</b></div>`)}
  if(tab==='마을 강화'){const notice=content.querySelector('.notice');if(notice&&!content.querySelector('.phase3-bulk'))notice.insertAdjacentHTML('afterend',bulkBar('town',townUpgradeAmount));content.querySelectorAll('[data-town]').forEach(b=>{const i=+b.dataset.town,limit=i===2?30:500,amount=Math.min(townUpgradeAmount,limit-state.town[i]),c=townUnitCost(i)*amount;b.dataset.cost=c;b.disabled=amount<=0||state.gold<c;b.textContent=amount>0?`${amount}회 · ◈ ${money(c)}`:'최대 강화'})}
  if(tab==='전투 배치'){const formation=content.querySelector('.formation');if(formation&&!content.querySelector('.phase3-formation-tools'))formation.insertAdjacentHTML('beforebegin',`<div class="phase3-formation-tools"><div><strong>5인 수비대 편성</strong><small>탱커 전방 · 원거리/지원 후방</small></div><button data-auto-formation>추천 배치</button></div>`);formation?.querySelectorAll('.form-slot').forEach((b,i)=>{const id=state.slots[i],front=id&&hero(id).role==='탱커';b.style.left=(front?68:24+(i%2)*18)+'%';b.style.top=(10+i*25)+'px'});}
  if(tab==='설정'&&!content.querySelector('.phase3-progress')){const p=ensureProgression(),info=Campaign.at(state.wave),checkpoints=[...p.checkpoints].sort((a,b)=>b-a).slice(0,5);content.insertAdjacentHTML('afterbegin',`<section class="phase3-progress"><div class="eyebrow">FRONTIER RECORD</div><h3>장기 진행 기록</h3><div class="phase3-progress-grid"><div><small>현재 전선</small><b>${state.wave.toLocaleString('ko-KR')} / 5,000</b></div><div><small>최초 보스</small><b>${Object.keys(p.firstBossRewards).length}회</b></div><div><small>누적 웨이브</small><b>${p.totalWaveClears.toLocaleString('ko-KR')}</b></div></div><p class="help">ACT ${info.act} · ${info.name}. 100웨이브 단위 체크포인트는 본 진행을 바꾸지 않는 연습 모드로 다시 확인할 수 있습니다.</p><div class="phase3-checkpoints">${checkpoints.map(w=>`<button data-practice-wave="${w}">${w.toLocaleString('ko-KR')} 연습</button>`).join('')}</div></section>`)}
  PixelArt.paint();
 }
 renderPanel=function(){oldRenderPanel();patchPanel()};
 test=function(w){oldTest(w);state.version=3;ensureProgression();state.owned=heroes.map(h=>h.id);for(const id of state.owned){state.levels[id]??=Array(24).fill(0);state.gear[id]??={}};if(!state.slots.includes('julie')&&state.slots.filter(Boolean).length<5)state.slots[state.slots.findIndex(x=>!x)]='julie';changed()};
 $('content').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.phase3Hero){heroUpgradeAmount=+b.dataset.phase3Hero;renderPanel()}if(b.dataset.phase3Town){townUpgradeAmount=+b.dataset.phase3Town;renderPanel()}if(b.dataset.autoFormation!==undefined)autoFormation();if(b.dataset.practiceWave){test(+b.dataset.practiceWave);toast('체크포인트 연습 모드 · 본 진행 저장은 유지됩니다.')}});
 // Refresh UI after roster/state conversion.
 selected=state.owned.includes(selected)?selected:'su';normalizeGear();resetWave();renderSquad();hud();save();
 Game.validate=validate;Game.migrate=migrate;Game.save=save;Game.update=update;Game.upgrade=upgrade;Game.upgradeTown=upgradeTown;Game.test=test;Game.canEquip=canEquip;
 Game.heroV3={roster:HERO_V3,key:V3_KEY,legacyKey:LEGACY_KEY,autoFormation,setHeroUpgradeAmount:n=>heroUpgradeAmount=[1,10,100].includes(n)?n:1,setTownUpgradeAmount:n=>townUpgradeAmount=[1,10,100].includes(n)?n:1,get progression(){return ensureProgression()}};
 window.HeroV3=Game.heroV3;
})();
