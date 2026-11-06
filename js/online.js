import {Chess} from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,set,get,onValue,runTransaction,update} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import {firebaseConfig} from "./firebase-config.js";

const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
const auth=getAuth(app),db=getDatabase(app),$=id=>document.getElementById(id);
const pieces={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"}};
const page=location.pathname.split("/").pop();
let uid=null,roomId=null,color=null,unsub=null,selected=null,locked=false,roomStatus="",game=new Chess();
const say=t=>{if($("onlineStatus"))$("onlineStatus").textContent=t};
async function login(){if(uid)return uid;const result=await signInAnonymously(auth);uid=result.user.uid;return uid;}

// Original synthesized background loop and chess sound effects; audio starts only after a user tap.
let audioCtx=null,musicTimer=null,musicOn=false,noteStep=0;
function audio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function tone(freq,duration=.14,type="sine",volume=.035,delay=0){const c=audio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+delay+.025);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+delay+duration);o.connect(g);g.connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+duration+.03)}
function effect(kind="move"){if(kind==="capture"){tone(210,.19,"triangle",.07);tone(120,.22,"sine",.04,.06)}else{tone(520,.09,"sine",.025);tone(680,.1,"sine",.018,.07)}}
function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;musicOn=false;document.querySelectorAll("#musicToggle").forEach(b=>b.textContent="♫ Music: OFF")}
function startMusic(){audio();if(musicOn)return;musicOn=true;const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];const play=()=>{tone(notes[noteStep%notes.length],.42,"sine",.012);if(noteStep%4===0)tone(notes[noteStep%notes.length]/2,.55,"triangle",.009);noteStep++};play();musicTimer=setInterval(play,520);document.querySelectorAll("#musicToggle").forEach(b=>b.textContent="♫ Music: ON")}
document.querySelectorAll("#musicToggle").forEach(b=>b.onclick=()=>musicOn?stopMusic():startMusic());

function randomCode(){const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);return [...bytes].map(n=>chars[n%chars.length]).join("")}
async function createRoom(){
 await login();say("Generating a unique Firebase room…");
 let made=false;
 for(let attempt=0;attempt<8&&!made;attempt++){
  const candidate=randomCode(),roomRef=ref(db,"rooms/"+candidate);
  const tx=await runTransaction(roomRef,current=>current===null?{hostUid:uid,guestUid:null,fen:new Chess().fen(),turn:"w",status:"waiting",createdAt:Date.now()}:undefined);
  if(tx.committed){roomId=candidate;made=true}
 }
 if(!made)throw new Error("Could not reserve a room code. Please try again.");
 color="w";sessionStorage.setItem("cpm_room",roomId);sessionStorage.setItem("cpm_color",color);
 $("roomCode").textContent=roomId;$("copyCode").disabled=false;
 $("copyCode").onclick=async()=>{try{await navigator.clipboard.writeText(roomId);say("Room code copied. Send it to your friend!")}catch{say("Your room code is "+roomId)}};
 say("Firebase room created successfully. Share this code with your friend.");listenForHost();
}
async function joinRoom(){
 await login();const code=$("roomCode").value.trim().toUpperCase();
 if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code)){say("Enter a valid six-character room code.");return}
 $("join").disabled=true;say("Checking room and connecting…");
 try{
  const rr=ref(db,"rooms/"+code);
  const tx=await runTransaction(rr,current=>{
   if(!current||current.status!=="waiting"||current.hostUid===uid||current.guestUid)return;
   current.guestUid=uid;current.status="playing";current.turn="w";return current;
  });
  if(!tx.committed){say("Room not found, already full, or match already started.");$("join").disabled=false;return}
  roomId=code;color="b";sessionStorage.setItem("cpm_room",roomId);sessionStorage.setItem("cpm_color",color);location.href="game.html";
 }catch(e){say("Could not join: "+e.message);$("join").disabled=false}
}
function listenForHost(){
 if(unsub)unsub();
 unsub=onValue(ref(db,"rooms/"+roomId),snap=>{const d=snap.val();if(!d){say("Room no longer exists.");return}roomStatus=d.status;if(d.status==="playing")location.href="game.html";else say("Room "+roomId+" is ready. Waiting for the second player…")},e=>say("Firebase listener error: "+e.message));
}
function draw(){
 const board=$("onlineBoard");if(!board)return;board.innerHTML="";
 for(let rank=8;rank>=1;rank--)for(let file=0;file<8;file++){
  const sq="abcdefgh"[file]+rank,p=game.get(sq),el=document.createElement("button");
  el.className="square "+((rank+file)%2?"dark":"light");el.dataset.square=sq;
  if(p)el.textContent=pieces[p.color][p.type];
  if(selected===sq)el.classList.add("selected");
  if(selected&&game.moves({square:selected,verbose:true}).some(m=>m.to===sq))el.classList.add(game.get(sq)?"capture":"target");
  const coord=document.createElement("span");coord.className="coord";coord.textContent=file===0?rank:(rank===1?"abcdefgh"[file]:"");el.append(coord);el.onclick=()=>tap(sq);board.append(el);
 }
 const current=game.turn()==="w"?"White":"Black",myTurn=game.turn()===color;
 if($("turn"))$("turn").textContent=game.isGameOver()?"Match finished":current+" to move";
 if($("mySide"))$("mySide").textContent="You · "+(color==="w"?"White":"Black");
 if($("turnBanner"))$("turnBanner").textContent=game.isGameOver()?"♛ Match finished":(myTurn?"✨ Your turn — make one move":"⏳ Opponent's turn — please wait");
}
function watchGame(){
 if(unsub)unsub();
 unsub=onValue(ref(db,"rooms/"+roomId),snap=>{
  const d=snap.val();if(!d){say("Room was closed or removed.");return}
  roomStatus=d.status;if(d.fen)try{game.load(d.fen)}catch(e){say("Invalid board state received.");return}
  if($("opponent"))$("opponent").textContent=d.status==="waiting"?"Waiting for opponent":"Opponent connected";
  if($("myColor"))$("myColor").textContent=color==="w"?"♔ You are White":"♚ You are Black";
  draw();
  if(d.status==="finished")say(d.result||"Game finished.");
  else if(d.status==="playing")say(game.isGameOver()?"Game over":(game.turn()===color?"Your turn. Make one move.":"Opponent's turn. Wait for their move."));
 },e=>say("Live connection error: "+e.message));
}
async function tap(sq){
 if(!roomId||locked||roomStatus!=="playing"||game.isGameOver()||game.turn()!==color)return;
 if(selected){
  const from=selected;selected=null;
  const possible=game.moves({square:from,verbose:true}).find(m=>m.to===sq);
  if(possible){
   locked=true;draw();const rr=ref(db,"rooms/"+roomId);
   try{
    const tx=await runTransaction(rr,d=>{
     if(!d||d.status!=="playing"||d.turn!==color)return;
     const fresh=new Chess(d.fen);let moved;
     try{moved=fresh.move({from,to:sq,promotion:"q"})}catch{return}
     if(!moved)return;
     d.fen=fresh.fen();d.turn=fresh.turn();d.lastMove=moved.san;d.lastMoveAt=Date.now();
     if(fresh.isGameOver()){d.status="finished";d.result=fresh.isCheckmate()?(color==="w"?"White wins by checkmate":"Black wins by checkmate"):"Draw"}
     return d;
    });
    if(tx.committed){effect(possible.captured?"capture":"move")}
    else{const fresh=await get(rr);if(fresh.exists()&&fresh.val().fen)game.load(fresh.val().fen);say("Move not accepted. Wait for your turn.");draw()}
   }catch(e){say("Move sync failed: "+e.message)}
   finally{locked=false}
   return;
  }
 }
 const p=game.get(sq);selected=p&&p.color===color?sq:null;draw();
}
async function init(){
 try{
  await login();
  if(page==="create-room.html"){await createRoom();return}
  if(page==="join-room.html"){$("join").onclick=joinRoom;$("roomCode").addEventListener("input",e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""));return}
  if(page==="game.html"){
   roomId=sessionStorage.getItem("cpm_room");color=sessionStorage.getItem("cpm_color");
   if(!roomId||!color){say("No active room. Return to Online menu and create or join a room.");return}
   watchGame();return;
  }
 }catch(e){say("Firebase connection error: "+e.message)}
}
if(page==="game.html"){
 $("resign").onclick=async()=>{if(!roomId||roomStatus!=="playing")return;if(!confirm("Resign this match?"))return;await update(ref(db,"rooms/"+roomId),{status:"finished",result:color==="w"?"Black wins by resignation":"White wins by resignation"});say("You resigned.")};
 $("leave").onclick=()=>{if(unsub)unsub();sessionStorage.removeItem("cpm_room");sessionStorage.removeItem("cpm_color");location.href="online.html"};
}
init();
