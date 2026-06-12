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

const value=

data.numbers[index]

ball.querySelector(
"span"
)

.innerHTML=

value

winner+=value

if(

index===5

){

btn.disabled=false

saveWinner(
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

function saveWinner(

winner

){

history.unshift(
winner
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

"&nbsp;&nbsp;★&nbsp;&nbsp;"

)

}

const states=[

"Andhra Pradesh",
"Arunachal Pradesh",
"Assam",
"Bihar",
"Goa",
"Gujarat",
"Haryana",
"Karnataka",
"Kerala",
"Madhya Pradesh",

"Maharashtra",
"Odisha",
"Punjab",
"Rajasthan",
"Sikkim",
"Tamil Nadu",
"Telangana",
"Tripura",
"Uttar Pradesh",
"West Bengal"

]

function randomTicket(){

return Math.floor(

100000+

Math.random()*900000

)

}

function randomSold(){

return Math.floor(

100+

Math.random()*900

)

}

function loadSales(){

const panel=

document.getElementById(
"stateList"
)

panel.innerHTML=""

states.forEach(

state=>{

const row=

document.createElement(
"div"
)

row.className=
"stateRow"

row.innerHTML=`

<div class="stateName">

${state}

</div>

<div class="ticketBox">

🎟️ ${randomTicket()}

</div>

<div class="soldBox">

${randomSold()} sold

</div>

`

panel.appendChild(
row
)

}

)

}

loadSales()

setInterval(

loadSales,

60000

)