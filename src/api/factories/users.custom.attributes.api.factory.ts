import { CustomAttribute } from '../models/custom-attribute.model';
import { Headers } from '@_src/api/models/headers.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('data');

  return response;
}

export async function setUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  customAttributes: CustomAttribute[],
  appId?: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify({ custom_attributes: customAttributes })
  });

  validateStatusCode(response, 201);

  return response;
}

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
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.delete(url, {
    headers,
    data: params
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
