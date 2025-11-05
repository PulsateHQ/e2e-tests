import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeaders } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function importUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  { csvContent, app_id }: { csvContent: Buffer; app_id: string }
): Promise<APIResponse> {
  const response = await request.post(apiUrls.users.import, {
    headers: createAuthHeaders(authToken, { accept: '*/*' }),
    multipart: {
      file: {
        name: 'import.data.users.csv',
        mimeType: 'text/csv',
        buffer: csvContent
      },
      app_id
    }
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson.app_id).toBe(app_id);
  expect(responseJson.file).toBe('manual upload');

  return response;
}
