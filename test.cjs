// Dependency-free smoke test for the actual inline game script.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map(),storage=new Map();
const drawing=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function element(){const classes=new Set();return {innerHTML:'',textContent:'',style:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener(){},getContext:()=>drawing,click(){}}}
function context(){let sandbox={console,Math,JSON,Date,Number,String,Array,Object,Set,Blob,URL,innerWidth:1440,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},setInterval(){},requestAnimationFrame(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)},addEventListener(){},createElement:element},window:{addEventListener(){}}};vm.createContext(sandbox);vm.runInContext(source,sandbox);return sandbox}
const ctx=context(),g=ctx.window.Game;
const tests=[];function check(name,fn){fn();tests.push(name)}
check('24 upgrades and valid initial save',()=>{assert.equal(g.upgrades.length,24);assert(g.validate(g.state))});
check('initial female and solo wave progression',()=>{assert.equal(g.state.slots[0],'su');g.test(1);g.state.slots=['su',null,null,null,null];g.resetWave();for(let i=0;i<7200;i++)g.update(1/60);assert(g.state.wave>1)});
check('wave 10 miniboss',()=>{g.test(10);for(let i=0;i<700;i++)g.update(1/60);assert(g.enemies.some(e=>e.boss&&!e.main))});
check('wave 100 main boss',()=>{g.test(100);for(let i=0;i<1300;i++)g.update(1/60);assert(g.enemies.some(e=>e.boss&&e.main))});
check('automatic same-wave retry',()=>{g.setBaseHP(0);g.update(.02);assert.equal(g.phase,'fail');let w=g.state.wave;for(let i=0;i<185;i++)g.update(1/60);assert.equal(g.phase,'fight');assert.equal(g.state.wave,w)});
check('100 cleared transitions to 101 and new chapter',()=>{g.test(100);g.state.levels.su[0]=100000;g.state.levels.su[1]=10000;g.state.levels.su[5]=10000;g.state.levels.su[6]=100;g.resetWave();for(let i=0;i<1800&&g.state.wave===100;i++)g.update(1/60);assert.equal(g.state.wave,101);vm.runInContext('hud()',ctx);assert.match(elements.get('region').textContent,/원시/)});
check('zombie chapter',()=>{g.test(201);vm.runInContext('hud()',ctx);assert.match(elements.get('region').textContent,/무덤/)});
check('unique five slots and in-battle swap',()=>{g.test(101);g.place('buck',0);assert.equal(new Set(g.state.slots).size,5);assert.equal(g.state.slots[0],'buck');g.place('ash',0);assert.equal(g.state.slots[0],'ash')});
check('gear effects and single ownership',()=>{g.equip('fire');assert(g.stats('su').fire>0);vm.runInContext("selected='chel'",ctx);g.equip('fire');assert.equal(g.stats('su').fire,0);assert(g.stats('chel').fire>0);g.equip('ice');assert(g.stats('chel').slow>=.2)});
check('per-character upgrade isolation',()=>{const su=g.stats('su').atk,chel=g.stats('chel').atk;g.state.levels.su[0]++;assert(g.stats('su').atk>su);assert.equal(g.stats('chel').atk,chel)});
check('shop pays cost and unlocks',()=>{const n=g.state.gems;g.buy('hero');assert.equal(g.state.gems,n-50);g.state.gems=0;g.buy('hero');assert.equal(g.state.gems,0)});
check('test mode restores original progression',()=>{g.action('exitTest');assert.equal(g.state.wave,1);assert.equal(g.state.owned.length,1);assert(g.validate(g.state))});
check('save and reload',()=>{vm.runInContext('save()',ctx);const fresh=context();assert.equal(fresh.window.Game.state.gold,g.state.gold);assert(fresh.window.Game.validate(fresh.window.Game.state))});
check('reject malformed imports',()=>{assert(!g.validate({...g.state,wave:-1}));assert(!g.validate({...g.state,slots:['su','su',null,null,null]}));assert(!g.validate({...g.state,levels:{su:[0]}}))});
check('render all menus and canvas without exception',()=>{for(const tab of ['성장','장비','배치','상점','메뉴'])g.open(tab);vm.runInContext('draw();hud()',ctx)});
console.log(JSON.stringify({passed:tests.length,tests},null,2));
