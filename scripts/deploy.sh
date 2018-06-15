#!/bin/bash
# This script is expected to be run from a VM with at least /share/apps/hermes
# or /share/apps/hermes-all mounted, depending on how you call it.
set -e

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FROM="$THIS_DIR/../dist/*"

function ensure_dir_exists() {
    if [ ! -d $1 ]; then
        mkdir -p $1
    fi
}

if [ -z "$1" ]; then
    TO=/share/apps/hermes/ui
else
    TO=/share/apps/hermes-all/$1/ui
fi

ensure_dir_exists $TO
rm -rf $TO/*
cp -R $FROM $TO/.

echo "App deployed to $TO"
