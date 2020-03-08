// Spreadsheet Functions from here

// Single Schedule Entry
function saveDataToSheet(ss, schedule) {

  var sheetName = getCorrectSheet(schedule.year,
                                  schedule.month,
                                  schedule.date);
  
  var sheet = ss.getSheetByName(sheetName);
  
  var startColumn = getColumnIndex(months, schedule.month, schedule.date);
  var lessonColumn = startColumn;
  var bonusColumn = startColumn + 1;
  var travelColumn = bonusColumn + 1;
  var restDayColumn = travelColumn + 1;
  var pvColumn = restDayColumn + 1;
    
  sheet.getRange(getRow(schedule.date), lessonColumn).setValue(schedule.lessons);
  sheet.getRange(getRow(schedule.date), bonusColumn).setValue(schedule.bonuses);
  sheet.getRange(getRow(schedule.date), travelColumn).setValue(schedule.travels);
  sheet.getRange(getRow(schedule.date), restDayColumn).setValue(schedule.restDay);
  sheet.getRange(getRow(schedule.date), pvColumn).setValue(schedule.pv);
  SpreadsheetApp.flush();
}

function saveDataToSheetBatch(ss, schedules) {
  
  var i = 0;
  while(i < schedules.length) {
    var schedule = schedules[i];
    saveDataToSheet(ss, schedule);
    i++;
  }
}

function updateSpreadsheet(ss, schedules) {
  
  Logger.log("Starting to update spreadsheet");
  if(schedules) {
    saveDataToSheetBatch(ss,schedules);
  } else {
    Logger.log("No schedules to work with. No work to be done");
    return;
  }
  if(ss) {
    Logger.log("Schedule open for writing");
  } else {
    Logger.log("Schedule it not open. Not updating data");
    return;
  }
}

function openSpreadSheet() {
  Logger.log("Opening Spreadsheet");
  var spreadsheet = SpreadsheetApp.openById(spreadSheetID);
  if(!spreadsheet) {
    Logger.log("Failed to open spreadsheet");
  } else {
    Logger.log("Opened spreadsheet " + spreadsheet.getName());
  }
  return spreadsheet;
}

// Determine which row this date data will be inserted into.
function getRow(dateStr) {
  
  // Convert string to int
  if (typeof(dateStr) === "string"){
  var date = parseInt(dateStr);
  } else {
    date = dateStr;
  }
  
  // return rows matching dates 18 to 31
  if ((date >= 18) && (date <= 31)) {
    return date - 15; // offset is (date - 15)
    // return rows matching dates 1 - 17
  } else if ((date >= 1) && (date <= 17)) {
    return date + 16; // offset is (date + 16)
    // Date is not valid
  } else {
    return undefined;
  }
}

// Determine which column to store lesson in for the current pay period
// Convert object to array so we can use array index +/-
function getColumnIndex(months, month, date) {
  
  var keys = Object.keys(months);
  var index = keys.indexOf(month);
  // Handle loop around on the index
  if((index == 0) && (adjustColumnIndex(date) == -1)) {
    index = 12;
  }
  var columnNum = months[keys[index + adjustColumnIndex(date)]]
  return columnNum;
}

// Simply get month/columm key/value pairs from Google Drive and 
// parse it back into a javascript object for us
// ** NO LONGER USED **//
function loadMonthsFromFile() {
  
  var files = DriveApp.getFilesByName("months.json");
  
  while (files.hasNext()) {
    var file = files.next();
    var jsonFile = file.getAs('application/json');
  }
  
  var dataStr = jsonFile.getDataAsString();
  var months = JSON.parse(dataStr);
  
  return months;
  
}

// This function will check if the column for the current month
// needs to be adjusted based on the date 
// This return value will be used with an array created from key
function adjustColumnIndex(date) {
  
  // dates above 18 require no change
  if (date >= 18) {
    return 0;
    // Dates below 18 should be added to the previous months column
  } else {
    return -1;
  }
} 

// Get the correct sheet name if the entry should be
// for the previous last pay period which started in the previous year.
function getCorrectSheet(year,month,date) {
  
  if ((month === "January") && (date <= 17)) {
    // This entry belongs on the previous years lesson count sheet.
    return year - 1;
  } else {
    return year;
  }
}

