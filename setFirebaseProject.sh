#!/bin/bash
# usage e.g ./setFirebaseProject internal 
# should be called within package.json
arg=$1

basePath="shared-library/src/settings"
srcFile="$basePath/fb_projects/firebase-projects.$arg.noImport"
destFile="$basePath/firebase-projects.ts"


if [ $arg == "public" ]
then
    echo "Set firebase project to public"
  
elif [ $arg == "internal" ]
then
    echo "Set firebase project to internal"

else
    echo "ERROR - Set firebase project to 'internal' or 'public'"
    exit 1
fi

rm -f $destFile
cp $srcFile $destFile
# cat $destFile
echo "Firebase project successful set to $arg"
echo ""
exit 0

