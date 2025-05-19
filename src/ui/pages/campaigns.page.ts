import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Locator, Page, expect } from '@playwright/test';

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

  /**
   * Verifies that a campaign link is visible in the list.
   * @param campaignName The exact name of the campaign link.
   * @param timeoutMs Optional timeout in milliseconds.
   */
  async verifyCampaignIsCreated(
    campaignName: string,
    timeoutMs?: number
  ): Promise<void> {
    const options = timeoutMs ? { timeout: timeoutMs } : undefined;
    await expect(
      this.page.getByRole('link', { name: campaignName }),
      `Campaign link '${campaignName}' should be visible`
    ).toBeVisible(options);
  }

  /**
   * Locates the table row containing a specific campaign link.
   * @param campaignName The exact name of the campaign link within the row.
   * @returns Locator for the table row.
   */
  private getCampaignRow(campaignName: string): Locator {
    // Find the row that contains the link with the specific campaign name
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: campaignName })
    });
  }

  /**
   * Verifies the status of a specific campaign using polling, which is more resilient to timing issues.
   * @param campaignName The exact name of the campaign.
   * @param status The expected status text (e.g., 'Draft', 'Scheduled', 'Delivered').
   * @param timeoutMs Optional timeout in milliseconds (default: 60000).
   */
  async verifyCampaignStatusWithPolling(
    campaignName: string,
    status: string,
    timeoutMs: number = 60000
  ): Promise<void> {
    const campaignRow = this.getCampaignRow(campaignName);

    // Use polling to repeatedly check for the status until it appears or times out
    await expect
      .poll(
        async () => {
          // Check both via aria-label and text content for more resilience
          const statusByLabel = await campaignRow
            .getByLabel(`Status: ${status}`)
            .isVisible();
          const statusByText = await campaignRow
            .locator(`span.badge:has-text("${status}")`)
            .isVisible();

          return statusByLabel || statusByText;
        },
        {
          message: `Campaign '${campaignName}' should have status '${status}' visible`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }
}
