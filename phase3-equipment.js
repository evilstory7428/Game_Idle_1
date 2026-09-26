'use strict';
(()=>{
 if(!window.Game||!window.HeroV3||!window.EquipmentV3Pre)return;
 const LEGACY_KEY='sunset-guard-v2';
 const LEGACY_HERO_IDS=['su','chel','buck','rose','june','ash'];
 const LEGACY_ITEM_IDS=['iron','fire','ice','vest','coat','star','herb','mace','saber'];
 const phase3Save=save,phase3Migrate=migrate,phase3Render=renderPanel,phase3Paint=PixelArt.paint;
 let equipmentSlot=null;
 migrate=function(p){const out=phase3Migrate(p);EquipmentV3Pre.convertGear(out.gear);return out};
 function legacyShadow(){
  const s=JSON.parse(JSON.stringify(state));s.version=2;delete s.progression;delete s.campaignCleared;
  s.owned=(s.owned||[]).filter(id=>LEGACY_HERO_IDS.includes(id));if(!s.owned.includes('su'))s.owned.unshift('su');
  s.slots=(s.slots||[]).map(id=>LEGACY_HERO_IDS.includes(id)?id:null);while(s.slots.length<5)s.slots.push(null);s.slots=s.slots.slice(0,5);if(!s.slots.some(Boolean))s.slots[0]='su';
  s.levels=Object.fromEntries(Object.entries(s.levels||{}).filter(([id])=>LEGACY_HERO_IDS.includes(id)));
  const gear={};for(const id of s.owned){const src=s.gear?.[id]||{},eq={};if(LEGACY_ITEM_IDS.includes(src.weapon))eq.weapon=src.weapon;if(['vest','coat'].includes(src.outfit))eq.armor=src.outfit;if(src.badge==='star')eq.charm='star';else if(src.necklace==='herb')eq.charm='herb';gear[id]=eq}s.gear=gear;
  s.inventory=(s.inventory||[]).filter(id=>LEGACY_ITEM_IDS.includes(id));return s;
 }
 save=function(){phase3Save();if(testMode||saveRecovery)return;try{localStorage.setItem(LEGACY_KEY,JSON.stringify(legacyShadow()))}catch{}};
 gearSlots=function(){return `<div class="equipment-slots paperdoll"><div class="paperdoll-hero">${imageTag(selected,'',hero(selected).name)}</div>`+Object.entries(slotNames).map(([k,n])=>{const item=items.find(x=>x.id===state.gear[selected]?.[k]);return `<button class="equipment-slot ${item?'equipped':''} ${equipmentSlot===k?'active':''}" data-v3-gear-slot="${k}" style="grid-area:${k}" aria-label="${n}: ${item?item.name:'미착용'}"><small>${n}</small>${item?imageTag(item.id,'',item.name):'<span class="empty-gear">＋</span>'}<span>${item?item.name:'미착용'}</span></button>`}).join('')+'</div>'};
 gearInventory=function(){
  if(!equipmentSlot)return '<p class="notice">장비 칸을 먼저 선택하세요. 해당 부위에 장착 가능한 보유 장비만 표시됩니다.</p>';
  const current=state.gear[selected]?.[equipmentSlot],group=items.filter(it=>state.inventory.includes(it.id)&&it.slot===equipmentSlot);
  let html=`<div class="slot-picker"><div class="sectionline"><strong>${slotNames[equipmentSlot]} 장비 선택</strong><small>${group.length}개 보유</small></div>`;
  if(current)html+=`<button data-v3-unequip="${equipmentSlot}">현재 장비 해제</button>`;
  html+=group.map(it=>{const owner=state.owned.find(id=>Object.values(state.gear[id]||{}).includes(it.id)),compatible=canEquip(selected,it);return `<div class="row">${imageTag(it.id,'',it.name)}<div class="grow"><strong>${it.name}</strong><p>${it.desc}</p><span class="dim">${owner?hero(owner).name+' 착용 중':'미착용'}</span></div><button data-equip="${it.id}" ${!compatible||current===it.id?'disabled':''}>${current===it.id?'착용 중':owner?'이전 장착':'장착'}</button></div>`}).join('');
  return html+(group.length?'':'<p class="dim">이 부위에 장착할 보유 장비가 없습니다.</p>')+'</div>';
 };
 equip=function(itemId){const it=items.find(x=>x.id===itemId),slot=equipmentSlot||it?.slot;if(!it||!slot||it.slot!==slot||!state.inventory.includes(itemId)||!state.owned.includes(selected)||!canEquip(selected,it))return;const eq=state.gear[selected]||(state.gear[selected]={});if(eq[slot]===itemId)delete eq[slot];else{for(const id of state.owned){const other=state.gear[id]||{};for(const k of Object.keys(other))if(other[k]===itemId)delete other[k]}eq[slot]=itemId}changed()};
 function patchEquipmentSummary(){if($('drawer').hidden||tab!=='영웅'||!detail)return;for(const card of $('content').querySelectorAll('.summary-card')){if(card.textContent.includes('장비 착용 상태')){const strong=card.querySelector('strong');if(strong)strong.textContent=`${Object.values(state.gear[selected]||{}).length} / 8 부위`}}}
 renderPanel=function(){phase3Render();patchEquipmentSummary();PixelArt.paint()};
 $('content').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v3GearSlot){equipmentSlot=b.dataset.v3GearSlot;renderPanel()}if(b.dataset.v3Unequip){delete state.gear[selected][b.dataset.v3Unequip];equipmentSlot=b.dataset.v3Unequip;changed()}});
 function drawGearThumb(c,id){const g=c.getContext('2d');if(!g)return;g.clearRect(0,0,c.width,c.height);g.save();g.scale(c.width/48,c.height/42);g.fillStyle='#d9bd7b';if(id==='frontier_hat'){g.fillRect(9,12,30,5);g.fillRect(14,7,20,7);g.fillStyle='#6c4933';g.fillRect(13,11,22,2)}if(id==='trail_boots'){g.fillRect(9,8,10,23);g.fillRect(29,8,10,23);g.fillStyle='#714b34';g.fillRect(6,29,14,6);g.fillRect(28,29,14,6)}if(id==='duelist_ring'||id==='sunset_ring'){g.strokeStyle=id==='duelist_ring'?'#d9bd7b':'#b9d2d6';g.lineWidth=4;g.beginPath();g.arc(24,21,10,0,Math.PI*2);g.stroke();g.fillStyle=id==='duelist_ring'?'#e7a04e':'#8fc8ce';g.fillRect(21,7,6,6)}g.restore();c.dataset.v3GearPainted='1'}
 PixelArt.paint=function(){phase3Paint();document.querySelectorAll('canvas[data-pixel="frontier_hat"],canvas[data-pixel="trail_boots"],canvas[data-pixel="duelist_ring"],canvas[data-pixel="sunset_ring"]').forEach(c=>{if(c.dataset.v3GearPainted!=='1')drawGearThumb(c,c.dataset.pixel)})};
 EquipmentV3Pre.convertGear(state.gear);normalizeGear();save();
 Game.save=save;Game.migrate=migrate;Game.equip=equip;Game.gearV3={slots:slotNames,get selectedSlot(){return equipmentSlot},selectSlot:s=>{if(Object.hasOwn(slotNames,s)){equipmentSlot=s;renderPanel()}},legacyShadow};
 window.EquipmentV3=Game.gearV3;
})();
