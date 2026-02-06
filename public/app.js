const socket = io();

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tool = "pen";
let shape = null;

let drawing = false;
let strokes = [];

const notebookId = "defaultNotebook";
const boardId = "board1";

socket.emit("joinBoard", { notebookId, boardId });

function setTool(t){ tool=t; shape=null; }
function setShape(s){ shape=s; }

function drawStroke(s){
  ctx.globalAlpha = s.tool==="marker"?0.3:1;
  ctx.strokeStyle = s.tool==="eraser"?"white":"black";
  ctx.lineWidth = s.size;

  ctx.beginPath();
  ctx.moveTo(s.x0,s.y0);
  ctx.lineTo(s.x1,s.y1);
  ctx.stroke();
}

canvas.addEventListener("pointerdown", e=>{
  drawing=true;
  startX=e.clientX;
  startY=e.clientY;
});

canvas.addEventListener("pointerup", e=>{
  drawing=false;

  if(shape==="rect"){
    ctx.strokeRect(startX,startY,e.clientX-startX,e.clientY-startY);
    return;
  }

  if(shape==="circle"){
    ctx.beginPath();
    ctx.arc(startX,startY,50,0,Math.PI*2);
    ctx.stroke();
    return;
  }
});

canvas.addEventListener("pointermove", e=>{
  if(!drawing || shape) return;

  const stroke={
    x0:startX,y0:startY,
    x1:e.clientX,y1:e.clientY,
    size:4,tool
  };

  strokes.push(stroke);
  drawStroke(stroke);

  socket.emit("draw",{notebookId,boardId,stroke});

  startX=e.clientX;
  startY=e.clientY;

  socket.emit("cursor",{x:e.clientX,y:e.clientY});
});

socket.on("draw", drawStroke);

function undo(){
  strokes.pop();
  redraw();
}

function redraw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  strokes.forEach(drawStroke);
}

function clearBoard(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function setBg(type){
  if(type==="grid"){
    canvas.style.backgroundImage=
      "linear-gradient(#ddd 1px, transparent 1px),linear-gradient(90deg,#ddd 1px, transparent 1px)";
    canvas.style.backgroundSize="20px 20px";
  }
  if(type==="dots"){
    canvas.style.backgroundImage="radial-gradient(#ccc 1px, transparent 1px)";
    canvas.style.backgroundSize="20px 20px";
  }
}
