import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import { getSuperAdminCompaniesWithApi } from '@_src/api/factories/cms.super-admin.api.factory';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Super Admin Companies', () => {
  test('should return companies list', async ({ request }) => {
    const response = await getSuperAdminCompaniesWithApi(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );

    expect(response.status()).toBe(200);
  });
});
