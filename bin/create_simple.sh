#!/usr/bin/env bash

BASEDIR=$(pwd);
SOURCE=$BASEDIR/../code/
DEST=$BASEDIR/../simple/

CP_FILES="home.html locations.js configuration.js.sample constants.js"
CAT_FILES="main.js mail.js processing.js schedule.js spreadsheet.js units.js calendar.js"

#Clear directory
echo "Clearing Directory: simple"
rm $DEST/*

#Copy individual files.
echo "Copying files....";
for f in $CP_FILES
do
  echo "Copying ${f}";
  cp $SOURCE/$f $DEST;
done

#concatinate files in to code.js
echo "creating file code.js from other files";
for f in $CAT_FILES
do
  echo "Appending ${f}"
  cat $SOURCE/$f >> $DEST/code.js
done
