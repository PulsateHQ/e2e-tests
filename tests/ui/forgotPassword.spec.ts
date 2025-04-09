import { BASE_URL } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { UI2E2LoginUserModel } from '@_src/ui/models/user.model';

test.describe('Forgot Password Functionality', () => {
  const expectedURL = `${BASE_URL}/admins/forgot_password`;
  const incorrectEmail: UI2E2LoginUserModel = {
    userEmail: 'incorrect_email.com',
    userPassword: ''
  };
  const loginUserData: UI2E2LoginUserModel = {
    userEmail: 'randomEmail@pulsate.com',
    userPassword: ''
  };

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.forgotPasswordButton.click();
  });

  test('should display an error message for incorrect email format', async ({
    forgotPasswordPage
  }) => {
    const loginURL = await forgotPasswordPage.validateUrl();

    await forgotPasswordPage.resetYourPassword(incorrectEmail.userEmail);
    await forgotPasswordPage.validateErrorVisibility(
      forgotPasswordPage.forgotPasswordEmailInput,
      forgotPasswordPage.emailFormatIncorrectError
    );

    expect(loginURL).toBe(expectedURL);
  });
});
