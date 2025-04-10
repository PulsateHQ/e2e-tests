import { UI_E2E_APP_ID } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';

test.describe('In-App Campaign Creation', () => {
  // Front-end access token for authentication
  const accessToken = '359d6e08c9c9c3678fe54706ce92ffb4c003';
  // App ID to use with this token
  const appId = UI_E2E_APP_ID;

  test.beforeEach(async ({ loginPage }) => {
    // Login with token before proceeding
    await loginPage.loginWithToken(accessToken, appId);
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    campaignsPage
  }) => {
    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select In-App campaign type
    await campaignsPage.selectInAppCampaignType();

    // Select Full-Screen layout
    await campaignsPage.selectInAppLargeLayout();

    // Create campaign with required details
    const campaignName = `InApp Large Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText = `URL_${faker.lorem.word()}`;
    const buttonUrl = `https://www.google.com`;

    await campaignsPage.enterCampaignName(campaignName);
    await campaignsPage.clickSaveAndContinue();

    await expect(campaignsPage.personalMessageSection).toBeVisible();
    await expect(campaignsPage.imageSection).toBeVisible();
    await expect(campaignsPage.headlineSection).toBeVisible();
    await expect(campaignsPage.textSection).toBeVisible();
    await expect(campaignsPage.callToActionSection).toBeVisible();

    // Toggle of Personal Message and Image sections
    await campaignsPage.toggleSection('Personal Message', false);
    await campaignsPage.toggleSection('Image', false);

    // Enter Headline and Text
    await campaignsPage.enterHeadline(campaignHeadline);
    await campaignsPage.enterText(campaignText);

    // Configure call to action
    await campaignsPage.openCallToActionSection();
    await campaignsPage.selectButtonCount(1);
    await campaignsPage.selectCTAButtonType('URL');
    await campaignsPage.enterButtonUrl(buttonUrl);
    await campaignsPage.enterButtonText(buttonText);

    // Save and continue
    await campaignsPage.clickSaveAndContinue();
  });
});
