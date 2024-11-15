// tests/api/segments.inapp.api.spec.ts
import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID
} from '@_config/env.config';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  batchDeleteSegmentsWithApi,
  createSegmentWithApi,
  getSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import {
  deleteUserWithApi,
  getUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/create-segment-all-users-payload';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('Test', () => {
  test('should import users, validate the number of users, and delete users', async ({
    request
  }) => {
    // Arrange
    const APIE2ELoginUserModel: APIE2ELoginUserModel = {
      apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
      apiE2EAppId: `${API_E2E_APP_ID}`
    };
    const csvFilePath = 'src/api/test-data/import.data.users.csv';

    // Act
    await importUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        file: csvFilePath,
        app_id: APIE2ELoginUserModel.apiE2EAppId
      }
    );
    const getUsersResponse = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);

    // Act (Delete Users)
    for (const user of getUsersResponseJson.data) {
      await deleteUserWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        user.id
      );
    }

    // Assert (Verify Deletion)
    const getUsersResponseAfterDeletion = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJsonAfterDeletion =
      await getUsersResponseAfterDeletion.json();
    expect(getUsersResponseAfterDeletion.status()).toBe(200);
    expect(getUsersResponseJsonAfterDeletion.data.length).toBe(0);
  });

  test('should import users, validate the number of users, and get segment and create segment and remove segment', async ({
    request
  }) => {
    // Arrange
    const APIE2ELoginUserModel: APIE2ELoginUserModel = {
      apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
      apiE2EAppId: `${API_E2E_APP_ID}`
    };
    const csvFilePath = 'src/api/test-data/import.data.users.csv';

    // Act
    await importUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        file: csvFilePath,
        app_id: APIE2ELoginUserModel.apiE2EAppId
      }
    );
    const getUsersResponse = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);

    // Act (Get Segments)
    const getSegmentsResponse = await getSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJson = await getSegmentsResponse.json();

    // Act (Batch Delete Segments)
    await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getSegmentsResponseJson.data.map((segment: { id: string }) => segment.id)
    );

    // Act (Create Segment)
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Assert (Segment Created)
    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );
    expect(createSegmentResponseJson.segment.groups.length).toBe(1);

    // Act (Get Segments Again)
    const getSegmentsResponseAfterCreation = await getSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJsonAfterCreation =
      await getSegmentsResponseAfterCreation.json();

    // Assert (Segment Exists)
    expect(getSegmentsResponseAfterCreation.status()).toBe(200);
    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(1);
    expect(getSegmentsResponseJsonAfterCreation.data[0].name).toBe(
      createSegmentAllUsersPayload.name
    );
  });
});
