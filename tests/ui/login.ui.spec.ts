import {
  BASE_URL,
  SUPER_ADMIN_ACCESS_TOKEN,
  UI_E2E_ACCESS_TOKEN_ADMIN,
  UI_E2E_LOGIN_ADMIN,
  UI_E2E_PASSWORD_ADMIN
} from '@_config/env.config';
import { registerCompany } from '@_src/api/factories/admin.api.factory';
import { superAdminsActivationCodesCreate } from '@_src/api/factories/super.admin.api.factory';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  E2EAdminAuthDataModel,
  E2EAdminLoginCredentialsModel
} from '@_src/ui/models/admin.model';

test.describe('Login Functionality', () => {
  test('should reject login with incorrect password and display error messages', async ({
    loginPage
  }) => {
    const expectedURL = `${BASE_URL}/admins/sign_in`;

    const loginUserDataMissingPassword: E2EAdminLoginCredentialsModel = {
      userEmail: `${UI_E2E_LOGIN_ADMIN}`,
      userPassword: ``
    };

    const loginUserDataMissingEmail: E2EAdminLoginCredentialsModel = {
      userEmail: ``,
      userPassword: `${UI_E2E_PASSWORD_ADMIN}`
    };

    await loginPage.loginButton.click();

    await loginPage.validateErrorVisibility(
      loginPage.userEmailInput,
      loginPage.usernameOrEmailMissingError
    );

    await loginPage.validateErrorVisibility(
      loginPage.userPasswordInput,
      loginPage.passwordMissingError
    );

    await loginPage.login(loginUserDataMissingPassword);
    await loginPage.validateErrorVisibility(
      loginPage.userPasswordInput,
      loginPage.passwordMissingError
    );

    await loginPage.login(loginUserDataMissingEmail);
    await loginPage.validateErrorVisibility(
      loginPage.userEmailInput,
      loginPage.usernameOrEmailMissingError
    );

    const loginURL = await loginPage.validateUrl();
    expect(loginURL).toBe(expectedURL);

    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should validate the presence and functionality of the download banner', async ({
    loginPage
  }) => {
    await expect(loginPage.downloadButton).toHaveText(
      'Download Your Guide Now'
    );

    await loginPage.waitForNewTabAndVerifyUrl(
      loginPage.downloadButton,
      loginPage.downloadGuideURL
    );
  });

  test('should login successfully with correct credentials and navigate to dashboard', async ({
    loginPage,
    dashboardPage,
    mainNavigationComponent,
    request
  }) => {
    const APIE2ELoginUserModel: E2EAdminAuthDataModel = {
      uiE2EAccessTokenAdmin: `${UI_E2E_ACCESS_TOKEN_ADMIN}`,
      uiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`
    };

    // Arrange
    const supserAdminActivationCodeCreateResponse =
      await superAdminsActivationCodesCreate(
        request,
        APIE2ELoginUserModel.uiE2EAccessTokenSuperAdmin
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
      APIE2ELoginUserModel.uiE2EAccessTokenAdmin,
      registrationData
    );

    const companyRegistrationResponseJson =
      await companyRegistrationResponse.json();

    const appId = companyRegistrationResponseJson.data.recent_mobile_app_id;

    const adminFrontendAccessToken =
      companyRegistrationResponseJson.data.front_end_access_token;

    // Act
    await loginPage.loginWithToken(adminFrontendAccessToken, appId);

    const expectedURL = `${BASE_URL}/mobile/apps/${appId}/dashboard_beta`;
    const dashboardURL = await dashboardPage.validateUrl();

    // Assert
    expect(dashboardURL).toBe(expectedURL);
    await expect(mainNavigationComponent.settingsDropdownButton).toBeVisible();
  });
});
