import { Headers } from '@_src/api/models/headers.model';
import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function startMobileSessionsWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: StartMobileSessionPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.sdk.sessions.v4.start, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 201;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
