import { CustomAttribute } from '../models/custom-attribute.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves custom attributes for a user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userAlias - User alias to get custom attributes for
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with custom attributes
 */
export async function getUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('data');

  return response;
}

/**
 * Sets custom attributes for a user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userAlias - User alias to set custom attributes for
 * @param customAttributes - Array of custom attributes to set
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function setUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  customAttributes: CustomAttribute[],
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify({ custom_attributes: customAttributes })
  });

  validateStatusCode(response, 201);

  return response;
}

/**
 * Deletes a specific custom attribute for a user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userAlias - User alias
 * @param params - Parameters identifying the custom attribute to delete (source, product_id, name)
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function deleteUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  params: {
    source: string;
    product_id: string;
    name: string;
  },
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.delete(url, {
    headers,
    data: params
  });

  validateStatusCode(response, 200);

  return response;
}
