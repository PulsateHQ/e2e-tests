import {
  GetAllUsersOptions,
  UserListResponse,
  UserRequest,
  UserResponse
} from '@_src/api/models/user.model';
import { apiUrls, getApiUrlsForApp } from '@_src/api/utils/api.util';
import {
  createAuthHeaders,
  createAuthHeadersWithJson
} from '@_src/api/utils/headers.util';
import { parseJsonResponse, validateStatusCode } from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  options?: GetAllUsersOptions
): Promise<UserListResponse> {
  const {
    sort = 'created_at',
    order = 'desc',
    page = 1,
    perPage = 50,
    appId
  } = options || {};

  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}?sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<UserListResponse>(response);

  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return responseJson;
}

export async function getUserWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userId}`;

  const response = await request.get(url, { headers });

  validateStatusCode(response, 200);
  const responseJson = await parseJsonResponse<UserResponse>(response);
  expect(responseJson).toHaveProperty('id', userId);

  return response;
}

export async function deleteUserWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userId}`;

  const response = await request.delete(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty(
    'success',
    'User has been deleted successfully'
  );

  return response;
}

export async function unsubscribeUserWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const url = `${apiUrls.users.v2}/${userId}/unsubscribe`;

  const response = await request.patch(url, {
    headers,
    data: {}
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty(
    'success',
    'User has been unsubscribed successfully'
  );

  return response;
}

export async function updateUserNoteWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string,
  noteContent: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userId}/note`;

  const payload = {
    content: noteContent
  };

  const response = await request.patch(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('success', 'Note updated successfully');
  expect(responseJson).toHaveProperty('note', noteContent);

  return response;
}

export async function getUserSegmentsWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userId}/segments`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function getUserGeofenceEventsWithApi(
  request: APIRequestContext,
  authToken: string,
  userId: string,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v2}/${userId}/geofence_events`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function createUserWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: UserRequest,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v1}`;

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function upsertUserWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: UserRequest,
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeadersWithJson(authToken);

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const url = `${urls.users.v1}/upsert`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const expectedStatusCode = 200;

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);

  return response;
}

export async function uploadUsersWithSegmentCreationApi(
  request: APIRequestContext,
  authToken: string,
  {
    numberOfUsers,
    segmentName,
    customTag
  }: {
    numberOfUsers: number;
    segmentName: string;
    customTag: string;
  },
  appId?: string
): Promise<APIResponse> {
  const headers = createAuthHeaders(authToken, { accept: '*/*' });

  // Generate CSV content
  const csvRows = [
    'User_Alias,Email_Address,First_Name,Last_Name,SMS_Phone_Number,Current_City,Age,Gender'
  ];

  for (let i = 0; i < numberOfUsers; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    csvRows.push(
      `${faker.internet.username({ firstName: 'playwright' }).replace(/\./g, '_')},` +
        `${faker.internet.email()},` +
        `${firstName},` +
        `${lastName},` +
        `${faker.phone.number()},` +
        `${faker.location.city()},` +
        `${faker.number.int({ min: 18, max: 100 })},` +
        `${faker.helpers.arrayElement(['man', 'woman'])}`
    );
  }

  const csvContent = Buffer.from(csvRows.join('\n'));

  const urls = appId ? getApiUrlsForApp(appId) : apiUrls;
  const response = await request.post(`${urls.users.v2}/upload`, {
    headers,
    multipart: {
      file: {
        name: 'users_with_segment.csv',
        mimeType: 'text/csv',
        buffer: csvContent
      },
      create_segment: 'true',
      segment_name: segmentName,
      custom_tag: customTag
    }
  });

  validateStatusCode(response, 200);
  const responseJson = await response.json();

  expect(responseJson).toHaveProperty('upload');

  return response;
}
