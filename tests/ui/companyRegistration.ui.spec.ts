import { BASE_URL } from '@_config/env.config';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { CompanyRegistrationModel } from '@_src/ui/models/admin.model';
import { generateCompanyRegistrationData } from '@_src/ui/test-data/company-registration.data';

test.describe('Company Registration Page', () => {
  let registrationData: CompanyRegistrationModel;

  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['sealion'];

  test.beforeEach(async ({ companyRegistrationPage }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
    // Generate fresh test data for each test
    registrationData = generateCompanyRegistrationData();

    const expectedURL = `${BASE_URL}/admins/company_registration`;
    const companyRegistrationURL = await companyRegistrationPage.validateUrl();
    expect(companyRegistrationURL).toBe(expectedURL);
    await expect(
      companyRegistrationPage.headingNewAccountRegistration
    ).toBeVisible();
  });

  test('should validate error messages for missing and incorrect fields in Personal Details page', async ({
    companyRegistrationPage
  }) => {
    await companyRegistrationPage.clickButtonNext();

    // Validate missing field errors
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputName,
      companyRegistrationPage.fullNameMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputUsername,
      companyRegistrationPage.usernameMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputEmail,
      companyRegistrationPage.emailMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputPassword,
      companyRegistrationPage.passwordMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputPasswordConfirmation,
      companyRegistrationPage.passwordConfirmationMissingError
    );

    // Fill in the form with random but invalid data
    await companyRegistrationPage.inputName.fill(registrationData.fullName);
    await companyRegistrationPage.inputUsername.fill(registrationData.username);
    await companyRegistrationPage.inputEmail.fill(
      registrationData.invalidEmail
    );
    await companyRegistrationPage.inputPassword.fill(
      registrationData.shortPassword
    );

    await companyRegistrationPage.clickButtonNext();

    // Validate incorrect password format error
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputPassword,
      companyRegistrationPage.passwordFormatIncorrectError
    );

    await companyRegistrationPage.inputPassword.clear();
    await companyRegistrationPage.inputPassword.fill(
      registrationData.validPassword
    );
    await companyRegistrationPage.inputPasswordConfirmation.fill(
      registrationData.passwordConfirmation
    );

    await companyRegistrationPage.clickButtonNext();

    // Validate error messages
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputEmail,
      companyRegistrationPage.emailFormatIncorrectError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputPasswordConfirmation,
      companyRegistrationPage.passwordConfirmationMatchError
    );
  });
});
