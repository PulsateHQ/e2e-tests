import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class JourneysPage extends BasePage {
  url = `/mobile/apps/${process.env.APP_ID}/beacons`;
  sideBar: SideBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryJourneys(): Promise<void> {
    await this.sideBar.clickSidebarCategoryJourneys();
  }
}
