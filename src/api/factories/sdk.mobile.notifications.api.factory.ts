import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves a card notification for a user and campaign.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param alias - User alias
 * @param campaignGuid - Campaign GUID to get card for
 * @returns Promise resolving to the API response with card details
 */
export async function getCardWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  campaignGuid: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = `${apiUrls.sdk.notifications.v4.card}?alias=${alias}&campaign_guid=${campaignGuid}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('guid');
    expect(responseJson).toHaveProperty('is_campaign_unread');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('campaign_guid');
    expect(responseJson).toHaveProperty('allow_reply');
    expect(responseJson).toHaveProperty('front');
    expect(responseJson).toHaveProperty('back');
    expect(responseJson).toHaveProperty('inbox_item_guid');
    expect(responseJson).toHaveProperty('last_interaction_at');
    expect(responseJson).toHaveProperty('expiry_at');
  }).toPass({ timeout: 20_000 });

  return response;
}

/**
 * Retrieves rendered notification content by type.
 * @param request - Playwright API request context
 * @param authToken - SDK authentication token
 * @param type - Notification type (e.g., 'card')
 * @returns Promise resolving to the API response
 */
export async function getMobileNotificationWithApi(
  request: APIRequestContext,
  authToken: string,
  type: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = apiUrls.sdk.notifications.v4.render(type);

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}
