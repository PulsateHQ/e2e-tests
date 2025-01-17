import { deleteGroupWithApi } from '../factories/groups.api.factory';
import { getAllGroupsWithApi } from '../factories/groups.api.factory';
import { CreateGroupPayload } from '../models/group.api.model';
import {
  batchDeleteCampaignsWithApi,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  batchDeleteSegmentsWithApi,
  getAllSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import {
  deleteUserWithApi,
  getAllUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { CustomAttribute } from '@_src/api/models/custom-attribute.api.model';
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
    const getSegmentsResponse = await getAllSegmentsWithApi(request, token);
    const getSegmentsResponseJson = await getSegmentsResponse.json();
    const initialSegmentCount = getSegmentsResponseJson.data.length;

    await batchDeleteSegmentsWithApi(
      request,
      token,
      getSegmentsResponseJson.data.map((segment: { id: string }) => segment.id)
    );

    const getSegmentsResponseAfterDeletion = await getAllSegmentsWithApi(
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

export async function deleteAllGroups(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await test.step('Deleting all groups', async () => {
    const getGroupsResponse = await getAllGroupsWithApi(request, token);
    const getGroupsResponseJson = await getGroupsResponse.json();
    const initialGroupCount = getGroupsResponseJson.data.length;

    for (const group of getGroupsResponseJson.data) {
      await deleteGroupWithApi(request, token, group.id);
    }

    const getGroupsResponseAfterDeletion = await getAllGroupsWithApi(
      request,
      token
    );
    const getGroupsResponseJsonAfterDeletion =
      await getGroupsResponseAfterDeletion.json();
    const finalGroupCount = getGroupsResponseJsonAfterDeletion.data.length;

    expect(getGroupsResponseAfterDeletion.status()).toBe(200);
    expect(finalGroupCount).toBe(0);

    await test.step(`Deleted ${initialGroupCount} groups, ${finalGroupCount} remaining.`, async () => {});
  });
}

function generateRandomUser(): string {
  const userAlias = faker.internet
    .username({ firstName: 'Piotr' })
    .replace(/\./g, '_');
  const emailAddress = faker.internet.email();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const smsPhoneNumber = faker.phone.number();
  const currentCity = faker.location.city();
  const age = faker.number.int({ min: 18, max: 80 });
  const gender = faker.person.sex();

  return `${userAlias},${emailAddress},${firstName},${lastName},${smsPhoneNumber},${currentCity},${age},${gender}`;
}

function generateCsvContentForUsersImport(numberOfUsers: number): Buffer {
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
    const csvContent = generateCsvContentForUsersImport(numberOfUsers);
    await importUsersWithApi(request, authToken, { csvContent, app_id: appId });
  });
}

export function getFreshUserPayload(): UserRequest {
  return {
    age: faker.number.int({ min: 18, max: 100 }),
    alias: faker.internet.username({ firstName: 'Piotr' }).replace(/\./g, '_'),
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

export function generateCsvContentForAliases(aliases: string[]): Buffer {
  let csvContent = 'User_Alias';
  for (const alias of aliases) {
    csvContent += `\n${alias}`;
  }
  return Buffer.from(csvContent, 'utf-8');
}

export function generateUniqueCustomTag(): string {
  return `custom_tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function generateCustomAttribute(
  overrides: Partial<CustomAttribute> = {}
): CustomAttribute {
  return {
    source:
      overrides.source ||
      faker.helpers.arrayElement(['cunexus', 'other_source']),
    product_id:
      overrides.product_id ||
      faker.helpers.arrayElement(['motor_loan', 'personal_loan', 'mortgage']),
    category:
      overrides.category ||
      faker.helpers.arrayElement(['loans', 'cards', 'investments']),
    name:
      overrides.name ||
      `${overrides.source || 'cunexus'}_${overrides.product_id || 'motor_loan'}`,
    value:
      overrides.value || faker.number.int({ min: 5000, max: 50000 }).toString()
  };
}

export function generateGroupPayloadSegments(): CreateGroupPayload {
  return {
    group: {
      name: faker.lorem.word(),
      resource_type: 'segments'
    }
  };
}
