'use strict';
/* Phase 1 campaign extension: 5,000 waves / 10 acts / 50 regions.
   Existing Canvas art is intentionally reused in this phase; later phases can attach
   unique sprites/animations to the same act + region metadata without changing saves. */
const MAX_CAMPAIGN_WAVE=5000;
const ACT_SPAN=500, REGION_SPAN=100;
const CAMPAIGN_ACTS=[
 {title:'개척지의 야수',eng:'FRONTIER BEASTS',art:0,regions:['붉은 모래 초원','코요테 능선','방울뱀 협곡','들소의 길','황혼 목장'],mobs:['황야 멧돼지','붉은 코요테','방울뱀 사냥꾼'],elite:'뿔난 들소 대장',boss:'황야의 왕 그리즐리'},
 {title:'잊힌 원시 부족',eng:'PRIMAL CANYON',art:1,regions:['부서진 석문','사냥꾼 골짜기','거대뼈 분지','불의 제단','태고의 협곡'],mobs:['돌도끼 사냥꾼','동굴 창병','매머드 추적자'],elite:'거석 수호자',boss:'태고왕 우르칸'},
 {title:'죽은 자의 변경',eng:'DEAD FRONTIER',art:2,regions:['안개 묘지','버려진 역참','검은 교회','망자의 광산','죽음의 국경'],mobs:['떠도는 시체','묘지 사냥개','저주받은 총잡이'],elite:'관 속의 집행자',boss:'망령 보안관 블랙벨'},
 {title:'강철 군단',eng:'IRON DOMINION',art:1,regions:['고철 야적장','증기 철로','자동인형 공장','강철 요새','기관도시 코어'],mobs:['고철 드론','태엽 총잡이','증기 파쇄병'],elite:'철갑 기관차',boss:'기계왕 콜로서스'},
 {title:'진홍 늪지',eng:'CRIMSON MARSH',art:0,regions:['핏빛 갈대밭','독안개 늪','침수된 마을','마녀의 수렁','진홍 심장부'],mobs:['늪지 포식자','역병 박쥐','독침 도마뱀'],elite:'거대 수렁 악어',boss:'늪의 어머니 모르가'},
 {title:'빙결 전선',eng:'FROSTLINE',art:0,regions:['첫눈 평원','얼음 송곳니 길','설인 야영지','빙하 탄광','백야의 끝'],mobs:['설원 늑대','서리 정령','빙결 약탈자'],elite:'설산 거인',boss:'백빙룡 스카르'},
 {title:'잿불 황무지',eng:'EMBER WASTES',art:1,regions:['재의 사막','유황 협곡','용암 철로','불타는 성채','태양의 균열'],mobs:['재도깨비','용암 사냥개','화염 광전사'],elite:'용광로 골렘',boss:'적염군주 이그니스'},
 {title:'월광 황야',eng:'MOONLIT BADLANDS',art:2,regions:['달그림자 초원','유령 열차길','침묵의 마을','은빛 공동묘지','월식 협곡'],mobs:['그림자 추적자','월광 망령','유령 기수'],elite:'목 없는 결투가',boss:'월식마녀 셀레네'},
 {title:'공허의 균열',eng:'VOID RIFT',art:2,regions:['깨진 하늘','수정 균열지','뒤틀린 목장','무중력 폐허','공허 관문'],mobs:['균열충','공허 사수','수정 괴수'],elite:'차원 포식자',boss:'심연안 오블리비온'},
 {title:'최후의 지평선',eng:'LAST HORIZON',art:2,regions:['검은 일출','멸망의 철로','영웅들의 무덤','세계의 끝','마지막 결전지'],mobs:['악몽의 개척자','타락한 수호자','종말의 기수'],elite:'황혼의 심판자',boss:'종말왕 라스트 선'}
];
const CAMPAIGN_REGIONS=CAMPAIGN_ACTS.flatMap((act,ai)=>act.regions.map((name,ri)=>({
 chapter:ai*5+ri+1,act:ai+1,actTitle:act.title,actEng:act.eng,name,art:act.art,
 mobs:act.mobs,elite:act.elite,boss:act.boss,
 startWave:ai*ACT_SPAN+ri*REGION_SPAN+1,endWave:ai*ACT_SPAN+(ri+1)*REGION_SPAN
})));
function campaignAt(wave=state.wave){
 const safe=Math.max(1,Math.min(MAX_CAMPAIGN_WAVE,Number(wave)||1));
 const index=Math.min(CAMPAIGN_REGIONS.length-1,Math.floor((safe-1)/REGION_SPAN));
 const region=CAMPAIGN_REGIONS[index];
 const local=((safe-1)%REGION_SPAN)+1;
 return {...region,index,local,isElite:safe%10===0,isRegionBoss:safe%100===0,isActBoss:safe%500===0,isFinal:safe===MAX_CAMPAIGN_WAVE};
}
const legacyChapter=chapter,legacyTotal=total,legacySpawn=spawn,legacyEnemyArt=enemyArt,legacyHud=hud,legacyUpdate=update;
chapter=function(){return campaignAt().index};
total=function(){
 const info=campaignAt();
 return Math.min(26,8+Math.floor((info.local-1)/12)+Math.floor((info.act-1)/2));
};
enemyArt=function(e){
 const info=campaignAt();
 if(info.art===0)return ['boar','wolf','cat'][e.kind%3];
 if(info.art===1)return 'caveman';
 return 'zombie';
};
spawn=function(){
 const info=campaignAt(),wave=state.wave;
 const boss=bossWave()&&spawned===total()-1;
 const main=wave%100===0;
 const actBoss=wave%500===0;
 const chapterScale=Math.pow(1.18,info.index);
 const localScale=1+(info.local-1)*.018;
 const bossScale=boss?(actBoss?22:main?12:4.8):1;
 const hp=(34+info.local*4+info.index*10)*chapterScale*localScale*bossScale;
 const damage=(4.5+info.local*.22+info.index*.9)*Math.pow(1.115,info.index)*(boss?(actBoss?3.4:main?2.6:1.8):1);
 const kind=spawned%3;
 const name=boss?(actBoss?info.boss:main?info.boss:info.elite):info.mobs[kind];
 enemies.push({x:1470,y:326+Math.random()*175,hp,max:hp,damage,speed:27+Math.random()*15+(boss?-9:0)+Math.min(16,info.index*.28),kind,boss,main,actBoss,name,faction:info.actTitle,slow:0,burn:0,burnTime:0,stun:0,hit:0,attack:0});
 spawned++;
};
hud=function(){
 legacyHud();
 const info=campaignAt();
 $('region').textContent=info.name;
 $('chapter').textContent=`ACT ${String(info.act).padStart(2,'0')} · CHAPTER ${String(info.chapter).padStart(2,'0')} / ${info.actEng}`;
 $('wave').textContent=`WAVE ${String(state.wave).padStart(4,'0')}`+(bossWave()?(info.isActBoss?' · ACT BOSS':info.isRegionBoss?' · REGION BOSS':' · ELITE'):'');
 const tagline=document.querySelector('.tagline');
 if(tagline)tagline.textContent=`${info.actTitle} · ${info.mobs.join(' · ')}${info.isRegionBoss?' · '+info.boss:''}`;
 if(phase==='victory')$('phase').textContent='CAMPAIGN CLEAR · 5,000 WAVE 방어 완료';
};
update=function(dt){
 if(state.campaignCleared){phase='victory';phaseTimer=Number.POSITIVE_INFINITY;return}
 legacyUpdate(dt);
 if(state.wave>MAX_CAMPAIGN_WAVE){
   state.wave=MAX_CAMPAIGN_WAVE;
   state.best=Math.min(MAX_CAMPAIGN_WAVE,Math.max(state.best,MAX_CAMPAIGN_WAVE));
   state.campaignCleared=true;
   enemies=[];effects=[];phase='victory';phaseTimer=Number.POSITIVE_INFINITY;
   save();hud();toast('5,000 웨이브 방어 완료 · 최후의 지평선을 지켜냈습니다.');
 }
};
function campaignProgress(){
 const info=campaignAt(),completed=Math.max(0,state.wave-1);
 return {wave:state.wave,maxWave:MAX_CAMPAIGN_WAVE,percent:Math.min(100,completed/MAX_CAMPAIGN_WAVE*100),...info};
}
window.Campaign={maxWave:MAX_CAMPAIGN_WAVE,acts:CAMPAIGN_ACTS,regions:CAMPAIGN_REGIONS,at:campaignAt,progress:campaignProgress};
if(window.Game){
 Game.campaignAt=campaignAt;
 Game.campaignProgress=campaignProgress;
 Game.maxWave=MAX_CAMPAIGN_WAVE;
 Game.update=update;
}
hud();
