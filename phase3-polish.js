'use strict';
(()=>{
 if(!window.Game||!window.HeroV3)return;
 const oldRender=renderPanel,oldUpdate=update;
 function rewriteCopy(){
  if($('drawer').hidden)return;const content=$('content');
  if(tab==='상점'){
   for(const d of content.querySelectorAll('details')){const s=d.querySelector('summary'),p=d.querySelector('.help');if(s?.textContent.includes('모집 확률')&&p)p.innerHTML=`일반 모집: 영웅 7종 동일 확률(각 약 14.29%). 미보유 영웅이 남아 있고 9회 연속 중복이면 다음 모집은 남은 미보유 영웅 중에서 확정됩니다.<br>중복 영웅: 200골드. 장비 ${items.length}종은 동일 확률이며 중복 장비는 120골드로 전환됩니다.<br>소모와 결과는 즉시 v3 저장에 반영됩니다.`;}
  }
  if(tab==='설정'){
   for(const d of content.querySelectorAll('details')){const s=d.querySelector('summary'),p=d.querySelector('.help');if(s?.textContent.includes('플레이 안내')&&p)p.innerHTML=`성공 시 다음 웨이브, 실패 시 같은 웨이브를 재도전합니다.<br>10웨이브 Elite / 100웨이브 Region Boss / 500웨이브 Act Boss.<br>총 5,000웨이브 · 10 Act · 50 Chapter로 전선이 확장됩니다.<br>100웨이브 단위 체크포인트는 연습 모드에서 본 진행을 보존한 채 다시 확인할 수 있습니다.<br>탭을 숨기거나 세션을 종료하면 전투와 음악이 멈춥니다.<br>현재 계정·클라우드 저장·실결제는 연결하지 않은 개발 버전입니다.`;}
  }
 }
 renderPanel=function(){oldRender();rewriteCopy()};
 update=function(dt){const was=!!state.campaignCleared;oldUpdate(dt);if(!was&&state.campaignCleared)save()};
 if(state.version===3&&validate(state))saveRecovery=false;
 const bootMessage=document.querySelector('.boot-message');if(bootMessage)bootMessage.innerHTML='7인의 개척자와 수비대를 편성해 서부마을을 지키세요.<br>10개의 전선을 넘어 마지막 5,000 웨이브까지 살아남으세요.';
 Game.update=update;Game.renderPanel=renderPanel;
})();
