import { Headers } from '@_src/api/models/headers.model';
import { SendGeofenceEventPayload } from '@_src/api/models/mobile.geofence.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function sendGeofenceEventWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: SendGeofenceEventPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.sdk.geofences.v2.sendGeofenceEvent}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.post(url, {
      headers,
      data: JSON.stringify(payload)
    });
    const expectedStatusCode = 200;

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
  }).toPass({ timeout: 20_000 });

  return response!;
}
