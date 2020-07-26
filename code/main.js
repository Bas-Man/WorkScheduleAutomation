function doGet() {
  
  return HtmlService.createHtmlOutputFromFile("home");
  
}

// Updated schedule and calendar if there has been an updated schedule sent.
function updateSchedule() {
  doProcessing(updatedFilter);
}

// Run nightly processing after initial nightly schedule has been sent out.
function doNightly() {
  doProcessing(nightlyFilter);
}