import {
  AddResourcesToGroupPayload,
  CreateGroupPayload,
  UpdateGroupPayload
} from '../models/group.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllGroupsWithApi(
  request: APIRequestContext,
  authToken: string,
  options?: {
    resourceType?: string;
    page?: number;
    perPage?: number;
  }
): Promise<APIResponse> {
  const { resourceType = 'segments', page = 1, perPage = 1000 } = options || {};

  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}?resource_type=${resourceType}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');
  expect(responseJson.metadata).toMatchObject({
    page: expect.any(Number),
    per_page: expect.any(Number),
    total_pages: expect.any(Number),
    data_count: expect.any(Number)
  });

  return response;
}

export async function getSingleGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}/${groupId}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('resource_type');
  expect(responseJson).toHaveProperty('resource_ids');
  expect(responseJson).toHaveProperty('created_at');

  return response;
}

export async function createGroupForSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateGroupPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.groupsUrlV2, {
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
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.group.name);
  expect(responseJson).toHaveProperty('resource_type', 'Mobile::App::Segment');
  expect(responseJson).toHaveProperty('created_at');

  return response;
}

export async function addResourcesToGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: AddResourcesToGroupPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}/add_resources`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function updateGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string,
  payload: UpdateGroupPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}/${groupId}`;

  const response = await request.put(url, {
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
  }
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}/remove_resources`;

  const response = await request.delete(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function deleteGroupWithApi(
  request: APIRequestContext,
  authToken: string,
  groupId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.groupsUrlV2}/${groupId}`;

  const response = await request.delete(url, { headers });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
