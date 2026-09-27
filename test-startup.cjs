// Startup regression guard. Usage: node test-startup.cjs
const fs=require('node:fs'),assert=require('node:assert/strict');
const boot=fs.readFileSync('boot.js','utf8');
const mobile=fs.readFileSync('mobile-app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
assert(boot.includes("const engineReady=!!window.Game&&window.Game.assetsReady!==false"),'boot must wait only for core Game engine');
assert(boot.includes('elapsed>=1400'),'boot must provide campaign fallback readiness');
assert(boot.includes("document.dispatchEvent(new CustomEvent('sunset-game-started'))"),'boot start event missing');
assert(boot.includes("paused=false"),'boot must unpause game');
assert(!mobile.includes("addEventListener('pointerdown',immersive"),'mobile must not request fullscreen on boot pointerdown');
assert(mobile.includes("document.body.classList.contains('booting')"),'mobile immersive boot guard missing');
assert(mobile.includes("bootStart?.addEventListener('click'"),'fullscreen should follow start click');
assert(sw.includes("request.mode==='navigate'"),'service worker navigation network-first guard missing');
assert(sw.includes("sunset-guard-v12-atlas-3"),'service worker cache version not bumped');
console.log(JSON.stringify({passed:true,bootFallback:true,mobileGestureSafe:true,networkFirstNavigation:true},null,2));
