import { UI_INTEGRATION_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class JourneysPage extends BasePage {
  url = `/mobile/apps/${UI_INTEGRATION_APP_ID}/journeys`;
  sideBar: SideBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryJourneys(): Promise<void> {
    await this.sideBar.clickSidebarCategoryJourneys();
  }
}
