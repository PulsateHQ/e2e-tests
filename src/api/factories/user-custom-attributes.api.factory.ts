import { CustomAttribute } from '../models/custom-attribute.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');

  return response;
}

export async function setUserCustomAttributesWithApi(
  request: APIRequestContext,
  authToken: string,
  userAlias: string,
  customAttributes: CustomAttribute[]
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.users.v2}/${userAlias}/custom_attributes`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify({ custom_attributes: customAttributes })
  });

  const expectedStatusCode = 201;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

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
  }
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.users.v2}/${userAlias}/custom_attributes`;

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
