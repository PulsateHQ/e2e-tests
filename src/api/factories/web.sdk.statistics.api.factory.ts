import {
  WebSdkStatisticsAction,
  WebSdkStatisticsPayload
} from '../models/web.sdk.statistics.model';
import { Headers } from '@_src/api/models/headers.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function createWebSdkStatistics(
  request: APIRequestContext,
  sdkAppId: string,
  sdkAppKey: string,
  alias: string,
  campaignGuid: string,
  action: WebSdkStatisticsAction
): Promise<APIResponse> {
  const payload: WebSdkStatisticsPayload = {
    alias,
    campaignGuid,
    key: action
  };

  return postWebSdkStatisticsWithApi(request, sdkAppId, sdkAppKey, payload);
}

export async function postWebSdkStatisticsWithApi(
  request: APIRequestContext,
  sdkAppId: string,
  sdkAppKey: string,
  payload: WebSdkStatisticsPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-key': `${sdkAppId}${sdkAppKey}`,
    source: 'native'
  };

  const response = await request.post(apiUrls.webSdk.v1.statistics, {
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
