/* Pixel prototype: all art is drawn directly with Canvas rectangles. No image files. */
const PixelArt=(()=>{
 const palettes={su:['#26222a','#302934','#5482a0','#b48652'],chel:['#e9c66d','#282731','#6c91a7','#a67a45'],buck:['#6b4230','#577579','#524838','#b28b50'],rose:['#a64f3d','#913f51','#354657','#775039'],june:['#493427','#e5d5aa','#597663','#657c4d'],ash:['#44383c','#78618d','#3d485c','#654b3b']};
 function box(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
 function hero(g,id,attack=0,t=0){const p=palettes[id]||palettes.su,r=(x,y,w,h,c)=>box(g,x,y,w,h,c),skin='#edb585',dark='#242735';let step=attack?1:Math.floor(t*2)%2;
 r(7,36,21,2,'#29252b55');r(11,23,7,9,p[2]);r(20,23,6,9,p[2]);r(10-step,31,8,5,p[3]);r(21+step,31,8,5,p[3]);r(10-step,35,10,2,dark);r(21+step,35,10,2,dark);
 r(8,8,12,16,p[0]);r(9,10,3,18,p[0]);r(13,8,10,9,skin);r(21,10,4,4,skin);r(21,10,2,2,dark);r(15,16,6,3,skin);r(11,18,13,8,p[1]);r(15,18,5,6,'#f6e3be');r(10,18,4,8,p[1]);r(21,18,4,8,p[1]);r(11,25,15,2,'#67432b');r(18,25,3,2,'#edc56a');r(11,27,3,4,'#644331');
 r(10,3,13,6,p[3]);r(8,7,18,3,p[3]);r(5,9,24,2,p[3]);r(11,6,12,2,'#513a2d');r(20,6,2,2,'#f1ce78');
 if(id==='buck'){r(7,17,10,14,p[1]);r(5,22,3,8,skin);r(3,22,10,11,'#80603c');r(4,23,8,2,'#bd9e61');r(7,23,2,9,'#4c3931');let y=attack?12:21;r(24,18,6,4,skin);r(28,y,3,16,'#85542d');r(25,y-4,9,7,'#929992');r(24,y-2,11,3,'#c0beb0');}
 else if(id==='rose'){r(24,19,6,3,skin);r(28,16,2,10,'#ddb866');r(30,attack?13:18,13,2,'#dae7e5');r(42,attack?12:17,3,2,'#fff0d0');}
 else if(id==='june'){r(8,19,4,9,skin);r(5,25,10,8,'#e4d8b6');r(9,26,2,6,'#b9564c');r(7,28,6,2,'#b9564c');r(24,20,7,3,skin);r(29,18,8,3,'#777e82');r(30,21,3,4,'#674632');}
 else if(id==='ash'){r(24,18,8,3,skin);r(30,15,5,8,'#b35339');r(32,12,2,4,'#e4c478');if(attack)r(34,11,3,3,'#ffcf65');r(7,20,4,7,skin);}
 else {r(24,18,9,3,skin);r(31,17,4,4,'#6b4932');r(32,15,10,3,'#a4a8a4');r(32,18,3,5,'#755438');r(35,18,3,2,'#444652');if(attack){r(43,14,5,5,'#ffdc77');r(48,16,3,2,'#fff3b3');}}
 }
 function enemy(g,id,t=0,boss=false){const r=(x,y,w,h,c)=>box(g,x,y,w,h,c),step=Math.floor(t*6)%2*2;
 if(['boar','wolf','cat'].includes(id)){let body=id==='boar'?'#af7362':id==='wolf'?'#7f8b94':'#c79859',light=id==='boar'?'#dc9b82':id==='wolf'?'#aab5b8':'#edbd71';r(8,17,20,11,body);r(3,14,11,12,body);r(1,20,7,5,light);r(5,10,4,6,body);r(11,11,3,5,body);r(4,17,2,2,'#302936');r(10,27,4,7-step,body);r(23,27,4,5+step,body);r(28,16,5,3,body);if(id==='boar'){r(2,23,2,4,'#f6e7c3');r(6,21,1,2,'#754535');}if(id==='cat'){r(28,10,3,9,body);r(29,9,4,3,body);}if(id==='wolf'){r(10,18,4,7,light);r(30,13,5,3,body);}}
 else {let zombie=id==='zombie',skin=zombie?'#8baf7b':'#c58b61';r(12,4,13,11,zombie?'#5b675b':'#48342b');r(10,8,12,9,skin);r(11,10,2,2,'#c94544');r(12,17,12,12,zombie?'#586976':'#ad8556');r(6,18,10,3,skin);r(2,19,6,3,skin);r(13,29,4,7-step,'#46443e');r(22,28,4,6+step,'#46443e');if(zombie){r(16,20,3,5,'#a47469');r(21,28,4,3,skin);}else{r(4,17,3,15,'#6b4731');r(2,14,7,7,'#87857b');r(15,19,3,3,'#584131');r(20,25,4,3,'#584131');}}
 if(boss){r(7,1,20,3,'#d9ac4b');r(7,-3,3,5,'#f4cf6f');r(16,-4,3,5,'#f4cf6f');r(24,-3,3,5,'#f4cf6f');}
 }
 function background(g,ch){const r=(x,y,w,h,c)=>box(g,x,y,w,h,c);const sky=['#d7b581','#b3bba4','#596576'][ch],land=['#c89562','#a28c66','#626962'][ch];r(0,0,360,150,sky);r(275,15,18,18,ch===2?'#ddd9ab':'#f7d98b');r(280,12,8,24,ch===2?'#ddd9ab':'#f7d98b');
 for(let i=0;i<9;i++){let x=62+i*39,h=12+(i*17)%28;r(x,74-h,35,h,ch===2?'#414f59':'#9c8064');r(x+7,65-h,20,10,ch===2?'#414f59':'#9c8064');}r(0,75,360,75,land);r(0,104,360,25,ch===2?'#7a7970':'#d5b184');
 for(let i=0;i<70;i++){let x=(i*67)%360,y=80+(i*31)%70;r(x,y,2+i%3,1,ch===2?'#505e54':'#b28456');}
 // The western village remains on the defended left side in every chapter.
 for(let i=0;i<3;i++){let x=3+i*15,y=49+i%2*15;r(x,y,14,43,'#674b38');r(x-2,y-3,18,5,'#473b33');r(x+2,y+4,10,3,'#b99561');r(x+4,y+14,5,8,'#e2be76');r(x+4,y+31,6,12,'#382f2c');for(let j=0;j<4;j++)r(x,y+12+j*7,14,1,'#96704c');}r(0,99,49,3,'#ad8852');for(let y=87;y<146;y+=12){r(44,y,3,10,'#63472f');r(42,y+4,7,2,'#b18b54');}
 if(ch===0){for(let x of [170,236,324]){r(x,68,3,17,'#62784c');r(x-4,72,4,3,'#62784c');r(x-5,67,2,8,'#62784c');r(x+3,76,4,3,'#62784c');r(x+6,71,2,8,'#62784c');}}
 if(ch===1){for(let x of [181,260,322]){r(x,59,15,23,'#716853');r(x+3,55,9,5,'#716853');r(x+5,67,5,15,'#3b4037');r(x+19,73,5,9,'#70684e');}}
 if(ch===2){for(let x of [160,218,278,333]){r(x,69,5,14,'#8b9390');r(x-3,73,11,3,'#8b9390');r(x-3,84,14,2,'#49574e');}r(300,32,3,45,'#394a47');r(290,42,10,3,'#394a47');r(288,33,3,11,'#394a47');r(303,52,14,3,'#394a47');r(315,44,3,10,'#394a47');r(135,92,75,2,'#a2aaa17a');r(255,101,85,2,'#a2aaa17a');}
 }
 function item(g,id){const r=(x,y,w,h,c)=>box(g,x,y,w,h,c);let c=id==='fire'?'#d38247':id==='ice'?'#8bd0dc':'#a8b3b1';if(['iron','fire','ice'].includes(id)){r(6,12,id==='ice'?25:21,4,c);r(9,16,8,5,'#647174');r(8,19,5,11,'#906143');r(20,13,3,2,'#dce2cf');}else if(id==='mace'){r(18,13,3,20,'#a87b4c');r(12,5,15,11,'#8b9a9b');r(10,8,19,4,'#c0c7bd');}else if(id==='saber'){r(18,4,3,22,'#dae2d5');r(12,24,15,3,'#d7ae60');r(18,27,3,6,'#825337');}else if(['vest','coat'].includes(id)){r(8,7,7,23,'#a57948');r(23,7,7,23,'#a57948');r(15,12,8,18,'#6d5137');r(8,28,22,id==='coat'?7:2,'#a57948');r(17,17,3,3,'#e1c373');}else if(id==='star'){r(16,4,5,29,'#e2bb61');r(5,15,27,6,'#e2bb61');r(9,10,20,17,'#e2bb61');r(15,14,7,8,'#aa7838');}else{r(17,9,3,25,'#9bb77b');r(8,12,10,5,'#678f5f');r(20,17,10,5,'#8eaf71');r(11,25,8,5,'#678f5f');}}
 function thumb(canvas){let g=canvas.getContext('2d'),id=canvas.dataset.pixel;if(!g)return;g.imageSmoothingEnabled=false;g.clearRect(0,0,canvas.width,canvas.height);g.save();if(id.startsWith('bg')){g.scale(canvas.width/360,canvas.height/150);background(g,Number(id.slice(2))%3);}else{g.scale(canvas.width/48,canvas.height/42);if(palettes[id])hero(g,id);else item(g,id);}g.restore();canvas.dataset.painted='1';}
 function paint(){document.querySelectorAll('canvas[data-pixel]:not([data-painted])').forEach(thumb);}
 return {hero,enemy,background,paint};
})();
