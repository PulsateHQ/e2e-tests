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

export const BASE_URL = requireEnvVariable('BASE_URL');
export const USER_LOGIN_ADMIN = requireEnvVariable('USER_LOGIN_ADMIN');
export const USER_PASSWORD_ADMIN = requireEnvVariable('USER_PASSWORD_ADMIN');
