
// Mail functions

function getRelevantMessages(filter)
{
  Logger.log("Getting Schedule Emails to be processed");
  var threads = GmailApp.search(filter);
  var messages=[];
  threads.forEach(function(thread)
                  {
                    var count = thread.getMessageCount();
                    if(count > 1) {
                      Logger.log("Found " + count + " messages. Using the last message");
                      // More than one message in the thread, get the last message in the thread
                      messages.push(thread.getMessages()[count - 1]);
                    } else {
                      // Only one message, so get the first and only message
                      messages.push(thread.getMessages()[0]);
                    }
                  });
  Logger.log("Found " + messages.length + " messages");
  return messages;
}

function labelMessageAsDone(message){
  // Add a label to the message thread so that it is not processed again.
  
  var label = 'ProcessedSchedule';
  var label_obj = GmailApp.getUserLabelByName(label);
  if(!label_obj){
    label_obj = GmailApp.createLabel(label);
  }
  label_obj.addToThread(message.getThread() ); 
  
  // Archive this message if configured
  if(archive) {
    Logger.log("Archiving message");
    var moveThread = message.getThread();
    moveThread.moveToArchive();
  }
    
}
