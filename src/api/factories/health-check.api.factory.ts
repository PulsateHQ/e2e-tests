import { Headers } from '@_src/api/models/headers.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function checkHealthWithApi(
  request: APIRequestContext
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'text/plain'
  };

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(apiUrls.health.v1.check, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
    expect(responseBody.trim()).toBe('OK');
  }).toPass({ timeout: 30_000 });

  return response!;
}

export async function checkHealthWithTimeout(
  request: APIRequestContext,
  timeoutMs: number = 5000
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'text/plain'
  };

  let response: APIResponse;

  await expect(async () => {
    const startTime = Date.now();
    response = await request.get(apiUrls.health.v1.check, { headers });
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
    expect(responseBody.trim()).toBe('OK');
    expect(
      responseTime,
      `Expected response time to be less than ${timeoutMs}ms, but got ${responseTime}ms`
    ).toBeLessThan(timeoutMs);
  }).toPass({ timeout: 30_000 });

  return response!;
}
