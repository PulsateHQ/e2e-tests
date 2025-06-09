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
import {
  getCampaignBackCardStatsWithApi,
  getCardCampaignStatsWithApi
} from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createWebSdkStatistics } from '@_src/api/factories/web.sdk.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { WebSdkStatisticsAction } from '@_src/api/models/web.sdk.model';
import {
  createCampaignFeedOneButtonBackWithDismiss,
  createCampaignFeedOneButtonToUrl,
  createCampaignFeedOneButtonWithDeeplink,
  createCampaignFeedTwoButtonsWithBackAndDeeplink
} from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { startMobileSessionFeedPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
import { updateMobileFeedUserPayload } from '@_src/api/test-data/mobile/update/update-user.payload';
import { apiUrls } from '@_src/api/utils/api.util';
import {
  deleteAllCampaigns,
  deleteAllDeeplinks,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('HTML Feed Campaign', () => {
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
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const createCampaignFeedOneButtonToUrlPayload =
      createCampaignFeedOneButtonToUrl([createSegmentResponseJson.segment.id]);
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrlPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrlPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Prepare Deeplink
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
    const createCampaignFeedOneButtonWithDeeplinkPayload =
      createCampaignFeedOneButtonWithDeeplink(
        [createSegmentResponseJson.segment.id],
        updateDeeplinkResponse.id
      );

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonWithDeeplinkPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonWithDeeplinkPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Preparing payload for campaign creation
    const createCampaignFeedOneButtonBackWithDismissPayload =
      createCampaignFeedOneButtonBackWithDismiss([
        createSegmentResponseJson.segment.id
      ]);

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonBackWithDismissPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonBackWithDismissPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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

    // Find parts in back card response
    const callToActionPartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'call_to_action'
    );
    const textPartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'text'
    );

    const headlinePartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'headline'
    );

    const imagePartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'image'
    );

    const headingPartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'heading'
    );

    const tablePartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'table'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToActionBack =
      createCampaignResponseJson.card_notification.back_parts.call_to_action;
    expect(callToActionPartBack.active).toBe(campaignCallToActionBack.active);
    expect(callToActionPartBack.position).toBe(
      campaignCallToActionBack.position
    );

    // Validate button attributes match exactly
    const buttonAttrsBack = callToActionPartBack.attrs[0];
    const campaignButtonBack = campaignCallToActionBack.buttons[0];
    expect(buttonAttrsBack.btn_color).toBe(campaignButtonBack.btn_color);
    expect(buttonAttrsBack.destination_type).toBe(
      campaignButtonBack.destination_type
    );
    expect(buttonAttrsBack.destination).toBe(campaignButtonBack.destination);
    expect(buttonAttrsBack.in_app_events).toBe(
      campaignButtonBack.in_app_events
    );
    expect(buttonAttrsBack.label).toBe(campaignButtonBack.label);
    expect(buttonAttrsBack.txt_color).toBe(campaignButtonBack.txt_color);
    expect(buttonAttrsBack.order_number).toBe(campaignButtonBack.order_number);

    // Validate text part matches campaign configuration
    const campaignTextBack =
      createCampaignResponseJson.card_notification.back_parts.text;
    expect(textPartBack.active).toBe(campaignTextBack.active);
    expect(textPartBack.position).toBe(campaignTextBack.position);
    expect(textPartBack.attrs[0].text).toBe(campaignTextBack.text);

    // Validate headline part matches campaign configuration
    const campaignHeadlineBack =
      createCampaignResponseJson.card_notification.back_parts.headline;
    expect(headlinePartBack.active).toBe(campaignHeadlineBack.active);
    expect(headlinePartBack.position).toBe(campaignHeadlineBack.position);
    expect(headlinePartBack.attrs[0].text).toBe(campaignHeadlineBack.text);

    // Validate image part matches campaign configuration
    const campaignImageBack =
      createCampaignResponseJson.card_notification.back_parts.image;
    expect(imagePartBack.active).toBe(campaignImageBack.active);
    expect(imagePartBack.position).toBe(campaignImageBack.position);

    // Validate table part matches campaign configuration
    const campaignTableBack =
      createCampaignResponseJson.card_notification.back_parts.table;
    expect(tablePartBack.active).toBe(campaignTableBack.active);
    expect(tablePartBack.position).toBe(campaignTableBack.position);
    expect(tablePartBack.attrs[0].rows[0].value).toBe(
      campaignTableBack.rows[0].value
    );
    expect(tablePartBack.attrs[0].rows[0].label).toBe(
      campaignTableBack.rows[0].label
    );

    expect(headingPartBack.active).toBe(campaignTableBack.active);
    expect(headingPartBack.position).toBe(campaignTableBack.position);
    expect(headingPartBack.attrs[0].text).toBe(campaignTableBack.heading);

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

    const getCampaignStatsWithWaitResponse =
      await getCampaignBackCardStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createCampaignResponseJson.id,
        1,
        1,
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
    expect(getCampaignStatsWithWaitResponseJson.card.delete).toHaveProperty(
      'total_uniq',
      0
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

    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create HTML Feed campaign with expiration one hour time, verify Back Feed button visibility with two buttons', async ({
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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Preparing payload for campaign creation

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

    const createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload =
      createCampaignFeedTwoButtonsWithBackAndDeeplink(
        [createSegmentResponseJson.segment.id],
        updateDeeplinkResponse.id
      );

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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
    // Button 1
    expect(callToActionPart.attrs[0].label).toBe(
      campaignCallToAction.buttons[0].label
    );
    expect(callToActionPart.attrs[0].destination).toBe(
      campaignCallToAction.buttons[0].destination
    );

    // Button 2
    expect(callToActionPart.attrs[1].label).toBe(
      campaignCallToAction.buttons[1].label
    );
    expect(callToActionPart.attrs[1].destination).toBe(
      campaignCallToAction.buttons[1].destination
    );

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

    // Find parts in back card response
    const callToActionPartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'call_to_action'
    );
    const textPartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'text'
    );

    const headlinePartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'headline'
    );

    const imagePartBack = getCardWithApiResponseJson.back.find(
      (part) => part.type === 'image'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToActionBack =
      createCampaignResponseJson.card_notification.back_parts.call_to_action;

    // Button 1
    expect(callToActionPartBack.attrs[0].label).toBe(
      campaignCallToActionBack.buttons[0].label
    );
    expect(callToActionPartBack.attrs[0].destination).toBe(
      campaignCallToActionBack.buttons[0].destination
    );

    // Button 2
    expect(callToActionPartBack.attrs[1].label).toBe(
      campaignCallToActionBack.buttons[1].label
    );
    expect(callToActionPartBack.attrs[1].destination).toBe(
      campaignCallToActionBack.buttons[1].destination
    );

    // Validate button attributes match exactly
    const buttonAttrsBack = callToActionPartBack.attrs[0];
    const campaignButtonBack = campaignCallToActionBack.buttons[0];
    expect(buttonAttrsBack.btn_color).toBe(campaignButtonBack.btn_color);
    expect(buttonAttrsBack.destination_type).toBe(
      campaignButtonBack.destination_type
    );
    expect(buttonAttrsBack.destination).toBe(campaignButtonBack.destination);
    expect(buttonAttrsBack.in_app_events).toBe(
      campaignButtonBack.in_app_events
    );
    expect(buttonAttrsBack.label).toBe(campaignButtonBack.label);
    expect(buttonAttrsBack.txt_color).toBe(campaignButtonBack.txt_color);
    expect(buttonAttrsBack.order_number).toBe(campaignButtonBack.order_number);

    // Validate text part matches campaign configuration
    const campaignTextBack =
      createCampaignResponseJson.card_notification.back_parts.text;
    expect(textPartBack.active).toBe(campaignTextBack.active);
    expect(textPartBack.position).toBe(campaignTextBack.position);
    expect(textPartBack.attrs[0].text).toBe(campaignTextBack.text);

    // Validate headline part matches campaign configuration
    const campaignHeadlineBack =
      createCampaignResponseJson.card_notification.back_parts.headline;
    expect(headlinePartBack.active).toBe(campaignHeadlineBack.active);
    expect(headlinePartBack.position).toBe(campaignHeadlineBack.position);
    expect(headlinePartBack.attrs[0].text).toBe(campaignHeadlineBack.text);

    // Validate image part matches campaign configuration
    const campaignImageBack =
      createCampaignResponseJson.card_notification.back_parts.image;
    expect(imagePartBack.active).toBe(campaignImageBack.active);
    expect(imagePartBack.position).toBe(campaignImageBack.position);

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
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_TWO
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
      WebSdkStatisticsAction.CARD_BACK_BUTTON_CLICK_TWO
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

    const getCampaignStatsWithWaitResponse =
      await getCampaignBackCardStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createCampaignResponseJson.id,
        1,
        1,
        0,
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
    expect(getCampaignStatsWithWaitResponseJson.card.delete).toHaveProperty(
      'total_uniq',
      0
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
    ).toHaveProperty('total_uniq', 0);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_two
    ).toHaveProperty('total_uniq', 1);

    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_one
    ).toHaveProperty('total_uniq', 0);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_two
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create an HTML Feed campaign with 2 users but only 1 user clicks the button', async ({
    request
  }) => {
    const numberOfUsers = 2;

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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const createCampaignFeedOneButtonToUrlPayload =
      createCampaignFeedOneButtonToUrl([createSegmentResponseJson.segment.id]);
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrlPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrlPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      2
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      2
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      2
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

  test('should create HTML Feed campaign with  2 users and all of them clicks different buttons', async ({
    request
  }) => {
    const numberOfUsers = 2;

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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Preparing payload for campaign creation

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

    const createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload =
      createCampaignFeedTwoButtonsWithBackAndDeeplink(
        [createSegmentResponseJson.segment.id],
        updateDeeplinkResponse.id
      );

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedTwoButtonsWithBackAndDeeplinkPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_TWO
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
      WebSdkStatisticsAction.CARD_BACK_BUTTON_CLICK_TWO
    );

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[1].alias;
    const alias2 = getUsersResponseJson.data[1].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[1].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias2,
      1
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias2,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias2,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias2,
      0
    );

    const getCardWithApiAfterReadingResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias2,
      createCampaignResponseJson.guid
    );

    const getCardWithApiAfterReadingResponseJson =
      await getCardWithApiAfterReadingResponse.json();

    expect(getCardWithApiAfterReadingResponseJson.is_campaign_unread).toBe(
      false
    );

    const getCampaignStatsWithWaitResponse =
      await getCampaignBackCardStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createCampaignResponseJson.id,
        2,
        1,
        0,
        1
      );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      2
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      2
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delete).toHaveProperty(
      'total_uniq',
      0
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      2
    );

    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 2);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_two
    ).toHaveProperty('total_uniq', 1);

    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_one
    ).toHaveProperty('total_uniq', 0);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_two
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create 2 HTML Feed campaign and validate number of feeds cards', async ({
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
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const createCampaignFeedOneButtonToUrlPayload =
      createCampaignFeedOneButtonToUrl([createSegmentResponseJson.segment.id]);
    const createFirstCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrlPayload
    );
    const createFirstCampaignResponseJson =
      await createFirstCampaignResponse.json();

    // Assert Campaign Created
    expect(createFirstCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrlPayload.name
    );

    const createSecondCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrlPayload
    );
    const createSecondCampaignResponseJson =
      await createSecondCampaignResponse.json();

    // Assert Campaign Created
    expect(createSecondCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrlPayload.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload.alias = getUsersResponseJson.data[0].alias;

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
      2
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createFirstCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createFirstCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createFirstCampaignResponseJson.id,
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
