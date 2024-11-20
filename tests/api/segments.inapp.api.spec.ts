import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID
} from '@_config/env.config';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  createSegmentWithApi,
  getSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import { getUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/create-segment-all-users-payload';
import {
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/apiTestUtils.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('User and Segment Management', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  test.beforeEach(async ({ request }) => {
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should import users, validate the number of users, and delete users', async ({
    request
  }) => {
    const numberOfUsers = 2;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    const getUsersResponse = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);
  });

  test('should import users, validate the number of users, and manage segments', async ({
    request
  }) => {
    const numberOfUsers = 2;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    const getUsersResponse = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);

    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );
    expect(createSegmentResponseJson.segment.groups.length).toBe(1);

    const getSegmentsResponseAfterCreation = await getSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJsonAfterCreation =
      await getSegmentsResponseAfterCreation.json();

    expect(getSegmentsResponseAfterCreation.status()).toBe(200);
    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(1);
    expect(getSegmentsResponseJsonAfterCreation.data[0].name).toBe(
      createSegmentAllUsersPayload.name
    );
  });
});
