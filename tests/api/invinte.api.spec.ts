import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  deleteAdmin,
  getAdminById,
  registerAdmin,
  updateAdminPrivileges,
  updateAdminPrivilegesUnauthorized
} from '@_src/api/factories/admin.api.factory';
import { inviteAdmin } from '@_src/api/factories/admin.invite.api.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/super.admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateAdminPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import {
  deleteAllSegments,
  deleteAllUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker';

test.describe('Admin Invite', () => {
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

  test('should invinte new admin, edit privilages and delete admin', async ({
    request
  }) => {
    const inviteAdminResponse = await inviteAdmin(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      faker.internet.email().toLowerCase(),
      APIE2ELoginUserModel.apiE2EAppId,
      'account_admin'
    );

    const inviteAdminResponseJson = await inviteAdminResponse.json();

    const registrationDataResponse = generateAdminPayload(
      inviteAdminResponseJson.admin.invite_token,
      true
    );

    const registerAdminResponse = await registerAdmin(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      registrationDataResponse
    );

    const registerAdminResponseJson = await registerAdminResponse.json();
    const adminData = registerAdminResponseJson.data;

    const getAdminByIdResponse = await getAdminById(
      request,
      adminData.admin_access_token,
      adminData.recent_mobile_app_id,
      adminData._id.$oid
    );

    const getAdminByIdResponseJson = await getAdminByIdResponse.json();

    expect(getAdminByIdResponseJson.email).toBe(
      inviteAdminResponseJson.admin.email
    );

    const updateAdminPrivilegesToAccountAdminResponse =
      await updateAdminPrivileges(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        APIE2ELoginUserModel.apiE2EAppId,
        adminData._id.$oid,
        {
          email: adminData.email,
          allowed_actions: 'all',
          role: 'account_admin'
        }
      );

    const updateAdminPrivilegesToAccountAdminResponseJson =
      await updateAdminPrivilegesToAccountAdminResponse.json();

    expect(updateAdminPrivilegesToAccountAdminResponseJson.admin.role).toBe(
      'account_admin'
    );

    const updateAdminPrivilegesToAppAdminResponse = await updateAdminPrivileges(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      adminData._id.$oid,
      {
        email: adminData.email,
        allowed_actions: 'all',
        role: 'app_admin',
        managed_app_id: adminData.recent_mobile_app_id
      }
    );

    const updateAdminPrivilegesToAppAdminResponseJson =
      await updateAdminPrivilegesToAppAdminResponse.json();

    expect(updateAdminPrivilegesToAppAdminResponseJson.admin.role).toBe(
      'app_admin'
    );

    const updateAdminPrivilegesToMaterAdminResponse =
      await updateAdminPrivileges(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        APIE2ELoginUserModel.apiE2EAppId,
        adminData._id.$oid,
        {
          email: adminData.email,
          allowed_actions: 'all',
          role: 'master_admin'
        }
      );

    const updateAdminPrivilegesToMaterAdminResponseJson =
      await updateAdminPrivilegesToMaterAdminResponse.json();

    expect(updateAdminPrivilegesToMaterAdminResponseJson.admin.role).toBe(
      'master_admin'
    );

    const updateAdminPrivilegesToUnauthorizedResponse =
      await updateAdminPrivilegesUnauthorized(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        APIE2ELoginUserModel.apiE2EAppId,
        adminData._id.$oid,
        {
          email: adminData.email,
          allowed_actions: 'all',
          role: 'account_admin'
        }
      );

    const updateAdminPrivilegesToUnauthorizedResponseJson =
      await updateAdminPrivilegesToUnauthorizedResponse.json();

    expect(
      updateAdminPrivilegesToUnauthorizedResponseJson.errors[0].unauthorized
    ).toBe('You cannot perform this action');

    const deleteAdminResponse = await deleteAdmin(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      adminData._id.$oid
    );

    const deleteAdminResponseJson = await deleteAdminResponse.json();

    expect(deleteAdminResponseJson.message).toBe(
      'Request performed successfully'
    );
  });
});
