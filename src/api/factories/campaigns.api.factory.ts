import {
  CampaignDetailsResponse,
  CreateCampaignPayload
} from '@_src/api/models/campaign.model';
import { Headers } from '@_src/api/models/headers.model';
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

  const url = `${apiUrls.campaigns.v2.base}?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

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

  const response = await request.post(apiUrls.campaigns.v2.base, {
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

  const url = `${apiUrls.campaigns.v2.base}/${campaignId}`;

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
    `${apiUrls.campaigns.v2.base}/batch_destroy`,
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

export async function getCampaignDetailsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedStatusCampaign: string
): Promise<CampaignDetailsResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaigns.v2.base}/${campaignId}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody) as CampaignDetailsResponse;

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
    expect(responseJson).toHaveProperty('id');
    expect(responseJson).toHaveProperty('name');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('status', expectedStatusCampaign);
  }).toPass({ timeout: 60_000 });

  return JSON.parse(await response.text()) as CampaignDetailsResponse;
}
