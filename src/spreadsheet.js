// Spreadsheet Functions from here

import { months } from './constants';
import { spreadSheetID } from './configuration';

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

export { openSpreadSheet, saveDataToSheet };
