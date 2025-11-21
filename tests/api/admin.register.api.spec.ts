import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
import {
  getAdminById,
  getAllAdmins,
  getWhoAmI,
  registerCompany
} from '@_src/api/factories/cms.admin.api.factory';
import {
  createApp,
  deleteApp,
  getAllAppsWithApi
} from '@_src/api/factories/cms.apps.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/cms.super-admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Admin Registration', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
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

  test('should register company with admin and app', async ({ request }) => {
    // Arrange
    const supserAdminActivationCodeCreateResponse =
      await superAdminsActivationCodesCreate(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin
      );
    const supserAdminActivationCodeCreateResponseJson =
      await supserAdminActivationCodeCreateResponse.json();
    const activationCode =
      supserAdminActivationCodeCreateResponseJson.activation_code;
    const registrationData = generateCompanyPayload(activationCode);

    // Act
    // 1. Register Company
    const companyRegistrationResponse = await registerCompany(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      registrationData
    );
    const companyRegistrationResponseJson =
      await companyRegistrationResponse.json();
    const appId = companyRegistrationResponseJson.data.recent_mobile_app_id;
    const adminAccessToken =
      companyRegistrationResponseJson.data.admin_access_token;

    // 2. Get Admin Information
    const getAllAdminsResponse = await getAllAdmins(
      request,
      adminAccessToken,
      appId
    );
    const getAllAdminsResponseJson = await getAllAdminsResponse.json();
    const whoAmIResponse = await getWhoAmI(request, adminAccessToken);
    const adminDetailResponse = await getAdminById(
      request,
      adminAccessToken,
      appId,
      getAllAdminsResponseJson.data[0].id
    );
    const adminDetailResponseJson = await adminDetailResponse.json();

    // 3. App Management
    const createAppResponse = await createApp(
      request,
      adminAccessToken,
      'test-app'
    );
    const createAppResponseJson = await createAppResponse.json();

    // Get apps count before deletion
    const beforeDeleteAppResponse = await getAllAppsWithApi(
      request,
      adminAccessToken
    );
    const beforeDeleteAppJson = await beforeDeleteAppResponse.json();
    const beforeDeleteCount = beforeDeleteAppJson.data.length;

    const deleteAppResponse = await deleteApp(
      request,
      adminAccessToken,
      createAppResponseJson.id,
      'test-app',
      registrationData.password
    );

    // Verify apps count after deletion
    const afterDeleteAppResponse = await getAllAppsWithApi(
      request,
      adminAccessToken
    );
    const afterDeleteAppJson = await afterDeleteAppResponse.json();
    expect(afterDeleteAppJson.data.length).toBe(beforeDeleteCount - 1);

    // Assert
    // 1. Activation Code Creation
    expect(supserAdminActivationCodeCreateResponse.status()).toBe(201);
    expect(supserAdminActivationCodeCreateResponseJson).toHaveProperty(
      'activation_code'
    );

    // 2. Company Registration
    expect(companyRegistrationResponse.status()).toBe(201);
    expect(companyRegistrationResponseJson.data).toHaveProperty('email');
    expect(companyRegistrationResponseJson.data.email.toLowerCase()).toBe(
      registrationData.email.toLowerCase()
    );
    expect(companyRegistrationResponseJson.data.username).toBe(
      registrationData.username
    );
    expect(companyRegistrationResponseJson.data.name).toBe(
      registrationData.name
    );
    expect(companyRegistrationResponseJson.data.role).toBe(
      registrationData.role
    );

    // 3. Admin Management
    expect(getAllAdminsResponse.status()).toBe(200);
    expect(getAllAdminsResponseJson).toHaveProperty('data');
    expect(getAllAdminsResponseJson.data[0]).toHaveProperty('role');
    expect(getAllAdminsResponseJson.data[0]).toHaveProperty('name');
    expect(getAllAdminsResponseJson.data[0].role).toBe('master_admin');
    expect(getAllAdminsResponseJson.data[0].name).toBe(registrationData.name);
    expect(whoAmIResponse.status()).toBe(200);
    expect(adminDetailResponse.status()).toBe(200);
    expect(adminDetailResponseJson).toHaveProperty('id');
    expect(adminDetailResponseJson).toHaveProperty('email');
    expect(adminDetailResponseJson).toHaveProperty('username');
    expect(adminDetailResponseJson.username).toBe(registrationData.username);
    expect(adminDetailResponseJson).toHaveProperty('role');
    expect(adminDetailResponseJson.role).toBe(registrationData.role);

    // 4. App Management
    expect(createAppResponse.status()).toBe(200);
    expect(createAppResponseJson).toHaveProperty('id');
    expect(createAppResponseJson).toHaveProperty('name');
    expect(createAppResponseJson.name).toBe('test-app');
    expect(deleteAppResponse.status()).toBe(200);
  });
});
