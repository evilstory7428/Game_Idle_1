'use strict';
/* Mobile-game style launch flow. The battle loop is held until the player explicitly starts. */
(()=> {
 const gate=document.getElementById('bootGate');
 if(!gate)return;
 const start=document.getElementById('bootStart'),status=document.getElementById('bootStatus');
 const fill=document.getElementById('bootProgressFill'),waveEl=document.getElementById('bootWave');
 const bestEl=document.getElementById('bootBest'),regionEl=document.getElementById('bootRegion');
 document.body.classList.add('booting');
 paused=true;
 $('sessionGate').hidden=true;
 const info=window.Campaign?.at?.(state.wave);
 waveEl.textContent=`WAVE ${Number(state.wave).toLocaleString('ko-KR')}`;
 bestEl.textContent=`최고 기록 ${Number(state.best).toLocaleString('ko-KR')} / 5,000`;
 regionEl.textContent=info?`${info.actTitle} · ${info.name}`:'서부마을 방어전';
 const returning=state.wave>1||state.best>1;
 start.textContent=state.campaignCleared?'최종전 다시 플레이':returning?`WAVE ${state.wave.toLocaleString('ko-KR')} 계속하기`:'게임 시작';
 start.disabled=true;
 let progress=8;
 const tick=setInterval(()=>{
   const ready=window.Game?.assetsReady&&window.Campaign;
   progress=Math.min(ready?100:88,progress+(ready?18:7));
   fill.style.width=progress+'%';
   status.textContent=progress<35?'마을 불러오는 중…':progress<70?'수비대와 전투 기록 확인 중…':progress<100?'5000 WAVE 전선 연결 중…':'출격 준비 완료';
   if(progress>=100){
     clearInterval(tick);
     gate.classList.add('ready');
     start.disabled=false;
     start.focus({preventScroll:true});
   }
 },70);
 function launch(){
   if(start.disabled)return;
   if(state.campaignCleared)state.campaignCleared=false;
   state.session=true;
   $('sessionGate').hidden=true;
   phase='start';phaseTimer=.45;paused=false;
   initAudio();save();hud();
   gate.classList.add('leaving');
   document.body.classList.remove('booting');
   setTimeout(()=>{gate.hidden=true},420);
 }
 start.addEventListener('click',launch);
 gate.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!start.disabled){e.preventDefault();launch()}});
 window.AppBoot={launch,get ready(){return !start.disabled}};
})();
