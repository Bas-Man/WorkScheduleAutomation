
// Mail and functions

function getRelevantMessages()
{
  Logger.log("Getting Schedule Emails to be processed");
  var threads = GmailApp.search(filter);
  var messages=[];
  threads.forEach(function(thread)
                  {
                    var count = thread.getMessageCount();
                    if(count > 1) {
                      messages.push(thread.getMessages()[count - 1]);
                    } else {
                      messages.push(thread.getMessages()[0]);
                    }
                  });
  Logger.log("Found " + messages.length + " messages");
  return messages;
}

function labelMessageAsDone(message){
  
  var label = 'ProcessedSchedule';
  var label_obj = GmailApp.getUserLabelByName(label);
  if(!label_obj){
    label_obj = GmailApp.createLabel(label);
  }
  label_obj.addToThread(message.getThread() );  
    
}

