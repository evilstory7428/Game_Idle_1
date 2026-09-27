'use strict';
/* V12 project bridge: use repository image assets now, and automatically prefer
   the staged V12 paths once the heavy binary assets are added. */
(()=>{
 const cfg=window.V12_ASSETS||{}, combat=window.V12_COMBAT||{lanes:[350,390,430,470,510],deathDuration:.85,runFrames:8};
 const heroKey={su:'nancy',ash:'luna',buck:'elona',june:'jessie',julie:'julie',chel:'chelly',rose:'tina'};
 const heroFallback={su:'assets/su.webp',ash:'assets/ash.webp',buck:'assets/buck.webp',june:'assets/june.webp',chel:'assets/chel.webp',rose:'assets/rose.webp'};
 const bgFallback={bg0:'assets/bg0.webp',bg1:'assets/bg1.webp',bg2:'assets/bg2.webp'};
 const enemyFallback={boar:'assets/boar.webp',wolf:'assets/wolf.webp',cat:'assets/cat.webp',caveman:'assets/caveman.webp',zombie:'assets/zombie.webp'};
 const images=new Map();
 function loadOne(key,candidates){
  const list=(candidates||[]).filter(Boolean); let n=0;
  const tryNext=()=>{if(n>=list.length)return;const src=list[n++],im=new Image();im.decoding='async';im.onload=()=>images.set(key,im);im.onerror=tryNext;im.src=src};
  tryNext();
 }
 ['bg0','bg1','bg2'].forEach(k=>loadOne('bg:'+k,[cfg.backgrounds?.[k],bgFallback[k]]));
 Object.entries(heroKey).forEach(([id,key])=>loadOne('hero:'+id,[cfg.heroes?.[key],heroFallback[id]]));
 Object.keys(enemyFallback).forEach(k=>{
  loadOne('enemy:'+k,[enemyFallback[k]]);
  loadOne('run:'+k,[cfg.enemies?.run?.[k]]);
  loadOne('death:'+k,[cfg.enemies?.death?.[k]]);
 });
 const fit=(g,im,x,y,w,h)=>{if(!im?.naturalWidth)return false;g.drawImage(im,x,y,w,h);return true};
 if(window.PixelArt){
  const oldHero=PixelArt.hero,oldBg=PixelArt.background,oldEnemy=PixelArt.enemy;
  PixelArt.background=function(g,act=0){const key='bg'+((act|0)%3),im=images.get('bg:'+key);if(im?.naturalWidth){g.save();g.imageSmoothingEnabled=true;g.drawImage(im,0,0,360,150);g.restore();return}return oldBg(g,act)};
  PixelArt.hero=function(g,id,attack=0,t=0){const im=images.get('hero:'+id);if(!im?.naturalWidth)return oldHero(g,id,attack,t);const bob=Math.sin((t||0)*4.5)*.7,dx=attack?-1.5:0;g.save();g.imageSmoothingEnabled=true;const maxW=42,maxH=40,s=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight);const w=im.naturalWidth*s,h=im.naturalHeight*s;g.drawImage(im,24-w/2+dx,40-h+bob,w,h);g.restore()};
  PixelArt.enemy=function(g,id,t=0,boss=false){let type='zombie',m=/^act(\d+)-(\d+)$/.exec(id);if(m){const a=+m[1],k=+m[2];type=a===1?['boar','wolf','cat'][k%3]:a===2?'caveman':'zombie'}else if(enemyFallback[id])type=id;const im=images.get('enemy:'+type);if(!im?.naturalWidth)return oldEnemy(g,id,t,boss);const h=(type==='caveman'||type==='zombie'?39:31)*(boss?1.6:1),w=h*im.naturalWidth/im.naturalHeight,bob=Math.sin((t||0)*8)*1.1;g.save();g.imageSmoothingEnabled=true;g.drawImage(im,20-w/2,38-h+bob,w,h);g.restore()};
 }
 function enemyType(e){const ch=typeof chapter==='function'?chapter():0;return ch%3===0?['boar','wolf','cat'][e.kind%3]:ch%3===1?'caveman':'zombie'}
 // Keep enemy movement on five invisible terrain lanes without drawing guide lines.
 if(typeof spawn==='function'){
  const priorSpawn=spawn;
  spawn=function(...args){const before=enemies.length,r=priorSpawn(...args),e=enemies[enemies.length-1];if(e&&enemies.length>before){const lane=e.boss?2:((spawned-1+state.wave)%combat.lanes.length);e.lane=lane;e.y=combat.lanes[lane];e.deathT=0}return r};
 }
 function markDying(e){if(!e||e._v12Dying)return;e._v12Dying=true;e._v12DeathT=0;e._v12DeathX=e.x;e._v12DeathY=e.y;e.hp=.000001;e.stun=9999}
 if(typeof hit==='function'){
  const priorHit=hit;hit=function(e,...args){const was=e?.hp||0,r=priorHit(e,...args);if(was>0&&e&&e.hp<=0)markDying(e);return r};
 }
 if(typeof hitBurn==='function'){
  const priorBurn=hitBurn;hitBurn=function(e,...args){const was=e?.hp||0,r=priorBurn(e,...args);if(was>0&&e&&e.hp<=0)markDying(e);return r};
 }
 if(typeof inReach==='function'){
  const priorReach=inReach;inReach=function(id,e){return !e?false:e._v12Dying?false:priorReach(id,e)};
 }
 if(typeof update==='function'){
  const priorUpdate=update;
  update=function(dt){const dying=enemies.filter(e=>e._v12Dying);for(const e of dying){e._v12HoldX=e.x;e.x=99999;e.stun=9999;e.hp=.000001}const r=priorUpdate(dt);for(const e of dying){e.x=e._v12HoldX??e._v12DeathX;e.y=e._v12DeathY;e._v12DeathT=(e._v12DeathT||0)+dt;e.hp=.000001;e.stun=9999}enemies=enemies.filter(e=>!e._v12Dying||(e._v12DeathT||0)<combat.deathDuration);return r};
  if(window.Game)window.Game.update=update;
 }
 // Image-based enemy renderer. It prefers real run/death sheets when those files exist;
 // otherwise it uses the repository's existing enemy artwork with grounded motion.
 if(typeof drawEnemy==='function'){
  const oldDrawEnemy=drawEnemy;
  drawEnemy=function(e){const type=enemyType(e),base=images.get('enemy:'+type),sheet=e._v12Dying?images.get('death:'+type):images.get('run:'+type);if(!base?.naturalWidth&&!sheet?.naturalWidth)return oldDrawEnemy(e);const humanoid=type==='caveman'||type==='zombie',scaleBoss=e.boss?(e.main?2.35:1.65):1,targetH=(humanoid?132:105)*scaleBoss,death=e._v12Dying,p=Math.min(1,(e._v12DeathT||0)/combat.deathDuration);ctx.save();ctx.translate(e.x,e.y);ellipse(0,8,targetH*.28,death?5:7,'rgba(6,15,21,.22)');if(e.hit>0&&!death)ctx.filter='brightness(1.5) saturate(1.2)';if(sheet?.naturalWidth){const frames=combat.runFrames||8,fw=sheet.naturalWidth/frames,fh=sheet.naturalHeight,frame=death?Math.min(frames-1,Math.floor(p*frames)):Math.floor(((time*11)+(e.lane||0)*.7)%frames),w=targetH*(fw/fh),bob=death?0:Math.sin(time*12+(e.lane||0))*1.5;ctx.globalAlpha=death?Math.max(.15,1-p*.75):1;ctx.drawImage(sheet,frame*fw,0,fw,fh,-w/2,-targetH+bob+10,w,targetH)}else{const im=base,w=targetH*(im.naturalWidth/im.naturalHeight),bob=death?0:Math.sin(time*10+(e.lane||0))*2;ctx.globalAlpha=death?Math.max(.1,1-p):1;ctx.rotate(death?-1.15*p:Math.sin(time*7)*.012);ctx.drawImage(im,-w/2,-targetH+bob+10,w,targetH)}ctx.filter='none';if(!death){if(e.boss)label(e.main?'MAIN BOSS':'ELITE',0,-targetH-12,10,'#ffe5b0');rect(-30,-targetH-5,60,5,'#1a0b10c9');rect(-30,-targetH-5,60*Math.max(0,e.hp/e.max),5,e.boss?'#ff3f4d':'#65efd1')}ctx.restore()};
 }
 // Long red boss HP bar under the wave panel.
 const makeBossBar=()=>{if(document.getElementById('v12BossBar'))return;const box=document.querySelector('.wavebox');if(!box)return;const el=document.createElement('div');el.id='v12BossBar';el.innerHTML='<span></span><i></i>';box.appendChild(el)};
 const syncBoss=()=>{makeBossBar();const el=document.getElementById('v12BossBar');if(!el)return;const b=enemies.find(e=>e.boss&&!e._v12Dying&&e.hp>0);if(!b){el.hidden=true;return}el.hidden=false;el.querySelector('span').textContent=(b.main?'MAIN BOSS':'ELITE BOSS')+'  '+Math.max(0,Math.ceil(b.hp)).toLocaleString()+' / '+Math.ceil(b.max).toLocaleString();el.querySelector('i').style.width=(Math.max(0,b.hp/b.max)*100)+'%'};
 setInterval(syncBoss,120);
 window.V12ProjectRuntime={images,combat,heroKey};
})();
