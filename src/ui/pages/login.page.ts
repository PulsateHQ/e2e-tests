import { UI2E2LoginUserModel } from '@_src/ui/models/user.model';
import { BasePage } from '@_src/ui/pages/base.page';
import { DashboardPage } from '@_src/ui/pages/dashboard.page';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  url = '/admins/sign_in';
  downloadGuideURL = 'https://info.pulsatehq.com/on-the-pulse-2-24';

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

  forgotPasswordButton = this.page.getByRole('link', {
    name: 'Forgot your password?'
  });

  passwordMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Password is missing' });

  incorrectUsernameOrPasswordError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'You have entered an incorrect username or password.' });

  usernameOrEmailMissingError = this.page
    .getByRole('tooltip')
    .filter({ hasText: 'Username or Email is missing' });

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async login(
    login: UI2E2LoginUserModel,
    password: UI2E2LoginUserModel
  ): Promise<DashboardPage> {
    await this.userEmailInput.fill(login.userEmail);
    await this.userPasswordInput.fill(login.userPassword);
    await this.loginButton.click();

    return new DashboardPage(this.page);
  }

  async loginWithToken(token: string, appId: string): Promise<DashboardPage> {
    const baseUrl = process.env.BASE_URL;
    const domain = new URL(baseUrl).hostname;

    // Set the user_token cookie
    await this.page.context().addCookies([
      {
        name: 'user_token',
        value: token,
        domain: domain,
        path: '/'
      }
    ]);

    // Navigate to dashboard directly and wait for load
    await this.page.goto(`${baseUrl}/mobile/apps/${appId}/dashboard_beta`);

    return new DashboardPage(this.page, appId);
  }
}
