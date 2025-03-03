import * as dotenv from 'dotenv';

// Configure dotenv to use the environment file specified by DOTENV_CONFIG_PATH
// or fall back to default .env
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

function requireEnvVariable(envVariableName: string): string {
  const envVariableValue = process.env[envVariableName];
  if (!envVariableValue) {
    throw new Error(
      `Environment variable ${envVariableName} is not set. Please check your environment file.`
    );
  }
  return envVariableValue;
}

// Export base URLs first
export const WEB_SDK_API_URL = requireEnvVariable('WEB_SDK_API_URL');
export const BASE_URL = requireEnvVariable('BASE_URL');
export const SDK_API_URL = requireEnvVariable('SDK_API_URL');

// Then export app-specific variables
export const API_E2E_APP_ID = requireEnvVariable('API_E2E_APP_ID');
export const API_E2E_ACCESS_TOKEN_ADMIN = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_ADMIN'
);
export const SUPER_ADMIN_ACCESS_TOKEN = requireEnvVariable(
  'SUPER_ADMIN_ACCESS_TOKEN'
);
