// Find any Paid Vacation Units in current Email
function matchPaidVacation(text) {
  
  Logger.log("Matching any Paid Vacation Units");  
  let units = new Array();
  const matches = text.matchAll(pv_regex);
  for(const match of matches) {
    var unit = {};
    unit.startTime = match[1];
    unit.endTime = match[2];
    unit.count = parseInt(match[3]);
    unit.location = match[4];
    unit.type = match[5];
    unit.comment = match[6];
    units.push(unit);
  }
  Logger.log("Completed matching Paid Vacation Units");
  return units;
}

// Get email date information and initialize object
function newSchedule(subject) {
  
  Logger.log("Creating mySchedude Object and matching Date information");
  const match = subject.match(date_regex);
  
  if (match.length < 4) {
    Logger.log("Unable to match Date information for Schedule");
    Logger.log("Subject: " + subject);
    return undefined;
  } else {
    var mySchedule = {};
    mySchedule.day = match.groups.day;
    mySchedule.month = match.groups.month;
    mySchedule.date = match.groups.date;
    mySchedule.year = match.groups.year;
    mySchedule.units = [];
    mySchedule.lessons = 0;
    mySchedule.travels = 0;
    mySchedule.bonuses = 0;
    mySchedule.restDay = 0;
    mySchedule.pv = 0;
  }
  Logger.log("Completed newSchedule");
  return mySchedule;
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
    unit = {};
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

// Add units found in email to the myschedule Object
function addUnitsToSchedule(mySchedule, units) {
  Logger.log("Added units to schedule Object");
  Array.prototype.push.apply(mySchedule.units,units);
}

// Tally units so they can be inserted into the spreedsheet
function tallyAndAssignUnits(mySchedule) {
  
  Logger.log("Starting the tally process");
  for (var i = 0; i < mySchedule.units.length; i++) {
    // These are normal classes
    if((mySchedule.units[i].type === "Method") || 
       (mySchedule.units[i].type === "Private") || 
       (mySchedule.units[i].type === "OutService") ||
       (mySchedule.units[i].type === "Office") ||
       (mySchedule.units[i].type.startsWith("Group")) ||
       (mySchedule.units[i].type.startsWith("Placement"))) { 
         //Placements are never paid as bonus unless its a mistake
         if (mySchedule.day === restDay) {
           Logger.log("Updating RestDay Count");
           mySchedule.restDay += mySchedule.units[i].count;
       } else {
           Logger.log("Updating Lessons count");
           mySchedule.lessons += mySchedule.units[i].count;
       }
      // The next set are Travel units
    } else if ((mySchedule.units[i].type === "Travel") ||
               // Sometimes Travel units happen in blocked units. This is bad :(
               ((mySchedule.units[i].type === "Blocked") && 
                (mySchedule.units[i].comment.toLowerCase() === "travel"))) {
      Logger.log("Updating Travel Count");
      mySchedule.travels += mySchedule.units[i].count;
      // Bonus units
    } else if (mySchedule.units[i].type.endsWith("onus")) {
      Logger.log("Updating Bonus Count");
      mySchedule.bonuses += mySchedule.units[i].count;
    } else if (mySchedule.units[i].type === "Vacation") {
      // For now set this to a value of 1 I will need to
      // check how half days aredone
      mySchedule.pv += 1;
    }
  }
}

// Get lessons from email text
function matchLessons(text) {
  
  Logger.log("Starting matchLessons");
  let units = new Array();
  const matches = text.matchAll(lessons_pv_regex);
  for(const match of matches) {
    Logger.log("Found matches\n");
    unit = {};
    unit.startTime = match.groups.startTime;
    unit.endTime = match.groups.endTime;
    unit.count = parseInt(match.groups.count);
    unit.location = match.groups.location || '';
    unit.class = match.groups.class || '';
    unit.type = match.groups.type || '';
    unit.material = match.groups.material || '';
    unit.comment = match.groups.comment.trim() || '';
    units.push(unit);
  }
  Logger.log("Completed matchLessons");
  return units;
}



