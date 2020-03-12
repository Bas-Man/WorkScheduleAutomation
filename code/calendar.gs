
// create a valid Date object using information stired in Object myScheule
function setDateObject(date, month, year, time) {
  return new Date(month + ' ' + date + ', ' + year + ' ' + time);
}

function lookupLocation(location){

  if(!locations[location]) 
    location = "";
  else
    location = locations[location];
  return location;  
}

// Create an options object to pass to createEvent
// this will add a ddescription and location information
function createDetails(unit){

  details = {};
  details.description = unit.type + "\n";
  if((unit.comment) &&
     (unit.type !== "Travel")){
    details.description += unit.comment + "\n";
  }
  if(unit.location) {
    details.location = lookupLocation(unit.location);
  }
  return details;  
}

// Add a single event to the calendar
function addUnitToCalendar(calendar, date, month, year, unit) {
 
  if((unit.type === "Vacation") ||
     ((unit.type === "Blocked") && (!unit.comment.includes("Bonus")))) {
    } else {
      var details = createDetails(unit);
      var event = calendar.createEvent(makeEventTitle(unit),
        setDateObject(date, month, year, unit.startTime),
        setDateObject(date, month, year, unit.endTime),
        details);
        Logger.log('Event ID: ' + event.getId());
    }
}

function makeEventTitle(unit) {

  var title = unit.type + " (" + unit.count + ")";
  return title;
}

function openCalendar() {

  // Gets the public calendar named "BerlitzWork" using its ID.
  const calendar = CalendarApp.getCalendarById(calendarID);
  
  if (calendar == null) {
    Logger.log("Unable to find BerlitzWork Calendar");
    return 0;
  } else {
    return calendar;
  }
}

// Loop throgh all scheduses provided / Batch
function addSchedulesToCalendar(mySchedules) {
  
  // Gets the public calendar named "BerlitzWork" using its ID.
  const calendar = CalendarApp.getCalendarById(calendarID);
  
  if (calendar == null) {
    Logger.log("Unable to find BerlitzWork Calendar");
    return undefined;
  }

  var i = 0;
  while(i < mySchedules.length) {
    deleteExistingEvents(calendar, mySchedules[i]);
    addUnitsToCalendar(calendar, mySchedules[i])
    i++
  }
}

// Loop through all units for the given schedule
// call addUnitToCalendar for each unit
function addUnitsToCalendar(calendar, mySchedule) {

  deleteExistingEvents(calendar, mySchedule);
  
  var i = 0;
  while(i < mySchedule.units.length) {
    addUnitToCalendar(calendar, mySchedule.date, mySchedule.month,
                        mySchedule.year, mySchedule.units[i]);
    i++;  
  }
}

// To avoid duplicate calendar entries when the schedule has been resent.
// Delete existing entrise if they exist.
function deleteExistingEvents(calendar, mySchedule){
  
  var events = calendar.getEventsForDay(setDateObject(mySchedule.date, mySchedule.month, mySchedule.year,"00:00"));
  if (events.length > 0) {
    Logger.log("Deleting all events for " + mySchedule.date + " the " + mySchedule.month + ", " + mySchedule.year);
    for (var i in events) {
      events[i].deleteEvent();
    }
  }  
}
