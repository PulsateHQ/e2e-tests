import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import {
  getDashboardAnalyticsStatsWithApi,
  getDashboardEngagementStatsWithApi
} from '@_src/api/factories/cms.dashboard-statistics.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Dashboard Statistics', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );
  });

  test('should return engagement statistics', async ({
    request
  }) => {
    const response = await getDashboardEngagementStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(response.status()).toBe(200);
  });

  test('should return analytics statistics', async ({
    request
  }) => {
    const response = await getDashboardAnalyticsStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(response.status()).toBe(200);
  });
});

