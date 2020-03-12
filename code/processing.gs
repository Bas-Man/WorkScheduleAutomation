
function Processing() {
  
  var status = 0;
  Logger.log("Starting Processing of Schedule Emails");
  const messages = getRelevantMessages();
  Logger.log("Retrieved relevant messages");
  status = processMessages(messages);
}

function processMessages(messages) {
  
  const ss = openSpreadSheet();
  if(ss == -1) {
    Logger.log("Unable to open Spreadsheet\nExiting Script\n");
    return ss;
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
      var schedule = newSchedule(subject);
    
      var trvMethBlk = matchTravelBlock(body);
      addUnitsToSchedule(schedule, trvMethBlk)
    
      var lessons = matchLessons(body)
      addUnitsToSchedule(schedule, lessons);

      tallyAndAssignUnits(schedule);
      
      findFirstUnit(schedule);
      
      Logger.log("Saving data for " + schedule.month + " " + schedule.date + ", " + schedule.year);
      saveDataToSheet(ss, schedule);
      Logger.log("Completed: " + schedule.month + " " + schedule.date + ", " + schedule.year);
      
      addUnitsToCalendar(cal, schedule);
      labelMessageAsDone(messages[message]);
    }
  }
  // Everything went as planned.
  return 2;
}

