import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  createUserWithApi,
  deleteUserWithApi,
  getAllUsersWithApi,
  getUserWithApi,
  upsertUserWithApi
} from '@_src/api/factories/users.api.factory';
import { userRequestPayload } from '@_src/api/test-data/user-payload/create-users';
import {
  deleteAllUsers,
  getFreshUserPayload,
  importRandomUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('User Management', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  test.beforeEach(async ({ request }) => {
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
  });

  test('should import multiple users and verify the count', async ({
    request
  }) => {
    // Arrange
    const numberOfUsers = 2;
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

    // Assert
    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(numberOfUsers);
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
    const createPayload = getFreshUserPayload();

    // Act
    const upsertUserWithApiResponse = await upsertUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      userRequestPayload
    );
    const upsertUserWithApiResponseJson =
      await upsertUserWithApiResponse.json();

    const createUserWithApiResponse = await createUserWithApi(
      request,
      apiE2EAccessTokenAdmin,
      createPayload
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
    expect(upsertUserWithApiResponseJson.alias).toBe(userRequestPayload.alias);

    expect(createUserWithApiResponse.status()).toBe(200);
    expect(createUserWithApiResponseJson.alias).toBe(createPayload.alias);

    expect(getUsersResponse.status()).toBe(200);
    expect(getUsersResponseJson.data.length).toBe(2);

    expect(deleteUserWithApiResponse.status()).toBe(200);

    expect(getAllUsersWithApiAfterUnsubscribe.status()).toBe(200);
    expect(getAllUsersWithApiAfterUnsubscribeJson.data.length).toBe(1);
  });
});
