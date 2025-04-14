import { UI_E2E_APP_ID } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';

test.describe('In-App Campaign Creation', () => {
  // Front-end access token for authentication
  const accessTokenForSender = '655381dbcf03c4c67f8a2b7ad9ed8b953627';
  // App ID to use with this token
  const appId = UI_E2E_APP_ID;

  test.beforeEach(async ({ loginPage }) => {
    // Login with token before proceeding
    await loginPage.loginWithToken(accessTokenForSender, appId);
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    campaignsPage,
    campaignBuilderPage,
    segmentsPage
  }) => {
    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `67fd1377a97cea96f501d7a8`;

    // Navigate to Targeting section
    await segmentsPage.clickSidebarCategoryTargeting();

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select In-App campaign type
    await campaignBuilderPage.selectInAppCampaignType();

    // Select Full-Screen layout
    await campaignBuilderPage.selectInAppLargeLayout();

    // Create campaign with required details
    const campaignName = `InApp Large Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText = `URL_${faker.lorem.word()}`;
    const buttonUrl = `https://www.google.com`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.personalMessageSection).toBeVisible();
    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    // await expect(campaignsPage.callToActionSection).toBeVisible();

    // Toggle of Personal Message and Image sections
    await campaignBuilderPage.toggleSectionSwitch('Personal Message');
    await campaignBuilderPage.toggleSectionSwitch('Image');

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.selectButtonCount(1);
    await campaignBuilderPage.enterButtonText(buttonText);
    await campaignBuilderPage.selectCTAButtonType('URL');
    await campaignBuilderPage.enterButtonUrl(buttonUrl);

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    // Select Target Segment
    await expect(campaignBuilderPage.segmentsSectionLabel).toBeVisible();

    await campaignBuilderPage.selectTargetSegment(segmentName);

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    // Select Delivery Settings
    await expect(campaignBuilderPage.deliverStepHeading).toBeVisible();

    await campaignBuilderPage.configureDeliverySettings();

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    // Select Review
    await expect(campaignBuilderPage.reviewStepHeading).toBeVisible();

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    // Send Campaign
    await campaignBuilderPage.sendCampaign();

    // Verify campaign is created
    await campaignsPage.verifyCampaignIsCreated(campaignName);
  });
});
