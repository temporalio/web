#!/usr/bin/env bash
# Configures CircleCI docker authentication
set -e

if [[ -z $GCLOUD_SERVICE_ACCOUNT ]]; then
  echo "Skipped: GCLOUD_SERVICE_ACCOUNT is not set."
  exit 0
fi

docker login \
  -u _json_key \
  --password-stdin \
  https://gcr.io <<<"${GCLOUD_SERVICE_ACCOUNT}"
