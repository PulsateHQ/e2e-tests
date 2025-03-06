import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import { getSdkCredentials } from '@_src/api/factories/app.api.factory';
import { createCampaignWithApi } from '@_src/api/factories/campaigns.api.factory';
import {
  createDeeplinkWithApi,
  updateDeeplinkWithApi
} from '@_src/api/factories/deeplinks.api.factory';
import { getInboxMessagesWithApi } from '@_src/api/factories/mobile.messages.api.factory';
import { getCardWithApi } from '@_src/api/factories/mobile.notifications.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { getCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createWebSdkStatistics } from '@_src/api/factories/web.sdk.statistics.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { WebSdkStatisticsAction } from '@_src/api/models/web.sdk.statistics.model';
import {
  createCampaignFeedOneButtonBackWithDismiss,
  createCampaignFeedOneButtonToDeeplinkWithImage,
  createCampaignFeedOneButtonToUrl
} from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { startMobileSessionFeedPayload } from '@_src/api/test-data/mobile/sessions/mobile.sessions.payload';
import { updateMobileUserPayload } from '@_src/api/test-data/mobile/users/update/mobile.users.update.payload';
import { apiUrls } from '@_src/api/utils/api.util';
import {
  deleteAllCampaigns,
  deleteAllDeeplinks,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

// Define the environments where this test should run
const SUPPORTED_ENVIRONMENTS = ['tiger'];

// Use condition() to skip tests on unsupported environments
test.describe('Feed HTML Post Campaign Tests', () => {
  // This will skip all tests in this suite if not running in a supported environment
  test.beforeEach(() => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  });

  let APIE2ETokenSDKModel: APIE2ETokenSDKModel;
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: API_E2E_ACCESS_TOKEN_ADMIN,
    apiE2EAccessTokenSuperAdmin: SUPER_ADMIN_ACCESS_TOKEN,
    apiE2EAppId: API_E2E_APP_ID
  };

  test.beforeAll(async ({ request }) => {
    const sdkCredentialsResponse = await getSdkCredentials(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const sdkCredentials = await sdkCredentialsResponse.json();

    APIE2ETokenSDKModel = {
      apiE2EAccessTokenSdk: sdkCredentials.access_token,
      apiE2EAppIdSdk: sdkCredentials.app_id,
      apiE2EAppKeySdk: sdkCredentials.app_key
    };
  });

  test.beforeEach(async ({ request }) => {
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should create an HTML Feed campaign with a URL button and click it', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    createCampaignFeedOneButtonToUrl.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrl
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrl.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createCampaignResponseJson.guid
    );

    // Find parts in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );
    const textPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'text'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToAction =
      createCampaignResponseJson.card_notification.front_parts.call_to_action;
    expect(callToActionPart.active).toBe(campaignCallToAction.active);
    expect(callToActionPart.position).toBe(campaignCallToAction.position);

    // Validate button attributes match exactly
    const buttonAttrs = callToActionPart.attrs[0];
    const campaignButton = campaignCallToAction.buttons[0];
    expect(buttonAttrs.btn_color).toBe(campaignButton.btn_color);
    expect(buttonAttrs.destination_type).toBe(campaignButton.destination_type);
    expect(buttonAttrs.destination).toBe(campaignButton.destination);
    expect(buttonAttrs.in_app_events).toBe(campaignButton.in_app_events);
    expect(buttonAttrs.label).toBe(campaignButton.label);
    expect(buttonAttrs.txt_color).toBe(campaignButton.txt_color);
    expect(buttonAttrs.order_number).toBe(campaignButton.order_number);

    // Validate text part matches campaign configuration
    const campaignText =
      createCampaignResponseJson.card_notification.front_parts.text;
    expect(textPart.active).toBe(campaignText.active);
    expect(textPart.position).toBe(campaignText.position);
    expect(textPart.attrs[0].text).toBe(campaignText.text);

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
    );

    const getCardWithApiAfterReadingResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiAfterReadingResponseJson =
      await getCardWithApiAfterReadingResponse.json();

    expect(getCardWithApiAfterReadingResponseJson.is_campaign_unread).toBe(
      false
    );

    const getCampaignStatsWithWaitResponse = await getCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      1
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create an HTML Feed campaign with a Deeplink button and click it', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    await deleteAllDeeplinks(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );

    const createDeeplinkResponse = await createDeeplinkWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        nickname: 'Plawright',
        target: `${apiUrls.campaigns.v2.base}`
      }
    );

    const updateDeeplinkResponse = await updateDeeplinkWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createDeeplinkResponse.id,
      {
        nickname: 'Plawright Campaign Deeplink',
        target: `${apiUrls.campaigns.v2.base}`
      }
    );

    // Preparing payload for campaign creation
    createCampaignFeedOneButtonToDeeplinkWithImage.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    createCampaignFeedOneButtonToDeeplinkWithImage.card_notification.front_parts.call_to_action.buttons[0].destination =
      updateDeeplinkResponse.id;

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToDeeplinkWithImage
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToDeeplinkWithImage.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createCampaignResponseJson.guid
    );

    // Find parts in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );
    const textPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'text'
    );

    const headlinePart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'headline'
    );

    const imagePart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'image'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToAction =
      createCampaignResponseJson.card_notification.front_parts.call_to_action;
    expect(callToActionPart.active).toBe(campaignCallToAction.active);
    expect(callToActionPart.position).toBe(campaignCallToAction.position);

    // Validate button attributes match exactly
    const buttonAttrs = callToActionPart.attrs[0];
    const campaignButton = campaignCallToAction.buttons[0];
    expect(buttonAttrs.btn_color).toBe(campaignButton.btn_color);
    expect(buttonAttrs.destination_type).toBe(campaignButton.destination_type);
    expect(buttonAttrs.destination).toBe(campaignButton.destination);
    expect(buttonAttrs.in_app_events).toBe(campaignButton.in_app_events);
    expect(buttonAttrs.label).toBe(campaignButton.label);
    expect(buttonAttrs.txt_color).toBe(campaignButton.txt_color);
    expect(buttonAttrs.order_number).toBe(campaignButton.order_number);

    // Validate text part matches campaign configuration
    const campaignText =
      createCampaignResponseJson.card_notification.front_parts.text;
    expect(textPart.active).toBe(campaignText.active);
    expect(textPart.position).toBe(campaignText.position);
    expect(textPart.attrs[0].text).toBe(campaignText.text);

    // Validate headline part matches campaign configuration
    const campaignHeadline =
      createCampaignResponseJson.card_notification.front_parts.headline;
    expect(headlinePart.active).toBe(campaignHeadline.active);
    expect(headlinePart.position).toBe(campaignHeadline.position);
    expect(headlinePart.attrs[0].text).toBe(campaignHeadline.text);

    // Validate image part matches campaign configuration
    const campaignImage =
      createCampaignResponseJson.card_notification.front_parts.image;
    expect(imagePart.active).toBe(campaignImage.active);
    expect(imagePart.position).toBe(campaignImage.position);

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
    );

    const getCardWithApiAfterReadingResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiAfterReadingResponseJson =
      await getCardWithApiAfterReadingResponse.json();

    expect(getCardWithApiAfterReadingResponseJson.is_campaign_unread).toBe(
      false
    );

    const getCampaignStatsWithWaitResponse = await getCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      1
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create HTML Feed campaign with expiration one hour time, verify Back Feed button visibility, and validate dismiss functionality', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    await deleteAllDeeplinks(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );

    // Preparing payload for campaign creation
    createCampaignFeedOneButtonBackWithDismiss.segment_ids = [
      createSegmentResponseJson.segment.id
    ];

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonBackWithDismiss
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonBackWithDismiss.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createCampaignResponseJson.guid
    );

    // Find parts in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );
    const textPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'text'
    );

    const headlinePart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'headline'
    );

    const imagePart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'image'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToAction =
      createCampaignResponseJson.card_notification.front_parts.call_to_action;
    expect(callToActionPart.active).toBe(campaignCallToAction.active);
    expect(callToActionPart.position).toBe(campaignCallToAction.position);

    // Validate button attributes match exactly
    const buttonAttrs = callToActionPart.attrs[0];
    const campaignButton = campaignCallToAction.buttons[0];
    expect(buttonAttrs.btn_color).toBe(campaignButton.btn_color);
    expect(buttonAttrs.destination_type).toBe(campaignButton.destination_type);
    expect(buttonAttrs.destination).toBe(campaignButton.destination);
    expect(buttonAttrs.in_app_events).toBe(campaignButton.in_app_events);
    expect(buttonAttrs.label).toBe(campaignButton.label);
    expect(buttonAttrs.txt_color).toBe(campaignButton.txt_color);
    expect(buttonAttrs.order_number).toBe(campaignButton.order_number);

    // Validate text part matches campaign configuration
    const campaignText =
      createCampaignResponseJson.card_notification.front_parts.text;
    expect(textPart.active).toBe(campaignText.active);
    expect(textPart.position).toBe(campaignText.position);
    expect(textPart.attrs[0].text).toBe(campaignText.text);

    // Validate headline part matches campaign configuration
    const campaignHeadline =
      createCampaignResponseJson.card_notification.front_parts.headline;
    expect(headlinePart.active).toBe(campaignHeadline.active);
    expect(headlinePart.position).toBe(campaignHeadline.position);
    expect(headlinePart.attrs[0].text).toBe(campaignHeadline.text);

    // Validate image part matches campaign configuration
    const campaignImage =
      createCampaignResponseJson.card_notification.front_parts.image;
    expect(imagePart.active).toBe(campaignImage.active);
    expect(imagePart.position).toBe(campaignImage.position);

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_BACK_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_BACK_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
    );

    const getCardWithApiAfterReadingResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiAfterReadingResponseJson =
      await getCardWithApiAfterReadingResponse.json();

    expect(getCardWithApiAfterReadingResponseJson.is_campaign_unread).toBe(
      false
    );

    const getCampaignStatsWithWaitResponse = await getCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      1
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });
});
