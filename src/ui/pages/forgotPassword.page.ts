import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class ForgotPasswordPage extends BasePage {
  url = '/admins/forgot_password';

  forgotPasswordEmailInput = this.page.getByRole('textbox', { name: 'Email' });

  emailFormatIncorrectError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Email format is incorrect (ex: john@xyz.com)' });

  resetYourPasswordButton = this.page.getByRole('button', {
    name: 'Reset your password'
  });

  forgotPasswordSucceedMessage = this.page.getByText(
    'You will receive an email with instructions on how to reset your password in a few minutes.'
  );

  backToSignInButton = this.page.getByRole('link', { name: 'Back to sign In' });

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async resetYourPassword(userEmail: string): Promise<void> {
    await this.forgotPasswordEmailInput.fill(userEmail);
    await this.resetYourPasswordButton.click();
  }
}
