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
import {
  parseJsonResponse,
  validateStatusCode
} from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves all segments for the app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to a list of segments with metadata
 */
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

/**
 * Retrieves all users in a specific segment.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentId - ID of the segment
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to a list of users in the segment with metadata
 */
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

/**
 * Retrieves a single segment by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentId - ID of the segment to retrieve
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the segment details
 */
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

/**
 * Retrieves total audience count for segments with retry logic.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param expectedTotalAudience - Optional expected total audience count for validation
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the total audience response
 */
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
    const responseJson =
      await parseJsonResponse<SegmentTotalAudienceResponse>(response);

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expectedTotalAudience !== undefined &&
      expect(responseJson).toHaveProperty(
        'total_audience',
        expectedTotalAudience
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return await parseJsonResponse<SegmentTotalAudienceResponse>(response!);
}

/**
 * Gets the user count for a segment matching a specific alias.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param alias - User alias to match
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with user count
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('users_count');

  return response;
}

/**
 * Estimates the user count range (min/max) for given segment IDs.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentsIds - Comma-separated segment IDs to estimate
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with min/max estimates
 */
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

/**
 * Creates a new segment with the provided payload.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - Segment creation payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('segment');
  expect(responseJson.segment).toHaveProperty('name', payload.name);
  expect(responseJson.segment).toHaveProperty('groups');

  return response;
}

/**
 * Updates an existing segment by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentsIds - ID of the segment to update
 * @param payload - Segment update payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('name', payload.name);
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('cached_users_count');

  return response;
}

/**
 * Duplicates an existing segment by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentsIds - ID of the segment to duplicate
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with duplicated segment
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('cached_users_count');

  return response;
}

/**
 * Creates a segment from a CSV file containing user aliases.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param segmentName - Name for the new segment
 * @param customTag - Custom tag for the segment
 * @param aliases - Array of user aliases to include in the segment
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

/**
 * Deletes multiple segments in a single batch operation.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param resourceIds - Array of segment IDs to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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
