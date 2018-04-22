var http, director, cool, bot, router, server, port;

//required dependencies
http        = require('http');
director    = require('director');
cool        = require('cool-ascii-faces');
bot         = require('./bot.js');

//Log attempting to start the Bot.
console.log("BOi we starting up!");

//creating a new router that manages incoming and outgoing messages.
//Adds the corresponding fields of post and get of http
router = 
  new director.http.Router(
  {
    //setting the message the root.
    '/' : 
    {
      post: bot.respond,
      get: ping
    }
  });

// creation of the server 
server = http.createServer(function (req, res) 
{
  //array of the infomation sent ? not sure.
  req.chunks = [];
  // parsing of the information.
  req.on('data', function (chunk) { req.chunks.push(chunk.toString()); });
  //not sure what this is exactly catch errors possibly?
  router.dispatch(req, res, function(err) 
  {
    //writing the error message out ??
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    //ending the write?
    res.end(err.message);
  });
});

//making sure the server actually started.
if(server !== null)
  console.log("We starting up that server!");

//setting the port for listening
port = Number(80);
//start listening on that port.
server.listen(port);

//log the address information of server.
console.log(server.address());

//this is for get of http should only be on website access.
function ping() {
  this.res.writeHead(200);
  this.res.end("Hey, I'm Cool Guy.");
}