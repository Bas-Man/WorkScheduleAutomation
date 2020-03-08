
function Processing() {
  
  var status = 0;
  Logger.log("Starting Processing of Schedule Emails");
  const messages = getRelevantMessages();
  Logger.log("Retrieved relevant messages");
  status = processMessages(messages);
}

function processMessages(messages) {
  
  const ss = openSpreadSheet();
  const cal = openCalendar();
  
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
      var paidVacation = matchPaidVacation(body);
      addUnitsToSchedule(schedule, paidVacation);
    
      var trvMethBlk = matchTravelMethodBlock(body);   
      addUnitsToSchedule(schedule, trvMethBlk)
    
      var lessons = matchLessons(body)
      addUnitsToSchedule(schedule, lessons);

      tallyAndAssignUnits(schedule);
      
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

