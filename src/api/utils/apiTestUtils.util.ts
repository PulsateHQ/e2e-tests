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
import { APIRequestContext, APIResponse, test } from '@playwright/test';
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

export async function deleteAllUsers(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await test.step('Deleting all users', async () => {
    const getUsersResponse = await getUsersWithApi(request, token);
    const getUsersResponseJson = await getUsersResponse.json();
    const initialUserCount = getUsersResponseJson.data.length;

    for (const user of getUsersResponseJson.data) {
      await deleteUserWithApi(request, token, user.id);
    }

    const getUsersResponseAfterDeletion = await getUsersWithApi(request, token);
    const getUsersResponseJsonAfterDeletion =
      await getUsersResponseAfterDeletion.json();
    const finalUserCount = getUsersResponseJsonAfterDeletion.data.length;

    expect(getUsersResponseAfterDeletion.status()).toBe(200);
    expect(finalUserCount).toBe(0);

    await test.step(`Deleted ${initialUserCount} users, ${finalUserCount} remaining.`, async () => {});
  });
}

export async function deleteAllSegments(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await test.step('Deleting all segments', async () => {
    const getSegmentsResponse = await getSegmentsWithApi(request, token);
    const getSegmentsResponseJson = await getSegmentsResponse.json();
    const initialSegmentCount = getSegmentsResponseJson.data.length;

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
    const finalSegmentCount = getSegmentsResponseJsonAfterDeletion.data.length;

    expect(getSegmentsResponseAfterDeletion.status()).toBe(200);
    expect(finalSegmentCount).toBe(0);

    await test.step(`Deleted ${initialSegmentCount} segments, ${finalSegmentCount} remaining.`, async () => {});
  });
}

export async function deleteAllCampaigns(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await test.step('Deleting all campaigns', async () => {
    const getCampaignsResponse = await getCampaignsWithApi(request, token);
    const getCampaignsResponseJson = await getCampaignsResponse.json();
    const initialCampaignCount = getCampaignsResponseJson.data.length;

    await batchDeleteCampaignsWithApi(
      request,
      token,
      getCampaignsResponseJson.data.map(
        (campaign: { id: string }) => campaign.id
      )
    );

    const getCampaignsResponseAfterDeletion = await getCampaignsWithApi(
      request,
      token
    );
    const getCampaignsResponseJsonAfterDeletion =
      await getCampaignsResponseAfterDeletion.json();
    const finalCampaignCount =
      getCampaignsResponseJsonAfterDeletion.data.length;

    expect(getCampaignsResponseAfterDeletion.status()).toBe(200);
    expect(finalCampaignCount).toBe(0);

    await test.step(`Deleted ${initialCampaignCount} campaigns, ${finalCampaignCount} remaining.`, async () => {});
  });
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

function generateCsvContent(numberOfUsers: number): Buffer {
  let csvContent =
    'userAlias,emailAddress,firstName,lastName,smsPhoneNumber,currentCity,age,gender';

  for (let i = 0; i < numberOfUsers; i++) {
    const randomUser = generateRandomUser();
    csvContent += `\n${randomUser}`;
  }

  return Buffer.from(csvContent, 'utf-8');
}

export async function importRandomUsers(
  request: APIRequestContext,
  authToken: string,
  appId: string,
  numberOfUsers: number
): Promise<void> {
  await test.step(`Appending ${numberOfUsers} random users to CSV content`, async () => {
    const csvContent = generateCsvContent(numberOfUsers);
    await importUsersWithApi(request, authToken, { csvContent, app_id: appId });
  });
}
