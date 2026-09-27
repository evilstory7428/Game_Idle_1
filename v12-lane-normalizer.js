'use strict';
/* Keep every living enemy, including Phase 2 summoned reinforcements, on one of
   the five invisible V12 terrain lanes. */
(()=>{
 if(typeof update!=='function'||!window.SunsetV12)return;
 const lanes=window.SunsetV12.lanes||[315,359,403,447,491];
 const nearest=y=>{let best=0,dist=Infinity;for(let i=0;i<lanes.length;i++){const d=Math.abs((y??lanes[i])-lanes[i]);if(d<dist){dist=d;best=i}}return best};
 function normalizeEnemy(e){
  if(!e||e.hp<=0)return;
  if(!Number.isInteger(e.lane)||e.lane<0||e.lane>=lanes.length){e.lane=e.boss?2:nearest(e.y);e.__runSeed??=Math.random()*8;}
  e.y=lanes[e.lane];
 }
 enemies.forEach(normalizeEnemy);
 const oldUpdate=update;
 update=function(dt){const r=oldUpdate(dt);enemies.forEach(normalizeEnemy);return r};
 if(window.Game)window.Game.update=update;
 window.V12LaneNormalizer={lanes,normalizeEnemy};
})();
