#!/usr/bin/env bash

BASEDIR=$(pwd)
SOURCE=$BASEDIR/src
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

	# Copy files into dist directory
	cp ${SOURCE}/${FILE} ${DEST}

	# Remove imports
	sed -i .orig '/^import/d' ${DEST}/${FILE}

	# remove eslint-disable statements
	sed -i .orig '/^\/\* eslint-disable/d' ${DEST}/${FILE}

	# Remove exports
	sed -i .orig '/export {/,/}/d' ${DEST}/${FILE}

	# convert `console` to `Logger`
	sed -i .orig 's/console\./Logger\./g' ${DEST}/${FILE}
done

# Fix code formatting after striping import, exports and eslint-disable statements
cd ${DEST}
#npx prettier . --write
rm *.js.orig
