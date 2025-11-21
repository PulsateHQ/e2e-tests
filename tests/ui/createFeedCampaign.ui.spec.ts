import {
  BASE_URL,
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

test.describe('Create Feed Campaigns', () => {
  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['sealion'];
  const campaignImage = `src/ui/test-data/img/ui_automation_1.jpg`;

  test.beforeAll(async ({}) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  });

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
  let deeplinkTarget: string;

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

    deeplinkTarget = `${BASE_URL}/mobile/apps/${APIE2EReceiverUserModel.apiE2EAppId}/segments`;
  });

  test('should create feed with URL button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText = `URL_${faker.lorem.word()}`;
    const buttonUrl = `https://www.google.com`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedWithPolling(buttonText, 30_000);

    // Click feed url button and verify navigation
    await feedPage.clickFeedUrlButtonAndVerifyNavigation(buttonText, buttonUrl);
  });

  test('should create feed with deeplink', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: deeplinkTarget
      },
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedWithPolling(deeplinkNickname, 30_000);

    // Click feed deeplink button and verify navigation
    await feedPage.clickFeedDeeplinkButtonAndVerifyNavigation(
      deeplinkNickname,
      deeplinkTarget
    );

    // Delete deeplink
    await deleteDeeplinksWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId],
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );
  });

  test('should create feed with back post and dismiss button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText = `Feed Post (Back)_${faker.lorem.word()}`;
    const dismissText = `Dismiss_${faker.lorem.word()}`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.enterButtonText(buttonText);
    await campaignBuilderPage.selectCTAButtonType('Feed Post (Back)');

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.tableSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Configure Feed Post (Back) button
    await campaignBuilderPage.uploadCampaignImage(campaignImage);
    await campaignBuilderPage.toggleSectionSwitch('Table');

    // Enter Headline and Text for Feed Post (Back)
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action for Feed Post (Back)
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.selectButtonCount(1);
    await campaignBuilderPage.enterButtonText(dismissText);
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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Click feed post back button and verify navigation
    await feedPage.clickFeedPostBackButton(buttonText);

    // Verify feed back post image
    await feedPage.verifyFeedBackPostImageWithPolling();

    // Verify feed back post content
    await feedPage.verifyFeedBackPostContentWithPolling(
      campaignHeadline,
      campaignText
    );

    // Click dismiss button
    await feedPage.clickDismissButton(dismissText);

    // Verify feed content after dismissing the feed post
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedButtonWithPolling(buttonText, 30_000);
  });

  test('should create feed with back post and URL button', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage
  }) => {
    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText = `URL_${faker.lorem.word()}`;
    const buttonUrl = `https://www.google.com`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.enterButtonText(buttonText);
    await campaignBuilderPage.selectCTAButtonType('Feed Post (Back)');

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.tableSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Configure Feed Post (Back) button
    await campaignBuilderPage.uploadCampaignImage(campaignImage);
    await campaignBuilderPage.toggleSectionSwitch('Table');

    // Enter Headline and Text for Feed Post (Back)
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action for Feed Post (Back)
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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedButtonWithPolling(buttonText, 30_000);

    // Click feed post back button and verify navigation
    await feedPage.clickFeedPostBackButton(buttonText);

    // Verify feed back post image
    await feedPage.verifyFeedBackPostImageWithPolling();

    // Verify feed back post content
    await feedPage.verifyFeedBackPostContentWithPolling(
      campaignHeadline,
      campaignText
    );

    // Click feed url button and verify navigation
    await feedPage.clickFeedUrlButtonAndVerifyNavigation(buttonText, buttonUrl);
  });

  test('should create feed with back post and deeplink', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: deeplinkTarget
      },
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.enterButtonText(deeplinkNickname);
    await campaignBuilderPage.selectCTAButtonType('Feed Post (Back)');

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.tableSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Configure Feed Post (Back) button
    await campaignBuilderPage.uploadCampaignImage(campaignImage);
    await campaignBuilderPage.toggleSectionSwitch('Table');

    // Enter Headline and Text for Feed Post (Back)
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action for Feed Post (Back)
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.selectButtonCount(1);
    await campaignBuilderPage.enterButtonText(deeplinkNickname);

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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedButtonWithPolling(deeplinkNickname, 30_000);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Click feed post back button and verify navigation
    await feedPage.clickFeedPostBackButton(deeplinkNickname);

    // Verify feed back post image
    await feedPage.verifyFeedBackPostImageWithPolling();

    // Verify feed back post deeplink button and verify navigation
    await feedPage.clickFeedBackPostDeeplinkButtonAndVerifyNavigation(
      deeplinkNickname,
      deeplinkTarget
    );

    // Delete deeplink
    await deleteDeeplinksWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId],
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );
  });

  test('should create feed with 2 cta buttons', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: deeplinkTarget
      },
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText1 = `URL_${faker.lorem.word()}`;
    const buttonText2 = deeplinkNickname;
    const buttonUrl = `https://www.google.com`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.selectButtonCount(2);

    await campaignBuilderPage.setupUrlButton(buttonText1, buttonUrl, 0);
    await campaignBuilderPage.setupDeeplinkButton(
      buttonText2,
      deeplinkNickname,
      1
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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify url button
    await feedPage.verifyFeedWithPolling(buttonText1, 30_000);

    // Verify deeplink button
    await feedPage.verifyFeedWithPolling(buttonText2, 30_000);

    // Click url button and verify navigation
    await feedPage.clickFeedUrlButtonAndVerifyNavigation(
      buttonText1,
      buttonUrl
    );

    // Click back browser to feed page
    await feedPage.clickBackBrowserToFeedPage();

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Click deeplink button and verify navigation
    await feedPage.clickFeedDeeplinkButtonAndVerifyNavigation(
      buttonText2,
      deeplinkTarget
    );

    // Delete deeplink
    await deleteDeeplinksWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId],
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );
  });

  test('should create feed with back post and 2 cta buttons', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: deeplinkTarget
      },
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

    // Create segment with required details
    const segmentName = `Segment_${faker.lorem.word()}`;
    const aliasValue = `${APIE2EReceiverUserModel.companyAlias!}`;

    // Navigate to Segments section
    await segmentsPage.clickSidebarItemSegments();

    // Create new segment
    await segmentsPage.createSegmentWithAlias(aliasValue, segmentName);

    // Navigate to campaigns section
    await campaignsPage.navigateToCampaignsSection();

    // Create new campaign
    await campaignsPage.createNewCampaign();

    // Select Feed campaign type
    await campaignBuilderPage.selectFeedPostCampaignType();

    // Create campaign with required details
    const campaignName = `Feed Post Campaign ${Date.now()}`;
    const campaignHeadline = `Headline_${faker.lorem.word()}`;
    const campaignText = `Text_${faker.lorem.word()}`;
    const buttonText1 = `URL_${faker.lorem.word()}`;
    const buttonText2 = deeplinkNickname;
    const buttonUrl = `https://www.google.com`;

    await campaignBuilderPage.enterCampaignName(campaignName);
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Upload Campaign Image
    await campaignBuilderPage.uploadCampaignImage(campaignImage);

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.enterButtonText(buttonText1);
    await campaignBuilderPage.selectCTAButtonType('Feed Post (Back)');

    // Save and continue
    await campaignBuilderPage.clickSaveAndContinue();

    await expect(campaignBuilderPage.imageSection).toBeVisible();
    await expect(campaignBuilderPage.headlineSection).toBeVisible();
    await expect(campaignBuilderPage.textSection).toBeVisible();
    await expect(campaignBuilderPage.tableSection).toBeVisible();
    await expect(campaignBuilderPage.callToActionSection).toBeVisible();

    // Configure Feed Post (Back) button
    await campaignBuilderPage.uploadCampaignImage(campaignImage);
    await campaignBuilderPage.toggleSectionSwitch('Table');

    // Enter Headline and Text for Feed Post (Back)
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action for Feed Post (Back)
    await campaignBuilderPage.openCallToActionSection();
    await campaignBuilderPage.selectButtonCount(2);

    await campaignBuilderPage.setupDeeplinkButton(
      buttonText2,
      deeplinkNickname,
      0
    );

    await campaignBuilderPage.setupUrlButton(buttonText1, buttonUrl, 1);

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

    // Sign out from admin account
    await accountSettingsPage.signOut();

    const loginCredentialsForReceiver: E2EAdminLoginCredentialsModel = {
      userEmail: APIE2EReceiverUserModel.username!,
      userPassword: APIE2EReceiverUserModel.password!
    };

    // Login to receiver account
    await loginPage.login(loginCredentialsForReceiver);

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Verify feed content
    await feedPage.verifyFeedContentWithPolling(campaignHeadline, campaignText);

    // Verify feed image
    await feedPage.verifyFeedImageWithPolling();

    // Verify feed button
    await feedPage.verifyFeedButtonWithPolling(buttonText1, 30_000);

    // Click feed post back button and verify navigation
    await feedPage.clickFeedPostBackButton(buttonText1);

    // Verify feed back post image
    await feedPage.verifyFeedBackPostImageWithPolling();

    // Verify url button
    await feedPage.verifyFeedWithPolling(buttonText1, 30_000);

    // Verify deeplink button
    await feedPage.verifyFeedWithPolling(buttonText2, 30_000);

    // Click url button and verify navigation
    await feedPage.clickFeedUrlButtonAndVerifyNavigation(
      buttonText1,
      buttonUrl
    );

    // Click back browser to feed page
    await feedPage.clickBackBrowserToFeedPage();

    // Click notification button to open feed page
    await dashboardPage.clickNotificationButton();

    // Click feed post back button and verify navigation
    await feedPage.clickFeedPostBackButton(buttonText1);

    // Click deeplink button and verify navigation
    await feedPage.clickFeedDeeplinkButtonAndVerifyNavigation(
      buttonText2,
      deeplinkTarget
    );

    // Delete deeplink
    await deleteDeeplinksWithApi(
      request,
      e2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId],
      E2EAdminLoginCredentialsModel.uiE2EAppId
    );
  });
});
