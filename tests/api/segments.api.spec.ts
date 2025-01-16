import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  batchDeleteSegmentsWithApi,
  createSegmentFromFile,
  createSegmentWithApi,
  duplicateSegmentWithApi,
  estimateSegmentsWithApi,
  getAllSegmentsWithApi,
  getSingleSegmentUsersWithApi,
  getSingleSegmentWithApi,
  getTotalAudienceForSegmentWithApi,
  getUserCountForAlias,
  updateSegmentWithApi
} from '@_src/api/factories/segments.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/segment/create-segment-all-users-payload';
import { createSegmentSingleAliasPayload } from '@_src/api/test-data/segment/create-segment-single-alias-payload';
import {
  deleteAllSegments,
  deleteAllUsers,
  generateUniqueCustomTag,
  importRandomUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('Segment Management', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  // test.beforeAll(async ({ request }) => {
  //   await superAdminsFeatureFLagDefaultBatchUpdate(
  //     request,
  //     APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
  //     [API_E2E_APP_ID]
  //   );
  // });

  test.beforeEach(async ({ request }) => {
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should create multiple segments, update one, remove a single one, and validate the total number of segments in the end', async ({
    request
  }) => {
    // Arrange
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
    const secondAliasUser = getUsersResponseJson.data[1].alias;
    const thirdAliasUser = getUsersResponseJson.data[2].alias;

    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      firstAliasUser;

    // Act
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    const getSingleSegmentResponseAfterCreation =
      await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstSegmentId
      );
    const getSingleSegmentResponseAfterCreationJson =
      await getSingleSegmentResponseAfterCreation.json();

    const updateSegmentResponse = await updateSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      createSegmentSingleAliasPayload
    );
    const updateSegmentResponseJson = await updateSegmentResponse.json();

    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      secondAliasUser;
    const createSecondSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentSingleAliasPayload
    );
    const createSecondSegmentResponseJson =
      await createSecondSegmentResponse.json();

    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      thirdAliasUser;
    const createThirdSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentSingleAliasPayload
    );
    const createThirdSegmentResponseJson =
      await createThirdSegmentResponse.json();

    const batchDeleteSegmentsWithApiResponse = await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      [firstSegmentId]
    );
    const batchDeleteSegmentsWithApiResponseJson =
      await batchDeleteSegmentsWithApiResponse.json();

    const getSegmentsResponseAfterCreation = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJsonAfterCreation =
      await getSegmentsResponseAfterCreation.json();

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(3);

    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );

    expect(getSingleSegmentResponseAfterCreation.status()).toBe(200);
    expect(getSingleSegmentResponseAfterCreationJson.data.length).toBe(3);

    expect(updateSegmentResponse.status()).toBe(200);
    expect(updateSegmentResponseJson.id).toBe(firstSegmentId);

    expect(createSecondSegmentResponse.status()).toBe(200);
    expect(createSecondSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentSingleAliasPayload.name
    );

    expect(createThirdSegmentResponse.status()).toBe(200);
    expect(createThirdSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentSingleAliasPayload.name
    );

    expect(batchDeleteSegmentsWithApiResponse.status()).toBe(200);
    expect(batchDeleteSegmentsWithApiResponseJson.resources_count).toBe(2);

    expect(getSegmentsResponseAfterCreation.status()).toBe(200);
    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(2);
  });

  test('should create and duplicate segments with correct audience estimation', async ({
    request
  }) => {
    // Arrange
    const getTotalAudienceForSegmentWithApiBeforeUserCreationResponse =
      await getTotalAudienceForSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        0
      );
    const getTotalAudienceForSegmentWithApiBeforeUserCreationResponseJson =
      await getTotalAudienceForSegmentWithApiBeforeUserCreationResponse.json();

    // Assert initial state
    expect(
      getTotalAudienceForSegmentWithApiBeforeUserCreationResponse.status()
    ).toBe(200);
    expect(
      getTotalAudienceForSegmentWithApiBeforeUserCreationResponseJson.total_audience
    ).toBe(0);

    // Arrange
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
    const secondAliasUser = getUsersResponseJson.data[1].alias;

    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      firstAliasUser;

    // Act
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    const getTotalAudienceForSegmentWithApiResponse =
      await getTotalAudienceForSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        3
      );
    const getTotalAudienceForSegmentWithApiResponseJson =
      await getTotalAudienceForSegmentWithApiResponse.json();

    const getSingleSegmentWithApiAfterCreationForAllUsers =
      await getSingleSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstSegmentId
      );
    const getSingleSegmentWithApiAfterCreationForAllUsersJson =
      await getSingleSegmentWithApiAfterCreationForAllUsers.json();

    const getUserCountForAliasResponse = await getUserCountForAlias(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstAliasUser
    );
    const getUserCountForAliasResponseJson =
      await getUserCountForAliasResponse.json();

    createSegmentSingleAliasPayload.groups[0].rules[0].match_value =
      secondAliasUser;
    const createSecondSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentSingleAliasPayload
    );

    const duplicateSegmentWithApiResponse = await duplicateSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId
    );
    const duplicateSegmentWithApiResponseJson =
      await duplicateSegmentWithApiResponse.json();

    const estimateSegmentsWithApiResponse = await estimateSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId
    );

    const getSegmentsResponseAfterCreation = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseJsonAfterCreation =
      await getSegmentsResponseAfterCreation.json();

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(3);

    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );

    expect(getTotalAudienceForSegmentWithApiResponse.status()).toBe(200);
    expect(getTotalAudienceForSegmentWithApiResponseJson.total_audience).toBe(
      3
    );

    expect(getSingleSegmentWithApiAfterCreationForAllUsers.status()).toBe(200);
    expect(getSingleSegmentWithApiAfterCreationForAllUsersJson).toHaveProperty(
      'name',
      createSegmentAllUsersPayload.name
    );
    expect(getSingleSegmentWithApiAfterCreationForAllUsersJson).toHaveProperty(
      'id',
      firstSegmentId
    );

    expect(getUserCountForAliasResponse.status()).toBe(200);
    expect(getUserCountForAliasResponseJson.users_count).toBe(1);

    expect(createSecondSegmentResponse.status()).toBe(200);

    expect(duplicateSegmentWithApiResponse.status()).toBe(200);
    expect(duplicateSegmentWithApiResponseJson).toHaveProperty(
      'name',
      `${createSegmentAllUsersPayload.name} copy01`
    );

    expect(estimateSegmentsWithApiResponse.status()).toBe(200);

    expect(getSegmentsResponseAfterCreation.status()).toBe(200);
    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(3);
  });

  test('should import users to segment via file upload and verify segment content', async ({
    request
  }) => {
    // Arrange
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
    const secondAliasUser = getUsersResponseJson.data[1].alias;

    // Act
    const uniqueCustomTag = generateUniqueCustomTag();
    const createSegmentFromFileResponse = await createSegmentFromFile(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      'test',
      uniqueCustomTag,
      [firstAliasUser, secondAliasUser]
    );

    // Assert initial segment creation
    expect(createSegmentFromFileResponse.status()).toBe(200);

    // Get segment ID
    const getAllSegmentsResponse = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const segmentId = (await getAllSegmentsResponse.json()).data[0].id;

    // Assert
    await expect(async () => {
      const segmentUsersResponse = await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        segmentId
      );
      const segmentUsersResponseJson = await segmentUsersResponse.json();

      expect(segmentUsersResponse.status()).toBe(200);
      expect(segmentUsersResponseJson.data).toHaveLength(2);
      expect(segmentUsersResponseJson.data.map((user) => user.alias)).toEqual(
        expect.arrayContaining([firstAliasUser, secondAliasUser])
      );
    }).toPass({
      timeout: 30_000,
      intervals: [1000]
    });
  });
});
