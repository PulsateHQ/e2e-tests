import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import { API_E2E_APP_ID } from '@_config/env.config';
import {
  batchDestroyGeofencesWithApi,
  createGeofenceWithApi,
  listGeofencesWithApi,
  updateGeofenceWithApi
} from '@_src/api/factories/geofence.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/super.admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { geofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
import {
  deleteAllCampaigns,
  deleteAllGeofences,
  deleteAllSegments,
  deleteAllUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@playwright/test';

test.describe('Geofences Management', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  test.beforeAll(async ({ request }) => {
    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
      [API_E2E_APP_ID]
    );
    // Optimize: Run cleanup operations in parallel for better performance
    await Promise.all([
      deleteAllCampaigns(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin),
      deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin),
      deleteAllSegments(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin),
      deleteAllGeofences(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin)
    ]);
  });

  test('should create multiple geofences, update one, remove a single one, and validate the total number of geofences in the end', async ({
    request
  }) => {
    // Arrange
    const firstGeofencePayload = {
      ...geofencePayload(),
      name: 'First Geofence'
    };
    const secondGeofencePayload = {
      ...geofencePayload(),
      name: 'Second Geofence'
    };
    const thirdGeofencePayload = {
      ...geofencePayload(),
      name: 'Third Geofence'
    };

    // Act
    const createFirstGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGeofencePayload
    );
    const createFirstGeofenceResponseJson =
      await createFirstGeofenceResponse.json();
    const firstGeofenceId = createFirstGeofenceResponseJson.id;

    const listGeofencesResponseAfterCreation = await listGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const listGeofencesResponseJsonAfterCreation =
      await listGeofencesResponseAfterCreation.json();

    const updateGeofenceResponse = await updateGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGeofenceId,
      {
        ...createFirstGeofenceResponseJson,
        name: 'Updated First Geofence',
        radius: '1000'
      }
    );
    const updateGeofenceResponseJson = await updateGeofenceResponse.json();

    const createSecondGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      secondGeofencePayload
    );
    const createSecondGeofenceResponseJson =
      await createSecondGeofenceResponse.json();

    const createThirdGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      thirdGeofencePayload
    );
    const createThirdGeofenceResponseJson =
      await createThirdGeofenceResponse.json();

    const batchDeleteGeofencesResponse = await batchDestroyGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      [firstGeofenceId]
    );

    const listGeofencesResponseAfterDeletion = await listGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const listGeofencesResponseJsonAfterDeletion =
      await listGeofencesResponseAfterDeletion.json();

    // Assert
    expect(createFirstGeofenceResponse.status()).toBe(201);
    expect(createFirstGeofenceResponseJson).toHaveProperty(
      'name',
      firstGeofencePayload.name
    );

    expect(listGeofencesResponseAfterCreation.status()).toBe(200);
    expect(listGeofencesResponseJsonAfterCreation.data.length).toBe(1);

    expect(updateGeofenceResponse.status()).toBe(200);
    expect(updateGeofenceResponseJson.id).toBe(firstGeofenceId);
    expect(updateGeofenceResponseJson.name).toBe('Updated First Geofence');

    expect(createSecondGeofenceResponse.status()).toBe(201);
    expect(createSecondGeofenceResponseJson).toHaveProperty(
      'name',
      secondGeofencePayload.name
    );

    expect(createThirdGeofenceResponse.status()).toBe(201);
    expect(createThirdGeofenceResponseJson).toHaveProperty(
      'name',
      thirdGeofencePayload.name
    );

    expect(batchDeleteGeofencesResponse.status()).toBe(200);

    expect(listGeofencesResponseAfterDeletion.status()).toBe(200);
    expect(listGeofencesResponseJsonAfterDeletion.data.length).toBe(2);
  });
});
