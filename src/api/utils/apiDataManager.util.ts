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
  getAllUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { UserRequest } from '@_src/api/models/user.api.model';
import { userRequestPayload } from '@_src/api/test-data/user-payload/create-users';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';
import { APIRequestContext, test } from '@playwright/test';

export async function deleteAllUsers(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await test.step('Deleting all users', async () => {
    const getUsersResponse = await getAllUsersWithApi(request, token);
    const getUsersResponseJson = await getUsersResponse.json();
    const initialUserCount = getUsersResponseJson.data.length;

    for (const user of getUsersResponseJson.data) {
      await deleteUserWithApi(request, token, user.id);
    }

    const getUsersResponseAfterDeletion = await getAllUsersWithApi(
      request,
      token
    );
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

export function getFreshUserPayload(): UserRequest {
  return {
    age: faker.number.int({ min: 18, max: 100 }),
    alias: faker.internet.username({ firstName: 'Piotr' }),
    current_city: faker.location.city(),
    current_country: faker.location.country(),
    current_location: [faker.location.longitude(), faker.location.latitude()],
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: 'man',
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    device: {
      ...userRequestPayload.device,
      guid: faker.string.uuid()
    },
    custom_tags: userRequestPayload.custom_tags
  };
}
