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

b=>

b.classList.add(
"roll"
)

)

const intervals=[]

balls.forEach(

(
ball,
index

)=>{

const span=

ball.querySelector(
"span"
)

intervals[index]=

setInterval(

()=>{

span.innerHTML=

Math.floor(
Math.random()*10
)

},

80

)

}

)

const response=

await fetch(
"/start"
)

const data=

await response.json()

setTimeout(

()=>{

let final=""

balls.forEach(

(
ball,
index

)=>{

setTimeout(

()=>{

clearInterval(
intervals[index]
)

ball.classList.remove(
"roll"
)

ball.querySelector(
"span"
)

.innerHTML=

data.numbers[index]

final+=

data.numbers[index]

if(

index===5

){

btn.disabled=false

updateHistory(
final
)

}

},

index*500

)

}

)

},

10000

)

}

function updateHistory(

result

){

history.unshift(
result
)

history=

history.slice(
0,
10
)

document
.getElementById(
"ticker"
)

.innerHTML=

history.join(

"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"

)

}