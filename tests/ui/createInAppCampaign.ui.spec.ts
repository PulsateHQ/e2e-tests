import {
  BASE_URL,
  SUPER_ADMIN_ACCESS_TOKEN,
  UI_E2E_ACCESS_TOKEN_ADMIN,
  UI_E2E_APP_ID,
  UI_E2E_LOGIN_ADMIN,
  UI_E2E_PASSWORD_ADMIN
} from '@_config/env.config';
import {
  logoutAdmin,
  registerCompany
} from '@_src/api/factories/admin.api.factory';
import { getSdkCredentials } from '@_src/api/factories/app.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/super.admin.api.factory';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import {
  createMobileSessionPayload,
  startMobileSessionInAppPayload
} from '@_src/api/test-data/mobile/sessions/start-session.payload';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { UIE2ELoginUserModel } from '@_src/ui/models/admin.model';
import { UI2E2LoginUserModel } from '@_src/ui/models/user.model';
import { faker } from '@faker-js/faker/locale/en';

test.describe('In-App Campaign Creation', () => {
  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['sealion'];

  test.beforeAll(async ({}) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  });

  const UIE2ELoginUserModel: UIE2ELoginUserModel = {
    uiE2EAccessTokenAdmin: `${UI_E2E_ACCESS_TOKEN_ADMIN}`,
    uiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    uiE2EAppId: `${UI_E2E_APP_ID}`
  };

  const UI2E2LoginUserModel: UI2E2LoginUserModel = {
    userEmail: `${UI_E2E_LOGIN_ADMIN}`,
    userPassword: `${UI_E2E_PASSWORD_ADMIN}`
  };

  let adminAliasForCampaignReciver: string;
  let adminFrontendAccessTokenForCampaignReciver: string;
  let appIdForCampaignReciver: string;
  let sdkAccessTokenForCampaignReciver: string;
  let adminAccessTokenForCampaignReciver: string;

  test.beforeEach(async ({ request }) => {
    // Arrange
    const supserAdminActivationCodeCreateResponse =
      await superAdminsActivationCodesCreate(
        request,
        UIE2ELoginUserModel.uiE2EAccessTokenSuperAdmin
      );
    const supserAdminActivationCodeCreateResponseJson =
      await supserAdminActivationCodeCreateResponse.json();
    const activationCode =
      supserAdminActivationCodeCreateResponseJson.activation_code;
    const registrationData = generateCompanyPayload(activationCode);

    const companyRegistrationResponse = await registerCompany(
      request,
      UIE2ELoginUserModel.uiE2EAccessTokenAdmin,
      registrationData
    );

    const companyRegistrationResponseJson =
      await companyRegistrationResponse.json();

    appIdForCampaignReciver =
      companyRegistrationResponseJson.data.recent_mobile_app_id;

    adminFrontendAccessTokenForCampaignReciver =
      companyRegistrationResponseJson.data.front_end_access_token;

    adminAccessTokenForCampaignReciver =
      companyRegistrationResponseJson.data.admin_access_token;

    adminAliasForCampaignReciver =
      companyRegistrationResponseJson.data._id.$oid;

    const sdkCredentialsResponse = await getSdkCredentials(
      request,
      adminAccessTokenForCampaignReciver,
      appIdForCampaignReciver
    );

    const sdkCredentialsResponseJson = await sdkCredentialsResponse.json();

    sdkAccessTokenForCampaignReciver = sdkCredentialsResponseJson.access_token;

    const userSessionPayloadForCampaignReciver = createMobileSessionPayload({
      alias: adminAliasForCampaignReciver,
      device: {
        ...startMobileSessionInAppPayload.device
      }
    });

    await startMobileSessionsWithApi(
      request,
      sdkAccessTokenForCampaignReciver,
      userSessionPayloadForCampaignReciver
    );

    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      UIE2ELoginUserModel.uiE2EAccessTokenSuperAdmin,
      [appIdForCampaignReciver]
    );
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    request
  }) => {
    await loginPage.login(
      UIE2ELoginUserModel.uiE2ELoginAdmin,
      UIE2ELoginUserModel.uiE2EPasswordAdmin
    );
    const expectedURL = `${BASE_URL}/mobile/apps/${UIE2ELoginUserModel.uiE2EAppId}/dashboard_beta`;
    const dashboardURL = await dashboardPage.validateUrl();

    // Assert
    expect(dashboardURL).toBe(expectedURL);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${adminAliasForCampaignReciver}`;

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
    // await accountSettingsPage.signOut();

    await logoutAdmin(request, UIE2ELoginUserModel.uiE2EAccessTokenAdmin);

    await loginPage.loginWithToken(
      adminFrontendAccessTokenForCampaignReciver,
      appIdForCampaignReciver
    );

    await dashboardPage.verifyInAppButtonWithPolling(buttonText, 30_000);
  });
});
