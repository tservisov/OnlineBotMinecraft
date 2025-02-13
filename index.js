const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

var actions = [ 'forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 2; // 2 second movement interval
var maxrandom = 5; // 0-5 seconds added to movement interval (randomly)
var reconected = false;

function getData()
{
	const fs = require('fs')
	let rawdata = fs.readFileSync('config.json');
	let data = JSON.parse(rawdata);
	return data;
}

function getRandomArbitrary(min, max) 
{
       return Math.random() * (max - min) + min;
}

function createBot()
{
	var data = getData();
	var host = data["ip"];
	var port = data["port"];
	var username = data["name"]

	var lasttime = -1;
	var moving = 0;
	var connected = 0;

	const mineflayer = require('mineflayer')
	var bot = mineflayer.createBot({
  		host: host,
		port: port,
  		username: username
	});

	bot.on('login',function(){
		console.log("Logged In")
		bot.chat("Hi")
		reconected = false;
	});

	bot.on('spawn',function() {
	    console.log(`Bot is spawn`)
	    connected=1;
	});
	
	bot.on('death',function() {
	    console.log(`Bot is dead`)
	    bot.emit("respawn")
	});
	
	bot.on('time', function(time) {
	    if (connected <1) {
	        return;
	    }
	    if (lasttime<0) {
	        lasttime = bot.time.age;
	    } else {
	        var randomadd = Math.random() * maxrandom * 20;
	        var interval = moveinterval*20 + randomadd;
	        if (bot.time.age - lasttime > interval) {
	            if (moving == 1) {
	                bot.setControlState(lastaction,false);
	                moving = 0;
	                lasttime = bot.time.age;
	            } else {
	                var yaw = Math.random()*pi - (0.5*pi);
	                var pitch = Math.random()*pi - (0.5*pi);
	                bot.look(yaw,pitch,false);
	                lastaction = actions[Math.floor(Math.random() * actions.length)];
	                bot.setControlState(lastaction,true);
			console.log(`Bot is ${lastaction}`)
	                moving = 1;
	                lasttime = bot.time.age;
	                bot.activateItem();
	            }
	        }
	    }
	});

	
  	bot.on('kicked', function(reason, loggedIn) {
		console.log(reason, loggedIn);
		connected=0;
	});
	
        bot.on('error',function(err) {
		console.log(err);
	    	connected=0;
	});
	
	bot.on('end', function(){
		if(!connected)
		{
			if (!reconected)
			{
				console.log(`Bot is reconected`)
				setTimeout(createBot, 60000);
				reconected = true;
			}	
		}
	});

	bot.on('playerJoined', function(player){
		if (player.username != username)
		{
			if (player.username == 'pisun')
			{
				bot.chat(player.username + ', получил очивку: "Гроза лавок и сундуков"')	
			}
			if (player.username == 'Sirentino')
			{
				bot.chat(player.username + ', получил очивку: "Шашлык не заказывали?"')	
			}
			if (player.username == 'Leet')
			{
				bot.chat(player.username + ', получил очивку: "Похоронен заживо!"')	
			}
			else
			{
				bot.chat(player.username + ", вещь или бан!")
			}
		}
	});
}

createBot();
