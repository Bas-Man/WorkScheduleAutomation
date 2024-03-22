#!/usr/bin/env bash

BASEDIR=$(pwd)
SOURCE=$BASEDIR/code
DEST=$BASEDIR/dist

APPSCRIPT='appsscript.json'
HTMLHOME='home.html'

# Make dir if it does not exist.
mkdir -p ${DEST}

# Clear Distribution Directly for update
echo "Clearing ${DEST}..."
rm -v ${DEST}/*
echo "Done."

# Copy AppsScript JSON file
cp ${BASEDIR}/${APPSCRIPT} ${DEST}

# Copy home.html file
cp ${SOURCE}/${HTMLHOME} ${DEST}

for FULL_PATH_NAME in $(ls ${SOURCE}/*.js); do
	FILE=$(basename ${FULL_PATH_NAME})
	egrep -v '(^i|^\/* eslint-disable)' ${FULL_PATH_NAME} |
		while read LINE; do
			echo ${LINE} >>${DEST}/${FILE}
		done

	# There is an issue with this script. It's adding /Applications/ and other folders. This ia temp fix
	# The issue is most like the `/* eslint` where the `/*` is being interpreted
	sed '/^\/Application/d' ${DEST}/${FILE} >/tmp/temp.txt && mv /tmp/temp.txt ${DEST}/${FILE}
	# Report exports at the end of the file This is used as these may span multiple lines
	sed '/^export {/,/};/d' ${DEST}/${FILE} >/tmp/temp.txt && mv /tmp/temp.txt ${DEST}/${FILE}
done

# Fix code formatting after striping import, exports and eslint-disable statements
cd ${DEST}
npx prettier . --write
