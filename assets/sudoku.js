let field=document.querySelector("#field");  // html 필드 노드

let sudoku_field=[];  // 제어용 필드 변수
let answer=[];  // 스도쿠 정답 저장 변수
let memo=[];  // 메모용 변수

let isclear=false;

let leftblank;  // 남은 빈칸 수
let starttime=new Date();  // 게임 시작 시시작
const difficultySelect=document.getElementById("sudoku-difficulty");
const requestedDifficulty=new URLSearchParams(location.search).get("difficulty");
const currentDifficulty=["EASY", "NORMAL", "HARD"].includes(requestedDifficulty) ? requestedDifficulty : "HARD";
difficultySelect.value=currentDifficulty;
document.getElementById("level").innerText=`SUDOKU-${currentDifficulty}`;
difficultySelect.addEventListener("change", () => {
    location.search=`?difficulty=${difficultySelect.value}`;
});

document.onkeydown=InsertNum;  // 키 입력 제어
document.getElementById("reset_btn").onclick=ResetField  // 리셋 버튼

for(let i=0;i<9;i++) {
    let rows=[];
    let tr=document.createElement("tr");  // 임시 행 변수
    
    for(let j=0;j<9;j++) {
        let td=document.createElement("td");  // 임시 칸 변수
        
        if(i==3||i==6) {
            td.style.borderTopWidth="2px";
        }
        
        if(j==3||j==6) {
            td.style.borderLeftWidth="2px";
        }
        
        td.onmousedown=onClickCell;
        td.appendChild(document.createElement("p"));
        rows.push(td);
        tr.appendChild(td);
    }
    
    sudoku_field.push(rows);
    field.appendChild(tr);
}

answer=CreateAnswer();  // 정답 필드 생성

// 문제(빈칸) 생성
diff=0;
switch(currentDifficulty) {
    case "EASY":
        diff=32;
        break;
    case "NORMAL":
        diff=37;
        break;
    case "HARD":
        diff=45;
        break;
    default:
        diff=50;
        break;
}

CreateProblem(diff);
leftblank=diff;

setInterval(Update, 4);


///////////////////////// 함수 ///////////////////////////
// 함수 제어용 변수
let selected=null;
let insertmode;
let lastdownkey=null;

function CreateAnswer() {
    let visited=[];
    let cnt=[];
    
    // 배열 초기화
    for(let i=0;i<9;i++) {
        let tmp1=[];
        let tmp2=[];
        
        for(let j=0;j<9;j++) {
            tmp1.push(0);
            tmp2.push(0);
        }
        
        visited.push(tmp1);
        answer.push(tmp2);
    }
    
    // 백트래킹
    let i=0, j=0;
    
    while(i!=9) {
        let bit=0;
        // 넣을 수 있는 숫자 검사
        for(let k=0;k<9;k++) {
            bit|=(1<<answer[i][k]);
            bit|=(1<<answer[k][j]);
            bit|=(1<<answer[i-i%3+parseInt(k/3)][j-j%3+k%3]);
        }
        
        avail=[];
        
        for(let k=1;k<=9;k++) {
            if(((bit&(1<<k))==0)&&((visited[i][j]&(1<<k))==0)) {
                avail.push(k);
            }
        }
        
        if(avail.length>0) {
            ins=parseInt(Math.random()*avail.length);
            visited[i][j]|=(1<<avail[ins]);
            answer[i][j]=avail[ins];
            
            console.log(bit, i, j, avail, visited[i][j]), answer[i][j];
        } else {
            visited[i][j]=0;
            
            // 백
            j--;
            if(j==-1) {
                i--;
                j=8;
            }
        
            answer[i][j]=0;
        
            continue;
        }
        
        // 다음 포인트
        j++;
        if(j==9) {
            i++;
            j=0;
        }
    }
    
    return answer;
}


function CreateProblem(diff) {
    let bitfield=[];
    
    // 배열 초기화
    for(let i=0;i<9;i++) {
        let tmp1=[];
        
        for(let j=0;j<9;j++) {
            tmp1.push(true);
        }
        
        bitfield.push(tmp1);
    }
    
    while(diff>0) {
        i=parseInt(Math.random()*9);
        j=parseInt(Math.random()*9);
        
        if(bitfield[i][j]) {
            bitfield[i][j]=!bitfield[i][j];
            diff--;
        }
    }
    
    WriteField(bitfield);
}


function WriteField(bitfield) {
    for(let i=0;i<9;i++) {
        for(let j=0;j<9;j++) {
            if(bitfield[i][j]) {
                sudoku_field[i][j].innerText=""+answer[i][j];
                sudoku_field[i][j].classList.add("fixed");
            } else {
                //sudoku_field[i][j].innerText="0";
            }
        }
    }
}


function ResetField() {
    for(let i=0;i<9;i++) {
        for(let j=0;j<9;j++) {
            if(!sudoku_field[i][j].classList.contains("fixed")) {
                sudoku_field[i][j].innerText="";
            }
        }
    }
    
    FocusOff();
    leftblank=diff;
}


function CheckAnswer() {
    for(let i=0;i<9;i+=3) {
        for(let j=0;j<9;j+=3) {
            bit=0;
            
            for(let ii=0;ii<3;ii++) {
                for(let jj=0;jj<3;jj++) {
                    bit|=(1<<parseInt(sudoku_field[i+ii][j+jj].innerText));
                    console.log(i, ii, j, jj);
                }
            }
            
            console.log(bit);
            
            if(bit!==(1<<10)-2) {
                return;
            }
        }
    }
    
    for(let i=0;i<9;i++) {
        bit1=0;
        bit2=0;
        
        for(let j=0;j<9;j++) {
            bit1|=(1<<parseInt(sudoku_field[i][j].innerText));
            bit2|=(1<<parseInt(sudoku_field[i][j].innerText));
        }
        
        if(bit!=(1<<10)-2||bit2!=(1<<10)-2) {
            return;
        }
    }
    
    PopupClear();
}


function PopupClear() {
    console.log("CLEAR!");
    
    clear_popup=document.getElementById("clear_popup");
    clear_popup.style.scale="1 1";
    Update();
}


function PopupPause() {
    
}


////////// 이벤트 함수 //////////
function onClickCell(event) {
    if(this.classList.contains("fixed")) {
        FocusOff();
        return;
    }
    
    if(selected!=null) {
        FocusOff();
    }
    
    selected=this;
    selected.classList.add("selected");
    selected.style.borderWidth="3px";
    
    if(!event.altKey) {
        insertmode=true;
    } else {
        insertmode=false;
    }
    
    console.log(event.button, event.altKey);
}


function InsertNum(event) {
    if(selected==null||lastdownkey==event.which) {
        return;
    }
    
    if(event.which==37) {  // esc
        PopupPause();
    }
    
    lastdownkey=event.which;
    console.log(event.which, selected, insertmode);
    
    if(selected==null) {
        console.log("ret");
        return;
    } else {
        if(49<=event.which&&event.which<=57) {
            if(insertmode) {
                if(selected.innerText=="") {
                    leftblank--;
                }
                
                selected.innerText=""+(event.which-48);
            } else {
                //console.log(selected.childNodes[1]);
                //selected.innerHtml=
            }
        } else if(97<=event.which&&event.which<=105) {
            if(insertmode) {
                if(selected.innerText=="") {
                    leftblank--;
                }
                
                selected.innerText=""+(event.which-96);
            } else {
                selected.childNodes[1].innerText+=(""+(event.which-96))
            }
        } else if(event.which==8||event.which==46||event.which==48||event.which==96) {  // backspace, delete, 0, numpad 0
            if(insertmode) {
                leftblank++;
                selected.innerText="";
            } else {
                selected.childNodes.innerText="";
            }
        }
        
        FocusOff();
        lastdownkey=null;
        
        if(leftblank==0) {
            CheckAnswer();
        }
    }
}


function FocusOff() {
    for(let i=0;i<9;i++) {
        for(let j=0;j<9;j++) {
            if(sudoku_field[i][j]==selected) {
                selected.style.borderWidth="1px";
                selected.classList.remove("selected");
                
                if(i==3||i==6) {
                    selected.style.borderTopWidth="2px";
                }
                
                if(j==3||j==6) {
                    selected.style.borderLeftWidth="2px";
                }
                
                selected=null;
                return;
            }
        }
    }
}


function Update() {
    if(isclear==true) {
        return;
    }
    
    playtime=document.getElementById("playtime");
    dt=new Date((new Date()).getTime()-starttime.getTime());
    
    playtime.innerText="";
    
    if(dt.getUTCHours()<10) {
        playtime.innerText+="0";
    }
    playtime.innerText+=(dt.getUTCHours()+":");
    
    if(dt.getMinutes()<10) {
        playtime.innerText+="0";
    }
    playtime.innerText+=(dt.getMinutes()+":");
    
    if(dt.getSeconds()<10) {
        playtime.innerText+="0";
    }
    playtime.innerText+=(dt.getSeconds()+".");
    
    if(dt.getMilliseconds()<10) {
        playtime.innerText+="00";
    } else if(dt.getMilliseconds()<10) {
        playtime.innerText+="0";
    }
    playtime.innerText+=(dt.getMilliseconds()+":");
    
    document.getElementById("clear-time").innerText=playtime.innerText;
    
    if(document.getElementById("clear_popup").style.scale=='1') {
        isclear=true;
    }
}
