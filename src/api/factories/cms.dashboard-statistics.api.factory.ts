import { getApiUrlsForApp } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves engagement dashboard statistics for an app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getDashboardEngagementStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.apps.v2.base}/${appId}/dashboard_statistics/engagement`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Retrieves analytics dashboard statistics for an app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getDashboardAnalyticsStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.apps.v2.base}/${appId}/dashboard_statistics/analytics`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

