import {
  batchDeleteCampaignsWithApi,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  batchDeleteSegmentsWithApi,
  getSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import {
  deleteUserWithApi,
  getUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';
import { APIRequestContext, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function getCampaignCombinedStatsWithWait(
  request: APIRequestContext,
  authToken: string,
  campaignId: string,
  maxRetries = 10,
  delay = 2000
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.campaignsUrlV2}/${campaignId}/combined_stats`;

  for (let i = 0; i < maxRetries; i++) {
    const response = await request.get(url, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody);

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);

    if (responseJson.send === 1) {
      expect(responseJson).toHaveProperty('export_url');
      expect(responseJson).toHaveProperty('type');
      expect(responseJson).toHaveProperty('send');
      expect(responseJson).toHaveProperty('sdk');
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(
    'Campaign stats did not reach the expected values within the timeout period'
  );
}

// Utility function to delete all users
export async function deleteAllUsers(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const getUsersResponse = await getUsersWithApi(request, token);
  const getUsersResponseJson = await getUsersResponse.json();

  for (const user of getUsersResponseJson.data) {
    await deleteUserWithApi(request, token, user.id);
  }

  const getUsersResponseAfterDeletion = await getUsersWithApi(request, token);
  const getUsersResponseJsonAfterDeletion =
    await getUsersResponseAfterDeletion.json();
  expect(getUsersResponseAfterDeletion.status()).toBe(200);
  expect(getUsersResponseJsonAfterDeletion.data.length).toBe(0);
}

// Utility function to delete all segments
export async function deleteAllSegments(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const getSegmentsResponse = await getSegmentsWithApi(request, token);
  const getSegmentsResponseJson = await getSegmentsResponse.json();

  await batchDeleteSegmentsWithApi(
    request,
    token,
    getSegmentsResponseJson.data.map((segment: { id: string }) => segment.id)
  );

  const getSegmentsResponseAfterDeletion = await getSegmentsWithApi(
    request,
    token
  );
  const getSegmentsResponseJsonAfterDeletion =
    await getSegmentsResponseAfterDeletion.json();
  expect(getSegmentsResponseAfterDeletion.status()).toBe(200);
  expect(getSegmentsResponseJsonAfterDeletion.data.length).toBe(0);
}

export async function deleteAllCampaigns(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const getCampaignsResponse = await getCampaignsWithApi(request, token);
  const getCampaignsResponseJson = await getCampaignsResponse.json();

  await batchDeleteCampaignsWithApi(
    request,
    token,
    getCampaignsResponseJson.data.map((campaign: { id: string }) => campaign.id)
  );

  const getCampaignsResponseAfterDeletion = await getCampaignsWithApi(
    request,
    token
  );
  const getCampaignsResponseJsonAfterDeletion =
    await getCampaignsResponseAfterDeletion.json();
  expect(getCampaignsResponseAfterDeletion.status()).toBe(200);
  expect(getCampaignsResponseJsonAfterDeletion.data.length).toBe(0);
}

function generateRandomUser(): string {
  const userAlias = faker.internet.username();
  const emailAddress = faker.internet.email();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const smsPhoneNumber = faker.phone.number();
  const currentCity = faker.location.city();
  const age = faker.number.int({ min: 18, max: 80 });
  const gender = faker.person.sex();

  return `${userAlias},${emailAddress},${firstName},${lastName},${smsPhoneNumber},${currentCity},${age},${gender}`;
}

export function appendRandomUsersToCsv(
  filePath: string,
  numberOfUsers: number
): void {
  const csvFilePath = path.resolve(filePath);
  let csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  for (let i = 0; i < numberOfUsers; i++) {
    const randomUser = generateRandomUser();
    csvContent += `\n${randomUser}`;
  }

  fs.writeFileSync(csvFilePath, csvContent, 'utf-8');
}

export async function importRandomUsers(
  request: APIRequestContext,
  authToken: string,
  filePath: string,
  appId: string,
  numberOfUsers: number
): Promise<void> {
  appendRandomUsersToCsv(filePath, numberOfUsers);
  await importUsersWithApi(request, authToken, {
    file: filePath,
    app_id: appId
  });
}
