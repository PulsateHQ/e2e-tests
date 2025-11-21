import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Pings the SDK API root endpoint.
 * @param request - Playwright API request context
 * @param authToken - SDK authentication token
 * @returns Promise resolving to the API response
 */
export async function getMobileRootPingWithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = apiUrls.sdk.health.root;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Pings the SDK API v1 ping endpoint.
 * @param request - Playwright API request context
 * @param authToken - SDK authentication token
 * @returns Promise resolving to the API response
 */
export async function getMobilePingV1WithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = apiUrls.sdk.health.v1Ping;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

/**
 * Checks the SDK API v2 health check endpoint.
 * @param request - Playwright API request context
 * @param authToken - SDK authentication token
 * @returns Promise resolving to the API response
 */
export async function getMobileHealthCheckV2WithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const url = apiUrls.sdk.health.v2HealthCheck;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);

  return response;
}

