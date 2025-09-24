#!/bin/bash

# Download Allure history from S3 for trend analysis
# Usage: ./download-allure-history.sh <allure-results-dir>

set -e

ALLURE_RESULTS_DIR=${1:-"allure-results"}
HISTORY_DIR="$ALLURE_RESULTS_DIR/history"

if [[ -z "$AWS_S3_BUCKET" ]]; then
  echo "Warning: AWS_S3_BUCKET not set, skipping history download"
  exit 0
fi

echo "Downloading Allure history from S3..."

# Clean bucket name
AWS_S3_BUCKET_CLEAN=$(echo "$AWS_S3_BUCKET" | xargs)

# Create history directory
mkdir -p "$HISTORY_DIR"

# Try to download history from different possible locations
HISTORY_LOCATIONS=(
  "s3://$AWS_S3_BUCKET_CLEAN/history"
  "s3://$AWS_S3_BUCKET_CLEAN/staging/history"
  "s3://$AWS_S3_BUCKET_CLEAN/ui-daily/history"
  "s3://$AWS_S3_BUCKET_CLEAN/runs/latest/history"
)

DOWNLOADED=false

for location in "${HISTORY_LOCATIONS[@]}"; do
  echo "Trying to download from: $location"
  
  if aws s3 cp "$location" "$HISTORY_DIR" --recursive --quiet; then
    echo "Successfully downloaded history from: $location"
    DOWNLOADED=true
    break
  fi
done

if [[ "$DOWNLOADED" == "false" ]]; then
  echo "No previous history found in any location - starting fresh"
else
  echo "History download completed"
  
  # Show what was downloaded
  if [[ -d "$HISTORY_DIR" ]]; then
    echo "History files:"
    ls -la "$HISTORY_DIR" || true
  fi
fi