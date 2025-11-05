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
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody);

    // Basic validations
    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    options &&
      validateStatWhenProvided(
        responseJson.card.front.front_button_click_two,
        options.frontButtonClickTwo
      );
  }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000, 5000] });

  return response!;
}
