import {
  SUPER_ADMIN_ACCESS_TOKEN,
  UI_E2E_ACCESS_TOKEN_ADMIN,
  UI_E2E_APP_ID,
  UI_E2E_LOGIN_ADMIN,
  UI_E2E_PASSWORD_ADMIN
} from '@_config/env.config';
import { registerCompany } from '@_src/api/factories/admin.api.factory';
import {
  createDeeplinkWithApiForUi,
  deleteDeeplinksWithApiForUi
} from '@_src/api/factories/deeplinks.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/super.admin.api.factory';
import { startWebSdkSessionWithApi } from '@_src/api/factories/web.sdk.api.factory';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  E2EAdminAuthDataModel,
  E2EAdminLoginCredentialsModel
} from '@_src/ui/models/admin.model';
import { faker } from '@faker-js/faker/locale/en';

test.describe('Feed Campaign Creation', () => {
  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['sealion'];

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

  const E2EAdminAuthDataModel: E2EAdminAuthDataModel = {
    uiE2EAccessTokenAdmin: `${UI_E2E_ACCESS_TOKEN_ADMIN}`,
    uiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`
  };

  let adminAliasForCampaignReciver: string;
  let appIdForCampaignReciver: string;
  let adminUserNameForCampaignReciver: string;
  let adminPasswordForCampaignReciver: string;
  let deeplinkNickname: string;
  let deeplinkId: string;

  test.beforeEach(async ({ request }) => {
    // Arrange
    const supserAdminActivationCodeCreateResponse =
      await superAdminsActivationCodesCreate(
        request,
        E2EAdminAuthDataModel.uiE2EAccessTokenSuperAdmin
      );
    const supserAdminActivationCodeCreateResponseJson =
      await supserAdminActivationCodeCreateResponse.json();
    const activationCode =
      supserAdminActivationCodeCreateResponseJson.activation_code;
    const registrationData = generateCompanyPayload(activationCode);

    const companyRegistrationResponse = await registerCompany(
      request,
      E2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      registrationData
    );

    const companyRegistrationResponseJson =
      await companyRegistrationResponse.json();

    appIdForCampaignReciver =
      companyRegistrationResponseJson.data.recent_mobile_app_id;

    adminAliasForCampaignReciver =
      companyRegistrationResponseJson.data._id.$oid;

    adminUserNameForCampaignReciver = registrationData.username;

    adminPasswordForCampaignReciver = registrationData.password;

    await startWebSdkSessionWithApi(request, {
      alias: adminAliasForCampaignReciver,
      guid: adminAliasForCampaignReciver,
      device: {
        type: 'web',
        location_permission: false,
        push_permission: false
      }
    });

    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      E2EAdminAuthDataModel.uiE2EAccessTokenSuperAdmin,
      [appIdForCampaignReciver]
    );
  });

  test('should create a new feed campaign with URL button', async ({
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

    // Toggle of Image section
    await campaignBuilderPage.toggleSectionSwitch('Image');

    // Enter Headline and Text
    await campaignBuilderPage.expandCollapseSection('Headline');
    await campaignBuilderPage.enterHeadline(campaignHeadline);
    await campaignBuilderPage.expandCollapseSection('Text');
    await campaignBuilderPage.enterText(campaignText);

    // Configure call to action
    await campaignBuilderPage.openCallToActionSection();
    // await campaignBuilderPage.selectButtonCount(1);
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
      userEmail: adminUserNameForCampaignReciver,
      userPassword: adminPasswordForCampaignReciver
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.clickNotificationButton();

    await feedPage.verifyFeedWithPolling(buttonText, 30_000);
  });

  test('should create a new feed campaign with Deeplink', async ({
    loginPage,
    campaignsPage,
    campaignBuilderPage,
    segmentsPage,
    dashboardPage,
    accountSettingsPage,
    feedPage,
    request
  }) => {
    const deeplinkResponse = await createDeeplinkWithApiForUi(
      request,
      E2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      {
        nickname: `Deeplink_${faker.lorem.word()}`,
        target: `https://www.${faker.internet.domainName()}`
      }
    );

    deeplinkNickname = deeplinkResponse.nickname;
    deeplinkId = deeplinkResponse.id;

    await loginPage.login(E2EAdminLoginCredentialsModel);

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
      userEmail: adminUserNameForCampaignReciver,
      userPassword: adminPasswordForCampaignReciver
    };

    await loginPage.login(loginCredentialsForReceiver);

    await dashboardPage.clickNotificationButton();

    await feedPage.verifyFeedWithPolling(deeplinkNickname, 30_000);

    await deleteDeeplinksWithApiForUi(
      request,
      E2EAdminAuthDataModel.uiE2EAccessTokenAdmin,
      [deeplinkId]
    );
  });
});
