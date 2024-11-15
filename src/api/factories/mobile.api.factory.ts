import { CreateCampaignPayload } from '@_src/api/models/create-campaigns.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function startMobileSessionWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: Record<string, unknown>
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

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('session_id');

  return response;
}

export async function updateMobileUserWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: Record<string, unknown>
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

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('user_id');

  return response;
}
