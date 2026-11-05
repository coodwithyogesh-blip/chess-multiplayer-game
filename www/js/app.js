import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const game=new Chess(),$=id=>document.getElementById(id);
const glyph={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"}};
const values={p:100,n:320,b:335,r:500,q:900,k:20000};
let selected=null,thinking=false,lastMove=null,history=[];
const depths={easy:1,medium:2,hard:3,grandmaster:3};
function status(m){$("status").textContent=m}
function draw(){
 const board=$("board");board.innerHTML="";
 for(let rank=8;rank>=1;rank--)for(let file=0;file<8;file++){
  const sq="abcdefgh"[file]+rank,p=game.get(sq),el=document.createElement("button");
  el.className="square "+((rank+file)%2?"dark":"light");
  if(selected===sq)el.classList.add("selected");
  if(lastMove&&(lastMove.from===sq||lastMove.to===sq))el.style.filter="brightness(1.12)";
  if(selected){const m=game.moves({square:selected,verbose:true}).find(x=>x.to===sq);if(m)el.classList.add(m.captured?"capture":"target")}
  if(p)el.textContent=glyph[p.color][p.type];el.addEventListener("click",()=>humanMove(sq));board.append(el);
 }
 $("undo").disabled=thinking||history.length<2;
 $("hint").disabled=thinking||game.turn()!=="w"||game.isGameOver();
}
function finish(){
 if(game.isCheckmate()){status(game.turn()==="w"?"Checkmate! Bot wins.":"You win! Checkmate.");return true}
 if(game.isDraw()){status("Game drawn.");return true}
 if(game.isCheck())status(game.turn()==="w"?"Check! Your king is under attack.":"Bot is in check.");
 return false;
}
function humanMove(to){
 if(thinking||game.isGameOver()||game.turn()!=="w")return;
 if(selected){try{const m=game.move({from:selected,to,promotion:"q"});if(m){history.push(m);lastMove=m;selected=null;draw();if(!finish()){status("Your move: "+m.san+". Bot is thinking…");botMove()}return}}catch{}}
 const p=game.get(to);selected=p&&p.color==="w"?to:null;draw();
}
function evaluate(){let n=0;for(const row of game.board())for(const p of row)if(p)n+=(p.color==="b"?1:-1)*values[p.type];return n}
function search(d,a,b,ply,color){
 if(game.isCheckmate())return game.turn()===color?-100000+ply:100000-ply;
 if(game.isDraw())return 0;if(d===0)return evaluate()*(color==="b"?1:-1);
 const moves=game.moves({verbose:true}),max=game.turn()===color;let best=max?-Infinity:Infinity;
 for(const m of moves){game.move(m);const s=search(d-1,a,b,ply+1,color);game.undo();if(max){best=Math.max(best,s);a=Math.max(a,best)}else{best=Math.min(best,s);b=Math.min(b,best)}if(b<=a)break}
 return best;
}
function choose(){
 const level=$("difficulty").value,d=depths[level]||2,moves=game.moves({verbose:true});
 if(level==="easy")return moves[Math.floor(Math.random()*moves.length)];
 let best=-Infinity,choices=[];
 for(const m of moves){game.move(m);const s=search(d-1,-Infinity,Infinity,1,"b");game.undo();if(s>best){best=s;choices=[m]}else if(s===best)choices.push(m)}
 return choices[Math.floor(Math.random()*choices.length)];
}
function botMove(){
 thinking=true;draw();setTimeout(()=>{const m=choose();if(m){const played=game.move(m);history.push(played);lastMove=played}thinking=false;draw();if(!finish())status("Bot played "+(m?.san||"a move")+". Your turn.")},180);
}
$("start").onclick=()=>{game.reset();history=[];selected=null;lastMove=null;thinking=false;draw();status("New match started. You play White. Make your move.")};
$("undo").onclick=()=>{if(thinking||history.length<2)return;game.undo();game.undo();history.splice(-2);selected=null;lastMove=null;draw();status("Your last move and bot reply were undone.")};
$("hint").onclick=()=>{if(thinking||game.turn()!=="w"||game.isGameOver())return;let best=-Infinity,choice=null;for(const m of game.moves({verbose:true})){game.move(m);const s=search(1,-Infinity,Infinity,1,"w");game.undo();if(s>best){best=s;choice=m}}status(choice?"Suggested move: "+choice.from+" → "+choice.to+". Try it!":"No hint available.")};
$("restart").onclick=()=>$("start").click();
draw();status("Choose a bot difficulty, then tap Start Game.");