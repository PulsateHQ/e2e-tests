import { Headers } from '@_src/api/models/headers.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getCampaignStatsWithApi(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  expectedSend: number,
  expectedBackImpressions?: number,
  expectedBackButtonClicks?: number
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaigns.v2.combinedStats}/${campaignId}/stats`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody);

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);
    expect(responseJson).toHaveProperty('export_url');
    expect(responseJson).toHaveProperty('type');
    expect(responseJson).toHaveProperty('send', expectedSend);
    expect(responseJson.card.back.back_impression).toHaveProperty(
      'total_uniq',
      expectedBackImpressions
    );
    expect(responseJson.card.back.back_button_click_one).toHaveProperty(
      'total_uniq',
      expectedBackButtonClicks
    );
  }).toPass({ timeout: 30_000 });

  return response!;
}
