import { getRelevantMessages } from './mail';
import { writeSpreadSheet } from './configuration';
import { openSpreadSheet } from './spreadsheet';

function processMessages(messages) {
  let ss;
  if (writeSpreadSheet) {
    ss = openSpreadSheet();
    if (ss == -1) {
      Logger.log('Unable to open Spreadsheet\nExiting Script\n');
      return ss;
    }
  }

  const cal = openCalendar();
  if (cal == -1) {
    Logger.log('Unable to open Calendar\nExiting Script\n');
    return cal;
  }

  // process oldest message to newest
  let message = messages.length;
  while (message > 0) {
    --message;
    const subject = messages[message].getSubject();
    const body = messages[message].getPlainBody();
    if (!lessonsScheduledToday(body)) {
      Logger.log(`Email: ${subject}`);
      labelMessageAsDone(messages[message]);
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
  status = processMessages(messages);
  // status is currently unused. Could be used to send email notification in the future.
  Logger.log('Processing Completed.');
}

export { NightlyProcessing, doProcessing, processMessages };
