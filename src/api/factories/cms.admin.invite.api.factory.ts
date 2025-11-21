import {
  InviteAdminRequest,
  InviteAdminResponse
} from '@_src/api/models/invite.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { createAuthHeadersWithJson } from '@_src/api/utils/headers.util';
import { validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Invites a new admin to an app.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param appId - App ID to invite admin to
 * @param email - Email address of the admin to invite
 * @param managedAppId - Managed app ID
 * @param roleAdmin - Admin role to assign
 * @returns Promise resolving to the API response with invited admin details
 */
export async function inviteAdmin(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  email: string,
  managedAppId: string,
  roleAdmin: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const inviteData: InviteAdminRequest = {
    email,
    role: roleAdmin,
    managed_app_id: managedAppId,
    allowed_actions: 'all',
    skip_invinte_mail: true
  };

  const response = await request.post(
    `${apiUrls.apps.v2.base}/${appId}/admins/invite_admin`,
    {
      headers,
      data: JSON.stringify(inviteData)
    }
  );

  validateStatusCode(response, 200);

  const responseJson = (await response.json()) as InviteAdminResponse;

  // Validate response structure
  expect(responseJson).toHaveProperty('admin');
  expect(responseJson.admin).toHaveProperty('id');
  expect(responseJson.admin).toHaveProperty('email');
  expect(responseJson.admin.email).toBe(email);
  expect(responseJson.admin).toHaveProperty('role', roleAdmin);
  expect(responseJson.admin).toHaveProperty('managed_app');
  expect(responseJson.admin).toHaveProperty('actions');
  expect(responseJson.admin).toHaveProperty('invite_token');
  expect(responseJson.admin).toHaveProperty('created_at');
  expect(responseJson.admin).toHaveProperty('updated_at');
  expect(responseJson).toHaveProperty('message', 'Admin created successfully');

  return response;
}
