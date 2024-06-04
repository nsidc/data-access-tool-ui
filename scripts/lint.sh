#!/bin/bash

# run all the linter commands, even if one fails, and exit with failure if any
# failed

status=0

run_cmd () {
    echo $1
    $1 || status=1
    echo ""
}

run_cmd "npx tsc --project tsconfig.json"
run_cmd "npx eslint --fix --config .eslintrc.json --ext .ts --ext .tsx src/"
run_cmd "npx stylelint --fix src/styles/"

exit $status
