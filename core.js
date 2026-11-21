/* core.js - helpers, festival themes, saved progress */
const $=s=>document.querySelector(s),TOTAL=10000;
const TH=[
 {n:"Diwali",pal:["#ffb627","#ff5d73","#4ee1c1","#6ea8ff","#ff8a3d","#c77dff","#9bf06b","#ff7bd5","#f5f1a0","#5fd3f3"],tile:"rgba(255,255,255,.07)",bin:"rgba(255,230,160,.45)"},
 {n:"Holi",pal:["#e6007e","#00a8e8","#e8b800","#6aa800","#8a2be2","#ff6a00","#00a082","#d63031","#2d3a8c","#f06292"],tile:"rgba(43,22,70,.07)",bin:"rgba(43,22,70,.3)"},
 {n:"Pongal",pal:["#ffd23f","#ff7b00","#ef5b66","#a7e66e","#f4a261","#2ec4b6","#ff9ecd","#d08a4a","#8ecae6","#f7f0d0"],tile:"rgba(255,255,255,.07)",bin:"rgba(255,240,180,.4)"}];
const world=n=>Math.floor((n-1)/25)%3;

let S={c:0,st:"",h:5,m:1};
try{const j=JSON.parse(localStorage.getItem("rl1")||"null");if(j&&typeof j.c==="number")S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem("rl1",JSON.stringify(S))}catch(e){}};
const starOf=n=>+S.st[n-1]||0;

