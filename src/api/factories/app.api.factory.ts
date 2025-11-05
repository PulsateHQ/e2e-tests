import {
  AppResponse,
  CreateAppRequest,
  DeleteAppRequest,
  GetAllAppsParams,
  SdkCredentialsResponse
} from '../models/app.model';
import { GetAllAppsResponse } from '../models/app.model';
import { apiUrls } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves all apps with optional query parameters.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param params - Optional query parameters for filtering
 * @returns Promise resolving to the API response with app list
 */
export async function getAllApps(
  request: APIRequestContext,
  authToken: string,
  params?: GetAllAppsParams
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  // Build query string from params
  const queryParams = new URLSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  params &&
    Object.entries(params).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      value && queryParams.append(key, value);
    });

  const queryString = queryParams.toString();
  const url = queryString
    ? `${apiUrls.apps.v2.base}?${queryString}`
    : apiUrls.apps.v2.base;

  const response = await request.get(url, {
    headers
  });

  validateStatusCode(response, 200);

  const responseJson = (await response.json()) as GetAllAppsResponse;

  // Validate response structure
  expect(responseJson).toHaveProperty('data');
  expect(Array.isArray(responseJson.data)).toBe(true);
  expect(responseJson).toHaveProperty('metadata');

  // Validate metadata structure
  expect(responseJson.metadata).toHaveProperty('page');
  expect(responseJson.metadata).toHaveProperty('per_page');
  expect(responseJson.metadata).toHaveProperty('total_pages');
  expect(responseJson.metadata).toHaveProperty('data_count');
  expect(typeof responseJson.metadata.page).toBe('number');
  expect(typeof responseJson.metadata.per_page).toBe('number');
  expect(typeof responseJson.metadata.total_pages).toBe('number');
  expect(typeof responseJson.metadata.data_count).toBe('number');

  // Validate each app in the data array
  responseJson.data.forEach((app) => {
    expect(app).toHaveProperty('id');
    expect(app).toHaveProperty('name');
  });

  return response;
}

/**
 * Creates a new app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param name - Name of the app to create
 * @returns Promise resolving to the API response with created app
 */
export async function createApp(
  request: APIRequestContext,
  authToken: string,
  name: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  // Create form data that matches CreateAppRequest interface
  const formData: Record<string, string> = {
    'app[name]': name,
    'app[setting_attributes][mode]': 'production'
  } satisfies CreateAppRequest;

  const response = await request.post(apiUrls.apps.v2.base, {
    headers,
    multipart: formData
  });

  validateStatusCode(response, 200);

  const responseJson = (await response.json()) as AppResponse;
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name');
  expect(responseJson.name).toBe(name);

  return response;
}

/**
 * Deletes an app by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - ID of the app to delete
 * @param name - App name for verification
 * @param password - Password for verification
 * @returns Promise resolving to the API response
 */
export async function deleteApp(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  name: string,
  password: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const deleteData: DeleteAppRequest = {
    name,
    password
  };

  const response = await request.delete(`${apiUrls.apps.v2.base}/${appId}`, {
    headers,
    data: JSON.stringify(deleteData)
  });

  validateStatusCode(response, 200);
  return response;
}

/**
 * Retrieves SDK credentials for an app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID to get credentials for
 * @returns Promise resolving to the API response with SDK credentials
 */
export async function getSdkCredentials(
  request: APIRequestContext,
  authToken: string,
  appId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = `${apiUrls.apps.v2.base}/${appId}/sdk_credentials`;

  const response = await request.get(url, {
    headers
  });

  validateStatusCode(response, 200);

  const responseJson = (await response.json()) as SdkCredentialsResponse;

  // Validate response structure
  expect(responseJson).toHaveProperty('app_id');
  expect(responseJson).toHaveProperty('app_key');
  expect(responseJson).toHaveProperty('access_token');
  expect(typeof responseJson.app_id).toBe('string');
  expect(typeof responseJson.app_key).toBe('string');
  expect(typeof responseJson.access_token).toBe('string');

  return response;
}
