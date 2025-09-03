import { Headers } from '@_src/api/models/headers.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function createWebSdkStatisticsWithApi(
  request: APIRequestContext,
  authToken: string,
  statisticsData: any
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const response = await request.post(apiUrls.webSdk.v1.statistics, {
    headers,
    data: statisticsData
  });

  expect(response.status()).toBe(200);
  return response;
}

export async function getWebSdkStatisticsWithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const response = await request.get(apiUrls.webSdk.v1.statistics, {
    headers
  });

  expect(response.status()).toBe(200);
  return response;
}