import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class DashboardPage extends BasePage {
  sideBar: SideBarComponent;

  constructor(page: Page, appId: string = UI_E2E_APP_ID) {
    super(page, appId);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryOpportunities(): Promise<void> {
    await this.sideBar.clickSidebarCategoryOpportunities();
  }
}
