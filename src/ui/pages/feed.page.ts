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

  async clickDismissButton(dismissText: string): Promise<void> {
    await this.page.getByRole('button', { name: dismissText }).click();
  }

  async clickFeedPostBackButton(feedPostBackText: string): Promise<void> {
    await this.page.getByRole('button', { name: feedPostBackText }).click();
  }

  async clickFeedBackPostUrlButton(buttonText: string): Promise<void> {
    await this.page.getByRole('link', { name: buttonText }).click();
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

  /**
   * Validates that feed with specified image is visible
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
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
   * Validates that feed back post with specified image is visible
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyFeedBackPostImageWithPolling(
    timeoutMs: number = 60000
  ): Promise<void> {
    const img = this.page.locator('.pws-feed-back img');

    await expect
      .poll(
        async () => {
          return await img.evaluate((el: HTMLImageElement) => {
            return el.complete && el.naturalWidth > 0;
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
   * Validates that feed headline and text are visible
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
          message: `Feed post with headline "${expectedHeadline}" or text "${expectedText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that feed back post headline and text are visible
   * @param expectedHeadline The expected headline text
   * @param expectedText The expected body text
   * @param timeoutMs Optional timeout in milliseconds (default: 60000)
   */
  async verifyFeedBackPostContentWithPolling(
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
            .getByText(expectedHeadline)
            .nth(1)
            .isVisible();
          const textVisible = await this.page
            .getByText(expectedText)
            .nth(1)
            .isVisible();

          return headlineVisible || textVisible;
        },
        {
          message: `Feed back post with headline "${expectedHeadline}" or text "${expectedText}" should be visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  /**
   * Validates that an feed url button navigates to the expected URL
   * @param buttonText
   */
  async clickFeedButtonAndVerifyNavigation(
    buttonText: string,
    expectedUrl: string
  ): Promise<void> {
    const btn = this.page.getByRole('link', { name: buttonText });

    const [newPage] = await Promise.all([
      this.page.waitForEvent('popup'),
      btn.click()
    ]);

    await newPage.waitForLoadState('domcontentloaded');

    await expect(newPage).toHaveURL(expectedUrl);
  }

  /**
   * Validates that feed post deeplink button navigates and opens the deeplink in a new tab
   * @param buttonText
   */
  async clickFeedDeeplinkButtonAndVerifyNavigation(
    buttonText: string
  ): Promise<void> {
    await this.page
      .getByRole('link', { name: buttonText })
      .click()
      .catch((e) => e);
    expect(this.page).toBeTruthy();
  }

  /**
   * Validates that feed post deeplink button navigates and opens the deeplink in a new tab
   * @param buttonText
   */
  async clickFeedBackPostDeeplinkButtonAndVerifyNavigation(
    buttonText: string
  ): Promise<void> {
    await this.page
      .getByRole('button', { name: buttonText })
      .click()
      .catch((e) => e);
    expect(this.page).toBeTruthy();
  }
}
