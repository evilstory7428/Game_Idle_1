'use strict';
/* Mobile-game style launch flow. The battle loop is held until the player explicitly starts. */
(()=> {
 const gate=document.getElementById('bootGate');
 if(!gate)return;
 const start=document.getElementById('bootStart'),status=document.getElementById('bootStatus');
 const fill=document.getElementById('bootProgressFill'),waveEl=document.getElementById('bootWave');
 const bestEl=document.getElementById('bootBest'),regionEl=document.getElementById('bootRegion');
 document.body.classList.add('booting');
 try{if(typeof paused!=='undefined')paused=true}catch{}
 try{if(window.$?.('sessionGate'))$('sessionGate').hidden=true}catch{}

 const gameState=()=>window.Game?.state||(typeof state!=='undefined'?state:null);
 const refreshSaveInfo=()=>{
  const s=gameState();if(!s)return;
  const info=window.Campaign?.at?.(s.wave);
  if(waveEl)waveEl.textContent=`WAVE ${Number(s.wave||1).toLocaleString('ko-KR')}`;
  if(bestEl)bestEl.textContent=`최고 기록 ${Number(s.best||1).toLocaleString('ko-KR')} / 5,000`;
  if(regionEl)regionEl.textContent=info?`${info.actTitle} · ${info.name}`:'서부마을 방어전';
  const returning=(s.wave||1)>1||(s.best||1)>1;
  start.textContent=s.campaignCleared?'최종전 다시 플레이':returning?`WAVE ${Number(s.wave||1).toLocaleString('ko-KR')} 계속하기`:'게임 시작';
 };
 refreshSaveInfo();
 start.disabled=true;
 let progress=8,elapsed=0,ready=false;
 const markReady=(message='출격 준비 완료')=>{
  if(ready)return;ready=true;progress=100;
  if(fill)fill.style.width='100%';
  if(status)status.textContent=message;
  gate.classList.add('ready');
  start.disabled=false;
  try{start.focus({preventScroll:true})}catch{}
 };
 const tick=setInterval(()=>{
   elapsed+=70;
   const engineReady=!!window.Game&&window.Game.assetsReady!==false;
   const campaignReady=!!window.Campaign;
   progress=Math.min(engineReady?(campaignReady?100:96):88,progress+(engineReady?18:7));
   if(fill)fill.style.width=progress+'%';
   if(status)status.textContent=progress<35?'마을 불러오는 중…':progress<70?'수비대와 전투 기록 확인 중…':!engineReady?'전투 엔진 확인 중…':!campaignReady?'캠페인 정보 연결 중…':'출격 준비 완료';
   // Campaign/V12 visuals are enhancement layers. The core battle must still be launchable.
   if(engineReady&&(campaignReady||elapsed>=1400))markReady(campaignReady?'출격 준비 완료':'기본 전투 모드로 시작 가능');
   if(!engineReady&&elapsed>=5000){
     clearInterval(tick);
     if(status)status.textContent='전투 엔진을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.';
     start.disabled=true;
   }
   if(ready)clearInterval(tick);
 },70);

 let launched=false;
 function launch(){
   if(launched)return;
   if(!window.Game){if(status)status.textContent='전투 엔진 준비 중입니다. 잠시 후 다시 눌러주세요.';return;}
   launched=true;start.disabled=true;
   try{
     const s=gameState();
     if(s){if(s.campaignCleared)s.campaignCleared=false;s.session=true;}
     try{if(typeof $==='function'&&$('sessionGate'))$('sessionGate').hidden=true}catch{}
     try{if(typeof phase!=='undefined')phase='start'}catch{}
     try{if(typeof phaseTimer!=='undefined')phaseTimer=.18}catch{}
     try{if(typeof paused!=='undefined')paused=false}catch{}
     try{if(typeof initAudio==='function')initAudio()}catch{}
     try{if(typeof save==='function')save()}catch{}
     try{if(typeof hud==='function')hud()}catch{}
     gate.classList.add('leaving');
     document.body.classList.remove('booting');
     document.dispatchEvent(new CustomEvent('sunset-game-started'));
     setTimeout(()=>{gate.hidden=true},360);
   }catch(err){
     launched=false;start.disabled=false;document.body.classList.add('booting');
     if(status)status.textContent='시작 처리 중 오류가 발생했습니다. 다시 눌러주세요.';
     console.error('[Sunset Guard boot launch]',err);
   }
 }
 start.addEventListener('click',launch);
 gate.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!start.disabled){e.preventDefault();launch()}});
 window.addEventListener('error',e=>{if(!launched&&status)status.textContent='일부 그래픽 모듈 오류를 복구 중입니다…'});
 window.AppBoot={launch,get ready(){return !start.disabled},forceReady:()=>{if(window.Game)markReady('출격 준비 완료')}};
})();
