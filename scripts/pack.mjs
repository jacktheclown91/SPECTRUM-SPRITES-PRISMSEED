import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{deflateRawSync}from'node:zlib';
const CAP=13312,files=['src/online.js','src/systems.js','src/kernel.js','src/main.js'];
let js=files.map(f=>readFileSync(f,'utf8').replace(/^import[^\n]*\n/gm,'').replace(/\bexport\s+/g,'').trim()).join('\n');
const sub=(a,b)=>{if(!js.includes(a))throw Error('release transform drift: '+a.slice(0,50));js=js.replace(a,b)},rx=(a,b)=>{if(!a.test(js))throw Error('release transform drift: '+a);js=js.replace(a,b)},prop=(a,b)=>{js=js.replace(new RegExp('\\.'+a+'\\b','g'),'.'+b).replace(new RegExp('\\b'+a+'(?=:)','g'),b)};
// Remove source-only diagnostics/return fields that gameplay never reads.
rx(/function digest.*\nfunction audit.*\n/,'');rx(/function wellAt.*\n/,'');rx(/const bossDefeated.*\n/,'');rx(/const MATS=.*\n/,'');
sub('program:sp.program,','');sub(',program:s&0xffffff','');sub('return{g,q,k:','return{q,k:');
rx(/window\.prismAudit=.*?\ninit\(seed\)/s,'init(seed)');
// Compact canonical-ledger replay: no unpack objects or string lineage keys in release.
rx(/function screenState\([^\n]*/,"function screenState(seed,w,sx,sy,ledger=[]){let n=population(seed,w,sx,sy),dead=new Set,children=new Map,childDead=new Set,z=(sx+32&63)|((sy+32&63)<<6);for(let e of ledger)if((e>>>4&4095)==z){let t=e&15,k=e>>>16;if(t==1)dead.add(k&255);if(t==2)children.set(k,e);if(t==3)childDead.add(k)}let mobs=[];for(let i=0;i<n;i++)if(!dead.has(i))mobs.push(species(seed,w,sx,sy,i));for(let[k,e]of children)if(!childDead.has(k)){let d=e>>>24,u=k&255,g=d>>>4;if(u<n&&g)mobs.push(descendant(seed,w,sx,sy,u,g,d&15))}return{mobs}}");
rx(/function birthsHere\(\)\{[^\n]*/,"function birthsHere(){let n=0,z=(screen.x+32&63)|((screen.y+32&63)<<6);for(let e of ledger)if((e&15)==2&&(e>>>4&4095)==z)n++;return n}");
rx(/const unpack=[^\n]*\n/,'');sub('for(let e of canonLedger(ledger))','for(let e of ledger)');
// Drop release-unused world/region symmetry + regional aggression, consuming the same PRNG calls.
sub('bias:r()*7|0,sym:r()*4|0,eco:r()*4|0','bias:r()*7|0,eco:(r(),r()*4|0)');
sub('agg:clamp(w.agg+(r()*3|0)-1,0,3),magic:clamp(w.magic+(r()*3|0)-1,0,3)','magic:clamp(w.magic+((r(),r()*3)|0)-1,0,3)');
sub('eco:(w.eco+(r()*4|0))&3,sym:(w.sym+(r()*4|0))&3,ops:[]','eco:(w.eco+(r()*4|0))&3,ops:(r(),[])');
// Event constants are compile-time values in the release artifact.
for(let[k,v]of Object.entries({KILL:1,BIRTH:2,CHILD_KILL:3,WELL:4,BOSS:5}))js=js.replaceAll('EV.'+k,v);
rx(/const EV=\{[^\n]*\};?\n?/,'');
// Release-only internal field names. Readable source/tests retain descriptive names.
for(let[a,b]of [['generation','n'],['behavior','a'],['strength','z'],['material','m'],['subject','u'],['branch','j'],['program','p'],['region','r'],['seed','s'],['nameA','A'],['nameB','B'],['speed','v'],['shoot','S'],['phase','F'],['shell','C'],['wing','W'],['horn','H'],['eye','E'],['legs','L'],['root','R'],['secret','q'],['rooms','o'],['edges','d'],['shape','h'],['mut','u'],['wet','w'],['ruin','r'],['agg','a'],['magic','g'],['bias','b'],['eco','e'],['topo','t'],['ops','o'],['scene','c'],['dead','D'],['guard','U'],['boss','K'],['dun','N'],['hp','h'],['face','f'],['vx','i'],['vy','q'],['seek','k'],['bounce','B'],['chain','c'],['grow','G'],['power','P']])prop(a,b);
// Shorthand object fields need explicit release keys.
sub('return{s:s,p:p,r:sp.r,root,generation,branch}','return{s:s,p:p,r:sp.r,R:root,n:generation,j:branch}');
sub('return{s:s,n,key,lock,secret,rooms,edges,m:','return{s:s,n,key,lock,q:secret,o:rooms,d:edges,m:');
// Creature size only: never rename Set.size.
sub('size:1','z:1');js=js.replace(/\b([tmab])\.size\b/g,'$1.z');
// Shot split field while preserving String.prototype.split().
js=js.replace(/\.split(?!\s*\()/g,'.Q').replace(/\bsplit(?=:)/g,'Q');
// Event/scenario type + event data, restoring host API properties.
prop('type','T');sub('return{s:q,type,m:','return{s:q,T:type,m:');sub("o.T='square'","o.type='square'");
prop('data','D');sub("nws.onmessage=e=>netMsg(''+e.D)","nws.onmessage=e=>netMsg(''+e.data)");
// Compact dungeon room/graph fields.
sub('return{s:s,role,m:','return{s:s,R:role,m:');js=js.replaceAll('.role','.R').replaceAll('d.key','d.k').replaceAll('d.lock','d.l').replaceAll('dun.key','dun.k').replaceAll('dun.lock','dun.l');
sub('return{s:s,n,key,lock,q:secret,o:rooms,d:edges,m:','return{s:s,n,k:key,l:lock,q:secret,o:rooms,d:edges,m:');
// Shared Math alias + bound fillRect reduce both source and final DEFLATE size.
js=js.replaceAll('Math.','Z.').replaceAll('X.fillRect(','F(');sub(',SH=15,K={};',',SH=15,K={},Z=Math,F=X.fillRect.bind(X);');
let html=readFileSync('index.html','utf8').trim().replace('<script type="module" src="src/main.js"></script>',`<script>${js}</script>`);
mkdirSync('dist',{recursive:true});writeFileSync('dist/index.html',html);
let data=Buffer.from(html),name=Buffer.from('index.html'),zip=deflateRawSync(data,{level:9,memLevel:6}),crc=0xffffffff;
for(let b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}crc=(crc^0xffffffff)>>>0;
let local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(8,8);local.writeUInt16LE(0x21,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(zip.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
let central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(8,10);central.writeUInt16LE(0x21,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(zip.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(0,42);
let offset=local.length+name.length+zip.length,end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(offset,16);
let out=Buffer.concat([local,name,zip,central,name,end]);writeFileSync('dist/prismseed.zip',out);
let free=CAP-out.length,pct=(free/CAP*100).toFixed(1);console.log(`PRISMSEED ${out.length}/${CAP} bytes | ${free} free (${pct}%) | html ${data.length}`);if(out.length>CAP)process.exitCode=1;
