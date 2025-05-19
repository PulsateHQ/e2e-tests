import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class CampaignStatsPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/reports`;
  sideBar: SideBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryAnalyse(): Promise<void> {
    await this.sideBar.clickSidebarCategoryAnalyse();
  }

  async clickSidebarItemCampaignStats(): Promise<void> {
    await this.sideBar.clickSidebarItemCampaignStats();
  }
}
