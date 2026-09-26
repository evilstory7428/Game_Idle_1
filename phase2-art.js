'use strict';
/* Phase 2 procedural art. Keeps the no-raster-image rule while giving all 10 Acts
   distinct silhouettes, palettes and battlefield moods. */
(()=>{
 if(!window.PixelArt)return;
 const oldEnemy=PixelArt.enemy,oldBackground=PixelArt.background;
 const ACT_PALETTES=[
  ['#a85f3f','#e7b56e','#513a31','#f1d59a'],
  ['#9b6b45','#d39a61','#44352d','#d5c087'],
  ['#63795d','#9fb17a','#40384a','#c9d6a2'],
  ['#5c6b72','#b27a45','#2f3840','#d8c078'],
  ['#7d453f','#8da262','#3a343c','#c9b36e'],
  ['#7194aa','#bcd8df','#354755','#e8f5ef'],
  ['#9c4f31','#e58b3f','#432f2b','#ffd07a'],
  ['#66527b','#a58db9','#302f45','#ddd0f0'],
  ['#4d5688','#63b8b4','#292b43','#a9f0e4'],
  ['#5a333c','#b76045','#262630','#e5bd67']
 ];
 const BG=[
  ['#d8b37d','#bf8350','#7c573d','#5f794a'],['#c4ad83','#9a7955','#5c4938','#75664c'],
  ['#68717a','#5d655f','#39464b','#859078'],['#9a8977','#6e6961','#39434b','#9a6845'],
  ['#8b6d65','#665d54','#463e42','#6f814f'],['#9fb8c7','#d4e0df','#657b86','#dfe9e2'],
  ['#a86c4d','#70453c','#3b302e','#d86c38'],['#77718a','#56556f','#303346','#a6a0bf'],
  ['#525c7c','#3f435e','#262838','#5f9e9a'],['#493a46','#2e303a','#1d2028','#a04f3a']
 ];
 const box=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const eye=(g,x,y,c='#f4e1a2')=>box(g,x,y,2,2,c);
 function motif(g,act,kind,p){
  const r=(x,y,w,h,c)=>box(g,x,y,w,h,c);
  if(act===3){r(27,11,5,5,p[3]);r(30,8,2,9,p[1]);}
  if(act===4){r(8,5,5,5,p[1]);r(29,7,5,5,p[1]);r(30,13,2,8,p[3]);}
  if(act===5){r(4,7,5,7,p[1]);r(29,19,6,4,p[1]);}
  if(act===6){r(5,5,4,9,p[3]);r(29,4,3,11,p[1]);r(31,2,2,4,p[3]);}
  if(act===7){r(5,5,3,9,p[1]);r(7,3,3,8,p[3]);r(29,7,4,8,p[1]);}
  if(act===8){r(3,10,7,2,p[3]);r(31,8,5,3,p[1]);}
  if(act===9){r(4,8,5,5,p[3]);r(30,6,4,9,p[1]);eye(g,18,12,p[3]);}
  if(act===10){r(3,5,7,3,p[3]);r(28,4,6,4,p[1]);r(16,1,4,5,p[3]);}
  if(kind===2){r(11,0,4,5,p[2]);r(23,0,4,5,p[2]);}
 }
 function actEnemy(g,id,t=0,boss=false){
  const m=/^act(\d+)-(\d+)$/.exec(id);if(!m)return oldEnemy(g,id,t,boss);
  const act=Math.max(1,Math.min(10,+m[1])),kind=(+m[2])%3,p=ACT_PALETTES[act-1];
  const r=(x,y,w,h,c)=>box(g,x,y,w,h,c),step=Math.floor(t*6)%2*2;
  if(kind===0){
   r(7,17,23,11,p[0]);r(2,13,12,13,p[0]);r(1,20,6,5,p[1]);r(9,27,4,7-step,p[2]);r(24,27,4,5+step,p[2]);
   r(4,10,4,5,p[2]);r(11,11,3,5,p[2]);eye(g,5,17);r(29,15,6,3,p[0]);
   if(act===4){r(14,14,6,3,p[2]);r(19,11,3,5,p[3]);}if(act===6){r(13,13,8,4,p[1]);}if(act===9){r(16,13,4,4,p[3]);}
  }else if(kind===1){
   r(12,5,12,10,p[2]);r(10,10,13,8,p[1]);eye(g,12,11,act===3?'#e35c62':p[3]);r(12,18,12,11,p[0]);
   r(6,19,8,3,p[1]);r(3,20,5,3,p[1]);r(13,29,4,7-step,p[2]);r(22,28,4,6+step,p[2]);
   r(24,19,8,3,p[1]);r(30,16,3,10,p[2]);r(32,15,8,3,p[3]);
   if(act===4){r(15,7,6,5,p[0]);r(5,16,4,4,p[3]);}if(act===8||act===9){r(8,13,3,12,p[3]);}
  }else{
   r(7,10,25,18,p[0]);r(4,14,8,13,p[0]);r(10,5,17,9,p[2]);eye(g,12,10,p[3]);eye(g,23,10,p[3]);
   r(10,28,6,8-step,p[2]);r(24,28,6,6+step,p[2]);r(1,17,7,5,p[1]);r(31,16,6,6,p[1]);
   if(act===2||act===7)r(15,12,9,10,p[1]);if(act===5)r(13,22,12,4,p[1]);if(act===10)r(13,14,11,5,p[3]);
  }
  motif(g,act,kind,p);
  if(boss){
   r(6,-2,24,4,p[3]);r(6,-6,4,6,p[1]);r(16,-8,4,8,p[1]);r(26,-6,4,6,p[1]);
   r(2,36,34,2,'#16191d66');
  }
 }
 function actBackground(g,actIndex=0){
  const act=Math.max(0,Math.min(9,actIndex|0)),c=BG[act],r=(x,y,w,h,col)=>box(g,x,y,w,h,col);
  r(0,0,360,150,c[0]);r(0,72,360,78,c[1]);r(0,104,360,26,c[2]);
  r(278,15,18,18,act===7||act===8?'#d9d4dc':'#efce83');r(283,11,8,25,act===7||act===8?'#d9d4dc':'#efce83');
  for(let i=0;i<8;i++){const x=58+i*43,h=10+(i*19)%30;r(x,73-h,38,h,act>=7?'#36394d':c[2]);}
  for(let i=0;i<60;i++){const x=(i*67)%360,y=80+(i*31)%68;r(x,y,2+i%3,1,act===5?'#dbe8e2':act===6?'#6b3a2f':c[2]);}
  // defended frontier village remains readable in every biome
  for(let i=0;i<3;i++){let x=3+i*15,y=49+i%2*15;r(x,y,14,43,'#674b38');r(x-2,y-3,18,5,'#473b33');r(x+2,y+4,10,3,'#b99561');r(x+4,y+14,5,8,'#e2be76');r(x+4,y+31,6,12,'#382f2c');}
  r(0,99,49,3,'#ad8852');
  if(act===0||act===4){for(const x of [170,236,324]){r(x,65,3,20,c[3]);r(x-5,71,5,3,c[3]);r(x+3,76,5,3,c[3]);}}
  if(act===1){for(const x of [180,260,325]){r(x,55,16,28,'#705f4e');r(x+4,51,8,6,'#705f4e');r(x+5,67,6,16,'#35362f');}}
  if(act===2||act===7){for(const x of [165,225,285,337]){r(x,68,5,15,'#8f9694');r(x-3,73,11,3,'#8f9694');}}
  if(act===3){for(const x of [175,240,310]){r(x,58,24,25,'#4b555c');r(x+5,53,14,6,'#8a6748');r(x+9,65,6,18,'#252d33');}}
  if(act===5){for(const x of [170,230,292,338]){r(x,65,5,19,'#dce8e6');r(x-4,61,13,5,'#b8d0d3');}}
  if(act===6){for(const x of [172,248,320]){r(x,77,18,8,'#3b2c29');r(x+5,68,8,10,'#ce6639');r(x+7,62,4,8,'#ef9a45');}}
  if(act===8){for(const x of [170,235,300]){r(x,56,3,28,c[3]);r(x-6,63,15,3,c[3]);r(x,52,9,4,'#6673a5');}}
  if(act===9){r(220,45,5,40,c[3]);r(200,57,45,5,c[3]);r(209,49,5,23,c[3]);r(232,49,5,23,c[3]);}
 }
 PixelArt.enemy=actEnemy;
 PixelArt.background=actBackground;
 window.Phase2Art={palettes:ACT_PALETTES,backgrounds:BG,enemy:actEnemy,background:actBackground,legacyEnemy:oldEnemy,legacyBackground:oldBackground};
})();
