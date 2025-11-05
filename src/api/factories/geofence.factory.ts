import {
  BatchDestroyGeofencePayload,
  GeofenceListResponse,
  GeofencePayload,
  GeofenceResponse,
  UpdateGeofencePayload
} from '@_src/api/models/geofence.model';
import { Headers } from '@_src/api/models/headers.model';
import { geofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function listGeofencesWithApi(
  request: APIRequestContext,
  authToken: string,
  page = 1,
  perPage = 1000,
  order = 'desc',
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}?page=${page}&per_page=${perPage}&order=${order}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson: GeofenceListResponse = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
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

  return response;
}

export async function createGeofenceWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: GeofencePayload = geofencePayload,
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 201;

  const responseJson: GeofenceResponse = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
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

export async function updateGeofenceWithApi(
  request: APIRequestContext,
  authToken: string,
  geofenceId: string,
  payload: UpdateGeofencePayload,
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}/${geofenceId}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson: GeofenceResponse = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
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

export async function batchDestroyGeofencesWithApi(
  request: APIRequestContext,
  authToken: string,
  resourceIds: string[],
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const payload: BatchDestroyGeofencePayload = {
    resource_ids: resourceIds
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.geofences.v2}/batch_destroy`;

  const response = await request.delete(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toEqual({});

  return response;
}
