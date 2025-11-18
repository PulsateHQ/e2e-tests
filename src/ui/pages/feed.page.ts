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

  async verifyFeedImageWithPolling(timeoutMs: number = 60000): Promise<void> {
    const imgLocator = this.page.locator('.pws-img-feed');

    await expect
      .poll(
        async () => {
          const imgEl = await imgLocator.elementHandle();
          if (!imgEl) {
            return false; // not even in the DOM yet
          }

          // Evaluate inside the browser: check load state
          return await imgEl.evaluate((node: HTMLImageElement) => {
            return node.complete && node.naturalWidth > 0;
          });
        },
        {
          message: 'Image should be fully loaded',
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that an in-app headline and text are visible
   * @param expectedHeadline The expected headline text
   * @param expectedText The expected body text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyFeedContentWithPolling(
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
}
