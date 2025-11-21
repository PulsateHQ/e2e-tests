import { getApiUrlsForApp } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export interface GetCampaignTemplatesOptions {
  sort?: string;
  order?: string;
  page?: number;
  perPage?: number;
}

/**
 * Retrieves a list of campaign templates for an app with optional filtering and pagination.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @param options - Optional query parameters for sorting, ordering, pagination.
 *                  Defaults: sort='created_at', order='desc', page=1, perPage=50
 * @returns Promise resolving to the API response
 */
export async function getCampaignTemplatesWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  options?: GetCampaignTemplatesOptions
): Promise<APIResponse> {
  const {
    sort = 'created_at',
    order = 'desc',
    page = 1,
    perPage = 50
  } = options || {};

  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.apps.v2.base}/${appId}/campaign_templates?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}
