import { CreateCampaignPayload } from '@_src/api/models/create-campaigns.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getCampaignsWithApi(
  request: APIRequestContext,
  authToken: string,
  options?: {
    sort?: string;
    order?: string;
    page?: number;
    perPage?: number;
  }
): Promise<APIResponse> {
  const {
    sort = 'created_at',
    order = 'desc',
    page = 1,
    perPage = 50
  } = options || {};

  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaignsUrlV2}?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function createCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateCampaignPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.campaignsUrlV2, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 201;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.name);

  return response;
}

export async function deleteCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaignsUrlV2}/${campaignId}`;

  const response = await request.delete(url, { headers });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function batchDeleteCampaignsWithApi(
  request: APIRequestContext,
  authToken: string,
  resourceIds: string[]
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const payload = {
    resource_ids: resourceIds
  };

  const response = await request.delete(
    `${apiUrls.campaignsUrlV2}/batch_destroy`,
    {
      headers,
      data: JSON.stringify(payload)
    }
  );

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function getCampaignCombinedStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaignsUrlV2}/${campaignId}/combined_stats`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('export_url');
  expect(responseJson).toHaveProperty('type');
  expect(responseJson).toHaveProperty('send');
  expect(responseJson).toHaveProperty('sdk');

  return response;
}
