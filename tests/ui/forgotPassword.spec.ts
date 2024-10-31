import { BASE_URL } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { LoginUserModel } from '@_src/ui/models/user.model';

test.describe('Forgot Password Functionality', () => {
  const expectedURL = `${BASE_URL}/admins/forgot_password`;
  const incorrectEmail: LoginUserModel = {
    userEmail: 'incorrect_email.com',
    userPassword: ''
  };
  const loginUserData: LoginUserModel = {
    userEmail: 'randomEmail@pulsate.com',
    userPassword: ''
  };

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.forgotPasswordButton.click();
  });

  test('should display an error message for incorrect email format', async ({
    forgotPasswordPage
  }) => {
    await forgotPasswordPage.resetYourPassword(incorrectEmail.userEmail);
    await forgotPasswordPage.validateErrorVisibility(
      forgotPasswordPage.forgotPasswordEmailInput,
      forgotPasswordPage.emailFormatIncorrectError
    );

    const loginURL = await forgotPasswordPage.validateUrl();
    expect(loginURL).toBe(expectedURL);
  });

  test('should display a success message for valid email', async ({
    forgotPasswordPage,
    loginPage
  }) => {
    await forgotPasswordPage.resetYourPassword(loginUserData.userEmail);
    await expect(forgotPasswordPage.forgotPasswordSucceedMessage).toBeVisible();
    await forgotPasswordPage.backToSignInButton.click();
    await expect.soft(loginPage.loginButton).toBeVisible();
  });
});
