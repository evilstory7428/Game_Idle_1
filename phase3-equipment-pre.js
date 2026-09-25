'use strict';
/* Must load after game.js/phase2-ui and before phase3-reference.js.
   Normalizes legacy 3-slot gear into the uploaded reference build's 8-slot model
   before the v3 save is validated. */
(()=>{
 if(!window.Game)return;
 const V3_KEY='sunset-guard-v3-seven';
 const convertGear=gear=>{
  if(!gear||typeof gear!=='object')return gear;
  for(const eq of Object.values(gear)){
   if(!eq||typeof eq!=='object')continue;
   if(eq.armor&&!eq.outfit){eq.outfit=eq.armor;delete eq.armor}
   if(eq.charm){const item=eq.charm;if(item==='star'&&!eq.badge)eq.badge=item;else if(!eq.necklace)eq.necklace=item;delete eq.charm}
  }
  return gear;
 };
 // Change existing item slots in-place so all downstream validation sees v3 slots.
 for(const it of items){if(it.slot==='armor')it.slot='outfit';if(it.id==='star')it.slot='badge';if(it.id==='herb')it.slot='necklace';}
 for(const k of Object.keys(slotNames))delete slotNames[k];
 Object.assign(slotNames,{hat:'모자',outfit:'한벌 옷',boots:'신발',weapon:'무기',necklace:'목걸이',ring1:'반지 1',ring2:'반지 2',badge:'뱃지'});
 const extras=[
  {id:'frontier_hat',name:'황혼의 개척자 모자',slot:'hat',desc:'최대 체력 +12% · 치명타 확률 +3%',hp:.12,crit:.03},
  {id:'trail_boots',name:'사막길 장화',slot:'boots',desc:'최대 체력 +10% · 초당 회복 +1',hp:.1,regen:1},
  {id:'duelist_ring',name:'결투가의 반지',slot:'ring1',desc:'공격력 +8% · 치명타 피해 +8%',atk:.08},
  {id:'sunset_ring',name:'황혼의 반지',slot:'ring2',desc:'공격력 +6% · 흡혈 +2%',atk:.06,leech:.02}
 ];
 for(const it of extras)if(!items.some(x=>x.id===it.id))items.push(it);
 convertGear(state.gear);
 try{const raw=localStorage.getItem(V3_KEY);if(raw){const p=JSON.parse(raw);convertGear(p.gear);localStorage.setItem(V3_KEY,JSON.stringify(p))}}catch{}
 window.EquipmentV3Pre={convertGear,slots:slotNames};
})();
