
function NightlyProcessing() {
  // Main function for processing nightly.
  var status = 0;
  Logger.log("Starting Processing of Schedule Emails");
  const messages = getRelevantMessages();
  // A check to see if message is empty could be used to exist this function earlier.
  Logger.log("Retrieved relevant messages");
  status = processMessages(messages);
  // status is currently unused. Could be used to send email notification in the future.
  Logger.log("Processing Completed.");
}

function processMessages(messages) {

  if (writeSpreadSheet) {
    const ss = openSpreadSheet();
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
