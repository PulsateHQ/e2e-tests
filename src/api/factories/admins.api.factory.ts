import { CompanyRegistrationRequest } from '../models/admin.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function registerCompany(
  request: APIRequestContext,
  registrationData: CompanyRegistrationRequest
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
