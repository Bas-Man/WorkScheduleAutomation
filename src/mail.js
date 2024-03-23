// Mail functions

import { archive } from './configuration';

function getRelevantMessages(filter) {
  Logger.log('Getting Schedule Emails to be processed');
  const threads = GmailApp.search(filter);
  const messages = [];
  // eslint-disable-next-line func-names
  threads.forEach(function (thread) {
    const count = thread.getMessageCount();
    if (count > 1) {
      Logger.log(`Found ${count} messages. Using the last message`);
      // More than one message in the thread, get the last message in the thread
      messages.push(thread.getMessages()[count - 1]);
    } else {
      // Only one message, so get the first and only message
      messages.push(thread.getMessages()[0]);
    }
  });
  Logger.log(`Found ${messages.length} messages`);
  return messages;
}

function labelMessageAsDone(message) {
  // Add a label to the message thread so that it is not processed again.

  const label = 'ProcessedSchedule';
  let labelObj = GmailApp.getUserLabelByName(label);
  if (!labelObj) {
    labelObj = GmailApp.createLabel(label);
  }
  labelObj.addToThread(message.getThread());

  // Archive this message if configured
  if (archive) {
    Logger.log('Archiving message');
    const moveThread = message.getThread();
    moveThread.moveToArchive();
  }
}

export { getRelevantMessages, labelMessageAsDone };
