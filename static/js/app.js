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

const people=[

"Aarav",
"Vivaan",
"Aditya",
"Arjun",
"Rohan",
"Kiran",
"Ananya",
"Pooja",
"Sneha",
"Diya",

"Priya",
"Nikhil",
"Rahul",
"Meera",
"Riya",
"Vikram",
"Neha",
"Krishna",
"Akash",
"Sanjana"

]

function randomName(){

return people[

Math.floor(

Math.random()

*

people.length

)

]

}

function randomPrize(){

return (

Math.floor(

1+

Math.random()*50

)

)

+

" Lakh"

}

function loadWinners(){

const board=

document.getElementById(
"winnerList"
)

board.innerHTML=""

for(

let i=0;

i<10;

i++

){

const state=

states[

Math.floor(

Math.random()

*

states.length

)

]

const row=

document.createElement(
"div"
)

row.className=

"winnerCard"

row.innerHTML=`

<div class="winnerName">

${randomName()}

</div>

<div class="winnerState">

📍 ${state}

</div>

<div class="winnerTicket">

🎟 ${randomTicket()}

</div>

<div class="winnerPrize">

💰 ₹${randomPrize()}

</div>

`

board.appendChild(
row
)

}

}

loadWinners()

setInterval(

loadWinners,

60000

)