#!/usr/bin/env bash

BASEDIR=$(pwd)
SOURCE=$BASEDIR/../dist/
DEST=$BASEDIR/../simple/

CP_FILES="home.html locations.js constants.js"
CP_SAMPLE_CONFIG="configuration.js.sample"
CAT_FILES="main.js mail.js processing.js schedule.js spreadsheet.js units.js calendar.js"

#Clear directory
echo "Clearing Directory: simple"
rm $DEST/*

#Copy individual files.
echo "Copying files...."
for f in $CP_FILES; do
	echo "Copying ${f}"
	cp $SOURCE/$f $DEST
done
# Copy Sample Configuration file
cp ${BASEDIR}/../src/configuration.js.sample ${DEST}

#concatinate files in to code.js
echo "creating file code.js from other files"
for f in $CAT_FILES; do
	echo "Appending ${f}"
	cat $SOURCE/$f >>$DEST/code.js
done
