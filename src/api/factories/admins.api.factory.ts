import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

interface AdminRegistrationRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  activation_code: string;
  company_name: string;
  app_name: string;
  role: 'master_admin' | 'admin'; // Using union type for role to ensure type safety
  generate_admin_token?: boolean; // Optional parameter
}

export async function registerAdmin(
  request: APIRequestContext,
  registrationData: AdminRegistrationRequest
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.admins.v2.register}`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(registrationData)
  });

  const expectedStatusCode = 201;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}
