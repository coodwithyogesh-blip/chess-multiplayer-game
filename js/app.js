import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const game=new Chess();
const $=id=>document.getElementById(id);
const glyph={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"}};
const values={p:100,n:320,b:335,r:500,q:900,k:20000};
let selected=null,thinking=false,lastMove=null,history=[];
const depths={easy:1,medium:2,hard:3,grandmaster:3};

function status(message){$("status").textContent=message}
function draw(){
 const board=$("board");board.innerHTML="";
 for(let rank=8;rank>=1;rank--)for(let file=0;file<8;file++){
  const sq="abcdefgh"[file]+rank,piece=game.get(sq),cell=document.createElement("button");
  cell.className="square "+((rank+file)%2?"dark":"light");cell.dataset.square=sq;
  if(selected===sq)cell.classList.add("selected");
  if(lastMove&&(lastMove.from===sq||lastMove.to===sq))cell.style.filter="brightness(1.12)";
  if(selected){const move=game.moves({square:selected,verbose:true}).find(m=>m.to===sq);if(move)cell.classList.add(move.captured?"capture":"target")}
  if(piece)cell.textContent=glyph[piece.color][piece.type];
  cell.addEventListener("click",()=>humanMove(sq));board.append(cell);
 }
 $("undo").disabled=thinking||history.length===0;
 $("hint").disabled=thinking||game.turn()!=="w"||game.isGameOver();
}
function finishCheck(){
 if(game.isCheckmate()){status(game.turn()==="w"?"Checkmate! Bot wins.":"You win! Checkmate.");return true}
 if(game.isDraw()){status("Game drawn.");return true}
 if(game.isCheck()){status(game.turn()==="w"?"Check! Your king is under attack.":"Bot is in check.");return false}
 return false;
}
function humanMove(to){
 if(thinking||game.isGameOver()||game.turn()!=="w")return;
 if(selected){
  try{
   const move=game.move({from:selected,to,promotion:"q"});
   if(move){history.push(move);lastMove=move;selected=null;draw();if(finishCheck())return;status("Your move: "+move.san+". Bot is thinking…");botMove();return}
  }catch{}
 }
 const piece=game.get(to);
 selected=piece&&piece.color==="w"?to:null;draw();
}
function evaluate(){
 let score=0;
 for(const row of game.board())for(const p of row)if(p)score+=(p.color==="b"?1:-1)*values[p.type];
 return score;
}
function search(depth,alpha,beta,ply,botColor){
 if(game.isCheckmate())return game.turn()===botColor?-100000+ply:100000-ply;
 if(game.isDraw())return 0;
 if(depth===0)return evaluate()*(botColor==="b"?1:-1);
 const moves=game.moves({verbose:true});
 const maximizing=game.turn()===botColor;
 let best=maximizing?-Infinity:Infinity;
 for(const move of moves){
  game.move(move);const score=search(depth-1,alpha,beta,ply+1,botColor);game.undo();
  if(maximizing){best=Math.max(best,score);alpha=Math.max(alpha,best)}
  else{best=Math.min(best,score);beta=Math.min(beta,best)}
  if(beta<=alpha)break;
 }
 return best;
}
function chooseBotMove(){
 const level=$("difficulty").value,depth=depths[level]||2,moves=game.moves({verbose:true});
 if(level==="easy")return moves[Math.floor(Math.random()*moves.length)];
 let best=-Infinity,candidates=[];
 for(const move of moves){
  game.move(move);const score=search(depth-1,-Infinity,Infinity,1,"b");game.undo();
  if(score>best){best=score;candidates=[move]}else if(score===best)candidates.push(move);
 }
 return candidates[Math.floor(Math.random()*candidates.length)];
}
function botMove(){
 if(game.isGameOver())return;
 thinking=true;draw();
 setTimeout(()=>{
  const move=chooseBotMove();
  if(move){const played=game.move(move);history.push(played);lastMove=played}
  thinking=false;draw();
  if(!finishCheck())status("Bot played "+(move?.san||"a move")+". Your turn.");
 },180);
}
$("start").addEventListener("click",()=>{
 game.reset();history=[];selected=null;lastMove=null;thinking=false;
 $("undo").disabled=true;draw();
 status("New match started. You play White. Make your move.");
});
$("undo").addEventListener("click",()=>{
 if(thinking||history.length<2)return;
 game.undo();game.undo();history.splice(-2);selected=null;lastMove=null;draw();status("Your last turn and the bot reply were undone.");
});
$("hint").addEventListener("click",()=>{
 if(thinking||game.turn()!=="w"||game.isGameOver())return;
 const level=$("difficulty").value,depth=Math.min(2,depths[level]||2),moves=game.moves({verbose:true});
 let best=-Infinity,choice=null;
 for(const move of moves){game.move(move);const score=search(depth-1,-Infinity,Infinity,1,"w");game.undo();if(score>best){best=score;choice=move}}
 status(choice?"Suggested move: "+choice.from+" → "+choice.to+". Try it yourself!":"No hint available.");
});
$("restart").addEventListener("click",()=>$("start").click());
draw();status("Choose a bot difficulty, then tap Start Game.");