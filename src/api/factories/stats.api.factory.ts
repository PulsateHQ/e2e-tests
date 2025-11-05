import {
  BackCardStatsValidationOptions,
  CardStatsValidationOptions,
  InAppCardStatsValidationOptions,
  InAppStatsValidationOptions
} from '@_src/api/models/campaign.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Validates a stat value when provided (non-undefined)
 * This allows conditional validation without explicit if statements in the calling code
 */
function validateStatWhenProvided(
  actualValue: { total_uniq: number },
  expectedValue: number | undefined
): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  expectedValue !== undefined &&
    expect(actualValue).toHaveProperty('total_uniq', expectedValue);
}

/**
 * Retrieves In-App campaign statistics with retry logic for eventual consistency.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign
 * @param expectedSend - Expected number of sends
 * @param options - Optional validation options for In-App stats
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getInAppCampaignStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedSend: number,
  options?: InAppStatsValidationOptions,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.combinedStats}/${campaignId}/stats`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('export_url');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('send', expectedSend);

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.in_app.clicks,
        options.inAppButtonClick
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return response!;
}

/**
 * Retrieves card campaign statistics with retry logic for eventual consistency.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign
 * @param expectedSend - Expected number of sends
 * @param options - Optional validation options for card stats
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getCardCampaignStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedSend: number,
  options?: CardStatsValidationOptions,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.combinedStats}/${campaignId}/stats`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('export_url');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('send', expectedSend);

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.clicks,
        options.cardButtonClick
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.front.front_impression,
        options.frontImpression
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.front.front_button_click_one,
        options.frontButtonClickOne
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return response!;
}

/**
 * Retrieves In-App and Card combined campaign statistics with retry logic.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign
 * @param expectedSend - Expected number of sends
 * @param options - Optional validation options for In-App and Card stats
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getInAppCardCampaignStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedSend: number,
  options?: InAppCardStatsValidationOptions,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.combinedStats}/${campaignId}/stats`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);
    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('export_url');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('send', expectedSend);

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.in_app.clicks,
        options.inAppButtonClick
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.clicks,
        options.cardButtonClick
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.front.front_impression,
        options.frontImpression
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return response!;
}

/**
 * Retrieves back card campaign statistics with retry logic for eventual consistency.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param campaignId - ID of the campaign
 * @param expectedSend - Expected number of sends
 * @param expectedBackImpressions - Expected number of back card impressions
 * @param options - Optional validation options for back and front card stats
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
export async function getCampaignBackCardStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedSend: number,
  expectedBackImpressions: number,
  options?: BackCardStatsValidationOptions,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.campaigns.v2.combinedStats}/${campaignId}/stats`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    validateStatusCode(response, 200);

    const responseJson = await response.json();
    expect(responseJson).toHaveProperty('export_url');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('send', expectedSend);

    // Back card specific validations (required)
    expect(responseJson.card.back.back_impression).toHaveProperty(
      'total_uniq',
      expectedBackImpressions
    );

    // Validate optional stats - validate all provided options
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.back.back_button_click_one,
        options.backButtonClicksOne
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.back.back_button_click_two,
        options.backButtonClicksTwo
      );
    // Validate optional front stats - these need retry logic for eventual consistency
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options?.frontImpression !== undefined &&
      expect(responseJson.card.front.front_impression).toHaveProperty(
        'total_uniq',
        options.frontImpression
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options?.frontButtonClickOne !== undefined &&
      expect(responseJson.card.front.front_button_click_one).toHaveProperty(
        'total_uniq',
        options.frontButtonClickOne
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options?.frontButtonClickTwo !== undefined &&
      expect(responseJson.card.front.front_button_click_two).toHaveProperty(
        'total_uniq',
        options.frontButtonClickTwo
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return response!;
}
