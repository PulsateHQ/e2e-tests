import { Page } from '@playwright/test';

export class SideBarComponent {
  constructor(private page: Page) {}

  sidebarCategoryOpportunities = this.page.getByRole('listitem', {
    name: 'Sidebar item: Opportunities'
  });

  sidebarCategoryAnalyse = this.page.getByRole('listitem', {
    name: 'Sidebar category: Analyze'
  });

  sidebarItemDashboard = this.page.getByRole('listitem', {
    name: 'Sidebar item: Dashboard'
  });

  sidebarItemCampaignStats = this.page.getByRole('listitem', {
    name: 'Sidebar item: Campaign Stats'
  });

  sidebarCategoryTargeting = this.page.getByRole('listitem', {
    name: 'Sidebar category: Targeting'
  });

  sidebarItemSegments = this.page.getByRole('listitem', {
    name: 'Sidebar item: Segments'
  });

  sidebarItemGeofences = this.page.getByRole('listitem', {
    name: 'Sidebar item: Geofences'
  });

  sidebarCategoryCampaigns = this.page.getByRole('listitem', {
    name: 'Sidebar category: Campaigns'
  });

  sidebarCategoryJourneys = this.page.getByRole('listitem', {
    name: 'Sidebar category: Journeys'
  });

  sidebarCategoryUsers = this.page.getByRole('listitem', {
    name: 'Sidebar category: Users'
  });

  sidebarToggleButton = this.page.getByRole('button', { name: 'Hamburger' });

  async clickSidebarCategoryOpportunities(): Promise<void> {
    await this.sidebarCategoryOpportunities.click();
  }

  async clickSidebarCategoryAnalyse(): Promise<void> {
    await this.sidebarCategoryAnalyse.click();
  }

  async clickSidebarItemDashboard(): Promise<void> {
    await this.sidebarItemDashboard.click();
  }

  async clickSidebarItemCampaignStats(): Promise<void> {
    await this.sidebarItemCampaignStats.click();
  }

  async clickSidebarCategoryTargeting(): Promise<void> {
    await this.sidebarCategoryTargeting.click();
  }

  async clickSidebarItemSegments(): Promise<void> {
    await this.sidebarItemSegments.click();
  }

  async clickSidebarItemGeofences(): Promise<void> {
    await this.sidebarItemGeofences.click();
  }

  async clickSidebarCategoryCampaigns(): Promise<void> {
    await this.sidebarCategoryCampaigns.click();
  }

  async clickSidebarCategoryJourneys(): Promise<void> {
    await this.sidebarCategoryJourneys.click();
  }

  async clickSidebarCategoryUsers(): Promise<void> {
    await this.sidebarCategoryUsers.click();
  }

  async toggleSidebar(): Promise<void> {
    await this.sidebarToggleButton.click();
  }
}
