import { UI_E2E_APP_ID } from '@_config/env.config';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class AccountSettingsPage extends BasePage {
  // Locators
  settingsDropdownLink = this.page.getByRole('link', {
    name: 'Settings dropdown'
  });
  signOutMenuItem = this.page.getByRole('menuitem', { name: 'Sign out' });

  constructor(page: Page, appId: string = UI_E2E_APP_ID) {
    super(page, appId);
  }

  /**
   * Signs out the user by clicking on Settings dropdown and then Sign out
   */
  async signOut(): Promise<void> {
    await this.settingsDropdownLink.click();
    await this.signOutMenuItem.click();
  }
}
