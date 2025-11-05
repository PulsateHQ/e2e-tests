import {
  FeatureFlag,
  FeatureFlagsRequest
} from '@_src/api/models/feature-flag.model';
import { featureFlagsDefault } from '@_src/api/test-data/cms/feature-flags/default.payload';
import { apiUrls } from '@_src/api/utils/api.util';
import { createSuperAdminHeadersWithJson } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function superAdminsFeatureFLagDefaultBatchUpdate(
  request: APIRequestContext,
  authToken: string,
  appIds: string[]
): Promise<APIResponse> {
  const headers = createSuperAdminHeadersWithJson(authToken);

  const url = `${apiUrls.superAdmins.v2.base}/feature_flags/batch_update`;

  const featureFlags: FeatureFlag[] = appIds.map((app_id) => ({
    app_id,
    flags: featureFlagsDefault().feature_flags[0].flags
  }));

  const payload: FeatureFlagsRequest = { feature_flags: featureFlags };

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  return response;
}

export async function superAdminsActivationCodesCreate(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers = createSuperAdminHeadersWithJson(authToken);

  const url = `${apiUrls.superAdmins.v2.base}/activation_codes`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify({})
  });

  validateStatusCode(response, 201);

  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('activation_code');
  expect(typeof responseBody.activation_code).toBe('string');

  return response;
}
