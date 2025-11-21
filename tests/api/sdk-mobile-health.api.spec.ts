import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import { getSdkCredentials } from '@_src/api/factories/cms.apps.api.factory';
import {
  getMobileHealthCheckV2WithApi,
  getMobilePingV1WithApi,
  getMobileRootPingWithApi
} from '@_src/api/factories/sdk.mobile.health.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('SDK Mobile Health Endpoints', () => {
  let APIE2ETokenSDKModel: APIE2ETokenSDKModel;
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );

    // Get SDK credentials using the new appId
    const sdkCredentialsResponse = await getSdkCredentials(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const sdkCredentials = await sdkCredentialsResponse.json();

    APIE2ETokenSDKModel = {
      apiE2EAccessTokenSdk: sdkCredentials.access_token
    };
  });

  test('SDK: should respond to root ping', async ({ request }) => {
    const response = await getMobileRootPingWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk
    );

    expect(response.status()).toBe(200);
  });

  test('SDK: should respond to v1 ping', async ({ request }) => {
    const response = await getMobilePingV1WithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk
    );

    expect(response.status()).toBe(200);
  });

  test('SDK: should pass v2 health check', async ({ request }) => {
    const response = await getMobileHealthCheckV2WithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk
    );

    expect(response.status()).toBe(200);
  });
});
