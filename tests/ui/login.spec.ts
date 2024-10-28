import {
  BASE_URL,
  USER_LOGIN_ADMIN,
  USER_PASSWORD_ADMIN
} from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { LoginUserModel } from '@_src/ui/models/user.model';

test.describe('Login Functionality', () => {
  test('should reject login with incorrect password and display error messages', async ({
    loginPage
  }) => {
    const expectedURL = `${BASE_URL}/admins/sign_in`;

    const loginUserDataMissingPassword: LoginUserModel = {
      userEmail: `${USER_LOGIN_ADMIN}`,
      userPassword: ``
    };

    const loginUserDataMissingEmail: LoginUserModel = {
      userEmail: ``,
      userPassword: `${USER_PASSWORD_ADMIN}`
    };

    const loginUserDataIncorrectPassword: LoginUserModel = {
      userEmail: `${USER_LOGIN_ADMIN}`,
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
    mainNavigationComponent
  }) => {
    const loginUserData: LoginUserModel = {
      userEmail: `${USER_LOGIN_ADMIN}`,
      userPassword: `${USER_PASSWORD_ADMIN}`
    };

    await loginPage.login(loginUserData);

    const expectedURL = `${BASE_URL}/mobile/apps/${process.env.APP_ID}/dashboard_beta`;

    const dashboardURL = await dashboardPage.validateUrl();

    expect(dashboardURL).toBe(expectedURL);

    await expect(mainNavigationComponent.settingsDropdownButton).toBeVisible();
  });
});
