'use strict';
/* Phase 7 reference-match pass 1: battlefield composition, depth, combat dock and speed presets. */
(()=>{
 const lanes=window.SunsetV12?.lanes||[315,359,403,447,491];
 const laneScale=[.72,.82,.92,1.02,1.12];
 const originalPosition=position;
 position=function(id){const i=Math.max(0,state.slots.indexOf(id));const h=hero(id),front=['탱커','근거리'].includes(h?.role);const lane=lanes[Math.min(lanes.length-1,i)]??originalPosition(id).y;return {x:front?270:182+(i%2)*24,y:lane}};
 if(window.Game)Game.position=position;
 const originalDrawEnemy=drawEnemy;
 drawEnemy=function(e){const lane=Number.isInteger(e?.lane)?Math.max(0,Math.min(4,e.lane)):2;const s=e?.boss?Math.max(.9,laneScale[lane]):laneScale[lane];const px=e?.x||0,py=e?.y||0;ctx.save();ctx.translate(px,py);ctx.scale(s,s);ctx.translate(-px,-py);originalDrawEnemy(e);ctx.restore()};
 function makeSpeedDock(){if(document.getElementById('v13SpeedDock'))return;const dock=document.createElement('div');dock.id='v13SpeedDock';dock.setAttribute('aria-label','전투 배속');[1,2,3].forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent='x'+n;b.dataset.speed=String(n);b.setAttribute('aria-label','배속 x'+n);b.addEventListener('click',()=>setSpeed(n));dock.appendChild(b)});document.body.appendChild(dock);syncSpeedDock()}
 function setSpeed(n){try{speed=n}catch{}const original=document.getElementById('speed');if(original){original.textContent='x'+n;original.dataset.v12Speed=String(n)}syncSpeedDock()}
 function syncSpeedDock(){const dock=document.getElementById('v13SpeedDock');if(!dock)return;let current=1;try{current=Number(speed)||1}catch{}dock.querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===current))}
 const dockEntries=[['♙','영웅','영웅'],['◇','인벤토리','장비'],['▣','상점','상점'],['⌂','마을','마을 강화'],['▦','전투 배치','전투 배치'],['☼','설정','설정']];
 function makeCombatDock(){if(document.getElementById('v13CombatDock'))return;const dock=document.createElement('div');dock.id='v13CombatDock';dock.setAttribute('aria-label','전투 빠른 메뉴');dockEntries.forEach(([icon,label,panel])=>{const b=document.createElement('button');b.type='button';b.innerHTML='<span class="v13-icon">'+icon+'</span><span>'+label+'</span>';b.setAttribute('aria-label',label);b.addEventListener('click',()=>{if(window.Game?.open)Game.open(panel)});dock.appendChild(b)});document.body.appendChild(dock)}
 function moveBossBar(){const box=document.getElementById('v12BossBar'),battle=document.getElementById('battle');if(box&&battle&&box.parentElement!==battle)battle.appendChild(box)}
 function updateCombatMode(){const active=!!window.Game&&!document.body.classList.contains('booting')&&window.Game.state?.session!==false;document.documentElement.classList.toggle('v13-combat',active);moveBossBar();syncSpeedDock();requestAnimationFrame(updateCombatMode)}
 makeSpeedDock();makeCombatDock();requestAnimationFrame(updateCombatMode);window.ReferencePass1={lanes,laneScale,setSpeed};
})();
