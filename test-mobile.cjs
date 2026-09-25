// Mobile/PWA layout regression. Run after installing Playwright: node test-mobile.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'index.html'));await page.waitForFunction(()=>window.MobileGame&&window.Phase3B&&window.AppBoot?.ready,{timeout:30000});
 const checks=[];const ok=(name,value)=>{assert(value,name);checks.push(name)};
 let portrait=await page.evaluate(()=>({coarse:matchMedia('(pointer: coarse)').matches,force:document.documentElement.classList.contains('force-landscape'),portrait:document.documentElement.classList.contains('mobile-portrait'),lw:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-vvw')),lh:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-vvh')),overflow:getComputedStyle(document.body).overflow}));
 ok('touch device uses forced landscape',portrait.coarse&&portrait.force&&portrait.portrait&&portrait.lw>portrait.lh&&portrait.overflow==='hidden');
 await page.click('#bootStart');await page.waitForFunction(()=>document.getElementById('bootGate').hidden);await page.waitForTimeout(800);
 ok('active fight hides compact header',await page.evaluate(()=>document.documentElement.classList.contains('wave-active')&&getComputedStyle(document.querySelector('header')).display==='none'));
 ok('five defender slots remain one-row grid',await page.evaluate(()=>{const s=getComputedStyle(document.getElementById('squad'));return s.display==='grid'&&s.gridTemplateColumns.trim().split(/\s+/).length===5&&document.querySelectorAll('#squad .slot').length===5}));
 await page.click('#menuToggle');await page.click('[data-menu="설정"]');
 ok('phase3B panels survive mobile modal',await page.locator('.phase3b-economy').count()===1&&await page.locator('.phase3b-missions').count()===1);
 ok('only modal content scrolls',await page.evaluate(()=>getComputedStyle(document.getElementById('content')).overflowY==='auto'&&getComputedStyle(document.body).overflow==='hidden'));
 await page.click('#close');await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
 ok('physical landscape keeps same logical orientation',await page.evaluate(()=>{const r=document.documentElement,cs=getComputedStyle(r);return r.classList.contains('mobile-landscape')&&parseFloat(cs.getPropertyValue('--mobile-vvw'))>parseFloat(cs.getPropertyValue('--mobile-vvh'))}));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.webmanifest'),'utf8'));ok('manifest requests fullscreen landscape',manifest.display==='fullscreen'&&manifest.orientation==='landscape'&&manifest.icons?.length>0);
 ok('service worker caches latest phase files',fs.readFileSync(path.join(__dirname,'sw.js'),'utf8').includes('phase3b-progression.js')&&fs.readFileSync(path.join(__dirname,'sw.js'),'utf8').includes('mobile-app.css'));
 ok('no browser errors',errors.length===0);
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
