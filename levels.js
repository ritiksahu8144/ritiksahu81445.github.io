/* levels.js - seeded level generator and difficulty ramp (10,000 levels) */
/* ---------- level generator: seeded, every level has a guaranteed solution ---------- */
function mk(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TIERS=[1,4,12,30,70,150],LB=["Hard","Very hard","Expert","Expert","Master","Grandmaster"];
const tierOf=n=>{let t=0;while(t<5&&n>=TIERS[t+1])t++;return t};
const sizeOf=n=>5+tierOf(n);
function one(n,s,tgt,sd,strict){
  const N=s*s;
  const nb=c=>{const x=c%s,y=c/s|0,o=[];if(x>0)o.push(c-1);if(x<s-1)o.push(c+1);if(y>0)o.push(c-s);if(y<s-1)o.push(c+s);return o};
  const adj=(a,b)=>nb(a).includes(b);
  for(let a=0;a<(strict?120:300);a++){
    const r=mk(n*7919+(sd*997+a)*104729+17),own=new Int16Array(N).fill(-1),paths=[];
    const maxL=Math.ceil(N/tgt)+Math.floor(r()*2);
    const ord=[...Array(N).keys()].sort(()=>r()-.5);
    for(const c0 of ord){
      if(own[c0]>=0)continue;const p=[c0];own[c0]=paths.length;
      while(p.length<maxL){const f=nb(p[p.length-1]).filter(q=>own[q]<0);if(!f.length)break;const q=f[Math.floor(r()*f.length)];own[q]=paths.length;p.push(q)}
      paths.push(p);
    }
    let ok=true;
    for(;;){
      const i=paths.findIndex(p=>p.length<3);if(i<0)break;
      const p=paths[i];let m=false;
      outer:for(let j=0;j<paths.length;j++){
        if(j===i)continue;const q=paths[j];
        for(const qi of [0,q.length-1])for(const pi of [0,p.length-1])
          if(adj(q[qi],p[pi])){const qq=qi===0?q.slice().reverse():q,pp=pi===0?p:p.slice().reverse();paths[j]=qq.concat(pp);paths.splice(i,1);m=true;break outer}
      }
      if(!m){ok=false;break}
    }
    if(ok&&paths.length>=2&&paths.length<=10&&(!strict||(paths.length>=tgt-2&&paths.length<=tgt+2)))return paths;
  }
  return null;
}

/* ---------- difficulty: grows with every level ---------- */
function gen(n){
  const t=tierOf(n),s=5+t,len=t<5?TIERS[t+1]-TIERS[t]:2000,pr=Math.min(1,(n-TIERS[t])/len);
  const tgt=Math.min(10,s-1+Math.floor(pr*3)),k=3+Math.floor(pr*11);
  const score=p=>p.reduce((a,q)=>{let tn=0;for(let i=2;i<q.length;i++)if(q[i]-q[i-1]!==q[i-1]-q[i-2])tn++;const m=Math.abs(q[0]%s-q[q.length-1]%s)+Math.abs((q[0]/s|0)-(q[q.length-1]/s|0));return a+(q.length-1-m)+tn*.5},0);
  let best=null,bs=-1;
  for(let i=0;i<k;i++){const p=one(n,s,tgt,i,true)||one(n,s,tgt,i,false);if(!p)continue;const sc=score(p);if(sc>bs){bs=sc;best=p}}
  return{s,sol:best||Array.from({length:s},(_,y)=>Array.from({length:s},(_,x)=>y*s+x))};
}

