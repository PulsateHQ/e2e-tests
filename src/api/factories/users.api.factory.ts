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
import {
  parseJsonResponse,
  validateStatusCode
} from '@_src/api/utils/response.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';
import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Retrieves a list of users with optional filtering and pagination.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param options - Optional query parameters for sorting, ordering, pagination, and app filtering
 * @returns Promise resolving to a list of users with metadata
 */
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

/**
 * Retrieves a single user by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user to retrieve
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

/**
 * Deletes a user by ID.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user to delete
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty(
    'success',
    'User has been deleted successfully'
  );

  return response;
}

/**
 * Unsubscribes a user from notifications.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user to unsubscribe
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty(
    'success',
    'User has been unsubscribed successfully'
  );

  return response;
}

/**
 * Updates a user's note.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user to update
 * @param noteContent - Content of the note to set
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('success', 'Note updated successfully');
  expect(responseJson).toHaveProperty('note', noteContent);

  return response;
}

/**
 * Retrieves all segments associated with a user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with user segments
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

/**
 * Retrieves geofence events for a user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param userId - ID of the user
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response with geofence events
 */
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

  validateStatusCode(response, 200);
  const responseJson = await response.json();
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

/**
 * Creates a new user.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - User creation payload
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);

  return response;
}

/**
 * Creates or updates a user (upsert operation).
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param payload - User payload for upsert
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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

  validateStatusCode(response, 200);

  return response;
}

/**
 * Uploads users via CSV file and optionally creates a segment.
 * @param request - Playwright API request context
 * @param authToken - Authentication token for API access
 * @param options - Configuration object with numberOfUsers, segmentName, and customTag
 * @param appId - Optional app ID for app-specific API endpoints
 * @returns Promise resolving to the API response
 */
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
