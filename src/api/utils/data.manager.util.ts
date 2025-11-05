import {
  deleteDeeplinksWithApi,
  getAllDeeplinksWithApi
} from '../factories/deeplinks.api.factory';
import { deleteGroupWithApi } from '../factories/groups.api.factory';
import { getAllGroupsWithApi } from '../factories/groups.api.factory';
import {
  batchDeleteCampaignsWithApi,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import {
  batchDestroyGeofencesWithApi,
  listGeofencesWithApi
} from '@_src/api/factories/geofence.factory';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  batchDeleteSegmentsWithApi,
  getAllSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import {
  deleteUserWithApi,
  getAllUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { generateCsvContentForUsersImport } from '@_src/api/test-data/cms/users/generate-random-users.payload';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, test } from '@playwright/test';

export async function deleteAllUsers(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all users', async () => {
    const getUsersResponseJson = await getAllUsersWithApi(request, token, {
      appId
    });
    const initialUserCount = getUsersResponseJson.data.length;

    for (const user of getUsersResponseJson.data) {
      await deleteUserWithApi(request, token, user.id, appId);
    }

    const getUsersResponseJsonAfterDeletion = await getAllUsersWithApi(
      request,
      token,
      { appId }
    );
    const finalUserCount = getUsersResponseJsonAfterDeletion.data.length;

    expect(finalUserCount).toBe(0);

    await test.step(`Deleted ${initialUserCount} users, ${finalUserCount} remaining.`, async () => {});
  });
}

export async function deleteAllSegments(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all segments', async () => {
    const getSegmentsResponseJson = await getAllSegmentsWithApi(
      request,
      token,
      appId
    );
    const initialSegmentCount = getSegmentsResponseJson.data.length;

    await batchDeleteSegmentsWithApi(
      request,
      token,
      getSegmentsResponseJson.data.map((segment: { id: string }) => segment.id),
      appId
    );

    const getSegmentsResponseJsonAfterDeletion = await getAllSegmentsWithApi(
      request,
      token,
      appId
    );
    const finalSegmentCount = getSegmentsResponseJsonAfterDeletion.data.length;

    expect(finalSegmentCount).toBe(0);

    await test.step(`Deleted ${initialSegmentCount} segments, ${finalSegmentCount} remaining.`, async () => {});
  });
}

export async function deleteAllGeofences(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all geofences', async () => {
    const getGeofencesResponseJson = await listGeofencesWithApi(request, token, 1, 1000, 'desc', appId);
    const initialGeofenceCount = getGeofencesResponseJson.data.length;

    await batchDestroyGeofencesWithApi(
      request,
      token,
      getGeofencesResponseJson.data.map(
        (geofence: { id: string }) => geofence.id
      ),
      appId
    );

    const getGeofencesResponseJsonAfterDeletion = await listGeofencesWithApi(
      request,
      token,
      1,
      1000,
      'desc',
      appId
    );
    const finalGeofenceCount =
      getGeofencesResponseJsonAfterDeletion.data.length;

    expect(finalGeofenceCount).toBe(0);

    await test.step(`Deleted ${initialGeofenceCount} geofences, ${finalGeofenceCount} remaining.`, async () => {});
  });
}

export async function deleteAllCampaigns(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all campaigns', async () => {
    const getCampaignsResponseJson = await getCampaignsWithApi(request, token, {
      appId
    });
    const initialCampaignCount = getCampaignsResponseJson.data.length;

    await batchDeleteCampaignsWithApi(
      request,
      token,
      getCampaignsResponseJson.data.map(
        (campaign: { id: string }) => campaign.id
      ),
      appId
    );

    const getCampaignsResponseJsonAfterDeletion = await getCampaignsWithApi(
      request,
      token,
      { appId }
    );
    const finalCampaignCount =
      getCampaignsResponseJsonAfterDeletion.data.length;

    expect(finalCampaignCount).toBe(0);

    await test.step(`Deleted ${initialCampaignCount} campaigns, ${finalCampaignCount} remaining.`, async () => {});
  });
}

export async function deleteAllGroups(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all groups', async () => {
    const getGroupsResponseJson = await getAllGroupsWithApi(request, token, undefined, appId);
    const initialGroupCount = getGroupsResponseJson.data.length;

    for (const group of getGroupsResponseJson.data) {
      await deleteGroupWithApi(request, token, group.id, appId);
    }

    const getGroupsResponseJsonAfterDeletion = await getAllGroupsWithApi(
      request,
      token,
      undefined,
      appId
    );
    const finalGroupCount = getGroupsResponseJsonAfterDeletion.data.length;

    expect(finalGroupCount).toBe(0);

    await test.step(`Deleted ${initialGroupCount} groups, ${finalGroupCount} remaining.`, async () => {});
  });
}

export async function deleteAllDeeplinks(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await test.step('Deleting all deeplinks', async () => {
    const getDeeplinksResponseJson = await getAllDeeplinksWithApi(request, token, appId);
    const initialDeeplinkCount = getDeeplinksResponseJson.data.length;

    for (const deeplink of getDeeplinksResponseJson.data) {
      await deleteDeeplinksWithApi(request, token, [deeplink.id], appId);
    }

    const getDeeplinksResponseJsonAfterDeletion = await getAllDeeplinksWithApi(
      request,
      token,
      appId
    );
    const finalDeeplinkCount =
      getDeeplinksResponseJsonAfterDeletion.data.length;

    expect(finalDeeplinkCount).toBe(0);

    await test.step(`Deleted ${initialDeeplinkCount} deeplinks, ${finalDeeplinkCount} remaining.`, async () => {});
  });
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

export function generateCsvContentForAliases(aliases: string[]): Buffer {
  let csvContent = 'User_Alias';
  for (const alias of aliases) {
    csvContent += `\n${alias}`;
  }
  return Buffer.from(csvContent, 'utf-8');
}
