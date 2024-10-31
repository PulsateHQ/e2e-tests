import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class CompanyRegistrationPage extends BasePage {
  url = 'admins/company_registration';

  inputName = this.page.getByRole('textbox', { name: 'Full Name' });
  inputUsername = this.page.getByRole('textbox', { name: 'Username' });
  inputEmail = this.page.getByRole('textbox', { name: 'Email' });
  inputPassword = this.page.locator('#password');
  inputPasswordConfirmation = this.page.locator('#passwordConfirmation');
  buttonNext = this.page.getByRole('button', { name: 'Next' });
  headingNewAccountRegistration = this.page.getByRole('heading', {
    name: 'New Account Registration'
  });

  fullNameMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Full Name is missing' });
  usernameMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Username is missing' });
  emailMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Email is missing' });
  passwordMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Password is missing' });
  passwordConfirmationMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Password Confirmation is missing' });
  emailFormatIncorrectError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Email format is incorrect (ex: john@xyz.com)' });
  passwordFormatIncorrectError = this.page.getByRole('tooltip').filter({
    hasText:
      'Password must be at least 8 characters long with 1 uppercase, 1 lowercase, 1 digit and 1 special character'
  });
  passwordConfirmationMatchError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Password Confirmation must match password' });

  inputCompanyName = this.page.getByRole('textbox', { name: 'Company Name' });
  inputAppName = this.page.getByRole('textbox', { name: 'App Name' });
  inputActivationCode = this.page.getByRole('textbox', {
    name: 'Activation Code'
  });
  buttonPrevious = this.page.getByRole('button', { name: 'Previous' });
  buttonCreateAccount = this.page.getByRole('button', {
    name: 'Create account'
  });

  companyMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Company is missing' });
  appNameMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'App Name is missing' });
  activationCodeMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Activation Code is missing (length 36 or 40)' });
  activationCodeValidationError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Activation Code is not valid' });

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async clickButtonNext(): Promise<void> {
    await this.buttonNext.click();
  }

  async clickButtonCreateAccount(): Promise<void> {
    await this.buttonCreateAccount.click();
  }
}
