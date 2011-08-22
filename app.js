var dgram = require('dgram');
var util = require('util');
var server = dgram.createSocket("udp4");



var statHolder = new Object;
statHolder.times = [getTime(),getTime()];
statHolder.switchState = -1;
statHolder.readInt = 0;
statHolder.lapTime = function(){
    return this.times[1]-this.times[0];
    }
statHolder.roundTrip = function(){
    return((getTime()-this.times[0])/1000.0);
    }

function getTime(){
    return new Date().getTime();
    }

function msgParser(msg){
    var myStr = msg.toString('ascii',0,msg.length-11);
    var myVal = msg.slice(msg.length-2,msg.length);
    intVal = myVal[0]*256+myVal[1];
    if(intVal===0 && statHolder.switchState !== 0 && statHolder.readInt > 1){
        console.log(statHolder.roundTrip()+" seconds.");
        statHolder.switchState = 0;
        statHolder.times = [getTime()];
    }
    if(intVal>100){
        statHolder.readInt += 1;
        if(statHolder.switchState<1){
        statHolder.switchState = 1;
        statHolder.times.push(getTime());
       // console.log(statHolder.lapTime());
        }
    }
}

server.setBroadcast(true);

server.on("message", function (msg, rinfo) {
    if(msg.length===28){
        
        msgParser(msg);
        //console.log(myStr+":"+intVal.toString()+" from "+rinfo.address+":"+rinfo.port);
    
    }
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(10000);
// server listening 0.0.0.0:41234


var sendPing = true;

var message = new Buffer("/network/find");

function myPinger(){
    if(sendPing === true){
        var client = dgram.createSocket("udp4");
        client.setBroadcast(true);
        client.send(message, 0, message.length, 10000, "multicast");
        client.close();
    }
}
myInt = setInterval(function(){myPinger()}, 1000);


