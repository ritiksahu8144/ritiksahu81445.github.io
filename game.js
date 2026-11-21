/* game.js - board, input, rules, screens and startup */
/* ---------- game state ---------- */
const cv=$("#board"),ctx=cv.getContext("2d");
let L=null,P=[],dots=[],act=-1,won=false,B=300,dpr=1,curN=1,hu=0;
const dotColor=c=>dots.findIndex(d=>d[0]===c||d[1]===c);
const owner=c=>P.findIndex(p=>p.includes(c));
const isDone=k=>{const p=P[k];return p.length>1&&dotColor(p[p.length-1])===k&&p[p.length-1]!==p[0]};

function startLevel(n){
  curN=n;L=gen(n);dots=L.sol.map(p=>[p[0],p[p.length-1]]);P=dots.map(()=>[]);act=-1;won=false;hu=0;$("#nxt").hidden=true;
  document.body.dataset.w=world(n);setMusic(world(n));
  $("#ttl").innerHTML=`Level ${n.toLocaleString("en-IN")}<small>${TH[world(n)].n} · ${L.s}×${L.s} · ${LB[L.s-5]}</small>`;
  $("#tip").hidden=n>2;show("game");layout();
}
function layout(){
  if(!L)return;B=Math.floor(Math.min(innerWidth-32,innerHeight-230,560));B=Math.max(B,220);
  dpr=window.devicePixelRatio||1;cv.width=B*dpr;cv.height=B*dpr;cv.style.width=cv.style.height=B+"px";draw();
}
function draw(){
  if(!L)return;const s=L.s,cs=B/s,T=TH[world(curN)];
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,B,B);
  const own=new Array(s*s).fill(-1);P.forEach((p,k)=>p.forEach(c=>own[c]=k));
  for(let c=0;c<s*s;c++){
    const x=(c%s)*cs,y=(c/s|0)*cs,k=own[c];
    ctx.fillStyle=k>=0?T.pal[k]+"38":T.tile;
    ctx.beginPath();(ctx.roundRect?ctx.roundRect(x+2,y+2,cs-4,cs-4,cs*.18):ctx.rect(x+2,y+2,cs-4,cs-4));ctx.fill();
    if(k<0&&dots.every((_,j)=>isDone(j))){ctx.strokeStyle=T.pal[0];ctx.lineWidth=2;ctx.strokeRect(x+4,y+4,cs-8,cs-8)}
    if(k<0){ctx.fillStyle=T.bin;ctx.beginPath();ctx.arc(x+cs/2,y+cs/2,cs*.055,0,7);ctx.fill()}
  }
  const ct=c=>[(c%s+.5)*cs,((c/s|0)+.5)*cs];
  ctx.lineCap=ctx.lineJoin="round";ctx.lineWidth=cs*.34;
  P.forEach((p,k)=>{if(p.length<2)return;ctx.strokeStyle=T.pal[k];ctx.beginPath();p.forEach((c,i)=>{const[x,y]=ct(c);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()});
  dots.forEach((d,k)=>d.forEach(c=>{
    const[x,y]=ct(c),col=T.pal[k];
    ctx.shadowColor=col;ctx.shadowBlur=cs*.28;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,cs*.3,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,.55)";ctx.beginPath();ctx.arc(x,y,cs*.12,0,7);ctx.fill();
    if(isDone(k)){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,cs*.4,0,7);ctx.stroke();ctx.lineWidth=cs*.34}
  }));
  const dn=dots.filter((_,k)=>isDone(k)).length,fl=own.filter(k=>k>=0).length;
  $("#stat").textContent=`Linked ${dn}/${dots.length} · Filled ${Math.round(fl/(s*s)*100)}%`;
  $("#hint").textContent="Hint "+S.h;$("#hint").disabled=S.h<=0||won;
}
function cellAt(e){const r=cv.getBoundingClientRect(),s=L.s;return Math.min(s-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*s)))*s+Math.min(s-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*s)))}
function step(k,c){
  const p=P[k],i=p.indexOf(c);
  if(i>=0){P[k]=p.slice(0,i+1);return true}
  const d=dotColor(c);if(d>=0&&d!==k)return false;
  if(isDone(k))return false;
  const o=owner(c);if(o>=0&&o!==k)P[o]=P[o].slice(0,P[o].indexOf(c));
  p.push(c);return true;
}
cv.addEventListener("pointerdown",e=>{
  if(!L||won)return;e.preventDefault();cv.setPointerCapture(e.pointerId);
  const c=cellAt(e),d=dotColor(c);
  if(d>=0){P[d]=[c];act=d}
  else{const o=owner(c);if(o<0)return;P[o]=P[o].slice(0,P[o].indexOf(c)+1);act=o}
  draw();
});
cv.addEventListener("pointermove",e=>{
  if(act<0)return;const t=cellAt(e),s=L.s;let g=0;
  while(g++<12){
    const cur=P[act][P[act].length-1];if(cur===t)break;
    const cx=cur%s,cy=cur/s|0,tx=t%s,ty=t/s|0;let nx=cx,ny=cy;
    if(Math.abs(tx-cx)>=Math.abs(ty-cy))nx+=Math.sign(tx-cx);else ny+=Math.sign(ty-cy);
    if(!step(act,ny*s+nx))break;
  }
  draw();
});
const end=()=>{if(act<0)return;act=-1;draw();check()};
cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);

function check(){
  if(won||!dots.every((_,k)=>isDone(k)))return;
  const s0=L.s;if(new Set(P.flat()).size!==s0*s0){$("#stat").textContent="All linked! Now fill every tile to finish.";return}won=true;draw();
  const s=L.s,filled=new Set(P.flat()).size===s*s,stars=hu?2:3;
  const first=curN===S.c+1;
  if(first){S.c=curN;S.h=Math.min(9,S.h+1)}
  S.st=S.st.padEnd(curN,"0");S.st=S.st.slice(0,curN-1)+Math.max(starOf(curN),stars)+S.st.slice(curN);
  save();try{chime()}catch(e){}try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}
  $("#wst").textContent="★".repeat(stars)+"☆".repeat(3-stars);
  $("#wt").textContent=curN>=TOTAL?"Sab 10,000 levels poore!":filled?"Perfect!":"Shabaash!";
  $("#wm").textContent=(hu?"You used a hint, so 2 stars.":"No hints used. Full 3 stars!")+(curN<TOTAL?" The next level is harder.":"");
  $("#wn").style.display=curN>=TOTAL?"none":"";
  $("#nxt").hidden=curN>=TOTAL;setTimeout(()=>{try{$("#win").showModal()}catch(e){}},350);
}
$("#reset").onclick=()=>{if(won)return;P=dots.map(()=>[]);draw()};
$("#hint").onclick=()=>{
  if(S.h<=0||won)return;const k=dots.findIndex((_,i)=>!isDone(i));if(k<0)return;
  const sol=L.sol[k];P[k]=sol.slice();
  P.forEach((p,j)=>{if(j===k)return;const i=p.findIndex((c,ix)=>ix>0&&sol.includes(c));if(i>0)P[j]=p.slice(0,i)});
  S.h--;hu=1;save();draw();check();
};
$("#wn").onclick=()=>{$("#win").close();startLevel(curN+1)};
$("#wl").onclick=()=>{$("#win").close();openLevels()};
$("#nxt").onclick=()=>startLevel(curN+1);

/* ---------- screens ---------- */
function show(id){["home","game","levels"].forEach(s=>$("#"+s).hidden=s!==id)}
function home(){document.body.dataset.w=world(Math.min(S.c+1,TOTAL));const n=Math.min(S.c+1,TOTAL);
  $("#cont").textContent=S.c?`Continue · Level ${n.toLocaleString("en-IN")}`:"Play level 1";
  $("#prog").textContent=`${S.c.toLocaleString("en-IN")} of 10,000 levels completed`;show("home")}
let pg=0;
function openLevels(){pg=Math.floor(Math.min(S.c,TOTAL-1)/100);renderLevels();show("levels")}
function renderLevels(){
  const g=$("#lgrid"),f=document.createDocumentFragment();
  for(let i=1;i<=100;i++){
    const n=pg*100+i,b=document.createElement("button"),locked=n>S.c+1,s=starOf(n);
    b.dataset.n=n;b.className=locked?"lock":n===S.c+1?"cur":"";b.disabled=locked;b.setAttribute("aria-label","Level "+n+(locked?" locked":""));
    b.innerHTML=locked?"🔒<i></i>":`${n}<i>${"★".repeat(s)}</i>`;f.append(b);
  }
  g.replaceChildren(f);
  $("#ltt").textContent=`Levels ${pg*100+1}–${pg*100+100}`;
  $("#prev").disabled=pg===0;$("#next").disabled=pg>=TOTAL/100-1;
}
$("#lgrid").onclick=e=>{const b=e.target.closest("button");if(b&&!b.disabled)startLevel(+b.dataset.n)};
$("#prev").onclick=()=>{pg--;renderLevels()};$("#next").onclick=()=>{pg++;renderLevels()};
$("#jump").onclick=()=>{pg=Math.floor(Math.min(S.c,TOTAL-1)/100);renderLevels()};
$("#cont").onclick=()=>startLevel(Math.min(S.c+1,TOTAL));
$("#lvls").onclick=openLevels;$("#lback").onclick=home;$("#back").onclick=home;
addEventListener("resize",layout);
["click","pointerup","keydown"].forEach(t=>document.addEventListener(t,musicOn));
document.addEventListener("visibilitychange",()=>{if(!AC)return;if(document.hidden)AC.suspend().catch(()=>{});else if(S.m)AC.resume().catch(()=>{})});
document.querySelectorAll(".mus").forEach(b=>b.onclick=()=>{S.m=S.m?0:1;save();updateMus();S.m?musicOn():musicOff()});
updateMus();
home();
