import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN,
  UI_E2E_APP_ID
} from '@_config/env.config';
import {
  getAdminById,
  getAllAdmins,
  registerCompany
} from '@_src/api/factories/admin.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/super.admin.api.factory';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { faker } from '@faker-js/faker/locale/en';

test.describe('In-App Campaign Creation', () => {
  // Front-end access token for authentication
  const accessTokenForSender = '655381dbcf03c4c67f8a2b7ad9ed8b953627';
  // App ID to use with this token
  const appId = UI_E2E_APP_ID;

  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  beforeEach(async ({ request }) => {
    // Arrange
    const supserAdminActivationCodeCreateResponse =
      await superAdminsActivationCodesCreate(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin
      );

    const supserAdminActivationCodeCreateResponseJson =
      await supserAdminActivationCodeCreateResponse.json();

    const activationCode =
      supserAdminActivationCodeCreateResponseJson.activation_code;

    const registrationData = generateCompanyPayload(activationCode);

    // Register Company
    const companyRegistrationResponse = await registerCompany(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      registrationData
    );

    const companyRegistrationResponseJson =
      await companyRegistrationResponse.json();

    const appIdForCampaignReciver =
      companyRegistrationResponseJson.data.recent_mobile_app_id;

    const adminAccessToken =
      companyRegistrationResponseJson.data.admin_access_token;

    const adminFrontedAccessToken =
      companyRegistrationResponseJson.data.fronted_access_token;

    // Get Admin Information
    const getAllAdminsResponse = await getAllAdmins(
      request,
      adminAccessToken,
      appIdForCampaignReciver
    );

    const getAllAdminsResponseJson = await getAllAdminsResponse.json();

    const adminDetailResponse = await getAdminById(
      request,
      adminAccessToken,
      appIdForCampaignReciver,
      getAllAdminsResponseJson.data[0].id
    );

    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
      [appIdForCampaignReciver]
    );
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage
  }) => {
    // Login with token before proceeding
    await loginPage.loginWithToken(accessTokenForSender, appId);
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
    await expect(campaignBuilderPage.notificationStepHeading).toBeVisible();

    // Send Campaign
    await campaignBuilderPage.sendCampaign();

    // Verify that new campaign button is visible
    await expect(campaignsPage.newCampaignButton).toBeVisible();

    // Verify campaign is created
    await campaignsPage.verifyCampaignIsCreated(campaignName);

    // Verify campaign status using polling for more reliability
    await campaignsPage.verifyCampaignStatusWithPolling(
      campaignName,
      'Delivered',
      60_000
    );
  });
});
