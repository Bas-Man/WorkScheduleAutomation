/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import { restDay } from './configuration';
import { dateRegex, trvlBlkRegex, lessonsPvRegex } from './constants';
import { createDefaultUnit } from './units';

function createScheduleObject() {
  // Initialize new schedule object. Setting default values.

  console.log('Creating Schedule Object');
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
  console.log('Creating Schedule Object and matching Date information');
  const match = subject.match(dateRegex);

  if (match.length < 4) {
    console.log('Unable to match Date information for Schedule');
    console.log(`Subject: ${subject}`);
    return undefined;
  }
  const schedule = createScheduleObject();
  // Add additional properties based on email contents
  schedule.day = match.groups.day;
  schedule.month = match.groups.month;
  schedule.date = match.groups.date;
  schedule.year = match.groups.year;

  console.log('Completed Schedule');
  return schedule;
}

// Check if I have work on this day or not.
function lessonsScheduledToday(text) {
  const regex = /There is no work scheduled/i;

  console.log('Checking if there are lessons in email');
  const match = text.match(regex);
  if (!match) {
    console.log('Units found. Will process email');
    return 1; // Did not match text. There must be units to process
  }
  console.log('No work scheduled in this email.');
  return 0; // Matched text. There are not lessons today.
}

// Get all units for Travels, Methods and blocked times.
function matchTravelBlock(text) {
  console.log('Matching Travels, Methods and Blocked Units');
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
  console.log(`Matched ${units.length} unique entries`);
  return units;
}

// Get lessons from email text
function matchLessons(text) {
  console.log('Starting matchLessons');
  const units = [];
  const matches = text.matchAll(lessonsPvRegex);
  for (const match of matches) {
    console.log('Found matches\n');
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
  console.log('Completed matchLessons');
  return units;
}

export { newSchedule, lessonsScheduledToday, matchTravelBlock, matchLessons };
