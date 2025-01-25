import {
  InviteAdminRequest,
  InviteAdminResponse
} from '@_src/api/models/admin-invite.model';
import { Headers } from '@_src/api/models/header.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function inviteAdmin(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  email: string,
  managedAppId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Token token=${authToken}`
  };

  const inviteData: InviteAdminRequest = {
    email,
    role: 'app_admin',
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

  expect(response.status()).toBe(201);

  const responseJson = (await response.json()) as InviteAdminResponse;

  // Validate response structure
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('email');
  expect(responseJson.email).toBe(email);
  expect(responseJson).toHaveProperty('role', 'app_admin');
  expect(responseJson).toHaveProperty('managed_app_id', managedAppId);
  expect(responseJson).toHaveProperty('allowed_actions', 'all');
  expect(responseJson).toHaveProperty('invite_token');
  expect(responseJson).toHaveProperty('created_at');
  expect(responseJson).toHaveProperty('updated_at');

  return response;
}
