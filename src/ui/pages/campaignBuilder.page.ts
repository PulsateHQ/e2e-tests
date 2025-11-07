import { BasePage } from '@_src/ui/pages/base.page';
import { Locator, Page, expect } from '@playwright/test';

// Type for CTA (Call to Action) button types
export type CTAButtonType =
  | 'Deeplink'
  | 'URL'
  | 'Open Feed'
  | 'Dismiss'
  | 'Feed Post (Back)';

export class CampaignBuilderPage extends BasePage {
  // =========================================================================
  // Campaign Setup Locators
  // =========================================================================
  inAppCampaignTile = this.page.getByTestId('in_app');
  inAppLargeLayoutOption = this.page.getByTestId('inapp-large');
  feedPostTile = this.page.getByTestId('card');

  saveAndContinueButton = this.page.getByRole('button', {
    name: 'Save & Continue'
  });

  campaignNameInput = this.page.getByRole('textbox', { name: 'Campaign Name' });

  // =========================================================================
  // Content Section Locators
  // =========================================================================

  mediaSection = this.page.getByText('Media');
  imageSection = this.page.getByText('Image', { exact: true });
  headlineSection = this.page.getByText('Headline', { exact: true });
  textSection = this.page.getByText('Text', { exact: true });
  tableSection = this.page.getByText('Table', { exact: true });
  callToActionSection = this.page.getByText('Call to action');

  mediaToggle = this.page
    .locator('div:has-text("Media") ~ div .react-switch-bg')
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
  tableToggle = this.page
    .locator(
      'div[data-testid="collapseDrag"]:has-text("Table") ~ div .react-switch-bg'
    )
    .first();

  headlineInput = this.page.locator('div:nth-child(2) > .collapse > div > div');

  textInput = this.page
    .locator('div')
    .filter({ hasText: /^Tell people more about your campaign\.\.\.$/ });

  // =========================================================================
  // Call To Action Locators
  // =========================================================================
  buttonCountDropdown = this.page
    .locator('.dropdown-toggle')
    .filter({ hasText: /1 Button|2 Buttons|Select Button Categories/ })
    .first();
  oneButtonOption = this.page.getByRole('menuitem', { name: '1 Button' });
  twoButtonsOption = this.page.getByRole('menuitem', { name: '2 Buttons' });

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
  feedPostBackButton = this.page
    .getByTestId('cta-button')
    .filter({ hasText: 'Feed Post (Back)' });

  buttonTextInput = this.page.getByRole('textbox', { name: 'Button Text' });
  urlInput = this.page.getByRole('textbox', {
    name: 'https://www.example.com'
  });
  deeplinkDropdown = this.page.getByRole('button', { name: 'Select Deeplink' });

  // =========================================================================
  // Target Step Locators
  // =========================================================================
  segmentsTargetingToggle = this.page.locator('.react-switch-bg').first();

  segmentsSectionLabel = this.page.getByText('segments', { exact: true });
  getSegmentTargetingOption(segmentName: string): Locator {
    return this.page
      .getByRole('button', { name: segmentName, exact: true })
      .first();
  }

  // =========================================================================
  // Deliver Step Locators
  // =========================================================================
  deliverStepHeading: Locator = this.page.getByRole('heading', {
    name: 'Which users should receive' // Using partial name for robustness
  });
  // Using getByText for now, might need refinement if structure changes
  oneTimeSegmentOption: Locator = this.page.getByRole('img', {
    name: 'One Time Segment'
  });

  immediatelyActivationButton: Locator = this.page.getByText('Immediately', {
    exact: true
  });
  // Assuming 'Never' relates to an expiry setting that appears
  neverExpireOption: Locator = this.page.getByText('Never', { exact: true });

  // =========================================================================
  // Review Step Locators
  // =========================================================================

  notificationStepHeading: Locator = this.page.getByRole('heading', {
    name: 'Notification'
  });

  sendCampaignButton: Locator = this.page.getByRole('button', {
    name: 'Send Campaign'
  });

  sendCampaignDialogButton: Locator = this.page
    .getByRole('dialog')
    .getByRole('button', { name: 'Send Campaign' });

  // =========================================================================
  // Constructor
  // =========================================================================
  constructor(page: Page) {
    super(page);
    // Note: SidebarComponent is not needed here as navigation is handled by CampaignsPage
  }

  // =========================================================================
  // Campaign Setup Methods
  // =========================================================================
  async selectInAppCampaignType(): Promise<void> {
    await this.inAppCampaignTile.click();
  }

  async selectFeedPostCampaignType(): Promise<void> {
    await this.feedPostTile.click();
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
  async enterHeadline(headline: string): Promise<void> {
    // Reverted to simpler version based on user's previous commits
    await this.headlineInput.first().click(); // Assuming first() is needed if locator isn't unique
    await this.page.keyboard.type(headline);
  }

  async enterText(text: string): Promise<void> {
    // Reverted to simpler version based on user's previous commits
    await this.textInput.click();
    await this.page.keyboard.type(text);
  }

  // =========================================================================
  // Call To Action Methods
  // =========================================================================
  async openCallToActionSection(): Promise<void> {
    // Check if section is already open by verifying button inputs are visible
    // Reason: Avoid collapsing section if already open
    const isSectionOpen = await this.getButtonTextInput(1)
      .isVisible()
      .catch(() => false);
    if (!isSectionOpen) {
      await this.callToActionSection.click();
    }
  }

  async selectButtonCount(count: 1 | 2): Promise<void> {
    await this.buttonCountDropdown.click();

    if (count === 1) {
      await this.oneButtonOption.click();
    } else {
      await this.twoButtonsOption.click();
    }

    // Wait for the button text input to be available after selecting count
    await this.getButtonTextInput(1).waitFor({ state: 'visible' });
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
      case 'Feed Post (Back)':
        return this.feedPostBackButton.nth(buttonIndex);
      default:
        throw new Error(`Unknown CTA button type: ${type}`);
    }
  }

  async selectCTAButtonType(
    type: CTAButtonType,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.getCTAButton(type, buttonIndex).click();
  }

  getButtonTextInput(buttonNumber: 1 | 2): Locator {
    // Find the button text input by placeholder
    // Since button number selection determines which input is visible, use nth index
    // Button 1 is index 0, Button 2 is index 1
    return this.page.getByPlaceholder('Button Text').nth(buttonNumber - 1);
  }

  buttonOneTextInput = this.getButtonTextInput(1);
  buttonTwoTextInput = this.getButtonTextInput(2);

  async enterButtonText(text: string, buttonIndex?: number): Promise<void> {
    if (buttonIndex === 2) {
      await this.buttonTwoTextInput.waitFor({ state: 'visible' });
      await this.buttonTwoTextInput.fill(text);
    } else {
      await this.buttonOneTextInput.waitFor({ state: 'visible' });
      await this.buttonOneTextInput.fill(text);
    }
  }

  async enterButtonUrl(url: string): Promise<void> {
    await this.urlInput.fill(url);
  }

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
    // Don't reopen section - it should already be open from setupDeeplinkButton
    // Reason: Reopening can collapse the section if already open, hiding the dropdown

    // Wait for mobile panel overlay to disappear if present
    const mobilePanel = this.page.locator('.mobile-panel.card');
    if (await mobilePanel.isVisible().catch(() => false)) {
      await mobilePanel
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {
          // If overlay doesn't disappear, continue anyway
        });
    }

    // Wait for dropdown to be visible with polling approach
    // Reason: Dropdown appears after Deeplink button type is selected, may need time for DOM update
    // Increased timeout to 30s to match other waits in codebase and handle slower DOM updates
    await expect(async () => {
      const isVisible = await this.deeplinkDropdown.isVisible();
      if (!isVisible) {
        throw new Error('Deeplink dropdown is not visible yet');
      }
    }).toPass({ timeout: 30000, intervals: [500] });

    // Ensure element is actionable (not intercepted) before clicking
    await this.deeplinkDropdown.scrollIntoViewIfNeeded();

    // Wait for element to be actionable (not intercepted by overlays)
    await expect(async () => {
      const isActionable = await this.deeplinkDropdown.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        return elementAtPoint === el || el.contains(elementAtPoint);
      });
      if (!isActionable) {
        throw new Error('Element is still intercepted by overlay');
      }
    }).toPass({ timeout: 10000, intervals: [200] });

    await this.deeplinkDropdown.click();

    if (Array.isArray(optionName)) {
      for (const option of optionName) {
        const deeplinkOption = this.getDeeplinkOption(option);
        if (await deeplinkOption.isVisible()) {
          await deeplinkOption.click();
          const selectedDropdown = this.getSelectedDeeplinkDropdown(option);
          await selectedDropdown.waitFor({ state: 'visible' });
          return;
        }
      }
      throw new Error(
        `None of the provided deeplink options were found: ${optionName.join(', ')}`
      );
    } else {
      await this.getDeeplinkOption(optionName).click();
      const selectedDropdown = this.getSelectedDeeplinkDropdown(optionName);
      await selectedDropdown.waitFor({ state: 'visible' });
    }
  }

  // =========================================================================
  // Setup Helper Methods
  // =========================================================================
  async expandCollapseSection(
    section: 'Image' | 'Headline' | 'Text' | 'Call to Action'
  ): Promise<void> {
    switch (section) {
      case 'Image':
        await this.imageSection.click();
        break;
      case 'Headline':
        await this.headlineSection.click();
        break;
      case 'Text':
        await this.textSection.click();
        break;
      case 'Call to Action':
        await this.callToActionSection.click();
        break;
    }
  }

  async toggleSectionSwitch(
    section: 'Image' | 'Headline' | 'Text' | 'Media' | 'Table'
  ): Promise<void> {
    let sectionToggle: Locator;
    switch (section) {
      case 'Image':
        sectionToggle = this.imageToggle;
        break;
      case 'Headline':
        sectionToggle = this.headlineToggle;
        break;
      case 'Text':
        sectionToggle = this.textToggle;
        break;
      case 'Media':
        sectionToggle = this.mediaToggle;
        break;
      case 'Table':
        sectionToggle = this.tableToggle;
        break;
    }
    await sectionToggle.click();
  }

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

  async setupOpenFeedButton(
    buttonText: string,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('Open Feed', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
  }

  async setupDismissButton(
    buttonText: string,
    buttonIndex: number = 0
  ): Promise<void> {
    await this.openCallToActionSection();
    await this.selectCTAButtonType('Dismiss', buttonIndex);
    await this.enterButtonText(buttonText, buttonIndex === 0 ? 1 : 2);
  }

  // =========================================================================
  // Target Step Methods
  // =========================================================================

  async selectTargetSegment(segmentName: string): Promise<void> {
    await this.segmentsTargetingToggle.click();

    await this.segmentsSectionLabel.click();

    const segmentOption = this.getSegmentTargetingOption(segmentName);
    await segmentOption.click();
  }

  // =========================================================================
  // Deliver Step Methods
  // =========================================================================
  /**
   * Configures the basic delivery settings: One Time Segment, Immediate activation, Never expires.
   */
  async configureDeliverySettings(): Promise<void> {
    // Select the "One Time Segment" option
    await this.oneTimeSegmentOption.click();

    // Select "Immediately" for activation
    await this.immediatelyActivationButton.click();

    // Select "Never" for expiry (assuming this appears after clicking Immediately or is default)
    await this.neverExpireOption.click();
  }

  // =========================================================================
  // Review Step Methods
  // =========================================================================

  async sendCampaign(): Promise<void> {
    await this.sendCampaignButton.click();
    await this.sendCampaignDialogButton.click();
  }
}
