let spreadsheet_id = "1Gwqf8PPwe2EmO91dk9be6ofoiRprOOf3KBF-bGjMixQ";



var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet(spreadsheet_id);

var getSheet = function()
{
  let message;
  doc.useServiceAccountAuth(creds, function (err) {
    // Get all of the rows from the spreadsheet.
    doc.getCells(1, function (err, cells) {
      for(let i = 0; i < cells.length; i++)
      {
        message = message + " " + cells[i].value;
      }
    });
  })
  console.log(message);
  return message;
}

module.exports = getSheet;