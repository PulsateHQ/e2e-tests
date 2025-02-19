import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  BASE_URL,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import { registerCompany } from '@_src/api/factories/admins.api.factory';
import { superAdminsActivationCodesCreate } from '@_src/api/factories/super.admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateCompanyPayload } from '@_src/api/test-data/admins/company-registration';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { UIIntegrationLoginUserModel } from '@_src/ui/models/user.model';

test.describe('Login Functionality', () => {
  test('should reject login with incorrect password and display error messages', async ({
    loginPage
  }) => {
    const expectedURL = `${BASE_URL}/admins/sign_in`;

    const loginUserDataMissingPassword: UIIntegrationLoginUserModel = {
      userEmail: `${UI_INTEGRATION_LOGIN_ADMIN}`,
      userPassword: ``
    };

    const loginUserDataMissingEmail: UIIntegrationLoginUserModel = {
      userEmail: ``,
      userPassword: `${UI_INTEGRATION_PASSWORD_ADMIN}`
    };

    const loginUserDataIncorrectPassword: UIIntegrationLoginUserModel = {
      userEmail: `${UI_INTEGRATION_LOGIN_ADMIN}`,
      userPassword: `incorrect_password`
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

    await loginPage.login(loginUserDataIncorrectPassword);
    await loginPage.validateErrorVisibility(
      loginPage.userPasswordInput,
      loginPage.incorrectUsernameOrPasswordError
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
    const APIE2ELoginUserModel: APIE2ELoginUserModel = {
      apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
      apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
      apiE2EAppId: `${API_E2E_APP_ID}`
    };

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
