import { DeeplinkPayload, DeeplinkResponse } from '../models/deeplink.model';
import { Headers } from '@_src/api/models/headers.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllDeeplinksWithApi(
  request: APIRequestContext,
  authToken: string,
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await response.json();

  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function createDeeplinkWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: DeeplinkPayload,
  appId?: string
): Promise<DeeplinkResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.deeplinks.v2, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 201);
  const responseJson = (await response.json()) as DeeplinkResponse;

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('nickname', payload.nickname);
  expect(responseJson).toHaveProperty('target', payload.target);
  expect(responseJson).toHaveProperty('created_at');

  return responseJson;
}

export async function updateDeeplinkWithApi(
  request: APIRequestContext,
  authToken: string,
  deeplinkId: string,
  payload: DeeplinkPayload,
  appId?: string
): Promise<DeeplinkResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}/${deeplinkId}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = (await response.json()) as DeeplinkResponse;

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('nickname', payload.nickname);
  expect(responseJson).toHaveProperty('target', payload.target);
  expect(responseJson).toHaveProperty('created_at');
  expect(responseJson).toHaveProperty('updated_at');

  return responseJson;
}

export async function deleteDeeplinksWithApi(
  request: APIRequestContext,
  authToken: string,
  deeplinkIds: string[],
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.deeplinks.v2}/${deeplinkIds}`;

  const response = await request.delete(url, { headers });

  validateStatusCode(response, 200);

  return response;
}
