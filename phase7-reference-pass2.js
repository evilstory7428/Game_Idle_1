'use strict';
/* Phase 7 reference-match pass 2: combat impact, density, drops and polished dock icons. */
(()=>{
 if(!window.Game)return;
 const damageFx=[],impactFx=[],drops=[];
 let bossPulse=0;
 const lanes=window.SunsetV12?.lanes||[315,359,403,447,491];
 const laneScale=window.ReferencePass1?.laneScale||[.72,.82,.92,1.02,1.12];
 const nearestLane=y=>{let best=0,d=Infinity;for(let i=0;i<lanes.length;i++){const q=Math.abs((y||lanes[i])-lanes[i]);if(q<d){d=q;best=i}}return best};
 const scaleAt=y=>laneScale[nearestLane(y)]||1;

 const ICONS={
  '영웅':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 12l-2 2m10-2 2 2"/></svg>',
  '인벤토리':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l4-2 4 2 3 2-2 4v11H7V10L5 6l3-2zM9 4l3 4 3-4"/></svg>',
  '상점':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1-5H5L4 9zm1 0v11h14V9M9 20v-6h6v6"/><path d="M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0"/></svg>',
  '마을':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v10H3V11zM9 21v-7h6v7"/><path d="M6 10v-4m12 4V6"/></svg>',
  '전투 배치':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/></svg>',
  '설정':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></svg>'
 };
 function polishDock(){
  const dock=document.getElementById('v13CombatDock');if(!dock)return false;
  dock.querySelectorAll('button').forEach(b=>{const label=b.getAttribute('aria-label');const icon=b.querySelector('.v13-icon');if(icon&&ICONS[label])icon.innerHTML=ICONS[label]});
  return true;
 }
 let iconTries=0;function iconTick(){if(polishDock()||iconTries++>180)return;requestAnimationFrame(iconTick)}requestAnimationFrame(iconTick);

 function hideLegacyDamage(from){for(let i=from;i<effects.length;i++)if(effects[i]?.type==='text')effects[i].t=0}
 function addDamage(e,damage,critical){
  const boss=!!e?.boss,amount=Math.max(1,Math.ceil(Number(damage)||0));
  damageFx.push({x:(e?.x||0)+(Math.random()-.5)*16,y:(e?.y||0)-42,t:.72,max:.72,text:String(amount),critical:!!critical,boss,drift:(Math.random()-.5)*11});
  impactFx.push({x:e?.x||0,y:(e?.y||0)-28,t:.24,max:.24,critical:!!critical,boss});
 }
 function addDrop(e){
  const lane=Number.isInteger(e?.lane)?e.lane:nearestLane(e?.y);const count=e?.boss?3:Math.random()<.28?2:1;
  for(let i=0;i<count;i++)drops.push({x:(e?.x||0)+(i-(count-1)/2)*22+(Math.random()-.5)*10,y:e?.y||lanes[lane],lane,t:0,duration:e?.boss?3.1:2.35,type:(i===count-1&&Math.random()<.42)?'meat':'coin',vx:(Math.random()-.5)*40,vy:-55-Math.random()*38});
 }

 const prevHit=hit;
 hit=function(e,damage,id,critical=false){
  const alive=e&&e.hp>0,before=e?.hp??0,start=effects.length;const r=prevHit(e,damage,id,critical);hideLegacyDamage(start);
  if(e&&e.hp<before)addDamage(e,damage,critical);if(alive&&e&&e.hp<=0)addDrop(e);return r;
 };
 const prevBurn=hitBurn;
 hitBurn=function(e,d){const alive=e&&e.hp>0,before=e?.hp??0;const r=prevBurn(e,d);if(alive&&e&&e.hp<=0)addDrop(e);else if(e&&e.hp<before&&Math.random()<.13)impactFx.push({x:e.x,y:e.y-24,t:.15,max:.15,critical:false,boss:!!e.boss,ember:true});return r};

 const prevFire=fire;
 fire=function(id,e,ultimate=false){
  if(e&&inReach(id,e)){
   const p=position(id);impactFx.push({type:'shot',x:p.x+24,y:p.y-27,ex:e.x,ey:e.y-28,t:ultimate?.16:.09,max:ultimate?.16:.09,ultimate:!!ultimate});
  }
  return prevFire(id,e,ultimate);
 };
 const prevSpawn=spawn;
 spawn=function(){prevSpawn();const e=enemies[enemies.length-1];if(e?.boss)bossPulse=1.35};
 const prevUpdate=update;
 update=function(dt){
  const r=prevUpdate(dt);bossPulse=Math.max(0,bossPulse-dt);
  const target=state.wave<20?.62:state.wave<100?.56:.50;if(phase==='fight'&&spawned<total()&&spawnTimer>target)spawnTimer=target;
  for(const f of damageFx){f.t-=dt;f.y-=31*dt;f.x+=f.drift*dt}for(let i=damageFx.length-1;i>=0;i--)if(damageFx[i].t<=0)damageFx.splice(i,1);
  for(const f of impactFx)f.t-=dt;for(let i=impactFx.length-1;i>=0;i--)if(impactFx[i].t<=0)impactFx.splice(i,1);
  for(const d of drops){d.t+=dt;d.x+=d.vx*dt;d.vx*=Math.pow(.08,dt);if(d.t<.72){d.y+=d.vy*dt;d.vy+=145*dt}}
  for(let i=drops.length-1;i>=0;i--)if(drops[i].t>=drops[i].duration)drops.splice(i,1);
  return r;
 };

 function drawDust(){
  if(phase!=='fight')return;for(const e of enemies){if(!e||e.hp<=0||e.boss)continue;const s=scaleAt(e.y),seed=e.__runSeed||0,q=(time*2.8+seed)%1;ctx.save();ctx.globalAlpha=.13*(1-q);ctx.fillStyle='#d6b083';const x=e.x+28*s+q*36*s,y=e.y+13*s;ctx.beginPath();ctx.ellipse(x,y,14*s*(.65+q),4.5*s*(.8+q),0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+20*s,y-2*s,8*s*(.6+q),3*s,0,0,Math.PI*2);ctx.fill();ctx.restore()}
 }
 function drawImpacts(){
  for(const f of impactFx){const a=Math.max(0,Math.min(1,f.t/f.max));ctx.save();ctx.globalAlpha=a;
   if(f.type==='shot'){
    const g=ctx.createLinearGradient(f.x,f.y,f.ex,f.ey);g.addColorStop(0,f.ultimate?'#fff5a8':'#fffbd7');g.addColorStop(.38,f.ultimate?'#ff9d32':'#ffd267');g.addColorStop(1,'#ffffff00');ctx.strokeStyle=g;ctx.lineWidth=f.ultimate?4:2;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.ex,f.ey);ctx.stroke();ctx.fillStyle='#fff8c7';ctx.shadowColor='#ffb52f';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(f.x,f.y,f.ultimate?8:5,0,Math.PI*2);ctx.fill();
   }else{
    const r=(1-a)*(f.boss?34:24)+7,grad=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);grad.addColorStop(0,f.ember?'#ff7722':f.critical?'#fff8a8':'#ffffff');grad.addColorStop(.28,f.ember?'#ff4d16':'#ffb52f');grad.addColorStop(1,'#ff5a0000');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=f.critical?'#fff4a3':'#ffbd5a';ctx.lineWidth=2;for(let i=0;i<5;i++){const ang=i*1.256+f.x*.01,len=r*(1.2+i*.06);ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*r*.25,f.y+Math.sin(ang)*r*.25);ctx.lineTo(f.x+Math.cos(ang)*len,f.y+Math.sin(ang)*len);ctx.stroke()}
   }ctx.restore()}
 }
 function drawDamage(){
  for(const f of damageFx){const a=Math.max(0,Math.min(1,f.t/f.max)),size=(f.critical?34:f.boss?28:22)*(1+(1-a)*.08);ctx.save();ctx.globalAlpha=Math.min(1,a*1.6);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.round(size)}px system-ui,-apple-system,"Noto Sans KR",sans-serif`;ctx.lineJoin='round';ctx.lineWidth=f.critical?7:6;ctx.strokeStyle='#351300dd';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.critical?'#ffc928':f.boss?'#fff2de':'#ffffff';ctx.shadowColor=f.critical?'#ff8a00':'#000';ctx.shadowBlur=f.critical?13:3;ctx.fillText(f.text,f.x,f.y);ctx.restore()}
 }
 function drawDrops(){
  for(const d of drops){const s=laneScale[d.lane]||1,q=d.t/d.duration,fade=q>.75?Math.max(0,(1-q)/.25):1,bounce=d.t<.72?0:Math.abs(Math.sin((d.t-.72)*7))*Math.max(0,12-(d.t-.72)*5);ctx.save();ctx.globalAlpha=fade;ctx.translate(d.x,d.y-bounce+12);ctx.scale(s,s);ctx.shadowColor='#0008';ctx.shadowBlur=8;
   if(d.type==='coin'){ctx.fillStyle='#e99610';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd866';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(-2,-2,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b96a08';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('G',1,1)}
   else{ctx.strokeStyle='#f2dfc4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,6);ctx.lineTo(7,-6);ctx.stroke();ctx.fillStyle='#d74737';ctx.beginPath();ctx.ellipse(5,-5,11,7,-.28,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff9c75';ctx.lineWidth=2;ctx.stroke()}
   ctx.restore()}
 }
 function drawBossPulse(){if(bossPulse<=0)return;const a=Math.min(.42,bossPulse*.32),w=c.width,h=c.height;ctx.save();const g=ctx.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.25,w*.5,h*.5,Math.max(w,h)*.62);g.addColorStop(.55,'#ff000000');g.addColorStop(1,`rgba(180,0,18,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle=`rgba(255,56,66,${a+.15})`;ctx.lineWidth=10;ctx.strokeRect(4,4,w-8,h-8);ctx.restore()}
 const prevDraw=draw;
 draw=function(){const r=prevDraw();drawDust();drawImpacts();drawDrops();drawDamage();drawBossPulse();return r};
 if(window.Game){Game.update=update;Game.spawn=spawn;Game.fire=fire;Game.phase7Pass2={get damageFx(){return damageFx},get drops(){return drops}}}
 window.ReferencePass2={damageFx,impactFx,drops};
})();
