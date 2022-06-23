#!/usr/bin/env bash
# Builds a docker image, and pushes it if it's in CircleCI
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
LIB_DIR="${DIR}/lib"
VERSION="1.15.2-rc1"

remote_image_name="gcr.io/outreach-docker/temporal/temporal-web"

# shellcheck source=../../lib/buildx.sh
source "${LIB_DIR}/gcr.sh"

# shellcheck source=../../lib/buildx.sh
source "${LIB_DIR}/buildx.sh"

# shellcheck source=../../lib/logging.sh
source "${LIB_DIR}/logging.sh"

args=(
  "--ssh" "default"
  "--progress=plain" "--file" "Dockerfile"
  "--build-arg" "VERSION=${VERSION}"
)

# Build a quick native image and load it into docker cache for security scanning
# Scan reports for release images are also uploaded to OpsLevel (test image reports only available on PR runs as artifacts).
info "Building Docker Image (for scanning)"
(
  set -x
  docker buildx build "${args[@]}" -t "temporal-web" --load .
)

info "🔐 Scanning docker image for vulnerabilities"
"${DIR}/twist-scan.sh" "temporal-web" || echo "Warning: Failed to scan image"

echo "Branch: ${CIRCLE_BRANCH}"

if [ "$CIRCLE_BRANCH" = "master" ]; then
  echo "🔨 Building and Pushing Docker Image (production)"
  (
    set -x
    docker buildx build "${args[@]}" -t "${remote_image_name}:${VERSION}" -t "$remote_image_name:latest" --push .
  )
fi
