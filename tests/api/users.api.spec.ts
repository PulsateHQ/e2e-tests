import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import { getAllSegmentsWithApi } from '@_src/api/factories/cms.segments.api.factory';
import { getSingleSegmentUsersWithApi } from '@_src/api/factories/cms.segments.api.factory';
import {
  createUserWithApi,
  deleteUserWithApi,
  getAllUsersWithApi,
  getUserSegmentsWithApi,
  getUserSubscriptionsWithApi,
  getUserWithApi,
  updateUserNoteWithApi,
  uploadUsersWithSegmentCreationApi,
  upsertUserWithApi
} from '@_src/api/factories/cms.users.api.factory';
import {
  deleteUserCustomAttributesWithApi,
  getUserCustomAttributesWithApi,
  setUserCustomAttributesWithApi
} from '@_src/api/factories/cms.users.custom-attributes.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import {
  createCustomAttributePayload,
  generateUniqueCustomTag
} from '@_src/api/test-data/cms/custom-attributes/custom-attribute.payload';
import { createUserRequestPayload } from '@_src/api/test-data/cms/users/create-users.payload';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Users', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
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

  test('should import and validate user', async ({ request }) => {
    // Arrange
    const numberOfUsers = 1;
    const { apiE2EAccessTokenAdmin, apiE2EAppId } = APIE2ELoginUserModel;

    // Act
    await importRandomUsers(
      request,
      apiE2EAccessTokenAdmin,
      apiE2EAppId,
      numberOfUsers
    );

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin,
      { appId: apiE2EAppId }
    );
    const userId = getUsersResponseJson.data[0].id;

    const getUserResponse = await getUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      userId,
      apiE2EAppId
    );
    const getUserResponseJson = await getUserResponse.json();

    // Assert
    expect(getUsersResponseJson.data.length).toBe(1);

    expect(getUserResponse.status()).toBe(200);
    expect(getUserResponseJson.note).toBe(
      'User imported from csv file - import.data.users.csv '
    );
  });

  test('should create and delete user', async ({ request }) => {
    // Arrange
    const { apiE2EAccessTokenAdmin } = APIE2ELoginUserModel;

    const upsertUserPayload = createUserRequestPayload();
    const createUserPayload = createUserRequestPayload();
    // Act
    const upsertUserWithApiResponse = await upsertUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      upsertUserPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const upsertUserWithApiResponseJson =
      await upsertUserWithApiResponse.json();

    const createUserWithApiResponse = await createUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      createUserPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createUserWithApiResponseJson =
      await createUserWithApiResponse.json();

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );
    const userId = getUsersResponseJson.data[0].id;

    const deleteUserWithApiResponse = await deleteUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      userId,
      APIE2ELoginUserModel.apiE2EAppId
    );

    const getAllUsersWithApiAfterUnsubscribeJson = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );

    // Assert
    expect(upsertUserWithApiResponse.status()).toBe(200);
    expect(upsertUserWithApiResponseJson.alias).toBe(upsertUserPayload.alias);

    expect(createUserWithApiResponse.status()).toBe(200);
    expect(createUserWithApiResponseJson.alias).toBe(createUserPayload.alias);

    expect(getUsersResponseJson.data.length).toBe(2);

    expect(deleteUserWithApiResponse.status()).toBe(200);

    expect(getAllUsersWithApiAfterUnsubscribeJson.data.length).toBe(1);
  });

  test('should import users with segment and custom attributes', async ({
    request
  }) => {
    // Arrange
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const numberOfUsers = 2;
    const uniqueCustomTag = generateUniqueCustomTag();

    // Act
    const uploadUsersResponse = await uploadUsersWithSegmentCreationApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        numberOfUsers: numberOfUsers,
        segmentName: 'segment_test',
        customTag: uniqueCustomTag
      },
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert
    expect(uploadUsersResponse.status()).toBe(200);

    // Wait for segments to be created and verify
    let segmentId: string;
    await expect(async () => {
      const getAllSegmentsResponseJson = await getAllSegmentsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        APIE2ELoginUserModel.apiE2EAppId
      );

      segmentId = getAllSegmentsResponseJson.data[0].id;
      expect(getAllSegmentsResponseJson.data).toHaveLength(1);
    }).toPass({
      timeout: 30_000,
      intervals: [1000]
    });

    let userId: string;
    let aliasId: string;

    // Verify segment users
    await expect(async () => {
      const segmentUsersResponseJson = await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        segmentId,
        APIE2ELoginUserModel.apiE2EAppId
      );

      expect(segmentUsersResponseJson.data).toHaveLength(2);
      userId = segmentUsersResponseJson.data[0].id;
      aliasId = segmentUsersResponseJson.data[0].alias;
    }).toPass({
      timeout: 30_000,
      intervals: [1000]
    });

    // Update user note
    const updateUserNoteResponse = await updateUserNoteWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId,
      'Updated note',
      APIE2ELoginUserModel.apiE2EAppId
    );
    const updateUserNoteResponseJson = await updateUserNoteResponse.json();
    expect(updateUserNoteResponse.status()).toBe(200);
    expect(updateUserNoteResponseJson.note).toBe('Updated note');

    const getUserSegmentsResponse = await getUserSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    expect(getUserSegmentsResponse.status()).toBe(200);
    const getUserSegmentsResponseJson = await getUserSegmentsResponse.json();
    expect(getUserSegmentsResponseJson.data[0].id).toBe(segmentId);
    expect(getUserSegmentsResponseJson.data[0].name).toBe('segment_test');

    // Get user and verify note
    const getUserResponse = await getUserWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const getUserResponseJson = await getUserResponse.json();
    expect(getUserResponseJson.note).toBe('Updated note');
    expect(getUserResponseJson.custom_attrs[uniqueCustomTag]).toBe(true);

    const getUserCustomAttributesResponse =
      await getUserCustomAttributesWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        aliasId,
        APIE2ELoginUserModel.apiE2EAppId
      );
    const getUserCustomAttributesResponseJson =
      await getUserCustomAttributesResponse.json();
    expect(getUserCustomAttributesResponseJson.data[0].name).toBe(
      uniqueCustomTag
    );

    // Generate a single custom attribute with default values
    const customAttribute = createCustomAttributePayload();

    // Set the custom attribute
    await setUserCustomAttributesWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      aliasId,
      [customAttribute],
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Get the custom attribute we want to delete from the previous GET response
    const customAttributeFromResponse =
      getUserCustomAttributesResponseJson.data[0];

    // Test with request body
    const deleteUserCustomAttributesWithBodyResponse =
      await deleteUserCustomAttributesWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        aliasId,
        {
          source: customAttributeFromResponse.source || '',
          product_id: customAttributeFromResponse.product_id || '',
          name: customAttributeFromResponse.name
        },
        APIE2ELoginUserModel.apiE2EAppId
      );

    expect(deleteUserCustomAttributesWithBodyResponse.status()).toBe(200);

    const getUserCustomAttributesAfterDeleteResponse =
      await getUserCustomAttributesWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        aliasId,
        APIE2ELoginUserModel.apiE2EAppId
      );
    const getUserCustomAttributesAfterDeleteResponseJson =
      await getUserCustomAttributesAfterDeleteResponse.json();
    // Validate that the remaining custom attribute matches what we set
    expect(getUserCustomAttributesAfterDeleteResponseJson.data[0].name).toBe(
      customAttribute.name
    );
    expect(
      String(getUserCustomAttributesAfterDeleteResponseJson.data[0].value)
    ).toBe(String(customAttribute.value));
    expect(getUserCustomAttributesAfterDeleteResponseJson.data[0].source).toBe(
      customAttribute.source
    );
    expect(
      getUserCustomAttributesAfterDeleteResponseJson.data[0].product_id
    ).toBe(customAttribute.product_id);

    // Get user and verify custom attributes
    const getUserAfterDelteAttributeResponse = await getUserWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const getUserAfterDelteAttributeResponseJson =
      await getUserAfterDelteAttributeResponse.json();
    expect(
      String(
        getUserAfterDelteAttributeResponseJson.custom_attrs[
          customAttribute.name
        ]
      )
    ).toBe(String(customAttribute.value));
  });

  test('should return user subscriptions', async ({ request }) => {
    // Create a user first
    const userPayload = createUserRequestPayload();
    const createUserResponse = await createUserWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createdUser = await createUserResponse.json();

    // Test get subscriptions endpoint
    const response = await getUserSubscriptionsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      createdUser.id
    );

    expect(response.status()).toBe(200);
  });
});
