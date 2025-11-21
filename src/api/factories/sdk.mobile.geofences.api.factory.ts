import { SendGeofenceEventPayload } from '@_src/api/models/mobile.geofence.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeadersWithJson } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Sends a geofence event from mobile SDK with retry logic.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - Geofence event payload
 * @returns Promise resolving to the API response
 */
export async function sendGeofenceEventWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: SendGeofenceEventPayload
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const url = `${apiUrls.sdk.geofences.v2.sendGeofenceEvent}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.post(url, {
      headers,
      data: JSON.stringify(payload)
    });
    validateStatusCode(response, 200);
  }).toPass({ timeout: 20_000 });

  return response!;
}
