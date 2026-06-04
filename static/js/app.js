async function startRoll(){

const btn =
document.getElementById(
"startBtn"
);

btn.disabled=true;

const balls =
document.querySelectorAll(
".ball"
);

balls.forEach(
ball=>{
ball.classList.add(
"roll"
);
});

const intervals=[];

balls.forEach(
(ball,index)=>{

const number =
ball.querySelector(
"span"
);

intervals[index]=
setInterval(()=>{

number.innerHTML=
Math.floor(
Math.random()*10
);

},70);

});

setTimeout(()=>{

balls.forEach(
(ball,index)=>{

setTimeout(()=>{

clearInterval(
intervals[index]
);

ball.classList.remove(
"roll"
);

ball.querySelector(
"span"
).innerHTML=

Math.floor(
Math.random()*10
);

if(
index===5
){

btn.disabled=false;

}

},
index*700
);

});

},10000);

}