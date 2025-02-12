var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = [ 'forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 2; // 2 second movement interval
var maxrandom = 5; // 0-5 seconds added to movement interval (randomly)


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
	var username = data["name"]

	const mineflayer = require('mineflayer')
	var bot = mineflayer.createBot({
  		host: host,
  		username: username
	});

	bot.on('login',function(){
		console.log("Logged In")
		bot.chat("Hi")
	});

	bot.on('spawn',function() {
	    connected=1;
	});
	
	bot.on('death',function() {
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
	                moving = 1;
	                lasttime = bot.time.age;
	                bot.activateItem();
	            }
	        }
	    }
	});

	
  	bot.on('kicked', function(reason, loggedIn) {
		console.log(reason, loggedIn);
		connected=1;
	});
	
        bot.on('error',function(err) {
		console.log(err);
	    	connected=1;
	});
	
	bot.on('end', createBot)
}

createBot();
