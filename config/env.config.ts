import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({
  path: path.resolve(__dirname, envFile),
  override: true
});

function requireEnvVariable(envVariableName: string): string {
  const envVariableValue = process.env[envVariableName];
  if (envVariableValue === undefined) {
    throw new Error(`Environment variable ${envVariableName} is not set.`);
  }
  return envVariableValue;
}

export const SDK_API_URL = requireEnvVariable('SDK_API_URL');
export const API_E2E_ACCESS_TOKEN_ADMIN = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_ADMIN'
);
export const API_E2E_APP_ID = requireEnvVariable('API_E2E_APP_ID');
export const API_E2E_ACCESS_TOKEN_SDK = requireEnvVariable(
  'API_E2E_ACCESS_TOKEN_SDK'
);
