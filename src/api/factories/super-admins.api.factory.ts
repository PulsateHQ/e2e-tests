import {
  FeatureFlag,
  FeatureFlagsRequest
} from '@_src/api/models/feature-flag.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { featureFlagsTestData } from '@_src/api/test-data/feature-flags/feature-flag-default';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function superAdminsFeatureFLagDefaultBatchUpdate(
  request: APIRequestContext,
  authToken: string,
  appIds: string[]
): Promise<APIResponse> {
  const headers: Headers = {
    Cookie: `super_admin_token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.superAdminsFeatureFlagUrlV2}/batch_update`;

  const featureFlags: FeatureFlag[] = appIds.map((app_id) => ({
    app_id,
    flags: featureFlagsTestData.feature_flags[0].flags
  }));

  const payload: FeatureFlagsRequest = { feature_flags: featureFlags };

  const response = await request.put(url, {
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
