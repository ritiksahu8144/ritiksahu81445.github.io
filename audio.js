/* audio.js - synthesised background music and sound effects */
/* ---------- background music (synthesised, no files) ---------- */
let AC=null,mg=null,tm=0,nt=0,di=2,dr=null,mw=0;
const SC=[0,2,4,7,9],MU=[{r:130.81,b:.6},{r:146.83,b:.44},{r:123.47,b:.54}];
const fq=d=>MU[mw].r*2*Math.pow(2,(SC[d%5]+12*Math.floor(d/5))/12);
let rv=null,st=0,mot=[],nz=null;
const MB=[92,104,84],CH=[[0,4,7],[-3,0,4],[2,7,9],[-5,2,7]];
function mkReverb(){const n=AC.sampleRate*2.2|0,b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}const cn=AC.createConvolver();cn.buffer=b;return cn}
function mkAudio(){
  AC=new (window.AudioContext||window.webkitAudioContext)();
  mg=AC.createGain();mg.gain.value=.22;
  rv=mkReverb();const wet=AC.createGain();wet.gain.value=.45;
  mg.connect(AC.destination);mg.connect(rv);rv.connect(wet);wet.connect(AC.destination);
  nz=AC.createBuffer(1,AC.sampleRate*.1|0,AC.sampleRate);const nd=nz.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
}
function tone(t,f,dur,v,type,att){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.setTargetAtTime(.0001,t+dur*.6,dur*.25);o.connect(g);g.connect(mg);o.start(t);o.stop(t+dur+.6);return o}
function flute(t,f,dur){const o=tone(t,f,dur,.15,"sine",.06);tone(t,f*2,dur,.03,"sine",.06);const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.2;lg.gain.value=f*.006;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+.6)}
function kick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+.2);g.gain.setValueAtTime(.42,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(mg);o.start(t);o.stop(t+.3)}
function tick(t,v){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=nz;f.type="highpass";f.frequency.value=4000;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);s.connect(f);f.connect(g);g.connect(mg);s.start(t)}
function pluck(t,f,v){const o=AC.createOscillator(),g=AC.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);g.connect(mg);o.start(t);o.stop(t+1.7)}
function sched(){
  const sd=30/MB[mw];
  while(nt<AC.currentTime+.8){
    const p=st%8,bar=Math.floor(st/8)%4,ch=CH[bar],r=MU[mw].r;
    if(st%32===0){let d=4;mot=Array.from({length:8},()=>{if(Math.random()<.2)return -1;d=Math.max(2,Math.min(9,d+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)]));return d})}
    if(p===0)ch.forEach(o=>tone(nt,r*Math.pow(2,o/12),sd*8+.4,.045,"sine",.7));
    if(p===0||p===4)tone(nt,r/2*Math.pow(2,ch[0]/12),sd*3,.26,"sine",.02);
    if(p===0||p===5)kick(nt);
    const tv=[0,0,.1,0,.07,0,.1,.06][p];if(tv)tick(nt,tv);
    const m=mot[p];if(m>=0)flute(nt,fq(Math.min(9,m+[0,1,0,-1][bar])),sd*(p%2?1.6:2.4));
    nt+=sd;st++;
  }
}
function musicOn(){if(!S.m)return;try{if(!AC)mkAudio();AC.resume();if(!tm){nt=AC.currentTime+.1;st=0;tm=setInterval(sched,200)}}catch(e){}}
function musicOff(){if(tm){clearInterval(tm);tm=0}if(AC)AC.suspend().catch(()=>{})}
function setMusic(w){mw=w;if(dr){const t=AC.currentTime;[1,1.5,2].forEach((m,i)=>dr[i].frequency.setTargetAtTime(MU[w].r*m/2,t,.8))}}
function chime(){if(!S.m||!AC)return;[0,2,4,7].forEach((d,i)=>pluck(AC.currentTime+i*.12,fq(d+5),.22))}
function updateMus(){document.querySelectorAll(".mus").forEach(b=>b.textContent=S.m?"♪ On":"♪ Off")}

