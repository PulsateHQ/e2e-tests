import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page, expect } from '@playwright/test';

export class FeedPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/feed`;
  sideBar: SideBarComponent;

  // =========================================================================
  // Constructor
  // =========================================================================

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async verifyFeedPage(): Promise<void> {
    await expect(this.page).toHaveURL(/feed/);
  }

  /**
   * Validates that feed with specified text is visible
   * @param buttonText The expected button text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyFeedWithPolling(
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
   * Validates that feed with specified text is visible
   * @param buttonText The expected button text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyFeedButtonWithPolling(
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
