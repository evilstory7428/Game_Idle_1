'use strict';
/* Mobile/PWA runtime rebuilt on top of the latest 5,000-wave/v3 branch. */
(()=>{
 const root=document.documentElement;
 const coarse=matchMedia('(pointer: coarse)'),portrait=matchMedia('(orientation: portrait)');
 const standalone=matchMedia('(display-mode: standalone)'),fullscreenMode=matchMedia('(display-mode: fullscreen)');
 let immersiveAttempted=false,lastPhase='';
 const isStandalone=()=>standalone.matches||fullscreenMode.matches||navigator.standalone===true;
 const isFullscreen=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 function viewport(){
  const vv=visualViewport,w=Math.max(1,Math.floor(vv?.width||innerWidth||document.documentElement.clientWidth)),h=Math.max(1,Math.floor(vv?.height||innerHeight||document.documentElement.clientHeight));
  const logicalW=coarse.matches?Math.max(w,h):w,logicalH=coarse.matches?Math.min(w,h):h;
  root.style.setProperty('--physical-vw',w+'px');root.style.setProperty('--physical-vh',h+'px');root.style.setProperty('--mobile-vvw',logicalW+'px');root.style.setProperty('--mobile-vvh',logicalH+'px');
  root.classList.toggle('touch-device',coarse.matches);root.classList.toggle('force-landscape',coarse.matches);root.classList.toggle('mobile-portrait',coarse.matches&&portrait.matches);root.classList.toggle('mobile-landscape',coarse.matches&&!portrait.matches);root.classList.toggle('game-fullscreen',isFullscreen()||isStandalone());
 }
 async function requestFullscreen(){if(isFullscreen()||isStandalone())return true;const el=document.documentElement,fn=el.requestFullscreen||el.webkitRequestFullscreen;if(!fn)return false;try{try{await fn.call(el,{navigationUI:'hide'})}catch{await fn.call(el)}return true}catch{return false}}
 async function lockLandscape(){if(!screen.orientation?.lock)return false;try{await screen.orientation.lock('landscape');return true}catch{try{await screen.orientation.lock('landscape-primary');return true}catch{return false}}}
 async function immersive(){if(immersiveAttempted||!coarse.matches)return;immersiveAttempted=true;await requestFullscreen();await lockLandscape();settle()}
 function waveState(){const phase=window.Game?.phase||'';if(phase!==lastPhase){lastPhase=phase;root.classList.toggle('wave-active',coarse.matches&&phase==='fight')}}
 function watch(){waveState();requestAnimationFrame(watch)}
 function settle(){viewport();waveState();if(coarse.matches&&(isFullscreen()||isStandalone()))lockLandscape();requestAnimationFrame(viewport);setTimeout(viewport,80);setTimeout(viewport,280)}
 document.addEventListener('pointerdown',immersive,{passive:true,once:true,capture:true});document.addEventListener('touchstart',immersive,{passive:true,once:true,capture:true});
 for(const event of ['pageshow','orientationchange','resize','focus'])addEventListener(event,settle,{passive:true});document.addEventListener('fullscreenchange',settle);document.addEventListener('webkitfullscreenchange',settle);visualViewport?.addEventListener('resize',settle,{passive:true});visualViewport?.addEventListener('scroll',viewport,{passive:true});coarse.addEventListener?.('change',settle);portrait.addEventListener?.('change',settle);standalone.addEventListener?.('change',settle);fullscreenMode.addEventListener?.('change',settle);
 if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}),{once:true});
 settle();watch();window.MobileGame={settle,requestFullscreen,lockLandscape,get immersive(){return isFullscreen()||isStandalone()}};
})();
