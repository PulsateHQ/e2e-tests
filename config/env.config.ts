import * as dotenv from 'dotenv';

// Configure dotenv to use the environment file specified by DOTENV_CONFIG_PATH
// or fall back to default .env
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

// Check if we're using the Sealion environment, which is the only one that will run UI tests
const isSealionEnv =
  process.env.DOTENV_CONFIG_PATH?.includes('.env.sealion') || false;

function requireEnvVariable(envVariableName: string, required = true): string {
  const envVariableValue = process.env[envVariableName];
  if (required && !envVariableValue) {
    throw new Error(
      `Environment variable ${envVariableName} is not set. Please check your environment file.`
    );
  }
  return envVariableValue || '';
}

// Export base URLs (always required)
export const WEB_SDK_API_URL = requireEnvVariable('WEB_SDK_API_URL');
export const BASE_URL = requireEnvVariable('BASE_URL');
export const SDK_API_URL = requireEnvVariable('SDK_API_URL');

// API variables (always required)
export const API_E2E_APP_ID = requireEnvVariable('API_E2E_APP_ID');
export const API_E2E_ACCESS_TOKEN_ADMIN = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_ADMIN'
);
export const SUPER_ADMIN_ACCESS_TOKEN = requireEnvVariable(
  'SUPER_ADMIN_ACCESS_TOKEN'
);

// UI variables (only required for Sealion environment)
export const UI_E2E_LOGIN_ADMIN = requireEnvVariable(
  'UI_E2E_LOGIN_ADMIN',
  isSealionEnv
);
export const UI_E2E_PASSWORD_ADMIN = requireEnvVariable(
  'UI_E2E_PASSWORD_ADMIN',
  isSealionEnv
);
export const UI_E2E_ACCESS_TOKEN_ADMIN = requireEnvVariable(
  'UI_E2E_ACCESS_TOKEN_ADMIN',
  isSealionEnv
);
export const UI_E2E_APP_ID = requireEnvVariable('UI_E2E_APP_ID', isSealionEnv);
export const UI_E2E_WEB_SDK_KEY = requireEnvVariable(
  'UI_E2E_WEB_SDK_KEY',
  isSealionEnv
);
