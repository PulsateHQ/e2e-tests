import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class CampaignsPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/campaigns`;
  sideBar: SideBarComponent;

  // =========================================================================
  // Navigation Locators
  // =========================================================================
  newCampaignButton = this.page.getByRole('link', { name: 'New Campaign' });

  // =========================================================================
  // Constructor
  // =========================================================================
  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  // =========================================================================
  // Navigation Methods
  // =========================================================================
  async navigateToCampaignsSection(): Promise<void> {
    await this.sideBar.clickSidebarCategoryCampaigns();
  }

  async createNewCampaign(): Promise<void> {
    await this.newCampaignButton.click();
  }
}
