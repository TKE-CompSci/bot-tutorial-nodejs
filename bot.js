var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = "8691b3fc456f2eb6539908d798";

function respond() 
{
  console.log("BOI GOT THAT LOG!");
  var request = JSON.parse(this.req.chunks[0]),
  botRegex = new Array(/^\/cool guy$/, /^\/talk$/);
  
  console.log(request);
  
  if(request.text && botRegex[0].test(request.text)) {
    this.res.writeHead(200);
    postMessage(0, request);
    this.res.end();
  }
  else if(request.text && botRegex[1].test(request.text)) {
    postMessage(1, request);
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(x, request) {
  var botResponse, options, body, botReq;
  
  if(x === 0)
  botResponse = cool();
  else 
  botResponse = "@Josh Cash Talk dirty to Me! ";
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };
  
  var op = {
  loci: [1, request.name.length],
  type: "mentions",
  user_id: [request.user_id]
  };
  
  body = {
    "attachments" : [op],
    "bot_id" : botID,
    "text" : botResponse
  };
  consol.log("");
  consol.log("");
  console.log(body);
  console.log('sending ' + botResponse + ' to ' + botID);
  
  botReq = HTTPS.request(options, function(res) {
    if(res.statusCode == 202) {
      //neat
    } else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });
  
  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
