import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import { getEventsWithApi } from '@_src/api/factories/cms.events.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Events', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );
  });

  test('should return events list', async ({
    request
  }) => {
    const response = await getEventsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(response.status()).toBe(200);
  });
});

