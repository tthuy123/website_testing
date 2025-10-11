#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-smoke}"   # smoke | load | stress
export OPTIONS_FILE="${PROFILE}"

# load .env nếu có
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Running FRONTEND ${PROFILE} against ${BASE_URL:-https://www.saucedemo.com}"
k6 run src/tests/home.spec.js
