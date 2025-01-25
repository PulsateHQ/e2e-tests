import {
  AdminDetailResponse,
  AdminListResponse,
  CompanyRegistrationRequest,
  CurrentAdminResponse,
  WhoAmIResponse
} from '../models/admin.model';
import { Headers } from '@_src/api/models/header.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function registerCompany(
  request: APIRequestContext,
  authToken: string,
  registrationData: CompanyRegistrationRequest
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const response = await request.post(apiUrls.admins.v2.register, {
    headers,
    data: registrationData
  });

  expect(response.status()).toBe(201);
  return response;
}

export async function getAllAdmins(
  request: APIRequestContext,
  authToken: string,
  appId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    Authorization: `Token token=${authToken}`
  };

  const response = await request.get(
    `${apiUrls.apps.v2.base}/${appId}/admins`,
    {
      headers
    }
  );

  const responseJson = (await response.json()) as AdminListResponse;

  // Validate response structure
  expect(response.status()).toBe(200);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');
  expect(Array.isArray(responseJson.data)).toBe(true);

  // Validate metadata structure
  expect(responseJson.metadata).toHaveProperty('page');
  expect(responseJson.metadata).toHaveProperty('per_page');
  expect(responseJson.metadata).toHaveProperty('total_pages');
  expect(responseJson.metadata).toHaveProperty('data_count');
  expect(typeof responseJson.metadata.page).toBe('number');
  expect(typeof responseJson.metadata.per_page).toBe('number');
  expect(typeof responseJson.metadata.total_pages).toBe('number');
  expect(typeof responseJson.metadata.data_count).toBe('number');

  // Validate each admin in the data array
  responseJson.data.forEach((admin) => {
    expect(admin).toHaveProperty('id');
    expect(admin).toHaveProperty('access');
    expect(admin).toHaveProperty('actions');
    expect(admin.actions).toHaveProperty('edit');
    expect(admin.actions).toHaveProperty('delete');
    expect(typeof admin.actions.edit).toBe('boolean');
    expect(typeof admin.actions.delete).toBe('boolean');

    expect(admin).toHaveProperty('avatar_url');
    expect(admin).toHaveProperty('email');
    expect(admin).toHaveProperty('job_title');
    expect(admin).toHaveProperty('managed_app');
    expect(admin.managed_app).toHaveProperty('name');
    expect(admin.managed_app).toHaveProperty('id');

    expect(admin).toHaveProperty('name');
    expect(admin).toHaveProperty('role');
    expect(admin).toHaveProperty('username');
    expect(admin).toHaveProperty('updated_at');
    expect(admin).toHaveProperty('created_at');
  });

  return response;
}

export async function getAdminById(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  adminId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    Authorization: `Token token=${authToken}`
  };

  const response = await request.get(
    `${apiUrls.apps.v2.base}/${appId}/admins/${adminId}`,
    {
      headers
    }
  );

  const responseJson = (await response.json()) as AdminDetailResponse;

  expect(response.status()).toBe(200);

  // Validate admin object properties
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('access');
  expect(responseJson).toHaveProperty('actions');
  expect(responseJson.actions).toHaveProperty('edit');
  expect(responseJson.actions).toHaveProperty('delete');
  expect(typeof responseJson.actions.edit).toBe('boolean');
  expect(typeof responseJson.actions.delete).toBe('boolean');

  expect(responseJson).toHaveProperty('avatar_url');
  expect(responseJson).toHaveProperty('email');
  expect(responseJson).toHaveProperty('job_title');
  expect(responseJson).toHaveProperty('managed_app');
  expect(responseJson.managed_app).toHaveProperty('name');
  expect(responseJson.managed_app).toHaveProperty('id');

  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('role');
  expect(responseJson).toHaveProperty('username');
  expect(responseJson).toHaveProperty('updated_at');
  expect(responseJson).toHaveProperty('created_at');

  return response;
}

export async function getWhoAmI(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    Authorization: `Token token=${authToken}`
  };

  const response = await request.get(apiUrls.admins.v2.whoami, {
    headers
  });

  const responseJson = (await response.json()) as WhoAmIResponse;

  expect(response.status()).toBe(200);
  expect(responseJson).toHaveProperty('success');
  expect(typeof responseJson.success).toBe('boolean');

  return response;
}

export async function getCurrentAdmin(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers: Headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Cookie: `user_token=${authToken}`
  };

  const response = await request.get(apiUrls.admins.v2.currentAdmin, {
    headers
  });

  const responseJson = (await response.json()) as CurrentAdminResponse;

  expect(response.status()).toBe(200);

  // Validate main structure
  expect(responseJson).toHaveProperty('admin');
  expect(responseJson).toHaveProperty('companies');
  expect(responseJson).toHaveProperty('current_app');
  expect(responseJson).toHaveProperty('info');
  expect(responseJson).toHaveProperty('unlayer_access_key');
  expect(responseJson).toHaveProperty('google_api_key');
  expect(responseJson).toHaveProperty('path');

  // Validate admin object
  const admin = responseJson.admin;
  expect(admin).toHaveProperty('admin_access_token');
  expect(admin).toHaveProperty('company_ids');
  expect(admin).toHaveProperty('created_at');
  expect(admin).toHaveProperty('email');
  expect(admin).toHaveProperty('front_end_access_token');
  expect(admin).toHaveProperty('hidden');
  expect(admin).toHaveProperty('name');
  expect(admin).toHaveProperty('provider');
  expect(admin).toHaveProperty('role');
  expect(admin).toHaveProperty('username');
  expect(admin).toHaveProperty('id');
  expect(admin).toHaveProperty('is_default_avatar');
  expect(admin).toHaveProperty('master_admin');

  // Validate companies array
  expect(Array.isArray(responseJson.companies)).toBe(true);
  responseJson.companies.forEach((company) => {
    expect(company).toHaveProperty('id');
    expect(company).toHaveProperty('name');
  });

  // Validate current_app
  expect(responseJson.current_app).toHaveProperty('id');
  expect(responseJson.current_app).toHaveProperty('type');
  expect(responseJson.current_app.type).toBe('app');

  // Validate date formats
  expect(new Date(admin.updated_at).toISOString()).toBe(admin.updated_at);
  expect(new Date(admin.created_at).toISOString()).toBe(admin.created_at);

  return response;
}
