import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class GeofencesPage extends BasePage {
  url = `/mobile/apps/${process.env.APP_ID}/geofences`;
  sideBar: SideBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  async clickSidebarCategoryTargeting(): Promise<void> {
    await this.sideBar.clickSidebarCategoryTargeting();
  }

  async clickSidebarItemGeofences(): Promise<void> {
    await this.sideBar.clickSidebarItemGeofences();
  }
}