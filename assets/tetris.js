/////////////// 변수 ////////////////
// 오브젝트 변수
let tetris_field_tb=document.getElementById("tetris_field");  // 필드
let holdblock_img=document.getElementById("holdblock_img");  // 홀드 블록 이미지
let nextblock_img=document.getElementById("nextblock_img");  // 다음 블록 이미지
let score_p=document.getElementById("score");  // 점수판

// 제어용 변수
let field=[];  // 필드 내 td 저장
let bitfield=[];  // 현재 필드 상태 0: 빈칸 | -1: 고정 | 1: 현재 블록
let current_block=null;  // 현재 블록
let next_block=null;  // 다음 블록
let hold_block=null;  // 홀드 블록

let already_hold=false;

let block_pos=null;  // 현재 블록 위치

let touch_left=false;
let touch_right=false;

let level=0;
let broken_lines=0;
let score=0;

let lastmove_time=0;

let update=null;
let game_pause=false;
let game_over=false;
let started=false;



////////////// 상수 //////////////////
const BLOCK_I=0;
const BLOCK_L=1;
const BLOCK_L_R=2;
const BLOCK_O=3;
const BLOCK_T=4;
const BLOCK_S=5;
const BLOCK_S_R=6;

const BLOCK_COLOR=["#70f2e3", "#7daeff", "#ff9e73", "#f7d877", "#c49bff", "#79d99d", "#ff72b9"];

const LEVEL_SET=[3, 8, 15, 24, 35, 48, 65, 86, 110, 300];
const MOVE_DT=[400, 350, 310, 270, 230, 200, 170, 150, 130, 110, 70];
const SCORE_X=[0, 1, 2, 4, 7];

const NONE=0;
const UP=1;
const DOWN=2;
const LEFT=3;
const RIGHT=4;
const DROP=5;

// BLOCK_STATE[BLOCK_CODE][STATE_CODE][BLOCK_NUM][X|Y];
const BLOCK_STATE=[
  [
    [[0, 0], [0, 1], [0, -1], [0, 2]], 
    [[0, 0], [1, 0], [-1, 0], [2, 0]]
  ], 
  [
    [[0, 0], [0, 1], [0, -1], [-1, 1]], 
    [[0, 0], [-1, 0], [1, 0], [1, 1]], 
    [[0, 0], [0, -1], [0, 1], [1, -1]], 
    [[0, 0], [1, 0], [-1, 0], [-1, -1]]
  ], 
  [
    [[0, 0], [0, 1], [0, -1], [-1, -1]], 
    [[0, 0], [-1, 0], [1, 0], [-1, 1]], 
    [[0, 0], [0, -1], [0, 1], [1, 1]], 
    [[0, 0], [1, 0], [-1, 0], [1, -1]]
  ], 
  [
    [[0, 0], [0, 1], [-1, 1], [-1, 0]]
  ], 
  [
    [[0, 0], [0, 1], [0, -1], [-1, 0]], 
    [[0, 0], [1, 0], [-1, 0], [0, 1]], 
    [[0, 0], [0, -1], [0, 1], [1, 0]], 
    [[0, 0], [-1, 0], [1, 0], [0, -1]]
  ], 
  [
    [[0, 0], [-1, 0], [0, -1], [-1, 1]],
    [[0, 0], [0, 1], [-1, 0], [1, 1]]
  ], 
  [
    [[0, 0], [-1, 0], [0, 1], [-1, -1]],
    [[0, 0], [0, 1], [1, 0], [-1, 1]]
  ]
];



//////////////////// MAIN /////////////////////
// 이벤트 설정
document.onkeydown=KeyboardControl;  // 키 입력 제어

// 필드 설정
for(let i=0;i<20;i++) {
  let tr=document.createElement("tr");
  row=[];
  bitrow=[];
  
  for(let j=0;j<10;j++) {
    let td=document.createElement("td");
    tr.appendChild(td);
    td.style.backgroundColor="#0c1b24";
    
    row.push(td);
    bitrow.push(0);
  }
  
  tetris_field_tb.appendChild(tr);
  
  field.push(row);
  bitfield.push(bitrow);
}

update=setInterval(Update, 30);



///////////////// 함수 /////////////////
function Update() {
  if(!started||game_pause||game_over) return;
  if(current_block==null) {
    if(next_block==null) {
      SetNextBlock();
      lastmove_time=new Date().getTime();
    }
    
    SetCurrentBlock();
    SetNextBlock();
  }
  
  MoveBlock(NONE);
}

// 다음 블록 설정 및 띄우기
function SetNextBlock() {
  next_block=parseInt(Math.random()*7);
  ViewBlock(nextblock_img, next_block);
}


function SetCurrentBlock() {
  current_block=[];
  current_block.push(next_block);
  current_block.push(0);  // 현재 블록 상태(방향)
  
  nextblock_img.childNodes[0].remove();
  nextblock_img.childNodes[0].remove();
  nextblock_img.childNodes[0].remove();
  nextblock_img.childNodes[0].remove();
  
  switch (current_block[0]) {
    case BLOCK_I:
    case BLOCK_O:
    case BLOCK_L:
    case BLOCK_S:
    case BLOCK_T:
      block_pos=[-1, 4];
      break;
    case BLOCK_L_R:
    case BLOCK_S_R:
      block_pos=[-1, 5];
      break;
  }
  
  next_block=null;
}


// 블록 띄우기
function ViewBlock(ondiv, block_kind) {
  ondiv.replaceChildren();
  for(const [row, col] of BLOCK_STATE[block_kind][0]) {
    const part=document.createElement("div");
    part.style.position="absolute";
    part.style.width="22px";
    part.style.height="22px";
    part.style.top=`${(row+1)*22}px`;
    part.style.left=`${(col+1)*22}px`;
    part.style.backgroundColor=BLOCK_COLOR[block_kind];
    ondiv.append(part);
  }
}

function MoveBlock(dirr) {
  if(current_block==null) {
    return;
  }
  
  if(dirr==UP) {
    SpinBlock();
    return;
  }
  
  switch(dirr) {
    case DOWN:
      ViewScore(4*(1000-MOVE_DT[level]));
    case NONE:
      if(dirr==NONE&&new Date().getTime()-lastmove_time<MOVE_DT[level]) {
        return;
      }
      
      touch_left=false;
      touch_right=false;
      
      // 내려갈 수 있나?
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0]+1;
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        // 더 못내려감
        if(px>=20||(px>=0&&bitfield[px][py]==-1)) {
          for(let j=0;j<4;j++) {
            px=BLOCK_STATE[current_block[0]][current_block[1]][j][0]+block_pos[0];
            py=BLOCK_STATE[current_block[0]][current_block[1]][j][1]+block_pos[1];
            
            // 그 자리에 고정
            if(px<0) {
              GameOver();
              return;
            }
            
            bitfield[px][py]=-1;
          }
          
          current_block=null;
          already_hold=false;
          CheckLine();
          return;
        }
      }
      
      lastmove_time=new Date().getTime();
      
      // 현재 위치에 있던 블록 지우기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor="#0c1b24";
        bitfield[px][py]=0;
      }
      
      block_pos[0]++;
      
      // 다음 위치에 블록 생성하기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor=BLOCK_COLOR[current_block[0]];
        bitfield[px][py]=1;
      }
      
      break;
      
    case LEFT:
      if(current_block==null) {
        return;
      }
      
      // 움직일 수 있나?
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1]-1;
        
        // 못 움직임
        if(py<0||(px>=0&&bitfield[px][py]==-1)) {
          touch_left=true;
          return;
        }
      }
      
      // 현재 위치에 있던 블록 지우기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor="#0c1b24";
        bitfield[px][py]=0;
      }
      
      block_pos[1]--;
      
      // 다음 위치에 블록 생성하기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor=BLOCK_COLOR[current_block[0]];
        bitfield[px][py]=1;
      }
      
      break;
      
    case RIGHT:
      if(current_block==null) {
        return;
      }
      
      // 움직일 수 있나?
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1]+1;
        
        // 못 움직임
        if(py>=10||(px>=0&&bitfield[px][py]==-1)) {
          touch_right=true;
          return;
        }
      }
      
      // 현재 위치에 있던 블록 지우기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor="#0c1b24";
        bitfield[px][py]=0;
      }
      
      block_pos[1]++;
      
      // 다음 위치에 블록 생성하기
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor=BLOCK_COLOR[current_block[0]];
        bitfield[px][py]=1;
      }
      
      break;
      
    case DROP:
      dx=1;
      
      while(true) {
        for(let i=0;i<4;i++) {
          px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0]+dx;
          py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
          
          if(px>=20||(px>=0&&bitfield[px][py]==-1)) {
            dx--;
            dx=-dx;
            break;
          }
        }
        
        if(dx<=0) {
          dx=-dx;
          
          for(let i=0;i<4;i++) {
            px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
            py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
            
            if(px<0) continue;
            
            field[px][py].style.backgroundColor="#0c1b24";
            bitfield[px][py]=0;
          }
          
          block_pos[0]+=dx;
          
          for(let i=0;i<4;i++) {
            px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
            py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
            
            if(px<0) continue;
            
            field[px][py].style.backgroundColor=BLOCK_COLOR[current_block[0]];
            bitfield[px][py]=-1;
          }
          
          current_block=null;
          already_hold=false;
          CheckLine();
          ViewScore(dx*4*(1000-MOVE_DT[level]));
          
          break;
        }
        
        dx++;
      }
      
      break;
  }
}


function HoldBlock() {
  if(hold_block==current_block[0]||already_hold) return;
  
  tmp=hold_block;
  hold_block=current_block[0];
  
  for(let i=0;i<4;i++) {
    px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
    py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
    
    if(px>=0) {
      bitfield[px][py]=0;
      field[px][py].style.background="#0c1b24";
    }
  }
  
  // 홀드 되어 있던 블록 지우기
  if(tmp==null) current_block=null;
  else {
    holdblock_img.childNodes[0].remove();
    holdblock_img.childNodes[0].remove();
    holdblock_img.childNodes[0].remove();
    holdblock_img.childNodes[0].remove();
    
    current_block=[tmp, 0];
    
    switch (current_block[0]) {
      case BLOCK_I:
      case BLOCK_O:
      case BLOCK_L:
      case BLOCK_S:
      case BLOCK_T:
        block_pos=[-1, 4];
        break;
      case BLOCK_L_R:
      case BLOCK_S_R:
        block_pos=[-1, 5];
        break;
    }
  }
  
  already_hold=true;
  ViewBlock(holdblock_img, hold_block);
}


function SpinBlock() {
  switch(current_block[0]) {
    case BLOCK_O:
      break;
    default:
      pbit=[0, 0, 0, 0];
      
      // 돌릴 수 있는 지 검사
      for(let i=0;i<4;i++) {
        for(let j=0;j<4;j++) {
          // |-----------------------------------------------변환점----------------------------------------------------| |------------------------보정치----------------------|
          px=BLOCK_STATE[current_block[0]][(current_block[1]+1)%BLOCK_STATE[current_block[0]].length][i][0]+block_pos[0]+BLOCK_STATE[current_block[0]][current_block[1]][j][0];
          py=BLOCK_STATE[current_block[0]][(current_block[1]+1)%BLOCK_STATE[current_block[0]].length][i][1]+block_pos[1]+BLOCK_STATE[current_block[0]][current_block[1]][j][1];
          
          if(px<20&&0<=py&&py<10&&(px<0||bitfield[px][py]!=-1)) {
            pbit[j]|=(1<<i);
          }
        }
      }
      
      // 돌릴 수 있나?
      adj=-1;
      for(let i=0;i<4;i++) {
        if(pbit[i]==(1<<4)-1) {
          adj=i;
          break;
        }
      }
      
      // 돌릴 수 없다!
      if(adj==-1) {
        return;
      }
      
      // 돌릴 수 있다!
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][current_block[1]][i][0]+block_pos[0];
        py=BLOCK_STATE[current_block[0]][current_block[1]][i][1]+block_pos[1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor="#0c1b24";
        bitfield[px][py]=0;
      }
      
      for(let i=0;i<4;i++) {
        px=BLOCK_STATE[current_block[0]][(current_block[1]+1)%BLOCK_STATE[current_block[0]].length][i][0]+block_pos[0]+BLOCK_STATE[current_block[0]][current_block[1]][adj][0];
        py=BLOCK_STATE[current_block[0]][(current_block[1]+1)%BLOCK_STATE[current_block[0]].length][i][1]+block_pos[1]+BLOCK_STATE[current_block[0]][current_block[1]][adj][1];
        
        if(px<0) continue;
        
        field[px][py].style.backgroundColor=BLOCK_COLOR[current_block[0]];
        bitfield[px][py]=1;
      }
      
      block_pos[0]+=BLOCK_STATE[current_block[0]][current_block[1]][adj][0];
      block_pos[1]+=BLOCK_STATE[current_block[0]][current_block[1]][adj][1];
      current_block[1]=(current_block[1]+1)%BLOCK_STATE[current_block[0]].length;
      
      break;
  }
}


function CheckLine() {
  let popedlinebit=0;
  let poplines=0;
  
  for(let i=0;i<20;i++) {
    let linebit=0;
    
    for(let j=0;j<20;j++) {
      if(bitfield[i][j]==-1) linebit|=(1<<j);
    }
    
    // 터짐
    if(linebit==(1<<10)-1) {
      popedlinebit|=(1<<i);  // 몇 행인지 기록
      broken_lines++;
      poplines++;
      
      if(level!=9&&LEVEL_SET[level]<=broken_lines) {
        level++;
      }
      
      // 빈칸으로
      for(let j=0;j<10;j++) {
        bitfield[i][j]=0;
        field[i][j].style.backgroundColor="#0c1b24";
      }
    }
  }
  
  if(popedlinebit==0) { // 아무것도 안터짐
    return;
  }
  
  ViewScore(SCORE_X[poplines]*(1000-MOVE_DT[level]));
  
  for(let i=18;i>=0;i--) {
    if(!(popedlinebit&(1<<i))) {  // 안터진 행
      for(let j=19;j>=i+1;j--) {  // 제일 멀리 있는 터진 행 찾기
        if(popedlinebit&(1<<j)) {
          for(let k=0;k<10;k++) {  // 아래로 밀기
            bitfield[j][k]=bitfield[i][k];
            bitfield[i][k]=0;
            
            field[j][k].style.backgroundColor=field[i][k].style.backgroundColor;
            field[i][k].style.backgroundColor="#0c1b24";
          }
          
          popedlinebit-=(1<<j);
          popedlinebit|=(1<<i);
          
          break;
        }
      }
    }
  }
}


function ViewScore(ds) {
  score+=parseInt(ds/20);
  score_p.innerText=""+score;
}


function KeyboardControl(event) {
  if(!started) {
    started=true;
    document.getElementById("tetris-ready").hidden=true;
    Update();
    return;
  }
  if(game_over) return;
  if([32,37,38,39,40].includes(event.which)) event.preventDefault();
  
  if(event.which==27) {
    game_pause=!game_pause;
    
    if(game_pause) {
      clearInterval(update);
    } else {
      update=setInterval(Update, 30);
    }
  }
  
  if(game_pause) return;
  
  console.log(event.which);
  switch(event.which) {
    case 32:  // space
      MoveBlock(DROP);
      break;
      
    case 37:  // left arrow
      if(!touch_left) {
        MoveBlock(LEFT);
        lastmove_time+=60;
      }
      break;
      
    case 38:  // up arrow
      SpinBlock();
      lastmove_time+=60;
      break;
      
    case 39:  // right arrow
      if(!touch_right) {
        MoveBlock(RIGHT);
        lastmove_time+=60;
      }
      break;
      
    case 40:  // down arrow
      MoveBlock(DOWN);
      break;
    
    case 90: // Z
      HoldBlock();
      break;
  }
}


function GameOver() {
  console.log("GamgeOver");
  game_over=true;
  
  document.getElementById("game_over_div").style.scale="1 1";
  document.getElementById("tetris-final-score").innerText=score_p.innerText;
  
  clearInterval(update);
}



////////////////
function Transposition(pos) {
  px=pos[0];
  py=pos[1];
  
  tmp=py;
  py=-px;
  px=py;
  
  return [px, py];
}
