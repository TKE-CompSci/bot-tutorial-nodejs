var HTTPS = require('https');
var cool = require('cool-ascii-faces');
let fs = require('fs');

//ID of the bot from discord
var botID = "8691b3fc456f2eb6539908d798";

//function to aquire the the response of the bot to any post.
function respond() 
{
  //A post from the groupme, that is parsed from json to an obj
  var request = JSON.parse(this.req.chunks[0]),

  //the array of regex commands to be checked for.
  botRegex = new Array(/^\/cool guy$/, /^\/talk$/);
  
  //check for a message then check to see if it matches the first regex
  if(request.text && botRegex[0].test(request.text)) 
  {
    //writes a http status code of 200, which means the request has succeeded. 
    this.res.writeHead(200);
    //calls the function to get the message
    postMessage(0, request);
    //finishes sending the request
    this.res.end();
  }
  //check for a message then check to se if it matches the second regex
  else if(request.text && botRegex[1].test(request.text))
  {
    //writes a http status code of 200, which means the request has succeeded.
    this.res.writeHead(200);
    //calls the function to get the message
    postMessage(1, request);
    //finishes sending the request 
    this.res.end();
  }
}

//sets the appropriate message for the response given.
function postMessage(x, request) 
{
  // variables for holding information.
  var botResponse, options, body, botReq;
  //if it was the first regex get that cool face.
  if(x === 0)
    botResponse = cool();
  //then must be the second regex response.
  else 
  {
    //set the response to mentioning who made command and the following message.
    botResponse = "@" + request.name + " Talk dirty to Me! ";
    // the structure for mentioning people.
    var attachments = {
      loci: [ [botResponse.indexOf("@" + request.name), request.name.length + 1] ],
      type: "mentions",
      user_ids: [request.user_id]
      };
  }

  //information of where to send it to and type.
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };
  
  // if it was the second type then add the mentioning.
  if(x === 1)
  {
    
    body = {
      "attachments" : [attachments],
      "bot_id" : botID,
      "text" : botResponse
    };
  }

  // else set up without mentioning.
  else
  {
    body = {
      "bot_id" : botID,
      "text" : botResponse
    }
  }

  //DEBUG what message was sent.
  console.log('sending ' + botResponse + ' to ' + botID);
  
  //sent the request at the location set in options.
  botReq = 
    HTTPS.request(options, function(res) 
    {
      //check to see if the request was accepted.
      if(res.statusCode == 202) {/* went through*/ } 
      else 
      {
        //was rejected with the following code.
        console.log('rejecting bad status code ' + res.statusCode);
      }
    });
  
  //error handling for the request.
  botReq.on('error', function(err) 
  {
    console.log('error posting message '  + JSON.stringify(err));
  });
  // error handling for timeout on request.
  botReq.on('timeout', function(err) 
  {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  //close connection with message.
  botReq.end(JSON.stringify(body));
}

//No Idea what this is for.
exports.respond = respond;
