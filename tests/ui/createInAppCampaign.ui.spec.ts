import {
  SUPER_ADMIN_ACCESS_TOKEN,
  UI_E2E_ACCESS_TOKEN_ADMIN,
  UI_E2E_APP_ID,
  UI_E2E_LOGIN_ADMIN,
  UI_E2E_PASSWORD_ADMIN
} from '@_config/env.config';
import {
  createDeeplinkWithApi,
  deleteDeeplinksWithApi
} from '@_src/api/factories/deeplinks.api.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/super.admin.api.factory';
import { startWebSdkSessionWithApi } from '@_src/api/factories/web.sdk.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { setupIsolatedCompanyForReceivingNotifications } from '@_src/api/utils/company-registration.util';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  E2EAdminAuthDataModel,
  E2EAdminLoginCredentialsModel
} from '@_src/ui/models/admin.model';
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
  // Creator company - isolated per test file (like API tests)

  const E2EAdminLoginCredentialsModel: E2EAdminLoginCredentialsModel = {
    userEmail: `${UI_E2E_LOGIN_ADMIN}`,
    userPassword: `${UI_E2E_PASSWORD_ADMIN}`,
    uiE2EAppId: `${UI_E2E_APP_ID}`
  };

  const e2EAdminAuthDataModel: E2EAdminAuthDataModel = {
    uiE2EAccessTokenAdmin: `${UI_E2E_ACCESS_TOKEN_ADMIN}`,
    uiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`
  };

  // Receiver company - created per test for campaign delivery
  let APIE2EReceiverUserModel: APIE2ELoginUserModel;
  let deeplinkNickname: string;
  let deeplinkId: string;

  test.beforeEach(async ({ request }) => {
    // Create isolated receiver company/app for campaign delivery
    // Uses only SUPER_ADMIN_ACCESS_TOKEN for complete isolation (same as creator)
    APIE2EReceiverUserModel =
      await setupIsolatedCompanyForReceivingNotifications(
        request,
        SUPER_ADMIN_ACCESS_TOKEN
      );

    // Update feature flags for the new app
    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      SUPER_ADMIN_ACCESS_TOKEN,
      [APIE2EReceiverUserModel.apiE2EAppId]
    );
    await startWebSdkSessionWithApi(request, {
      alias: APIE2EReceiverUserModel.companyAlias!,
      guid: APIE2EReceiverUserModel.companyAlias!,
      device: {
        type: 'web',
        location_permission: false,
        push_permission: false
      }
    });
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias}`;

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

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();

    // Toggle of Image section
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

    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.verifyInAppButtonWithPolling(buttonText, 30_000);
  });

  test('should create a new in-app full-screen campaign with dismiss button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias}`;

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
    const buttonText = `Dismiss_${faker.lorem.word()}`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();

    // Toggle of Image section
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
    await campaignBuilderPage.selectCTAButtonType('Dismiss');

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

    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.verifyInAppDismissButtonWithPolling(buttonText, 30_000);
  });

  test('should create a new in-app full-screen campaign with deeeplink', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: `https://www.${faker.internet.domainName()}`
      },
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias}`;

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

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();

    // Toggle of Image section
    await campaignBuilderPage.toggleSectionSwitch('Image');

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.setupDeeplinkButton(
      deeplinkNickname,
      deeplinkNickname
    );

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

    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.verifyInAppButtonUrlWithPolling(
      deeplinkNickname,
      30_000
    );

    await deleteDeeplinksWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId],
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );
  });

  test('should create a new in-app full-screen campaign with feed', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias}`;

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
    const buttonText = `Feed_${faker.lorem.word()}`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();

    // Toggle of Image section
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
    await campaignBuilderPage.selectCTAButtonType('Open Feed');

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

    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.verifyInAppButtonUrlWithPolling(buttonText, 30_000);
  });
});
