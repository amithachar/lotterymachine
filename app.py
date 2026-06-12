let history=[]

async function startRoll(){

const btn=
document.getElementById(
"startBtn"
)

btn.disabled=true

const balls=
document.querySelectorAll(
".ball"
)

balls.forEach(

ball=>{

ball.classList.add(
"roll"
)

}

)

const intervals=[]

balls.forEach(

(
ball,
index

)=>{

const number=

ball.querySelector(
"span"
)

intervals[index]=

setInterval(

()=>{

number.innerHTML=

Math.floor(
Math.random()*10
)

},

70

)

}

)

const response=

await fetch(
"/start"
)

const data=

await response.json()

setTimeout(()=>{

let winner=""

balls.forEach(

(
ball,
index

)=>{

setTimeout(()=>{

clearInterval(
intervals[index]
)

ball.classList.remove(
"roll"
)

let digit=

data.numbers[index]

ball.querySelector(
"span"
)

.innerHTML=

digit

winner+=digit

if(
index===5
){

btn.disabled=false

addWinner(
winner
)

}

},

index*700

)

}

)

},10000)

}

function addWinner(

value

){

history.unshift(
value
)

history=

history.slice(
0,
10
)

document
.getElementById(
"historyTicker"
)

.innerHTML=

history.join(

" &nbsp;&nbsp; ★ &nbsp;&nbsp; "

)

}