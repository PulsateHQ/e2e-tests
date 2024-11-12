import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID
} from '@_config/env.config';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  deleteUserWithApi,
  getUsersWithApi
} from '@_src/api/factories/users.api.factory';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('User Import, Validation, and Deletion', () => {
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
    const expectedGetUsersStatusCode = 200;
    expect(
      getUsersResponse.status(),
      `Expected status: ${expectedGetUsersStatusCode} and observed: ${getUsersResponse.status()}`
    ).toBe(expectedGetUsersStatusCode);
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
    expect(getUsersResponseJsonAfterDeletion.data.length).toBe(0);
  });
});
