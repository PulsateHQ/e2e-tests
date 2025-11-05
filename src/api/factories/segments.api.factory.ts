import {
  CreateSegmentPayload,
  SegmentListResponse,
  SegmentResponse,
  SegmentTotalAudienceResponse,
  SegmentUsersResponse
} from '@_src/api/models/segment.model';
import { generateCsvContentForAliases } from '@_src/api/test-data/cms/users/generate-user-aliases.payload';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { parseJsonResponse, validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllSegmentsWithApi(
  request: APIRequestContext,
  authToken: string,
  appId?: string
): Promise<SegmentListResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}?show=all`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<SegmentListResponse>(response);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');

  return responseJson;
}

export async function getSingleSegmentUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentId: string,
  appId?: string
): Promise<SegmentUsersResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/${segmentId}/users`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<SegmentUsersResponse>(response);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return responseJson;
}

export async function getSingleSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentId: string,
  appId?: string
): Promise<SegmentResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/${segmentId}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<SegmentResponse>(response);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('created_at');
  expect(responseJson).toHaveProperty('groups');

  return responseJson;
}

export async function getTotalAudienceForSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  expectedTotalAudience?: number,
  appId?: string
): Promise<SegmentTotalAudienceResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/total_audience`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await parseJsonResponse<SegmentTotalAudienceResponse>(response);

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expectedTotalAudience !== undefined &&
      expect(responseJson).toHaveProperty(
        'total_audience',
        expectedTotalAudience
      );
  }).toPass({ timeout: 60_000, intervals: [1000, 2000, 5000] });

  return await parseJsonResponse<SegmentTotalAudienceResponse>(response!);
}

export async function getUserCountForAlias(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/users_count`;

  const payload = {
    segment: {
      groups: [
        {
          join_type: '+',
          rules: [
            {
              type: 'alias',
              match_value: alias,
              match_type: 'equal'
            }
          ]
        }
      ]
    }
  };

  const response = await request.post(url, {
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
  expect(responseJson).toHaveProperty('users_count');

  return response;
}

export async function estimateSegmentsWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/estimate?segment_ids=${segmentsIds}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('max');
  expect(responseJson).toHaveProperty('min');

  return response;
}

export async function createSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateSegmentPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.segments.v2, {
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
  expect(responseJson).toHaveProperty('segment');
  expect(responseJson.segment).toHaveProperty('name', payload.name);
  expect(responseJson.segment).toHaveProperty('groups');

  return response;
}

export async function updateSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string,
  payload: CreateSegmentPayload,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/${segmentsIds}`;

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
  expect(responseJson).toHaveProperty('name', payload.name);
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('cached_users_count');

  return response;
}

export async function duplicateSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.segments.v2}/${segmentsIds}/duplicate`;

  const response = await request.post(url, {
    headers
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('cached_users_count');

  return response;
}

export async function createSegmentFromFile(
  request: APIRequestContext,
  authToken: string,
  segmentName: string,
  customTag: string,
  aliases: string[],
  appId?: string
): Promise<APIResponse> {
  const csvContent = generateCsvContentForAliases(aliases);

  const headers = createAuthHeaders(authToken, { accept: '*/*' });

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(`${urls.segments.v2}/create_from_file`, {
    headers,
    multipart: {
      file: {
        name: 'segment_file_with_aliases.csv',
        mimeType: 'text/csv',
        buffer: csvContent
      },
      segment_name: segmentName,
      custom_tag: customTag
    }
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('segment');
  expect(responseJson.segment).toBe(
    "Thank you for your submission. We are currently processing your list to create the segment. Processing large lists may require additional time. You will receive an email notification once the segment is ready. If you don't see the email, please check your spam or junk folder.<br /><br /><i>Please note: Users on the list who do not have online or mobile banking will be excluded from the segment.</i>"
  );

  return response;
}

export async function batchDeleteSegmentsWithApi(
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
  const response = await request.delete(`${urls.segments.v2}/batch_destroy`, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();

  expect(responseJson).toHaveProperty('resources_count');

  return response;
}
