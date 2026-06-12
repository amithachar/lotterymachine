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

setTimeout(

()=>{

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

data.numbers[
index
]

if(

index===5

){

btn.disabled=false

updateHistory(
data.numbers
)

}

},

index*700

)

}

)

},

10000

)

}

function updateHistory(

numbers

){

history.unshift(

numbers.join(
" - "
)

)

if(

history.length>10

)

history.pop()

document
.getElementById(
"ticker"
)

.innerHTML=

history.join(

"&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;"

)

}