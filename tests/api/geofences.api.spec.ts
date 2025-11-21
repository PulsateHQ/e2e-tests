import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import {
  batchDestroyGeofencesWithApi,
  createGeofenceWithApi,
  listGeofencesWithApi,
  updateGeofenceWithApi
} from '@_src/api/factories/cms.geofences.api.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/cms.super-admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { createGeofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllGeofences,
  deleteAllSegments,
  deleteAllUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@playwright/test';

test.describe('Geofences', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );

    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
      [APIE2ELoginUserModel.apiE2EAppId]
    );
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllGeofences(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
  });

  test('should create, update, and delete geofences', async ({ request }) => {
    // Arrange
    const firstGeofencePayload = {
      ...createGeofencePayload(),
      name: 'First Geofence'
    };
    const secondGeofencePayload = {
      ...createGeofencePayload(),
      name: 'Second Geofence'
    };
    const thirdGeofencePayload = {
      ...createGeofencePayload(),
      name: 'Third Geofence'
    };

    // Act
    const createFirstGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGeofencePayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createFirstGeofenceResponseJson =
      await createFirstGeofenceResponse.json();
    const firstGeofenceId = createFirstGeofenceResponseJson.id;

    const listGeofencesResponseJsonAfterCreation = await listGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      1,
      1000,
      'desc',
      APIE2ELoginUserModel.apiE2EAppId
    );

    const updateGeofenceResponse = await updateGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGeofenceId,
      {
        ...createFirstGeofenceResponseJson,
        name: 'Updated First Geofence',
        radius: '1000'
      },
      APIE2ELoginUserModel.apiE2EAppId
    );
    const updateGeofenceResponseJson = await updateGeofenceResponse.json();

    const createSecondGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      secondGeofencePayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSecondGeofenceResponseJson =
      await createSecondGeofenceResponse.json();

    const createThirdGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      thirdGeofencePayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createThirdGeofenceResponseJson =
      await createThirdGeofenceResponse.json();

    const batchDeleteGeofencesResponse = await batchDestroyGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      [firstGeofenceId],
      APIE2ELoginUserModel.apiE2EAppId
    );

    const listGeofencesResponseJsonAfterDeletion = await listGeofencesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      1,
      1000,
      'desc',
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert
    expect(createFirstGeofenceResponse.status()).toBe(201);
    expect(createFirstGeofenceResponseJson).toHaveProperty(
      'name',
      firstGeofencePayload.name
    );

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

    expect(listGeofencesResponseJsonAfterDeletion.data.length).toBe(2);
  });
});
