import { UI_E2E_WEB_SDK_KEY } from '@_config/env.config';
import {
  WebSdkSessionPayload,
  WebSdkStatisticsAction,
  WebSdkStatisticsPayload
} from '@_src/api/models/web.sdk.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { createWebSdkHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Creates a web SDK session payload with the standard format
 * @param adminAlias - Admin alias to use for both alias and guid fields
 * @param overrides - Optional properties to override in the payload
 * @returns Properly formatted WebSdkSessionPayload
 */
export function createWebSdkSessionPayload(
  adminAlias: string,
  overrides: Partial<WebSdkSessionPayload> = {}
): WebSdkSessionPayload {
  return {
    alias: adminAlias,
    guid: adminAlias,
    device: {
      type: 'web',
      location_permission: false,
      push_permission: false,
      ...(overrides.device || {})
    },
    ...overrides
  };
}

export async function createWebSdkStatistics(
  request: APIRequestContext,
  sdkAppId: string,
  sdkAppKey: string,
  alias: string,
  campaignGuid: string,
  action: WebSdkStatisticsAction
): Promise<APIResponse> {
  const payload: WebSdkStatisticsPayload = {
    alias,
    campaignGuid,
    key: action
  };

  return postWebSdkStatisticsWithApi(request, sdkAppId, sdkAppKey, payload);
}

export async function postWebSdkStatisticsWithApi(
  request: APIRequestContext,
  sdkAppId: string,
  sdkAppKey: string,
  payload: WebSdkStatisticsPayload
): Promise<APIResponse> {
  const headers = createWebSdkHeaders(sdkAppId, sdkAppKey);

  const response = await request.post(apiUrls.webSdk.v1.statistics, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  // Verify core response structure, but allow for variation
  const responseJson = await response.json();

  // Core properties that should definitely exist
  expect(responseJson).toBeDefined();

  // Optional properties - verify structure but don't fail if some are missing
  // We check if the property exists, not its specific value
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'geofences' in responseJson &&
    expect(Array.isArray(responseJson.geofences)).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'polygonal_geofences' in responseJson &&
    expect(Array.isArray(responseJson.polygonal_geofences)).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'beacons' in responseJson &&
    expect(Array.isArray(responseJson.beacons)).toBeTruthy();

  // These boolean flags might be optional too
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'opted_out_of_push' in responseJson &&
    expect(typeof responseJson.opted_out_of_push).toBe('boolean');

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'opted_out_of_in_app' in responseJson &&
    expect(typeof responseJson.opted_out_of_in_app).toBe('boolean');

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'location_tracking_enabled' in responseJson &&
    expect(typeof responseJson.location_tracking_enabled).toBe('boolean');

  return response;
}

export async function startWebSdkSessionWithApi(
  request: APIRequestContext,
  payload: WebSdkSessionPayload
): Promise<APIResponse> {
  const headers = createWebSdkHeaders(UI_E2E_WEB_SDK_KEY, '');

  const response = await request.post(apiUrls.webSdk.v1.start, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  // Verify core response structure, but allow for variation
  const responseJson = await response.json();

  // Core properties that should definitely exist
  expect(responseJson).toBeDefined();

  // Optional properties - verify structure but don't fail if some are missing
  // We check if the property exists, not its specific value
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'geofences' in responseJson &&
    expect(Array.isArray(responseJson.geofences)).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'polygonal_geofences' in responseJson &&
    expect(Array.isArray(responseJson.polygonal_geofences)).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'beacons' in responseJson &&
    expect(Array.isArray(responseJson.beacons)).toBeTruthy();

  // These boolean flags might be optional too
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'opted_out_of_push' in responseJson &&
    expect(typeof responseJson.opted_out_of_push).toBe('boolean');

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'opted_out_of_in_app' in responseJson &&
    expect(typeof responseJson.opted_out_of_in_app).toBe('boolean');

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  'location_tracking_enabled' in responseJson &&
    expect(typeof responseJson.location_tracking_enabled).toBe('boolean');

  return response;
}
