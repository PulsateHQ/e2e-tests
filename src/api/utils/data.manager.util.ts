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

/**
 * Generic helper for deleting all resources using batch deletion pattern
 * @param config Configuration object with resource-specific functions and parameters
 */
async function deleteAllResourcesWithBatch<T extends { id: string }>(config: {
  resourceName: string;
  getAllResources: (
    request: APIRequestContext,
    token: string,
    appId?: string
  ) => Promise<{ data: T[] }>;
  batchDeleteResources: (
    request: APIRequestContext,
    token: string,
    resourceIds: string[],
    appId?: string
  ) => Promise<unknown>;
  request: APIRequestContext;
  token: string;
  appId?: string;
}): Promise<void> {
  const {
    resourceName,
    getAllResources,
    batchDeleteResources,
    request,
    token,
    appId
  } = config;

  await test.step(`Deleting all ${resourceName}`, async () => {
    const getResourcesResponse = await getAllResources(request, token, appId);
    const initialCount = getResourcesResponse.data.length;

    if (initialCount > 0) {
      await batchDeleteResources(
        request,
        token,
        getResourcesResponse.data.map((resource) => resource.id),
        appId
      );
    }

    const getResourcesResponseAfterDeletion = await getAllResources(
      request,
      token,
      appId
    );
    const finalCount = getResourcesResponseAfterDeletion.data.length;

    expect(finalCount).toBe(0);

    await test.step(
      `Deleted ${initialCount} ${resourceName}, ${finalCount} remaining.`,
      async () => {}
    );
  });
}

/**
 * Generic helper for deleting all resources using individual deletion pattern
 * @param config Configuration object with resource-specific functions and parameters
 */
async function deleteAllResourcesWithLoop<T extends { id: string }>(config: {
  resourceName: string;
  getAllResources: (
    request: APIRequestContext,
    token: string,
    appId?: string
  ) => Promise<{ data: T[] }>;
  deleteResource: (
    request: APIRequestContext,
    token: string,
    resourceId: string,
    appId?: string
  ) => Promise<unknown>;
  request: APIRequestContext;
  token: string;
  appId?: string;
}): Promise<void> {
  const {
    resourceName,
    getAllResources,
    deleteResource,
    request,
    token,
    appId
  } = config;

  await test.step(`Deleting all ${resourceName}`, async () => {
    const getResourcesResponse = await getAllResources(request, token, appId);
    const initialCount = getResourcesResponse.data.length;

    for (const resource of getResourcesResponse.data) {
      await deleteResource(request, token, resource.id, appId);
    }

    const getResourcesResponseAfterDeletion = await getAllResources(
      request,
      token,
      appId
    );
    const finalCount = getResourcesResponseAfterDeletion.data.length;

    expect(finalCount).toBe(0);

    await test.step(
      `Deleted ${initialCount} ${resourceName}, ${finalCount} remaining.`,
      async () => {}
    );
  });
}

export async function deleteAllUsers(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithLoop({
    resourceName: 'users',
    getAllResources: (req, tok, id) =>
      getAllUsersWithApi(req, tok, { appId: id }),
    deleteResource: deleteUserWithApi,
    request,
    token,
    appId
  });
}

export async function deleteAllSegments(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithBatch({
    resourceName: 'segments',
    getAllResources: getAllSegmentsWithApi,
    batchDeleteResources: batchDeleteSegmentsWithApi,
    request,
    token,
    appId
  });
}

export async function deleteAllGeofences(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithBatch({
    resourceName: 'geofences',
    getAllResources: (req, tok, id) =>
      listGeofencesWithApi(req, tok, 1, 1000, 'desc', id),
    batchDeleteResources: batchDestroyGeofencesWithApi,
    request,
    token,
    appId
  });
}

export async function deleteAllCampaigns(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithBatch({
    resourceName: 'campaigns',
    getAllResources: (req, tok, id) =>
      getCampaignsWithApi(req, tok, { appId: id }),
    batchDeleteResources: batchDeleteCampaignsWithApi,
    request,
    token,
    appId
  });
}

export async function deleteAllGroups(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithLoop({
    resourceName: 'groups',
    getAllResources: (req, tok, id) =>
      getAllGroupsWithApi(req, tok, undefined, id),
    deleteResource: deleteGroupWithApi,
    request,
    token,
    appId
  });
}

export async function deleteAllDeeplinks(
  request: APIRequestContext,
  token: string,
  appId?: string
): Promise<void> {
  await deleteAllResourcesWithLoop({
    resourceName: 'deeplinks',
    getAllResources: getAllDeeplinksWithApi,
    deleteResource: (req, tok, id, app) =>
      deleteDeeplinksWithApi(req, tok, [id], app),
    request,
    token,
    appId
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
