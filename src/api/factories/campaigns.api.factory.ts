import {
  CampaignDetailsResponse,
  CreateCampaignPayload
} from '@_src/api/models/campaign.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
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
    appId?: string;
  }
): Promise<APIResponse> {
  const {
    sort = 'created_at',
    order = 'desc',
    page = 1,
    perPage = 50,
    appId
  } = options || {};

  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.base}?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await response.json();

  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function createCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateCampaignPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.campaigns.v2.base, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 201);
  const responseJson = await response.json();

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.name);

  return response;
}

export async function deleteCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.base}/${campaignId}`;

  const response = await request.delete(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

export async function batchDeleteCampaignsWithApi(
  request: APIRequestContext,
  authToken: string,
  resourceIds: string[],
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const payload = {
    resource_ids: resourceIds
  };

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.delete(
    `${urls.campaigns.v2.base}/batch_destroy`,
    {
      headers,
      data: JSON.stringify(payload)
    }
  );

  validateStatusCode(response, 200);

  return response;
}

export async function getCampaignDetailsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedStatusCampaign: string,
  appId?: string
): Promise<CampaignDetailsResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.base}/${campaignId}`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = (await response.json()) as CampaignDetailsResponse;

    expect(responseJson).toHaveProperty('id');
    expect(responseJson).toHaveProperty('name');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('status', expectedStatusCampaign);
  }).toPass({ timeout: 60_000 });

  return (await response!.json()) as CampaignDetailsResponse;
}
