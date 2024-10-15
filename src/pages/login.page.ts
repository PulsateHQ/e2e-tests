import { LoginUserModel } from '@_src/models/user.model';
import { BasePage } from '@_src/pages/base.page';
import { DashboardPage } from '@_src/pages/dashboard.page';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  url = '/admins/sign_in';

  userEmailInput = this.page.getByRole('textbox', {
    name: 'Username or Email'
  });
  userPasswordInput = this.page.getByRole('textbox', {
    name: 'Password Forgot your password?'
  });
  loginButton = this.page.getByRole('button', {
    name: 'Sign in'
  });

  downloadButton = this.page.getByRole('link', {
    name: 'Download Your Guide Now arrow'
  });

  forgotPassworddButton = this.page.getByRole('link', {
    name: 'Forgot your password?'
  });

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async login(loginUserData: LoginUserModel): Promise<DashboardPage> {
    await this.userEmailInput.fill(loginUserData.userEmail);
    await this.userPasswordInput.fill(loginUserData.userPassword);
    await this.loginButton.click();

    return new DashboardPage(this.page);
  }
}
