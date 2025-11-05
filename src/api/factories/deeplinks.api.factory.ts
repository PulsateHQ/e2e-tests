import {
  DeeplinkListResponse,
  DeeplinkPayload,
  DeeplinkResponse
} from '../models/deeplink.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import {
  parseJsonResponse,
  validateStatusCode
} from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves all deeplinks for the app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to a list of deeplinks with metadata
 */
export async function getAllDeeplinksWithApi(
  request: APIRequestContext,
  authToken: string,
  appId?: string
): Promise<DeeplinkListResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<DeeplinkListResponse>(response);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return responseJson;
}

/**
 * Creates a new deeplink.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - Deeplink creation payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the created deeplink response
 */
export async function createDeeplinkWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: DeeplinkPayload,
  appId?: string
): Promise<DeeplinkResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.deeplinks.v2, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 201);
  const responseJson = await parseJsonResponse<DeeplinkResponse>(response);

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('nickname', payload.nickname);
  expect(responseJson).toHaveProperty('target', payload.target);
  expect(responseJson).toHaveProperty('created_at');

  return responseJson;
}

/**
 * Updates an existing deeplink by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param deeplinkId - ID of the deeplink to update
 * @param payload - Deeplink update payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the updated deeplink response
 */
export async function updateDeeplinkWithApi(
  request: APIRequestContext,
  authToken: string,
  deeplinkId: string,
  payload: DeeplinkPayload,
  appId?: string
): Promise<DeeplinkResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}/${deeplinkId}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<DeeplinkResponse>(response);

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('nickname', payload.nickname);
  expect(responseJson).toHaveProperty('target', payload.target);
  expect(responseJson).toHaveProperty('created_at');
  expect(responseJson).toHaveProperty('updated_at');

  return responseJson;
}

/**
 * Deletes one or more deeplinks by IDs.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param deeplinkIds - Array of deeplink IDs to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function deleteDeeplinksWithApi(
  request: APIRequestContext,
  authToken: string,
  deeplinkIds: string[],
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}/${deeplinkIds}`;

  const response = await request.delete(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

export async function createDeeplinkWithApiForUi(
  request: APIRequestContext,
  authToken: string,
  payload: DeeplinkPayload
): Promise<DeeplinkResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.deeplinks.ui, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 201;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('nickname', payload.nickname);
  expect(responseJson).toHaveProperty('target', payload.target);
  expect(responseJson).toHaveProperty('created_at');

  return responseJson;
}

export async function deleteDeeplinksWithApiForUi(
  request: APIRequestContext,
  authToken: string,
  deeplinkIds: string[]
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.deeplinks.ui}/${deeplinkIds}`;

  const response = await request.delete(url, { headers });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
