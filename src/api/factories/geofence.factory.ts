import {
  BatchDestroyGeofencePayload,
  GeofenceListResponse,
  GeofencePayload,
  GeofenceResponse,
  UpdateGeofencePayload
} from '@_src/api/models/geofence.model';
import { geofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
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
 * Lists all geofences with pagination and ordering options.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param page - Page number (default: 1)
 * @param perPage - Number of items per page (default: 1000)
 * @param order - Sort order: 'asc' or 'desc' (default: 'desc')
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to a list of geofences with metadata
 */
export async function listGeofencesWithApi(
  request: APIRequestContext,
  authToken: string,
  page = 1,
  perPage = 1000,
  order = 'desc',
  appId?: string
): Promise<GeofenceListResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}?page=${page}&per_page=${perPage}&order=${order}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<GeofenceListResponse>(response);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');
  expect(responseJson.bulk_actions).toHaveProperty('delete');
  expect(responseJson.bulk_actions).toHaveProperty('add_to_group');
  expect(responseJson.bulk_actions).toHaveProperty('remove_from_group');
  expect(responseJson.metadata).toHaveProperty('page', page);
  expect(responseJson.metadata).toHaveProperty('per_page', perPage);
  expect(responseJson.metadata).toHaveProperty('total_pages');
  expect(responseJson.metadata).toHaveProperty('data_count');
  expect(responseJson.metadata).toHaveProperty('groups');
  expect(responseJson.metadata).toHaveProperty('location');
  expect(responseJson.metadata).toHaveProperty('min_radius');
  expect(responseJson.metadata).toHaveProperty('max_radius');
  expect(responseJson.metadata).toHaveProperty('export_link');

  return responseJson;
}

/**
 * Creates a new geofence.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - Geofence creation payload (defaults to generated payload if not provided)
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function createGeofenceWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: GeofencePayload = geofencePayload(),
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 201);
  const responseJson = await parseJsonResponse<GeofenceResponse>(response);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.name);
  expect(responseJson).toHaveProperty('location', payload.location);
  expect(responseJson).toHaveProperty('shape', payload.shape);
  expect(responseJson).toHaveProperty('radius', Number(payload.radius));
  expect(responseJson).toHaveProperty('radius_unit', 'feet');
  expect(responseJson).toHaveProperty('groups', payload.groups);
  expect(responseJson).toHaveProperty('type', 'enter');

  return response;
}

/**
 * Updates an existing geofence by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param geofenceId - ID of the geofence to update
 * @param payload - Geofence update payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function updateGeofenceWithApi(
  request: APIRequestContext,
  authToken: string,
  geofenceId: string,
  payload: UpdateGeofencePayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}/${geofenceId}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = (await response.json()) as GeofenceResponse;
  expect(responseJson).toHaveProperty('id', payload.id);
  expect(responseJson).toHaveProperty('name', payload.name);
  expect(responseJson).toHaveProperty('location', payload.location);
  expect(responseJson).toHaveProperty('shape', payload.shape);
  expect(responseJson).toHaveProperty('radius', Number(payload.radius));
  expect(responseJson).toHaveProperty('radius_unit', payload.radius_unit);
  expect(responseJson).toHaveProperty('groups', payload.groups);
  expect(responseJson).toHaveProperty('type', payload.type);
  expect(responseJson).toHaveProperty('guid', payload.guid);

  return response;
}

/**
 * Deletes multiple geofences in a single batch operation.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param resourceIds - Array of geofence IDs to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function batchDestroyGeofencesWithApi(
  request: APIRequestContext,
  authToken: string,
  resourceIds: string[],
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const payload: BatchDestroyGeofencePayload = {
    resource_ids: resourceIds
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}/batch_destroy`;

  const response = await request.delete(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();

  expect(responseJson).toEqual({});

  return response;
}
