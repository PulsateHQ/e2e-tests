import {
  AddResourcesToGroupPayload,
  CreateGroupPayload,
  UpdateGroupPayload
} from '../models/group.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { parseJsonResponse, validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllGroupsWithApi(
  request: APIRequestContext,
  authToken: string,
  options?: GetAllGroupsOptions,
  appId?: string
): Promise<GroupListResponse> {
  const { resourceType = 'segments', page = 1, perPage = 1000 } = options || {};

  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}?resource_type=${resourceType}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<GroupListResponse>(response);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');
  expect(responseJson.metadata).toMatchObject({
    page: expect.any(Number),
    per_page: expect.any(Number),
    total_pages: expect.any(Number),
    data_count: expect.any(Number)
  });

  return responseJson;
}

export async function getSingleGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string,
  appId?: string
): Promise<GroupResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}/${groupId}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<GroupResponse>(response);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('resource_type');
  expect(responseJson).toHaveProperty('created_at');

  return responseJson;
}

export async function createGroupForSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateGroupPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.groups.v2, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.group.name);
  expect(responseJson).toHaveProperty('resource_type', 'Mobile::App::Segment');
  expect(responseJson).toHaveProperty('created_at');

  return response;
}

export async function addResourcesToGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: AddResourcesToGroupPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}/add_resources`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  return response;
}

export async function updateGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string,
  payload: UpdateGroupPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}/${groupId}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('id', groupId);
  expect(responseJson).toHaveProperty('name', payload.group.name);
  expect(responseJson).toHaveProperty('resource_type', 'Mobile::App::Segment');
  expect(responseJson).toHaveProperty('created_at');

  return response;
}

export async function removeResourcesFromGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: {
    group_id: string;
    resource_ids: string[];
  },
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}/remove_resources`;

  const response = await request.delete(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  return response;
}

export async function deleteGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.groups.v2}/${groupId}`;

  const response = await request.delete(url, { headers });

  validateStatusCode(response, 200);

  return response;
}
