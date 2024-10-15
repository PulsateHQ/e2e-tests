import { Page } from '@playwright/test';

export class BasePage {
  url = '';
  constructor(protected page: Page) {}

  async goto(parameters = ''): Promise<void> {
    await this.page.goto(`${this.url}${parameters}`);
  }

  async validateUrl(expectedPath?: string): Promise<string> {
    const appId = process.env.APP_ID;
    const dynamicUrlPattern = new RegExp(`/mobile/apps/${appId}/.*`);
    const expectedUrl = expectedPath
      ? expectedPath.startsWith('/mobile/apps')
        ? dynamicUrlPattern
        : expectedPath
      : this.url;

    await this.page.waitForURL(expectedUrl);
    return this.page.url();
  }

  async waitForPageToLoadUrl(): Promise<void> {
    await this.page.waitForURL(this.url);
  }
}
