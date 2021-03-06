
// create a valid Date object using information stored in Object schedule
function setDateObject(date, month, year, time) {
  return new Date(month + ' ' + date + ', ' + year + ' ' + time);
}

function lookupLocation(location){
  // This function takes the short LC name and looks up the full name which is used in
  // Google Maps and hopefully Apple Maps Allowing for calendar apps to provide map directions
  if(!locations[location])
    location = "";
  else
    location = locations[location];
  return location;
}

// Create an options object to pass to createEvent
// this will add a description and location information
function createDetails(unit){

  details = {};
  details.description = unit.type;
  if (unit.isBonus) {
    var descBonus = " - Bonus";
    details.description += descBonus;
  }
  if((unit.material) && (showMaterial)) {
    var descMaterial = "\n" + unit.material + "\n";
    details.description += descMaterial;
  }

  // If there is a comment add this to description
  if((unit.comment) &&
     (unit.type !== "Travel")){
     var descComment = "\n" + unit.comment;
     details.description += descComment;
  }

  // Log this if this is a zoom unit {True/False}
  console.log("unit.zoom: " + unit.zoom)

  // Append Zoom information if zoom is true
  if(unit.zoom) {
    details.description += "\nThis is a Zoom lesson\n";
  }
  if(unit.location) {
    details.location = lookupLocation(unit.location);
  }
  return details;
}

// Add a single event to the calendar
function addUnitToCalendar(calendar, date, month, year, unit) {

  if((unit.type === "Vacation") ||
     ((unit.type === "Blocked") && (!unit.comment.includes("onus")))) {
    } else {
      var details = createDetails(unit);
      var event = calendar.createEvent(makeEventTitle(unit),
      setDateObject(date, month, year, unit.startTime),
      setDateObject(date, month, year, unit.endTime),
                    details);
      if(unit.isFirst() && (unit.location !== baseLC)) {
      event.addPopupReminder(120); // This needs to be coded to get a more suitable time.
      }
        Logger.log('Event ID: ' + event.getId());
    }
}

function makeEventTitle(unit) {

  var title = unit.type;
  if (unit.isBonus) {
    title += " - Bonus";
  }
  title += " (" + unit.count + ")";
  return title;
}

function openCalendar() {

  // Gets the public calendar named "BerlitzWork" using its ID.
  const calendar = CalendarApp.getCalendarById(calendarID);

  if (calendar == null) {
    Logger.log("Unable to find BerlitzWork Calendar");
    return -1;
  } else {
    return calendar;
  }
}

// Loop through all units for the given schedule
// call addUnitToCalendar for each unit
function addUnitsToCalendar(calendar, schedule) {

  // Remove and previously created calendar Events to prevent duplication.
  deleteExistingEvents(calendar, schedule);

  var i = 0;
  while(i < schedule.units.length) {
    addUnitToCalendar(calendar, schedule.date, schedule.month,
                     schedule.year, schedule.units[i]);
    i++;
  }
}

// To avoid duplicate calendar entries when the schedule has been resent.
// Delete existing entries if they exist.
function deleteExistingEvents(calendar, schedule){

  var events = calendar.getEventsForDay(setDateObject(schedule.date, schedule.month, schedule.year,"00:00"));
  if (events.length > 0) {
    Logger.log("Deleting all events for " + schedule.date + " the " + schedule.month + ", " + schedule.year);
    for (var i in events) {
      events[i].deleteEvent();
    }
  }
}
