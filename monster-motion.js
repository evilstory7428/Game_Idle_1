'use strict';
/* Generated enemy run-cycle renderer. Keeps combat math unchanged and replaces static wobble with sprite animation. */
(()=>{
 const paths={boar:'assets/enemies/run/boar-run.webp',wolf:'assets/enemies/run/wolf-run.webp',cat:'assets/enemies/run/cat-run.webp',caveman:'assets/enemies/run/caveman-run.webp',zombie:'assets/enemies/run/zombie-run.webp'};
 const sheets={},ready={};
 const oldDrawEnemy=drawEnemy;
 const FRAME_COUNT=8,CELL_W=220,CELL_H=200;
 const bounce=[0,1,3,1,0,1,3,1],tilt=[-.016,-.008,.006,.014,.016,.008,-.006,-.014];
 const stretchX=[1,1.012,1.022,1.012,1,1.012,1.022,1.012],stretchY=[1,.995,.985,.995,1,.995,.985,.995];
 Object.entries(paths).forEach(([id,src])=>{const im=new Image();im.decoding='async';im.onload=()=>ready[id]=true;im.onerror=()=>ready[id]=false;im.src=src;sheets[id]=im});
 function fpsFor(e){return Math.max(9,Math.min(14,8+(e.speed||30)/7))}
 function frameFor(e){const seed=e._runSeed??(e._runSeed=((e.kind||0)*.173+(e.y||0)*.001)%1);return Math.floor((time*fpsFor(e)+seed*FRAME_COUNT)%FRAME_COUNT)}
 function motionHeight(id,e){const humanoid=id==='caveman'||id==='zombie',base=humanoid?154:114;return base*(e.boss?(e.main?1.72:1.34):1)}
 drawEnemy=function(e){
  const id=enemyArt(e),im=sheets[id];
  if(!ready[id]||!im?.naturalWidth)return oldDrawEnemy(e);
  const frame=frameFor(e),h=motionHeight(id,e),w=h*(CELL_W/CELL_H),groundY=e.y;
  ctx.save();ctx.translate(e.x,groundY);
  ellipse(0,8,w*.31,e.boss?10:7,e.boss?'#07131d55':'#07131d38');
  const b=bounce[frame]*(e.boss?1.12:1),angle=tilt[frame]*(id==='caveman'||id==='zombie'?.65:1);
  ctx.translate(0,-b);ctx.rotate(angle);ctx.scale(stretchX[frame],stretchY[frame]);
  if(e.hit>0)ctx.filter='brightness(1.45) saturate(1.18)';
  ctx.imageSmoothingEnabled=true;if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,frame*CELL_W,0,CELL_W,CELL_H,-w/2,-h+10,w,h);ctx.filter='none';
  if(!e.boss&&frame%2===0){ctx.globalAlpha=.23;ctx.fillStyle=chapter()%3===2?'#74675a':'#d1ad76';ctx.beginPath();ctx.ellipse(w*.13,7,6,2.2,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(-w*.08,8,4,1.6,0,0,7);ctx.fill();ctx.globalAlpha=1}
  if(e.boss)label(e.main?'MAIN BOSS':'ELITE',0,-h-14,10,'#ffe4a8');
  rect(-29,-h-6,58,5,'#101b22dd');rect(-29,-h-6,58*Math.max(0,e.hp/e.max),5,e.boss?'#ffb45f':'#82e9c7');
  if(e.burnTime>0&&e.burn)label('♨',w*.28,-h*.48,16,'#ffad52');ctx.restore();
 };
 window.MonsterMotion={paths,ready,sheets,frames:FRAME_COUNT};
})();