import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  batchDeleteSegmentsWithApi,
  createSegmentWithApi,
  getAllSegmentsWithApi,
  getSingleSegmentWithApi,
  updateSegmentWithApi
} from '@_src/api/factories/segments.api.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/super-admins.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/segment/create-segment-all-users-payload';
import { createSegmentSingleAliasPayload } from '@_src/api/test-data/segment/create-segment-single-alias-payload';
import {
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('User and Segment Management', () => {
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
  });

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

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);
  });

  test.only('CRUD', async ({ request }) => {
    const numberOfUsers = 3;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    const firstAliasUser = getUsersResponseJson.data[0].alias;
    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      firstAliasUser;
    const secondAliasUser = getUsersResponseJson.data[1].alias;
    const thirdAliasUser = getUsersResponseJson.data[2].alias;
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(3);

    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );

    const getSingleSegmentResponseAfterCreation = await getSingleSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId
    );
    const getSingleSegmentResponseAfterCreationJson =
      await getSingleSegmentResponseAfterCreation.json();

    expect(getSingleSegmentResponseAfterCreation.status()).toBe(200);
    expect(getSingleSegmentResponseAfterCreationJson.data.length).toBe(3);

    const updateSegmentResponse = await updateSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      createSegmentSingleAliasPayload
    );

    const updateSegmentResponseJson = await updateSegmentResponse.json();
    expect(updateSegmentResponse.status()).toBe(200);
    expect(updateSegmentResponseJson.id).toBe(firstSegmentId);

    const batchDeleteSegmentsWithApiResponse = await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId
    );

    const batchDeleteSegmentsWithApiResponseJson =
      await batchDeleteSegmentsWithApiResponse.json();
    expect(batchDeleteSegmentsWithApiResponse.status()).toBe(200);
    expect(batchDeleteSegmentsWithApiResponseJson.segment.id).toBe(
      firstSegmentId
    );

    const getSegmentsResponseAfterCreation = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJsonAfterCreation =
      await getSegmentsResponseAfterCreation.json();

    expect(getSegmentsResponseAfterCreation.status()).toBe(200);
    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(0);
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

    const getUsersResponse = await getAllUsersWithApi(
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

    const getSegmentsResponseAfterCreation = await getAllSegmentsWithApi(
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
