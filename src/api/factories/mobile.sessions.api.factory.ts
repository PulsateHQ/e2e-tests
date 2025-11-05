import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeadersWithJson } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function startMobileSessionsWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: StartMobileSessionPayload
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const url = `${apiUrls.sdk.sessions.v4.start}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.post(url, {
      headers,
      data: JSON.stringify(payload)
    });
    validateStatusCode(response, 201);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('geofences');
  }).toPass({ timeout: 20_000 });

  return response!;
}

export async function startMobileSessionsForGeofenceWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: StartMobileSessionPayload,
  geofenceName: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const url = `${apiUrls.sdk.sessions.v4.start}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.post(url, {
      headers,
      data: JSON.stringify(payload)
    });
    validateStatusCode(response, 201);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('geofences');

    const geofences = responseJson.geofences as Array<{ name: string }>;
    expect(
      geofences.some((geofence) => geofence.name === geofenceName),
      `Expected to find geofence with name: ${geofenceName}`
    ).toBeTruthy();
  }).toPass({ timeout: 30_000 });

  return response!;
}
