function testProcessing() {
  
  const messages = getRelevantMessages();
  Logger.log("Number of Messages: " + messages.length);
  
  for(var i = 0; i < messages.length; i++) {
    Logger.log(messages[i].getPlainBody());  
  }
  
  
  //var myScehdules = processMessagesTest(messages);

}

function processMessagesTest(messages) {
  
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
    }
  }
}




