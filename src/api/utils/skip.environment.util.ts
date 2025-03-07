import { BASE_URL } from '@_config/env.config';

function detectCurrentEnvironment(): string {
  if (process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT;
  }

  if (BASE_URL) {
    const environmentPatterns = ['tiger', 'lion', 'sealion'];

    for (const env of environmentPatterns) {
      if (BASE_URL.toLowerCase().includes(env.toLowerCase())) {
        return env;
      }
    }
  }

  const npmScript = process.env.npm_lifecycle_event;
  if (npmScript && npmScript.startsWith('test:')) {
    return npmScript.split(':')[1];
  }

  const envFileArg = process.argv.find((arg) => arg.includes('.env.'));
  if (envFileArg) {
    const match = envFileArg.match(/\.env\.([^/\\]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

const currentEnvironment = detectCurrentEnvironment();

export function isRunningInEnvironment(environments: string[]): boolean {
  if (!environments || environments.length === 0) {
    return true; // If no environments specified, always return true
  }

  const normalizedEnvironments = environments.map((env) => env.toLowerCase());
  const currentEnvLower = currentEnvironment.toLowerCase();

  return normalizedEnvironments.includes(currentEnvLower);
}

export function getCurrentEnvironment(): string {
  return currentEnvironment;
}
