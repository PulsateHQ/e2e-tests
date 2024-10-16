import { DashboardPage } from '@_src/pages/dashboard.page';
import { ForgotPasswordPage } from '@_src/pages/forgotPassword.page';
import { LoginPage } from '@_src/pages/login.page';
import { test as baseTest } from '@playwright/test';

interface Pages {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
}

export const pageObjectTest = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  }
});
