import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Locator, Page } from '@playwright/test';

// Type for CTA (Call to Action) button types
export type CTAButtonType = 'Deeplink' | 'URL' | 'Open Feed' | 'Dismiss';

export class CampaignsPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/campaigns`;
  sideBar: SideBarComponent;

  // =========================================================================
  // Navigation Locators
  // =========================================================================
  newCampaignButton = this.page.getByRole('link', { name: 'New Campaign' });

  // Campaign type selection
  inAppCampaignTile = this.page.getByTestId('in_app');
  inAppLargeLayoutOption = this.page.getByTestId('inapp-large');

  saveAndContinueButton = this.page.getByRole('button', {
    name: 'Save & Continue'
  });

  // Set up campaign name input
  campaignNameInput = this.page.getByRole('textbox', { name: 'Campaign Name' });

  // =========================================================================
  // Content Section Locators
  // =========================================================================

  // Section headers
  personalMessageSection = this.page.getByText('Personal Message', {
    exact: true
  });
  imageSection = this.page.getByText('Image', { exact: true });
  headlineSection = this.page.getByText('Headline', { exact: true });
  textSection = this.page.getByText('Text', { exact: true });
  callToActionSection = this.page.getByText('Call to Action', { exact: true });

  // Toggle switches
  personalMessageToggle = this.page
    .locator('div:has-text("Personal Message") ~ div .react-switch-bg')
    .first();
  imageToggle = this.page
    .locator('div:has-text("Image") ~ div .react-switch-bg')
    .first();
  headlineToggle = this.page
    .locator('div:has-text("Headline") ~ div .react-switch-bg')
    .first();
  textToggle = this.page
    .locator('div:has-text("Text") ~ div .react-switch-bg')
    .first();

  // Content input fields
  personalMessageInput = this.page
    .locator('div[data-testid="collapse"]')
    .filter({
      has: this.page.locator(
        '.textarea__placeholder:has-text("Add a personal message...")'
      )
    })
    .locator('div[data-testid="textarea"]');

  headlineInput = this.page.locator(
    'div:nth-child(2) > .collapse > div > div > div[data-testid="textarea"][contenteditable="true"]'
  );

  textInput = this.page
    .locator('div[data-testid="collapse"]')
    .filter({
      has: this.page.locator(
        '.textarea__placeholder:has-text("Tell people more about your campaign")'
      )
    })
    .locator('div[data-testid="textarea"]');

  // =========================================================================
  // Call To Action Locators
  // =========================================================================

  // Button count selection
  buttonCountDropdown = this.page
    .locator('.dropdown-toggle')
    .filter({ hasText: /1 Button|2 Buttons/ })
    .first();
  oneButtonOption = this.page.getByRole('menuitem', { name: '1 Button' });
  twoButtonsOption = this.page.getByRole('menuitem', { name: '2 Buttons' });

  // CTA button types
  deeplinkButton = this.page
    .getByTestId('cta-button')
    .filter({ hasText: 'Deeplink' });
  urlButton = this.page.getByTestId('cta-button').filter({ hasText: 'URL' });
  openFeedButton = this.page
    .getByTestId('cta-button')
    .filter({ hasText: 'Open Feed' });
  dismissButton = this.page
    .getByTestId('cta-button')
    .filter({ hasText: 'Dismiss' });

  // Button Configuration
  buttonTextInput = this.page.getByRole('textbox', { name: 'Button Text' });
  urlInput = this.page.getByRole('textbox', {
    name: 'https://www.example.com'
  });
  deeplinkDropdown = this.page.getByRole('button', { name: 'Select Deeplink' });

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

  async selectInAppCampaignType(): Promise<void> {
    await this.inAppCampaignTile.click();
  }

  async selectInAppLargeLayout(): Promise<void> {
    await this.inAppLargeLayoutOption.click();
  }

  async enterCampaignName(name: string): Promise<void> {
    await this.campaignNameInput.fill(name);
  }

  async clickSaveAndContinue(): Promise<void> {
    await this.saveAndContinueButton.click();
  }

  // =========================================================================
  // Content Section Methods
  // =========================================================================

  async enterPersonalMessage(message: string): Promise<void> {
    await this.personalMessageInput.fill(message);
  }

  async enterHeadline(headline: string): Promise<void> {
    // First, make sure the Headline section is expanded
    await this.headlineSection.click();

    // Wait for the editable element to be visible
    await this.headlineInput.waitFor({ state: 'visible', timeout: 5000 });

    // Fill in the text
    await this.headlineInput.fill(headline);
  }

  async enterText(text: string): Promise<void> {
    await this.textInput.fill(text);
  }

  // =========================================================================
  // Call To Action Methods
  // =========================================================================
  async openCallToActionSection(): Promise<void> {
    await this.callToActionSection.click();
  }

  async selectButtonCount(count: 1 | 2): Promise<void> {
    await this.openCallToActionSection();
    await this.buttonCountDropdown.click();

    if (count === 1) {
      await this.oneButtonOption.click();
    } else {
      await this.twoButtonsOption.click();
    }
  }

  getCTAButton(type: CTAButtonType, buttonIndex: number = 0): Locator {
    switch (type) {
      case 'Deeplink':
        return this.deeplinkButton.nth(buttonIndex);
      case 'URL':
        return this.urlButton.nth(buttonIndex);
      case 'Open Feed':
        return this.openFeedButton.nth(buttonIndex);
      case 'Dismiss':
        return this.dismissButton.nth(buttonIndex);
      default:
        throw new Error(`Unknown CTA button type: ${type}`);
    }
  }

  async selectCTAButtonType(
    type: CTAButtonType,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.getCTAButton(type, buttonIndex).click();
  }

  // Button text input helpers
  getButtonTextInput(buttonNumber: 1 | 2): Locator {
    return this.page
      .locator(`div`)
      .filter({ hasText: new RegExp(`Button ${buttonNumber}`) })
      .locator('.input-group')
      .locator('input[placeholder="Button Text"]');
  }

  // Specific button text inputs
  buttonOneTextInput = this.getButtonTextInput(1);
  buttonTwoTextInput = this.getButtonTextInput(2);

  async enterButtonText(text: string, buttonIndex?: number): Promise<void> {
    if (buttonIndex === 2) {
      await this.buttonTwoTextInput.fill(text);
    } else {
      // Default to first button if no index or index is 1
      await this.buttonOneTextInput.fill(text);
    }
  }

  async enterButtonUrl(url: string): Promise<void> {
    await this.urlInput.fill(url);
  }

  // Deeplink helpers
  getDeeplinkOption(name: string): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  getSelectedDeeplinkDropdown(optionName: string): Locator {
    return this.page
      .getByRole('button')
      .filter({
        hasText: optionName
      })
      .first();
  }

  async selectDeeplinkOption(
    optionName: string | string[] = 'AdminEdit'
  ): Promise<void> {
    // Select the Deeplink dropdown
    await this.deeplinkDropdown.click();

    // If provided with an array of options, try each one until one works
    if (Array.isArray(optionName)) {
      for (const option of optionName) {
        const deeplinkOption = this.getDeeplinkOption(option);

        // Check if this option exists in the dropdown
        if (await deeplinkOption.isVisible()) {
          // Click the specified deeplink option
          await deeplinkOption.click();

          // Verify the option is selected
          const selectedDropdown = this.getSelectedDeeplinkDropdown(option);
          await selectedDropdown.waitFor({ state: 'visible' });
          return;
        }
      }
      // If we get here, none of the options were found
      throw new Error(
        `None of the provided deeplink options were found: ${optionName.join(', ')}`
      );
    } else {
      // Original behavior for a single string option
      // Click the specified deeplink option
      await this.getDeeplinkOption(optionName).click();

      // Verify the option is selected (selected dropdown now shows the option name)
      const selectedDropdown = this.getSelectedDeeplinkDropdown(optionName);
      await selectedDropdown.waitFor({ state: 'visible' });
    }
  }

  // =========================================================================
  // In-App Campaign Setup Helpers
  // =========================================================================

  /**
   * Expands or collapses a content section
   * @param section The section to expand/collapse
   */
  async expandCollapseSection(
    section: 'Personal Message' | 'Image' | 'Headline' | 'Text'
  ): Promise<void> {
    switch (section) {
      case 'Personal Message':
        await this.personalMessageSection.click();
        break;
      case 'Image':
        await this.imageSection.click();
        break;
      case 'Headline':
        await this.headlineSection.click();
        break;
      case 'Text':
        await this.textSection.click();
        break;
    }
  }

  /**
   * Toggles a content section using the toggle switch
   * @param section The section to toggle
   */
  async toggleSectionSwitch(
    section: 'Personal Message' | 'Image' | 'Headline' | 'Text'
  ): Promise<void> {
    let sectionToggle: Locator;

    switch (section) {
      case 'Personal Message':
        sectionToggle = this.personalMessageToggle;
        break;
      case 'Image':
        sectionToggle = this.imageToggle;
        break;
      case 'Headline':
        sectionToggle = this.headlineToggle;
        break;
      case 'Text':
        sectionToggle = this.textToggle;
        break;
    }

    // Just click the toggle
    await sectionToggle.click();
  }

  /**
   * Configures a URL button in the Call to Action section
   * @param buttonText The text to display on the button
   * @param url The URL the button should link to
   * @param buttonIndex Which button to configure (for multi-button setups)
   */
  async setupUrlButton(
    buttonText: string,
    url: string,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('URL', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
    await this.enterButtonUrl(url);
  }

  /**
   * Configures a Deeplink button in the Call to Action section
   * @param buttonText The text to display on the button
   * @param deeplinkOption The deeplink option to select
   * @param buttonIndex Which button to configure (for multi-button setups)
   */
  async setupDeeplinkButton(
    buttonText: string,
    deeplinkOption: string | string[],
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('Deeplink', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
    await this.selectDeeplinkOption(deeplinkOption);
  }

  /**
   * Configures an Open Feed button in the Call to Action section
   * @param buttonText The text to display on the button
   * @param buttonIndex Which button to configure (for multi-button setups)
   */
  async setupOpenFeedButton(
    buttonText: string,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('Open Feed', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
  }

  /**
   * Configures a Dismiss button in the Call to Action section
   * @param buttonText The text to display on the button
   * @param buttonIndex Which button to configure (for multi-button setups)
   */
  async setupDismissButton(
    buttonText: string,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('Dismiss', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
  }
}
