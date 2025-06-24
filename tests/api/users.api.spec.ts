import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID
} from '@_config/env.config';
import { getAllSegmentsWithApi } from '@_src/api/factories/segments.api.factory';
import { getSingleSegmentUsersWithApi } from '@_src/api/factories/segments.api.factory';
import {
  createUserWithApi,
  deleteUserWithApi,
  getAllUsersWithApi,
  getUserSegmentsWithApi,
  getUserWithApi,
  updateUserNoteWithApi,
  uploadUsersWithSegmentCreationApi,
  upsertUserWithApi
} from '@_src/api/factories/users.api.factory';
import {
  deleteUserCustomAttributesWithApi,
  getUserCustomAttributesWithApi,
  setUserCustomAttributesWithApi
} from '@_src/api/factories/users.custom.attributes.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import {
  createCustomAttributePayload,
  generateUniqueCustomTag
} from '@_src/api/test-data/cms/custom-attributes/custom-attribute.payload';
import { createUserRequestPayload } from '@_src/api/test-data/cms/users/create-users.payload';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('User Management', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  test.beforeEach(async ({ request }) => {
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should import a single user and validate the user details', async ({
    request
  }) => {
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

    const getUsersResponse = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();
    const userId = getUsersResponseJson.data[0].id;

    const getUserResponse = await getUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      userId
    );
    const getUserResponseJson = await getUserResponse.json();

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(1);

    expect(getUserResponse.status()).toBe(200);
    expect(getUserResponseJson.note).toBe(
      'User imported from csv file - import.data.users.csv '
    );
  });

  test('should create a user, remove the user, and verify the user count', async ({
    request
  }) => {
    // Arrange
    const { apiE2EAccessTokenAdmin } = APIE2ELoginUserModel;

    const upsertUserPayload = createUserRequestPayload();
    const createUserPayload = createUserRequestPayload();
    // Act
    const upsertUserWithApiResponse = await upsertUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      upsertUserPayload
    );
    const upsertUserWithApiResponseJson =
      await upsertUserWithApiResponse.json();

    const createUserWithApiResponse = await createUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      createUserPayload
    );
    const createUserWithApiResponseJson =
      await createUserWithApiResponse.json();

    const getUsersResponse = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();
    const userId = getUsersResponseJson.data[0].id;

    const deleteUserWithApiResponse = await deleteUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      userId
    );

    const getAllUsersWithApiAfterUnsubscribe = await getAllUsersWithApi(
      request,
      apiE2EAccessTokenAdmin
    );
    const getAllUsersWithApiAfterUnsubscribeJson =
      await getAllUsersWithApiAfterUnsubscribe.json();

    // Assert
    expect(upsertUserWithApiResponse.status()).toBe(200);
    expect(upsertUserWithApiResponseJson.alias).toBe(upsertUserPayload.alias);

    expect(createUserWithApiResponse.status()).toBe(200);
    expect(createUserWithApiResponseJson.alias).toBe(createUserPayload.alias);

    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);

    expect(deleteUserWithApiResponse.status()).toBe(200);

    expect(getAllUsersWithApiAfterUnsubscribe.status()).toBe(200);
    expect(getAllUsersWithApiAfterUnsubscribeJson.data.length).toBe(1);
  });

  test('should import users with segment creation and verify segment content including custom attributes', async ({
    request
  }) => {
    // Arrange
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
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
      }
    );

    // Assert
    expect(uploadUsersResponse.status()).toBe(200);

    // Wait for segments to be created and verify
    let segmentId: string;
    await expect(async () => {
      const getAllSegmentsResponse = await getAllSegmentsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin
      );
      const getAllSegmentsResponseJson = await getAllSegmentsResponse.json();

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
      const segmentUsersResponse = await getSingleSegmentUsersWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        segmentId
      );
      const segmentUsersResponseJson = await segmentUsersResponse.json();

      expect(segmentUsersResponse.status()).toBe(200);
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
      'Updated note'
    );
    const updateUserNoteResponseJson = await updateUserNoteResponse.json();
    expect(updateUserNoteResponse.status()).toBe(200);
    expect(updateUserNoteResponseJson.note).toBe('Updated note');

    const getUserSegmentsResponse = await getUserSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId
    );
    expect(getUserSegmentsResponse.status()).toBe(200);
    const getUserSegmentsResponseJson = await getUserSegmentsResponse.json();
    expect(getUserSegmentsResponseJson.data[0].id).toBe(segmentId);
    expect(getUserSegmentsResponseJson.data[0].name).toBe('segment_test');

    // Get user and verify note
    const getUserResponse = await getUserWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      userId
    );
    const getUserResponseJson = await getUserResponse.json();
    expect(getUserResponseJson.note).toBe('Updated note');
    expect(getUserResponseJson.custom_attrs[uniqueCustomTag]).toBe(true);

    const getUserCustomAttributesResponse =
      await getUserCustomAttributesWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        aliasId
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
      [customAttribute]
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
        }
      );

    expect(deleteUserCustomAttributesWithBodyResponse.status()).toBe(200);

    const getUserCustomAttributesAfterDeleteResponse =
      await getUserCustomAttributesWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        aliasId
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
      userId
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
});
