'use strict';
/* Phase 2 QA/UI helpers: allow safe isolated test jumps across the full 5,000-wave campaign. */
(()=>{
 if(typeof Campaign==='undefined'||!window.Game)return;
 const oldRenderPanel=renderPanel;
 const TEST_WAVES=[1,10,100,500,501,1000,1500,2500,4000,5000];
 test=function(w){
  if(!Number.isInteger(w)||w<1||w>Campaign.maxWave)return;
  if(!testMode){save();backup=JSON.parse(JSON.stringify(state));testMode=true;}
  const settings={...state.settings};state=fresh();state.settings=settings;state.wave=w;state.best=w;state.gold=1e9;state.gems=50000;
  state.owned=heroes.map(h=>h.id);state.inventory=items.map(i=>i.id);state.slots=['su','chel','buck','rose','june'];
  state.owned.forEach(id=>{state.levels[id]=Array(24).fill(0);state.gear[id]={};});
  selected='su';resetWave();changed();toast(`독립 테스트 · WAVE ${w} · ${Campaign.at(w).name}`);
 };
 renderPanel=function(){
  oldRenderPanel();
  if(tab!=='설정'||$('drawer').hidden)return;
  const grid=$('content').querySelector('.testgrid');
  if(grid)grid.innerHTML=TEST_WAVES.map(w=>`<button data-test="${w}">${w.toLocaleString('ko-KR')} 웨이브</button>`).join('');
  const details=grid?.closest('details');
  if(details&&!details.querySelector('.campaign-test-summary')){
   const info=Campaign.at(state.wave),p=document.createElement('p');p.className='help campaign-test-summary';
   p.innerHTML=`전체 캠페인 <b>${Campaign.maxWave.toLocaleString('ko-KR')} 웨이브</b> · 10 Act · 50 Chapter<br>현재: ACT ${info.act} / CHAPTER ${info.chapter} · ${info.name}`;
   details.insertBefore(p,grid);
  }
 };
 Game.test=test;Game.testWaves=TEST_WAVES;
})();
