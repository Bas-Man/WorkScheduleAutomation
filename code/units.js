function isStandardLesson(lesson_type) {
    // Check if the lesson is a standard lesson. check is the lesson_type is contained in the
    //constant array defined in constants.js
    // return a booleen
    return basic_lessons.includes(lesson_type);
}

function isBonusTimeSlot(time){
    return pl_bonus_times.includes(time);
}

function createDefaultUnit() {
  // Create an default Unit with default values

  var unit = {};
  unit.zoom = false;
  unit.first = false;
  unit.isBonus = false;
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
         } else if ((contractType === "PL") && (isBonusTimeSlot(schedule.units[i].startTime))) {
           // This is bonus time for pl
           schedule.bonuses += schedule.units[i].count;
           schedule.units[i].isBonus = true;
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
      schedule.units[i].isBonus = true;
    } else if (schedule.units[i].type === "Vacation") {
      // For now set this to a value of 1 I will need to
      // check how half days are done
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
