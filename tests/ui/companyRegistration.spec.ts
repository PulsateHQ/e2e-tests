import { BASE_URL } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { CompanyRegistrationModel } from '@_src/ui/models/user.model';
import { faker } from '@faker-js/faker';

const registrationData: CompanyRegistrationModel = {
  fullName: faker.internet.username(),
  username: faker.internet.username(),
  invalidEmail: 'wrong_email.com',
  validEmail: faker.internet.email(),
  shortPassword: faker.internet.password({ length: 7 }),
  validPassword: faker.internet.password({
    length: 8,
    memorable: false,
    pattern: /[A-Za-z0-9!@#$%^&*()_+]/,
    prefix: 'A1!'
  }),
  passwordConfirmation: 'Password',
  companyName: faker.company.name(),
  appName: faker.company.name(),
  activationCode: '012345678012345678012345678012345678'
};

test.describe('Company Registration Page', () => {
  test.beforeEach(async ({ companyRegistrationPage }) => {
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

  test('should validate error messages for missing and incorrect fields in Company Details page', async ({
    companyRegistrationPage
  }) => {
    // Fill in the form with valid data to navigate to the Company Details page
    await companyRegistrationPage.inputName.fill(registrationData.fullName);
    await companyRegistrationPage.inputUsername.fill(registrationData.username);
    await companyRegistrationPage.inputEmail.fill(registrationData.validEmail);
    await companyRegistrationPage.inputPassword.fill(
      registrationData.validPassword
    );
    await companyRegistrationPage.inputPasswordConfirmation.fill(
      registrationData.validPassword
    );

    await companyRegistrationPage.clickButtonNext();

    await expect(
      companyRegistrationPage.headingNewAccountRegistration
    ).toBeVisible();

    await companyRegistrationPage.clickButtonCreateAccount();

    // Validate missing company details errors
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputCompanyName,
      companyRegistrationPage.companyMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputAppName,
      companyRegistrationPage.appNameMissingError
    );
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputActivationCode,
      companyRegistrationPage.activationCodeMissingError
    );

    // Fill in the form with random valid data
    await companyRegistrationPage.inputCompanyName.fill(
      registrationData.companyName
    );
    await companyRegistrationPage.inputAppName.fill(registrationData.appName);
    await companyRegistrationPage.inputActivationCode.fill(
      registrationData.activationCode
    );

    await companyRegistrationPage.clickButtonCreateAccount();

    // Validate activation code error
    await companyRegistrationPage.validateErrorVisibility(
      companyRegistrationPage.inputActivationCode,
      companyRegistrationPage.activationCodeValidationError
    );

    await expect(companyRegistrationPage.buttonPrevious).toBeVisible();
  });
});
