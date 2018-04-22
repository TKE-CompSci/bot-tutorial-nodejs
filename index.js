var http, director, cool, bot, router, server, port;

http        = require('http');
director    = require('director');
cool        = require('cool-ascii-faces');
bot         = require('./bot.js');

console.log("BOi we starting up!");

router = new director.http.Router({
  '/' : {
    post: bot.respond,
    get: ping
  }
});


server = http.createServer(function (req, res) 
{
  req.chunks = [];
  req.on('data', function (chunk) { req.chunks.push(chunk.toString()); });

  router.dispatch(req, res, function(err) 
  {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});
if(server !== null)
  console.log("We starting up that server!");

port = Number(process.env.PORT || 80);
server.listen(port);

console.log(server.address());

function ping() {
  this.res.writeHead(200);
  this.res.end("Hey, I'm Cool Guy.");
}