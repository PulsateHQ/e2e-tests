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
import { parseJsonResponse, validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

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
