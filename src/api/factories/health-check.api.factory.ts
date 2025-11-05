import { apiUrls } from '@_src/api/utils/api.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function checkHealthWithApi(
  request: APIRequestContext
): Promise<APIResponse> {
  const headers = {
    Accept: 'text/plain'
  };

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(apiUrls.health.v1.check, { headers });
    const responseBody = await response.text();
    validateStatusCode(response, 200);
    expect(responseBody.trim()).toBe('OK');
  }).toPass({ timeout: 30_000 });

  return response!;
}

export async function checkHealthWithTimeout(
  request: APIRequestContext,
  timeoutMs: number = 5000
): Promise<APIResponse> {
  const headers = {
    Accept: 'text/plain'
  };

  let response: APIResponse;

  await expect(async () => {
    const startTime = Date.now();
    response = await request.get(apiUrls.health.v1.check, { headers });
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    const responseBody = await response.text();
    validateStatusCode(response, 200);
    expect(responseBody.trim()).toBe('OK');
    expect(
      responseTime,
      `Expected response time to be less than ${timeoutMs}ms, but got ${responseTime}ms`
    ).toBeLessThan(timeoutMs);
  }).toPass({ timeout: 30_000 });

  return response!;
}
