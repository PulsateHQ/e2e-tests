import * as dotenv from 'dotenv';

// Remove unused path import and just keep the basic dotenv config
dotenv.config({
  override: true
});

function requireEnvVariable(envVariableName: string): string {
  const envVariableValue = process.env[envVariableName];
  if (!envVariableValue) {
    throw new Error(
      `Environment variable ${envVariableName} is not set. Please check your environment file.`
    );
  }
  return envVariableValue;
}

export const BASE_URL = requireEnvVariable('BASE_URL');
export const SDK_API_URL = requireEnvVariable('SDK_API_URL');
export const API_E2E_ACCESS_TOKEN_ADMIN = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_ADMIN'
);
export const SUPER_ADMIN_ACCESS_TOKEN = requireEnvVariable(
  'SUPER_ADMIN_ACCESS_TOKEN'
);
export const API_E2E_APP_ID = requireEnvVariable('API_E2E_APP_ID');
export const API_E2E_ACCESS_TOKEN_SDK = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_SDK'
);
