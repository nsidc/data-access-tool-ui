#!/bin/bash

# run all the linter commands, even if one fails, and exit with failure if any
# failed

status=0

run_cmd () {
    echo $1
    $1 || status=1
    echo ""
}

run_cmd "npx tsc --noEmit --skipLibCheck --project tsconfig.json"
run_cmd "npx tslint --config tslint.json 'src/**/*.{ts,tsx}'"
run_cmd "npx stylelint --config .stylelintrc src/styles/"

exit $status
