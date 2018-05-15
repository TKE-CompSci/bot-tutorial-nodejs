let HTTPS = require("https");
let cool = require("cool-ascii-faces");
let fs = require("fs");
let schedule = require("node-schedule");

// ID of the bot from discord
let botID = "8691b3fc456f2eb6539908d798";

let botRegex = new Array(/^\/cool guy$/i, /^\/talk$/i, /@BOT/i, /^\/load$/i, /^\/return$/i, /^\/help$/i);
let botCmds = new Array("/cool guy", "/talk", "@bot", "/load", "/return", "/help");
let botDescriptions = new Array(
    "Diplays a Face!",
    "talks to caller",
    "tag cmds",
    "load cmds from google sheet",
    "return the list of cmds from google sheet",
    "help info"
);
let fileInfo;

// sheet id and function
let spreadsheetID = "1Gwqf8PPwe2EmO91dk9be6ofoiRprOOf3KBF-bGjMixQ";

let GoogleSpreadsheet = require("google-spreadsheet");
let creds = require("./client_secret.json");
let sheetInfo;
let sheet = "";
let loggedIn = false;
let loadedSheet = false;

// Create a document object using the ID of the spreadsheet - obtained from its URL.
let doc = new GoogleSpreadsheet(spreadsheetID);

doc.useServiceAccountAuth(creds, function(err) {
    if(err) {
        console.log("error in auth: " + err);
    }
    else {
        console.log("logged In");
        loggedIn = true;
        doc.getInfo(function(err, sheetInfo) {
            if(err) {
                console.log("getinfo failed!: " + err);
                sheetInfo = null;
            }
        });
    }
});

/**
 * Function to return the time in a predeturmined format.
 * @returns {string} - date formated in a string.
 */
function getDateTime() {

    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return hour + ":" + min + ":" + sec + " on " + month + "/" + day + "/" + year;
}

/**
 * Fuction to print the time to the groupme.
 */
function printTime() {
    let botResponse, options, body, botReq, attachments;


    console.log("Sending The Time!");
    botResponse = "As requested, here is the time: " + getDateTime();
    body =
    {
        "attachments": [],
        "bot_id": botID,
        "text": botResponse,
    };

    // information of where to send it to and type.
    options =
    {
        hostname: "api.groupme.com",
        path: "/v3/bots/post",
        method: "POST",
    };

    // sent the request at the location set in options.
    botReq =
    HTTPS.request(options, function(res) {
        // check to see if the request was accepted.
        if(res.statusCode === 202) { /* went through*/ }
        else {
        // was rejected with the following code.
            console.log("rejecting bad status code " + res.statusCode);
        }
    });

    // error handling for the request.
    botReq.on("error", function(err) {
        console.log("error posting message " + JSON.stringify(err));
    });
    // error handling for timeout on request.
    botReq.on("timeout", function(err) {
        console.log("timeout posting message " + JSON.stringify(err));
    });
    // close connection with message.
    botReq.end(JSON.stringify(body));
}

/**
 * A test printing function to test scheduling.
 */
function printTest() {
    let botResponse, options, body, botReq, attachments;

    console.log("should be sending a message!");
    botResponse = "Andy for Pres!";
    body =
    {
        "attachments": [],
        "bot_id": botID,
        "text": botResponse,
    };

    // information of where to send it to and type.
    options =
    {
        hostname: "api.groupme.com",
        path: "/v3/bots/post",
        method: "POST",
    };

    // sent the request at the location set in options.
    botReq =
    HTTPS.request(options, function(res) {
        // check to see if the request was accepted.
        if(res.statusCode === 202) { /* went through*/ }
        else {
        // was rejected with the following code.
            console.log("rejecting bad status code " + res.statusCode);
        }
    });

    // error handling for the request.
    botReq.on("error", function(err) {
        console.log("error posting message " + JSON.stringify(err));
    });
    // error handling for timeout on request.
    botReq.on("timeout", function(err) {
        console.log("timeout posting message " + JSON.stringify(err));
    });
    // close connection with message.
    botReq.end(JSON.stringify(body));
}

/**
 * Function to handle internal Matching.
 * @param {number} x - the index of the regex match;
 * @param {request} request - the data on who sent the message being responded to.
 * @returns {body} - returns the body object used in the message.
 */
function internalMatch(x, request) {
    // variables for holding information.
    let botResponse, attachments;

    switch(x) {
        case -2: {
            botResponse = "Sheet hasn't been loaded";
            attachments = null;
            break;
        }
        case -1: {
            botResponse = "Sheet could not be loaded";
            attachments = null;
            break;
        }
        case 0: {
            botResponse = "<some cool face>";
            attachments = null;
            break;
        }
        case 1: {
            botResponse = "@" + request.name + " Talk dirty to Me! ";
            // the structure for mentioning people.
            attachments =
            {
                loci: [[botResponse.indexOf("@" + request.name), request.name.length + 1]],
                type: "mentions",
                user_ids: [request.user_id],
            };
            break;
        }
        case 2: {
            let botTagRegex = new Array(/^@bot who am i/i, /^@bot who are you/i, /^@bot time/i);
            if(botTagRegex[0].test(request.text)) {
                botResponse = "@" + request.name + ", you are a human";
                attachments = {
                    loci: [[botResponse.indexOf("@" + request.name), request.name.length + 1]],
                    type: "mentions",
                    user_ids: [request.user_id],
                };
            }
            else if(botTagRegex[1].test(request.text)) {
                botResponse = "@" + request.name + ", I am not a bot!";
                attachments = {
                    loci: [[botResponse.indexOf("@" + request.name), request.name.length + 1]],
                    type: "mentions",
                    user_ids: [request.user_id],
                };
            }
            else if(botTagRegex[2].test(request.text)) {
                botResponse = "@" + request.name + " the time is : " + getDateTime();
                attachments = {
                    loci: [[botResponse.indexOf("@" + request.name), request.name.length + 1]],
                    type: "mentions",
                    user_ids: [request.user_id],
                };
            }
            else {
                botResponse = "@" + request.name + " what do you need?";
                attachments = {
                    loci: [[botResponse.indexOf("@" + request.name), request.name.length + 1]],
                    type: "mentions",
                    user_ids: [request.user_id],
                };
            }
            break;
        }
        case 3: {
            if(!loadedSheet) {
                botResponse = "I am trying to load the google sheet.";
                attachments = null;
            }
            else {
                botResponse = "Sheet loaded!";
                attachments = null;
            }
            break;
        }
        case 4: {
            console.log(JSON.stringify(fileInfo));
            botResponse = "File Commands:\ncmd: description";
            for(let i = 0; i < fileInfo.length; i++) {
                botResponse += `\n${fileInfo[i].cmd}: ${fileInfo[i].description}`;
            }
            attachments = null;
            break;
        }
        case 5: {
            botResponse = "Help Menu:\ncmd: description";
            for(let i = 0; i < botRegex.length; i++) {
                botResponse += `\n${botCmds[i]}: ${botDescriptions[i]}`;
            }
            attachments = null;
            break;
        }
        default: {
            if(x < 0) {
                botResponse = "Unhandled Error!";
                attachments = null;
                break;
            }
            else {
                botResponse = `${botCmds[x] !== null ? botCmds[x] : botRegex[x]} is not handled yet!`;
                attachments = null;
            }
        }
    }
    return {
        "attachments": attachments !== null ? [attachments] : [],
        "bot_id": botID,
        "text": botResponse,
    };
}

/**
 * Function to handle external Matching.
 * @param {number} x - the index of the regex match;
 * @param {request} request - the data on who sent the message being responded to.
 * @returns {body} - returns the body object used in the message.
 */
function externalMatch(x, request) {
    let message, attachments;
    if(fileInfo[x] !== null) {
        message = fileInfo[x].output;
        attachments = null;
    }
    else {
        message = `Errorzz somehow managed to get external without existance of the cmd for index ${x}`;
        attachments = null;
    }
    return {
        "attachments": attachments !== null ? [attachments] : [],
        "bot_id": botID,
        "text": message,
    };
}

/**
 * Handles processing of the message and the setup of the content of the message.
 * @param {number} x - index of regex that matched.
 * @param {boolean} isInternal - bool to toggle Internal vs External.
 * @param {request} request - information on user who sent message that regex matched.
 */
function postMessage(x, isInternal, request) {
    // variables for holding information.
    let options, body, botReq;

    body = isInternal ? internalMatch(x, request) : externalMatch(x, request);

    // information of where to send it to and type.
    options =
    {
        hostname: "api.groupme.com",
        path: "/v3/bots/post",
        method: "POST",
    };

    // DEBUG what message was sent.
    console.log(`Sending ${body.text}`);

    // Debug what is being sent back
    console.log(JSON.stringify(body));

    // sent the request at the location set in options.
    botReq =
    HTTPS.request(options, function(res) {
        // check to see if the request was accepted.
        if(res.statusCode === 202) { /* went through*/ }
        else {
        // was rejected with the following code.
            console.log("rejecting bad status code " + res.statusCode);
            console.log("rejected message: " + JSON.stringify(body));
        }
    });

    // error handling for the request.
    botReq.on("error", function(err) {
        console.log("error posting message " + JSON.stringify(err));
    });
    // error handling for timeout on request.
    botReq.on("timeout", function(err) {
        console.log("timeout posting message " + JSON.stringify(err));
    });
    // close connection with message.
    botReq.end(JSON.stringify(body));
}

/**
 * gets info from a sheet.
 * @param {*} data - data from Spreadsheet.
 * @param {*} request - data from the https request.
 */
function getSheet(data, request) {
    let temp;
    const columns = 4;
    loadedSheet = false;
    fileInfo = new Array();

    postMessage(3, true, request);
    // Get all of the rows from the spreadsheet.
    doc.getCells(1, { "max-col": columns }, function(err, cells) {
        if(err) {
            console.log("failed to get cells");
            postMessage(-1, true, request);
            return;
        }

        for(let i = 0; i < cells.length; i++) {
            console.log(JSON.stringify(cells[i]));
        }

        if(cells.length % 4 !== 0) {
            console.log("ERROR invalid number of cells in document!");
            postMessage(-1, true, request);
            return;
        }

        for(let i = 4; i < cells.length; i = i + columns) {
            temp = {
                regex: new RegExp(cells[i].value),
                cmd: cells[i + 1].value,
                output: cells[i + 2].value,
                description: cells[i + 3].value,
            };
            fileInfo.push(temp);
        }

        console.log(JSON.stringify(fileInfo));

        loadedSheet = true;
        postMessage(3, true, request);
    });

}

/**
 * Special checks before sending sending the message.
 * @param {*} x - the index of the regex choice that matched.
 * @param {*} request - the data from the user who requested.
 */
function PreMessage(x, request) {
    switch(x) {
        case 3: {
            console.log("The user has asked bot to gather the data from the sheet.");
            if(loggedIn) {
                getSheet(sheet, request);
            }
            else {
                console.log("failed to load sheet");
                postMessage(-1, true, request);
            }
            break;
        }
        case 4: {
            console.log("The user has asked for the data gathered from the sheet.");
            if(loadedSheet) {
                postMessage(x, true, request);
                loadedSheet = false;
            }
            else {
                console.log("sheet hasn't been loaded.");
                postMessage(-2, true, request);
            }
            break;
        }
        default: {
            postMessage(x, true, request);
        }
    }
}

/**
 * Function called to send a message depending on what was said in chat.
 */
function respond() {
    // A post from the groupme, that is parsed from json to an obj
    let request = JSON.parse(this.req.chunks[0]);

    if(request.name === "NOT_A_BOT") {
        return;
    }

    // the array of regex commands to be checked for.
    for(let i = 0; i < botRegex.length; i++) {
        if(request.text && botRegex[i].test(request.text)) {
            console.log(`Received Message: ${JSON.stringify(request)}`);
            this.res.writeHead(200);
            PreMessage(i, request);
            this.res.end();
            return;
        }
    }

    for(let i = 0; i < fileInfo.length; i++) {
        if(request.text) {
            if(fileInfo[i].regex.test(request.text)) {
                console.log(`Received Message: ${JSON.stringify(request)}`);
                this.res.writeHead(200);
                postMessage(i, false, request);
                this.res.end();
            }
        }
        else {
            return;
        }
    }
}

/*
let rule = new schedule.RecurrenceRule();
rule.minute = 00;
let rule2 = new schedule.RecurrenceRule();
rule2.minute = 30;
// let schedules = [schedule.scheduleJob(rule, function(){printTime();}), schedule.scheduleJob(rule2, function(){printTest();})]
*/


// No Idea what this is for.
exports.respond = respond;
