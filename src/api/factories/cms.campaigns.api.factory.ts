import {
  CampaignCreateResponse,
  CampaignDetailsResponse,
  CampaignListResponse,
  CreateCampaignPayload,
  GetCampaignsOptions
} from '@_src/api/models/campaign.model';
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
 * Retrieves a list of campaigns with optional filtering and pagination.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param options - Optional query parameters for sorting, ordering, pagination, and app filtering
 * @returns Promise resolving to a list of campaigns with metadata
 */
export async function getCampaignsWithApi(
  request: APIRequestContext,
  authToken: string,
  options?: GetCampaignsOptions
): Promise<CampaignListResponse> {
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
  const responseJson = await parseJsonResponse<CampaignListResponse>(response);

  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');

  return responseJson;
}

/**
 * Creates a new campaign with the provided payload.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - Campaign creation payload containing campaign details
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the created campaign response
 */
export async function createCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateCampaignPayload,
  appId?: string
): Promise<CampaignCreateResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(urls.campaigns.v2.base, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 201);
  const responseJson =
    await parseJsonResponse<CampaignCreateResponse>(response);

  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('name', payload.name);

  return responseJson;
}

/**
 * Deletes a campaign by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

/**
 * Deletes multiple campaigns in a single batch operation.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param resourceIds - Array of campaign IDs to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

/**
 * Retrieves campaign details by ID with retry logic until the expected status is reached.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign to retrieve
 * @param expectedStatusCampaign - Expected status value to wait for (e.g., 'Delivered')
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the campaign details response
 */
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
    const responseJson =
      await parseJsonResponse<CampaignDetailsResponse>(response);

    expect(responseJson).toHaveProperty('id');
    expect(responseJson).toHaveProperty('name');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('status', expectedStatusCampaign);
  }).toPass({ timeout: 60_000 });

  return await parseJsonResponse<CampaignDetailsResponse>(response!);
}

/**
 * Retrieves campaign preview by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @param campaignId - ID of the campaign to preview
 * @returns Promise resolving to the API response
 */
export async function getCampaignPreviewWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  campaignId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.campaigns.v2.base}/${campaignId}/preview`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Retrieves campaign goals by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @param campaignId - ID of the campaign to get goals for
 * @returns Promise resolving to the API response
 */
export async function getCampaignGoalsWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  campaignId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.campaigns.v2.base}/${campaignId}/goals`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Duplicates a campaign by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @param campaignId - ID of the campaign to duplicate
 * @returns Promise resolving to the API response
 */
export async function duplicateCampaignWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  campaignId: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.campaigns.v2.base}/${campaignId}/duplicate`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Retrieves unified campaign list with optional filtering and pagination.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID for app-specific API endpoints
 * @param options - Optional query parameters for sorting, ordering, pagination
 * @returns Promise resolving to the API response
 */
export async function getUnifiedCampaignListWithApi(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  options?: GetCampaignsOptions
): Promise<APIResponse> {
  const {
    sort = 'created_at',
    order = 'desc',
    page = 1,
    perPage = 50
  } = options || {};

  const headers = createAuthHeaders(authToken);

  const urls = getApiUrlsForApp(appId);
  const url = `${urls.campaigns.v2.base}/unified_list?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}
