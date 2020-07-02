function doGet() {
  
  return HtmlService.createHtmlOutputFromFile("home");
  
}

// Mail functions

function getRelevantMessages(filter)
{
  Logger.log("Getting Schedule Emails to be processed");
  var threads = GmailApp.search(filter);
  var messages=[];
  threads.forEach(function(thread)
                  {
                    var count = thread.getMessageCount();
                    if(count > 1) {
                      // More than one message in the thread, get the last message in the thread
                      messages.push(thread.getMessages()[count - 1]);
                    } else {
                      // Only one message, so get the first and only message
                      messages.push(thread.getMessages()[0]);
                    }
                  });
  Logger.log("Found " + messages.length + " messages");
  return messages;
}

function labelMessageAsDone(message){
  // Add a label to the message thread so that it is not processed again.
  
  var label = 'ProcessedSchedule';
  var label_obj = GmailApp.getUserLabelByName(label);
  if(!label_obj){
    label_obj = GmailApp.createLabel(label);
  }
  label_obj.addToThread(message.getThread() );  
    
}

function NightlyProcessing() {
  // Main function for processing nightly.
  var status = 0;
  Logger.log("Starting Processing of Schedule Emails");
  const messages = getRelevantMessages(nightlyFilter);
  // A check to see if message is empty could be used to exist this function earlier.
  Logger.log("Retrieved relevant messages");
  status = processMessages(messages);
  // status is currently unused. Could be used to send email notification in the future.
  Logger.log("Processing Completed.");
}

function processMessages(messages) {

  let ss;
  if (writeSpreadSheet) {
    ss = openSpreadSheet();
    if(ss == -1) {
      Logger.log("Unable to open Spreadsheet\nExiting Script\n");
      return ss;
    }
  }

  const cal = openCalendar();
  if(cal == -1) {
    Logger.log("Unable to open Calendar\nExiting Script\n");
    return cal;
  }

  // process oldest message to newest
  var message = messages.length;
  while(message > 0) {
    --message;
    var subject = messages[message].getSubject();
    var body = messages[message].getPlainBody()
    if (!lessonsScheduledToday(body)) {
      Logger.log("Email: " + subject);
      labelMessageAsDone(messages[message]);
      continue; // Everything is ok. But no messages to process
    } else {
      // Create schedule object
      var schedule = newSchedule(subject);
      // Look for Travels, Methods and Blocked units. Add to Object: schedule
      var trvMethBlk = matchTravelBlock(body);
      addUnitsToSchedule(schedule, trvMethBlk)
      // Look for Lessons. Add to Object: schedule
      var lessons = matchLessons(body)
      addUnitsToSchedule(schedule, lessons);
      // Tally the units and add attributes to Object: schedule
      tallyAndAssignUnits(schedule);

      findFirstUnit(schedule);

      // Write data to spreadsheet.
      if(writeSpreadSheet) {
        Logger.log("Saving data for " + schedule.month + " " + schedule.date + ", " + schedule.year);
        saveDataToSheet(ss, schedule);
        Logger.log("Completed: " + schedule.month + " " + schedule.date + ", " + schedule.year);
      }

      // Add units to Calendar.
      addUnitsToCalendar(cal, schedule);

      // Add "Processed" label to message thread
      labelMessageAsDone(messages[message]);
    }
  }
  // Everything went as planned.
  return 2;
}



// Get email date information and initialize object
function newSchedule(subject) {

  Logger.log("Creating Schedule Object and matching Date information");
  const match = subject.match(date_regex);

  if (match.length < 4) {
    Logger.log("Unable to match Date information for Schedule");
    Logger.log("Subject: " + subject);
    return undefined;
  } else {
    var schedule = createScheduleObject();
    schedule.day = match.groups.day;
    schedule.month = match.groups.month;
    schedule.date = match.groups.date;
    schedule.year = match.groups.year;
  }
  Logger.log("Completed Schedule");
  return schedule;
}

function createScheduleObject() {
  // Initialize new schedule object. Setting default values.

  Logger.log("Creating Schedule Object");
  var schedule = {};
  schedule.units = [];
  schedule.lessons = 0;
  schedule.travels = 0;
  schedule.bonuses = 0;
  schedule.restDay = 0;
  schedule.pv = 0;
  schedule.isRestDay = function() {
    if(this.day === restDay) {
      return true;
    } else {
      return false;
    }
  } // end isRestDay
  return schedule;
}

// Check if I have work on this day or not.
function lessonsScheduledToday(text) {

  const regex = /There is no work scheduled/i;

  Logger.log("Checking if there are lessons in email");
  match = text.match(regex);
  if(!match) {
    Logger.log("Units found. Will process email");
    return 1; // Did not match text. There must be units to process
  } else {
    Logger.log("No work scheduled in this email.");
    return 0; // Matched text. There are not lessons today.
  }
}


// Get all units for Travels, Methods and blocked times.
function matchTravelBlock(text) {

  Logger.log("Matching Travels, Methods and Blocked Units");
  let units = new Array();
  const matches = text.matchAll(trvl_blk_regex);

  for(const match of matches) {
    var unit = createDefaultUnit();
    unit.startTime = match.groups.startTime;
    unit.endTime = match.groups.endTime;
    unit.count = parseInt(match.groups.count);
    unit.location = match.groups.location || '';
    unit.class = match.groups.class || '';
    unit.type = match.groups.type;
    unit.comment = match.groups.comment || '';
    units.push(unit);
  }
  Logger.log("Matched " + units.length + " unique entries");
  return units;
}

// Get lessons from email text
function matchLessons(text) {

  Logger.log("Starting matchLessons");
  let units = new Array();
  const matches = text.matchAll(lessons_pv_regex);
  for(const match of matches) {
    Logger.log("Found matches\n");
    unit = createDefaultUnit();
    unit.startTime = match.groups.startTime;
    unit.endTime = match.groups.endTime;
    unit.count = parseInt(match.groups.count);
    unit.location = match.groups.location || '';
    unit.class = match.groups.class || '';
    unit.type = match.groups.type || '';
    unit.material = match.groups.material || '';
    if(match.groups.comment) {
      unit.comment = match.groups.comment.trim();
    } else {
      unit.comment = '';
    }
    if(match.groups.zoom) {
      unit.zoom = true;
    }
    units.push(unit);
  }
  Logger.log("Completed matchLessons");
  return units;
}
// Spreadsheet Functions from here

// Single Schedule Entry
function saveDataToSheet(ss, schedule) {

  var sheetName = getCorrectSheet(schedule.year,
                                  schedule.month,
                                  schedule.date);
  
  var sheet = ss.getSheetByName(sheetName);
  
  // Set up the column correctly for the pay period
  var startColumn = getColumnIndex(months, schedule.month, schedule.date);
  var lessonColumn = startColumn;
  var bonusColumn = startColumn + 1;
  var travelColumn = bonusColumn + 1;
  var restDayColumn = travelColumn + 1;
  var pvColumn = restDayColumn + 1;
  
  // Update the cells with the values head in the schedule object.
  sheet.getRange(getRow(schedule.date), lessonColumn).setValue(schedule.lessons);
  sheet.getRange(getRow(schedule.date), bonusColumn).setValue(schedule.bonuses);
  sheet.getRange(getRow(schedule.date), travelColumn).setValue(schedule.travels);
  sheet.getRange(getRow(schedule.date), restDayColumn).setValue(schedule.restDay);
  sheet.getRange(getRow(schedule.date), pvColumn).setValue(schedule.pv);
  SpreadsheetApp.flush();
}

function openSpreadSheet() {
  Logger.log("Opening Spreadsheet");
  var spreadsheet = SpreadsheetApp.openById(spreadSheetID);
  if(!spreadsheet) {
    Logger.log("Failed to open spreadsheet");
    return -1;
  } else {
    Logger.log("Opened spreadsheet " + spreadsheet.getName());
  }
  return spreadsheet;
}

// Determine which row this date data will be inserted into.
function getRow(dateStr) {
  
  var date;
  // Convert string to int
  if (typeof(dateStr) === "string"){
    date = parseInt(dateStr);
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
function isStandardLesson(lesson_type) {
    // Check if the lesson is a standard lesson. check is the lesson_type is contained in the
    //constant array defined in constants.js
    // return a booleen
    return basic_lessons.includes(lesson_type);
}

function createDefaultUnit() {
  // Create an default Unit with default values

  var unit = {};
  unit.zoom = false;
  unit.first = false;
  unit.isFirst = function() {
    return this.first;
  }
  return unit;
}

// Add units found in email to the schedule Object
function addUnitsToSchedule(schedule, units) {
  Logger.log("Added units to schedule Object");
  Array.prototype.push.apply(schedule.units,units);
}

// Tally units so they can be inserted into the spreedsheet
function tallyAndAssignUnits(schedule) {
  
  Logger.log("Starting the tally process");
  for (var i = 0; i < schedule.units.length; i++) {
    // These are normal classes
    if(isStandardLesson(schedule.units[i].type) ||
       (schedule.units[i].type.startsWith("Group")) ||
       (schedule.units[i].type.startsWith("Placement"))) { 
         //Placements are never paid as bonus unless its a mistake
         if (schedule.day === restDay) {
           Logger.log("Updating RestDay Count");
           schedule.restDay += schedule.units[i].count;
       } else {
           Logger.log("Updating Lessons count");
           schedule.lessons += schedule.units[i].count;
       }
      // The next set are Travel units
    } else if ((schedule.units[i].type === "Travel") ||
               // Sometimes Travel units happen in blocked units. This is bad :(
               ((schedule.units[i].type === "Blocked") && 
                (schedule.units[i].comment.toLowerCase() === "travel"))) {
      Logger.log("Updating Travel Count");
      schedule.travels += schedule.units[i].count;
      // Bonus units
    } else if (schedule.units[i].type.endsWith("onus")) {
      Logger.log("Updating Bonus Count");
      schedule.bonuses += schedule.units[i].count;
    } else if (schedule.units[i].type === "Vacation") {
      // For now set this to a value of 1 I will need to
      // check how half days aredone
      schedule.pv += 1;
    }
  }
}

function findFirstUnit(schedule) {
  // The units in the schedule may not be in chronological order.
  // So we need to search through the list and find the first unit for the day.
  // Using Unix TimeStamps

  var i = 0;
  var indexOfFirst = 0; // Store the index of the current unit which is considered to be the
                        // first unit of the day.
  if(schedule.units.length == 0)
    return;
  
  Logger.log("Starting to look for First");
  while(i < schedule.units.length) {
    if((i == 0) && (schedule.units[i].type !== "Blocked")) {
      schedule.units[i].first = true;
      indexOfFirst = i;
      // Note the + before setDateObject this is not a typo. It's is a short cut do not change.
      schedule.units[i].timeStamp = +setDateObject(schedule.date, 
                                                    schedule.month, 
                                                    schedule.year, 
                                                    schedule.units[i].startTime);
    } else {
      schedule.units[i].timeStamp = +setDateObject(schedule.date, 
                                                   schedule.month, 
                                                   schedule.year, 
                                                   schedule.units[i].startTime);
      if(schedule.units[i].timeStamp < schedule.units[indexOfFirst].timeStamp){
        schedule.units[indexOfFirst].first = false;
        schedule.units[i].first = true;
        indexOfFirst = i;
      }
    }
  i++;
  }
}

// create a valid Date object using information stored in Object schedule
function setDateObject(date, month, year, time) {
  return new Date(month + ' ' + date + ', ' + year + ' ' + time);
}

function lookupLocation(location){
  // This function takes the short LC name and looks up the full name which is used in
  // Google Maps and hopefully Apple Maps Allowing for calendar apps to provide map directions
  if(!locations[location])
    location = "";
  else
    location = locations[location];
  return location;
}

// Create an options object to pass to createEvent
// this will add a description and location information
function createDetails(unit){

  details = {};
  details.description = unit.type;
  if((unit.material) && (showMaterial)) {
    var descMaterial = "\n" + unit.material + "\n";
    details.description += descMaterial;
  }
  
  // If there is a comment add this to description
  if((unit.comment) &&
     (unit.type !== "Travel")){
     var descComment = "\n" + unit.comment;
     details.description += descComment;
  }
  
  // Log this if this is a zoom unit {True/False}
  console.log("unit.zoom: " + unit.zoom)

  // Append Zoom information if zoom is true
  if(unit.zoom) {
    details.description += "\nThis is a Zoom lesson\n";
  }
  if(unit.location) {
    details.location = lookupLocation(unit.location);
  }
  return details;
}

// Add a single event to the calendar
function addUnitToCalendar(calendar, date, month, year, unit) {

  if((unit.type === "Vacation") ||
     ((unit.type === "Blocked") && (!unit.comment.includes("onus")))) {
    } else {
      var details = createDetails(unit);
      var event = calendar.createEvent(makeEventTitle(unit),
      setDateObject(date, month, year, unit.startTime),
      setDateObject(date, month, year, unit.endTime),
                    details);
      if(unit.isFirst() && (unit.location !== baseLC)) {
      event.addPopupReminder(120); // This needs to be coded to get a more suitable time.
      }
        Logger.log('Event ID: ' + event.getId());
    }
}

function makeEventTitle(unit) {

  var title = unit.type + " (" + unit.count + ")";
  return title;
}

function openCalendar() {

  // Gets the public calendar named "BerlitzWork" using its ID.
  const calendar = CalendarApp.getCalendarById(calendarID);

  if (calendar == null) {
    Logger.log("Unable to find BerlitzWork Calendar");
    return -1;
  } else {
    return calendar;
  }
}

// Loop through all units for the given schedule
// call addUnitToCalendar for each unit
function addUnitsToCalendar(calendar, schedule) {

  // Remove and previously created calendar Events to prevent duplication.
  deleteExistingEvents(calendar, schedule);

  var i = 0;
  while(i < schedule.units.length) {
    addUnitToCalendar(calendar, schedule.date, schedule.month,
                     schedule.year, schedule.units[i]);
    i++;
  }
}

// To avoid duplicate calendar entries when the schedule has been resent.
// Delete existing entries if they exist.
function deleteExistingEvents(calendar, schedule){

  var events = calendar.getEventsForDay(setDateObject(schedule.date, schedule.month, schedule.year,"00:00"));
  if (events.length > 0) {
    Logger.log("Deleting all events for " + schedule.date + " the " + schedule.month + ", " + schedule.year);
    for (var i in events) {
      events[i].deleteEvent();
    }
  }
}
