import { Headers } from '@_src/api/models/headers.api.model';
import { StartMobileSessionPayload } from '@_src/api/models/start-mobile-session.api.model';
import { UpdateMobileUserPayload } from '@_src/api/models/update-mobile-user.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function startMobileSessionWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: StartMobileSessionPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.startSessionUrlV4, {
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

export async function updateMobileUserWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: UpdateMobileUserPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.updateUserUrlV4, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
