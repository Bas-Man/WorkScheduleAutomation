
function doGet() {
  return HtmlService.createHtmlOutputFromFile('home');
}

// Updated schedule and calendar if there has been an updated schedule sent.
function updateSchedule() {
  doProcessing(updatedFilter);
}

// Run nightly processing after initial nightly schedule has been sent out.
function doNightly() {
  doProcessing(nightlyFilter);
}

// Mail functions


function getRelevantMessages(filter) {
  Logger.log('Getting Schedule Emails to be processed');
  const threads = GmailApp.search(filter);
  const messages = [];
  // eslint-disable-next-line func-names
  threads.forEach(function (thread) {
    const count = thread.getMessageCount();
    if (count > 1) {
      Logger.log(`Found ${count} messages. Using the last message`);
      // More than one message in the thread, get the last message in the thread
      messages.push(thread.getMessages()[count - 1]);
    } else {
      // Only one message, so get the first and only message
      messages.push(thread.getMessages()[0]);
    }
  });
  Logger.log(`Found ${messages.length} messages`);
  return messages;
}

function labelMessageAsDone(message) {
  // Add a label to the message thread so that it is not processed again.

  const label = 'ProcessedSchedule';
  let labelObj = GmailApp.getUserLabelByName(label);
  if (!labelObj) {
    labelObj = GmailApp.createLabel(label);
  }
  labelObj.addToThread(message.getThread());

  // Archive this message if configured
  if (archive) {
    Logger.log('Archiving message');
    const moveThread = message.getThread();
    moveThread.moveToArchive();
  }
}


function processMessages(messages) {
  let ss;
  if (writeSpreadSheet) {
    ss = openSpreadSheet();
    if (ss === -1) {
      Logger.log('Unable to open Spreadsheet\nExiting Script\n');
      return ss;
    }
  }

  const cal = openCalendar();
  if (cal === -1) {
    Logger.log('Unable to open Calendar\nExiting Script\n');
    return cal;
  }

  // process oldest message to newest
  let message = messages.length;
  while (message > 0) {
    // eslint-disable-next-line no-plusplus
    --message;
    const subject = messages[message].getSubject();
    const body = messages[message].getPlainBody();
    if (!lessonsScheduledToday(body)) {
      Logger.log(`Email: ${subject}`);
      labelMessageAsDone(messages[message]);
      // eslint-disable-next-line no-continue
      continue; // Everything is ok. But no messages to process
    } else {
      // Create schedule object
      const schedule = newSchedule(subject);
      // Look for Travels, Methods and Blocked units. Add to Object: schedule
      const trvMethBlk = matchTravelBlock(body);
      addUnitsToSchedule(schedule, trvMethBlk);
      // Look for Lessons. Add to Object: schedule
      const lessons = matchLessons(body);
      addUnitsToSchedule(schedule, lessons);
      // Tally the units and add attributes to Object: schedule
      tallyAndAssignUnits(schedule);

      findFirstUnit(schedule);

      // Write data to spreadsheet.
      if (writeSpreadSheet) {
        Logger.log(`Saving data for ${schedule.month} ${schedule.date}, ${schedule.year}`);
        saveDataToSheet(ss, schedule);
        Logger.log(`Completed: ${schedule.month} ${schedule.date}, ${schedule.year}`);
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

function NightlyProcessing() {
  // Main function for processing nightly.
  let status = 0;
  Logger.log('Starting Processing of Schedule Emails');
  const messages = getRelevantMessages(nightlyFilter);
  // A check to see if message is empty could be used to exist this function earlier.
  Logger.log('Retrieved relevant messages');
  // eslint-disable-next-line no-unused-vars
  status = processMessages(messages);
  // status is currently unused. Could be used to send email notification in the future.
  Logger.log('Processing Completed.');
}

function doProcessing(filter) {
  // Main function for processing nightly.
  let status = 0;
  Logger.log('Starting Processing of Schedule Emails');
  const messages = getRelevantMessages(filter);
  // A check to see if message is empty could be used to exist this function earlier.
  Logger.log('Retrieved relevant messages');
  // eslint-disable-next-line no-unused-vars
  status = processMessages(messages);
  // status is currently unused. Could be used to send email notification in the future.
  Logger.log('Processing Completed.');
}


function createScheduleObject() {
  // Initialize new schedule object. Setting default values.

  Logger.log('Creating Schedule Object');
  const schedule = {};
  schedule.units = [];
  schedule.lessons = 0;
  schedule.travels = 0;
  schedule.bonuses = 0;
  schedule.restDay = 0;
  schedule.pv = 0;
  // eslint-disable-next-line func-names
  schedule.isRestDay = function () {
    if (this.day === restDay) {
      return true;
    }
    return false;
  }; // end isRestDay
  return schedule;
}

// Get email date information and initialize object
function newSchedule(subject) {
  Logger.log('Creating Schedule Object and matching Date information');
  const match = subject.match(dateRegex);

  if (match.length < 4) {
    Logger.log('Unable to match Date information for Schedule');
    Logger.log(`Subject: ${subject}`);
    return undefined;
  }
  const schedule = createScheduleObject();
  // Add additional properties based on email contents
  schedule.day = match.groups.day;
  schedule.month = match.groups.month;
  schedule.date = match.groups.date;
  schedule.year = match.groups.year;

  Logger.log('Completed Schedule');
  return schedule;
}

// Check if I have work on this day or not.
function lessonsScheduledToday(text) {
  const regex = /There is no work scheduled/i;

  Logger.log('Checking if there are lessons in email');
  const match = text.match(regex);
  if (!match) {
    Logger.log('Units found. Will process email');
    return 1; // Did not match text. There must be units to process
  }
  Logger.log('No work scheduled in this email.');
  return 0; // Matched text. There are not lessons today.
}

// Get all units for Travels, Methods and blocked times.
function matchTravelBlock(text) {
  Logger.log('Matching Travels, Methods and Blocked Units');
  const units = [];
  const matches = text.matchAll(trvlBlkRegex);

  for (const match of matches) {
    const unit = createDefaultUnit();
    unit.startTime = match.groups.startTime;
    unit.endTime = match.groups.endTime;
    unit.count = parseInt(match.groups.count, 10);
    unit.location = match.groups.location || '';
    unit.class = match.groups.class || '';
    unit.type = match.groups.type;
    unit.comment = match.groups.comment || '';
    units.push(unit);
  }
  Logger.log(`Matched ${units.length} unique entries`);
  return units;
}

// Get lessons from email text
function matchLessons(text) {
  Logger.log('Starting matchLessons');
  const units = [];
  const matches = text.matchAll(lessonsPvRegex);
  for (const match of matches) {
    Logger.log('Found matches\n');
    const unit = createDefaultUnit();
    unit.startTime = match.groups.startTime;
    unit.endTime = match.groups.endTime;
    unit.count = parseInt(match.groups.count, 10);
    unit.location = match.groups.location || '';
    unit.class = match.groups.class || '';
    unit.type = match.groups.type || '';
    unit.material = match.groups.material || '';
    if (match.groups.comment) {
      unit.comment = match.groups.comment.trim();
    } else {
      unit.comment = '';
    }
    if (match.groups.zoom) {
      unit.zoom = true;
    }
    units.push(unit);
  }
  Logger.log('Completed matchLessons');
  return units;
}

// Spreadsheet Functions from here


// Determine which row this date data will be inserted into.
function getRow(dateStr) {
  let date;
  // Convert string to int
  if (typeof dateStr === 'string') {
    date = parseInt(dateStr, 10);
  } else {
    date = dateStr;
  }

  // return rows matching dates 18 to 31
  if (date >= 18 && date <= 31) {
    return date - 15; // offset is (date - 15)
    // return rows matching dates 1 - 17
  }
  if (date >= 1 && date <= 17) {
    return date + 16; // offset is (date + 16)
    // Date is not valid
  }
  return undefined;
}

function openSpreadSheet() {
  Logger.log('Opening Spreadsheet');
  const spreadsheet = SpreadsheetApp.openById(spreadSheetID);
  if (!spreadsheet) {
    Logger.log('Failed to open spreadsheet');
    return -1;
  }
  Logger.log(`Opened spreadsheet ${spreadsheet.getName()}`);

  return spreadsheet;
}

// This function will check if the column for the current month
// needs to be adjusted based on the date
// This return value will be used with an array created from key
function adjustColumnIndex(date) {
  // dates above 18 require no change
  if (date >= 18) {
    return 0;
    // Dates below 18 should be added to the previous months column
  }
  return -1;
}

// Determine which column to store lesson in for the current pay period
// Convert object to array so we can use array index +/-
function getColumnIndex(month, date) {
  const keys = Object.keys(months);
  let index = keys.indexOf(month);
  // Handle loop around on the index
  if (index === 0 && adjustColumnIndex(date) === -1) {
    index = 12;
  }
  const columnNum = months[keys[index + adjustColumnIndex(date)]];
  return columnNum;
}

// Get the correct sheet name if the entry should be
// for the previous last pay period which started in the previous year.
function getCorrectSheet(year, month, date) {
  if (month === 'January' && date <= 17) {
    // This entry belongs on the previous years lesson count sheet.
    return year - 1;
  }
  return year;
}
// Single Schedule Entry
function saveDataToSheet(ss, schedule) {
  const sheetName = getCorrectSheet(schedule.year, schedule.month, schedule.date);

  const sheet = ss.getSheetByName(sheetName);

  // Set up the column correctly for the pay period
  const startColumn = getColumnIndex(schedule.month, schedule.date);
  const lessonColumn = startColumn;
  const bonusColumn = startColumn + 1;
  const travelColumn = bonusColumn + 1;
  const restDayColumn = travelColumn + 1;
  const pvColumn = restDayColumn + 1;

  // Update the cells with the values head in the schedule object.
  sheet.getRange(getRow(schedule.date), lessonColumn).setValue(schedule.lessons);
  sheet.getRange(getRow(schedule.date), bonusColumn).setValue(schedule.bonuses);
  sheet.getRange(getRow(schedule.date), travelColumn).setValue(schedule.travels);
  sheet.getRange(getRow(schedule.date), restDayColumn).setValue(schedule.restDay);
  sheet.getRange(getRow(schedule.date), pvColumn).setValue(schedule.pv);
  SpreadsheetApp.flush();
}


function isStandardLesson(lessonType) {
  // Check if the lesson is a standard lesson. check is the lesson_type is contained in the
  // constant array defined in constants.js
  // return a boolean
  return basicLessons.includes(lessonType);
}

function isBonusTimeSlot(time) {
  if (contractType === 'PL') {
    return plBonusTimes.includes(time);
  }
  return false;
}

function createDefaultUnit() {
  // Create an default Unit with default values

  const unit = {};
  unit.zoom = false;
  unit.first = false;
  unit.isBonus = false;
  // eslint-disable-next-line func-names
  unit.isFirst = function () {
    return this.first;
  };
  return unit;
}

// Add units found in email to the schedule Object
function addUnitsToSchedule(schedule, units) {
  Logger.log('Added units to schedule Object');
  Array.prototype.push.apply(schedule.units, units);
}

// Tally units so they can be inserted into the spreadsheet
function tallyAndAssignUnits(schedule) {
  Logger.log('Starting the tally process');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < schedule.units.length; i++) {
    // These are normal classes
    if (
      isStandardLesson(schedule.units[i].type) ||
      schedule.units[i].type.startsWith('Group') ||
      schedule.units[i].type.startsWith('Placement')
    ) {
      // Placements are never paid as bonus unless its a mistake
      if (schedule.day === restDay) {
        Logger.log('Updating RestDay Count');
        // eslint-disable-next-line no-param-reassign
        schedule.restDay += schedule.units[i].count;
      } else if (contractType === 'PL' && isBonusTimeSlot(schedule.units[i].startTime)) {
        // This is bonus time for pl
        // eslint-disable-next-line no-param-reassign
        schedule.bonuses += schedule.units[i].count;
        // eslint-disable-next-line no-param-reassign
        schedule.units[i].isBonus = true;
      } else {
        Logger.log('Updating Lessons count');
        // eslint-disable-next-line no-param-reassign
        schedule.lessons += schedule.units[i].count;
      }
      // The next set are Travel units
    } else if (
      schedule.units[i].type === 'Travel' ||
      // Sometimes Travel units happen in blocked units. This is bad :(
      (schedule.units[i].type === 'Blocked' && schedule.units[i].comment.toLowerCase() === 'travel')
    ) {
      Logger.log('Updating Travel Count');
      // eslint-disable-next-line no-param-reassign
      schedule.travels += schedule.units[i].count;
      // Bonus units
    } else if (schedule.units[i].type.endsWith('onus')) {
      Logger.log('Updating Bonus Count');
      // eslint-disable-next-line no-param-reassign
      schedule.bonuses += schedule.units[i].count;
      // eslint-disable-next-line no-param-reassign
      schedule.units[i].isBonus = true;
    } else if (schedule.units[i].type === 'Vacation') {
      // For now set this to a value of 1 I will need to
      // check how half days are done
      // eslint-disable-next-line no-param-reassign
      schedule.pv += 1;
    }
  }
}

function findFirstUnit(schedule) {
  // The units in the schedule may not be in chronological order.
  // So we need to search through the list and find the first unit for the day.
  // Using Unix TimeStamps

  let i = 0;
  let indexOfFirst = 0; // Store the index of the current unit which is considered to be the
  // first unit of the day.
  if (schedule.units.length === 0) return;

  Logger.log('Starting to look for First');
  while (i < schedule.units.length) {
    if (i === 0 && schedule.units[i].type !== 'Blocked') {
      // eslint-disable-next-line no-param-reassign
      schedule.units[i].first = true;
      indexOfFirst = i;
      // Note the + before setDateObject this is not a typo. It's is a short cut do not change.
      // eslint-disable-next-line no-param-reassign, no-undef
      schedule.units[i].timeStamp = +setDateObject(
        schedule.date,
        schedule.month,
        schedule.year,
        schedule.units[i].startTime
      );
    } else {
      // eslint-disable-next-line no-param-reassign, no-undef
      schedule.units[i].timeStamp = +setDateObject(
        schedule.date,
        schedule.month,
        schedule.year,
        schedule.units[i].startTime
      );
      if (schedule.units[i].timeStamp < schedule.units[indexOfFirst].timeStamp) {
        // eslint-disable-next-line no-param-reassign
        schedule.units[indexOfFirst].first = false;
        // eslint-disable-next-line no-param-reassign
        schedule.units[i].first = true;
        indexOfFirst = i;
      }
    }
    // eslint-disable-next-line no-plusplus
    i++;
  }
}


// create a valid Date object using information stored in Object schedule
function setDateObject(date, month, year, time) {
  return new Date(`${month} ${date}, ${year} ${time}`);
}

// Create an options object to pass to createEvent
// this will add a description and location information
function createDetails(unit) {
  const details = {};
  details.description = unit.type;
  if (unit.isBonus) {
    const descBonus = ' - Bonus';
    details.description += descBonus;
  }
  if (unit.material && showMaterial) {
    const descMaterial = `\n${unit.material}\n`;
    details.description += descMaterial;
  }

  // If there is a comment add this to description
  if (unit.comment && unit.type !== 'Travel') {
    const descComment = `\n${unit.comment}`;
    details.description += descComment;
  }

  // Log this if this is a zoom unit {True/False}
  Logger.log(`unit.zoom: ${unit.zoom}`);

  // Append Zoom information if zoom is true
  if (unit.zoom) {
    details.description += '\nThis is a Zoom lesson\n';
  }
  if (unit.location) {
    details.location = lookupLocation(unit.location);
  }
  return details;
}

function makeEventTitle(unit) {
  let title = unit.type;
  if (unit.isBonus) {
    title += ' - Bonus';
  }
  title += ` (${unit.count})`;
  return title;
}

// Add a single event to the calendar
function addUnitToCalendar(calendar, date, month, year, unit) {
  if (unit.type === 'Vacation' || (unit.type === 'Blocked' && !unit.comment.includes('onus'))) {
    // Blank
  } else {
    const details = createDetails(unit);
    const event = calendar.createEvent(
      makeEventTitle(unit),
      setDateObject(date, month, year, unit.startTime),
      setDateObject(date, month, year, unit.endTime),
      details
    );
    if (unit.isFirst() && unit.location !== baseLC) {
      event.addPopupReminder(120); // This needs to be coded to get a more suitable time.
    }
    Logger.log(`Event ID: ${event.getId()}`);
  }
}

function openCalendar() {
  // Gets the public calendar named "BerlitzWork" using its ID.
  const calendar = CalendarApp.getCalendarById(calendarID);

  if (calendar == null) {
    Logger.log('Unable to find BerlitzWork Calendar');
    return -1;
  }
  return calendar;
}

// To avoid duplicate calendar entries when the schedule has been resent.
// Delete existing entries if they exist.
function deleteExistingEvents(calendar, schedule) {
  const events = calendar.getEventsForDay(setDateObject(schedule.date, schedule.month, schedule.year, '00:00'));
  if (events.length > 0) {
    Logger.log(`Deleting all events for ${schedule.date} the ${schedule.month}, ${schedule.year}`);
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in events) {
      events[i].deleteEvent();
    }
  }
}

// Loop through all units for the given schedule
// call addUnitToCalendar for each unit
function addUnitsToCalendar(calendar, schedule) {
  // Remove and previously created calendar Events to prevent duplication.
  deleteExistingEvents(calendar, schedule);

  let i = 0;
  while (i < schedule.units.length) {
    addUnitToCalendar(calendar, schedule.date, schedule.month, schedule.year, schedule.units[i]);
    // eslint-disable-next-line no-plusplus
    i++;
  }
}

