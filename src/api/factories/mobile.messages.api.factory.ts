import { Headers } from '@_src/api/models/headers.model';
import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { UpdateMobileUserPayload } from '@_src/api/models/mobile.users.model';
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

  const response = await request.post(apiUrls.sdk.users.v4.update, {
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

export async function getInboxMessagesWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  expectedTotalUnread: number
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.sdk.messages.v2.inbox}?alias=${alias}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody);

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
    expect(responseJson).toHaveProperty('categories');
    expect(responseJson).toHaveProperty('inbox_items');
    expect(responseJson).toHaveProperty('total_unread', expectedTotalUnread);
  }).toPass({ timeout: 20_000 });

  return response!;
}

export async function getMessagesWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  campaignGuid: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const response = await request.get(
    `${apiUrls.sdk.messages.v2}?alias=${alias}&campaign_guid=${campaignGuid}`,
    {
      headers
    }
  );

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
