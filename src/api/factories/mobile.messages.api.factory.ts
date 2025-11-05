import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getInboxMessagesWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  expectedTotalUnread: number
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = `${apiUrls.sdk.messages.v2.getInbox}?alias=${alias}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('categories');
    expect(responseJson).toHaveProperty('inbox_items');
    expect(responseJson).toHaveProperty('total_unread', expectedTotalUnread);
  }).toPass({ timeout: 60_000 });

  return response!;
}

export async function getMessagesWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  campaignGuid?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = `${apiUrls.sdk.messages.v2.getMessages}?alias=${alias}&campaign_guid=${campaignGuid}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('categories');
    expect(responseJson).toHaveProperty('inbox_items');
  }).toPass({ timeout: 60_000 });

  return response;
}

export async function getInboxItemWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignGuid: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = `${apiUrls.sdk.messages.v2.getInboxItem}?campaign_guid=${campaignGuid}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('categories');
    expect(responseJson).toHaveProperty('inbox_items');
  }).toPass({ timeout: 60_000 });

  return response;
}
