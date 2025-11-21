import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves mobile app localization strings.
 * @param request - Playwright API request context
 * @param authToken - SDK authentication token
 * @returns Promise resolving to the API response
 */
export async function getMobileLocalizationsDataWithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = apiUrls.sdk.localizations.v4.data;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

