import { Page } from '@playwright/test';

export class MainNavigationComponent {
  constructor(private page: Page) {}

  settingsDropdownButton = this.page.getByRole('link', {
    name: 'Settings dropdown'
  });

  async clickSettingsDropdownButton(): Promise<void> {
    await this.settingsDropdownButton.click();
  }
}
