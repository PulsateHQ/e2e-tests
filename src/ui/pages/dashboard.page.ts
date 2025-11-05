import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page, expect } from '@playwright/test';

export class DashboardPage extends BasePage {
  sideBar: SideBarComponent;
  notificationButton = this.page.getByRole('link', { name: 'Notifications' });

  constructor(page: Page, appId: string = UI_E2E_APP_ID) {
    super(page, appId);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryAnalyse(): Promise<void> {
    await this.sideBar.clickSidebarCategoryAnalyse();
  }

  async clickSidebarItemDashboard(): Promise<void> {
    await this.sideBar.clickSidebarItemDashboard();
  }

  async clickNotificationButton(): Promise<void> {
    await this.notificationButton.click();
  }

  async clickInAppButton(buttonText: string): Promise<void> {
    const buttonLocator = this.page.getByRole('button', { name: buttonText });
    await buttonLocator.click();
  }

  async clickInAppButtonUrl(buttonText: string): Promise<void> {
    const buttonLocator = this.page.getByRole('link', { name: buttonText });
    await buttonLocator.click();
  }

  /**
   * Validates that an in-app headline and text are visible
   * @param expectedHeadline The expected headline text
   * @param expectedText The expected body text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyInAppContentWithPolling(
    expectedHeadline: string,
    expectedText: string,
    timeoutMs: number = 60000
  ): Promise<void> {
    // Use polling to repeatedly check until the content appears or times out
    await expect
      .poll(
        async () => {
          // Check either headline or text is visible for resilience
          const headlineVisible = await this.page
            .getByText(expectedHeadline, { exact: true })
            .isVisible();
          const textVisible = await this.page
            .getByText(expectedText, { exact: true })
            .isVisible();

          return headlineVisible || textVisible;
        },
        {
          message: `In-app message with headline "${expectedHeadline}" or text "${expectedText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that an in-app button with specified text is visible
   * @param buttonText The expected button text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyInAppButtonWithPolling(
    buttonText: string,
    timeoutMs: number = 60000
  ): Promise<void> {
    // Use polling to repeatedly check until the button appears or times out
    await expect
      .poll(
        async () => {
          return await this.page
            .getByRole('link', { name: buttonText })
            .isVisible();
        },
        {
          message: `Button with text "${buttonText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that an in-app button has the expected URL
   * @param buttonText The button text to identify the button
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyInAppButtonUrlWithPolling(
    buttonText: string,
    timeoutMs: number = 60000
  ): Promise<void> {
    const buttonLocator = this.page.getByRole('link', { name: buttonText });

    // Use polling to repeatedly check until the URL matches or times out
    await expect
      .poll(
        async () => {
          // First check if the button is visible
          const isVisible = await buttonLocator.isVisible();
          return isVisible;
        },
        {
          message: `Button with text "${buttonText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that an in-app button with specified text is visible
   * @param buttonText The expected button text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyInAppDismissButtonWithPolling(
    buttonText: string,
    timeoutMs: number = 60000
  ): Promise<void> {
    // Use polling to repeatedly check until the button appears or times out
    await expect
      .poll(
        async () => {
          return await this.page
            .getByRole('button', { name: buttonText })
            .isVisible();
        },
        {
          message: `Button with text "${buttonText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }
}
