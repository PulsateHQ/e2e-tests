import { UpdateMobileUserPayload } from '@_src/api/models/mobile.users.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeadersWithJson } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function updateMobileUserWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: UpdateMobileUserPayload
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const response = await request.post(apiUrls.sdk.users.v4.update, {
    headers,
    data: JSON.stringify(payload)
  });

  validateStatusCode(response, 200);

  return response;
}
