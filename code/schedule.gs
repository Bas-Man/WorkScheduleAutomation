
// Get email date information and initialize object
function newSchedule(subject) {
  
  Logger.log("Creating mySchedude Object and matching Date information");
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
  Logger.log("Completed newSchedule");
  return schedule;
}

function createScheduleObject() {

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



