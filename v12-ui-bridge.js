'use strict';
(()=>{
 const sync=()=>{const b=document.getElementById('speed');if(!b)return;const t=(b.textContent||'').replace('×','x');const m=t.match(/x\s*([123])/i)||t.match(/([123])/);b.dataset.v12Speed=m?m[1]:'1';b.setAttribute('aria-label','배속 x'+b.dataset.v12Speed);};
 const p=document.getElementById('pause');if(p)p.hidden=true;
 sync();
 const b=document.getElementById('speed');if(b)new MutationObserver(sync).observe(b,{childList:true,subtree:true,characterData:true});
 window.addEventListener('click',e=>{if(e.target?.id==='speed')setTimeout(sync,0)});
})();
