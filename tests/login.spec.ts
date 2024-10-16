import {
  BASE_URL,
  USER_LOGIN_ADMIN,
  USER_PASSWORD_ADMIN
} from '@_config/env.config';
import { expect, test } from '@_src/fixtures/merge.fixture';
import { LoginUserModel } from '@_src/models/user.model';

test.describe('Verify login', () => {
  test('reject login with incorrect password and validate banner', async ({
    loginPage,
    context
  }) => {
    const expectedURL = `${BASE_URL}/admins/sign_in`;

    const loginUserData: LoginUserModel = {
      userEmail: `${USER_LOGIN_ADMIN}`,
      userPassword: 'incorrectPassword'
    };

    await expect
      .soft(loginPage.downloadButton)
      .toHaveText('Download Your Guide Now');

    // Listen for the new tab to open
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      loginPage.downloadButton.click()
    ]);

    // Verify the URL of the new tab
    const downloadGuideURL = 'https://info.pulsatehq.com/on-the-pulse-2-24';
    await newPage.waitForLoadState();
    const newPageUrl = newPage.url();
    expect(newPageUrl).toBe(downloadGuideURL);

    await loginPage.login(loginUserData);

    const loginURL = await loginPage.validateUrl();
    expect(loginURL).toBe(expectedURL);

    await expect.soft(loginPage.loginButton).toBeVisible();
  });

  test('forgot you password', async ({ loginPage, forgotPasswordPage }) => {
    const expectedURL = `${BASE_URL}/admins/forgot_password`;

    const loginUserData: LoginUserModel = {
      userEmail: 'incorrectPassword@pulsate.com',
      userPassword: 'incorrectPassword'
    };

    await loginPage.forgotPassworddButton.click();

    const loginURL = await forgotPasswordPage.validateUrl();
    expect(loginURL).toBe(expectedURL);

    await forgotPasswordPage.resetYourPassword(loginUserData.userEmail);

    await expect
      .soft(forgotPasswordPage.forgotPasswordSucceedMessage)
      .toBeVisible();

    await forgotPasswordPage.backToSignInButton.click();

    await expect.soft(loginPage.loginButton).toBeVisible();
  });

  test('login with correct credentials', async ({
    loginPage,
    dashboardPage,
    page
  }) => {
    const loginUserData: LoginUserModel = {
      userEmail: `${USER_LOGIN_ADMIN}`,
      userPassword: `${USER_PASSWORD_ADMIN}`
    };

    await loginPage.login(loginUserData);

    const expectedURL = `${BASE_URL}/mobile/apps/${process.env.APP_ID}/dashboard_beta`;

    const dashboardURL = await dashboardPage.validateUrl();

    expect(dashboardURL).toBe(expectedURL);

    await expect(page.getByText('WEB SDK POC')).toBeVisible();
  });
});
