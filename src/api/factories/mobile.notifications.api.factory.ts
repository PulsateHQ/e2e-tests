import { Headers } from '@_src/api/models/headers.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getCardWithApi(
  request: APIRequestContext,
  authToken: string,
  alias: string,
  campaignGuid: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.sdk.notifications.v4.card}?alias=${alias}&campaign_guid=${campaignGuid}`;

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
    expect(responseJson).toHaveProperty('categories');
    expect(responseJson).toHaveProperty('inbox_items');
  }).toPass({ timeout: 20_000 });

  return response;
}
