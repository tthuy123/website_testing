# set -euo pipefail

# PROFILE="${1:-smoke}"
# export OPTIONS_FILE="${PROFILE}"

# if [ -f ".env" ]; then
#   export $(grep -v '^#' .env | xargs)
# fi

# echo "Running FRONTEND ${PROFILE} against ${BASE_URL}"
# k6 run src/tests/flow.signup-login-browse.spec.js
#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-smoke}"                        # smoke|load
SPEC_PATH="${2:-src/tests/flow.signup-login-browse.spec.js}"  # file spec muốn chạy
export OPTIONS_FILE="${PROFILE}"

# load .env nếu có
if [[ -f ".env" ]]; then
  export $(grep -v '^\s*#' .env | xargs)
fi

: "${BASE_URL:?BASE_URL chưa được set (trong .env hoặc CLI)}"
: "${K6_BROWSER_TYPE:=chromium}"             # có thể override từ CLI

echo "▶ Running FRONTEND ${PROFILE} (${K6_BROWSER_TYPE}) against ${BASE_URL}"
k6 run "${SPEC_PATH}"
