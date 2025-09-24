#!/bin/bash

# Create environment file for specified environment
# Usage: ./create-env-file.sh <environment>

set -e

ENVIRONMENT=$1

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Error: Environment parameter required"
  echo "Usage: $0 <environment>"
  exit 1
fi

ENV_FILE=".env.$ENVIRONMENT"

echo "Creating environment file: $ENV_FILE"

# Create the environment file
cat > "$ENV_FILE" << EOF
BASE_URL=$BASE_URL
WEB_SDK_API_URL=$WEB_SDK_API_URL
API_E2E_APP_ID=$API_E2E_APP_ID
SDK_API_URL=$SDK_API_URL
API_E2E_ACCESS_TOKEN_ADMIN=$API_E2E_ACCESS_TOKEN_ADMIN
SUPER_ADMIN_ACCESS_TOKEN=$SUPER_ADMIN_ACCESS_TOKEN
ENVIRONMENT=$ENVIRONMENT
EOF

# Add UI-specific variables for sealion
if [[ "$ENVIRONMENT" == "sealion" ]]; then
  cat >> "$ENV_FILE" << EOF
UI_E2E_ACCESS_TOKEN_ADMIN=$UI_E2E_ACCESS_TOKEN_ADMIN
UI_E2E_APP_ID=$UI_E2E_APP_ID
UI_E2E_LOGIN_ADMIN=$UI_E2E_LOGIN_ADMIN
UI_E2E_PASSWORD_ADMIN=$UI_E2E_PASSWORD_ADMIN
UI_E2E_WEB_SDK_KEY=$UI_E2E_WEB_SDK_KEY
EOF
fi

echo "Environment file created successfully"