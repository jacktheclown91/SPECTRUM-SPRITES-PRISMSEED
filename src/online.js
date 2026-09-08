let nws=0,nid='',npeers={},non=0,nseed=0,nlast=0,nmerge=()=>0,nledger=()=>[],nchanged=()=>0,nhit=()=>0;
export function netInit(s,m,g,c,h){s>>>=0;if(nws&&nseed!=s)nws.close();nseed=s;nmerge=m;nledger=g;nchanged=c;nhit=h||(()=>0)}
export function netToggle(){if(nws){nws.close();nws=0;non=0;npeers={};return 0}non=0;try{nws=new WebSocket('wss://relay.js13kgames.com/prismseed-'+nseed.toString(16));nws.onopen=()=>non=1;nws.onerror=()=>non=-1;nws.onclose=()=>{if(non>=0)non=0;nws=0;npeers={}};nws.onmessage=e=>netMsg(''+e.data);return 1}catch(e){nws=0;non=-1;return 0}}
function nsend(s,to=''){if(nws&&nws.readyState==1)nws.send((to?'@'+to+'|':'')+s)}
const nb=s=>/^[0-9a-z]+$/i.test(s)?parseInt(s,36):0;
function nhist(to=''){let a=nledger();for(let k=0;k<a.length;k+=256)nsend('h,'+nseed.toString(36)+','+a.slice(k,k+256).map(n=>n.toString(36)).join('.'),to)}
function netMsg(s){if(s[0]=='@'&&!s.includes(',')){nid=s.slice(1);nhist();return}if(s[0]=='+'){nhist(s.slice(1));return}if(s[0]=='-'){delete npeers[s.slice(1)];return}let a=s.split(',');if(a[0]=='h'){if(nb(a[1])>>>0!=nseed)return;let x=a[2]?a[2].split('.').map(nb).filter(Boolean).map(n=>n>>>0):[];if(x.length){nmerge(x);nchanged()}}else if(a[0]=='p'&&a[1]!=nid){if(a.length<6||a.slice(2,6).some(isNaN))return;npeers[a[1]]={sx:+a[2],sy:+a[3],x:+a[4],y:+a[5],c:a[1].charCodeAt(1)%7,t:performance.now()}}else if(a[0]=='e'){let x=nb(a[1]);if(x){nmerge([x>>>0]);nchanged()}}else if(a[0]=='d'){let g=nb(a[1]),d=+a[2];if(g&&d>0)nhit(g>>>0,d)}}
export function netEvent(e){nsend('e,'+(e>>>0).toString(36))}
export function netHit(g,d){nsend('d,'+(g>>>0).toString(36)+','+d)}
export function netStep(t,sx,sy,x,y){if(non!=1||t-nlast<100)return;nlast=t;nsend(['p',nid,sx,sy,x|0,y|0].join(','))}
export function netPeers(sx,sy){let t=performance.now(),a=[];for(let k in npeers){let q=npeers[k];if(t-q.t<2500&&q.sx==sx&&q.sy==sy)a.push(q)}return a}
export const netState=()=>[non,Object.keys(npeers).length,!!nws];
