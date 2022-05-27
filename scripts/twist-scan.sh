#!/usr/bin/env bash
#
# This script scans docker images for vulnerabilities, generates local
# report and also uploads the report to Prisma Cloud. The script expects
# special credentials - those are set by prismacloud-credentials circleci context.
#

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

LIB_DIR="${DIR}/lib"

# shellcheck source=../../lib/logging.sh
source "${LIB_DIR}/logging.sh"

## Add some safeties for external dependencies when running
if [[ -z $CIRCLECI ]]; then
  echo "I can only run in CircleCI"
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  # shellcheck disable=SC2016 # Why: On purpose.
  echo 'We need an executable called curl in the $PATH in order to execute'
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  # shellcheck disable=SC2016 # Why: On purpose.
  echo 'We need an executable called curl in the $PATH in order to execute'
  exit 1
fi
if [[ -z $PC_CONSOLE_URL ]]; then
  echo "Need an environment variable called PC_CONSOLE_URL"
  exit 1
fi
if [[ -z $PC_ACCESS_KEY ]]; then
  echo "Need an environment variable called PC_ACCESS_KEY"
  exit 1
fi
if [[ -z $PC_SECRET_KEY ]]; then
  echo "Need an environment variable called PC_SECRET_KEY"
  exit 1
fi

## /Add some safeties for external dependencies when running

PC_CLOUD_TOKEN_JSON=/tmp/token.json
info "setting up prismacloud auth"
curl -s -S -o ${PC_CLOUD_TOKEN_JSON} -X POST --user-agent "CircleCI/Getoutreach/2.2.0" \
  -H "Content-type: application/json" \
  -d '{"username": "'"${PC_ACCESS_KEY}"'", "password": "'"${PC_SECRET_KEY}"'"}' \
  "${PC_CONSOLE_URL}/api/v1/authenticate"

PC_CLOUD_TOKEN=$(jq -r -c '.token' <${PC_CLOUD_TOKEN_JSON})

PC_CLOUD_TWISTCLI=/tmp/twistcli
info "downloading twistcli from prismacloud"
curl -L --header "authorization: Bearer ${PC_CLOUD_TOKEN}" \
  "${PC_CONSOLE_URL}/api/v1/util/twistcli" -o ${PC_CLOUD_TWISTCLI}
chmod a+x ${PC_CLOUD_TWISTCLI}

# Note: we are relying on a default docker host address (which is, per twistcli doc: unix:///var/run/docker.sock)
# since we are running this script on a bare VM. If this ever changes, pls set --docker-address explicitly.
# Note: https version of the address will require TLS cert - see twistcli doc for details.
${PC_CLOUD_TWISTCLI} images scan --token "${PC_CLOUD_TOKEN}" \
  --ci --details --address "${PC_CONSOLE_URL}" \
  --custom-labels \
  --output-file "${TEST_RESULTS}/image_scan.json" \
  "$@"
