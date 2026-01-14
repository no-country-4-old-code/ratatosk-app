#!/bin/bash
# usage e.g ./setSwWorker.sh internal
# should be called within forntend package.json
arg=$1

srcFile="ngsw-worker-custom-angular-v12.$arg.noImport"
destFile="../../ngsw-worker-custom-angular-v12.js"


if [ $arg == "public" ]
then
    echo "Use SW Worker of public firebase project"
  
elif [ $arg == "internal" ]
then
    echo "Use SW Worker of internal firebase project"

else
    echo "ERROR - Select between 'internal' or 'public' Service Worker"
    exit 1
fi

rm -f $destFile
cp $srcFile $destFile
# cat $destFile
echo "SW Worker successful set to $arg"
echo ""
exit 0

