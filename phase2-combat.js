'use strict';
/* Phase 2 combat layer: Act-specific enemy roles and boss abilities.
   This wraps the existing battle engine rather than replacing hero/save systems. */
(()=>{
 if(typeof Campaign==='undefined'||!window.Game)return;
 const oldSpawn=spawn,oldHit=hit,oldHitBurn=hitBurn,oldUpdate=update,oldDrawEnemy=drawEnemy,oldImageAt=imageAt;
 const ACT_ARCHETYPES=[
  ['charger','runner','tank'],
  ['brute','ranged','charger'],
  ['runner','ranged','berserker'],
  ['runner','ranged','tank'],
  ['charger','support','ranged'],
  ['runner','support','tank'],
  ['runner','charger','berserker'],
  ['phase','ranged','charger'],
  ['swarm','ranged','tank'],
  ['berserker','support','charger']
 ];
 const ROLE_LABEL={runner:'신속',charger:'돌진',tank:'중장갑',brute:'괴력',ranged:'원거리',support:'지원',berserker:'광폭',phase:'위상',swarm:'증식'};
 function archetypeFor(act,kind,boss=false){
  if(boss)return act%3===1?'boss-assault':act%3===2?'boss-summon':'boss-ward';
  return ACT_ARCHETYPES[Math.max(0,Math.min(9,act-1))][kind%3];
 }
 function decorateEnemy(e){
  const info=Campaign.at(state.wave),type=archetypeFor(info.act,e.kind,e.boss);
  e.act=info.act;e.artId=`act${info.act}-${e.kind%3}`;e.archetype=type;e.roleLabel=e.boss?(e.actBoss?'ACT BOSS':e.main?'REGION BOSS':'ELITE'):ROLE_LABEL[type];
  e.baseSpeed=e.speed;e.baseDamage=e.damage;e.skillTimer=1.2+Math.random()*1.5;e.bossTimer=2.5;e.summonLeft=e.boss?(e.actBoss?4:2):(type==='swarm'?1:0);e.deathHandled=false;e.shield=0;e.armor=0;
  if(type==='runner'){e.baseSpeed*=1.3;e.speed=e.baseSpeed;e.hp*=.82;e.max=e.hp;}
  if(type==='charger'){e.baseSpeed*=1.08;e.speed=e.baseSpeed;e.chargeTimer=2.4+Math.random()*1.4;e.chargeTime=0;}
  if(type==='tank'){e.baseSpeed*=.7;e.speed=e.baseSpeed;e.hp*=1.65;e.max=e.hp;e.armor=.24;}
  if(type==='brute'){e.baseSpeed*=.78;e.speed=e.baseSpeed;e.hp*=1.35;e.max=e.hp;e.damage*=1.35;e.baseDamage=e.damage;e.armor=.1;}
  if(type==='ranged'){e.baseSpeed*=.9;e.speed=e.baseSpeed;e.holdX=e.boss?760:835;e.rangedTimer=.7+Math.random();}
  if(type==='support'){e.hp*=1.15;e.max=e.hp;e.healTimer=2.2;e.baseSpeed*=.82;e.speed=e.baseSpeed;}
  if(type==='berserker'){e.rage=false;}
  if(type==='phase'){e.armor=.18;e.phaseTimer=2.6;}
  if(type==='swarm'){e.hp*=.78;e.max=e.hp;e.swarmTimer=3.5;}
  if(e.boss){e.armor=Math.max(e.armor,e.actBoss ? .18 : .1);e.shield=e.max*(e.actBoss ? .12 : .05);}
  return e;
 }
 spawn=function(){
  oldSpawn();const e=enemies[enemies.length-1];if(!e)return;decorateEnemy(e);
  if(e.boss){const info=Campaign.at(state.wave);toast(`${e.actBoss?'ACT BOSS':e.main?'REGION BOSS':'ELITE'} · ${e.name||info.boss}`);}
 };
 function partyDamage(amount,source){
  const living=state.slots.filter(Boolean).filter(id=>actor(id).hp>0);
  if(living.length){
   living.forEach(id=>{const a=actor(id),d=amount*(1-stats(id).armor);a.hp-=d;if(a.hp<=0)a.dead=stats(id).revive;});
   effects.push({type:'text',x:510,y:265,t:.8,text:source||'광역 공격',color:'#ffc88a'});
  }else baseHP=Math.max(0,baseHP-amount*(1-townArmor()));
 }
 function summonFrom(e,count=1){
  if(e.summonLeft<=0||enemies.length>42)return;
  const info=Campaign.at(state.wave),n=Math.min(count,e.summonLeft);e.summonLeft-=n;
  for(let i=0;i<n;i++){
   const kind=(e.kind+i+1)%3,hp=Math.max(20,e.max*(e.actBoss ? .07 : .11)),damage=Math.max(1,e.damage*.38);
   const m={x:e.x+35+i*18,y:Math.max(330,Math.min(495,e.y-25+i*30)),hp,max:hp,damage,speed:32+info.act,kind,boss:false,main:false,actBoss:false,name:info.mobs[kind]+' 소환체',faction:info.actTitle,slow:0,burn:0,burnTime:0,stun:0,hit:0,attack:0,summoned:true};
   decorateEnemy(m);m.summoned=true;m.summonLeft=0;m.hp=hp;m.max=hp;m.damage=damage;m.baseDamage=damage;enemies.push(m);
  }
  effects.push({type:'text',x:e.x,y:e.y-65,t:.9,text:'증원!',color:'#d8c5ff'});
 }
 function bossSkill(e){
  const mode=e.archetype;
  if(mode==='boss-assault'){
   partyDamage(e.damage*(e.actBoss ? .72 : .5),'보스 충격파');
   e.chargeTime=1.2;e.baseSpeed=Math.max(e.baseSpeed||e.speed,e.speed)*1.12;
  }else if(mode==='boss-summon'){
   summonFrom(e,e.actBoss?2:1);e.hp=Math.min(e.max,e.hp+e.max*.035);
  }else{
   e.shield+=e.max*(e.actBoss ? .1 : .06);e.hp=Math.min(e.max,e.hp+e.max*.025);
   effects.push({type:'text',x:e.x,y:e.y-65,t:.9,text:'보호막',color:'#a9f0e4'});
  }
 }
 function enemyAbilities(dt){
  for(const e of enemies){
   if(e.hp<=0)continue;
   const stunned=e.stun>0;e.speed=e.baseSpeed??e.speed;e.damage=e.baseDamage??e.damage;
   if(e.chargeTime>0){e.chargeTime-=dt;e.speed*=2.45;e.damage*=1.25;}
   if(e.archetype==='charger'){
    e.chargeTimer=(e.chargeTimer??3)-dt;if(e.chargeTimer<=0&&!stunned){e.chargeTime=1;e.chargeTimer=4.2;effects.push({type:'text',x:e.x,y:e.y-50,t:.55,text:'돌진',color:'#ffd08a'});}
   }
   if(e.archetype==='ranged'&&e.x<=e.holdX){
    e.speed=0;e.rangedTimer-=dt;if(e.rangedTimer<=0&&!stunned){partyDamage(e.damage*.44,'원거리 사격');e.rangedTimer=e.boss?1.2:1.9;}
   }
   if(e.archetype==='support'){
    e.healTimer-=dt;if(e.healTimer<=0&&!stunned){const near=enemies.filter(n=>n.hp>0&&Math.abs(n.x-e.x)<190);near.forEach(n=>n.hp=Math.min(n.max,n.hp+n.max*.055));e.healTimer=3.4;effects.push({type:'text',x:e.x,y:e.y-48,t:.7,text:'회복',color:'#b9e7a6'});}
   }
   if(e.archetype==='berserker'&&e.hp/e.max<.42){e.rage=true;e.speed*=1.48;e.damage*=1.42;}
   if(e.archetype==='phase'){
    e.phaseTimer-=dt;if(e.phaseTimer<=0){e.phaseTimer=2.8;e.x=Math.max(215,e.x-70);effects.push({type:'text',x:e.x,y:e.y-45,t:.55,text:'위상 이동',color:'#cfc3ff'});}
   }
   if(e.archetype==='swarm'){
    e.swarmTimer-=dt;if(e.swarmTimer<=0&&!stunned){summonFrom(e,1);e.swarmTimer=5.5;}
   }
   if(e.boss){e.bossTimer-=dt;if(e.bossTimer<=0&&!stunned){bossSkill(e);e.bossTimer=e.actBoss?4.6:6.2;}}
  }
 }
 function deathEffect(e){
  if(e.deathHandled)return;e.deathHandled=true;
  if(e.summoned)killed=Math.max(0,killed-1);
  if(e.archetype==='berserker'&&!e.summoned){partyDamage(e.damage*.28,'광폭 폭발');}
 }
 hit=function(e,damage,id,critical=false){
  if(!e||e.hp<=0)return;const before=e.hp;
  if(e.shield>0){const absorbed=Math.min(e.shield,damage);e.shield-=absorbed;damage-=absorbed;if(absorbed>0)effects.push({type:'text',x:e.x,y:e.y-55,t:.45,text:'SHIELD',color:'#a9f0e4'});}
  damage*=1-Math.min(.65,e.armor||0);if(damage>0)oldHit(e,damage,id,critical);if(before>0&&e.hp<=0)deathEffect(e);
 };
 hitBurn=function(e,d){
  if(!e||e.hp<=0)return;const before=e.hp;let damage=d*(1-Math.min(.65,(e.armor||0)*.55));
  if(e.shield>0){const absorbed=Math.min(e.shield,damage);e.shield-=absorbed;damage-=absorbed;}
  if(damage>0)oldHitBurn(e,damage);if(before>0&&e.hp<=0)deathEffect(e);
 };
 update=function(dt){
  if(phase==='fight')enemyAbilities(dt);oldUpdate(dt);
 };
 enemyArt=function(e){return e.artId||`act${Campaign.at(state.wave).act}-${e.kind%3}`;};
 drawEnemy=function(e){
  const size=e.boss?(e.actBoss?4.7:e.main?4.35:3.45):(e.archetype==='tank'||e.archetype==='brute'?2.85:2.5),h=37*size;
  ctx.save();ctx.translate(Math.round(e.x/4)*4,Math.round(e.y/4)*4);ctx.save();ctx.scale(size,size);ctx.translate(-18,-36);if(e.hit>0)ctx.globalAlpha=.65;PixelArt.enemy(ctx,enemyArt(e),time+e.y,e.boss);ctx.restore();
  if(e.boss){label(e.name||e.roleLabel,0,-h-22,11,'#ffe1a0');label(e.roleLabel,0,-h-10,9,'#f0c36f');}
  else if(e.archetype==='ranged'||e.archetype==='support')label(e.roleLabel,0,-h-7,8,e.archetype==='support'?'#b9e7a6':'#d6d4ef');
  rect(-27,-h+1,54,4,'#16252a');rect(-27,-h+1,54*Math.max(0,e.hp/e.max),4,e.boss?'#ebbb77':'#c58172');
  if(e.shield>0){rect(-27,-h+6,54,2,'#243944');rect(-27,-h+6,54*Math.min(1,e.shield/(e.max*.15)),2,'#8fd9d6');}
  if(e.burnTime>0&&e.burn)label('♨',20,-h/2,16,'#ffb251');if(e.rage)label('!',22,-h/2,15,'#ff8a67');ctx.restore();
 };
 imageAt=function(id,x,y,w,h){
  const info=Campaign.at(state.wave);ctx.save();ctx.translate(x,y);ctx.scale(w/360,h/150);PixelArt.background(ctx,info.act-1);ctx.restore();
 };
 window.Phase2Content={archetypes:ACT_ARCHETYPES,labels:ROLE_LABEL,decorateEnemy,archetypeFor};
 Game.phase2=window.Phase2Content;Game.update=update;Game.spawn=spawn;
})();
