'use strict';
const CACHE='sunset-guard-v5-1';
const FILES=['./','./index.html','./style.css','./overhaul.css','./phase3.css','./phase3b.css','./phase5.css','./mobile-app.css','./assets.js','./phase2-art.js','./game.js','./campaign.js','./phase2-combat.js','./phase2-ui.js','./phase3-equipment-pre.js','./phase3-reference.js','./phase3-equipment.js','./phase3-polish.js','./phase3b-progression.js','./phase5-combat.js','./mobile-app.js','./boot.js','./manifest.webmanifest','./sunset-icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return res}).catch(()=>caches.match('./index.html'))))});
