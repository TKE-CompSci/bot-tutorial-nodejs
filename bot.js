let HTTPS = require('https');
let cool = require('cool-ascii-faces');
let fs = require('fs');
let schedule = require('node-schedule');

//ID of the bot from discord
let botID = "8691b3fc456f2eb6539908d798";

//sheet id and function
let spreadsheet_id = "1Gwqf8PPwe2EmO91dk9be6ofoiRprOOf3KBF-bGjMixQ";



let GoogleSpreadsheet = require('google-spreadsheet');
let creds = require('./client_secret.json');
let loggedIn = false;
let sheetInfo;
let loadedSheet = false;

// Create a document object using the ID of the spreadsheet - obtained from its URL.
let doc = new GoogleSpreadsheet(spreadsheet_id);
doc.useServiceAccountAuth(creds, function(err) {
  if(err) {
    console.log("error in auth: " + err);
  }
  else 
  {
    loggedIn = true;
    doc.getInfo(function (err, sheetInfo) {
      if(err) {
        console.log("getinfo failed!: " + err);
        sheetInfo = null;
      }
   });
  }
});

let sheet = "";

function getSheet(data)
{
  // Get all of the rows from the spreadsheet.
  doc.getCells(1, function (err, cells) {
    for(let i = 0; i < cells.length; i++)
    {
      //console.log(cells[i].value);
      data[i] += cells[i].value + " ";
      // console.log(data);
    }
    loadedSheet = true;
  });

}

//function to aquire the the response of the bot to any post.
function respond() 
{
  //A post from the groupme, that is parsed from json to an obj
  let request = JSON.parse(this.req.chunks[0]),

  //the array of regex commands to be checked for.
  botRegex = new Array(/^\/cool guy$/, /^\/talk$/, /^@BOT/i, /^\/load$/, /^\/return$/i);
  
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
  //attempting to check for being tagged.
  else if(request.text && botRegex[2].test(request.text))
  {
    this.res.writeHead(200);
    postMessage(2, request);
    this.res.end();
  }
  //loading google sheet into a local variable.
  else if(request.text && botRegex[3].test(request.text))
  {
    console.log("The user has asked bot to gather the data from the sheet.");
    this.res.writeHead(200);
    if(loggedIn) {
      getSheet(sheet);
      postMessage(3, request);
    }
    else
    {
      console.log("failed to load sheet");
      postMessage(-2, request);
    } 
    this.res.end();
  }
  //returning loaded data from google sheet.
  else if(request.text && botRegex[4].test(request.text))
  {
    console.log("The user has asked for the data gathered from the sheet.");
    this.res.writeHead(200);
    if(loadedSheet) {
      postMessage(4, request);
      loadedSheet = false;
    }
    else
    {
      console.log("sheet hasnt been loaded.");
      postMessage(-1, request);
    } 
    this.res.end();
  }
}


//sets the appropriate message for the response given.
function postMessage(x, request) 
{
  // variables for holding information.
  let botResponse, options, body, botReq;
  let attachments;

  if(x === -1) {
    botResponse = "Sheet could not be loaded";
    attachments = null;
  }
  else if(x === -2) {
    botResponse = "Sheet hasn't been loaded";
    attachments = null;
  }


  //if it was the first regex get that cool face.
  else if(x === 0)
  {
    botResponse = "<some cool face>";
    attachments = null;
  }
  //then must be the second regex response.
  else if(x === 1)
  {
    //set the response to mentioning who made command and the following message.
    botResponse = "@" + request.name + " Talk dirty to Me! ";
    // the structure for mentioning people.
    attachments = 
    {
      loci: [ [botResponse.indexOf("@" + request.name), request.name.length + 1] ],
      type: "mentions",
      user_ids: [request.user_id]
    };
  }
  else if(x === 2)
  {
    let botTagRegex  = new Array(/^\@bot who am i/i, /^\@bot who are you/i, /^\@bot time/i);
    if(botTagRegex[0].test(request.text))
    {
      botResponse = "@" + request.name + ", you are a human";
      attachments = 
      {
        loci: [ [botResponse.indexOf("@" + request.name), request.name.length + 1] ],
        type: "mentions",
        user_ids: [request.user_id]
      };
    }
    else if(botTagRegex[1].test(request.text))
    {
      botResponse = "@" + request.name + ", I am not a bot!";
      attachments = 
      {
        loci: [ [botResponse.indexOf("@" + request.name), request.name.length + 1] ],
        type: "mentions",
        user_ids: [request.user_id]
      };
    }
    else if(botTagRegex[2].test(request.text))
    {
      botResponse = "@" + request.name + " the time is : " + getDateTime();
      attachments = 
      {
        loci: [ [botResponse.indexOf("@" + request.name), request.name.length + 1] ],
        type: "mentions",
        user_ids: [request.user_id]
      };
    }
    else
    {
      botResponse = "@" + request.name + " what do you need?";
      attachments =
      {
        loci: [ [botResponse.indexOf("@"+request.name, request.name.length + 1)] ],
        type: "mentions",
        user_ids: [request.user_id]
      }
    }
  }
  else if(x == 3)
  {
    botResponse = "I am trying to load the google sheet.";
    attachments = null;
  }
  else if(x == 4)
  {
    console.log("Here we need to show info.");
    botResponse = "The sheet info should show here";
    attachments = null;
  }


  //information of where to send it to and type.
  options = 
  {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };
  
  //set up the body of the message.
  body = 
  {
    "attachments" : attachments !== null ? [attachments] : [],
    "bot_id" : botID,
    "text" : botResponse
  };

  //Debug what is being sent back
  console.log(body);

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
        console.log('rejected message: '+JSON.stringify(body));
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


function printTime()
{
  let botResponse, options, body, botReq, attachments;  
  
  
  console.log("should be sending The Time!");
  botResponse = "As requested, here is the time: " + getDateTime();
  body = 
  {
    "attachments" : [],
    "bot_id" : botID,
    "text" : botResponse
  };

  //information of where to send it to and type.
  options = 
  {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

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

function printTest()
{
  let botResponse, options, body, botReq, attachments;  

  console.log("should be sending a message!");
  botResponse = "Andy for Pres!";
  body = 
  {
    "attachments" : [],
    "bot_id" : botID,
    "text" : botResponse
  };

  //information of where to send it to and type.
  options = 
  {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

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



//time function.
function getDateTime() 
{

  let date = new Date();

  let hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  let min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  let sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  let year = date.getFullYear();

  let month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  let day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return hour +  ":" + min + ":" + sec + " on " + month + "/" + day + "/" + year;

}


let rule = new schedule.RecurrenceRule();
rule.minute = 00;
let rule2 = new schedule.RecurrenceRule();
rule2.minute = 30;
//let schedules = [schedule.scheduleJob(rule, function(){printTime();}), schedule.scheduleJob(rule2, function(){printTest();})]



//No Idea what this is for.
exports.respond = respond;
