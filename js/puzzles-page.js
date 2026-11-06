import {puzzles} from "./puzzles.js";
const $=id=>document.getElementById(id),done=JSON.parse(localStorage.getItem("cpm_completed")||"[]");
$("progress").textContent=done.length+" / 50 completed";
$("xp").textContent=done.reduce((n,id)=>n+(puzzles[id-1]?.xp||0),0)+" XP";
$("progressFill").style.width=(done.length/50*100)+"%";
$("levels").innerHTML=puzzles.map(p=>'<a class="level-card" href="puzzle-play.html?level='+p.id+'"><b>Level '+p.id+'</b><span>'+p.category+'</span><small>'+(done.includes(p.id)?"✓ Completed":"+"+p.xp+" XP")+'</small></a>').join("");