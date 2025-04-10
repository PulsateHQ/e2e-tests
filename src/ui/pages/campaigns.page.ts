import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class CampaignsPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/campaigns`;
  sideBar: SideBarComponent;

  // Sidebar and navigation
  newCampaignButton = this.page.getByRole('link', { name: 'New Campaign' });

  // Campaign type selection
  inAppCampaignTile = this.page.getByTestId('in_app');

  // Layout options
  fullScreenLayoutOption = this.page.getByTestId('inapp-large');

  // Form elements
  campaignNameInput = this.page.getByRole('textbox', { name: 'Campaign Name' });
  saveAndContinueButton = this.page.getByRole('button', {
    name: 'Save & Continue'
  });

  // Call to Action section
  callToActionSection = this.page.getByText('Call to Action', { exact: true });
  buttonTextInput = this.page.getByRole('textbox', { name: 'Button Text' });
  urlButton = this.page.getByRole('button', { name: 'URL' });
  urlInput = this.page.getByRole('textbox', {
    name: 'https://www.example.com'
  });

  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  // Navigation methods
  async clickSidebarCategoryCampaigns(): Promise<void> {
    await this.sideBar.clickSidebarCategoryCampaigns();
  }

  async clickNewCampaign(): Promise<void> {
    await this.newCampaignButton.click();
  }

  // Split into separate navigation steps (without toggling sidebar)
  async navigateToCampaignsSection(): Promise<void> {
    await this.clickSidebarCategoryCampaigns();
  }

  async createNewCampaign(): Promise<void> {
    await this.clickNewCampaign();
  }

  // Campaign type and layout selection methods
  async selectInAppCampaignType(): Promise<void> {
    await this.inAppCampaignTile.click();
  }

  async selectFullScreenLayout(): Promise<void> {
    await this.fullScreenLayoutOption.click();
  }

  // Campaign form filling methods
  async enterCampaignName(name: string): Promise<void> {
    await this.campaignNameInput.fill(name);
  }

  async openCallToActionSection(): Promise<void> {
    await this.callToActionSection.click();
  }

  async enterButtonText(text: string): Promise<void> {
    await this.buttonTextInput.fill(text);
  }

  async selectUrlButtonType(): Promise<void> {
    await this.urlButton.click();
  }

  async enterButtonUrl(url: string): Promise<void> {
    await this.urlInput.fill(url);
  }

  async clickSaveAndContinue(): Promise<void> {
    await this.saveAndContinueButton.click();
  }

  // Combine all actions for creating a campaign
  async createInAppCampaign(
    campaignName: string,
    buttonText: string,
    buttonUrl: string
  ): Promise<void> {
    await this.enterCampaignName(campaignName);
    await this.clickSaveAndContinue();
    await this.openCallToActionSection();
    await this.enterButtonText(buttonText);
    await this.selectUrlButtonType();
    await this.enterButtonUrl(buttonUrl);
  }
}
