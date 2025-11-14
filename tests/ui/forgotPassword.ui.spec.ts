import { BASE_URL } from '@_config/env.config';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { E2EAdminLoginCredentialsModel } from '@_src/ui/models/admin.model';

test.describe('Forgot Password', () => {
  const expectedURL = `${BASE_URL}/admins/forgot_password`;
  const incorrectEmail: E2EAdminLoginCredentialsModel = {
    userEmail: 'incorrect_email.com',
    userPassword: ''
  };

  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['sealion'];

  test.beforeEach(async ({}) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.forgotPasswordButton.click();
  });

  test('should show error for invalid email format', async ({
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
