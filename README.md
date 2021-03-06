# Work Schedule Automation ![GitHub](https://img.shields.io/github/license/Bas-Man/WorkScheduleAutomation)

Automate calendar, spreadsheet updating based on email sent from work.

**Warning:** This is not a replacement for reading your work email. You are still responsible for checking your email and knowing your schedule.
**This is merely an aid.**

## Index:
- [Setup](#setup)
- [Known Issues](#known-issues)

## <a name="setup"></a>Setup

### Options:
There are two ways to install this system.

**Option 1**:

Copy the code from the files directly and save with .gs file extention in [Google Script](https://script.google.com)

  1. Login and create a new Project.
  2. Create and copy files.\
    From the folder called `simple` copy the files as named. Remember to renamed `configuration.js.sample` to `configuration.gs`\
    Note: the file extension will be changed from .js to .gs in Google.
  3. Setup the configuration.gs file to match your needs. \
      *Note: You can use your gmail address for the calendarID if you want to use your primary calendar.* \
      *It should be noted that I am using labels in this configuration. You should be filtering your email and applying a label to your work schedule email. In this case I have a parent label: `Berlitz` and a sub-label `Schedule`. I will not go into details on how to do this since there is plenty of online guides. But if you need a hint. Your filter might look like this: `from:(advantage-noreply@) to:(your_address@gmail.com) subject:(Schedule for)` and have that filter apply the label you wish to use.*

      **Sample: Without Spreadsheet.**
      ```js
      const spreadSheetID = "";
      const calendarID = "YOUR_ID@group.calendar.google.com";
      const restDay = "Monday"; // Set your Rest day here
      const nightlyFilter = "newer_than:1d AND label:Berlitz/Schedule AND -label:ProcessedSchedule";
      const updatedFilter = "newer_than:1d AND label:Berlitz/Schedule AND label:ProcessedSchedule";
      // Check locations.js for valid LC names.
      const baseLC = "Akasaka"; // Set your Base LC here
      const writeSpreadSheet = false;
      const showMaterial = true;
      const archive = true;
      const contractType = "PL";
      ```
      **Sample: With Spreadsheet.**
      ```js
      const spreadSheetID = "YOUR_SPREADSHEET_ID";
      const calendarID = "YOUR_ID@group.calendar.google.com";
      const restDay = "Monday"; // Set your Rest day here
      const nightlyFilter = "newer_than:1d AND label:Berlitz/Schedule AND -label:ProcessedSchedule";
      const updatedFilter = "newer_than:1d AND label:Berlitz/Schedule AND label:ProcessedSchedule";
      // Check locations.js for valid LC names.
      const baseLC = "Akasaka"; // Set your Base LC here
      const writeSpreadSheet = true;
      const showMaterial = true;
      const archive = true;
      const contractType = "PL" or "FTI";
      ```

4. *(Optional)* Setup a daily trigger to run some time after the schedule has been posted. See instructions [Here](#trigger)

**Option 2**:

 For those with software development experience or the bold of heart. :) \
 Clone this repo and then use `clasp` to push the code to GoogleScript. See [Video Here](https://www.youtube.com/watch?v=V_7kvwcZf_c) for a guide on getting started.

 ```bash
 cd code
 ```
 After setting up the .clasp.json you can simply do
 ```bash
 clasp push
 ```

### Things you need to do:

You will need to create or use an existing calendar and determine its ID. You can get the ID by opening your google calendar.

If you want to have a special calendar for your Berlitz work schedule. Follow these steps after creating the calendar in Google.

1. Navigate to Calendar and click on the three vertical dots

![Options for ..](../media/Resources/ScreenOne.png?raw=true)

2. Select "Settings and Sharing"

![Settings and Sharing](../media/Resources/ScreenTwo.png?raw=true)

3. Below Integrate Calendar

![See ID below Integrate Calendar](../media/Resources/ScreenThree.png?raw=true) \
The ID will be just blow this text.

## Create a Spreadsheet if desired.

You will need to create a spreadsheet in your google drive and get its ID. The ID can be found in the spreadsheet's url located between `d/SPREADSHEET_ID/edit#gid=0`

A sample spreadsheet is located [here](https://docs.google.com/spreadsheets/d/1tRVtJX-2Bsn7vXIexK3Dtop5ko2BiFF2Hp83wuJrtPI/edit?usp=sharing) \
You can copy this sample to your own google drive account.

You will need to set your configuration options using the the above details.

*(This step is optional)*

<a name="trigger"></a>Set up a trigger

In order for this to be automated. You need to set up a trigger that runs by itself.

1. Open your project and select 'Edit' -> 'Current Project Triggers'

![TriggerStepOne](../media/Resources/TriggerStepOne.png?raw=true)

2. Click on the 'Add Trigger'. Its a nice large blue Button, probably in the lower right corner.

![TriggerStepTwo](../media/Resources/TriggerStepTwo.png?raw=true)

3. 'Select type of time based trigger' Set this to 'Day timer'. I have mine set to sometime after 7pm.

![TriggerStepThreeB](../media/Resources/TriggerStepThreeB.png?raw=true)

4. Select the time window for execution. 'Select time of day'

![TriggerStepFour](../media/Resources/TriggerStepFour.png?raw=true)

### <a name="known-issues"></a>Known Issues:
1. Berlitz has not created all the required Google Maps entries for all Language Centres, more over, there are barely any locations in Apple Maps. This means that the maps location may not be available. If you find an LC that does have a Google maps location but no entry in the locations.gs file. Please let me know.

2. You may need to reauthorize the app after a few months. This happened to me after I had been using it for 4 to 5 months.
