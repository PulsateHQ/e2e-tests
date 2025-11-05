import {
  API_E2E_ACCESS_TOKEN_ADMIN,
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
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateUniqueCustomTag } from '@_src/api/test-data/cms/custom-attributes/custom-attribute.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { createSegmentSingleAliasPayload } from '@_src/api/test-data/cms/segment/create-segment-single-alias.payload';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Segment Management', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN,
      API_E2E_ACCESS_TOKEN_ADMIN,
      'segments.api.spec.ts'
    );
  });

  test.beforeEach(async ({ request }) => {
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

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );
    const firstAliasUser = getUsersResponseJson.data[0].alias;
    const secondAliasUser = getUsersResponseJson.data[1].alias;
    const thirdAliasUser = getUsersResponseJson.data[2].alias;

    const firstSegmentPayload = createSegmentSingleAliasPayload(firstAliasUser);
    const secondSegmentPayload =
      createSegmentSingleAliasPayload(secondAliasUser);
    const thirdSegmentPayload = createSegmentSingleAliasPayload(thirdAliasUser);

    // Act
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    const getSingleSegmentResponseAfterCreationJson =
      await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstSegmentId,
        APIE2ELoginUserModel.apiE2EAppId
      );

    const updateSegmentResponse = await updateSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      firstSegmentPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const updateSegmentResponseJson = await updateSegmentResponse.json();

    const createSecondSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      secondSegmentPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSecondSegmentResponseJson =
      await createSecondSegmentResponse.json();

    const createThirdSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      thirdSegmentPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createThirdSegmentResponseJson =
      await createThirdSegmentResponse.json();

    const batchDeleteSegmentsWithApiResponse = await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      [firstSegmentId],
      APIE2ELoginUserModel.apiE2EAppId
    );
    const batchDeleteSegmentsWithApiResponseJson =
      await batchDeleteSegmentsWithApiResponse.json();

    const getSegmentsResponseJsonAfterCreation = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert
    expect(getUsersResponseJson.data.length).toBe(3);

    expect(createSegmentResponse.status()).toBe(200);
    expect(createSegmentResponseJson.segment).toHaveProperty(
      'name',
      firstSegmentPayload.name
    );

    expect(getSingleSegmentResponseAfterCreationJson.data.length).toBe(1);

    expect(updateSegmentResponse.status()).toBe(200);
    expect(updateSegmentResponseJson.id).toBe(firstSegmentId);

    expect(createSecondSegmentResponse.status()).toBe(200);
    expect(createSecondSegmentResponseJson.segment).toHaveProperty(
      'name',
      secondSegmentPayload.name
    );

    expect(createThirdSegmentResponse.status()).toBe(200);
    expect(createThirdSegmentResponseJson.segment).toHaveProperty(
      'name',
      thirdSegmentPayload.name
    );

    expect(batchDeleteSegmentsWithApiResponse.status()).toBe(200);
    expect(batchDeleteSegmentsWithApiResponseJson.resources_count).toBe(2);

    expect(getSegmentsResponseJsonAfterCreation.data.length).toBe(2);
  });

  test('should create and duplicate segments with correct audience estimation', async ({
    request
  }) => {
    // Arrange
    const getTotalAudienceForSegmentWithApiBeforeUserCreationResponseJson =
      await getTotalAudienceForSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        undefined,
        APIE2ELoginUserModel.apiE2EAppId
      );

    const totalAudience =
      getTotalAudienceForSegmentWithApiBeforeUserCreationResponseJson.total_audience;

    // Arrange
    const numberOfUsers = 3;
    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );
    const firstAliasUser = getUsersResponseJson.data[0].alias;
    const secondAliasUser = getUsersResponseJson.data[1].alias;

    const segmentAllUsersPayload = createSegmentAllUsersPayload();

    // Act
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      segmentAllUsersPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    const totalAudiencePlusUsers = totalAudience + numberOfUsers;

    const getTotalAudienceForSegmentWithApiResponseJson =
      await getTotalAudienceForSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        totalAudiencePlusUsers,
        APIE2ELoginUserModel.apiE2EAppId
      );

    const getSingleSegmentWithApiAfterCreationForAllUsersJson =
      await getSingleSegmentWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstSegmentId,
        APIE2ELoginUserModel.apiE2EAppId
      );

    const getUserCountForAliasResponse = await getUserCountForAlias(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstAliasUser,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const getUserCountForAliasResponseJson =
      await getUserCountForAliasResponse.json();

    const createSecondSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentSingleAliasPayload(secondAliasUser),
      APIE2ELoginUserModel.apiE2EAppId
    );

    const duplicateSegmentWithApiResponse = await duplicateSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const duplicateSegmentWithApiResponseJson =
      await duplicateSegmentWithApiResponse.json();

    const estimateSegmentsWithApiResponse = await estimateSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      APIE2ELoginUserModel.apiE2EAppId
    );

    const getSegmentsResponseJsonAfterCreation = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert
    expect(getUsersResponseJson.data.length).toBe(3);

    expect(createSegmentResponse.status()).toBe(200);

    expect(getTotalAudienceForSegmentWithApiResponseJson.total_audience).toBe(
      totalAudiencePlusUsers
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
      `${segmentAllUsersPayload.name} copy01`
    );

    expect(estimateSegmentsWithApiResponse.status()).toBe(200);

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

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );
    const firstAliasUser = getUsersResponseJson.data[0].alias;
    const secondAliasUser = getUsersResponseJson.data[1].alias;

    // Act
    const uniqueCustomTag = generateUniqueCustomTag();
    const createSegmentFromFileResponse = await createSegmentFromFile(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      'test',
      uniqueCustomTag,
      [firstAliasUser, secondAliasUser],
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert initial segment creation
    expect(createSegmentFromFileResponse.status()).toBe(200);

    // Get segment ID
    const getAllSegmentsResponseJson = await getAllSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const segmentId = getAllSegmentsResponseJson.data[0].id;

    // Assert
    await expect(async () => {
      const segmentUsersResponseJson = await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        segmentId,
        APIE2ELoginUserModel.apiE2EAppId
      );
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
