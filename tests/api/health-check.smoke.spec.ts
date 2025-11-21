import {
  checkHealthWithApi,
  checkHealthWithTimeout
} from '@_src/api/factories/cms.health-check.api.factory';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Health Check Smoke Test', () => {
  test('should return OK when API is healthy', async ({ request }) => {
    const response = await checkHealthWithApi(request);
    expect(response.status()).toBe(200);
  });

  test('should respond within reasonable time', async ({ request }) => {
    const response = await checkHealthWithTimeout(request, 5000);
    expect(response.status()).toBe(200);
  });
});
