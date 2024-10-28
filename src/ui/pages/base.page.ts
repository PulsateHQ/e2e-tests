import { Locator, Page, expect } from '@playwright/test';

export class BasePage {
  url = '';
  constructor(protected page: Page) {}

  async goto(parameters = ''): Promise<void> {
    await this.page.goto(`${this.url}${parameters}`);
  }

  async validateUrl(expectedPath?: string): Promise<string> {
    const expectedUrl = expectedPath ? expectedPath : this.url;
    await this.page.waitForURL(expectedUrl);
    return this.page.url();
  }

  async waitForPageToLoadUrl(): Promise<void> {
    await this.page.waitForURL(this.url);
  }

  async waitForNewTabAndVerifyUrl(
    button: { click: () => Promise<void> },
    expectedUrl: string
  ): Promise<void> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      button.click()
    ]);

    await newPage.waitForLoadState();
    const newPageUrl = newPage.url();
    if (newPageUrl !== expectedUrl) {
      throw new Error(
        `Expected URL to be ${expectedUrl}, but got ${newPageUrl}`
      );
    }
  }

  async validateErrorVisibility(
    hoverLocator: Locator,
    errorLocator: Locator
  ): Promise<void> {
    await hoverLocator.hover();
    await errorLocator.waitFor({ state: 'visible' });
    await expect(errorLocator).toBeVisible();
  }
}
