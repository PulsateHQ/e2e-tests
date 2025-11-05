import {
  API_E2E_ACCESS_TOKEN_ADMIN,
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
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker';

test.describe('Admin Invitation Management', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN,
      API_E2E_ACCESS_TOKEN_ADMIN
    );

    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
      [APIE2ELoginUserModel.apiE2EAppId]
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

  test('should invite new admin, edit privileges and delete admin', async ({
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
