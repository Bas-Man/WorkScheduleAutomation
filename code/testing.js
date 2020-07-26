function testProcessing() {
  
  const messages = getRelevantMessages(updatedFilter);
  Logger.log("Number of Messages: " + messages.length);
  
  for(var i = 0; i < messages.length; i++) {
    Logger.log(messages[i].getPlainBody());  
  }
  
  
  //var myScehdules = processMessagesTest(messages);

}




