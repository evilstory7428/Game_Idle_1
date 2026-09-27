'use strict';
(() => {
  const V12_LANES = [315,359,403,447,491];
  const HERO_MAP = {su:'nancy',ash:'luna',buck:'elona',june:'jessie',julie:'julie',chel:'chelly',rose:'tina'};
  const HERO_ATLAS = {
    nancy:{x:3088,y:4,w:660,h:440}, luna:{x:4,y:448,w:660,h:440}, elona:{x:668,y:448,w:660,h:440},
    jessie:{x:1332,y:448,w:660,h:440}, julie:{x:1996,y:448,w:660,h:440}, chelly:{x:2660,y:448,w:660,h:440}, tina:{x:3324,y:448,w:660,h:440}
  };
  const ATLAS = {
    bg0:{x:4,y:4,w:1024,h:427}, bg1:{x:1032,y:4,w:1024,h:427}, bg2:{x:2060,y:4,w:1024,h:427},
    boar_run:{x:4,y:892,w:740,h:76}, boar_death:{x:748,y:892,w:790,h:68},
    wolf_run:{x:1542,y:892,w:726,h:71}, wolf_death:{x:2272,y:892,w:770,h:63},
    cat_run:{x:3046,y:892,w:832,h:71}, cat_death:{x:4,y:972,w:872,h:63},
    caveman_run:{x:880,y:972,w:742,h:96}, caveman_death:{x:1626,y:972,w:736,h:88},
    zombie_run:{x:2366,y:972,w:750,h:117}, zombie_death:{x:3120,y:972,w:812,h:116}
  };
  const ENEMY_HEIGHT = {boar:170,wolf:164,cat:150,caveman:205,zombie:210};
  const TERRAIN_DROP = {boar:34,wolf:30,cat:36,caveman:26,zombie:22};
  const corpses=[];
  let atlas=null, atlasReady=false;

  function loadAtlas(){
    const chunks=window.__SUNSET_V12_ATLAS_CHUNKS;
    if(!Array.isArray(chunks)||!chunks.length)return;
    const im=new Image();
    im.onload=()=>{
      const cv=document.createElement('canvas'); cv.width=im.naturalWidth; cv.height=im.naturalHeight;
      const cx=cv.getContext('2d',{willReadFrequently:true}); cx.drawImage(im,0,0);
      const img=cx.getImageData(0,0,cv.width,cv.height), d=img.data;
      for(let i=0;i<d.length;i+=4){
        const r=d[i],g=d[i+1],b=d[i+2];
        if(r>185&&b>185&&g<135){
          const k=Math.min(1,Math.max(0,(Math.min(r,b)-Math.max(g,85))/115));
          d[i+3]=Math.round(255*(1-k));
        }
      }
      cx.putImageData(img,0,0); atlas=cv; atlasReady=true;
      window.__SUNSET_V12_ATLAS_CHUNKS.length=0;
    };
    im.src='data:image/jpeg;base64,'+chunks.join('');
  }
  loadAtlas();

  const oldImageAt=imageAt;
  imageAt=function(id,x,y,w,h){
    const p=ATLAS[id];
    if(atlasReady&&p){ctx.drawImage(atlas,p.x,p.y,p.w,p.h,x,y,w,h);return;}
    return oldImageAt(id,x,y,w,h);
  };

  function heroFrame(id,row,col,x,y,height=158,alpha=1){
    const name=HERO_MAP[id], p=HERO_ATLAS[name]; if(!atlasReady||!p)return false;
    const cw=p.w/6,ch=p.h/4,scale=height/ch,w=cw*scale;
    ctx.save(); ctx.globalAlpha*=alpha; ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(atlas,p.x+col*cw,p.y+row*ch,cw,ch,x-w*.5,y-height+18,w,height); ctx.restore(); return true;
  }
  const oldDrawHero=drawHero;
  drawHero=function(id,x,y){
    if(!atlasReady)return oldDrawHero(id,x,y);
    const a=actor(id), attack=a.__v12Motion>0, row=attack?1:0;
    const fps=attack?13:6, col=Math.floor((time*fps+(state.slots.indexOf(id)+1)*.7)%6);
    ellipse(x,y+8,24,6,'rgba(8,20,28,.22)');
    heroFrame(id,row,col,x,y,158,a.hp<=0?.3:1);
    rect(x-25,y+16,50,4,'#102127cc'); rect(x-25,y+16,50*Math.max(0,a.hp/stats(id).hp),4,'#7ff0d4');
    if(a.hp<=0)label(Math.ceil(a.dead)+'s',x,y-52,13,'#f2d6a2'); else if(a.reload>0)label('장전',x,y+33,10,'#fff0c9');
  };

  const oldFire=fire;
  fire=function(id,e,ultimate=false){ const a=actor(id); a.__v12Motion=ultimate?.55:.36; return oldFire(id,e,ultimate); };

  function chooseLane(boss){
    if(boss)return 2;
    const counts=V12_LANES.map((_,i)=>enemies.reduce((n,e)=>n+(e.hp>0&&e.lane===i?1:0),0));
    const min=Math.min(...counts), candidates=counts.map((n,i)=>n===min?i:-1).filter(i=>i>=0);
    return candidates[Math.floor(Math.random()*candidates.length)];
  }
  const oldSpawn=spawn;
  spawn=function(){
    const before=enemies.length; oldSpawn();
    const e=enemies[enemies.length-1]; if(!e||enemies.length===before)return;
    e.lane=chooseLane(e.boss); e.y=V12_LANES[e.lane]; e.__runSeed=Math.random()*8;
  };

  const oldInReach=inReach;
  inReach=function(id,e){ const p=position(id); return Math.abs((e.y||0)-p.y)<=27 && oldInReach(id,e); };

  function captureDeath(e){
    if(!e||e.__v12DeathCaptured)return; e.__v12DeathCaptured=true;
    corpses.push({id:enemyArt(e),x:e.x,y:e.y,boss:!!e.boss,main:!!e.main,t:0,duration:e.boss?1.08:.84,seed:e.__runSeed||0});
  }
  const oldHit=hit;
  hit=function(e,d,id,critical=false){ const was=e&&e.hp>0; const r=oldHit(e,d,id,critical); if(was&&e.hp<=0)captureDeath(e); return r; };
  const oldHitBurn=hitBurn;
  hitBurn=function(e,d){ const was=e&&e.hp>0; const r=oldHitBurn(e,d); if(was&&e.hp<=0)captureDeath(e); return r; };

  const oldUpdate=update;
  update=function(dt){
    const r=oldUpdate(dt); corpses.forEach(c=>c.t+=dt);
    for(let i=corpses.length-1;i>=0;i--)if(corpses[i].t>=corpses[i].duration)corpses.splice(i,1);
    Object.values(runtime).forEach(a=>{if(a.__v12Motion>0)a.__v12Motion=Math.max(0,a.__v12Motion-dt)});
    return r;
  };

  function drawEnemySprite(e,dead=false){
    if(!atlasReady)return false;
    const id=e.id||enemyArt(e), p=ATLAS[id+'_'+(dead?'death':'run')]; if(!p)return false;
    const frames=8, fw=p.w/frames, fh=p.h;
    const frame=dead?Math.min(7,Math.floor((e.t/e.duration)*8)):Math.floor((time*(id==='caveman'||id==='zombie'?10:12)+(e.__runSeed||0))%8);
    const base=ENEMY_HEIGHT[id]||170, mult=e.boss?(e.main?2.45:1.78):1, h=base*mult, w=fw*(h/fh);
    const drop=(TERRAIN_DROP[id]||26)*(e.boss?.78:1), x=e.x, y=e.y+drop;
    ctx.save(); ctx.translate(x,y); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ellipse(0,12,w*(e.boss?.46:.36),e.boss?13:8,'rgba(8,18,24,'+(e.boss?.25:.18)+')');
    if(!dead&&e.hit>0)ctx.filter='brightness(1.45) saturate(1.2)';
    if(dead){ const q=e.t/e.duration; ctx.globalAlpha=Math.max(0,1-Math.max(0,q-.68)/.32); }
    ctx.drawImage(atlas,p.x+frame*fw,p.y,fw,fh,-w*.5,-h+18,w,h); ctx.filter='none';
    if(!dead){
      if(e.boss)label(e.main?'MAIN BOSS':'ELITE',0,-h-14,10,'#ffe7b5');
      rect(-29,-h-6,58,5,'rgba(9,19,30,.78)'); rect(-29,-h-6,58*Math.max(0,e.hp/e.max),5,e.boss?'#ff4d4d':'#79ead0');
      if(e.burnTime>0&&e.burn)label('♨',w/3,-h/2,16,'#ffb251');
    }
    ctx.restore(); return true;
  }
  const oldDrawEnemy=drawEnemy;
  drawEnemy=function(e){ if(!drawEnemySprite(e,false))oldDrawEnemy(e); };
  const oldDraw=draw;
  draw=function(){ const r=oldDraw(); corpses.sort((a,b)=>a.y-b.y).forEach(c=>drawEnemySprite(c,true)); return r; };

  function ensureBossBar(){
    let box=document.getElementById('v12BossBar'); if(box)return box;
    const host=document.querySelector('.wavebox'); if(!host)return null;
    box=document.createElement('div'); box.id='v12BossBar';
    box.innerHTML='<div class="v12-boss-label">BOSS</div><div class="v12-boss-track"><i></i></div><small></small>';
    host.appendChild(box); return box;
  }
  function uiTick(){
    const box=ensureBossBar(), boss=enemies.find(e=>e.boss&&e.hp>0);
    if(box){
      box.hidden=!boss;
      if(boss){ const ratio=Math.max(0,Math.min(1,boss.hp/boss.max)); box.querySelector('i').style.width=(ratio*100)+'%'; box.querySelector('.v12-boss-label').textContent=boss.main?'MAIN BOSS':'ELITE BOSS'; box.querySelector('small').textContent=Math.ceil(boss.hp).toLocaleString()+' / '+Math.ceil(boss.max).toLocaleString(); }
    }
    const s=$('speed'); if(s){ const m=(s.textContent||'').match(/(?:×|x)\s*(\d+)/i); if(m)s.textContent='x'+m[1]; }
    const p=$('pause'); if(p)p.hidden=true;
    requestAnimationFrame(uiTick);
  }
  requestAnimationFrame(uiTick);
  window.SunsetV12={lanes:V12_LANES,get atlasReady(){return atlasReady},get corpses(){return corpses}};
})();
