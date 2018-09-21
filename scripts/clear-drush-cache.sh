#!/bin/bash

if (drush cache-clear css-js > /dev/null 2>&1) ;
then
    echo "drush: 'css-js' cache was cleared."
else
    echo "drush: an error occurred while clearing 'css-js' cache."
fi
