import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves inbox messages for a user with expected total unread count.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param alias - User alias
 * @param expectedTotalUnread - Expected total unread messages count
 * @returns Promise resolving to the API response with inbox messages
 */
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

/**
 * Retrieves messages for a user, optionally filtered by campaign.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param alias - User alias
 * @param campaignGuid - Optional campaign GUID to filter messages
 * @returns Promise resolving to the API response with messages
 */
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

/**
 * Retrieves a specific inbox item by campaign GUID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignGuid - Campaign GUID to get inbox item for
 * @returns Promise resolving to the API response with inbox item
 */
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
