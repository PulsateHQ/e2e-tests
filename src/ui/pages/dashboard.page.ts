import { UI_INTEGRATION_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class DashboardPage extends BasePage {
  url = `/mobile/apps/${UI_INTEGRATION_APP_ID}/dashboard_beta`;
  sideBar: SideBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryAnalyse(): Promise<void> {
    await this.sideBar.clickSidebarCategoryAnalyse();
  }

  async clickSidebarItemDashboard(): Promise<void> {
    await this.sideBar.clickSidebarItemDashboard();
  }
}
