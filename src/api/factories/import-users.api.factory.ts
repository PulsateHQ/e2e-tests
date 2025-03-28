import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function importUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  { csvContent, app_id }: { csvContent: Buffer; app_id: string }
): Promise<APIResponse> {
  const response = await request.post(apiUrls.users.import, {
    headers: {
      Authorization: `Token token=${authToken}`,
      Accept: '*/*'
    },
    multipart: {
      file: {
        name: 'import.data.users.csv',
        mimeType: 'text/csv',
        buffer: csvContent
      },
      app_id
    }
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson.app_id).toBe(app_id);
  expect(responseJson.file).toBe('manual upload');

  return response;
}
